import crypto from 'node:crypto';

export interface SensorRow {
  hiveId: string;
  ts: Date | string;
  tempIn?: number | null;
  humIn?: number | null;
  weightKg?: number | null;
  tempOut?: number | null;
  batteryV?: number | null;
}

/**
 * Compute a canonical SHA-256 over the aggregated sensor dataset for a harvest
 * period. Only this hash is anchored on-chain; the raw time-series stays in
 * TimescaleDB (off-chain truth).
 */
export function sensorDataHash(rows: SensorRow[]): string {
  const canonical = rows
    .map((r) =>
      JSON.stringify({
        hiveId: r.hiveId,
        ts: new Date(r.ts).toISOString(),
        tempIn: r.tempIn ?? null,
        humIn: r.humIn ?? null,
        weightKg: r.weightKg ?? null,
        tempOut: r.tempOut ?? null,
        batteryV: r.batteryV ?? null,
      }),
    )
    .sort()
    .join('\n');

  return crypto.createHash('sha256').update(canonical).digest('hex');
}
