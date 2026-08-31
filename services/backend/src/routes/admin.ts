import type { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import type { OrganizationType, Prisma, Role } from '@prisma/client';
import { z } from 'zod';
import { config } from '../config.js';
import { prisma } from '../db/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleGuard.js';
import { recordAudit } from '../services/audit.js';
import { fabricService } from '../services/fabric/fabricService.js';
import { fabricUserForRole, generateOperatorId } from '../services/identity.js';
import { getFabricEventIndexerStatus } from '../workers/fabricEventIndexer.js';
import { evaluateHiveAt } from '../services/hiveAnalytics.js';

const pagingSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().max(100).optional(),
});
const organizationSchema = z.object({
  organization_id: z.string().min(2).max(80),
  name: z.string().min(2).max(160),
  type: z.enum(['KVIC', 'FACTORY', 'LAB', 'DISTRIBUTOR', 'RETAILER', 'REGULATOR']),
  msp_id: z.string().max(80).optional(),
  jurisdiction: z.unknown().optional(),
});
const organizationPatchSchema = organizationSchema.partial().extend({ status: z.enum(['ACTIVE', 'SUSPENDED']).optional() });
const privilegedRoles = ['TRANSPORTER', 'LABTECH', 'FACTORYWORKER', 'QCMANAGER', 'DISTRIBUTOR', 'ADMIN'] as const;
const userSchema = z.object({
  name: z.string().min(2).max(160),
  email: z.string().email(),
  password: z.string().min(12),
  role: z.enum(privilegedRoles).or(z.enum(['BEEKEEPER', 'CONSUMER'])),
  organization_id: z.string().min(1).optional(),
});
const userPatchSchema = z.object({
  role: z.enum(privilegedRoles).optional(),
  organization_id: z.string().min(1).nullable().optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
});
const userQuerySchema = pagingSchema.extend({
  role: z.enum(['BEEKEEPER', 'TRANSPORTER', 'LABTECH', 'FACTORYWORKER', 'QCMANAGER', 'DISTRIBUTOR', 'ADMIN', 'CONSUMER']).optional(),
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  organization_id: z.string().optional(),
  organization: z.string().optional(),
  operator_only: z.enum(['true', 'false']).optional(),
});
const beekeeperQuerySchema = pagingSchema.extend({
  status: z.enum(['ACTIVE', 'DISABLED']).optional(),
  organization_id: z.string().optional(),
  organization: z.string().optional(),
});
const alertPatchSchema = z.object({ status: z.enum(['ACKNOWLEDGED', 'RESOLVED']), note: z.string().max(1000).optional() });

const roleOrganizationTypes: Record<(typeof privilegedRoles)[number], OrganizationType> = {
  FACTORYWORKER: 'FACTORY',
  TRANSPORTER: 'FACTORY',
  LABTECH: 'LAB',
  QCMANAGER: 'KVIC',
  DISTRIBUTOR: 'DISTRIBUTOR',
  ADMIN: 'KVIC',
};

export function isRoleOrganizationCompatible(role: string, organizationType: string): boolean {
  return role in roleOrganizationTypes && roleOrganizationTypes[role as keyof typeof roleOrganizationTypes] === organizationType;
}

type ChainEventProof = {
  transactionId?: string;
  batchId?: string;
  payloadHash?: string;
  eventType?: string;
  actorMsp?: string;
  status?: string;
};

const proofFields = ['transactionId', 'batchId', 'payloadHash', 'eventType', 'actorMsp', 'status'] as const;

export function compareFabricProof(event: { txId: string; batchId: string | null; payloadHash: string | null; eventType: string; actorMsp: string | null; status: string | null }, proof: ChainEventProof) {
  const local: ChainEventProof = {
    transactionId: event.txId,
    batchId: event.batchId ?? undefined,
    payloadHash: event.payloadHash ?? undefined,
    eventType: event.eventType,
    actorMsp: event.actorMsp ?? undefined,
    status: event.status ?? undefined,
  };
  return Object.fromEntries(proofFields.map((field) => [field, { local: local[field] ?? null, onChain: proof[field] ?? null, matches: local[field] === proof[field] }]));
}

