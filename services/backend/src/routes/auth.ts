import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { config } from '../config.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { fabricUserForRole, generateOperatorId } from '../services/identity.js';

export const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  password: z.string().min(8),
  // Operational supply-chain roles are provisioned by an administrator. Public
  // registration is limited to consumers and beekeepers.
  role: z.enum(['BEEKEEPER', 'CONSUMER']).default('CONSUMER'),
  apiaryName: z.string().optional(),
  apiary_name: z.string().optional(),
  location: z.string().optional(),
  gpsLat: z.number().optional(),
  gpsLng: z.number().optional(),
  beeSpecies: z.string().optional(),
  bee_species: z.string().optional(),
  nectarSource: z.string().optional(),
  nectar_source: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1),
});

const adminRegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(12),
  registration_code: z.string().min(1),
});

/**
 * Public administrator registration, gated by a one-time registration code
 * configured server-side (ADMIN_REGISTRATION_CODES). Once a valid code is
 * redeemed it is removed so it cannot be reused. This is how a site
 * administrator provisions the first admin from the login/register UI.
 */
export async function adminRegister(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = adminRegisterSchema.parse(req.body);

    const codes = config.ADMIN_REGISTRATION_CODES
      .split(',')
      .map((code) => code.trim())
      .filter(Boolean);
    if (codes.length === 0) {
      res.status(403).json({ error: 'Administrator registration is not enabled' });
      return;
    }
    if (!codes.includes(data.registration_code)) {
      res.status(403).json({ error: 'Invalid or expired registration code' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const invalidate = codes.filter((code) => code !== data.registration_code);
    process.env.ADMIN_REGISTRATION_CODES = invalidate.join(',');
    config.ADMIN_REGISTRATION_CODES = invalidate.join(',');

    const passwordHash = await bcrypt.hash(data.password, config.BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: 'ADMIN',
        fabricUserID: fabricUserForRole('ADMIN'),
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

export const adminRegisterHandler = [adminRegister];

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
        apiaryName: data.apiaryName ?? data.apiary_name,
        location: data.location,
        gpsLat: data.gpsLat,
        gpsLng: data.gpsLng,
        beeSpecies: data.beeSpecies ?? data.bee_species,
        nectarSource: data.nectarSource ?? data.nectar_source,
        fabricUserID: fabricUserForRole(data.role),
        operatorId: generateOperatorId(data.role),
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
      include: { organization: { select: { status: true } } },
    });
    if (!user || user.status === 'DISABLED' || user.organization?.status === 'SUSPENDED' || !(await bcrypt.compare(data.password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = signToken({
      sub: user.id,
      role: user.role,
      fabricUserID: user.fabricUserID ?? undefined,
    });
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    next(e);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user || user.status === 'DISABLED') {
      res.status(401).json({ error: 'User account is unavailable' });
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
  beeSpecies?: string | null;
  nectarSource?: string | null;
  status?: string;
  organizationId?: string | null;
  operatorId?: string | null;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    apiaryName: u.apiaryName,
    location: u.location,
    beeSpecies: u.beeSpecies ?? null,
    nectarSource: u.nectarSource ?? null,
    status: u.status,
    organizationId: u.organizationId,
    operatorId: u.operatorId ?? null,
  };
}
