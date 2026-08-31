/**
 * Mock sensor gateway simulator.
 *
 * Streams realistic hive sensor readings into the REAL backend ingestion path
 * (POST /api/sensor-data with x-device-key) so the beekeeper app shows live
 * hive status/charts without IoT hardware.
 *
 * Fully dynamic: every few ticks it re-discovers ALL registered hives in the
 * DB and streams to each one, so a beekeeper who registers a new hive (any
 * user) starts getting live data automatically — no restart needed. When a
 * hive is discovered for the first time a short recent-history backfill (~2h)
 * is posted so the "day" chart is populated immediately.
 *
 * Optional controls (default = stream everything, healthy values):
 *   SENSOR_HIVES='H-001,HM-001'  # restrict to only these hive ids
 *   SENSOR_INTERVAL_MS=3000 bun run sim:sensors
 *   SENSOR_DEMO_EVENTS=1 bun run sim:sensors   # also inject low-battery + theft events
 *   SENSOR_VERBOSE=1 bun run sim:sensors       # print each posted payload
 *   SENSOR_OVERRIDES='H-002:temp_in=46;hum_in=12;weight_kg=30;battery_v=3.0' \
 *     bun run sim:sensors                       # force bad values (WATCH/ALERT demo)
 */
import { config } from '../src/config.js';
import { prisma } from '../src/db/prisma.js';

const BASE_URL = `http://${config.HOST === '0.0.0.0' ? 'localhost' : config.HOST}:${config.PORT}`;
const EXPLICIT_HIVES = (process.env.SENSOR_HIVES ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const INTERVAL_MS = Number(process.env.SENSOR_INTERVAL_MS ?? 4_000);
const DEMO_EVENTS = (process.env.SENSOR_DEMO_EVENTS ?? '0') === '1';
const VERBOSE = (process.env.SENSOR_VERBOSE ?? '0') === '1';
const DRIFT = (n: number) => n + (Math.random() - 0.5) * n * 0.002;
const DISCOVERY_EVERY_TICKS = 8;

// SENSOR_OVERRIDES => { hiveId: { field: number } }, e.g. "H-002:temp_in=46;hum_in=12"
const OVERRIDES: Record<string, Record<string, number>> = (() => {
  const out: Record<string, Record<string, number>> = {};
  for (const part of (process.env.SENSOR_OVERRIDES ?? '').split(',').filter(Boolean)) {
    const colon = part.indexOf(':');
    if (colon <= 0) continue;
    const hiveId = part.slice(0, colon).trim();
    const map = (out[hiveId] ??= {});
    for (const pair of part.slice(colon + 1).split(';')) {
      const eq = pair.indexOf('=');
      if (eq <= 0) continue;
      const key = pair.slice(0, eq).trim();
      const value = Number(pair.slice(eq + 1));
      if (key && !Number.isNaN(value)) map[key] = value;
    }
  }
  return out;
})();

type OverrideOpts = Partial<{ batteryV: number; weightKg: number; tempIn: number; humIn: number }>;

// Deterministic per-hive weight baseline (~38–45kg) so hives aren't identical.
function weightBase(hiveId: string): number {
  let seed = 0;
  for (const ch of hiveId) seed = (seed * 31 + (ch.codePointAt(0) ?? 0)) % 997;
  return 41.5 + (seed % 35) / 10 - 1.7;
}

function readingFor(hiveId: string, opts: OverrideOpts = {}) {
  const weightKg = opts.weightKg ?? DRIFT(weightBase(hiveId));
  const reading: {
    hive_id: string;
    ts: string;
    temp_in: number;
    hum_in: number;
    weight_kg: number;
    temp_out: number;
    battery_v: number;
  } = {
    hive_id: hiveId,
    ts: new Date().toISOString(),
    temp_in: opts.tempIn ?? Math.round(DRIFT(34.2) * 10) / 10,
    hum_in: opts.humIn ?? Math.round(DRIFT(60) * 10) / 10,
    weight_kg: Math.round(weightKg * 100) / 100,
    temp_out: Math.round(DRIFT(27) * 10) / 10,
    battery_v: opts.batteryV ?? Math.round(DRIFT(3.95) * 100) / 100,
  };
  // Force a fixed "bad for bees" value for the given hive (SENSOR_OVERRIDES).
  const overrides = OVERRIDES[hiveId];
  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      if (key in reading) (reading as Record<string, number>)[key] = value;
    }
  }
  return [reading];
}

