import { cookies } from 'next/headers';

const backendUrl = process.env.BACKEND_URL ?? 'http://localhost:4000';
const sessionCookie = 'honeychain_admin_session';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = (await cookies()).get(sessionCookie)?.value;
  const response = await fetch(`${backendUrl}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new ApiError(response.status, body.error ?? `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const response = await fetch(`${backendUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });
  const body = await response.json() as { token?: string; user?: { role: string }; error?: string };
  if (!response.ok || !body.token) throw new ApiError(response.status, body.error ?? 'Login failed');
  if (body.user?.role !== 'ADMIN') throw new ApiError(403, 'KVIC administrator access is required');
  return body.token;
}

export async function adminRegister(input: { name: string; email: string; password: string; registration_code: string }) {
  const response = await fetch(`${backendUrl}/api/auth/admin-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
  });
  const body = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new ApiError(response.status, body.error ?? 'Registration failed');
  return body;
}

export { sessionCookie };

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
