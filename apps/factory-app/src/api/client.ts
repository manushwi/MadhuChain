import { API_BASE_URL, API_CONFIGURATION_ERROR, TOKEN_STORAGE_KEY } from '@/constants/api';
import * as SecureStore from 'expo-secure-store';

// Set by AuthContext so any 401 observed later can force a session reset.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  init: { method?: string; body?: unknown; retries?: number; timeout?: number } = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(0, API_CONFIGURATION_ERROR ?? 'The backend API is not configured.');
  }
  const timeoutMs = init.timeout ?? 15000;
  let retries = init.retries ?? (init.method === undefined || init.method === 'GET' ? 1 : 0);

  for (;;) {
    const token = await getToken();
    let res: Response;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      res = await fetch(`${API_BASE_URL}${path}`, {
        method: init.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
        signal: ctrl.signal,
      });
    } catch {
      if (retries > 0) {
        retries -= 1;
        continue;
      }
      throw new ApiError(
        0,
        ctrl.signal.aborted
          ? `Request to ${API_BASE_URL} timed out.`
          : `Cannot reach the backend at ${API_BASE_URL}. Check the API URL and network connection.`,
      );
    } finally {
      clearTimeout(timer);
    }

    if (res.ok) {
      if (res.status === 204) return undefined as T;
      try {
        return (await res.json()) as T;
      } catch {
        throw new ApiError(res.status, `The backend returned an invalid JSON response for ${path}.`);
      }
    }

    if (res.status === 401) {
      unauthorizedHandler?.();
    }

    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = data?.message || data?.error || message;
    } catch {
      // fall through with generic message
    }
    if (res.status >= 500 && retries > 0) {
      retries -= 1;
      continue;
    }
    throw new ApiError(res.status, message);
  }
}

export const get = <T>(path: string, opts?: { retries?: number; timeout?: number }) =>
  apiFetch<T>(path, { retries: opts?.retries, timeout: opts?.timeout });
export const post = <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'POST', body });