function proofMatches(comparison: ReturnType<typeof compareFabricProof>): boolean {
  return Object.values(comparison).every((field) => field.matches);
}

function isMissingOnChainProof(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /does not exist|not found/i.test(message);
}

async function activeCompatibleOrganization(organizationId: string, role: string) {
  const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!organization || organization.status !== 'ACTIVE') return { error: 'Active organization not found' } as const;
  if (!isRoleOrganizationCompatible(role, organization.type)) {
    return { error: `${role} must belong to a ${roleOrganizationTypes[role as keyof typeof roleOrganizationTypes]} organization` } as const;
  }
  return { organization } as const;
}

async function overview(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [organizations, users, hives, alerts, batches, flaggedBatches, production, recentEvents, assessmentGroups] = await Promise.all([
      prisma.organization.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.hive.count(),
      prisma.alert.count({ where: { status: { not: 'RESOLVED' }, severity: 'CRITICAL' } }),
      prisma.batch.count(),
      prisma.batch.count({ where: { flagged: true } }),
      prisma.batch.aggregate({ _sum: { weightKg: true } }),
      prisma.fabricEvent.findMany({ orderBy: { indexedAt: 'desc' }, take: 8 }),
      prisma.modelPrediction.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    res.json({
      metrics: {
        active_organizations: organizations,
        active_users: users,
        hives,
        open_critical_alerts: alerts,
        batches,
        flagged_batches: flaggedBatches,
        recorded_harvest_weight_kg: production._sum.weightKg ?? 0,
      },
      assessment_distribution: Object.fromEntries(assessmentGroups.map((group) => [group.status, group._count._all])),
      recent_events: recentEvents,
    });
  } catch (error) { next(error); }
}

async function organizations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = pagingSchema.parse(req.query);
    const where = query.search ? { OR: [{ name: { contains: query.search, mode: 'insensitive' as const } }, { organizationId: { contains: query.search, mode: 'insensitive' as const } }] } : {};
    const [items, total] = await Promise.all([
      prisma.organization.findMany({ where, orderBy: { name: 'asc' }, skip: (query.page - 1) * query.limit, take: query.limit, include: { _count: { select: { users: true } } } }),
      prisma.organization.count({ where }),
    ]);
    res.json({ organizations: items, total, page: query.page });
  } catch (error) { next(error); }
}

async function createOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = organizationSchema.parse(req.body);
    const organization = await prisma.organization.create({
      data: { organizationId: body.organization_id, name: body.name, type: body.type, mspId: body.msp_id, jurisdiction: body.jurisdiction as any },
    });
    await recordAudit({ req, action: 'ORGANIZATION_CREATED', entityType: 'Organization', entityId: organization.id, after: organization });
    res.status(201).json({ organization });
  } catch (error) { next(error); }
}

async function updateOrganization(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = organizationPatchSchema.parse(req.body);
    const before = await prisma.organization.findUnique({ where: { id: req.params.id } });
    if (!before) { res.status(404).json({ error: 'Organization not found' }); return; }
    const organization = await prisma.organization.update({
      where: { id: before.id },
      data: {
        organizationId: body.organization_id,
        name: body.name,
        type: body.type,
        mspId: body.msp_id,
        jurisdiction: body.jurisdiction as any,
        status: body.status,
      },
    });
    await recordAudit({ req, action: 'ORGANIZATION_UPDATED', entityType: 'Organization', entityId: organization.id, before, after: organization });
    res.json({ organization });
  } catch (error) { next(error); }
}

async function users(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = userQuerySchema.parse(req.query);
    const where: Prisma.UserWhereInput = {
      role: query.role ?? (query.operator_only === 'true' ? { in: [...privilegedRoles] } : undefined),
      status: query.status,
      organizationId: query.organization_id ?? query.organization,
      OR: query.search ? [{ name: { contains: query.search, mode: 'insensitive' } }, { email: { contains: query.search, mode: 'insensitive' } }] : undefined,
    };
    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.limit, take: query.limit, select: { id: true, name: true, email: true, phone: true, role: true, status: true, organizationId: true, lastLoginAt: true, createdAt: true, organization: { select: { name: true, organizationId: true } }, _count: { select: { hives: true } } } }),
      prisma.user.count({ where }),
    ]);
    res.json({ users: items, total, page: query.page });
  } catch (error) { next(error); }
}

