import { disconnectPrisma, prisma } from '../db/prisma.js';
import { evaluateHiveAt } from '../services/hiveAnalytics.js';
import { pathToFileURL } from 'node:url';

export async function runAnalyticsWorker(): Promise<number> {
  const hives = await prisma.hive.findMany({
    select: { hiveId: true, readings: { orderBy: { ts: 'desc' }, take: 1, select: { ts: true } } },
  });
  let evaluated = 0;
  for (const hive of hives) {
    const latest = hive.readings[0];
    if (!latest) continue;
    await evaluateHiveAt(hive.hiveId, latest.ts);
    evaluated += 1;
  }
  return evaluated;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runAnalyticsWorker()
    .then((count) => console.log(`Evaluated ${count} hive telemetry windows.`))
    .catch((error) => { console.error(error); process.exitCode = 1; })
    .finally(disconnectPrisma);
}
