import type { AuthResponse, AuthUser } from './types';
import { get, post } from './client';

export async function login(p: { email?: string; phone?: string; password: string }): Promise<AuthResponse> {
  return post<AuthResponse>('/api/auth/login', {
    email: p.email,
    phone: p.phone,
    password: p.password,
  });
}

export async function me(): Promise<{ user: AuthUser }> {
  return get<{ user: AuthUser }>('/api/auth/me');
}
