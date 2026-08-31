import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';

const resolveSchema = z.object({ note: z.string().max(1000).optional() });

export async function listAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Only alerts for hives registered to the authenticated beekeeper.
    const hiveIds = await prisma.hive.findMany({
      where: { beekeeperId: req.user?.userId },
      select: { hiveId: true },
    });
    const alerts = await prisma.alert.findMany({
      where: { hiveId: { in: hiveIds.map((h) => h.hiveId) } },
      orderBy: { ts: 'desc' },
      take: 100,
    });
    res.json({ alerts });
  } catch (e) {
    next(e);
  }
}

export async function acknowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const owned = await prisma.hive.findMany({
      where: { beekeeperId: req.user?.userId },
      select: { hiveId: true },
    });
    const alert = await prisma.alert.updateMany({
      where: { id: req.params.id, hiveId: { in: owned.map((h) => h.hiveId) } },
      data: { acknowledged: true, status: 'ACKNOWLEDGED', acknowledgedAt: new Date(), acknowledgedBy: req.user!.userId },
    });
    if (alert.count === 0) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function resolve(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = resolveSchema.parse(req.body ?? {});
    const owned = await prisma.hive.findMany({ where: { beekeeperId: req.user?.userId }, select: { hiveId: true } });
    const alert = await prisma.alert.updateMany({
      where: { id: req.params.id, hiveId: { in: owned.map((h) => h.hiveId) } },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: req.user!.userId,
        resolutionNote: body.note,
        dedupeKey: null,
      },
    });
    if (alert.count === 0) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export const alertsList = [requireAuth, listAlerts];
export const alertsAck = [requireAuth, acknowledge];
export const alertsResolve = [requireAuth, resolve];
