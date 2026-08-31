import {
  API_BASE_URL,
  API_CONFIGURATION_ERROR,
  API_FETCH_TIMEOUT_MS,
  TOKEN_STORAGE_KEY,
} from '@/constants/api';
import * as SecureStore from 'expo-secure-store';

let unauthorizedHandler: (() => void | Promise<void>) | undefined;

export function setUnauthorizedHandler(handler: (() => void | Promise<void>) | undefined) {
  unauthorizedHandler = handler;
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
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<T> {
  if (API_CONFIGURATION_ERROR) {
    throw new ApiError(0, API_CONFIGURATION_ERROR);
  }

  const token = await getToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_FETCH_TIMEOUT_MS);
  let res: Response;

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(0, `The API at ${API_BASE_URL} did not respond within ${API_FETCH_TIMEOUT_MS / 1000} seconds.`);
    }
    throw new ApiError(0, `Unable to reach the API at ${API_BASE_URL}. Check the server address and network connection.`);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (typeof data?.error === 'string') message = data.error;
      else if (typeof data?.message === 'string') message = data.message;
    } catch {
      // ignore parse errors
    }
    if (res.status === 401 && token && unauthorizedHandler) {
      await unauthorizedHandler();
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
