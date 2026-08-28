// HTTP client for the real backend. Injected with the session token.
import { API_BASE_URL } from '@/constants/api';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_STORAGE_KEY } from '@/constants/api';

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
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const get = <T>(path: string) => apiFetch<T>(path);
export const post = <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'POST', body });
export const put = <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'PUT', body });