async function beekeepers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = beekeeperQuerySchema.parse(req.query);
    const where: Prisma.UserWhereInput = {
      role: 'BEEKEEPER',
      status: query.status,
      organizationId: query.organization_id ?? query.organization,
      OR: query.search ? [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { apiaryName: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ] : undefined,
    };
    const select = {
      id: true, name: true, email: true, phone: true, status: true, organizationId: true,
      apiaryName: true, location: true, gpsLat: true, gpsLng: true, lastLoginAt: true, createdAt: true,
      organization: { select: { name: true, organizationId: true } },
      _count: { select: { hives: true } },
    } satisfies Prisma.UserSelect;
    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, select, orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.limit, take: query.limit }),
      prisma.user.count({ where }),
    ]);
    res.json({ beekeepers: items, total, page: query.page });
  } catch (error) { next(error); }
}

async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = userSchema.parse(req.body);
    let organizationId: string | null = null;

    if (body.role in roleOrganizationTypes) {
      if (!body.organization_id) {
        // Auto-assign the first active, compatible organization so the admin
        // UI does not need to know internal organization/MSP details.
        const autoOrg = await prisma.organization.findFirst({
          where: { status: 'ACTIVE', type: roleOrganizationTypes[body.role as (typeof privilegedRoles)[number]] },
          orderBy: { name: 'asc' },
        });
        if (!autoOrg) {
          res.status(400).json({ error: `No active ${roleOrganizationTypes[body.role as (typeof privilegedRoles)[number]]} organization is available to assign` });
          return;
        }
        organizationId = autoOrg.id;
      } else {
        const organizationResult = await activeCompatibleOrganization(body.organization_id, body.role);
        if ('error' in organizationResult) { res.status(400).json({ error: organizationResult.error }); return; }
        organizationId = organizationResult.organization.id;
      }
    } else if (body.organization_id) {
      const organization = await prisma.organization.findUnique({ where: { id: body.organization_id } });
      if (!organization || organization.status !== 'ACTIVE') {
        res.status(400).json({ error: 'Active organization not found' });
        return;
      }
      organizationId = organization.id;
    }

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        passwordHash: await bcrypt.hash(body.password, config.BCRYPT_ROUNDS),
        role: body.role,
        organizationId,
        fabricUserID: fabricUserForRole(body.role),
        operatorId: generateOperatorId(body.role),
      },
      select: { id: true, name: true, email: true, role: true, status: true, organizationId: true },
    });
    await recordAudit({ req, action: 'USER_PROVISIONED', entityType: 'User', entityId: user.id, after: user });
    res.status(201).json({ user });
  } catch (error) { next(error); }
}

