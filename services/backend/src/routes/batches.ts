import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { fabricService } from '../services/fabric/fabricService.js';
import { sensorDataHash } from '../services/sensorHash.js';
import { buildLabelPdf, renderQrPng, type BarcodePayload } from '../services/barcode.js';
import { config } from '../config.js';
import { recordLedgerTransaction } from '../services/ledgerAudit.js';
import { recordHash } from '../services/recordHash.js';

const mintSchema = z.object({
  hive_ids: z.array(z.string().min(1)).min(1),
  harvest_start: z.string().min(1),
  harvest_end: z.string().min(1),
  weight_kg: z.number().positive(),
  note: z.string().optional(),
});

const barcodeDir = path.resolve('barcodes');

// Next available sequential batch/lot id, derived from the max id already in the
// DB mirror so gaps (e.g. a failed mirror write after a committed mint) don't
// cause a duplicate that the chaincode rejects with "already exists".
async function nextBatchSeq(): Promise<number> {
  const rows = await prisma.batch.findMany({ select: { batchId: true } });
  let max = 0;
  for (const r of rows) {
    const m = /^BATCH-(\d+)$/.exec(r.batchId);
    if (m && Number(m[1]) > max) max = Number(m[1]);
  }
  return max + 1;
}

function submitMint(
  role: string,
  batchId: string,
  hiveHash: string,
  beekeeperHash: string,
  harvestHash: string,
) {
  return fabricService.submitAs(
    role,
    'CreateHarvestBatch',
    batchId,
    hiveHash,
    beekeeperHash,
    harvestHash,
  );
}

export async function mint(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = mintSchema.parse(req.body);
    const harvestStart = new Date(data.harvest_start);
    const harvestEnd = new Date(data.harvest_end);
    if (!Number.isFinite(harvestStart.getTime()) || !Number.isFinite(harvestEnd.getTime()) || harvestStart >= harvestEnd) {
      res.status(400).json({ error: 'harvest_start must be before harvest_end' });
      return;
    }

    // Resolve hives by their physical hiveId.
    const hives = await prisma.hive.findMany({ where: { hiveId: { in: data.hive_ids } } });
    if (hives.length !== new Set(data.hive_ids).size) {
      res.status(400).json({ error: 'Every hive_id must identify a unique registered hive' });
      return;
    }
    if (hives.some((h) => h.beekeeperId !== req.user?.userId)) {
      res.status(403).json({ error: 'All hives must belong to the authenticated beekeeper' });
      return;
    }

    // Compute the sensor data hash for the harvest window (off-chain -> on-chain anchor).
    const readings = await prisma.sensorReading.findMany({
      where: {
        hiveId: { in: data.hive_ids },
        ts: { gte: new Date(data.harvest_start), lte: new Date(data.harvest_end) },
      },
    });
    const dataHash = sensorDataHash(
      readings.map((r) => ({
        hiveId: r.hiveId,
        ts: r.ts,
        tempIn: r.tempIn,
        humIn: r.humIn,
        weightKg: r.weightKg,
        tempOut: r.tempOut,
        batteryV: r.batteryV,
      })),
    );
    if (readings.length === 0) {
      res.status(400).json({ error: 'No sensor readings exist in the harvest window' });
      return;
    }

    // IDs.
    const seq = await nextBatchSeq();
    const batchId = `BATCH-${String(seq).padStart(3, '0')}`;
    const lotId = `HC-LOT-${String(seq).padStart(3, '0')}`;
    const harvestDate = data.harvest_end.slice(0, 10);
    const payload: BarcodePayload = { lot_id: lotId, weight_kg: data.weight_kg, harvest_date: harvestDate };
    const hiveHash = recordHash([...data.hive_ids].sort());
    const beekeeperHash = recordHash({ beekeeperId: req.user!.userId });
    const harvestHash = recordHash({
      batchId,
      lotId,
      hiveIds: [...data.hive_ids].sort(),
      beekeeperId: req.user!.userId,
      harvestStart: harvestStart.toISOString(),
      harvestEnd: harvestEnd.toISOString(),
      weightKg: data.weight_kg,
      note: data.note ?? null,
      sensorDataHash: dataHash,
    });

    // Mint on-chain (Beekeeper role). If the DB mirror is behind the chain
    // (candidate id already exists), bump past the colliding id and retry once.
    let mintResult: Awaited<ReturnType<typeof submitMint>>;
    let submittedBatchId = batchId;
    let submittedLotId = lotId;
    try {
      mintResult = await submitMint(req.user!.role, submittedBatchId, hiveHash, beekeeperHash, harvestHash);
    } catch (err) {
      const m = /BATCH-(\d+) already exists/.exec(String(err));
      if (m) {
        const bumped = Number(m[1]) + 1;
        submittedBatchId = `BATCH-${String(bumped).padStart(3, '0')}`;
        submittedLotId = `HC-LOT-${String(bumped).padStart(3, '0')}`;
        payload.lot_id = submittedLotId;
        const bumpedHarvestHash = recordHash({
          batchId: submittedBatchId,
          lotId: submittedLotId,
          hiveIds: [...data.hive_ids].sort(),
          beekeeperId: req.user!.userId,
          harvestStart: harvestStart.toISOString(),
          harvestEnd: harvestEnd.toISOString(),
          weightKg: data.weight_kg,
          note: data.note ?? null,
          sensorDataHash: dataHash,
        });
        mintResult = await submitMint(req.user!.role, submittedBatchId, hiveHash, beekeeperHash, bumpedHarvestHash);
      } else {
        throw err;
      }
    }

    await recordLedgerTransaction({
      tx: mintResult,
      batchId: submittedBatchId,
      operation: 'CreateHarvestBatch',
      actorId: req.user!.userId,
      actorRole: req.user!.role,
    });

    // Generate + persist the label PDF.
    const pdf = await buildLabelPdf(payload);
    fs.mkdirSync(barcodeDir, { recursive: true });
    const filename = `${submittedLotId}.pdf`;
    fs.writeFileSync(path.join(barcodeDir, filename), pdf);

    // Store off-chain record (mirror only - never fatal: the ledger is the
    // source of truth, and a failed mirror must not burn a minted id).
    try {
      await prisma.batch.create({
        data: {
          batchId: submittedBatchId,
          lotId: submittedLotId,
          beekeeperId: req.user?.userId,
          state: 'HARVESTED',
          harvestStart: new Date(data.harvest_start),
          harvestEnd: new Date(data.harvest_end),
          weightKg: data.weight_kg,
          sensorDataHash: dataHash,
          barcodePayload: { ...payload, lot_id: submittedLotId } as any,
          hives: { create: hives.map((h) => ({ hiveId: h.hiveId })) },
        },
      });
    } catch (e) {
      console.error(`[mint] on-chain batch ${submittedBatchId} committed but DB mirror failed`, e);
    }

    res.status(201).json({
      batch_id: submittedBatchId,
      lot_id: submittedLotId,
      barcode_id: submittedLotId,
      payload: { ...payload, lot_id: submittedLotId } as BarcodePayload,
      barcode_pdf_url: assetUrl(`/barcodes/${filename}`),
      barcode_pdf_base64: pdf.toString('base64'),
      status: 'MINTED',
      tx: txResponse(mintResult),
    });
  } catch (e) {
    next(e);
  }
}

