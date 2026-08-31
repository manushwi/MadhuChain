import crypto from 'node:crypto';
import type { Request } from 'express';
import { config } from '../config.js';
import { prisma } from '../db/prisma.js';
import { recordHash } from './recordHash.js';

export async function recordAudit(input: {
  req?: Request;
  actorId?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  metadata?: unknown;
}): Promise<void> {
  const ip = input.req?.ip;
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? input.req?.user?.userId,
      actorRole: input.actorRole ?? input.req?.user?.role,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      beforeHash: input.before === undefined ? undefined : recordHash(input.before),
      afterHash: input.after === undefined ? undefined : recordHash(input.after),
      ipHash: ip ? crypto.createHmac('sha256', config.JWT_SECRET).update(ip).digest('hex') : undefined,
      metadata: input.metadata as any,
    },
  });
}
