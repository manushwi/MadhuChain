CREATE TABLE "FabricIndexerCheckpoint" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "chaincode" TEXT NOT NULL,
    "lastBlock" TEXT NOT NULL,
    "lastTransactionId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FabricIndexerCheckpoint_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FabricIndexerCheckpoint_channel_chaincode_key"
ON "FabricIndexerCheckpoint"("channel", "chaincode");