async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = userPatchSchema.parse(req.body);
    const before = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!before) { res.status(404).json({ error: 'User not found' }); return; }
    if (before.id === req.user!.userId && (body.status === 'DISABLED' || (body.role && body.role !== 'ADMIN'))) {
      res.status(409).json({ error: 'An administrator cannot disable or demote their own account' });
      return;
    }
    const effectiveRole = (body.role ?? before.role) as Role;
    const effectiveOrganizationId = body.organization_id === undefined ? before.organizationId : body.organization_id;
    if (effectiveRole in roleOrganizationTypes) {
      if (!effectiveOrganizationId) {
        res.status(400).json({ error: `${effectiveRole} requires an organization` });
        return;
      }
      const organizationResult = await activeCompatibleOrganization(effectiveOrganizationId, effectiveRole);
      if ('error' in organizationResult) { res.status(400).json({ error: organizationResult.error }); return; }
    } else if (body.organization_id) {
      const organization = await prisma.organization.findUnique({ where: { id: body.organization_id } });
      if (!organization || organization.status !== 'ACTIVE') { res.status(400).json({ error: 'Active organization not found' }); return; }
    }
    const removesActiveAdmin = before.role === 'ADMIN' && before.status === 'ACTIVE'
      && (effectiveRole !== 'ADMIN' || body.status === 'DISABLED');
    if (removesActiveAdmin && await prisma.user.count({ where: { role: 'ADMIN', status: 'ACTIVE', organization: { status: 'ACTIVE' } } }) <= 1) {
      res.status(409).json({ error: 'The last active administrator cannot be disabled or demoted' });
      return;
    }
    const user = await prisma.user.update({
      where: { id: before.id },
      data: {
        role: body.role,
        status: body.status,
        organizationId: body.organization_id,
        fabricUserID: body.role ? fabricUserForRole(body.role) : undefined,
        operatorId: body.role && body.role !== before.role ? generateOperatorId(body.role) : undefined,
      },
      select: { id: true, name: true, email: true, role: true, status: true, organizationId: true },
    });
    await recordAudit({ req, action: 'USER_UPDATED', entityType: 'User', entityId: user.id, before: { role: before.role, status: before.status, organizationId: before.organizationId }, after: user });
    res.json({ user });
  } catch (error) { next(error); }
}

async function hives(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = pagingSchema.extend({ beekeeper_id: z.string().optional() }).parse(req.query);
    const where: Prisma.HiveWhereInput = {
      beekeeperId: query.beekeeper_id,
      OR: query.search ? [{ hiveId: { contains: query.search, mode: 'insensitive' } }, { name: { contains: query.search, mode: 'insensitive' } }] : undefined,
    };
    const [items, total] = await Promise.all([
      prisma.hive.findMany({
        where, orderBy: { registeredAt: 'desc' }, skip: (query.page - 1) * query.limit, take: query.limit,
        include: { beekeeper: { select: { id: true, name: true, email: true, organization: { select: { name: true } } } }, readings: { orderBy: { ts: 'desc' }, take: 1 }, predictions: { orderBy: { createdAt: 'desc' }, take: 1 } },
      }),
      prisma.hive.count({ where }),
    ]);
    const beekeeper = query.beekeeper_id
      ? await prisma.user.findUnique({ where: { id: query.beekeeper_id }, select: { id: true, name: true, email: true } })
      : null;
    res.json({ hives: items, total, page: query.page, beekeeper });
  } catch (error) { next(error); }
}

async function alerts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = pagingSchema.parse(req.query);
    const [items, total] = await Promise.all([
      prisma.alert.findMany({ orderBy: { ts: 'desc' }, skip: (query.page - 1) * query.limit, take: query.limit, include: { hive: { select: { name: true, hiveId: true, beekeeper: { select: { name: true } } } } } }),
      prisma.alert.count(),
    ]);
    res.json({ alerts: items, total, page: query.page });
  } catch (error) { next(error); }
}

async function updateAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = alertPatchSchema.parse(req.body);
    const before = await prisma.alert.findUnique({ where: { id: req.params.id } });
    if (!before) { res.status(404).json({ error: 'Alert not found' }); return; }
    const now = new Date();
    const alert = await prisma.alert.update({
      where: { id: before.id },
      data: body.status === 'ACKNOWLEDGED'
        ? { status: 'ACKNOWLEDGED', acknowledged: true, acknowledgedAt: now, acknowledgedBy: req.user!.userId }
        : { status: 'RESOLVED', resolvedAt: now, resolvedBy: req.user!.userId, resolutionNote: body.note, dedupeKey: null },
    });
    await recordAudit({ req, action: `ALERT_${body.status}`, entityType: 'Alert', entityId: alert.id, before, after: alert });
    res.json({ alert });
  } catch (error) { next(error); }
}

