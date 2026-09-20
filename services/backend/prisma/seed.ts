import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Seeds the infrastructure organizations required for Fabric MSP
// authorization. No demo beekeepers, hives, or sensor data are created.
// Optionally provisions an administrator when ADMIN_SEED_PASSWORD is set.
async function main() {
  const orgs = [
    { organizationId: 'KVIC', name: 'Khadi and Village Industries Commission', type: 'KVIC' as const, mspId: 'Org1MSP' },
    { organizationId: 'FACTORY-MVP', name: 'MadhuChain Collection and Factory', type: 'FACTORY' as const, mspId: 'Org2MSP' },
    { organizationId: 'LAB-MVP', name: 'MadhuChain Certified Lab', type: 'LAB' as const, mspId: 'Org3MSP' },
  ];

  for (const org of orgs) {
    await prisma.organization.upsert({
      where: { organizationId: org.organizationId },
      update: { mspId: org.mspId, status: 'ACTIVE' },
      create: { ...org, status: 'ACTIVE' },
    });
    console.log(`✅ organization ${org.organizationId} (${org.mspId}) ready`);
  }

  const kvic = await prisma.organization.findUnique({ where: { organizationId: 'KVIC' } });

  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (adminPassword && kvic) {
    const adminEmail = process.env.ADMIN_SEED_EMAIL ?? 'admin@madhuchain.local';
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { organizationId: kvic.id, role: 'ADMIN', status: 'ACTIVE' },
      create: {
        name: 'KVIC Administrator',
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 10),
        role: 'ADMIN',
        status: 'ACTIVE',
        organizationId: kvic.id,
        fabricUserID: 'admin',
      },
    });
    console.log(`✅ administrator ${adminEmail} ready`);
  } else {
    console.log('ℹ️  ADMIN_SEED_PASSWORD not set — no admin seeded. Use the admin-register flow.');
  }

  console.log('✅ Seed complete (infrastructure only)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
