import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { fabricService } from '../services/fabric/fabricService.js';
import { config } from '../config.js';
import { cacheDelete, cacheGet, cacheSet } from '../services/cache.js';
import { z } from 'zod';

const appearanceSchema = z.object({
  photo_url: z.string().url().optional(),
  color: z.string().max(80).optional(),
  texture: z.string().max(80).optional(),
  off_smell: z.boolean().default(false),
  off_taste: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
});

const EVENT_PRESENTATION: Record<string, { title: string; summary: string }> = {
  HARVESTED: { title: 'Harvest recorded', summary: 'The batch was harvested and minted onto the HoneyChain ledger.' },
  COLLECTED: { title: 'Collected from apiary', summary: 'Custody was received by a transporter en route from the apiary.' },
  COLLECTION_REJECTED: { title: 'Collection rejected', summary: 'The collected lot was rejected during intake.' },
  LAB_APPROVED: { title: 'Laboratory approved', summary: 'Lab quality testing passed and the lot was approved for processing.' },
  LAB_REJECTED: { title: 'Laboratory rejected', summary: 'The lot failed laboratory quality testing.' },
  PROCESSED: { title: 'Processed', summary: 'A processing unit operation was recorded against the lot.' },
  OUTPUT_APPROVED: { title: 'Output approved', summary: 'The processed output passed output quality control.' },
  FINAL_QC: { title: 'Final quality control', summary: 'The packaged lot passed final quality control.' },
  RELEASED: { title: 'Released to distribution', summary: 'The lot was released for distribution and sale.' },
  REVOKED: { title: 'Revoked', summary: 'The lot was revoked from circulation.' },
  FLAGGED: { title: 'Flagged for review', summary: 'An integrity concern was flagged on this lot.' },
};

/**
 * Public consumer verification. Combines on-chain history (via Fabric Gateway
 * GetBatch / GetBatchHistory) with off-chain quality data into a single
 * response the consumer site can render. Served from Redis cache for fast
 * load. The consumer front-end consumes the `jar`/`batch`/`authenticity`/
 * `integrity`/`origin`/`quality`/`timeline`/`on_chain` contract.
 */
