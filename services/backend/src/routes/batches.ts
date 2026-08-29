import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { fabricService } from '../services/fabric/fabricService.js';
import { sensorDataHash } from '../services/sensorHash.js';
import { buildLabelPdf, type BarcodePayload } from '../services/barcode.js';
import { config } from '../config.js';

const mintSchema = z.object({
  hive_ids: z.array(z.string().min(1)).min(1),
  harvest_start: z.string().min(1),
  harvest_end: z.string().min(1),
  weight_kg: z.number().positive(),
  note: z.string().optional(),
});

const barcodeDir = path.resolve('barcodes');

export async function mint(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = mintSchema.parse(req.body);

    // Resolve hives by their physical hiveId.
    const hives = await prisma.hive.findMany({ where: { hiveId: { in: data.hive_ids } } });
    if (hives.length === 0) {
      res.status(400).json({ error: 'No matching hives found for hive_ids' });
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

    // IDs.
    const seq = (await prisma.batch.count()) + 1;
    const batchId = `BATCH-${String(seq).padStart(3, '0')}`;
    const lotId = `HC-LOT-${String(seq).padStart(3, '0')}`;
    const harvestDate = data.harvest_end.slice(0, 10);
    const payload: BarcodePayload = { lot_id: lotId, weight_kg: data.weight_kg, harvest_date: harvestDate };

    // Mint on-chain (Beekeeper role).
    const mintResult = await fabricService.submit(
      'MintBatch',
      batchId,
      lotId,
      JSON.stringify(data.hive_ids),
      data.harvest_start,
      data.harvest_end,
      String(data.weight_kg),
      dataHash,
      JSON.stringify(payload),
    );

    // Generate + persist the label PDF.
    const pdf = await buildLabelPdf(payload);
    fs.mkdirSync(barcodeDir, { recursive: true });
    const filename = `${lotId}.pdf`;
    fs.writeFileSync(path.join(barcodeDir, filename), pdf);

    // Store off-chain record.
    await prisma.batch.create({
      data: {
        batchId,
        lotId,
        beekeeperId: req.user?.userId,
        state: 'RECEIVED',
        harvestStart: new Date(data.harvest_start),
        harvestEnd: new Date(data.harvest_end),
        weightKg: data.weight_kg,
        sensorDataHash: dataHash,
        barcodePayload: payload as any,
        hives: { create: hives.map((h) => ({ hiveId: h.hiveId })) },
      },
    });

    res.status(201).json({
      batch_id: batchId,
      lot_id: lotId,
      barcode_id: lotId,
      payload,
      barcode_pdf_url: assetUrl(`/barcodes/${filename}`),
      barcode_pdf_base64: pdf.toString('base64'),
      status: 'MINTED',
      tx: parseTxResult(mintResult),
    });
  } catch (e) {
    next(e);
  }
}

export async function listBatches(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batches = await prisma.batch.findMany({
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

function assetUrl(p: string): string {
  try {
    return new URL(p, config.BARCODE_PUBLIC_BASE_URL).toString();
  } catch {
    return p;
  }
}

function parseTxResult(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export const batchesMint = [requireAuth, mint];
export const batchesList = [requireAuth, listBatches];
export const batchesGet = [requireAuth, getBatch];
export const batchesBarcode = [requireAuth, barcode];
