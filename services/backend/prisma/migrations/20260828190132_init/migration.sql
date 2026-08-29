-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BEEKEEPER', 'TRANSPORTER', 'LABTECH', 'FACTORYWORKER', 'QCMANAGER', 'DISTRIBUTOR', 'ADMIN', 'CONSUMER');

-- CreateEnum
CREATE TYPE "SupplierType" AS ENUM ('PLATFORM', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "TestStage" AS ENUM ('INTAKE', 'OUTPUT', 'FINAL');

-- CreateEnum
CREATE TYPE "TestResult" AS ENUM ('PASS', 'FLAGGED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "apiaryName" TEXT,
    "location" TEXT,
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "fabricUserID" TEXT,
    "encryptedKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "notificationPrefs" JSONB,
    "appLanguage" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hive" (
    "id" TEXT NOT NULL,
    "hiveId" TEXT NOT NULL,
    "beekeeperId" TEXT,
    "sensorNodeId" TEXT,
    "location" TEXT,
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SensorReading" (
    "hiveId" TEXT NOT NULL,
    "ts" TIMESTAMPTZ(6) NOT NULL,
    "tempIn" DOUBLE PRECISION,
    "humIn" DOUBLE PRECISION,
    "weightKg" DOUBLE PRECISION,
    "tempOut" DOUBLE PRECISION,
    "batteryV" DOUBLE PRECISION,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("hiveId","ts")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SupplierType" NOT NULL,
    "contactInfo" TEXT,
    "trustTier" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "batchId" TEXT,
    "supplierId" TEXT,
    "supplierType" "SupplierType" NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "declaredOrigin" TEXT,
    "intakeTestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "lotId" TEXT,
    "beekeeperId" TEXT,
    "state" TEXT NOT NULL DEFAULT 'RECEIVED',
    "harvestStart" TIMESTAMP(3),
    "harvestEnd" TIMESTAMP(3),
    "weightKg" DOUBLE PRECISION,
    "sensorDataHash" TEXT,
    "barcodePayload" JSONB,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "flagResolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchHive" (
    "batchId" TEXT NOT NULL,
    "hiveId" TEXT NOT NULL,

    CONSTRAINT "BatchHive_pkey" PRIMARY KEY ("batchId","hiveId")
);

-- CreateTable
CREATE TABLE "QualityTest" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "stage" "TestStage" NOT NULL,
    "moisture" DOUBLE PRECISION,
    "hmf" DOUBLE PRECISION,
    "diastase" DOUBLE PRECISION,
    "sugarProfile" JSONB,
    "isotopeRatio" DOUBLE PRECISION,
    "testerId" TEXT,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" "TestResult",

    CONSTRAINT "QualityTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessingAction" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "parameters" JSONB,
    "operatorId" TEXT,
    "equipmentId" TEXT,
    "weightBefore" DOUBLE PRECISION,
    "weightAfter" DOUBLE PRECISION,
    "parentLots" JSONB,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessingAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JarSerial" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "jarId" TEXT NOT NULL,
    "packagingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JarSerial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnershipTransfer" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "fromId" TEXT,
    "toId" TEXT,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnershipTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlendComposition" (
    "id" TEXT NOT NULL,
    "blendBatchId" TEXT NOT NULL,
    "sourceLotId" TEXT NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BlendComposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppearanceReport" (
    "id" TEXT NOT NULL,
    "jarId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "color" TEXT,
    "texture" TEXT,
    "offSmell" BOOLEAN NOT NULL DEFAULT false,
    "offTaste" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppearanceReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "hiveId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "message" TEXT NOT NULL,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_fabricUserID_key" ON "User"("fabricUserID");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Hive_hiveId_key" ON "Hive"("hiveId");

-- CreateIndex
CREATE INDEX "Hive_beekeeperId_idx" ON "Hive"("beekeeperId");

-- CreateIndex
CREATE INDEX "SensorReading_hiveId_ts_idx" ON "SensorReading"("hiveId", "ts" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_supplierId_key" ON "Supplier"("supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "Lot_lotId_key" ON "Lot"("lotId");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_batchId_key" ON "Batch"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_lotId_key" ON "Batch"("lotId");

-- CreateIndex
CREATE INDEX "Batch_beekeeperId_idx" ON "Batch"("beekeeperId");

-- CreateIndex
CREATE INDEX "QualityTest_batchId_idx" ON "QualityTest"("batchId");

-- CreateIndex
CREATE INDEX "ProcessingAction_batchId_idx" ON "ProcessingAction"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "JarSerial_jarId_key" ON "JarSerial"("jarId");

-- CreateIndex
CREATE INDEX "JarSerial_batchId_idx" ON "JarSerial"("batchId");

-- CreateIndex
CREATE INDEX "OwnershipTransfer_batchId_idx" ON "OwnershipTransfer"("batchId");

-- CreateIndex
CREATE INDEX "BlendComposition_blendBatchId_idx" ON "BlendComposition"("blendBatchId");

-- CreateIndex
CREATE INDEX "AppearanceReport_jarId_idx" ON "AppearanceReport"("jarId");

-- CreateIndex
CREATE INDEX "Review_batchId_idx" ON "Review"("batchId");

-- CreateIndex
CREATE INDEX "Alert_hiveId_ts_idx" ON "Alert"("hiveId", "ts");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hive" ADD CONSTRAINT "Hive_beekeeperId_fkey" FOREIGN KEY ("beekeeperId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_hiveId_fkey" FOREIGN KEY ("hiveId") REFERENCES "Hive"("hiveId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("batchId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("supplierId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_beekeeperId_fkey" FOREIGN KEY ("beekeeperId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchHive" ADD CONSTRAINT "BatchHive_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("batchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchHive" ADD CONSTRAINT "BatchHive_hiveId_fkey" FOREIGN KEY ("hiveId") REFERENCES "Hive"("hiveId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityTest" ADD CONSTRAINT "QualityTest_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("batchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessingAction" ADD CONSTRAINT "ProcessingAction_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("batchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JarSerial" ADD CONSTRAINT "JarSerial_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("batchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnershipTransfer" ADD CONSTRAINT "OwnershipTransfer_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("batchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlendComposition" ADD CONSTRAINT "BlendComposition_blendBatchId_fkey" FOREIGN KEY ("blendBatchId") REFERENCES "Batch"("batchId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlendComposition" ADD CONSTRAINT "BlendComposition_sourceLotId_fkey" FOREIGN KEY ("sourceLotId") REFERENCES "Lot"("lotId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_hiveId_fkey" FOREIGN KEY ("hiveId") REFERENCES "Hive"("hiveId") ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- TimescaleDB
-- Enable the extension and convert SensorReading into a hypertable keyed on ts.
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS timescaledb;

SELECT create_hypertable('"SensorReading"', 'ts', if_not_exists => TRUE);