export async function listBatches(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batches = await prisma.batch.findMany({
      where: req.user?.role === 'BEEKEEPER' ? { beekeeperId: req.user.userId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { hives: true, qualityTests: true },
    });
    res.json({ batches });
  } catch (e) {
    next(e);
  }
}

export async function getBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batch = await prisma.batch.findUnique({
      where: { batchId: req.params.id },
      include: { hives: true, qualityTests: true, processingLog: true, jarSerials: true, ownershipTransfer: true, blends: true },
    });
    if (!batch) {
      res.status(404).json({ error: 'Batch not found' });
      return;
    }
    if (req.user?.role === 'BEEKEEPER' && batch.beekeeperId !== req.user.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    res.json({ batch });
  } catch (e) {
    next(e);
  }
}

export async function barcode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batch = await prisma.batch.findUnique({ where: { batchId: req.params.id } });
    if (!batch) {
      res.status(404).json({ error: 'Batch not found' });
      return;
    }
    if (req.user?.role === 'BEEKEEPER' && batch.beekeeperId !== req.user.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const lotId = batch.lotId ?? 'UNKNOWN';
    const payload: BarcodePayload = {
      lot_id: lotId,
      weight_kg: batch.weightKg ?? 0,
      harvest_date: (batch.harvestEnd?.toISOString().slice(0, 10)) ?? '',
    };
    const pdf = await buildLabelPdf(payload);
    res.json({
      batch_id: batch.batchId,
      payload,
      barcode_pdf_url: assetUrl(`/barcodes/${lotId}.pdf`),
      barcode_pdf_base64: pdf.toString('base64'),
    });
  } catch (e) {
    next(e);
  }
}

export async function serveBarcodePdf(req: Request, res: Response): Promise<void> {
  const file = path.join(barcodeDir, path.basename(req.params.file));
  if (!fs.existsSync(file)) {
    res.status(404).json({ error: 'Barcode not found' });
    return;
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${path.basename(file)}"`);
  fs.createReadStream(file).pipe(res);
}

/**
 * Render the QR sticker for a jar remote token. The QR payload is the consumer
 * verification URL, so scanning the sticker opens the full batch history page.
 * Always rendered fresh so a token never goes stale.
 */
export async function serveQrPng(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = decodeURIComponent(path.basename(req.params.file).replace(/\.png$/i, ''));
    if (!token) {
      res.status(400).json({ error: 'Missing token' });
      return;
    }
    const verificationUrl = new URL(`/v/${encodeURIComponent(token)}`, config.VERIFY_PUBLIC_BASE_URL).toString();
    const png = await renderQrPng(verificationUrl);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(png);
  } catch (e) {
    next(e);
  }
}

function assetUrl(p: string): string {
  try {
    return new URL(p, config.BARCODE_PUBLIC_BASE_URL).toString();
  } catch {
    return p;
  }
}

function txResponse(tx: { transactionId: string; validationCode: number; successful: boolean; result: string }) {
  let result: unknown = tx.result;
  try { result = JSON.parse(tx.result); } catch { /* empty/non-JSON chaincode response */ }
  return { transaction_id: tx.transactionId, validation_code: tx.validationCode, successful: tx.successful, result };
}

export const batchesMint = [requireAuth, requireRole('BEEKEEPER'), mint];
export const batchesList = [requireAuth, requireRole('BEEKEEPER', 'TRANSPORTER', 'LABTECH', 'FACTORYWORKER', 'QCMANAGER', 'DISTRIBUTOR', 'ADMIN'), listBatches];
export const batchesGet = [requireAuth, requireRole('BEEKEEPER', 'TRANSPORTER', 'LABTECH', 'FACTORYWORKER', 'QCMANAGER', 'DISTRIBUTOR', 'ADMIN'), getBatch];
export const batchesBarcode = [requireAuth, requireRole('BEEKEEPER', 'TRANSPORTER', 'FACTORYWORKER', 'ADMIN'), barcode];
