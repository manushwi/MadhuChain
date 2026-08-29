import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireDevice } from '../middleware/deviceAuth.js';

const readingSchema = z.object({
  hive_id: z.string().min(1),
  ts: z.coerce.date().default(() => new Date()),
  temp_in: z.number().nullable().optional(),
  hum_in: z.number().nullable().optional(),
  weight_kg: z.number().nullable().optional(),
  temp_out: z.number().nullable().optional(),
  battery_v: z.number().nullable().optional(),
});

// Supported sane ranges (reject physically impossible values) - FR2.
const SANE = {
  tempMin: -10,
  tempMax: 60,
  humMin: 0,
  humMax: 100,
  weightMin: 0,
  weightMax: 500,
};

export async function ingest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Body may be a single reading or an array (gateway batches).
    const body = Array.isArray(req.body) ? req.body : [req.body];
    if (body.length === 0) {
      res.status(400).json({ error: 'Empty payload' });
      return;
    }

    const parsed = body.map((r) => readingSchema.parse(r));
    const rejected: unknown[] = [];

    const rows = parsed
      .filter((r) => {
        const ok =
          (r.temp_in == null || (r.temp_in >= SANE.tempMin && r.temp_in <= SANE.tempMax)) &&
          (r.hum_in == null || (r.hum_in >= SANE.humMin && r.hum_in <= SANE.humMax)) &&
          (r.weight_kg == null || (r.weight_kg >= SANE.weightMin && r.weight_kg <= SANE.weightMax));
        if (!ok) rejected.push(r);
        return ok;
      })
      .map((r) => ({
        hiveId: r.hive_id,
        ts: r.ts,
        tempIn: r.temp_in ?? null,
        humIn: r.hum_in ?? null,
        weightKg: r.weight_kg ?? null,
        tempOut: r.temp_out ?? null,
        batteryV: r.battery_v ?? null,
      }));

    if (rows.length > 0) {
      await prisma.sensorReading.createMany({ data: rows });
    }

    const accepted = rows.length;
    await maybeTriggerAlerts(rows);

    res.status(accepted > 0 ? 201 : 202).json({
      accepted,
      rejected: rejected.length,
      detail: rejected.length ? rejected : undefined,
    });
  } catch (e) {
    next(e);
  }
}

/**
 * Detect alerts (FR4: theft / collapse weight drop; low battery).
 */
async function maybeTriggerAlerts(rows: Array<{
  hiveId: string;
  ts: Date;
  weightKg?: number | null;
  batteryV?: number | null;
}>): Promise<void> {
  for (const row of rows) {
    const hive = await prisma.hive.findUnique({ where: { hiveId: row.hiveId } });
    if (!hive) continue;

    if (row.batteryV != null && row.batteryV < 3.3) {
      await prisma.alert.create({
        data: {
          hiveId: hive.hiveId,
          type: 'LOW_BATTERY',
          severity: 'WARNING',
          message: `Sensor battery low: ${row.batteryV.toFixed(2)}V`,
        },
      });
    }

    if (row.weightKg != null) {
      const prior = await prisma.sensorReading.findFirst({
        where: { hiveId: hive.hiveId, weightKg: { not: null }, ts: { lt: row.ts } },
        orderBy: { ts: 'desc' },
      });
      if (prior?.weightKg && prior.weightKg - row.weightKg > prior.weightKg * 0.1) {
        await prisma.alert.create({
          data: {
            hiveId: hive.hiveId,
            type: 'THEFT',
            severity: 'CRITICAL',
            message: `Weight dropped ${prior.weightKg.toFixed(1)}kg -> ${row.weightKg.toFixed(1)}kg`,
          },
        });
      }
    }
  }
}

export const sensorData = [requireDevice, ingest];
