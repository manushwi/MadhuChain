import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { buildTelemetryFeatures, featureWindowEnd, type TelemetryPoint } from '../src/services/telemetryFeatures.js';

const end = new Date('2026-08-29T12:00:00.000Z');

function point(minutesBefore: number, values: Partial<Omit<TelemetryPoint, 'ts'>> = {}): TelemetryPoint {
  return {
    ts: new Date(end.getTime() - minutesBefore * 60_000),
    tempIn: 35,
    humIn: 60,
    weightKg: 40,
    tempOut: 28,
    batteryV: 3.8,
    ...values,
  };
}

describe('telemetry feature generation', () => {
  test('anchors windows to deterministic UTC five-minute boundaries', () => {
    assert.equal(featureWindowEnd(new Date('2026-08-29T12:03:12Z')).toISOString(), '2026-08-29T12:05:00.000Z');
    assert.equal(featureWindowEnd(new Date('2026-08-29T12:05:00Z')).toISOString(), '2026-08-29T12:05:00.000Z');
  });

  test('sorts input and calculates stable summary statistics', () => {
    const features = buildTelemetryFeatures([
      point(10, { tempIn: 34 }),
      point(30, { tempIn: 32 }),
      point(20, { tempIn: 33 }),
    ], end);
    assert.equal(features.tempInLatest, 34);
    assert.equal(features.tempInMean1h, 33);
    assert.equal(features.tempInMin24h, 32);
    assert.equal(features.tempInMax24h, 34);
    assert.ok((features.tempInSlope1h ?? 0) > 0);
  });

  test('detects an adjacent sudden weight decrease but not distant samples', () => {
    const sudden = buildTelemetryFeatures([point(20, { weightKg: 50 }), point(10, { weightKg: 40 })], end);
    assert.equal(sudden.maxWeightDropPct1h, 0.2);
    const distant = buildTelemetryFeatures([point(120, { weightKg: 50 }), point(10, { weightKg: 40 })], end);
    assert.equal(distant.maxWeightDropPct1h, null);
  });

  test('does not invent unavailable sensor values', () => {
    const features = buildTelemetryFeatures([point(5, { humIn: null, weightKg: null })], end);
    assert.equal(features.humInLatest, null);
    assert.equal(features.weightLatestKg, null);
    assert.equal(features.weightDelta1hKg, null);
  });
});
