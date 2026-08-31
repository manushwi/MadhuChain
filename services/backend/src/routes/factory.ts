import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { fabricService } from '../services/fabric/fabricService.js';
import { config } from '../config.js';
import { recordLedgerTransaction } from '../services/ledgerAudit.js';
import { cacheDelete } from '../services/cache.js';
import { recordHash } from '../services/recordHash.js';
import { checkMassBalance, runFraudChecks, type QualityTestInput } from '../services/fraudChecks.js';

const receivedSchema = z.object({
  transporter_id: z.string().min(1).optional(),
  weight_in: z.number().positive(),
});

const qualityTestSchema = z.object({
  stage: z.enum(['INTAKE', 'OUTPUT']),
  moisture: z.number(),
  hmf: z.number(),
  diastase: z.number(),
  sugar_profile: z.object({ fructose: z.number(), glucose: z.number(), sucrose: z.number() }),
  isotope_ratio: z.number(),
});

const processingActionSchema = z.object({
  action_type: z.string().min(1), // heating | filtering | blending
  parameters: z.record(z.string()).optional(),
  equipment_id: z.string().min(1).max(40).regex(/^[A-Za-z0-9._-]+$/),
  weight_before: z.number().positive(),
  weight_after: z.number().positive(),
  parent_lots: z.record(z.number()).optional(), // blending: lotId -> weight
});

const packagingSchema = z.object({
  jar_count: z.number().int().positive(),
  average_jar_weight_kg: z.number().positive(),
});

const blendSchema = z.object({
  sources: z.array(z.object({ lot_id: z.string(), weight_kg: z.number().positive() })).min(2),
  weight_kg: z.number().positive(),
});

const transferSchema = z.object({
  to_identity: z.string().min(1).optional(),
  to_msp: z.enum(['Org1MSP', 'Org2MSP', 'Org3MSP', 'KVICMSP', 'FactoryMSP', 'LabMSP']).optional(),
});
const clearFlagSchema = z.object({ resolution: z.enum(['CLEARED', 'REJECTED']) });
const scanSchema = z.object({ payload: z.string().min(1) });

/**
 * Resolve the durable traceability identity of the authenticated operator.
 * Prefers the unique per-operator id, falling back to the DB user id.
 */
function actorOperatorId(req: Request): string {
  return req.user?.operatorId ?? req.user!.userId;
}

export async function received(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batchId = req.params.id;
    const data = receivedSchema.parse(req.body);
    const collectionHash = recordHash({
      batchId,
      transporterId: actorOperatorId(req),
      weightInKg: data.weight_in,
      accepted: true,
      recordedBy: req.user!.userId,
    });
    const result = await fabricService.submitAs(
      req.user!.role,
      'RecordCollection',
      batchId,
      collectionHash,
      'true',
    );
    await audit(req, batchId, 'RecordCollection', result);
    await prisma.collectionRecord.create({
      data: {
        batchId,
        transporterId: actorOperatorId(req),
        weightInKg: data.weight_in,
        accepted: true,
        recordHash: collectionHash,
        recordedBy: req.user!.userId,
      },
    });
    const ledger = await readCommittedBatch(batchId);
    await syncBatch(batchId, ledger);
    res.json({ batch_id: batchId, state: ledger.currentStatus, tx: txResponse(result) });
  } catch (e) {
    next(e);
  }
}

