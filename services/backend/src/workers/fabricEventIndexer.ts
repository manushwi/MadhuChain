import { config } from '../config.js';
import { prisma } from '../db/prisma.js';
import { fabricService } from '../services/fabric/fabricService.js';

let stopped = true;
let running = false;
let activeEvents: { close(): void } | null = null;
let latestBlock: string | null = null;
let lastEvent: { transactionId: string; eventName: string; indexedAt: string } | null = null;
let lastError: { message: string; occurredAt: string } | null = null;

export interface FabricEventIndexerStatus {
  enabled: boolean;
  running: boolean;
  latestBlock: string | null;
  lastEvent: { transactionId: string; eventName: string; indexedAt: string } | null;
  lastError: { message: string; occurredAt: string } | null;
}

export function getFabricEventIndexerStatus(): FabricEventIndexerStatus {
  return {
    enabled: config.FABRIC_ENABLED && config.FABRIC_EVENT_INDEXER_ENABLED,
    running,
    latestBlock,
    lastEvent,
    lastError,
  };
}

export function startFabricEventIndexer(): void {
  if (!config.FABRIC_ENABLED || !config.FABRIC_EVENT_INDEXER_ENABLED || running) return;
  stopped = false;
  running = true;
  lastError = null;
  void runLoop();
}

export function stopFabricEventIndexer(): void {
  stopped = true;
  activeEvents?.close();
  activeEvents = null;
  running = false;
}

async function runLoop(): Promise<void> {
  while (!stopped) {
    try {
      await reconcileMissingReceipts();
      const startBlock = await nextBlock();
      const events = await fabricService.chaincodeEvents(startBlock);
      activeEvents = events;
      lastError = null;
      try {
        for await (const event of events) {
          if (stopped) break;
          await indexEvent(event);
        }
      } finally {
        events.close();
        activeEvents = null;
      }
    } catch (error) {
      if (!stopped) {
        lastError = {
          message: error instanceof Error ? error.message : String(error),
          occurredAt: new Date().toISOString(),
        };
        console.error('[fabric-indexer] event stream failed; retrying', error);
        await delay(3000);
      }
    }
  }
  running = false;
}

async function nextBlock(): Promise<bigint | undefined> {
  const [checkpoint, latest] = await Promise.all([
    prisma.fabricIndexerCheckpoint.findUnique({ where: { id: checkpointID() } }),
    prisma.fabricEvent.findFirst({
      orderBy: { indexedAt: 'desc' },
      select: { blockNumber: true, txId: true, eventType: true, indexedAt: true },
    }),
  ]);
  if (latest) {
    latestBlock = latest.blockNumber;
    lastEvent = {
      transactionId: latest.txId,
      eventName: latest.eventType,
      indexedAt: latest.indexedAt.toISOString(),
    };
  }
  if (checkpoint) {
    latestBlock = checkpoint.lastBlock;
    // Replay the last block after reconnect so a crash between two events in
    // the same block cannot skip the later event. Upserts make this safe.
    return BigInt(checkpoint.lastBlock);
  }
  const configured = config.FABRIC_EVENT_START_BLOCK;
  if (configured != null) return BigInt(configured);
  return latest?.blockNumber == null ? undefined : BigInt(latest.blockNumber);
}

async function indexEvent(event: {
  blockNumber: bigint;
  transactionId: string;
  chaincodeName: string;
  eventName: string;
  payload: Uint8Array;
}): Promise<void> {
  const raw = Buffer.from(event.payload).toString('utf8');
  let payload: Record<string, unknown> = {};
  try {
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    payload = { raw };
  }
  const observedAt = typeof payload.timestamp === 'string' && Number.isFinite(Date.parse(payload.timestamp))
    ? new Date(payload.timestamp)
    : null;
  await prisma.$transaction(async (tx) => {
    const receipt = await tx.ledgerTransaction.findUnique({ where: { txId: event.transactionId } });
    const eventData = {
      channel: config.FABRIC_CHANNEL,
      chaincode: event.chaincodeName,
      eventType: event.eventName,
      batchId: typeof payload.batchId === 'string' ? payload.batchId : null,
      blockNumber: event.blockNumber.toString(),
      actorMsp: typeof payload.actorMsp === 'string' ? payload.actorMsp : null,
      payloadHash: typeof payload.payloadHash === 'string' ? payload.payloadHash : null,
      status: typeof payload.status === 'string' ? payload.status : null,
      validationCode: receipt?.validationCode,
      payload: payload as any,
      observedAt,
    };
    await tx.fabricEvent.upsert({
      where: { txId: event.transactionId },
      update: eventData,
      create: { txId: event.transactionId, ...eventData },
    });
    if (typeof payload.batchId === 'string' && typeof payload.status === 'string') {
      await tx.batch.updateMany({
        where: { batchId: payload.batchId },
        data: {
          state: payload.status,
          flagged: payload.status === 'FLAGGED',
          flagResolution: payload.status === 'REVOKED' ? 'REJECTED' : undefined,
        },
      });
    }
    await tx.fabricIndexerCheckpoint.upsert({
      where: { id: checkpointID() },
      update: { lastBlock: event.blockNumber.toString(), lastTransactionId: event.transactionId },
      create: {
        id: checkpointID(),
        channel: config.FABRIC_CHANNEL,
        chaincode: config.FABRIC_CONTRACT,
        lastBlock: event.blockNumber.toString(),
        lastTransactionId: event.transactionId,
      },
    });
  });
  latestBlock = event.blockNumber.toString();
  lastEvent = {
    transactionId: event.transactionId,
    eventName: event.eventName,
    indexedAt: new Date().toISOString(),
  };
  void reconcileReceipt(event.transactionId);
}

async function reconcileMissingReceipts(): Promise<void> {
  const events = await prisma.fabricEvent.findMany({
    where: { validationCode: null },
    select: { txId: true },
    take: 100,
  });
  if (!events.length) return;
  const receipts = await prisma.ledgerTransaction.findMany({
    where: { txId: { in: events.map((event) => event.txId) } },
    select: { txId: true, validationCode: true },
  });
  if (!receipts.length) return;
  await prisma.$transaction(receipts.map((receipt) => prisma.fabricEvent.updateMany({
    where: { txId: receipt.txId, validationCode: null },
    data: { validationCode: receipt.validationCode },
  })));
}

async function reconcileReceipt(transactionId: string): Promise<void> {
  for (let attempt = 0; attempt < 5 && !stopped; attempt += 1) {
    await delay(1000);
    const receipt = await prisma.ledgerTransaction.findUnique({ where: { txId: transactionId } });
    if (!receipt) continue;
    await prisma.fabricEvent.updateMany({
      where: { txId: transactionId, validationCode: null },
      data: { validationCode: receipt.validationCode },
    });
    return;
  }
}

function checkpointID(): string {
  return `${config.FABRIC_CHANNEL}:${config.FABRIC_CONTRACT}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
