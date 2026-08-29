import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Demo beekeeper
  const pw = await bcrypt.hash('honeychain123', 10);
  const beekeeper = await prisma.user.upsert({
    where: { email: 'amara@honeychain.app' },
    update: {},
    create: {
      name: 'Amara',
      email: 'amara@honeychain.app',
      passwordHash: pw,
      role: 'BEEKEEPER',
      apiaryName: 'Amara Apiary',
      location: 'Kerala, IN',
      gpsLat: 10.8505,
      gpsLng: 76.2711,
      fabricUserID: 'beekeeper',
    },
  });

  // Demo hives with sensor node ids
  const hives = [
    { hiveId: 'H-001', sensorNodeId: 'node-h001', location: 'Apiary north', gpsLat: 10.851, gpsLng: 76.272 },
    { hiveId: 'H-002', sensorNodeId: 'node-h002', location: 'Apiary south', gpsLat: 10.849, gpsLng: 76.270 },
  ];
  for (const h of hives) {
    await prisma.hive.upsert({
      where: { hiveId: h.hiveId },
      update: { beekeeperId: beekeeper.id },
      create: { ...h, beekeeperId: beekeeper.id },
    });
  }

  // A few sample sensor readings
  await prisma.sensorReading.createMany({
    data: [
      { hiveId: 'H-001', ts: new Date('2026-08-28T06:00:00Z'), tempIn: 34.8, humIn: 58, weightKg: 42.3, tempOut: 27.1, batteryV: 3.7 },
      { hiveId: 'H-001', ts: new Date('2026-08-28T09:00:00Z'), tempIn: 35.1, humIn: 57, weightKg: 42.5, tempOut: 28.0, batteryV: 3.7 },
      { hiveId: 'H-002', ts: new Date('2026-08-28T06:00:00Z'), tempIn: 34.6, humIn: 60, weightKg: 38.9, tempOut: 26.8, batteryV: 3.6 },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
