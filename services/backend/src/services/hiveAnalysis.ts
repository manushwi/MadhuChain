import { prisma } from '../db/prisma.js';
import { serializeAssessment } from './hiveAnalytics.js';
import { ASSESSMENT_LIMITATIONS } from './hiveAssessment.js';
import { estimateRisks, type RiskScores } from './diseaseRisk.js';
import { analyzeWithLlm, llmConfigured, type LlmAnalysis } from './llm.js';
import { config } from '../config.js';

const CACHE_TTL_MS = (config.AI_ANALYSIS_CACHE_TTL_SECONDS ?? 3600) * 1000;

// Simple in-process TTL cache keyed by hive (avoid re-billing OpenRouter on
// frequent dashboard refreshes). Fine for a single-node deployment; swap for
// Redis if the backend is ever horizontally scaled.
const memoryCache = new Map<string, { expiresAt: number; value: HiveAnalysisResult }>();

export type AnalysisStatus =
  | 'NORMAL'
  | 'WATCH'
  | 'ALERT'
  | 'STALE'
  | 'NO_DATA';

export interface HiveAnalysisResult {
  hiveId: string;
  hiveName: string;
  status: AnalysisStatus;
  healthScore: number | null;
  riskScores: RiskScores;
  abnormal: boolean;
  llm: {
    generated: boolean;
    configured: boolean;
    error?: string;
    analysis?: LlmAnalysis;
  };
  diseasePestFlags: string[];
  notes: string[];
  assessment: ReturnType<typeof serializeAssessment>;
  limitations: readonly string[];
}

export interface AnalysisContext {
  beeSpecies?: string | null;
  nectarSource?: string | null;
}

export async function analyzeHive(hiveId: string, context: AnalysisContext): Promise<HiveAnalysisResult> {
  const cached = memoryCache.get(hiveId);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const prediction = await prisma.modelPrediction.findFirst({
    where: { hiveId },
    orderBy: { featureWindow: { windowEnd: 'desc' } },
    include: { featureWindow: true, hive: { select: { name: true } } },
  });

  let result: HiveAnalysisResult;
  if (!prediction) {
    result = {
      hiveId,
      hiveName: hiveId,
      status: 'NO_DATA',
      healthScore: null,
      riskScores: { environment: 0, swarming: 0, queenLoss: 0, diseasePest: 0, productivity: 0, device: 0 },
      abnormal: false,
      llm: { generated: false, configured: llmConfigured() },
      diseasePestFlags: [],
      notes: ['No deterministic telemetry assessment is available for this hive yet.'],
      assessment: serializeAssessment(null),
      limitations: ASSESSMENT_LIMITATIONS,
    };
    memoryCache.set(hiveId, { expiresAt: Date.now() + 60_000, value: result });
    return result;
  }

  const feature = prediction.featureWindow;
  const assessment = serializeAssessment(prediction);

  const features = {
    tempInLatest: feature.tempInLatest,
    humInLatest: feature.humInLatest,
    tempOutLatest: feature.tempOutLatest,
    weightLatestKg: feature.weightLatestKg,
    weightDelta1hKg: feature.weightDelta1hKg,
    weightDelta24hKg: feature.weightDelta24hKg,
    weightDelta7dKg: feature.weightDelta7dKg,
    maxWeightDropPct1h: feature.maxWeightDropPct1h,
    batteryLatestV: feature.batteryLatestV,
    batteryMin24hV: feature.batteryMin24hV,
    tempInStddev24h: feature.tempInStddev24h,
    freshnessSeconds: feature.freshnessSeconds,
    dataQualityScore: feature.dataQualityScore,
  };
  const deterministic = {
    status: prediction.status as AnalysisStatus,
    telemetryConditionScore: prediction.telemetryConditionScore,
    dataQualityLabel: prediction.dataQualityLabel,
  };

  const estimation = estimateRisks(deterministic, features, context);

  result = {
    hiveId,
    hiveName: prediction.hive?.name ?? hiveId,
    status: prediction.status as AnalysisStatus,
    healthScore: estimation.healthScore,
    riskScores: estimation.riskScores,
    abnormal: estimation.abnormal,
    llm: { generated: false, configured: llmConfigured() },
    diseasePestFlags: estimation.diseasePestFlags,
    notes: estimation.notes,
    assessment,
    limitations: ASSESSMENT_LIMITATIONS,
  };

  // Gate the LLM: only when the hive is outside its normal band.
  if (estimation.abnormal && llmConfigured()) {
    const llm = await analyzeWithLlm({
      hiveName: result.hiveName,
      hiveId,
      beeSpecies: context.beeSpecies ?? 'not specified',
      nectarSource: context.nectarSource ?? 'not specified',
      status: prediction.status,
      telemetryConditionScore: prediction.telemetryConditionScore,
      dataQualityLabel: prediction.dataQualityLabel,
      latestReading: {
        temperature: feature.tempInLatest,
        humidity: feature.humInLatest,
        weight: feature.weightLatestKg,
        battery: feature.batteryLatestV,
      },
      indicators: assessment.indicators,
      riskScores: {
        environment: estimation.riskScores.environment,
        swarming: estimation.riskScores.swarming,
        queenLoss: estimation.riskScores.queenLoss,
        diseasePest: estimation.riskScores.diseasePest,
        productivity: estimation.riskScores.productivity,
        device: estimation.riskScores.device,
      },
      reasons: (prediction.reasons as Array<{ message: string }>).map((r) => r.message),
    });
    if (llm) {
      result.llm = { generated: true, configured: true, analysis: llm };
    } else {
      result.llm = { generated: false, configured: true, error: 'AI analysis could not be generated right now.' };
    }
  }

  memoryCache.set(hiveId, { expiresAt: Date.now() + CACHE_TTL_MS, value: result });
  return result;
}
