import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const createHiveSchema = z.object({
  hiveId: z.string().min(1),
  sensorNodeId: z.string().optional(),
  location: z.string().optional(),
  gpsLat: z.number().optional(),
  gpsLng: z.number().optional(),
});

const rangeSchema = z.object({ range: z.enum(['24h', 'day', 'week', 'month']).default('day') });

export async function listHives(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hives = await prisma.hive.findMany({ orderBy: { registeredAt: 'asc' } });
    res.json({ hives });
  } catch (e) {
    next(e);
  }
}

export async function createHive(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createHiveSchema.parse(req.body);
    const hive = await prisma.hive.create({
      data: { ...data, beekeeperId: req.user?.userId },
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
    const latest = await prisma.sensorReading.findFirst({
      where: { hiveId: hive.hiveId },
      orderBy: { ts: 'desc' },
    });
    res.json({ hive, latest });
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
    const since = sinceDate(range);
    const readings = await prisma.sensorReading.findMany({
      where: { hiveId: hive.hiveId, ts: { gte: since } },
      orderBy: { ts: 'asc' },
    });
    res.json({ hive: hive.hiveId, range, count: readings.length, readings });
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

export const hivesRouter = [requireAuth];
