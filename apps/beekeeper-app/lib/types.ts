// Domain types matching the backend API contract (Section 6).

export type Scheme = 'light' | 'dark';

export type HiveStatus = 'NO_DATA' | 'STALE' | 'NORMAL' | 'WATCH' | 'ALERT';

export interface HiveAssessment {
  id: string | null;
  featureVersion: string;
  modelVersion: string;
  method: 'DETERMINISTIC_RULES';
  status: HiveStatus;
  telemetryConditionScore: number | null;
  dataQuality: { score: number; label: 'INSUFFICIENT' | 'LOW' | 'ADEQUATE' | 'GOOD'; latestReadingAt: string | null };
  indicators: {
    temperature: 'NORMAL' | 'OUT_OF_BAND' | 'UNAVAILABLE';
    humidity: 'NORMAL' | 'OUT_OF_BAND' | 'UNAVAILABLE';
    weightChange: 'NORMAL' | 'SUDDEN_DROP' | 'UNAVAILABLE';
    battery: 'NORMAL' | 'LOW' | 'UNAVAILABLE';
  };
  reasons: Array<{ code: string; message: string }>;
  recommendations: string[];
  limitations: readonly string[];
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface LiveReading {
  temperature?: number; // °C
  humidity?: number; // %
  weight?: number; // kg
  battery?: number; // volts
  ts: string;
}

export interface Hive {
  id: string;
  hive_id: string; // sensor node id
  name: string;
  location?: GeoPoint;
  apiary: string;
  status: HiveStatus;
  assessment?: HiveAssessment;
  lastReading?: LiveReading;
}

export type ReadingRange = 'day' | 'week' | 'month';

export interface ReadingPoint {
  ts: string;
  temperature?: number;
  humidity?: number;
  weight?: number;
  activity?: number;
}

export type BatchStatus =
  | 'MINTED'
  | 'IN TRANSIT'
  | 'AT FACTORY'
  | 'PROCESSING'
  | 'RELEASED'
  | 'FLAGGED'
  | 'REJECTED';

export type BatchLifecycleState =
  | 'HARVESTED'
  | 'COLLECTED'
  | 'COLLECTION_REJECTED'
  | 'LAB_APPROVED'
  | 'LAB_REJECTED'
  | 'PROCESSED'
  | 'OUTPUT_APPROVED'
  | 'FINAL_QC'
  | 'RELEASED'
  | 'FLAGGED'
  | 'REVOKED';

export interface LedgerTransaction {
  transaction_id: string;
  validation_code: number;
  successful: boolean;
  result?: unknown;
}

export interface QualityTest {
  id: string;
  stage: string;
  moisture?: number | null;
  hmf?: number | null;
  diastase?: number | null;
  sugarProfile?: unknown;
  isotopeRatio?: number | null;
  testerId?: string | null;
  result?: string | null;
  ts: string;
}

export interface ProcessingLog {
  id: string;
  actionType: string;
  parameters?: unknown;
  equipmentId?: string | null;
  operatorId?: string | null;
  weightBefore?: number | null;
  weightAfter?: number | null;
  ts: string;
}

export interface JarSerial {
  id: string;
  jarId: string;
  packagingDate: string;
}

export interface OwnershipTransfer {
  id: string;
  fromId?: string | null;
  toId?: string | null;
  ts: string;
}

export interface BlendComposition {
  id: string;
  sourceLotId: string;
  weightKg: number;
  percentage: number;
}

export interface BarcodePayload {
  lot_id: string;
  weight_kg: number;
  harvest_date: string;
}

export interface Batch {
  batch_id: string;
  lot_id: string;
  barcode_id: string;
  hive_ids: string[];
  weight_kg: number;
  harvest_start: string;
  harvest_end: string;
  status: BatchStatus;
  lifecycle_state: BatchLifecycleState;
  sensor_data_hash?: string;
  flagged?: boolean;
  flag_reason?: string;
  flag_resolution?: string;
  quality_tests: QualityTest[];
  processing_logs: ProcessingLog[];
  jars: JarSerial[];
  transfers: OwnershipTransfer[];
  blends: BlendComposition[];
  transaction?: LedgerTransaction;
  barcode?: {
    payload: BarcodePayload;
    barcode_pdf_url?: string;
    barcode_pdf_base64?: string;
  };
  created_at: string;
}

export interface MintRequest {
  hive_ids: string[];
  harvest_start: string;
  harvest_end: string;
  weight_kg: number;
  note?: string;
}

export interface MintResponse {
  batch_id: string;
  lot_id: string;
  barcode_id: string;
  payload: BarcodePayload;
  barcode_pdf_url?: string;
  barcode_pdf_base64?: string;
  status: BatchStatus;
  tx?: LedgerTransaction;
}

export type AlertType =
  | 'SUDDEN_WEIGHT_DROP'
  | 'INTERNAL_TEMPERATURE_OUT_OF_BAND'
  | 'INTERNAL_HUMIDITY_OUT_OF_BAND'
  | 'LOW_BATTERY'
  | 'TELEMETRY_STALE'
  | 'UNKNOWN';

export interface Alert {
  id: string;
  hive_id: string;
  type: AlertType;
  message: string;
  severity: 'low' | 'medium' | 'high';
  acknowledged: boolean;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  apiary_name: string;
  location: string;
  beeSpecies?: string | null;
  nectarSource?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupRequest {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  apiary_name: string;
  location: string;
  bee_species?: string;
  nectar_source?: string;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface ProfileUpdate {
  name?: string;
  apiary_name?: string;
  location?: string;
  phone?: string;
  bee_species?: string;
  nectar_source?: string;
}

// AI hive/disease analysis (per hive) returned by GET /api/hives/:id/analysis.
export interface DiseaseAnalysis {
  hiveId: string;
  hiveName: string;
  status: 'NORMAL' | 'WATCH' | 'ALERT' | 'STALE' | 'NO_DATA';
  healthScore: number | null;
  riskScores: {
    environment: number;
    swarming: number;
    queenLoss: number;
    diseasePest: number;
    productivity: number;
    device: number;
  };
  abnormal: boolean;
  llm: {
    generated: boolean;
    configured: boolean;
    error?: string;
    analysis?: {
      summary: string;
      possibleDiseases: Array<{ name: string; likelihood: 'low' | 'medium' | 'high'; note?: string }>;
      recommendedActions: string[];
    };
  };
  diseasePestFlags: string[];
  notes: string[];
  assessment: HiveAssessment;
  limitations: readonly string[];
}
