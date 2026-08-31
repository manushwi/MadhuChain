import {
  get,
  post,
  type ApiError,
} from './client';
import type {
  BarcodeResponse,
  BatchDetail,
  BatchSummary,
  BlendResponse,
  ClearFlagResponse,
  FactoryScanResponse,
  ListsResponse,
  Operator,
  OperatorsResponse,
  PackagingResponse,
  ProcessingResponse,
  QualityResponse,
  QualityTest,
  ReceivedResponse,
  TransferResponse,
} from './types';

export type { ApiError };

export interface QualityInput {
  stage: 'INTAKE' | 'OUTPUT';
  moisture: number;
  hmf: number;
  diastase: number;
  fructose: number;
  glucose: number;
  sucrose: number;
  isotopeRatio: number;
}

const intakeByStage: Record<string, QualityTest | undefined> = {};

export function clearBatchMemoryCache() {
  Object.keys(intakeByStage).forEach((key) => delete intakeByStage[key]);
}

export async function listBatches(): Promise<BatchSummary[]> {
  const res = await get<ListsResponse>('/api/batches');
  return res.batches;
}

export async function getBatch(id: string): Promise<BatchDetail> {
  const res = await get<{ batch: BatchDetail }>(`/api/batches/${id}`);
  return res.batch;
}

export async function scanFactoryAsset(payload: string): Promise<FactoryScanResponse> {
  return post<FactoryScanResponse>('/api/factory/scan', { payload });
}

// Cache the latest INTAKE panel per batch so forms can prefill + hint drift.
export function cacheIntake(batchId: string, tests: QualityTest[] | undefined) {
  if (!tests) return;
  const intake = [...tests]
    .filter((q) => q.stage === 'INTAKE')
    .sort((a, b) => b.ts.localeCompare(a.ts))[0];
  if (intake) intakeByStage[batchId] = intake;
}

export function latestIntake(batchId: string): QualityTest | undefined {
  return intakeByStage[batchId];
}

export async function recordReceived(batchId: string, transporterId: string, weightIn: number): Promise<ReceivedResponse> {
  return post<ReceivedResponse>(`/api/batches/${batchId}/received`, {
    transporter_id: transporterId,
    weight_in: weightIn,
  });
}

export async function recordQualityTest(batchId: string, q: QualityInput): Promise<QualityResponse> {
  return post<QualityResponse>(`/api/batches/${batchId}/quality-test`, {
    stage: q.stage,
    moisture: q.moisture,
    hmf: q.hmf,
    diastase: q.diastase,
    sugar_profile: { fructose: q.fructose, glucose: q.glucose, sucrose: q.sucrose },
    isotope_ratio: q.isotopeRatio,
  });
}

export async function recordProcessingAction(
  batchId: string,
  p: {
    action_type: 'heating' | 'filtering';
    weight_before: number;
    weight_after: number;
    equipment_id: string;
  },
): Promise<ProcessingResponse> {
  return post<ProcessingResponse>(`/api/batches/${batchId}/processing-action`, p);
}

export async function recordPackaging(
  batchId: string,
  jarCount: number,
  averageJarWeightKg: number,
): Promise<PackagingResponse> {
  return post<PackagingResponse>(`/api/batches/${batchId}/packaging`, {
    jar_count: jarCount,
    average_jar_weight_kg: averageJarWeightKg,
  });
}

export async function createBlend(
  anchorBatchId: string,
  sources: { lot_id: string; weight_kg: number }[],
  weightKg: number,
): Promise<BlendResponse> {
  return post<BlendResponse>(`/api/batches/${anchorBatchId}/blend`, {
    sources,
    weight_kg: weightKg,
  });
}

export async function transferOwnership(batchId: string, toIdentity: string, toMsp: string): Promise<TransferResponse> {
  return post<TransferResponse>(`/api/batches/${batchId}/transfer`, { to_identity: toIdentity, to_msp: toMsp });
}

export async function clearFlag(batchId: string, resolution: 'CLEARED' | 'REJECTED'): Promise<ClearFlagResponse> {
  return post<ClearFlagResponse>(`/api/batches/${batchId}/clear-flag`, { resolution });
}

export async function getBarcode(batchId: string): Promise<BarcodeResponse> {
  return get<BarcodeResponse>(`/api/batches/${batchId}/barcode`);
}

export async function listOperators(role?: string): Promise<Operator[]> {
  const qs = role ? `?role=${encodeURIComponent(role)}` : '';
  const res = await get<OperatorsResponse>(`/api/factory/operators${qs}`);
  return res.operators;
}
