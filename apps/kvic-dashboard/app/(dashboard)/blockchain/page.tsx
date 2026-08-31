import Link from 'next/link';
import { AutoRefresh } from '@/components/auto-refresh';
import { Empty, PageHeader, Status } from '@/components/ui';
import { api } from '@/lib/api';

type Event = { txId: string; eventType: string; batchId: string | null; blockNumber: string | number | null; actorMsp: string | null; actorId?: string | null; actorName?: string | null; actorRole?: string | null; payloadHash: string | null; status: string | null; verificationStatus: string | null; observedAt: string | null; indexedAt?: string | null };
type ChainParams = { search?: string };

export default async function ChainActivityPage({ searchParams }: { searchParams: Promise<ChainParams> }) {
  const params = await searchParams;
  const query = new URLSearchParams({ limit: '100' });
  if (params.search) query.set('search', params.search);
  const data = await api<{ events: Event[]; total: number }>(`/api/admin/fabric/events?${query}`);

  return <main className="page chain-page">
    <AutoRefresh/>
    <PageHeader kicker="Ledger timeline" title="Chain Activity" description="A chronological feed of custody and processing events anchored to the HoneyChain ledger." aside={<div className="date-stamp">Network records<br/><strong>{data.total} events</strong></div>} />
    <form className="chain-search" method="get" role="search">
      <label><span>Search chain activity</span><input name="search" defaultValue={params.search} placeholder="Transaction, batch, event, actor MSP, or status"/></label>
      <button className="button primary" type="submit">Search</button>
      {params.search ? <Link className="button" href="/blockchain">Clear</Link> : null}
    </form>

    <section className="activity-feed screenshot-feed" aria-label="Chain activity feed">
      {data.events.length ? data.events.map((event) => <article className="activity-card" key={event.txId}>
        <Link className="activity-node" href={`/blockchain/${encodeURIComponent(event.txId)}`} aria-hidden="true" title="Open transaction detail"/>
        <div className="activity-main">
          <div className="activity-title"><div><p className="eyebrow">{formatTime(event.observedAt ?? event.indexedAt)}</p><h2>{friendlyEventName(event.eventType)}</h2></div><IntegrityBadge event={event}/></div>
          {event.batchId ? <p className="activity-batch">Batch <code>{event.batchId}</code></p> : null}
          <dl className="feed-fields">
            <div><dt>Actor</dt><dd><strong>{event.actorName ?? event.actorId ?? 'System actor'}</strong>{event.actorRole ? <span>{friendlyRole(event.actorRole)}</span> : null}</dd></div>
            <div><dt>Network identity</dt><dd><span>{event.actorMsp ?? 'Not reported'}</span></dd></div>
            <div><dt>Transaction id</dt><dd><code className="full-id">{event.txId}</code><span className="short-id">{shortTx(event.txId)}</span></dd></div>
            <div><dt>Payload hash</dt><dd><code className="full-id">{event.payloadHash ?? 'Not recorded'}</code></dd></div>
          </dl>
        </div>
        <div className="activity-when"><span>Block</span><strong>{event.blockNumber ?? 'Pending'}</strong><Link className="detail-link" href={`/blockchain/${encodeURIComponent(event.txId)}`}>View detail</Link></div>
      </article>) : <Empty>No chain activity matches this search.</Empty>}
    </section>
  </main>;
}

function IntegrityBadge({ event }: { event: Event }) {
  const value = event.verificationStatus ?? 'NOT CHECKED';
  return <div className="integrity-badge"><span>Integrity</span><Status>{value}</Status></div>;
}

function shortTx(value: string) {
  return value.length > 18 ? `${value.slice(0, 10)}…${value.slice(-6)}` : value;
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

function friendlyRole(role: string) {
  const labels: Record<string, string> = { BEEKEEPER: 'Beekeeper', FACTORYWORKER: 'Factory worker', QCMANAGER: 'QC manager', LABTECH: 'Lab technician', TRANSPORTER: 'Transporter', DISTRIBUTOR: 'Distributor', ADMIN: 'Administrator' };
  return labels[role] ?? role;
}

function formatTime(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }) : 'Time not reported';
}