async function fabricEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = pagingSchema.extend({
      tx_id: z.string().optional(), transaction_id: z.string().optional(), tx: z.string().optional(),
      batch_id: z.string().optional(), batch: z.string().optional(),
      event_type: z.string().optional(), event: z.string().optional(),
      actor_msp: z.string().optional(), msp: z.string().optional(), status: z.string().optional(),
    }).parse(req.query);
    const where: Prisma.FabricEventWhereInput = {
      txId: query.tx_id ?? query.transaction_id ?? query.tx,
      batchId: query.batch_id ?? query.batch,
      eventType: query.event_type ?? query.event,
      actorMsp: query.actor_msp ?? query.msp,
      status: query.status,
      OR: query.search ? [
        { txId: { contains: query.search, mode: 'insensitive' } },
        { batchId: { contains: query.search, mode: 'insensitive' } },
        { eventType: { contains: query.search, mode: 'insensitive' } },
        { actorMsp: { contains: query.search, mode: 'insensitive' } },
        { status: { contains: query.search, mode: 'insensitive' } },
      ] : undefined,
    };
    const [items, total] = await Promise.all([
      prisma.fabricEvent.findMany({ where, orderBy: { indexedAt: 'desc' }, skip: (query.page - 1) * query.limit, take: query.limit }),
      prisma.fabricEvent.count({ where }),
    ]);
    const receipts = await prisma.ledgerTransaction.findMany({
      where: { txId: { in: items.map((item) => item.txId) } },
      select: { txId: true, actorId: true, actorRole: true, operation: true, validationCode: true, successful: true },
    });
    const actorIds = receipts.flatMap((receipt) => receipt.actorId ? [receipt.actorId] : []);
    const actors = actorIds.length ? await prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, name: true, email: true },
    }) : [];
    const receiptsByTx = new Map(receipts.map((receipt) => [receipt.txId, receipt]));
    const actorsByID = new Map(actors.map((actor) => [actor.id, actor]));
    const events = items.map((item) => {
      const receipt = receiptsByTx.get(item.txId);
      const actor = receipt?.actorId ? actorsByID.get(receipt.actorId) : undefined;
      return {
        ...item,
        actorId: receipt?.actorId ?? null,
        actorName: actor?.name ?? null,
        actorEmail: actor?.email ?? null,
        actorRole: receipt?.actorRole ?? null,
        operation: receipt?.operation ?? null,
        receiptValidationCode: receipt?.validationCode ?? null,
        receiptSuccessful: receipt?.successful ?? null,
      };
    });
    res.json({ events, total, page: query.page });
  } catch (error) { next(error); }
}

async function fabricEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await prisma.fabricEvent.findUnique({ where: { txId: req.params.transactionId } });
    if (!event) { res.status(404).json({ error: 'Fabric event not found' }); return; }
    const receipt = await prisma.ledgerTransaction.findUnique({ where: { txId: event.txId } });
    const actor = receipt?.actorId ? await prisma.user.findUnique({
      where: { id: receipt.actorId },
      select: { id: true, name: true, email: true, role: true },
    }) : null;
    let proof: ChainEventProof | null = null;
    let comparison: ReturnType<typeof compareFabricProof> | null = null;
    let proofError: string | null = null;
    try {
      proof = JSON.parse(await fabricService.evaluate('GetChainEvent', event.txId)) as ChainEventProof;
      comparison = compareFabricProof(event, proof);
    } catch (error) {
      proofError = error instanceof Error ? error.message : 'Unable to retrieve on-chain proof';
    }
    res.json({ event, receipt: receipt ? { ...receipt, actorName: actor?.name ?? null, actorEmail: actor?.email ?? null } : null, actor, proof, comparison, proof_error: proofError });
  } catch (error) { next(error); }
}

