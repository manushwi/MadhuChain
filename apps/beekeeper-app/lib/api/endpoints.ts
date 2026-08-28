// Typed API endpoints matching the Section 6 backend contract.
// Routes through the mock layer when USE_MOCK is true, otherwise the real API.
import { USE_MOCK } from '@/constants/api';
import { mockApi } from '@/lib/api/mock';
import { get, post, put } from '@/lib/api/client';
import type {
  Alert,
  AuthResponse,
  Batch,
  Hive,
  LoginRequest,
  MintRequest,
  MintResponse,
  ProfileUpdate,
  ReadingPoint,
  ReadingRange,
  SignupRequest,
  User,
} from '@/lib/types';

const real = {
  signup: (p: SignupRequest) => post<AuthResponse>('/api/auth/signup', p),
  login: (p: LoginRequest) => post<AuthResponse>('/api/auth/login', p),
  me: () => get<User>('/api/auth/me'),
  hives: () => get<Hive[]>('/api/hives'),
  createHive: (b: { hive_id: string; name: string; location: { latitude: number; longitude: number } }) => post<Hive>('/api/hives', b),
  hiveLive: (id: string) => get<Hive>(`/api/hives/${id}/live`),
  readings: (id: string, range: ReadingRange) => get<ReadingPoint[]>(`/api/hives/${id}/readings?range=${range}`),
  mint: (b: MintRequest) => post<MintResponse>('/api/batches/mint', b),
  batches: () => get<Batch[]>('/api/batches'),
  barcode: (id: string) => get<Batch>(`/api/batches/${id}/barcode`),
  alerts: () => get<Alert[]>('/api/alerts'),
  ackAlert: (id: string) => post<Alert>(`/api/alerts/${id}/ack`, {}),
  profile: () => get<User>('/api/profile'),
  updateProfile: (p: ProfileUpdate) => put<User>('/api/profile', p),
};

export const api = USE_MOCK ? mockApi : real;
