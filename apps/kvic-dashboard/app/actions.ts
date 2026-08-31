'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminRegister, api, login, sessionCookie } from '@/lib/api';

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  try {
    const token = await login(email, password);
    (await cookies()).set(sessionCookie, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8 });
  } catch (error) {
    redirect(`/login?error=${encodeURIComponent(error instanceof Error ? error.message : 'Login failed')}`);
  }
  redirect('/');
}

export async function logoutAction() {
  (await cookies()).delete(sessionCookie);
  redirect('/login');
}

export async function adminRegisterAction(formData: FormData) {
  try {
    await adminRegister({
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      registration_code: String(formData.get('registration_code') ?? ''),
    });
  } catch (error) {
    redirect(`/login?mode=register&error=${encodeURIComponent(error instanceof Error ? error.message : 'Registration failed')}`);
  }
  redirect('/login?registered=1');
}

export async function verifyProofAction(formData: FormData) {
  const txId = String(formData.get('transactionId') ?? '');
  const returnTo = safeReturnTo(formData.get('returnTo'), '/blockchain');
  try {
    await api(`/api/admin/fabric/events/${encodeURIComponent(txId)}/verify`, { method: 'POST' });
  } catch (error) {
    redirect(withMessage(returnTo, 'error', error instanceof Error ? error.message : 'Proof verification failed'));
  }
  redirect(withMessage(returnTo, 'verified', txId));
}

export async function updateAlertAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? 'ACKNOWLEDGED');
  const note = String(formData.get('note') ?? '');
  await api(`/api/admin/alerts/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status, note: note || undefined }) });
  redirect('/alerts');
}

export async function createUserAction(formData: FormData) {
  try {
    await api('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        password: String(formData.get('password') ?? ''),
        role: String(formData.get('role') ?? 'BEEKEEPER'),
      }),
    });
  } catch (error) {
    redirect(withMessage('/directory', 'error', error instanceof Error ? error.message : 'Member creation failed'));
  }
  redirect('/directory');
}

export async function updateUserStatusAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  const returnTo = safeReturnTo(formData.get('returnTo'), '/directory');
  if (!id || (status !== 'ACTIVE' && status !== 'DISABLED')) {
    redirect(withMessage(returnTo, 'error', 'Invalid user status request'));
  }
  try {
    await api(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    redirect(withMessage(returnTo, 'error', error instanceof Error ? error.message : 'User status update failed'));
  }
  redirect(withMessage(returnTo, 'updated', id));
}

// Re-run the latest assessment for every hive (or a single hive), useful after
// seeding data or after changing analytics/risk rules.
export async function reassessHivesAction(formData: FormData) {
  const hiveId = String(formData.get('hive_id') ?? '');
  const returnTo = safeReturnTo(formData.get('returnTo'), '/hives');
  const query = hiveId ? `?hive_id=${encodeURIComponent(hiveId)}` : '';
  try {
    await api(`/api/admin/hives/reassess${query}`, { method: 'POST' });
  } catch (error) {
    redirect(withMessage(returnTo, 'error', error instanceof Error ? error.message : 'Assessment recalculation failed'));
  }
  redirect(withMessage(returnTo, 'assessed', hiveId || 'all'));
}

function safeReturnTo(value: FormDataEntryValue | null, fallback: string) {
  const path = String(value ?? '');
  return path.startsWith('/') && !path.startsWith('//') ? path : fallback;
}

function withMessage(path: string, key: string, value: string) {
  const url = new URL(path, 'http://dashboard.local');
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}${url.hash}`;
}