export async function verify(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jarId = req.params.jarId ?? req.params.token;
    const cacheKey = `verify:${jarId}`;

    if (config.REDIS_ENABLED) {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        res.json(JSON.parse(cached));
        return;
      }
    }

    // Off-chain: find the jar record + parent batch.
    const jar = await prisma.jarSerial.findUnique({ where: { jarId } });
    const batch = jar
      ? await prisma.batch.findUnique({
          where: { batchId: jar.batchId },
          include: {
            beekeeper: {
              select: {
                name: true,
                apiaryName: true,
                location: true,
                beeSpecies: true,
                nectarSource: true,
                gpsLat: true,
                gpsLng: true,
              },
            },
            hives: {
              include: {
                hive: {
                  select: {
                    hiveId: true,
                    name: true,
                    location: true,
                    gpsLat: true,
                    gpsLng: true,
                    sensorNodeId: true,
                    registeredAt: true,
                  },
                },
              },
            },
            qualityTests: true,
            processingLog: true,
            ownershipTransfer: true,
            collectionRecords: true,
            blends: true,
            jarSerials: { orderBy: { packagingDate: 'asc' } },
          },
        })
      : null;

    if (!jar || !batch) {
      res.status(404).json({ jar_id: jarId, authenticity_status: 'NOT_FOUND', error: 'Jar not found' });
      return;
    }

    // Latest live telemetry per hive so the sticker page shows hive conditions.
    const telemetryByHive = new Map<string, unknown>();
    if (batch.hives.length) {
      const latestReadings = await Promise.all(
        batch.hives.map(({ hive }) =>
          prisma.sensorReading.findFirst({
            where: { hiveId: hive.hiveId },
            orderBy: { ts: 'desc' },
            select: { hiveId: true, ts: true, tempIn: true, tempOut: true, humIn: true, weightKg: true, batteryV: true },
          }),
        ),
      );
      latestReadings.forEach((reading) => {
        if (reading) telemetryByHive.set(reading.hiveId, reading);
      });
    }

    // Jar-to-batch resolution stays off-chain. Fabric stores only the hash of
    // the bottle summary, so the public token cannot expose all bottle IDs.
    let onChain: any = null;
    let ledgerError: unknown;
    try {
      const raw = await fabricService.evaluate('GetBatch', batch.batchId);
      onChain = JSON.parse(raw);
    } catch (error) {
      ledgerError = error;
    }
    if (!onChain) {
      console.error(`[verify] ledger lookup failed for ${jarId}`, ledgerError);
      res.status(503).json({
        jar_id: jarId,
        authenticity_status: 'LEDGER_UNAVAILABLE',
        error: 'Authenticity cannot be verified while the ledger is unavailable',
      });
      return;
    }

    const mirrorMatches = batch.batchId === onChain.batchId && batch.state === onChain.currentStatus;
    const authenticityStatus = onChain.currentStatus === 'RELEASED' && !onChain.flagged && !onChain.revoked && mirrorMatches
      ? 'VERIFIED'
      : 'WARNING';

    const timeline = await buildTimeline(batch.batchId);
    const handlers = await buildHandlers(batch);

    const payload = {
      jar: {
        jar_id: jarId,
        verification_url: new URL(`/v/${encodeURIComponent(jarId)}`, config.VERIFY_PUBLIC_BASE_URL).toString(),
        qr_data_url: new URL(`/qr/${encodeURIComponent(jarId)}.png`, config.PUBLIC_BASE_URL).toString(),
        barcode_value: jarId,
        packaged_at: jar.packagingDate,
      },
      batch: {
        batch_id: batch.batchId,
        lot_id: batch.lotId,
        state: batch.state,
      },
      authenticity: {
        status: authenticityStatus,
        message: authenticityStatus === 'VERIFIED'
          ? 'This jar is authentic and matches the live HoneyChain ledger record.'
          : 'This jar could not be confirmed as fully authentic. Review the record details.',
      },
      integrity: {
        database_matches_ledger: mirrorMatches,
        jar_membership_verified: true,
      },
      origin: {
        beekeeper: batch.beekeeper?.name ?? null,
        apiary: batch.beekeeper?.apiaryName ?? null,
        location: batch.beekeeper?.location ?? null,
        bee_species: batch.beekeeper?.beeSpecies ?? null,
        nectar_source: batch.beekeeper?.nectarSource ?? null,
        harvest_start: batch.harvestStart,
        harvest_end: batch.harvestEnd,
        weight_kg: batch.weightKg,
      },
      hives: batch.hives.map(({ hive }) => ({
        hive_id: hive.hiveId,
        name: hive.name,
        location: hive.location,
        gps_lat: hive.gpsLat,
        gps_lng: hive.gpsLng,
        sensor_node_id: hive.sensorNodeId,
        registered_at: hive.registeredAt,
        latest_reading: telemetryByHive.get(hive.hiveId) ?? null,
      })),
      jars: batch.jarSerials.map((j) => ({ jar_id: j.jarId, packaged_at: j.packagingDate })),
      quality: batch.qualityTests.map((q) => ({
        stage: q.stage,
        moisture: q.moisture,
        hmf: q.hmf,
        diastase: q.diastase,
        sugar_profile: q.sugarProfile,
        isotope_ratio: q.isotopeRatio,
        ts: q.ts,
      })),
      timeline,
      handlers,
      on_chain: onChain,
    };

    if (config.REDIS_ENABLED) {
      await cacheSet(cacheKey, JSON.stringify(payload), config.VERIFY_CACHE_TTL_SECONDS);
    }

    res.json(payload);
  } catch (e) {
    next(e);
  }
}

/**
 * Build a human-readable list of handlers (operators) that touched this batch,
 * resolving each recorded operator id to its name and role. Lets consumers and
 * admins trace exactly who handled the honey at each stage.
 */
async function buildHandlers(batch: any): Promise<{ operator_id: string; name: string | null; role: string | null; stage: string }[]> {
  const actorIds = new Set<string>();
  const stageByActor: Record<string, string> = {};
  const contribute = (id: string | null | undefined, stage: string) => {
    if (!id) return;
    actorIds.add(id);
    stageByActor[id] = stageByActor[id] ? `${stageByActor[id]}, ${stage}` : stage;
  };

  (batch.collectionRecords ?? []).forEach((r: any) => contribute(r.transporterId, 'receive'));
  (batch.qualityTests ?? []).forEach((q: any) => contribute(q.testerId, `lab:${q.stage?.toLowerCase() ?? ''}`));
  (batch.processingLog ?? []).forEach((p: any) => contribute(p.operatorId, 'process'));
  (batch.ownershipTransfer ?? []).forEach((t: any) => { contribute(t.fromId, 'custody out'); contribute(t.toId, 'custody in'); });

  if (!actorIds.size) return [];

  const users = await prisma.user.findMany({
    where: { OR: [...actorIds].map((operatorId) => ({ operatorId })) },
    select: { operatorId: true, name: true, role: true },
  });
  const byId = new Map(users.map((u) => [u.operatorId, u]));

  return [...actorIds].map((id) => {
    const u = byId.get(id);
    return {
      operator_id: id,
      name: u?.name ?? null,
      role: u?.role ?? null,
      stage: stageByActor[id] ?? null,
    };
  });
}