async function postReadings(rows: unknown[]): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/api/sensor-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-device-key': config.DEVICE_API_KEY,
      },
      body: JSON.stringify(rows),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`[mock-sensors] ${res.status}: ${text}`);
      return;
    }
    if (VERBOSE) console.log(`[mock-sensors] payload: ${JSON.stringify(rows)}`);
    console.log(
      `[mock-sensors] ${new Date().toISOString()} ${rows.length} reading(s) -> ${res.status} (${text})`,
    );
  } catch (e) {
    console.error(`[mock-sensors] request failed: ${(e as Error).message}`);
  }
}

/** ~2 hours of 15-minute points so a freshly discovered hive's chart isn't empty. */
async function backfillHive(hiveId: string): Promise<void> {
  const rows: unknown[] = [];
  for (let i = 8; i >= 1; i--) {
    rows.push({
      ...readingFor(hiveId)[0],
      ts: new Date(Date.now() - i * 15 * 60_000).toISOString(),
    });
  }
  await postReadings(rows);
}

const hiveIds: string[] = [];
const known = new Set<string>();

function discovered(): string[] {
  return EXPLICIT_HIVES.length ? EXPLICIT_HIVES.filter((id) => known.has(id)) : [...hiveIds];
}

/** Refresh the hive list from the DB; backfill anything new (any user, any time). */
async function discover(): Promise<void> {
  const all = await prisma.hive.findMany({ select: { hiveId: true } });
  let fresh = all.map((h) => h.hiveId);
  if (EXPLICIT_HIVES.length) fresh = fresh.filter((id) => EXPLICIT_HIVES.includes(id));

  for (const id of fresh) {
    if (known.has(id)) continue;
    known.add(id);
    hiveIds.push(id);
    console.log(`[mock-sensors] discovered hive ${id} (backfilling ~2h)`);
    try {
      await backfillHive(id);
    } catch (e) {
      console.error(`[mock-sensors] backfill failed for ${id}: ${(e as Error).message}`);
    }
  }
}

async function run(): Promise<void> {
  console.log(
    EXPLICIT_HIVES.length
      ? `[mock-sensors] streaming restricted to: ${EXPLICIT_HIVES.join(', ')}`
      : '[mock-sensors] dynamic mode: streaming every registered hive (auto-discover)',
  );
  console.log(`[mock-sensors] endpoint: ${BASE_URL}/api/sensor-data (interval ${INTERVAL_MS}ms, demo events=${DEMO_EVENTS})`);

  await discover();

  let tick = 0;
  setInterval(async () => {
    tick += 1;
    if (tick % DISCOVERY_EVERY_TICKS === 0) {
      try {
        await discover();
      } catch (e) {
        console.error(`[mock-sensors] discover failed: ${(e as Error).message}`);
      }
    }

    const ids = discovered();
    if (ids.length === 0) return;

    const rows: unknown[] = [];
    for (const hiveId of ids) {
      if (DEMO_EVENTS && tick === 5) {
        // Low battery event on the first hive -> LOW_BATTERY alert.
        rows.push(...readingFor(hiveId, { batteryV: 3.1 }));
      } else if (DEMO_EVENTS && tick === 12 && hiveId === ids[1]) {
        // Sharp weight drop on the second hive -> THEFT alert.
        rows.push(...readingFor(hiveId, { weightKg: 32 }));
      } else {
        rows.push(...readingFor(hiveId));
      }
    }
    await postReadings(rows);
  }, INTERVAL_MS);
}

run().catch((e) => {
  console.error(`[mock-sensors] fatal: ${(e as Error).message}`);
  process.exit(1);
});