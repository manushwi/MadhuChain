import Link from 'next/link';
import { api } from '@/lib/api';
import { Metric, PageHeader, Status } from '@/components/ui';

type RecentEvent = { txId: string; eventType: string; batchId: string | null; blockNumber: string | number | null; actorMsp: string | null; status: string | null; verificationStatus: string | null; payloadHash: string | null; indexedAt: string };

export default async function OverviewPage() {
  const [data, beekeepers] = await Promise.all([
    api<{ metrics: Record<string, number>; recent_events: RecentEvent[] }>('/api/admin/overview'),
    api<{ total: number }>('/api/admin/users?role=BEEKEEPER&limit=1'),
  ]);

  return (
    <main className="page">
      <PageHeader kicker="National operations snapshot" title="Trust, field to ledger" description="KVIC consortium oversight: member accounts, field inventory, and the anchored blockchain event stream." aside={<div className="date-stamp">Live read model<br/><strong>honeychannel</strong></div>} />
      <section className="metric-grid metric-grid-single">
        <Link className="metric-link" href="/directory?role=BEEKEEPER"><Metric label="Beekeepers" value={beekeepers.total ?? 0} note="View all beekeepers" /></Link>
      </section>
      {data.recent_events.length ? <ChainPreview events={data.recent_events} /> : null}
    </main>
  );
}

function ChainPreview({ events }: { events: RecentEvent[] }) {
  return (
    <section className="panel latest-chain">
      <div className="panel-head"><div><p className="eyebrow">Fabric stream</p><h2>Latest chain activity</h2><p>The most recent proof events anchored to the ledger.</p></div><Link className="button compact" href="/blockchain">View all</Link></div>
      <div className="latest-chain-list">{events.map((event) => <Link className="latest-chain-row" href={`/blockchain/${encodeURIComponent(event.txId)}`} key={event.txId}>
        <div className="latest-chain-main"><strong>{friendlyEventName(event.eventType)}</strong><code>{batchLabel(event)}</code></div>
        <div className="latest-chain-meta"><span>{event.actorMsp ?? 'Identity not reported'}</span><time>{new Date(event.indexedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</time></div>
        <div className="latest-chain-side"><Status>{event.verificationStatus ?? 'NOT CHECKED'}</Status>{event.blockNumber != null ? <span>Block {event.blockNumber}</span> : null}</div>
      </Link>)}</div>
    </section>
  );
}

function batchLabel(event: RecentEvent) {
  return event.batchId ? `Batch ${event.batchId}` : event.txId.slice(0, 18) + '…';
}

function friendlyEventName(value: string) {
  const known: Record<string, string> = {
    HarvestBatchCreated: 'Harvest batch anchored', CollectionRecorded: 'Collection recorded',
    LabResultRecorded: 'Laboratory result anchored', ProcessingRecorded: 'Processing recorded',
    PackagingRecorded: 'Packaging recorded', CustodyTransferred: 'Custody transferred',
    FraudFlagged: 'Batch review flag recorded', FraudFlagResolved: 'Batch flag resolved', BatchRevoked: 'Batch revoked',
  };
  return known[value] ?? value.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('_', ' ');
}