export async function qualityTest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batchId = req.params.id;
    const data = qualityTestSchema.parse(req.body);
    const stage = data.stage.toLowerCase();
    const testInput: QualityTestInput = {
      stage: data.stage,
      moisture: data.moisture,
      hmf: data.hmf,
      diastase: data.diastase,
      sugarProfile: data.sugar_profile,
      isotopeRatio: data.isotope_ratio,
    };
    const certificateHash = recordHash({ batchId, ...testInput, testerId: actorOperatorId(req) });
    const result = await fabricService.submitAs(
      req.user!.role,
      'RecordLabResult',
      batchId,
      certificateHash,
      'true',
    );
    await audit(req, batchId, 'RecordLabResult', result);

    let fraudChecks = { passed: true, reasons: [] as string[] };
    if (data.stage === 'OUTPUT') {
      const [collection, intake, latestProcessing] = await Promise.all([
        prisma.collectionRecord.findFirst({ where: { batchId, accepted: true }, orderBy: { createdAt: 'desc' } }),
        prisma.qualityTest.findFirst({ where: { batchId, stage: 'INTAKE' }, orderBy: { ts: 'desc' } }),
        prisma.processingAction.findFirst({ where: { batchId }, orderBy: { ts: 'desc' } }),
      ]);
      const intakeInput = intake ? qualityInputFromRow(intake) : undefined;
      fraudChecks = runFraudChecks(collection?.weightInKg ?? 0, latestProcessing?.weightAfter ?? 0, intakeInput, testInput);
      if (!fraudChecks.passed) {
        const flagHash = recordHash({ batchId, certificateHash, reasons: fraudChecks.reasons });
        const flagResult = await fabricService.submitAs(req.user!.role, 'FlagBatch', batchId, flagHash);
        await audit(req, batchId, 'FlagBatch', flagResult);
      }
    }

    // Persist the test off-chain for the verify page.
    const ledger = await readCommittedBatch(batchId);
    await prisma.qualityTest.create({
      data: {
        batchId,
        stage: data.stage,
        moisture: data.moisture,
        hmf: data.hmf,
        diastase: data.diastase,
        sugarProfile: data.sugar_profile as any,
        isotopeRatio: data.isotope_ratio,
        testerId: actorOperatorId(req),
        result: fraudChecks.passed ? 'PASS' : 'FLAGGED',
      },
    });
    await syncBatch(batchId, ledger);

    res.json({
      batch_id: batchId,
      stage: data.stage,
      state: ledger.currentStatus,
      flagged: ledger.flagged,
      fraud_checks: stage === 'output' ? fraudChecks : undefined,
      tx: txResponse(result),
    });
  } catch (e) {
    next(e);
  }
}

export async function processingAction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batchId = req.params.id;
    const data = processingActionSchema.parse(req.body);
    const parameters = data.parameters ?? {};
    if (data.action_type === 'blending' && data.parent_lots) {
      parameters.parentLots = JSON.stringify(data.parent_lots);
    }
    const processingHash = recordHash({
      batchId,
      actionType: data.action_type,
      parameters,
      equipmentId: data.equipment_id,
      weightBeforeKg: data.weight_before,
      weightAfterKg: data.weight_after,
      parentLots: data.parent_lots ?? null,
      operatorId: actorOperatorId(req),
    });
    const result = await fabricService.submitAs(
      req.user!.role,
      'RecordProcessing',
      batchId,
      processingHash,
    );
    await audit(req, batchId, 'RecordProcessing', result);
    const massBalance = checkMassBalance(data.weight_before, data.weight_after);
    if (!massBalance.passed) {
      const flagHash = recordHash({ batchId, processingHash, reasons: massBalance.reasons });
      const flagResult = await fabricService.submitAs(req.user!.role, 'FlagBatch', batchId, flagHash);
      await audit(req, batchId, 'FlagBatch', flagResult);
    }
    await prisma.processingAction.create({
      data: {
        batchId,
        actionType: data.action_type,
        parameters: parameters as any,
        operatorId: actorOperatorId(req),
        equipmentId: data.equipment_id,
        weightBefore: data.weight_before,
        weightAfter: data.weight_after,
        parentLots: data.parent_lots as any,
      },
    });
    const ledger = await readCommittedBatch(batchId);
    await syncBatch(batchId, ledger);
    res.json({ batch_id: batchId, action: data.action_type, state: ledger.currentStatus, flagged: ledger.flagged, tx: txResponse(result) });
  } catch (e) {
    next(e);
  }
}

