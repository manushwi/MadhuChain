// Typed API endpoints matching the backend contract (services/backend).
//
// The REAL backend returns camelCase entities wrapped in response envelopes
// ({hives}, {batches}, {alerts}, {user}, {profile}, {hive, ...}, {readings})
// and uses chain `state` enums. The adapters below unwrap envelopes and map
// everything to this app's display contract (lib/types.ts) so screens keep
// working against live data.
import { get, post, put } from '@/lib/api/client';
import type {
  Alert,
  AuthResponse,
  Batch,
  BatchStatus,
  BatchLifecycleState,
  BarcodePayload,
  DiseaseAnalysis,
  Hive,
  HiveAssessment,
  LoginRequest,
  MintRequest,
  MintResponse,
  ProfileUpdate,
  ReadingPoint,
  ReadingRange,
  SignupRequest,
  User,
} from '@/lib/types';

// ---------------------------------------------------------------- adapters

function toUser(u: {
  id?: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string;
  apiaryName?: string | null;
  apiary_name?: string | null;
  location?: string | null;
  beeSpecies?: string | null;
  bee_species?: string | null;
  nectarSource?: string | null;
  nectar_source?: string | null;
}): User {
  return {
    id: u.id ?? '',
    name: u.name ?? '',
    email: u.email ?? '',
    phone: u.phone ?? undefined,
    role: u.role,
    apiary_name: u.apiaryName ?? u.apiary_name ?? '',
    location: u.location ?? '',
    beeSpecies: u.beeSpecies ?? u.bee_species ?? null,
    nectarSource: u.nectarSource ?? u.nectar_source ?? null,
  };
}

function toHive(h: {
  id: string;
  hiveId: string;
  name?: string | null;
  gpsLat?: number | null;
  gpsLng?: number | null;
  status?: string;
  assessment?: HiveAssessment;
  lastReading?: {
    temperature?: number | null;
    humidity?: number | null;
    weight?: number | null;
    battery?: number | null;
    ts?: string;
  } | null;
}): Hive {
  const lr = h.lastReading;
  const location = h.gpsLat != null && h.gpsLng != null
    ? { latitude: h.gpsLat, longitude: h.gpsLng }
    : undefined;
  return {
    id: h.id,
    hive_id: h.hiveId,
    name: h.name ?? h.hiveId,
    location,
    apiary: '',
    status: (h.status ?? 'NO_DATA') as Hive['status'],
    assessment: h.assessment,
    lastReading: lr
      ? {
           temperature: lr.temperature ?? undefined,
           humidity: lr.humidity ?? undefined,
           weight: lr.weight ?? undefined,
           battery: lr.battery ?? undefined,
          ts: lr.ts ?? '',
        }
      : undefined,
  };
}

function toReadingPoint(r: {
  ts: string;
  temperature?: number | null;
  humidity?: number | null;
  weight?: number | null;
}): ReadingPoint {
  return {
    ts: r.ts,
    temperature: r.temperature ?? undefined,
    humidity: r.humidity ?? undefined,
    weight: r.weight ?? undefined,
  };
}

const stateToStatus = (state: string): BatchStatus => {
  switch (state) {
    case 'HARVESTED':
    case 'COLLECTED':
      return 'MINTED';
    case 'LAB_APPROVED':
    case 'PROCESSED':
    case 'OUTPUT_APPROVED':
    case 'FINAL_QC':
      return 'PROCESSING';
    case 'RELEASED':
      return 'RELEASED';
    case 'FLAGGED':
      return 'FLAGGED';
    case 'COLLECTION_REJECTED':
    case 'LAB_REJECTED':
    case 'REVOKED':
      return 'REJECTED';
    default:
      return 'MINTED';
  }
};

const dateOnly = (d?: string | null): string => (d ? d.slice(0, 10) : '');

function toBatch(b: {
  batchId: string;
  lotId?: string | null;
  state?: string;
  status?: string;
  weightKg?: number | null;
  harvestStart?: string | null;
  harvestEnd?: string | null;
  createdAt?: string;
  hives?: Array<{ hiveId: string }>;
  hive_ids?: string[];
  barcodePayload?: BarcodePayload | null;
  sensorDataHash?: string | null;
  flagged?: boolean;
  flagReason?: string | null;
  flagResolution?: string | null;
  qualityTests?: Batch['quality_tests'];
  processingLog?: Batch['processing_logs'];
  jarSerials?: Batch['jars'];
  ownershipTransfer?: Batch['transfers'];
  blends?: Batch['blends'];
}): Batch {
  const state = (b.state ?? b.status ?? 'HARVESTED') as BatchLifecycleState;
  return {
    batch_id: b.batchId,
    lot_id: b.lotId ?? 'UNKNOWN',
    barcode_id: b.lotId ?? 'UNKNOWN',
    hive_ids: Array.isArray(b.hives) ? b.hives.map((h) => h.hiveId) : (b.hive_ids ?? []),
    weight_kg: b.weightKg ?? 0,
    harvest_start: dateOnly(b.harvestStart),
    harvest_end: dateOnly(b.harvestEnd),
    status: stateToStatus(state),
    lifecycle_state: state,
    sensor_data_hash: b.sensorDataHash ?? undefined,
    flagged: b.flagged,
    flag_reason: b.flagReason ?? undefined,
    flag_resolution: b.flagResolution ?? undefined,
    quality_tests: b.qualityTests ?? [],
    processing_logs: b.processingLog ?? [],
    jars: b.jarSerials ?? [],
    transfers: b.ownershipTransfer ?? [],
    blends: b.blends ?? [],
    barcode: b.barcodePayload ? { payload: b.barcodePayload } : undefined,
    created_at: b.createdAt ?? '',
  };
}

