import Link from 'next/link';
import { createUserAction } from '@/app/actions';
import { Empty, PageHeader, Status } from '@/components/ui';
import { UserStatusForm } from '@/components/user-status-form';
import { api } from '@/lib/api';

type User = { id: string; name: string; email: string | null; phone?: string | null; role: string; status: string; lastLoginAt: string | null; createdAt: string; _count?: { hives: number } };
type MemberParams = { search?: string; status?: string; role?: string; page?: string; error?: string; updated?: string };

const roles = ['BEEKEEPER', 'TRANSPORTER', 'LABTECH', 'FACTORYWORKER', 'QCMANAGER', 'DISTRIBUTOR', 'ADMIN', 'CONSUMER'];
const createRoles = roles.filter((role) => role !== 'CONSUMER');
const pageSize = 25;

export default async function MembersPage({ searchParams }: { searchParams: Promise<MemberParams> }) {
  const params = await searchParams;
  const query = new URLSearchParams({ limit: String(pageSize), page: params.page ?? '1' });
  for (const key of ['search', 'status', 'role'] as const) if (params[key]) query.set(key, params[key]!);
  const data = await api<{ users: User[]; total: number; page: number }>(`/api/admin/users?${query}`);
  const returnQuery = new URLSearchParams();
  for (const key of ['search', 'status', 'role', 'page'] as const) if (params[key]) returnQuery.set(key, params[key]!);
  const returnTo = `/directory${returnQuery.size ? `?${returnQuery}` : ''}`;

  return <main className="page">
    <PageHeader kicker="Account administration" title="Members" description="View, add, and manage beekeeper, supply-chain, and administrator accounts." />
    {params.error ? <p className="form-error">{params.error}</p> : null}
    {params.updated ? <p className="success-banner">Member access status updated.</p> : null}

    <form className="filter-bar" method="get">
      <label><span>Search members</span><input name="search" defaultValue={params.search} placeholder="Name or email"/></label>
      <label><span>Status</span><select name="status" defaultValue={params.status ?? ''}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="DISABLED">Disabled</option></select></label>
      <label><span>Role</span><select name="role" defaultValue={params.role ?? ''}><option value="">All roles</option>{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
      <button className="button primary" type="submit">Apply filters</button><Link className="button" href="/directory">Clear</Link>
    </form>

    <section className="panel table-panel directory-table">
      <div className="section-heading"><div><p className="eyebrow">Member registry</p><h2>All accounts</h2><p>Access can be disabled or restored for every listed member.</p></div><span className="record-count">{data.users.length} of {data.total}</span></div>
      {data.users.length ? <div className="table-wrap"><table><thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Last login</th><th>Created</th><th>Hives</th><th>Access</th></tr></thead><tbody>{data.users.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><small>{user.email ?? user.phone ?? 'No contact recorded'}</small></td><td>{friendlyRole(user.role)}</td><td><Status>{user.status}</Status></td><td>{formatDate(user.lastLoginAt, 'Never')}</td><td>{formatDate(user.createdAt)}</td><td>{user.role === 'BEEKEEPER' ? <Link className="count-link" href={`/hives?beekeeper_id=${encodeURIComponent(user.id)}`}>{user._count?.hives ?? 0} hives</Link> : <span className="muted-value">Not applicable</span>}</td><td><UserStatusForm id={user.id} name={user.name} status={user.status} returnTo={returnTo}/></td></tr>)}</tbody></table></div> : <Empty>No members match these filters.</Empty>}
      <Pager current={data.page} total={data.total} params={params}/>
      <div className="panel-inset"><details><summary>Add member</summary><form action={createUserAction} className="form-grid"><input name="name" placeholder="Full name" required/><input name="email" type="email" placeholder="Email" required/><input name="password" type="password" minLength={12} placeholder="Temporary password (12+ chars)" required/><select name="role" defaultValue="BEEKEEPER">{createRoles.map((role) => <option key={role}>{role}</option>)}</select><button className="button primary" type="submit">Create member</button></form><p className="microcopy">Consumer accounts are created through the consumer registration flow.</p></details></div>
    </section>
  </main>;
}

function friendlyRole(role: string) {
  const labels: Record<string, string> = { BEEKEEPER: 'Beekeeper', FACTORYWORKER: 'Factory worker', QCMANAGER: 'QC manager', LABTECH: 'Lab technician', TRANSPORTER: 'Transporter', DISTRIBUTOR: 'Distributor', ADMIN: 'Administrator', CONSUMER: 'Consumer' };
  return labels[role] ?? role;
}

function formatDate(value: string | null | undefined, fallback = 'Not recorded') {
  return value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : fallback;
}

function Pager({ current, total, params }: { current: number; total: number; params: MemberParams }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return <nav className="pager" aria-label="Member pagination">
    {current > 1 ? <Link className="button compact" href={pageHref(params, current - 1)}>Previous</Link> : <span/>}
    <span>Page {current} of {pages}</span>
    {current < pages ? <Link className="button compact" href={pageHref(params, current + 1)}>Next</Link> : <span/>}
  </nav>;
}

function pageHref(params: MemberParams, page: number) {
  const query = new URLSearchParams();
  for (const key of ['search', 'status', 'role'] as const) if (params[key]) query.set(key, params[key]!);
  query.set('page', String(page));
  return `/directory?${query}`;
}
