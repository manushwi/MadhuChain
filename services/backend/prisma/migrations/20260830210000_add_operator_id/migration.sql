-- AlterTable: add optional unique per-operator traceability id.
-- Existing rows are NULL and do not violate the unique constraint.
ALTER TABLE "User" ADD COLUMN     "operatorId" TEXT;
CREATE UNIQUE INDEX "User_operatorId_key" ON "User"("operatorId");
