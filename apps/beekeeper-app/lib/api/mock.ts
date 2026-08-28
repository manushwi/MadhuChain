// In-memory mock data layer. Used when USE_MOCK === true so the app is fully
// functional before the backend is live. Mirrors the Section 6 API contract.

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

const now = Date.now();
const iso = (offsetMin: number) => new Date(now - offsetMin * 60000).toISOString();

const mockUser: User = {
  id: 'usr_1',
  name: 'Amara',
  email: 'amara@honeychain.app',
  phone: '+91 90000 00000',
  apiary_name: 'Amara’s Apiary',
  location: 'Kerala, India',
};

const reading = (t: number, h: number, w: number, b: number): Hive['lastReading'] => ({
  temperature: t,
  humidity: h,
  weight: w,
  activity: 0.6,
  battery: b,
  ts: iso(0),
});

const mockHives: Hive[] = [
  { id: 'h1', hive_id: 'SN-001', name: 'Hive 1 — Shade Grove', apiary: 'Amara’s Apiary', location: { latitude: 12.9716, longitude: 77.5946 }, status: 'HEALTHY', lastReading: reading(34.5, 62, 21.2, 88) },
  { id: 'h2', hive_id: 'SN-002', name: 'Hive 2 — Sunny Ridge', apiary: 'Amara’s Apiary', location: { latitude: 12.9756, longitude: 77.5996 }, status: 'WATCH', lastReading: reading(36.1, 55, 19.4, 41) },
  { id: 'h3', hive_id: 'SN-003', name: 'Hive 3 — Oak Corner', apiary: 'Amara’s Apiary', location: { latitude: 12.9696, longitude: 77.5896 }, status: 'ALERT', lastReading: reading(37.8, 51, 16.1, 12) },
];

const genReadings = (range: ReadingRange): ReadingPoint[] => {
  const points = range === 'day' ? 24 : range === 'week' ? 7 : 30;
  const step = range === 'day' ? 60 : range === 'week' ? 60 * 24 : 60 * 24;
  return Array.from({ length: points }).map((_, i) => ({
    ts: iso((points - i) * step),
    temperature: 34 + Math.sin(i / 2) * 2 + (i % 5) * 0.1,
    humidity: 58 + Math.cos(i / 3) * 4,
    weight: 20 - i * 0.05,
  }));
};

let mockBatches: Batch[] = [
  {
    batch_id: 'BATCH-001',
    lot_id: 'HC-LOT-001',
    barcode_id: 'HC-LOT-001',
    hive_ids: ['h1'],
    weight_kg: 12.5,
    harvest_start: '2026-08-01',
    harvest_end: '2026-08-03',
    status: 'RELEASED',
    created_at: iso(60 * 24 * 20),
    barcode: { payload: { lot_id: 'HC-LOT-001', weight_kg: 12.5, harvest_date: '2026-08-03' } },
  },
  {
    batch_id: 'BATCH-002',
    lot_id: 'HC-LOT-002',
    barcode_id: 'HC-LOT-002',
    hive_ids: ['h1', 'h2'],
    weight_kg: 18.0,
    harvest_start: '2026-08-18',
    harvest_end: '2026-08-20',
    status: 'IN TRANSIT',
    created_at: iso(60 * 24 * 6),
    barcode: { payload: { lot_id: 'HC-LOT-002', weight_kg: 18.0, harvest_date: '2026-08-20' } },
  },
];

const mockAlerts: Alert[] = [
  { id: 'a1', hive_id: 'h3', type: 'WEIGHT_DROP', message: 'Hive 3 — Oak Corner dropped 4.1 kg in 6h. Possible theft or collapse.', severity: 'high', acknowledged: false, created_at: iso(45) },
  { id: 'a2', hive_id: 'h3', type: 'LOW_BATTERY', message: 'Sensor SN-003 battery critically low (12%).', severity: 'high', acknowledged: false, created_at: iso(120) },
  { id: 'a3', hive_id: 'h2', type: 'BROOD_TEMP', message: 'Hive 2 brood temperature outside optimal range.', severity: 'medium', acknowledged: false, created_at: iso(300) },
  { id: 'a4', hive_id: 'h1', type: 'SWARMING', message: 'Possible swarming signal detected on Hive 1.', severity: 'low', acknowledged: true, created_at: iso(60 * 24 * 2) },
];

let seq = mockBatches.length + 1;

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  async signup(p: SignupRequest): Promise<AuthResponse> {
    await delay();
    return { token: 'mock-jwt', user: { ...mockUser, name: p.name, email: p.email, apiary_name: p.apiary_name, location: p.location } };
  },
  async login(p: LoginRequest): Promise<AuthResponse> {
    await delay();
    return { token: 'mock-jwt', user: mockUser };
  },
  async me(): Promise<User> {
    await delay(150);
    return mockUser;
  },
  async hives(): Promise<Hive[]> {
    await delay();
    return mockHives;
  },
  async createHive(input: { hive_id: string; name: string; location: { latitude: number; longitude: number } }): Promise<Hive> {
    await delay();
    const hive: Hive = { id: `h${mockHives.length + 1}`, hive_id: input.hive_id, name: input.name, apiary: mockUser.apiary_name, location: input.location, status: 'HEALTHY', lastReading: reading(34, 60, 20, 80) };
    mockHives.push(hive);
    return hive;
  },
  async hiveLive(id: string): Promise<Hive> {
    await delay();
    const h = mockHives.find((x) => x.id === id);
    if (!h) throw new Error('Hive not found');
    return h;
  },
  async readings(id: string, range: ReadingRange): Promise<ReadingPoint[]> {
    await delay();
    void id;
    return genReadings(range);
  },
  async mint(req: MintRequest): Promise<MintResponse> {
    await delay(700);
    const lot_id = `HC-LOT-${String(seq).padStart(3, '0')}`;
    const batch_id = `BATCH-${String(seq).padStart(3, '0')}`;
    seq += 1;
    const batch: Batch = {
      batch_id,
      lot_id,
      barcode_id: lot_id,
      hive_ids: req.hive_ids,
      weight_kg: req.weight_kg,
      harvest_start: req.harvest_start,
      harvest_end: req.harvest_end,
      status: 'MINTED',
      created_at: iso(0),
      barcode: { payload: { lot_id, weight_kg: req.weight_kg, harvest_date: req.harvest_end } },
    };
    mockBatches.unshift(batch);
    return { batch_id, lot_id, barcode_id: lot_id, payload: batch.barcode!.payload, status: 'MINTED' };
  },
  async batches(): Promise<Batch[]> {
    await delay();
    return mockBatches;
  },
  async barcode(id: string): Promise<Batch> {
    await delay();
    const b = mockBatches.find((x) => x.batch_id === id);
    if (!b) throw new Error('Batch not found');
    return b;
  },
  async alerts(): Promise<Alert[]> {
    await delay();
    return mockAlerts;
  },
  async ackAlert(id: string): Promise<Alert> {
    await delay();
    const a = mockAlerts.find((x) => x.id === id);
    if (!a) throw new Error('Alert not found');
    a.acknowledged = true;
    return a;
  },
  async profile(): Promise<User> {
    await delay(150);
    return mockUser;
  },
  async updateProfile(p: ProfileUpdate): Promise<User> {
    await delay();
    return { ...mockUser, ...p };
  },
};
