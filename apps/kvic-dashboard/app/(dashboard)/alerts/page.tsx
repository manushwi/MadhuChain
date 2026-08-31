import { updateAlertAction } from '@/app/actions';
import { Empty, PageHeader, Status } from '@/components/ui';
import { api } from '@/lib/api';

type Alert = { id: string; type: string; severity: string; status: string; message: string; observedAt: string | null; ts: string; hive: { hiveId: string; name: string | null; beekeeper: { name: string } | null } };

export default async function AlertsPage() {
  const data = await api<{ alerts: Alert[]; total: number }>('/api/admin/alerts?limit=100');
  return <main className="page"><PageHeader kicker="Exception operations" title="Alert desk" description="Review measured telemetry exceptions, document action, and close condition episodes." />
    <section className="alert-grid">{data.alerts.length ? data.alerts.map((alert) => <article className="alert-card" key={alert.id}><div className="alert-top"><Status>{alert.severity}</Status><Status>{alert.status}</Status></div><p className="eyebrow">{alert.hive.name ?? alert.hive.hiveId} · {alert.type.replaceAll('_', ' ')}</p><h2>{alert.message}</h2><p>Owner: {alert.hive.beekeeper?.name ?? 'Unassigned'} · Observed {new Date(alert.observedAt ?? alert.ts).toLocaleString()}</p>{alert.status !== 'RESOLVED' ? <form action={updateAlertAction} className="inline-action"><input type="hidden" name="id" value={alert.id}/><input name="note" placeholder="Action or resolution note"/><button className="button compact" name="status" value={alert.status === 'OPEN' ? 'ACKNOWLEDGED' : 'RESOLVED'}>{alert.status === 'OPEN' ? 'Acknowledge' : 'Resolve'}</button></form> : null}</article>) : <Empty>No alerts recorded.</Empty>}</section>
  </main>;
}
