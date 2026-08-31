import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { latestAssessment, serializeAssessment } from '../services/hiveAnalytics.js';
import { analyzeHive } from '../services/hiveAnalysis.js';

// Location may be sent as a plain string OR a {latitude, longitude} object
// (the beekeeper app sends `location: { latitude, longitude }` + `gpsLat/gpsLng`).
const gpsSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
const createHiveSchema = z.object({
  hiveId: z.string().min(1),
  name: z.string().optional(),
  sensorNodeId: z.string().optional(),
  location: z.union([z.string(), gpsSchema]).optional(),
  gpsLat: z.number().optional(),
  gpsLng: z.number().optional(),
});

const rangeSchema = z.object({ range: z.enum(['24h', 'day', 'week', 'month']).default('day') });

function toLastReading(r: {
  tempIn: number | null;
  humIn: number | null;
  weightKg: number | null;
  batteryV: number | null;
  ts: Date;
}): { temperature: number | null; humidity: number | null; weight: number | null; battery: number | null; ts: Date } {
  return {
    temperature: r.tempIn,
    humidity: r.humIn,
    weight: r.weightKg,
    battery: r.batteryV,
    ts: r.ts,
  };
}

export async function listHives(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hives = await prisma.hive.findMany({
      where: { beekeeperId: req.user?.userId },
      orderBy: { registeredAt: 'asc' },
    });
    const withLast = await Promise.all(
      hives.map(async (h) => {
        const latest = await prisma.sensorReading.findFirst({
          where: { hiveId: h.hiveId },
          orderBy: { ts: 'desc' },
        });
        const assessment = serializeAssessment(await latestAssessment(h.hiveId));
        return { ...h, status: assessment.status, assessment, lastReading: latest ? toLastReading(latest) : null };
      }),
    );
    res.json({ hives: withLast });
  } catch (e) {
    next(e);
  }
}

export async function createHive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const num = (v: unknown): number | undefined => {
      if (v == null || v === '') return undefined;
      const n = typeof v === 'number' ? v : Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const body = {
      ...req.body,
      hiveId: req.body.hive_id ?? req.body.hiveId,
      gpsLat: num(req.body.gps_lat ?? req.body.gpsLat),
      gpsLng: num(req.body.gps_lng ?? req.body.gpsLng),
    };
    const data = createHiveSchema.parse(body);
    const locObj = typeof data.location === 'object' && data.location ? data.location : undefined;
    const locationStr = typeof data.location === 'string' ? data.location : locObj
      ? [locObj.latitude, locObj.longitude].filter((v) => v != null).join(',') || undefined
      : undefined;
    const gpsLat = data.gpsLat ?? num(locObj?.latitude);
    const gpsLng = data.gpsLng ?? num(locObj?.longitude);
    const hive = await prisma.hive.create({
      data: {
        hiveId: data.hiveId,
        name: data.name,
        sensorNodeId: data.sensorNodeId,
        location: locationStr,
        gpsLat,
        gpsLng,
        beekeeperId: req.user?.userId,
      },
    });
    res.status(201).json({ hive });
  } catch (e) {
    next(e);
  }
}

export async function liveStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hive = await prisma.hive.findUnique({ where: { id: req.params.id } });
    if (!hive) {
      res.status(404).json({ error: 'Hive not found' });
      return;
    }
    if (hive.beekeeperId !== req.user?.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const latest = await prisma.sensorReading.findFirst({
      where: { hiveId: hive.hiveId },
      orderBy: { ts: 'desc' },
    });
    const assessment = serializeAssessment(await latestAssessment(hive.hiveId));
    res.json({
      hive: { ...hive, status: assessment.status, assessment, lastReading: latest ? toLastReading(latest) : null },
      latest,
    });
  } catch (e) {
    next(e);
  }
}

export async function assessment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hive = await prisma.hive.findUnique({ where: { id: req.params.id } });
    if (!hive) {
      res.status(404).json({ error: 'Hive not found' });
      return;
    }
    if (hive.beekeeperId !== req.user?.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    res.json({ assessment: serializeAssessment(await latestAssessment(hive.hiveId)) });
  } catch (e) {
    next(e);
  }
}

// AI hive/disease analysis. Deterministic risk estimation always; the OpenRouter
// LLM is called only when the hive is outside its normal operating band.
export async function hiveAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hive = await prisma.hive.findUnique({ where: { id: req.params.id } });
    if (!hive) {
      res.status(404).json({ error: 'Hive not found' });
      return;
    }
    if (hive.beekeeperId !== req.user?.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const profile = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { beeSpecies: true, nectarSource: true },
    });
    const result = await analyzeHive(hive.hiveId, {
      beeSpecies: profile?.beeSpecies ?? null,
      nectarSource: profile?.nectarSource ?? null,
    });
    res.json({ analysis: result });
  } catch (e) {
    next(e);
  }
}

export async function readings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { range = 'day' } = rangeSchema.parse(req.query);
    const hive = await prisma.hive.findUnique({ where: { id: req.params.id } });
    if (!hive) {
      res.status(404).json({ error: 'Hive not found' });
      return;
    }
    if (hive.beekeeperId !== req.user?.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const since = sinceDate(range);
    const readings = await prisma.sensorReading.findMany({
      where: { hiveId: hive.hiveId, ts: { gte: since } },
      orderBy: { ts: 'asc' },
    });
    // Normalized points for the app's charts; raw rows kept for the gateway contract.
    const points = readings.map((r) => ({
      ts: r.ts,
      temperature: r.tempIn,
      humidity: r.humIn,
      weight: r.weightKg,
    }));
    res.json({ hive: hive.hiveId, range, count: readings.length, readings: points });
  } catch (e) {
    next(e);
  }
}

function sinceDate(range: string): Date {
  const now = new Date();
  if (range === 'week') now.setDate(now.getDate() - 7);
  else if (range === 'month') now.setMonth(now.getMonth() - 1);
  else now.setDate(now.getDate() - 1); // day / 24h
  return now;
}

export const hivesRouter = [requireAuth, requireRole('BEEKEEPER')];