export async function packaging(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batchId = req.params.id;
    const data = packagingSchema.parse(req.body);
    const latestProcessing = await prisma.processingAction.findFirst({ where: { batchId }, orderBy: { ts: 'desc' } });
    if (!latestProcessing?.weightAfter) {
      res.status(409).json({ error: 'Packaging requires a recorded processing output weight' });
      return;
    }
    const totalJarWeight = data.jar_count * data.average_jar_weight_kg;
    if (Math.abs(totalJarWeight - latestProcessing.weightAfter) > latestProcessing.weightAfter * 0.02) {
      res.status(409).json({ error: 'Jar weights do not reconcile with processing output weight within 2%' });
      return;
    }
const prefix = `${batchId}-JAR-`;
    const jarIds = Array.from({ length: data.jar_count }, (_, i) => `${prefix}${String(i + 1).padStart(4, '0')}`);
    const jars = jarIds.map((jarId) => ({
      batchId,
      jarId,
    }));
    const packagingHash = recordHash({
      batchId,
      jarCount: data.jar_count,
      averageJarWeightKg: data.average_jar_weight_kg,
      totalJarWeightKg: totalJarWeight,
      packedBy: actorOperatorId(req),
    });
    const bottleSummaryHash = recordHash(jarIds);
    const result = await fabricService.submitAs(
      req.user!.role,
      'RecordPackaging',
      batchId,
      packagingHash,
      bottleSummaryHash,
    );
    await audit(req, batchId, 'RecordPackaging', result);

    // Generate jar serials off-chain to match the chaincode's jar_* records.
    await prisma.jarSerial.createMany({ data: jars, skipDuplicates: true });

    const ledger = await readCommittedBatch(batchId);
    await syncBatch(batchId, ledger);

    // Each jar gets a public verification sticker: a QR-encoded URL to the
    // consumer history page plus a rendered QR image served by this backend.
    const jarRecords = jarIds.map((jarId) => ({
      jar_id: jarId,
      barcode_value: jarId,
      verification_url: new URL(`/v/${encodeURIComponent(jarId)}`, config.VERIFY_PUBLIC_BASE_URL).toString(),
      qr_data_url: new URL(`/qr/${encodeURIComponent(jarId)}.png`, config.PUBLIC_BASE_URL).toString(),
    }));
    res.json({ batch_id: batchId, jar_count: data.jar_count, jar_ids: jarIds, jars: jarRecords, state: ledger.currentStatus, tx: txResponse(result) });
  } catch (e) {
    next(e);
  }
}

export async function blend(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = blendSchema.parse(req.body);
    const seq = (await prisma.batch.count()) + 1;
    const newBatchId = `BATCH-${String(seq).padStart(3, '0')}`;
    const newLotId = `HC-LOT-${String(seq).padStart(3, '0')}`;
    const payload = { lot_id: newLotId, weight_kg: data.weight_kg, harvest_date: new Date().toISOString().slice(0, 10) };

    const blendHash = recordHash([...data.sources].sort((a, b) => a.lot_id.localeCompare(b.lot_id)));
    const processingHash = recordHash({ batchId: newBatchId, sourceSummaryHash: blendHash, outputWeightKg: data.weight_kg });
    const result = await fabricService.submitAs(
      req.user!.role,
      'CreateBlendBatch',
      newBatchId,
      blendHash,
      processingHash,
    );
    await audit(req, newBatchId, 'CreateBlendBatch', result);

    const blends = data.sources.map((s) => ({
      sourceLotId: s.lot_id,
      weightKg: s.weight_kg,
      percentage: (s.weight_kg / data.weight_kg) * 100,
    }));

    const ledger = await readCommittedBatch(newBatchId);
    // Store off-chain record (mirror only - never fatal: the blend is already
    // committed on-chain by BlendBatch above).
    try {
      await prisma.batch.create({
        data: {
          batchId: newBatchId,
          lotId: newLotId,
          state: ledger.currentStatus,
          weightKg: data.weight_kg,
          sensorDataHash: blendHash,
          barcodePayload: payload as any,
          blends: { create: blends },
        },
      });
    } catch (e) {
      console.error(`[blend] on-chain batch ${newBatchId} committed but DB mirror failed`, e);
    }

    res.status(201).json({ batch_id: newBatchId, lot_id: newLotId, sources: data.sources, state: ledger.currentStatus, tx: txResponse(result) });
  } catch (e) {
    next(e);
  }
}

