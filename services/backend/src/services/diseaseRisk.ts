import type { TelemetryFeatures } from './telemetryFeatures.js';

// The subset of assessment output `estimateRisks` depends on, so callers can
// pass either a full HiveAssessmentResult or a slimmer serialized shape.
export interface RiskAssessmentInput {
  status: string;
  telemetryConditionScore: number | null;
  dataQualityLabel: string;
}

// The subset of telemetry features `estimateRisks` reads. Floating storage can
// have nulls for unavailable channels.
type RiskFeatures = Pick<
  TelemetryFeatures,
  | 'tempInLatest'
  | 'humInLatest'
  | 'tempOutLatest'
  | 'tempInStddev24h'
  | 'maxWeightDropPct1h'
  | 'weightDelta7dKg'
  | 'batteryLatestV'
  | 'freshnessSeconds'
>;

// Risk scores mirror the project's AI/ML pipeline design (02_*.md §10):
// separate scores per risk family instead of one vague number, all 0-100 where
// higher = more risk. This is a deterministic RISK ESTIMATION, not a diagnosis.

export interface RiskScores {
  environment: number;
  swarming: number;
  queenLoss: number;
  diseasePest: number;
  productivity: number;
  device: number;
}

export interface RiskEstimation {
  healthScore: number | null;
  riskScores: RiskScores;
  abnormal: boolean;
  diseasePestFlags: string[];
  notes: string[];
}

const HEALTHY_WEIGHT_GAIN_KG_7D = 2.5;

// A hive is "abnormal" (and therefore a candidate for the LLM disease analysis)
// when any risk family is elevated or the deterministic assessment is not NORMAL.
export function isHiveAbnormal(assessment: RiskAssessmentInput, risks: RiskScores): boolean {
  if (assessment.status !== 'NORMAL') return true;
  if (risks.diseasePest >= 50) return true;
  if (risks.swarming >= 50) return true;
  if (risks.queenLoss >= 50) return true;
  if (risks.environment >= 50) return true;
  if (risks.productivity >= 50) return true;
  return false;
}

export function estimateRisks(
  assessment: RiskAssessmentInput,
  features: RiskFeatures,
  context: { beeSpecies?: string | null; nectarSource?: string | null },
): RiskEstimation {
  const species = (context.beeSpecies ?? '').toLowerCase();
  const nectar = (context.nectarSource ?? '').toLowerCase();

  const temp = features.tempInLatest;
  const hum = features.humInLatest;
  const tempOut = features.tempOutLatest;
  const stddev = features.tempInStddev24h;
  const drop = features.maxWeightDropPct1h ?? 0;
  const delta7d = features.weightDelta7dKg;
  const battery = features.batteryLatestV;
  const freshness = features.freshnessSeconds;
  const stale = freshness == null || freshness > 30 * 60;

  const healthScore = assessment.telemetryConditionScore;

  // --- environment -----------------------------------------------------------
  let environment = 10;
  if (temp != null && (temp < 12 || temp > 36)) environment += 25;
  if (hum != null && (hum < 35 || hum > 70)) environment += 20;
  if (temp != null && tempOut != null && Math.abs(temp - tempOut) > 15) environment += 15;
  if (stddev != null && stddev > 2.5) environment += 10; // unstable microclimate
  environment = clamp(environment, 0, 100);

  // --- swarming --------------------------------------------------------------
  let swarming = 10;
  if (temp != null && temp > 33) swarming += 20; // crowding/heat
  if (delta7d != null && delta7d > HEALTHY_WEIGHT_GAIN_KG_7D) swarming += 25; // strong nectar build-up
  if (stale) swarming += 10; // low confidence
  swarming = clamp(swarming, 0, 100);

  // --- queen loss ------------------------------------------------------------
  let queenLoss = 10;
  // Very high brood-nest temperature stability + abnormal weight drop can hint
  // at a failing/absent queen; low confidence.
  if (drop > 0.05) queenLoss += 15;
  if (temp != null && temp > 36) queenLoss += 15;
  if (stddev != null && stddev < 0.5) queenLoss += 10;
  if (stale) queenLoss += 10;
  queenLoss = clamp(queenLoss, 0, 100);

  // --- disease/pest ----------------------------------------------------------
  // The primary focus for the user. Driven mostly by telemetry anomalies with
  // species/nectar modifiers, and clearly framed as risk estimation.
  let diseasePest = 10;
  const flags: string[] = [];
  if (temp != null && temp > 40) {
    diseasePest += 20;
    flags.push('internal-overheating');
  }
  if (temp != null && temp < 10) {
    diseasePest += 20;
    flags.push('internal-temp-low');
  }
  if (hum != null && (hum < 30 || hum > 75)) {
    diseasePest += 15;
    flags.push('humidity-out-of-band');
  }
  if (drop > 0.1) {
    diseasePest += 25;
    flags.push('sudden-weight-drop');
  }
  // Species susceptibility modifiers (Apis mellifera is more prone to Varroa etc.)
  if (species.includes('mellifera') || species.includes('italian')) {
    diseasePest += 8;
    flags.push('varroa-susceptible-species');
  }
  if (species.includes('cerana') || species.includes('indica')) {
    diseasePest -= 5;
  }
  // Floral source modifiers (some sources signal damp/fermentation conditions).
  if (nectar.includes('jamun') || nectar.includes('litchi')) diseasePest += 5;
  if (nectar.includes('eucalyptus')) diseasePest += 3;
  if (stale) {
    diseasePest += 8;
    flags.push('stale-telemetry');
  }
  diseasePest = clamp(diseasePest, 0, 100);

  // --- productivity ----------------------------------------------------------
  let productivity = 10;
  if (delta7d != null && delta7d < 0) productivity += 25; // net loss over 7d
  if (drop > 0.05) productivity += 15;
  if (temp != null && (temp < 15 || temp > 34)) productivity += 15;
  productivity = clamp(productivity, 0, 100);

  // --- device ----------------------------------------------------------------
  let device = 5;
  if (battery != null && battery < 3.3) device += 50;
  if (stale) device += 40;
  device = clamp(device, 0, 100);

  const riskScores: RiskScores = { environment, swarming, queenLoss, diseasePest, productivity, device };

  const notes: string[] = [];
  if (stale) notes.push('Telemetry is stale or absent; risk estimates have lower confidence.');
  if (assessment.dataQualityLabel === 'INSUFFICIENT' || assessment.dataQualityLabel === 'LOW') {
    notes.push('Sensor data coverage is limited, so risk estimates should be treated conservatively.');
  }
  notes.push('Disease/pest output is a risk estimation, not a diagnosis. Inspect the hive for confirmation.');

  return {
    healthScore,
    riskScores,
    abnormal: isHiveAbnormal(assessment, riskScores),
    diseasePestFlags: flags,
    notes,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
