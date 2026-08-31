import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { requireDevice } from '../middleware/deviceAuth.js';
import { evaluateHiveAt } from '../services/hiveAnalytics.js';
import { featureWindowEnd } from '../services/telemetryFeatures.js';

const readingSchema = z.object({
  hive_id: z.string().min(1),
  ts: z.coerce.date().default(() => new Date()),
  temp_in: z.number().nullable().optional(),
  hum_in: z.number().nullable().optional(),
  weight_kg: z.number().nullable().optional(),
  temp_out: z.number().nullable().optional(),
  battery_v: z.number().nullable().optional(),
}).refine((reading) => [reading.temp_in, reading.hum_in, reading.weight_kg, reading.temp_out, reading.battery_v].some((value) => value != null), {
  message: 'At least one sensor value is required',
});

// Supported sane ranges (reject physically impossible values) - FR2.
const SANE = {
  tempMin: -10,
  tempMax: 60,
  humMin: 0,
  humMax: 100,
  weightMin: 0,
  weightMax: 500,
  tempOutMin: -50,
  tempOutMax: 70,
  batteryMin: 0,
  batteryMax: 20,
};

export async function ingest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Body may be a single reading or an array (gateway batches).
    const body = Array.isArray(req.body) ? req.body : [req.body];
    if (body.length === 0) {
      res.status(400).json({ error: 'Empty payload' });
      return;
    }
    if (body.length > 500) {
      res.status(413).json({ error: 'A telemetry batch may contain at most 500 readings' });
      return;
    }

    const rejected: Array<{ index: number; code: string; detail?: unknown }> = [];
    const parsed = body.flatMap((raw, index) => {
      const result = readingSchema.safeParse(raw);
      if (!result.success) {
        rejected.push({ index, code: 'INVALID_READING', detail: result.error.flatten().fieldErrors });
        return [];
      }
      if (result.data.ts.getTime() > Date.now() + 5 * 60 * 1000) {
        rejected.push({ index, code: 'FUTURE_TIMESTAMP' });
        return [];
      }
      return [{ index, reading: result.data }];
    });
    const hiveIds = [...new Set(parsed.map(({ reading }) => reading.hive_id))];
    const knownHives = new Set((await prisma.hive.findMany({ where: { hiveId: { in: hiveIds } }, select: { hiveId: true } })).map((hive) => hive.hiveId));

    const rows = parsed
      .filter(({ index, reading: r }) => {
        if (!knownHives.has(r.hive_id)) {
          rejected.push({ index, code: 'UNKNOWN_HIVE' });
          return false;
        }
        const ok =
          (r.temp_in == null || (r.temp_in >= SANE.tempMin && r.temp_in <= SANE.tempMax)) &&
          (r.hum_in == null || (r.hum_in >= SANE.humMin && r.hum_in <= SANE.humMax)) &&
          (r.weight_kg == null || (r.weight_kg >= SANE.weightMin && r.weight_kg <= SANE.weightMax)) &&
          (r.temp_out == null || (r.temp_out >= SANE.tempOutMin && r.temp_out <= SANE.tempOutMax)) &&
          (r.battery_v == null || (r.battery_v >= SANE.batteryMin && r.battery_v <= SANE.batteryMax));
        if (!ok) rejected.push({ index, code: 'OUT_OF_RANGE' });
        return ok;
      })
      .map(({ reading: r }) => ({
        hiveId: r.hive_id,
        ts: r.ts,
        tempIn: r.temp_in ?? null,
        humIn: r.hum_in ?? null,
        weightKg: r.weight_kg ?? null,
        tempOut: r.temp_out ?? null,
        batteryV: r.battery_v ?? null,
      }));

    if (rows.length > 0) {
      const inserted = await prisma.sensorReading.createMany({ data: rows, skipDuplicates: true });
      const windows = new Map<string, { hiveId: string; eventTime: Date }>();
      for (const row of rows) {
        const end = featureWindowEnd(row.ts);
        windows.set(`${row.hiveId}:${end.toISOString()}`, { hiveId: row.hiveId, eventTime: row.ts });
      }
      for (const window of [...windows.values()].sort((left, right) => left.eventTime.getTime() - right.eventTime.getTime())) {
        await evaluateHiveAt(window.hiveId, window.eventTime);
      }
      res.status(inserted.count > 0 ? 201 : 200).json({
        received: body.length,
        inserted: inserted.count,
        duplicates: rows.length - inserted.count,
        rejected: rejected.length,
        evaluatedWindows: windows.size,
        errors: rejected.length ? rejected : undefined,
      });
      return;
    }
    res.status(202).json({ received: body.length, inserted: 0, duplicates: 0, rejected: rejected.length, evaluatedWindows: 0, errors: rejected });
  } catch (e) {
    next(e);
  }
}

export const sensorData = [requireDevice, ingest];