export async function transfer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batchId = req.params.id;
    const data = transferSchema.parse(req.body);

    // Resolve the destination. When to_identity is an operator id, derive the
    // recipient MSP from their organization (authoritative server-side) rather
    // than trusting a client-supplied MSP.
    let toMsp: string | undefined = data.to_msp;
    let toIdentity: string | null = data.to_identity ?? null;
    if (data.to_identity) {
      const recipient = await prisma.user.findUnique({
        where: { operatorId: data.to_identity },
        select: { organization: { select: { mspId: true } } },
      });
      if (recipient?.organization?.mspId) toMsp = recipient.organization.mspId;
    }
    if (!toMsp) {
      res.status(400).json({ error: 'A receiving organization/MSP is required' });
      return;
    }

    const fromMsp = fabricService.mspForRole(req.user!.role);

    const transferHash = recordHash({
      batchId,
      fromMsp,
      toMsp,
      fromUserId: actorOperatorId(req),
      toIdentity,
    });
    const result = await fabricService.submitAs(
      req.user!.role,
      'TransferCustody',
      batchId,
      'BATCH',
      fromMsp,
      toMsp,
      transferHash,
    );
    await audit(req, batchId, 'TransferCustody', result);
    await prisma.ownershipTransfer.create({
      data: { batchId, fromId: actorOperatorId(req), toId: toIdentity ?? toMsp },
    });
    const ledger = await readCommittedBatch(batchId);
    await syncBatch(batchId, ledger);
    res.json({ batch_id: batchId, to_identity: toIdentity, to_msp: toMsp, tx: txResponse(result) });
  } catch (e) {
    next(e);
  }
}

export async function clearFlag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batchId = req.params.id;
    const data = clearFlagSchema.parse(req.body);
    const resolutionHash = recordHash({ batchId, resolution: data.resolution, resolvedBy: req.user!.userId });
    const result = await fabricService.submitAs(req.user!.role, 'ResolveFlag', batchId, resolutionHash, String(data.resolution === 'CLEARED'));
    await audit(req, batchId, 'ResolveFlag', result);
    const ledger = await readCommittedBatch(batchId);
    await syncBatch(batchId, ledger);
    res.json({ batch_id: batchId, resolution: data.resolution, state: ledger.currentStatus, tx: txResponse(result) });
  } catch (e) {
    next(e);
  }
}

interface LedgerBatch {
  currentStatus: string;
  currentCustodianMsp: string;
  flagged: boolean;
  flagReasonHash?: string;
  revoked: boolean;
  revocationReason?: string;
}

async function readCommittedBatch(batchId: string): Promise<LedgerBatch> {
  return JSON.parse(await fabricService.evaluate('GetBatch', batchId)) as LedgerBatch;
}

async function syncBatch(batchId: string, ledger: LedgerBatch): Promise<void> {
  await prisma.batch.update({
    where: { batchId },
    data: {
      state: ledger.currentStatus,
      flagged: ledger.flagged,
      flagReason: ledger.flagReasonHash || ledger.revocationReason || null,
      flagResolution: ledger.revoked ? 'REJECTED' : ledger.flagged ? null : 'CLEARED',
    },
  });
  const jars = await prisma.jarSerial.findMany({ where: { batchId }, select: { jarId: true } });
  await Promise.all(jars.map((jar) => cacheDelete(`verify:${jar.jarId}`)));
}

function qualityInputFromRow(row: {
  stage: 'INTAKE' | 'OUTPUT' | 'FINAL';
  moisture: number | null;
  hmf: number | null;
  diastase: number | null;
  sugarProfile: unknown;
  isotopeRatio: number | null;
}): QualityTestInput | undefined {
  const sugar = row.sugarProfile as Partial<QualityTestInput['sugarProfile']> | null;
  if (row.moisture == null || row.hmf == null || row.diastase == null || row.isotopeRatio == null ||
      sugar?.fructose == null || sugar.glucose == null || sugar.sucrose == null) return undefined;
  return {
    stage: row.stage,
    moisture: row.moisture,
    hmf: row.hmf,
    diastase: row.diastase,
    sugarProfile: { fructose: sugar.fructose, glucose: sugar.glucose, sucrose: sugar.sucrose },
    isotopeRatio: row.isotopeRatio,
  };
}

