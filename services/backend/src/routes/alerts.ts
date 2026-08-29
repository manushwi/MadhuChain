import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export async function listAlerts(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const alerts = await prisma.alert.findMany({ orderBy: { ts: 'desc' }, take: 100 });
    res.json({ alerts });
  } catch (e) {
    next(e);
  }
}

export async function acknowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const alert = await prisma.alert.update({
      where: { id: req.params.id },
      data: { acknowledged: true },
    });
    res.json({ alert });
  } catch (e) {
    next(e);
  }
}

export const alertsList = [requireAuth, listAlerts];
export const alertsAck = [requireAuth, acknowledge];
