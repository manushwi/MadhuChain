import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { config } from '../config.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { fabricUserForRole } from '../services/identity.js';

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  password: z.string().min(8),
  role: z
    .enum(['BEEKEEPER', 'TRANSPORTER', 'LABTECH', 'FACTORYWORKER', 'QCMANAGER', 'DISTRIBUTOR', 'CONSUMER'])
    .default('CONSUMER'),
  apiaryName: z.string().optional(),
  location: z.string().optional(),
  gpsLat: z.number().optional(),
  gpsLng: z.number().optional(),
});

const loginSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1),
});

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = signupSchema.parse(req.body);
    if (!data.email && !data.phone) {
      res.status(400).json({ error: 'Provide email or phone' });
      return;
    }
    const passwordHash = await bcrypt.hash(data.password, config.BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: data.role,
        apiaryName: data.apiaryName,
        location: data.location,
        gpsLat: data.gpsLat,
        gpsLng: data.gpsLng,
        fabricUserID: fabricUserForRole(data.role),
      },
    });

    const token = signToken({
      sub: user.id,
      role: user.role,
      fabricUserID: user.fabricUserID ?? undefined,
    });

    res.status(201).json({ token, user: publicUser(user) });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: data.email ? { email: data.email } : { phone: data.phone },
    });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = signToken({
      sub: user.id,
      role: user.role,
      fabricUserID: user.fabricUserID ?? undefined,
    });
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    next(e);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user: publicUser(user) });
  } catch (e) {
    next(e);
  }
}

export const authMe = [requireAuth, me];

function publicUser(u: {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  apiaryName: string | null;
  location: string | null;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    apiaryName: u.apiaryName,
    location: u.location,
  };
}