export async function scan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { payload } = scanSchema.parse(req.body);
    if (!payload.trim()) {
      res.status(400).json({ error: 'A scan payload is required' });
      return;
    }

    // Normalize and derive the candidate identifiers to resolve. Raw material
    // labels encode a composite Code-128 value "LOT|WEIGHT|DATE" (e.g.
    // "HC-LOT-001|40|2026-08-30"); the lot id is the first segment. We also
    // accept a bare batch id, lot id, or jar serial.
    const candidates = new Set<string>();
    payload
      .split('|')
      .map((part) => part.trim().toUpperCase())
      .forEach((part) => { if (part) candidates.add(part); });
    const batchIds = [...candidates];

    // Resolve the scanned value against the batch mirror by batch id, lot id,
    // or by any jar serial that belongs to a batch.
    let batch = await prisma.batch.findFirst({
      where: {
        OR: [
          { batchId: { in: batchIds } },
          { lotId: { in: batchIds } },
          { batchId: { mode: 'insensitive' as const, in: batchIds } },
          { lotId: { mode: 'insensitive' as const, in: batchIds } },
        ],
      },
      include: { qualityTests: true, processingLog: { orderBy: { ts: 'desc' }, take: 1 } },
    });

    let jarId: string | undefined;
    if (!batch) {
      const jar = await prisma.jarSerial.findFirst({
        where: { OR: [{ jarId: { in: batchIds } }, { jarId: { mode: 'insensitive' as const, in: batchIds } }] },
      });
      if (jar) {
        jarId = jar.jarId;
        batch = await prisma.batch.findUnique({
          where: { batchId: jar.batchId },
          include: { qualityTests: true, processingLog: { orderBy: { ts: 'desc' }, take: 1 } },
        });
      }
    }

    if (!batch) {
      res.status(404).json({ error: 'Scan value did not match any batch, lot, or jar in this ledger' });
      return;
    }

    const warnings: string[] = [];
    if (batch.flagged) warnings.push(`Batch ${batch.batchId} is flagged for review: ${batch.flagReason ?? 'integrity concern'}`);

    if (batch.state === 'COLLECTED') {
      const intake = batch.qualityTests.find((q) => q.stage === 'INTAKE');
      if (!intake) warnings.push('No intake laboratory result recorded for this lot.');
    }

    res.json({
      asset_type: 'BATCH',
      batch_id: batch.batchId,
      ...(jarId ? { jar_id: jarId } : {}),
      ...(warnings.length ? { warnings } : {}),
      allowed_operations: [],
    });
  } catch (e) {
    next(e);
  }
}

export async function listOperators(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = typeof req.query.role === 'string' ? req.query.role : undefined;
    const OPERATOR_ROLES = ['TRANSPORTER', 'LABTECH', 'FACTORYWORKER', 'QCMANAGER', 'DISTRIBUTOR'];
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        role: role && OPERATOR_ROLES.includes(role) ? (role as any) : { in: OPERATOR_ROLES },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        operatorId: true,
        organization: { select: { name: true, mspId: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ operators: users });
  } catch (e) {
    next(e);
  }
}

function txResponse(tx: { transactionId: string; validationCode: number; successful: boolean; result: string }) {
  let result: unknown = tx.result;
  try { result = JSON.parse(tx.result); } catch { /* empty/non-JSON chaincode response */ }
  return { transaction_id: tx.transactionId, validation_code: tx.validationCode, successful: tx.successful, result };
}

async function audit(
  req: Request,
  batchId: string,
  operation: string,
  tx: { transactionId: string; validationCode: number; successful: boolean; result: string },
): Promise<void> {
  await recordLedgerTransaction({
    tx,
    batchId,
    operation,
    actorId: req.user!.userId,
    actorRole: req.user!.role,
  });
}

export const factoryReceived = [requireAuth, requireRole('TRANSPORTER'), received];
export const factoryScan = [requireAuth, requireRole('TRANSPORTER', 'LABTECH', 'FACTORYWORKER', 'QCMANAGER', 'DISTRIBUTOR', 'ADMIN'), scan];
export const factoryQualityTest = [requireAuth, requireRole('LABTECH'), qualityTest];
export const factoryProcessingAction = [requireAuth, requireRole('FACTORYWORKER'), processingAction];
export const factoryPackaging = [requireAuth, requireRole('FACTORYWORKER'), packaging];
export const factoryBlend = [requireAuth, requireRole('FACTORYWORKER'), blend];
export const factoryTransfer = [requireAuth, requireRole('BEEKEEPER', 'TRANSPORTER', 'FACTORYWORKER', 'DISTRIBUTOR'), transfer];
export const factoryClearFlag = [requireAuth, requireRole('QCMANAGER'), clearFlag];
export const factoryListOperators = [requireAuth, requireRole('TRANSPORTER', 'LABTECH', 'FACTORYWORKER', 'QCMANAGER', 'DISTRIBUTOR', 'ADMIN'), listOperators];
