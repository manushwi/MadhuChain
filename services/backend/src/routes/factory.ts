import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { fabricService } from '../services/fabric/fabricService.js';
import { runFraudChecks, type QualityTestInput } from '../services/fraudChecks.js';

const receivedSchema = z.object({
  transporter_id: z.string().min(1),
  weight_in: z.number().positive(),
});

const qualityTestSchema = z.object({
  stage: z.enum(['INTAKE', 'OUTPUT', 'FINAL']),
  moisture: z.number(),
  hmf: z.number(),
  diastase: z.number(),
  sugar_profile: z.object({ fructose: z.number(), glucose: z.number(), sucrose: z.number() }),
  isotope_ratio: z.number(),
});

const processingActionSchema = z.object({
  action_type: z.string().min(1), // heating | filtering | blending
  parameters: z.record(z.string()).optional(),
  operator_id: z.string().optional(),
  equipment_id: z.string().optional(),
  weight_before: z.number().optional(),
  weight_after: z.number().optional(),
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

const transferSchema = z.object({ to_identity: z.string().min(1) });
const clearFlagSchema = z.object({ resolution: z.enum(['CLEARED', 'REJECTED']) });

export async function received(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batchId = req.params.id;
    const data = receivedSchema.parse(req.body);
    const result = await fabricService.submit(
      'RecordReceived',
      batchId,
      data.transporter_id,
      String(data.weight_in),
    );
    await prisma.batch.update({
      where: { batchId },
      data: { state: 'INTAKE_TEST', flagged: false },
    });
    res.json({ batch_id: batchId, state: 'INTAKE_TEST', tx: parseTxResult(result) });
  } catch (e) {
    next(e);
  }
}

export async function qualityTest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batchId = req.params.id;
    const data = qualityTestSchema.parse(req.body);
    const stage = data.stage.toLowerCase();

    const result = await fabricService.submit(
      'RecordQualityTest',
      batchId,
      stage,
      String(data.moisture),
      String(data.hmf),
      String(data.diastase),
      JSON.stringify(data.sugar_profile),
      String(data.isotope_ratio),
    );

    // Persist the test off-chain for the verify page.
    const saved = await prisma.qualityTest.create({
      data: {
        batchId,
        stage: data.stage,
        moisture: data.moisture,
        hmf: data.hmf,
        diastase: data.diastase,
        sugarProfile: data.sugar_profile as any,
        isotopeRatio: data.isotope_ratio,
        testerId: req.user?.userId,
      },
    });

    // Run server-side fraud checks on OUTPUT stage (belt-and-suspenders).
    let fraud: { passed: boolean; reasons: string[] } | undefined;
    let state = 'PROCESSING';
    if (stage === 'output') {
      const intake = await prisma.qualityTest.findFirst({
        where: { batchId, stage: 'INTAKE' },
        orderBy: { ts: 'desc' },
      });
      const batch = await prisma.batch.findUnique({ where: { batchId } });
      fraud = runFraudChecks(
        batch?.weightKg ?? 0,
        data.moisture, // NB: not a real weight; weight reconciliation handled via processing actions
        intake ? toQualityInput(intake) : undefined,
        toQualityInput(saved as any),
      );
      state = fraud.passed ? 'PACKAGING' : 'FLAGGED';
    } else if (stage === 'final') {
      state = 'RELEASED';
    }

    await prisma.batch.update({ where: { batchId }, data: { state, flagged: state === 'FLAGGED' } });

    res.json({
      batch_id: batchId,
      stage: data.stage,
      state,
      flagged: state === 'FLAGGED',
      fraud_checks: fraud,
      tx: parseTxResult(result),
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
    const result = await fabricService.submit(
      'RecordProcessingAction',
      batchId,
      data.action_type,
      JSON.stringify(parameters),
      data.operator_id ?? '',
      data.equipment_id ?? '',
      String(data.weight_before ?? 0),
      String(data.weight_after ?? 0),
    );
    await prisma.processingAction.create({
      data: {
        batchId,
        actionType: data.action_type,
        parameters: parameters as any,
        operatorId: req.user?.userId,
        equipmentId: data.equipment_id,
        weightBefore: data.weight_before,
        weightAfter: data.weight_after,
        parentLots: data.parent_lots as any,
      },
    });
    await prisma.batch.update({ where: { batchId }, data: { state: 'PROCESSING' } });
    res.json({ batch_id: batchId, action: data.action_type, tx: parseTxResult(result) });
  } catch (e) {
    next(e);
  }
}

export async function packaging(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batchId = req.params.id;
    const data = packagingSchema.parse(req.body);
    const result = await fabricService.submit(
      'RecordPackaging',
      batchId,
      String(data.jar_count),
      String(data.average_jar_weight_kg),
    );

    // Generate jar serials off-chain to match the chaincode's jar_* records.
    const prefix = `${batchId}-JAR-`;
    const jars = Array.from({ length: data.jar_count }, (_, i) => ({
      batchId,
      jarId: `${prefix}${String(i + 1).padStart(4, '0')}`,
    }));
    await prisma.jarSerial.createMany({ data: jars });

    await prisma.batch.update({ where: { batchId }, data: { state: 'FINAL_QC' } });
    res.json({ batch_id: batchId, jar_count: data.jar_count, jars: jars.map((j) => j.jarId), tx: parseTxResult(result) });
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

    const result = await fabricService.submit(
      'BlendBatch',
      newBatchId,
      newLotId,
      JSON.stringify(data.sources.map((s) => ({ lotId: s.lot_id, weightKg: s.weight_kg }))),
      String(data.weight_kg),
      'blend-hash',
      JSON.stringify(payload),
    );

    const blends = data.sources.map((s) => ({
      sourceLotId: s.lot_id,
      weightKg: s.weight_kg,
      percentage: (s.weight_kg / data.weight_kg) * 100,
    }));

    // Store off-chain record (mirror only - never fatal: the blend is already
    // committed on-chain by BlendBatch above).
    try {
      await prisma.batch.create({
        data: {
          batchId: newBatchId,
          lotId: newLotId,
          state: 'PROCESSING',
          weightKg: data.weight_kg,
          sensorDataHash: 'blend-hash',
          barcodePayload: payload as any,
          blends: { create: blends },
        },
      });
    } catch (e) {
      console.error(`[blend] on-chain batch ${newBatchId} committed but DB mirror failed`, e);
    }

    res.status(201).json({ batch_id: newBatchId, lot_id: newLotId, sources: data.sources, tx: parseTxResult(result) });
  } catch (e) {
    next(e);
  }
}

