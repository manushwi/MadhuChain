// Backfill a unique per-operator traceability id (operatorId) onto existing
// users. Safe to run repeatedly: users that already have an operatorId are left
// untouched, and collisions are retried with a fresh suffix.
//
//   npm run operators:backfill
//
import { randomBytes } from 'node:crypto';
import { prisma, disconnectPrisma } from '../src/db/prisma.js';

function randomSuffix(len = 8): string {
  return randomBytes(12)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, len);
}

function candidateId(role: string): string {
  const prefix = role.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${prefix}_${randomSuffix(8)}`;
}

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, role: true, operatorId: true } });
  let updated = 0;
  for (const user of users) {
    if (user.operatorId) continue;
    let operatorId = candidateId(user.role);
    // Retry on the (globally unique) constraint.
    for (let attempt = 0; attempt < 5; attempt++) {
      const taken = await prisma.user.findUnique({ where: { operatorId } });
      if (taken) { operatorId = candidateId(user.role); continue; }
      break;
    }
    await prisma.user.update({ where: { id: user.id }, data: { operatorId } });
    updated++;
    console.log(`${user.role} ${user.id} -> ${operatorId}`);
  }
  console.log(`Done. Backfilled operatorId for ${updated} user(s).`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(disconnectPrisma);