/**
 * Build the chronological chain-of-custody timeline for a batch. Prefers the
 * indexed Fabric events (which carry block + actor + tx + payload hash) and
 * falls back to the ledger's GetBatchHistory snapshots when the indexer has
 * not yet captured events.
 */
async function buildTimeline(batchId: string) {
  const events = await prisma.fabricEvent.findMany({
    where: { batchId },
    orderBy: { indexedAt: 'asc' },
  });

  if (events.length) {
    return events.map((event) => {
      const presentation = EVENT_PRESENTATION[event.eventType] ?? { title: event.eventType, summary: 'A HoneyChain ledger transaction updated this lot.' };
      return {
        event_type: event.eventType,
        title: presentation.title,
        summary: presentation.summary,
        timestamp: event.observedAt?.toISOString() ?? event.indexedAt.toISOString(),
        actor: event.actorMsp ?? null,
        actor_msp: event.actorMsp ?? null,
        transaction_id: event.txId,
        block_number: event.blockNumber ?? null,
        payload_hash: event.payloadHash ?? null,
        verification_status: event.verificationStatus ?? (event.status === 'valid' ? 'VERIFIED' : 'UNVERIFIED'),
      };
    });
  }

  // Fallback: derive events from the ledger snapshots (oldest first).
  let history: any[] = [];
  try {
    const raw = await fabricService.evaluate('GetBatchHistory', batchId);
    history = JSON.parse(raw);
  } catch {
    history = [];
  }
  const entries = Array.isArray(history) ? history.filter((entry) => entry?.batch) : [];
  return entries.map((entry) => {
    const b = entry.batch;
    const state = b?.currentStatus ?? 'UNKNOWN';
    const presentation = EVENT_PRESENTATION[state] ?? { title: state, summary: 'A HoneyChain ledger transaction updated this lot.' };
    return {
      event_type: state,
      title: presentation.title,
      summary: presentation.summary,
      timestamp: entry.timestamp ?? null,
      actor: b?.currentCustodianMsp ?? null,
      actor_msp: b?.currentCustodianMsp ?? null,
      transaction_id: entry.transactionId ?? null,
      block_number: null,
      payload_hash: null,
      verification_status: 'UNVERIFIED',
    };
  });
}

export async function appearanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jarId = req.params.jarId;
    const jar = await prisma.jarSerial.findUnique({ where: { jarId } });
    if (!jar) {
      res.status(404).json({ error: 'Jar not found' });
      return;
    }
    const body = appearanceSchema.parse(req.body ?? {});
    const report = await prisma.appearanceReport.create({
      data: {
        jarId,
        photoUrl: body.photo_url,
        color: body.color,
        texture: body.texture,
        offSmell: body.off_smell,
        offTaste: body.off_taste,
        notes: body.notes,
      },
    });
    await cacheDelete(`verify:${jarId}`);
    res.status(201).json({ report_id: report.id });
  } catch (e) {
    next(e);
  }
}

interface ReviewBody { rating?: number; comment?: string }

export async function review(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jarId = req.params.jarId;
    const body = req.body ?? {} as ReviewBody;
    const jar = await prisma.jarSerial.findUnique({ where: { jarId } });
    if (!jar) {
      res.status(404).json({ error: 'Jar not found' });
      return;
    }
    if (typeof body.rating !== 'number' || body.rating < 1 || body.rating > 5) {
      res.status(400).json({ error: 'rating must be 1-5' });
      return;
    }
    const saved = await prisma.review.create({
      data: { batchId: jar.batchId, rating: body.rating, comment: body.comment },
    });
    res.status(201).json({ review: saved });
  } catch (e) {
    next(e);
  }
}
