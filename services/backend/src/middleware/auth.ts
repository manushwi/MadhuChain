import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { prisma } from '../db/prisma.js';

export interface AuthUser {
  userId: string;
  role: string;
  fabricUserID?: string;
  operatorId?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(payload: { sub: string; role: string; fabricUserID?: string }): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    next(Object.assign(new Error('Missing bearer token'), { status: 401 }));
    return;
  }
  const token = header.slice('Bearer '.length);
  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
    if (typeof decoded.sub !== 'string') {
      throw new Error('Token subject is missing');
    }
  } catch {
    next(Object.assign(new Error('Invalid or expired token'), { status: 401 }));
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        role: true,
        status: true,
        fabricUserID: true,
        operatorId: true,
        organization: { select: { status: true } },
      },
    });
    if (!user || user.status !== 'ACTIVE') {
      next(Object.assign(new Error('User account is unavailable'), { status: 401 }));
      return;
    }
    if (user.organization?.status === 'SUSPENDED') {
      next(Object.assign(new Error('User organization is suspended'), { status: 403 }));
      return;
    }
    req.user = {
      userId: user.id,
      role: user.role,
      fabricUserID: user.fabricUserID ?? undefined,
      operatorId: user.operatorId ?? undefined,
    };
    next();
  } catch (error) {
    next(error);
  }
}
