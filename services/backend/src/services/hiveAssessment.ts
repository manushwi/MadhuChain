import type { TelemetryFeatures } from './telemetryFeatures.js';

export const ASSESSMENT_VERSION = 'telemetry-rules-v1';

export type AssessmentStatus = 'NO_DATA' | 'STALE' | 'NORMAL' | 'WATCH' | 'ALERT';
export type DataQualityLabel = 'INSUFFICIENT' | 'LOW' | 'ADEQUATE' | 'GOOD';
export type AssessmentReason = { code: string; message: string };

export interface HiveAssessmentResult {
  modelVersion: string;
  method: 'DETERMINISTIC_RULES';
  status: AssessmentStatus;
  telemetryConditionScore: number | null;
  dataQualityScore: number;
  dataQualityLabel: DataQualityLabel;
  temperatureFlag: boolean;
  humidityFlag: boolean;
  weightDropFlag: boolean;
  batteryLowFlag: boolean;
  reasons: AssessmentReason[];
  recommendations: string[];
}

export const ASSESSMENT_LIMITATIONS = [
  'This is a deterministic sensor-condition assessment, not a colony-health diagnosis.',
  'Disease, pests, queen loss, swarming, bee activity, and honey yield are not evaluated.',
] as const;

export function assessHive(features: TelemetryFeatures): HiveAssessmentResult {
  const temperatureFlag = features.tempInLatest != null && (features.tempInLatest < 10 || features.tempInLatest > 40);
  const humidityFlag = features.humInLatest != null && (features.humInLatest < 30 || features.humInLatest > 75);
  const weightDropFlag = features.maxWeightDropPct1h != null && features.maxWeightDropPct1h > 0.1;
  const batteryLowFlag = features.batteryLatestV != null && features.batteryLatestV < 3.3;
  const dataQualityLabel = qualityLabel(features.dataQualityScore);
  const reasons: AssessmentReason[] = [];
  const recommendations: string[] = [];

  if (!features.latestReadingAt) {
    reasons.push({ code: 'NO_RECENT_DATA', message: 'No telemetry was received in this 24-hour window.' });
    recommendations.push('Check node power, gateway connectivity, and telemetry upload.');
  } else if ((features.freshnessSeconds ?? Infinity) > 30 * 60) {
    reasons.push({ code: 'TELEMETRY_STALE', message: 'The latest telemetry is more than 30 minutes old.' });
    recommendations.push('Check node power, gateway connectivity, and telemetry upload.');
  }
  if (temperatureFlag) {
    reasons.push({ code: 'INTERNAL_TEMPERATURE_OUT_OF_BAND', message: `Internal hive temperature is ${format(features.tempInLatest)} C, outside the configured 10-40 C telemetry band.` });
    recommendations.push('Check sensor placement, shade, ventilation, and local conditions.');
  }
  if (humidityFlag) {
    reasons.push({ code: 'INTERNAL_HUMIDITY_OUT_OF_BAND', message: `Internal hive humidity is ${format(features.humInLatest)}%, outside the configured 30-75% telemetry band.` });
    recommendations.push('Inspect moisture, ventilation, and sensor placement.');
  }
  if (weightDropFlag) {
    reasons.push({ code: 'SUDDEN_WEIGHT_DROP', message: `Measured weight decreased by up to ${format((features.maxWeightDropPct1h ?? 0) * 100)}% between adjacent readings in the last hour.` });
    recommendations.push('Inspect for a recorded harvest, hive movement, equipment change, damage, or load-cell fault.');
  }
  if (batteryLowFlag) {
    reasons.push({ code: 'LOW_BATTERY', message: `Sensor-node battery is ${format(features.batteryLatestV)} V, below the configured 3.3 V threshold.` });
    recommendations.push('Inspect or recharge the sensor-node battery.');
  }
  if (dataQualityLabel === 'INSUFFICIENT' && features.latestReadingAt) {
    reasons.push({ code: 'LIMITED_DATA', message: 'Required sensor coverage is insufficient for a normal assessment.' });
  }

  const status: AssessmentStatus = !features.latestReadingAt
    ? 'NO_DATA'
    : (features.freshnessSeconds ?? Infinity) > 30 * 60
      ? 'STALE'
      : weightDropFlag
        ? 'ALERT'
        : temperatureFlag || humidityFlag || batteryLowFlag || dataQualityLabel === 'INSUFFICIENT'
          ? 'WATCH'
          : 'NORMAL';

  const canScore = features.tempInLatest != null && features.humInLatest != null && features.weightLatestKg != null && status !== 'NO_DATA' && status !== 'STALE';
  const telemetryConditionScore = canScore
    ? Math.max(0, 100 - (temperatureFlag ? 25 : 0) - (humidityFlag ? 20 : 0) - (weightDropFlag ? 35 : 0) - (batteryLowFlag ? 20 : 0))
    : null;

  return {
    modelVersion: ASSESSMENT_VERSION,
    method: 'DETERMINISTIC_RULES',
    status,
    telemetryConditionScore,
    dataQualityScore: features.dataQualityScore,
    dataQualityLabel,
    temperatureFlag,
    humidityFlag,
    weightDropFlag,
    batteryLowFlag,
    reasons,
    recommendations: [...new Set(recommendations)],
  };
}

function qualityLabel(score: number): DataQualityLabel {
  if (score < 0.4) return 'INSUFFICIENT';
  if (score < 0.65) return 'LOW';
  if (score < 0.85) return 'ADEQUATE';
  return 'GOOD';
}

function format(value: number | null): string {
  return value == null ? 'unavailable' : Number(value.toFixed(2)).toString();
}
