import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { profile: true, hives: true },
    });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const { passwordHash, ...rest } = user as any;
    res.json({ profile: rest });
  } catch (e) {
    next(e);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body ?? {};
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        apiaryName: body.apiary_name ?? undefined,
        location: body.location ?? undefined,
        gpsLat: body.gps_lat ?? undefined,
        gpsLng: body.gps_lng ?? undefined,
      },
    });
    const { passwordHash, ...rest } = user as any;
    res.json({ profile: rest });
  } catch (e) {
    next(e);
  }
}

export const profileGet = [requireAuth, getProfile];
export const profilePut = [requireAuth, updateProfile];
