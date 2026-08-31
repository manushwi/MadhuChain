import { prisma } from '../db/prisma.js';
import { ASSESSMENT_LIMITATIONS, assessHive } from './hiveAssessment.js';
import { buildTelemetryFeatures, FEATURE_VERSION, featureWindowEnd } from './telemetryFeatures.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export async function evaluateHiveAt(hiveId: string, eventTime: Date) {
  const windowEnd = featureWindowEnd(eventTime);
  const readings = await prisma.sensorReading.findMany({
    where: { hiveId, ts: { gt: new Date(windowEnd.getTime() - 7 * DAY_MS), lte: windowEnd } },
    orderBy: { ts: 'asc' },
  });
  const features = buildTelemetryFeatures(readings, windowEnd);
  const featureData = {
    hiveId,
    ...features,
  };
  const featureWindow = await prisma.featureWindow.upsert({
    where: { hiveId_windowEnd_featureVersion: { hiveId, windowEnd, featureVersion: FEATURE_VERSION } },
    update: featureData,
    create: featureData,
  });
  const assessment = assessHive(features);
  const prediction = await prisma.modelPrediction.upsert({
    where: { featureWindowId_modelVersion: { featureWindowId: featureWindow.id, modelVersion: assessment.modelVersion } },
    update: {
      status: assessment.status,
      telemetryConditionScore: assessment.telemetryConditionScore,
      dataQualityScore: assessment.dataQualityScore,
      dataQualityLabel: assessment.dataQualityLabel,
      temperatureFlag: assessment.temperatureFlag,
      humidityFlag: assessment.humidityFlag,
      weightDropFlag: assessment.weightDropFlag,
      batteryLowFlag: assessment.batteryLowFlag,
      reasons: assessment.reasons,
      recommendations: assessment.recommendations,
    },
    create: {
      hiveId,
      featureWindowId: featureWindow.id,
      modelVersion: assessment.modelVersion,
      method: assessment.method,
      status: assessment.status,
      telemetryConditionScore: assessment.telemetryConditionScore,
      dataQualityScore: assessment.dataQualityScore,
      dataQualityLabel: assessment.dataQualityLabel,
      temperatureFlag: assessment.temperatureFlag,
      humidityFlag: assessment.humidityFlag,
      weightDropFlag: assessment.weightDropFlag,
      batteryLowFlag: assessment.batteryLowFlag,
      reasons: assessment.reasons,
      recommendations: assessment.recommendations,
    },
    include: { featureWindow: true },
  });
  await synchronizeAlerts(prediction);
  return prediction;
}

export async function latestAssessment(hiveId: string) {
  return prisma.modelPrediction.findFirst({
    where: { hiveId },
    orderBy: { featureWindow: { windowEnd: 'desc' } },
    include: { featureWindow: true },
  });
}

export function serializeAssessment(prediction: Awaited<ReturnType<typeof latestAssessment>>) {
  if (!prediction) return noDataAssessment();
  const feature = prediction.featureWindow;
  return {
    id: prediction.id,
    hiveId: prediction.hiveId,
    windowStart: feature.windowStart,
    windowEnd: feature.windowEnd,
    featureVersion: feature.featureVersion,
    modelVersion: prediction.modelVersion,
    method: prediction.method,
    status: prediction.status,
    telemetryConditionScore: prediction.telemetryConditionScore,
    dataQuality: {
      score: prediction.dataQualityScore,
      label: prediction.dataQualityLabel,
      latestReadingAt: feature.latestReadingAt,
    },
    indicators: {
      temperature: feature.tempInLatest == null ? 'UNAVAILABLE' : prediction.temperatureFlag ? 'OUT_OF_BAND' : 'NORMAL',
      humidity: feature.humInLatest == null ? 'UNAVAILABLE' : prediction.humidityFlag ? 'OUT_OF_BAND' : 'NORMAL',
      weightChange: feature.weightLatestKg == null ? 'UNAVAILABLE' : prediction.weightDropFlag ? 'SUDDEN_DROP' : 'NORMAL',
      battery: feature.batteryLatestV == null ? 'UNAVAILABLE' : prediction.batteryLowFlag ? 'LOW' : 'NORMAL',
    },
    reasons: prediction.reasons,
    recommendations: prediction.recommendations,
    limitations: ASSESSMENT_LIMITATIONS,
  };
}

export function noDataAssessment() {
  return {
    id: null,
    featureVersion: FEATURE_VERSION,
    modelVersion: 'telemetry-rules-v1',
    method: 'DETERMINISTIC_RULES',
    status: 'NO_DATA',
    telemetryConditionScore: null,
    dataQuality: { score: 0, label: 'INSUFFICIENT', latestReadingAt: null },
    indicators: { temperature: 'UNAVAILABLE', humidity: 'UNAVAILABLE', weightChange: 'UNAVAILABLE', battery: 'UNAVAILABLE' },
    reasons: [{ code: 'NO_DATA', message: 'No deterministic telemetry assessment is available.' }],
    recommendations: ['Check node power, gateway connectivity, and telemetry upload.'],
    limitations: ASSESSMENT_LIMITATIONS,
  };
}

async function synchronizeAlerts(prediction: NonNullable<Awaited<ReturnType<typeof latestAssessment>>>) {
  const reasons = prediction.reasons as Array<{ code: string; message: string }>;
  const active = new Map<string, { severity: string; message: string }>();
  for (const reason of reasons) {
    if (reason.code === 'SUDDEN_WEIGHT_DROP') active.set(reason.code, { severity: 'CRITICAL', message: reason.message });
    if (reason.code === 'LOW_BATTERY') active.set(reason.code, { severity: 'WARNING', message: reason.message });
    if (reason.code === 'INTERNAL_TEMPERATURE_OUT_OF_BAND') active.set(reason.code, { severity: 'WARNING', message: reason.message });
    if (reason.code === 'INTERNAL_HUMIDITY_OUT_OF_BAND') active.set(reason.code, { severity: 'WARNING', message: reason.message });
    if (reason.code === 'TELEMETRY_STALE') active.set(reason.code, { severity: 'WARNING', message: reason.message });
  }
  const types = ['SUDDEN_WEIGHT_DROP', 'LOW_BATTERY', 'INTERNAL_TEMPERATURE_OUT_OF_BAND', 'INTERNAL_HUMIDITY_OUT_OF_BAND', 'TELEMETRY_STALE'];
  for (const type of types) {
    const current = active.get(type);
    const dedupeKey = `analytics:${prediction.hiveId}:${type}`;
    if (current) {
      const existing = await prisma.alert.findUnique({ where: { dedupeKey } });
      if (existing) {
        await prisma.alert.update({
          where: { id: existing.id },
          data: { message: current.message, observedAt: prediction.featureWindow.windowEnd, predictionId: prediction.id },
        });
      } else {
        await prisma.alert.create({
          data: {
            hiveId: prediction.hiveId,
            type,
            severity: current.severity,
            message: current.message,
            source: 'DETERMINISTIC_RULES',
            predictionId: prediction.id,
            observedAt: prediction.featureWindow.windowEnd,
            dedupeKey,
          },
        });
      }
    } else {
      await prisma.alert.updateMany({
        where: { dedupeKey, status: { not: 'RESOLVED' } },
        data: { status: 'RESOLVED', resolvedAt: new Date(), dedupeKey: null },
      });
    }
  }
}
