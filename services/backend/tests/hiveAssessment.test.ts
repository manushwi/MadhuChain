import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { assessHive } from '../src/services/hiveAssessment.js';
import { buildTelemetryFeatures, type TelemetryPoint } from '../src/services/telemetryFeatures.js';

const end = new Date('2026-08-29T12:00:00.000Z');

function samples(overrides: Partial<TelemetryPoint> = {}): TelemetryPoint[] {
  return Array.from({ length: 12 }, (_, index) => ({
    ts: new Date(end.getTime() - (55 - index * 5) * 60_000),
    tempIn: 35,
    humIn: 60,
    weightKg: 40,
    tempOut: 28,
    batteryV: 3.8,
    ...overrides,
  }));
}

describe('deterministic hive assessment', () => {
  test('no data is never reported as healthy or normal', () => {
    const assessment = assessHive(buildTelemetryFeatures([], end));
    assert.equal(assessment.status, 'NO_DATA');
    assert.equal(assessment.telemetryConditionScore, null);
  });

  test('out-of-band temperature creates an explainable watch state', () => {
    const assessment = assessHive(buildTelemetryFeatures(samples({ tempIn: 45 }), end));
    assert.equal(assessment.status, 'WATCH');
    assert.equal(assessment.temperatureFlag, true);
    assert.ok(assessment.reasons.some((reason) => reason.code === 'INTERNAL_TEMPERATURE_OUT_OF_BAND'));
  });

  test('sudden measured weight decrease is an alert without a theft claim', () => {
    const readings = samples();
    readings[readings.length - 1].weightKg = 30;
    const assessment = assessHive(buildTelemetryFeatures(readings, end));
    assert.equal(assessment.status, 'ALERT');
    assert.ok(assessment.reasons.some((reason) => reason.code === 'SUDDEN_WEIGHT_DROP'));
    assert.equal(JSON.stringify(assessment).toLowerCase().includes('theft'), false);
  });

  test('biological diagnosis fields are absent', () => {
    const assessment = assessHive(buildTelemetryFeatures(samples(), end)) as unknown as Record<string, unknown>;
    for (const field of ['diseaseRisk', 'queenLossRisk', 'swarmingRisk', 'yieldEstimate', 'confidence']) {
      assert.equal(field in assessment, false);
    }
  });
});
