import { Empty, PageHeader } from '@/components/ui';
import { api } from '@/lib/api';

type Audit = { id: string; actorId: string | null; actorRole: string | null; action: string; entityType: string; entityId: string | null; beforeHash: string | null; afterHash: string | null; createdAt: string };

export default async function AuditPage() {
  const data = await api<{ audit: Audit[]; total: number }>('/api/admin/audit?limit=100');
  return <main className="page"><PageHeader kicker="Accountability" title="Administrative audit trail" description="Tamper-evident hashes for changes made through KVIC administration APIs." />
    <section className="panel table-panel">{data.audit.length ? <div className="table-wrap"><table><thead><tr><th>Time</th><th>Action</th><th>Actor</th><th>Entity</th><th>Change anchors</th></tr></thead><tbody>{data.audit.map((row) => <tr key={row.id}><td>{new Date(row.createdAt).toLocaleString()}</td><td><strong>{row.action.replaceAll('_', ' ')}</strong></td><td>{row.actorRole ?? 'SYSTEM'}<code>{row.actorId?.slice(0, 16)}</code></td><td>{row.entityType}<small>{row.entityId}</small></td><td><code>{row.beforeHash ? `before ${row.beforeHash.slice(7, 19)}…` : 'new record'}</code><code>{row.afterHash ? `after ${row.afterHash.slice(7, 19)}…` : ''}</code></td></tr>)}</tbody></table></div> : <Empty>No administrative actions recorded.</Empty>}</section>
  </main>;
}
