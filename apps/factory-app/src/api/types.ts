// Backend response contracts (camelCase = DB mirror, snake_case = request bodies).
import type { BatchChainState } from '@/src/theme/primitives';

export type Role = 'BEEKEEPER' | 'TRANSPORTER' | 'LABTECH' | 'FACTORYWORKER' | 'QCMANAGER' | 'DISTRIBUTOR' | 'ADMIN' | 'CONSUMER';

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: Role;
  apiaryName: string | null;
  location: string | null;
  operatorId?: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface HiveRef {
  batchId: string;
  hiveId: string;
  hive?: { hiveId: string; name: string | null } | null;
}

export interface QualityTest {
  id: string;
  batchId: string;
  stage: 'INTAKE' | 'OUTPUT';
  moisture: number | null;
  hmf: number | null;
  diastase: number | null;
  sugarProfile: { fructose?: number; glucose?: number; sucrose?: number } | null;
  isotopeRatio: number | null;
  testerId: string | null;
  ts: string;
  result: 'PASS' | 'FLAGGED' | null;
}

export interface BatchSummary {
  batchId: string;
  lotId: string | null;
  beekeeperId: string | null;
  state: BatchChainState;
  harvestStart: string | null;
  harvestEnd: string | null;
  weightKg: number | null;
  sensorDataHash: string | null;
  flagged: boolean;
  flagReason: string | null;
  flagResolution: string | null;
  createdAt: string;
  hives: HiveRef[];
  qualityTests: QualityTest[];
  current_custodian_msp?: string | null;
}

export interface ProcessingEntry {
  id: string;
  batchId: string;
  actionType: string;
  parameters: Record<string, unknown> | null;
  operatorId: string | null;
  equipmentId: string | null;
  weightBefore: number | null;
  weightAfter: number | null;
  parentLots: Record<string, number> | null;
  ts: string;
}

export interface Jar {
  id: string;
  batchId: string;
  jarId: string;
  packagingDate: string;
}

export interface OwnershipEntry {
  id: string;
  batchId: string;
  fromId: string | null;
  toId: string | null;
  ts: string;
}

export interface BlendEntry {
  id: string;
  blendBatchId: string;
  sourceLotId: string;
  weightKg: number;
  percentage: number;
}

export interface BatchDetail extends BatchSummary {
  processingLog: ProcessingEntry[];
  jarSerials: Jar[];
  ownershipTransfer: OwnershipEntry[];
  blends: BlendEntry[];
}

export interface ListsResponse {
  batches: BatchSummary[];
}

export interface BatchResponse {
  batch: BatchDetail;
}

export interface FraudChecks {
  passed: boolean;
  reasons: string[];
}

export interface ActionResponse {
  batch_id: string;
  tx: TransactionMetadata;
}

export interface TransactionMetadata {
  transaction_id: string;
  validation_code: number;
  successful: boolean;
  result: unknown;
}

export interface ReceivedResponse extends ActionResponse {
  state: BatchChainState;
}

export interface QualityResponse extends ActionResponse {
  stage: string;
  state: BatchChainState;
  flagged: boolean;
  fraud_checks?: FraudChecks | null;
}

export interface ProcessingResponse extends ActionResponse {
  action: string;
  state: BatchChainState;
  flagged: boolean;
}

export interface PackagingResponse extends ActionResponse {
  jar_ids: string[];
  jars: {
    jar_id: string;
    barcode_value: string;
    verification_url: string;
    qr_data_url?: string;
  }[];
  state: BatchChainState;
}

export interface FactoryScanResponse {
  asset_type: string;
  batch_id: string;
  jar_id?: string;
  warnings?: string[];
  allowed_operations?: string[];
}

export interface BlendResponse extends ActionResponse {
  lot_id: string;
  sources: { lot_id: string; weight_kg: number }[];
  state: BatchChainState;
}

export interface TransferResponse extends ActionResponse {
  to_identity: string;
  to_msp: string;
}

export interface Operator {
  id: string;
  name: string;
  email: string | null;
  role: Role;
  operatorId: string | null;
  organization: { name: string | null; mspId: string | null } | null;
}

export interface OperatorsResponse {
  operators: Operator[];
}

export interface ClearFlagResponse extends ActionResponse {
  resolution: 'CLEARED' | 'REJECTED';
  state: BatchChainState;
}

export interface BarcodeResponse {
  batch_id: string;
  payload: { lot_id: string; weight_kg: number; harvest_date: string };
  barcode_pdf_url: string;
  barcode_pdf_base64: string;
}