async function verifyFabricEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const event = await prisma.fabricEvent.findUnique({ where: { txId: req.params.transactionId } });
    if (!event) { res.status(404).json({ error: 'Fabric event not found' }); return; }
    if (!event.batchId || !event.payloadHash || !event.actorMsp || !event.status) { res.status(422).json({ error: 'Fabric event is missing fields required for verification' }); return; }
    let proof: ChainEventProof;
    try {
      proof = JSON.parse(await fabricService.evaluate('GetChainEvent', event.txId)) as ChainEventProof;
    } catch (error) {
      const missing = isMissingOnChainProof(error);
      res.status(missing ? 404 : 502).json({ error: missing ? 'On-chain proof not found' : 'Unable to retrieve on-chain proof', detail: error instanceof Error ? error.message : undefined });
      return;
    }
    const comparison = compareFabricProof(event, proof);
    const verified = proofMatches(comparison);
    const verificationStatus = verified ? 'VERIFIED' : 'MISMATCH';
    const updated = await prisma.fabricEvent.update({ where: { id: event.id }, data: { verificationStatus, verifiedAt: new Date() } });
    await recordAudit({ req, action: 'FABRIC_PROOF_VERIFIED', entityType: 'FabricEvent', entityId: event.txId, metadata: { verificationStatus, comparison } });
    res.json({ event: updated, proof, comparison, verification_status: verificationStatus });
  } catch (error) { next(error); }
}

async function fabricStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = getFabricEventIndexerStatus();
    const indexedEvents = await prisma.fabricEvent.count();
    res.json({
      ...status,
      state: !status.enabled ? 'DISABLED' : status.running ? 'RUNNING' : 'UNAVAILABLE',
      channel: config.FABRIC_CHANNEL,
      chaincode: config.FABRIC_CONTRACT,
      lastBlock: status.latestBlock,
      lastEventAt: status.lastEvent?.indexedAt ?? null,
      indexedEvents,
      error: status.lastError?.message ?? null,
    });
  } catch (error) { next(error); }
}

async function audit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = pagingSchema.parse(req.query);
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, skip: (query.page - 1) * query.limit, take: query.limit }),
      prisma.auditLog.count(),
    ]);
    res.json({ audit: items, total, page: query.page });
  } catch (error) { next(error); }
}

const admin = [requireAuth, requireRole('ADMIN')];

/**
 * Recalculate the latest assessment for every hive. Useful after seeding data
 * or after changing analytics/risk rules, so every hive's prediction and alerts
 * reflect the current rules (rather than waiting for new sensor data).
 * Optionally scoped to a single hive via ?hive_id=.
 */
async function reassessHives(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const hiveId = typeof req.query.hive_id === 'string' ? req.query.hive_id : undefined;
    const where = hiveId ? { hiveId } : {};

    const hives = await prisma.hive.findMany({
      where,
      select: { hiveId: true, readings: { orderBy: { ts: 'desc' }, take: 1, select: { ts: true } } },
    });

    let evaluated = 0;
    let skipped = 0;
    for (const hive of hives) {
      const latest = hive.readings[0];
      if (!latest) { skipped += 1; continue; }
      await evaluateHiveAt(hive.hiveId, latest.ts);
      evaluated += 1;
    }

    await recordAudit({
      req,
      action: 'HIVE_ASSESSMENTS_RECALCULATED',
      entityType: 'Hive',
      entityId: hiveId ?? 'ALL',
      metadata: { evaluated, skipped },
    });

    res.json({ evaluated, skipped, scope: hiveId ? 'single' : 'all', total_hives: hives.length });
  } catch (error) { next(error); }
}

export const adminOverview = [...admin, overview];
export const adminOrganizations = [...admin, organizations];
export const adminOrganizationCreate = [...admin, createOrganization];
export const adminOrganizationUpdate = [...admin, updateOrganization];
export const adminUsers = [...admin, users];
export const adminBeekeepers = [...admin, beekeepers];
export const adminUserCreate = [...admin, createUser];
export const adminUserUpdate = [...admin, updateUser];
export const adminHives = [...admin, hives];
export const adminAlerts = [...admin, alerts];
export const adminAlertUpdate = [...admin, updateAlert];
export const adminFabricEvents = [...admin, fabricEvents];
export const adminFabricEvent = [...admin, fabricEvent];
export const adminFabricEventVerify = [...admin, verifyFabricEvent];
export const adminFabricStatus = [...admin, fabricStatus];
export const adminAudit = [...admin, audit];
export const adminReassessHives = [...admin, reassessHives];
