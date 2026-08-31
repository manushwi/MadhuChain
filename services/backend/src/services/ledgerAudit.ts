import { prisma } from '../db/prisma.js';
import type { FabricSubmitResult } from './fabric/fabricService.js';

export async function recordLedgerTransaction(input: {
  tx: FabricSubmitResult;
  batchId?: string;
  operation: string;
  actorId?: string;
  actorRole?: string;
}): Promise<void> {
  let result: unknown = input.tx.result || null;
  if (input.tx.result) {
    try { result = JSON.parse(input.tx.result); } catch { /* preserve text response */ }
  }

  await prisma.ledgerTransaction.upsert({
    where: { txId: input.tx.transactionId },
    update: {},
    create: {
      txId: input.tx.transactionId,
      batchId: input.batchId,
      operation: input.operation,
      actorId: input.actorId,
      actorRole: input.actorRole,
      validationCode: input.tx.validationCode,
      successful: input.tx.successful,
      result: result as any,
    },
  });
}
