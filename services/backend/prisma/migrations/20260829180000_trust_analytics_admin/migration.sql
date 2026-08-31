CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "OrganizationType" AS ENUM ('KVIC', 'FACTORY', 'LAB', 'DISTRIBUTOR', 'RETAILER', 'REGULATOR');
CREATE TYPE "OrganizationStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');
CREATE TYPE "AssessmentStatus" AS ENUM ('NO_DATA', 'STALE', 'NORMAL', 'WATCH', 'ALERT');
CREATE TYPE "DataQualityLabel" AS ENUM ('INSUFFICIENT', 'LOW', 'ADEQUATE', 'GOOD');

CREATE TABLE "Organization" (
  "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "name" TEXT NOT NULL,
  "type" "OrganizationType" NOT NULL, "mspId" TEXT,
  "status" "OrganizationStatus" NOT NULL DEFAULT 'ACTIVE', "jurisdiction" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Organization_organizationId_key" ON "Organization"("organizationId");
CREATE UNIQUE INDEX "Organization_mspId_key" ON "Organization"("mspId");

ALTER TABLE "User" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");
CREATE INDEX "User_role_status_idx" ON "User"("role", "status");
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "CollectionRecord" (
  "id" TEXT NOT NULL, "batchId" TEXT NOT NULL, "transporterId" TEXT NOT NULL,
  "weightInKg" DOUBLE PRECISION NOT NULL, "accepted" BOOLEAN NOT NULL,
  "recordHash" TEXT NOT NULL, "recordedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CollectionRecord_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CollectionRecord_batchId_createdAt_idx" ON "CollectionRecord"("batchId", "createdAt");
ALTER TABLE "CollectionRecord" ADD CONSTRAINT "CollectionRecord_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("batchId") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "FabricEvent" (
  "id" TEXT NOT NULL, "txId" TEXT NOT NULL, "channel" TEXT NOT NULL,
  "chaincode" TEXT NOT NULL, "eventType" TEXT NOT NULL, "batchId" TEXT,
  "blockNumber" TEXT, "actorMsp" TEXT, "payloadHash" TEXT, "status" TEXT,
  "validationCode" INTEGER, "payload" JSONB, "observedAt" TIMESTAMP(3),
  "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "verificationStatus" TEXT, "verifiedAt" TIMESTAMP(3),
  CONSTRAINT "FabricEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FabricEvent_txId_key" ON "FabricEvent"("txId");
CREATE INDEX "FabricEvent_batchId_indexedAt_idx" ON "FabricEvent"("batchId", "indexedAt");
CREATE INDEX "FabricEvent_eventType_indexedAt_idx" ON "FabricEvent"("eventType", "indexedAt");
CREATE INDEX "FabricEvent_actorMsp_indexedAt_idx" ON "FabricEvent"("actorMsp", "indexedAt");

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL, "actorId" TEXT, "actorRole" TEXT, "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL, "entityId" TEXT, "beforeHash" TEXT, "afterHash" TEXT,
  "ipHash" TEXT, "metadata" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

ALTER TABLE "Alert" ADD COLUMN "status" "AlertStatus" NOT NULL DEFAULT 'OPEN';
ALTER TABLE "Alert" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'LEGACY';
ALTER TABLE "Alert" ADD COLUMN "predictionId" TEXT;
ALTER TABLE "Alert" ADD COLUMN "observedAt" TIMESTAMPTZ(6);
ALTER TABLE "Alert" ADD COLUMN "acknowledgedAt" TIMESTAMP(3);
ALTER TABLE "Alert" ADD COLUMN "acknowledgedBy" TEXT;
ALTER TABLE "Alert" ADD COLUMN "resolvedAt" TIMESTAMP(3);
ALTER TABLE "Alert" ADD COLUMN "resolvedBy" TEXT;
ALTER TABLE "Alert" ADD COLUMN "resolutionNote" TEXT;
ALTER TABLE "Alert" ADD COLUMN "dedupeKey" TEXT;
CREATE UNIQUE INDEX "Alert_dedupeKey_key" ON "Alert"("dedupeKey");
CREATE INDEX "Alert_status_severity_ts_idx" ON "Alert"("status", "severity", "ts");

CREATE TABLE "FeatureWindow" (
  "id" TEXT NOT NULL, "hiveId" TEXT NOT NULL, "featureVersion" TEXT NOT NULL,
  "windowStart" TIMESTAMPTZ(6) NOT NULL, "windowEnd" TIMESTAMPTZ(6) NOT NULL,
  "latestReadingAt" TIMESTAMPTZ(6), "readingCount" INTEGER NOT NULL,
  "tempInCount" INTEGER NOT NULL, "humInCount" INTEGER NOT NULL, "weightCount" INTEGER NOT NULL,
  "tempOutCount" INTEGER NOT NULL, "batteryCount" INTEGER NOT NULL,
  "tempInLatest" DOUBLE PRECISION, "tempInMean1h" DOUBLE PRECISION, "tempInMin24h" DOUBLE PRECISION,
  "tempInMax24h" DOUBLE PRECISION, "tempInSlope1h" DOUBLE PRECISION, "tempInStddev24h" DOUBLE PRECISION,
  "humInLatest" DOUBLE PRECISION, "humInMean1h" DOUBLE PRECISION, "humInMin24h" DOUBLE PRECISION,
  "humInMax24h" DOUBLE PRECISION, "humInSlope1h" DOUBLE PRECISION, "humInStddev24h" DOUBLE PRECISION,
  "weightLatestKg" DOUBLE PRECISION, "weightDelta1hKg" DOUBLE PRECISION, "weightDelta24hKg" DOUBLE PRECISION,
  "weightDelta7dKg" DOUBLE PRECISION, "maxWeightDropPct1h" DOUBLE PRECISION,
  "tempOutLatest" DOUBLE PRECISION, "tempOutMean1h" DOUBLE PRECISION,
  "batteryLatestV" DOUBLE PRECISION, "batteryMin24hV" DOUBLE PRECISION,
  "freshnessSeconds" INTEGER, "dataQualityScore" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FeatureWindow_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FeatureWindow_hiveId_windowEnd_featureVersion_key" ON "FeatureWindow"("hiveId", "windowEnd", "featureVersion");
CREATE INDEX "FeatureWindow_hiveId_windowEnd_idx" ON "FeatureWindow"("hiveId", "windowEnd" DESC);
ALTER TABLE "FeatureWindow" ADD CONSTRAINT "FeatureWindow_hiveId_fkey" FOREIGN KEY ("hiveId") REFERENCES "Hive"("hiveId") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ModelPrediction" (
  "id" TEXT NOT NULL, "hiveId" TEXT NOT NULL, "featureWindowId" TEXT NOT NULL,
  "modelVersion" TEXT NOT NULL, "method" TEXT NOT NULL DEFAULT 'DETERMINISTIC_RULES',
  "status" "AssessmentStatus" NOT NULL, "telemetryConditionScore" INTEGER,
  "dataQualityScore" DOUBLE PRECISION NOT NULL, "dataQualityLabel" "DataQualityLabel" NOT NULL,
  "temperatureFlag" BOOLEAN NOT NULL DEFAULT false, "humidityFlag" BOOLEAN NOT NULL DEFAULT false,
  "weightDropFlag" BOOLEAN NOT NULL DEFAULT false, "batteryLowFlag" BOOLEAN NOT NULL DEFAULT false,
  "reasons" JSONB NOT NULL, "recommendations" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ModelPrediction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ModelPrediction_featureWindowId_modelVersion_key" ON "ModelPrediction"("featureWindowId", "modelVersion");
CREATE INDEX "ModelPrediction_hiveId_createdAt_idx" ON "ModelPrediction"("hiveId", "createdAt" DESC);
ALTER TABLE "ModelPrediction" ADD CONSTRAINT "ModelPrediction_hiveId_fkey" FOREIGN KEY ("hiveId") REFERENCES "Hive"("hiveId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModelPrediction" ADD CONSTRAINT "ModelPrediction_featureWindowId_fkey" FOREIGN KEY ("featureWindowId") REFERENCES "FeatureWindow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "ModelPrediction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "AssessmentFeedback" (
  "id" TEXT NOT NULL, "predictionId" TEXT NOT NULL, "actorId" TEXT NOT NULL,
  "outcome" TEXT NOT NULL, "notes" TEXT, "evidenceUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssessmentFeedback_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AssessmentFeedback_predictionId_createdAt_idx" ON "AssessmentFeedback"("predictionId", "createdAt");
ALTER TABLE "AssessmentFeedback" ADD CONSTRAINT "AssessmentFeedback_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "ModelPrediction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
