// Full data reset: deletes every row across the MadhuChain database, including
// administrators and the base organizations. Run ONLY when you intend to start
// from a completely empty ledger mirror.
//
//   npm run db:reset
//
// After running, reseed the infrastructure organizations with `npm run db:seed`
// and create the first administrator via the ADMIN_REGISTRATION_CODES flow (or
// set ADMIN_SEED_PASSWORD and re-run seed).
import { prisma, disconnectPrisma } from '../src/db/prisma.js';

const tables = [
  'AssessmentFeedback',
  'ModelPrediction',
  'FeatureWindow',
  'Alert',
  'SensorReading',
  'AppearanceReport',
  'Review',
  'BlendComposition',
  'ProcessingAction',
  'QualityTest',
  'JarSerial',
  'OwnershipTransfer',
  'BatchHive',
  'CollectionRecord',
  'LedgerTransaction',
  'FabricEvent',
  'FabricIndexerCheckpoint',
  'AuditLog',
  'Batch',
  'Lot',
  'Supplier',
  'Profile',
  'Hive',
  'User',
  'Organization',
];

async function main() {
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
      console.log(`truncated ${table}`);
    } catch (error: any) {
      console.log(`skipped ${table}: ${error.message}`);
    }
  }
  console.log('Data reset complete.');
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(disconnectPrisma);
