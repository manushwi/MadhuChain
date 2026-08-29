import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { fabricService } from '../services/fabric/fabricService.js';
import { config } from '../config.js';
import { cacheGet, cacheSet } from '../services/cache.js';

/**
 * Public consumer verification. Combines on-chain history (via Fabric Gateway
 * GetBatch/GetJar) with off-chain quality data into a single response the
 * consumer site can render. Served from Redis cache for fast load (NFR1).
 */
export async function verify(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jarId = req.params.jarId;
    const cacheKey = `verify:${jarId}`;

    if (config.REDIS_ENABLED) {
      const cached = await cacheGet(cacheKey);
      if (cached) {
        res.json(JSON.parse(cached));
        return;
      }
    }

    // Resolve the batch that produced this jar (on-chain).
    let onChain: any = null;
    try {
      const raw = await fabricService.evaluate('GetJar', jarId);
      onChain = JSON.parse(raw);
    } catch {
      onChain = null;
    }

    // Off-chain: find the jar record + parent batch.
    const jar = await prisma.jarSerial.findUnique({ where: { jarId } });
    const batch = jar
      ? await prisma.batch.findUnique({
          where: { batchId: jar.batchId },
          include: { qualityTests: true, processingLog: true, ownershipTransfer: true, blends: true },
        })
      : null;

    const payload = {
      jar_id: jarId,
      origin: batch
        ? {
            beekeeper: batch.beekeeperId,
            harvest_start: batch.harvestStart,
            harvest_end: batch.harvestEnd,
          }
        : null,
      quality: batch
        ? batch.qualityTests.map((q) => ({
            stage: q.stage,
            moisture: q.moisture,
            hmf: q.hmf,
            diastase: q.diastase,
            sugar_profile: q.sugarProfile,
            isotope_ratio: q.isotopeRatio,
            ts: q.ts,
          }))
        : [],
      journey: batch
        ? {
            batches: batch.ownershipTransfer,
            processing_actions: batch.processingLog,
          }
        : null,
      integrity: batch
        ? {
            state: batch.state,
            flagged: batch.flagged,
            flag_reason: batch.flagReason,
          }
        : null,
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

export async function appearanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const jarId = req.params.jarId;
    const body = req.body ?? {};
    const report = await prisma.appearanceReport.create({
      data: {
        jarId,
        photoUrl: body.photo_url,
        color: body.color,
        texture: body.texture,
        offSmell: body.off_smell ?? false,
        offTaste: body.off_taste ?? false,
        notes: body.notes,
      },
    });
    if (config.REDIS_ENABLED) await cacheSet(`verify:${jarId}`, '', 1); // invalidate
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
