import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../src/db/prisma.js';
import { requireAuth, signToken } from '../src/middleware/auth.js';
import { requireRole } from '../src/middleware/roleGuard.js';
import { signupSchema } from '../src/routes/auth.js';
import { compareFabricProof, isRoleOrganizationCompatible } from '../src/routes/admin.js';

describe('public registration roles', () => {
  const base = { name: 'Test User', email: 'test@example.com', password: 'password123' };

  test('allows consumer and beekeeper registration', () => {
    assert.equal(signupSchema.safeParse({ ...base, role: 'CONSUMER' }).success, true);
    assert.equal(signupSchema.safeParse({ ...base, role: 'BEEKEEPER' }).success, true);
  });

  test('rejects privileged operational roles', () => {
    for (const role of ['TRANSPORTER', 'LABTECH', 'FACTORYWORKER', 'QCMANAGER', 'DISTRIBUTOR', 'ADMIN']) {
      assert.equal(signupSchema.safeParse({ ...base, role }).success, false);
    }
  });
});

describe('admin operator constraints', () => {
  test('enforces role to organization type compatibility', () => {
    assert.equal(isRoleOrganizationCompatible('FACTORYWORKER', 'FACTORY'), true);
    assert.equal(isRoleOrganizationCompatible('TRANSPORTER', 'FACTORY'), true);
    assert.equal(isRoleOrganizationCompatible('LABTECH', 'LAB'), true);
    assert.equal(isRoleOrganizationCompatible('QCMANAGER', 'KVIC'), true);
    assert.equal(isRoleOrganizationCompatible('ADMIN', 'KVIC'), true);
    assert.equal(isRoleOrganizationCompatible('DISTRIBUTOR', 'DISTRIBUTOR'), true);
    assert.equal(isRoleOrganizationCompatible('ADMIN', 'FACTORY'), false);
    assert.equal(isRoleOrganizationCompatible('LABTECH', 'KVIC'), false);
  });

  test('compares every immutable Fabric proof field', () => {
    const event = { txId: 'tx-1', batchId: 'batch-1', payloadHash: 'hash', eventType: 'Harvested', actorMsp: 'Org1MSP', status: 'HARVESTED' };
    const comparison = compareFabricProof(event, { transactionId: 'tx-1', batchId: 'batch-1', payloadHash: 'hash', eventType: 'Harvested', actorMsp: 'Org1MSP', status: 'FLAGGED' });
    assert.equal(comparison.transactionId.matches, true);
    assert.equal(comparison.status.matches, false);
    assert.deepEqual(Object.keys(comparison), ['transactionId', 'batchId', 'payloadHash', 'eventType', 'actorMsp', 'status']);
  });
});

describe('role guard', () => {
  test('allows an explicitly permitted role', () => {
    const req = { user: { userId: 'u1', role: 'LABTECH' } } as Request;
    let error: unknown = Symbol('not-called');
    requireRole('LABTECH')(req, {} as Response, ((nextError?: unknown) => { error = nextError; }) as NextFunction);
    assert.equal(error, undefined);
  });

  test('rejects missing and unauthorized roles', () => {
    for (const req of [
      {} as Request,
      { user: { userId: 'u1', role: 'CONSUMER' } } as Request,
    ]) {
      let error: any;
      requireRole('FACTORYWORKER')(req, {} as Response, ((nextError?: unknown) => { error = nextError; }) as NextFunction);
      assert.ok(error instanceof Error);
      assert.equal(error.status, req.user ? 403 : 401);
    }
  });
});

describe('authenticated user revocation', () => {
  test('uses current database role and rejects disabled or suspended accounts', async () => {
    const originalFindUnique = prisma.user.findUnique;
    const token = signToken({ sub: 'u1', role: 'CONSUMER' });
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    try {
      (prisma.user as any).findUnique = async () => ({ id: 'u1', role: 'ADMIN', status: 'ACTIVE', fabricUserID: 'admin', organization: { status: 'ACTIVE' } });
      let error: unknown = Symbol('not-called');
      await requireAuth(req, {} as Response, ((nextError?: unknown) => { error = nextError; }) as NextFunction);
      assert.equal(error, undefined);
      assert.equal(req.user?.role, 'ADMIN');

      for (const currentUser of [
        { id: 'u1', role: 'ADMIN', status: 'DISABLED', fabricUserID: null, organization: { status: 'ACTIVE' } },
        { id: 'u1', role: 'ADMIN', status: 'ACTIVE', fabricUserID: null, organization: { status: 'SUSPENDED' } },
        null,
      ]) {
        (prisma.user as any).findUnique = async () => currentUser;
        let nextError: any;
        await requireAuth({ headers: req.headers } as Request, {} as Response, ((value?: unknown) => { nextError = value; }) as NextFunction);
        assert.ok(nextError instanceof Error);
        assert.ok(nextError.status === 401 || nextError.status === 403);
      }
    } finally {
      (prisma.user as any).findUnique = originalFindUnique;
    }
  });
});
