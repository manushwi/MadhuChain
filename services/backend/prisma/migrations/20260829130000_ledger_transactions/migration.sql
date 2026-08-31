CREATE TABLE "LedgerTransaction" (
    "id" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "batchId" TEXT,
    "operation" TEXT NOT NULL,
    "actorId" TEXT,
    "actorRole" TEXT,
    "validationCode" INTEGER NOT NULL,
    "successful" BOOLEAN NOT NULL,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LedgerTransaction_txId_key" ON "LedgerTransaction"("txId");
CREATE INDEX "LedgerTransaction_batchId_createdAt_idx" ON "LedgerTransaction"("batchId", "createdAt");