const alertTypeMap: Record<string, Alert['type']> = {
  SUDDEN_WEIGHT_DROP: 'SUDDEN_WEIGHT_DROP',
  INTERNAL_TEMPERATURE_OUT_OF_BAND: 'INTERNAL_TEMPERATURE_OUT_OF_BAND',
  INTERNAL_HUMIDITY_OUT_OF_BAND: 'INTERNAL_HUMIDITY_OUT_OF_BAND',
  LOW_BATTERY: 'LOW_BATTERY',
  TELEMETRY_STALE: 'TELEMETRY_STALE',
};

function toAlert(a: {
  id: string;
  hiveId: string;
  type: string;
  message: string;
  severity: string;
  acknowledged: boolean;
  ts: string;
}): Alert {
  return {
    id: a.id,
    hive_id: a.hiveId,
    type: alertTypeMap[a.type] ?? 'UNKNOWN',
    message: a.message,
    severity: a.severity === 'CRITICAL' ? 'high' : a.severity === 'WARNING' ? 'medium' : 'low',
    acknowledged: a.acknowledged,
    created_at: a.ts,
  };
}

// ---------------------------------------------------------------- real API

const real = {
  signup: async (p: SignupRequest): Promise<AuthResponse> => {
    const r = await post<{ token: string; user: Parameters<typeof toUser>[0] }>('/api/auth/signup', {
      ...p,
      role: 'BEEKEEPER',
    });
    return { token: r.token, user: toUser(r.user) };
  },
  login: async (p: LoginRequest): Promise<AuthResponse> => {
    const r = await post<{ token: string; user: Parameters<typeof toUser>[0] }>('/api/auth/login', p);
    return { token: r.token, user: toUser(r.user) };
  },
  me: async (): Promise<User> => {
    const r = await get<{ user: Parameters<typeof toUser>[0] }>('/api/auth/me');
    return toUser(r.user);
  },
  hives: async (): Promise<Hive[]> => {
    const r = await get<{ hives: Parameters<typeof toHive>[0][] }>('/api/hives');
    return r.hives.map(toHive);
  },
  createHive: async (b: {
    hive_id: string;
    name: string;
    location?: { latitude: number; longitude: number };
  }): Promise<Hive> => {
    const r = await post<{ hive: Parameters<typeof toHive>[0] }>('/api/hives', {
      hive_id: b.hive_id,
      name: b.name,
      gpsLat: b.location?.latitude,
      gpsLng: b.location?.longitude,
    });
    return toHive(r.hive);
  },
  hiveLive: async (id: string): Promise<Hive> => {
    const r = await get<{ hive: Parameters<typeof toHive>[0] }>(`/api/hives/${id}/live`);
    return toHive(r.hive);
  },
  analysis: async (id: string): Promise<DiseaseAnalysis> => {
    const r = await get<{ analysis: DiseaseAnalysis }>(`/api/hives/${id}/analysis`);
    return r.analysis;
  },
  readings: async (id: string, range: ReadingRange): Promise<ReadingPoint[]> => {
    const r = await get<{ readings: Parameters<typeof toReadingPoint>[0][] }>(
      `/api/hives/${id}/readings?range=${range}`,
    );
    return (r.readings ?? []).map(toReadingPoint);
  },
  mint: (b: MintRequest) => post<MintResponse>('/api/batches/mint', b),
  batches: async (): Promise<Batch[]> => {
    const r = await get<{ batches: Parameters<typeof toBatch>[0][] }>('/api/batches');
    return (r.batches ?? []).map(toBatch);
  },
  batch: async (id: string): Promise<Batch> => {
    const r = await get<{ batch: Parameters<typeof toBatch>[0] }>(`/api/batches/${id}`);
    return toBatch(r.batch);
  },
  barcode: (id: string) => get<{
    batch_id: string;
    payload: BarcodePayload;
    barcode_pdf_url?: string;
    barcode_pdf_base64?: string;
  }>(`/api/batches/${id}/barcode`),
  alerts: async (): Promise<Alert[]> => {
    const r = await get<{ alerts: Parameters<typeof toAlert>[0][] }>('/api/alerts');
    return (r.alerts ?? []).map(toAlert);
  },
  ackAlert: (id: string) => post<{ ok: true }>(`/api/alerts/${id}/ack`, {}),
  profile: async (): Promise<User> => {
    const r = await get<{ profile: Parameters<typeof toUser>[0] }>('/api/profile');
    return toUser(r.profile);
  },
  updateProfile: async (p: ProfileUpdate): Promise<User> => {
    const r = await put<{ profile: Parameters<typeof toUser>[0] }>('/api/profile', {
      name: p.name,
      phone: p.phone,
      apiary_name: p.apiary_name,
      location: p.location,
      bee_species: p.bee_species,
      nectar_source: p.nectar_source,
    });
    return toUser(r.profile);
  },
};

export const api = real;
