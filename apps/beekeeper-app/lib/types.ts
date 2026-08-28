// Domain types matching the backend API contract (Section 6).

export type Scheme = 'light' | 'dark';

export type HiveStatus = 'HEALTHY' | 'WATCH' | 'ALERT';

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface LiveReading {
  temperature: number; // °C
  humidity: number; // %
  weight: number; // kg
  activity: number; // relative 0..1
  battery: number; // %
  ts: string;
}

export interface Hive {
  id: string;
  hive_id: string; // sensor node id
  name: string;
  location: GeoPoint;
  apiary: string;
  status: HiveStatus;
  lastReading?: LiveReading;
}

export type ReadingRange = 'day' | 'week' | 'month';

export interface ReadingPoint {
  ts: string;
  temperature: number;
  humidity: number;
  weight: number;
  activity?: number;
}

export type BatchStatus =
  | 'MINTED'
  | 'IN TRANSIT'
  | 'AT FACTORY'
  | 'PROCESSING'
  | 'RELEASED'
  | 'FLAGGED';

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
  barcode?: {
    payload: BarcodePayload;
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
}

export type AlertType =
  | 'WEIGHT_DROP'
  | 'BROOD_TEMP'
  | 'LOW_BATTERY'
  | 'SWARMING';

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
  apiary_name: string;
  location: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  apiary_name: string;
  location: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProfileUpdate {
  name?: string;
  apiary_name?: string;
  location?: string;
  phone?: string;
}