export async function transfer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batchId = req.params.id;
    const data = transferSchema.parse(req.body);
    const result = await fabricService.submit('TransferOwnership', batchId, data.to_identity);
    await prisma.ownershipTransfer.create({
      data: { batchId, fromId: req.user?.userId, toId: data.to_identity },
    });
    res.json({ batch_id: batchId, to_identity: data.to_identity, tx: parseTxResult(result) });
  } catch (e) {
    next(e);
  }
}

export async function clearFlag(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const batchId = req.params.id;
    const data = clearFlagSchema.parse(req.body);
    const result = await fabricService.submit('ClearFlag', batchId, data.resolution);
    const cleared = data.resolution === 'CLEARED';
    await prisma.batch.update({
      where: { batchId },
      data: { flagged: !cleared, state: cleared ? 'PROCESSING' : 'FLAGGED', flagResolution: data.resolution },
    });
    res.json({ batch_id: batchId, resolution: data.resolution, tx: parseTxResult(result) });
  } catch (e) {
    next(e);
  }
}

function toQualityInput(q: {
  stage: string;
  moisture: number | null;
  hmf: number | null;
  diastase: number | null;
  sugarProfile: unknown;
  isotopeRatio: number | null;
}): QualityTestInput {
  const sp = (q.sugarProfile ?? {}) as { fructose?: number; glucose?: number; sucrose?: number };
  return {
    stage: (q.stage.toLowerCase() as QualityTestInput['stage']),
    moisture: q.moisture ?? 0,
    hmf: q.hmf ?? 0,
    diastase: q.diastase ?? 0,
    sugarProfile: { fructose: sp.fructose ?? 0, glucose: sp.glucose ?? 0, sucrose: sp.sucrose ?? 0 },
    isotopeRatio: q.isotopeRatio ?? 0,
  };
}

function parseTxResult(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export const factoryReceived = [requireAuth, received];
export const factoryQualityTest = [requireAuth, qualityTest];
export const factoryProcessingAction = [requireAuth, processingAction];
export const factoryPackaging = [requireAuth, packaging];
export const factoryBlend = [requireAuth, blend];
export const factoryTransfer = [requireAuth, transfer];
export const factoryClearFlag = [requireAuth, clearFlag];
