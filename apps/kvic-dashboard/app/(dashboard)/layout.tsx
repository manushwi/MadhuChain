import { redirect } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import { AdminShell } from '@/components/admin-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    const result = await api<{ user: { role: string } }>('/api/auth/me');
    if (result.user.role !== 'ADMIN') redirect('/login');
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) redirect('/login');
    throw error;
  }
  return <AdminShell>{children}</AdminShell>;
}
