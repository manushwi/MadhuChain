import Link from 'next/link';
import { verifyProofAction } from '@/app/actions';
import { AutoRefresh } from '@/components/auto-refresh';
import { PageHeader, Status } from '@/components/ui';
import { api } from '@/lib/api';

type JsonRecord = Record<string, unknown>;
type TransactionDetail = { event: JsonRecord; receipt: JsonRecord | null; proof: JsonRecord | null; comparison: JsonRecord | Array<JsonRecord> | null; proof_error?: string | null };
type DetailParams = { verified?: string; error?: string };

export default async function TransactionDetailPage({ params, searchParams }: { params: Promise<{ transactionId: string }>; searchParams: Promise<DetailParams> }) {
  const [{ transactionId }, query] = await Promise.all([params, searchParams]);
  const data = await api<TransactionDetail>(`/api/admin/fabric/events/${encodeURIComponent(transactionId)}`);
  const event = data.event;
  const receipt = data.receipt;
  const eventStatus = text(event.status) ?? 'INDEXED';
  const verificationStatus = text(event.verificationStatus);
  const payload = event.payload ?? event.payloadJson ?? receipt?.payload ?? receipt?.requestPayload ?? null;
  const actor = text(event.actorName) ?? text(event.actorId) ?? text(receipt?.actorId);
  const msp = text(event.actorMsp) ?? text(receipt?.actorMsp) ?? text(receipt?.mspId);

  return <main className="page transaction-detail">
    <AutoRefresh/>
    <PageHeader kicker="Fabric transaction evidence" title="Transaction detail" description="Indexed event, transaction receipt, payload proof, and field-by-field comparison." aside={<Link className="button" href="/blockchain">Back to register</Link>}/>
    {query.verified ? <p className="success-banner">Proof comparison refreshed.</p> : null}
    {query.error ? <p className="form-error">{query.error}</p> : null}

    <section className="transaction-identity">
      <div><span>Transaction ID</span><code>{transactionId}</code></div>
      <div><span>Block</span><strong>{display(event.blockNumber ?? receipt?.blockNumber)}</strong></div>
      <div><span>Event record</span><Status>{eventStatus}</Status></div>
      <div><span>Proof comparison</span>{verificationStatus ? <Status>{verificationStatus}</Status> : <strong>Not checked</strong>}</div>
    </section>

    <section className="split-grid detail-grid">
      <article className="panel"><div className="panel-head"><div><p className="eyebrow">Indexed event</p><h2>{display(event.eventType, 'Unnamed event')}</h2></div></div><dl className="record-fields">
        <Field label="Batch ID" value={event.batchId}/><Field label="Payload hash" value={event.payloadHash}/><Field label="Observed at" value={dateValue(event.observedAt)}/><Field label="Indexed at" value={dateValue(event.indexedAt)}/><Field label="Created at" value={dateValue(event.createdAt)}/>
      </dl></article>
      <article className="panel"><div className="panel-head"><div><p className="eyebrow">Identity context</p><h2>Actors and submitter</h2></div></div><dl className="record-fields">
        <Field label="Database actor" value={actor ?? 'Not recorded'}/><Field label="Application role" value={receipt?.actorRole}/><Field label="Fabric MSP" value={msp ?? 'Not reported'}/><Field label="Validation code" value={receipt?.validationCode ?? event.validationCode}/><Field label="Committed successfully" value={receipt?.successful}/><Field label="Channel" value={event.channel}/>
      </dl><p className="panel-note">The database actor is an application identity. The Fabric MSP is the submitting network membership identity; they are not interchangeable.</p></article>
    </section>

    <section className="panel proof-panel"><div className="panel-head"><div><p className="eyebrow">Independent check</p><h2>Proof and field comparison</h2></div>{event.payloadHash ? <form action={verifyProofAction}><input type="hidden" name="transactionId" value={transactionId}/><input type="hidden" name="returnTo" value={`/blockchain/${encodeURIComponent(transactionId)}`}/><button className="button primary" type="submit">{verificationStatus ? 'Reverify proof' : 'Verify proof'}</button></form> : null}</div>
      <p className="evidence-note">A mismatch describes this comparison result. It does not label the underlying business operation as an on-chain failure.</p>
      {data.proof_error ? <p className="form-error">On-chain proof could not be loaded: {data.proof_error}</p> : null}
      <Comparison value={data.comparison}/>
    </section>

    <section className="split-grid detail-grid">
      <JsonPanel title="Payload JSON" kicker="Event payload" value={payload}/>
      <JsonPanel title="Receipt JSON" kicker="Fabric receipt" value={receipt}/>
    </section>
    <section className="split-grid detail-grid">
      <JsonPanel title="Proof JSON" kicker="Verification evidence" value={data.proof}/>
      <JsonPanel title="Full event JSON" kicker="Indexer record" value={event}/>
    </section>
  </main>;
}

function Field({ label, value }: { label: string; value: unknown }) {
  return <div><dt>{label}</dt><dd>{display(value)}</dd></div>;
}

function Comparison({ value }: { value: TransactionDetail['comparison'] }) {
  if (!value) return <div className="empty">No field comparison has been returned.</div>;
  const rows: JsonRecord[] = Array.isArray(value) ? value : Object.entries(value).map(([field, result]) => typeof result === 'object' && result !== null ? { field, ...(result as JsonRecord) } : { field, result });
  return <div className="table-wrap"><table className="comparison-table"><thead><tr><th>Field</th><th>Database / indexed value</th><th>Fabric proof value</th><th>Comparison</th></tr></thead><tbody>{rows.map((row, index) => <tr key={`${display(row.field)}-${index}`}><td><strong>{display(row.field ?? row.name, `Field ${index + 1}`)}</strong></td><td><code>{display(row.local ?? row.database ?? row.indexed ?? row.expected)}</code></td><td><code>{display(row.onChain ?? row.fabric ?? row.proof ?? row.actual)}</code></td><td><Status>{row.matches === true ? 'MATCH' : row.matches === false ? 'MISMATCH' : display(row.status ?? row.result ?? row.match, 'NOT_REPORTED')}</Status></td></tr>)}</tbody></table></div>;
}

function JsonPanel({ title, kicker, value }: { title: string; kicker: string; value: unknown }) {
  return <article className="panel json-panel"><p className="eyebrow">{kicker}</p><h2>{title}</h2><pre>{value == null ? 'Not returned' : JSON.stringify(value, null, 2)}</pre></article>;
}

function text(value: unknown) {
  return typeof value === 'string' && value ? value : null;
}

function display(value: unknown, fallback = 'Not reported') {
  if (value == null || value === '') return fallback;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function dateValue(value: unknown) {
  const raw = text(value);
  return raw ? new Date(raw).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }) : 'Not reported';
}
