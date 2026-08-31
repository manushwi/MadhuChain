import Link from 'next/link';
import { api } from '@/lib/api';
import { reassessHivesAction } from '@/app/actions';
import { Empty, PageHeader, Status } from '@/components/ui';

type Hive = { id: string; hiveId: string; name: string | null; location: string | null; beekeeper: { id?: string; name: string } | null; readings: Array<{ ts: string; tempIn: number | null; humIn: number | null; weightKg: number | null }>; predictions: Array<{ status: string; dataQualityLabel: string; telemetryConditionScore: number | null; createdAt: string }> };
type HiveParams = { beekeeper_id?: string; search?: string; assessed?: string; error?: string };

export default async function HivesPage({ searchParams }: { searchParams: Promise<HiveParams> }) {
  const params = await searchParams;
  const query = new URLSearchParams({ limit: '100' });
  if (params.beekeeper_id) query.set('beekeeper_id', params.beekeeper_id);
  if (params.search) query.set('search', params.search);
  const data = await api<{ hives: Hive[]; total: number; beekeeper?: { id: string; name: string; email?: string | null } }>(`/api/admin/hives?${query}`);
  const beekeeperName = data.beekeeper?.name ?? data.hives.find((hive) => hive.beekeeper)?.beekeeper?.name;
  const filtered = Boolean(params.beekeeper_id);

  const aside = (
    <div className="header-actions">
      {params.error ? <span className="notice error">{params.error}</span> : null}
      {params.assessed ? <span className="notice success">Assessments recalculated ({params.assessed === 'all' ? 'all hives' : params.assessed})</span> : null}
      <form action={reassessHivesAction}>
        <input type="hidden" name="hive_id" value={params.beekeeper_id ?? ''} />
        <input type="hidden" name="returnTo" value={filtered ? `/hives?beekeeper_id=${encodeURIComponent(params.beekeeper_id!)}` : '/hives'} />
        <button className="button" type="submit">Recalculate assessments</button>
      </form>
      {filtered ? <Link className="button" href="/hives">View all hives</Link> : null}
    </div>
  );

  return <main className="page"><PageHeader kicker="Field intelligence" title={filtered ? `Hives for ${beekeeperName ?? 'selected beekeeper'}` : 'Hive signal registry'} description={filtered ? 'Filtered custodian view showing only hives assigned to this beekeeper.' : 'Latest readings and deterministic telemetry assessments across registered hives.'} aside={aside}/>
    {filtered ? <p className="filter-notice">Beekeeper filter <code>{params.beekeeper_id}</code> · <Link href="/directory">Return to members</Link></p> : null}
    <section className="panel table-panel">{data.hives.length ? <div className="table-wrap"><table><thead><tr><th>Hive</th><th>Custodian</th><th>Assessment</th><th>Data quality</th><th>Latest telemetry</th></tr></thead><tbody>{data.hives.map((hive) => { const reading = hive.readings[0]; const prediction = hive.predictions[0]; return <tr key={hive.id}><td><strong>{hive.name ?? hive.hiveId}</strong><code>{hive.hiveId}</code></td><td>{hive.beekeeper?.name ?? 'Unassigned'}</td><td><Status>{prediction?.status ?? 'NO_DATA'}</Status>{prediction?.telemetryConditionScore != null ? <small>Condition {prediction.telemetryConditionScore}/100</small> : null}</td><td>{prediction?.dataQualityLabel ?? 'INSUFFICIENT'}</td><td>{reading ? <span className="telemetry-line">{reading.tempIn ?? '-'} C · {reading.humIn ?? '-'}% · {reading.weightKg ?? '-'} kg<small>{new Date(reading.ts).toLocaleString()}</small></span> : 'No readings'}</td></tr>; })}</tbody></table></div> : <Empty>{filtered ? 'No hives are assigned to this beekeeper.' : 'No registered hives.'}</Empty>}</section>
  </main>;
}
