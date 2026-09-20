import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brand } from "../../components/brand";
import { CopyButton } from "../../components/copy-button";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type TimelineEvent = {
  event_type: string;
  title: string;
  summary: string;
  timestamp: string;
  actor: string;
  actor_msp: string;
  transaction_id: string;
  block_number: string | number;
  payload_hash: string;
  verification_status: string;
};

type Handler = {
  operator_id: string;
  name: string | null;
  role: string | null;
  stage: string | null;
};

type LatestReading = {
  hiveId: string;
  ts: string;
  tempIn: number | null;
  tempOut: number | null;
  humIn: number | null;
  weightKg: number | null;
  batteryV: number | null;
};

type HiveRecord = {
  hive_id: string;
  name: string | null;
  location: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  sensor_node_id: string | null;
  registered_at: string | null;
  latest_reading: LatestReading | null;
};

type JarRecord = { jar_id: string; packaged_at: string | null };

type Origin = {
  beekeeper: string | null;
  apiary: string | null;
  location: string | null;
  bee_species: string | null;
  nectar_source: string | null;
  harvest_start: string | null;
  harvest_end: string | null;
  weight_kg: number | null;
};

type Verification = {
  jar: { jar_id: string; verification_url: string; qr_data_url?: string; barcode_value: string; packaged_at: string | null };
  batch: { batch_id: string; lot_id: string; state: string };
  authenticity: { status: string; message: string };
  integrity: { database_matches_ledger: boolean; jar_membership_verified: boolean };
  origin: Origin;
  hives?: HiveRecord[];
  jars?: JarRecord[];
  quality: JsonValue;
  timeline: TimelineEvent[];
  handlers?: Handler[];
  on_chain: JsonValue;
};

type FetchResult =
  | { kind: "ok"; data: Verification }
  | { kind: "not-found" }
  | { kind: "unavailable" };

export const dynamic = "force-dynamic";

const backendUrl = (
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

async function getVerification(token: string): Promise<FetchResult> {
  try {
    const response = await fetch(
      `${backendUrl}/api/verify/token/${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );

    if (response.status === 404) return { kind: "not-found" };
    if (!response.ok) return { kind: "unavailable" };

    const data: unknown = await response.json();
    if (!isVerification(data)) return { kind: "unavailable" };
    return { kind: "ok", data };
  } catch {
    return { kind: "unavailable" };
  }
}

function isVerification(value: unknown): value is Verification {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return Boolean(
    record.jar && typeof record.jar === "object" &&
    record.batch && typeof record.batch === "object" &&
    record.authenticity && typeof record.authenticity === "object" &&
    record.integrity && typeof record.integrity === "object" &&
    Array.isArray(record.timeline),
  );
}

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function formatShortDate(value: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function humanReadableBarcode(value: string) {
  if (!value) return "Not recorded";
  return value.replace(/\W/g, " ").trim().replace(/\s+/g, " ") || value;
}

function showValue(value: JsonValue | undefined, field = ""): React.ReactNode {
  if (value === undefined || value === null || value === "") return <span className="muted-value">Not recorded</span>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "string") {
    return /(date|time|_at|start|end|^ts$)/i.test(field) ? formatDate(value) : value;
  }
  if (Array.isArray(value)) {
    if (!value.length) return <span className="muted-value">No records supplied</span>;
    return <div className="nested-list">{value.map((item, index) => <div className="nested-item" key={index}>{showValue(item)}</div>)}</div>;
  }
  return (
    <dl className="data-list">
      {Object.entries(value).map(([key, item]) => (
        <div key={key}><dt>{formatLabel(key)}</dt><dd>{showValue(item, key)}</dd></div>
      ))}
    </dl>
  );
}

function statusPresentation(data: Verification) {
  const status = String(data.authenticity.status || "unknown").toLowerCase();
  const batchState = String(data.batch.state || "").toLowerCase();
  const integrityOk = data.integrity.database_matches_ledger && data.integrity.jar_membership_verified;
  const dangerous = ["mismatch", "revoked", "flagged", "counterfeit", "invalid", "failed", "not_verified"].some((word) => status.includes(word));
  const verified = ["verified", "authentic", "genuine"].some((word) => status.includes(word));
  const batchConcern = ["flagged", "revoked", "mismatch", "recall", "quarantine", "suspended", "rejected"].some((word) => batchState.includes(word));

  if (dangerous) return { tone: "danger", title: formatLabel(status), kicker: "ACTION REQUIRED" };
  if (batchConcern) return { tone: "warning", title: `Batch ${formatLabel(batchState)}`, kicker: "VERIFY WITH CARE" };
  if (!integrityOk || !verified) return { tone: "warning", title: formatLabel(status), kicker: "VERIFY WITH CARE" };
  return { tone: "verified", title: "Authentic jar", kicker: "MADHUCHAIN VERIFIED" };
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  return {
    title: `Verify jar ${token}`,
    description: `MadhuChain authenticity and chain-of-custody record for jar token ${token}.`,
    robots: { index: false, follow: false },
  };
}

function ServiceUnavailable({ token }: { token: string }) {
  return (
    <main className="message-page">
      <Brand />
      <section className="message-card warning-message">
        <span className="message-code">SERVICE TEMPORARILY UNAVAILABLE</span>
        <h1>We cannot verify this jar right now.</h1>
        <p>No conclusion has been made about authenticity. The verification service or ledger may be temporarily unreachable. Please try again shortly.</p>
        <div className="attempted-token"><span>Token checked</span><strong>{token}</strong></div>
        <Link className="primary-link" href={`/v/${encodeURIComponent(token)}`}>Try again <span>↻</span></Link>
        <Link className="text-link" href="/">Check a different jar</Link>
      </section>
    </main>
  );
}

const JOURNEY_STEPS = [
  { state: "HARVESTED", label: "The hive", icon: "◆" },
  { state: "COLLECTED", label: "From apiary", icon: "☀" },
  { state: "LAB_APPROVED", label: "Lab approved", icon: "◐" },
  { state: "PROCESSED", label: "Processed", icon: "⊘" },
  { state: "RELEASED", label: "To your jar", icon: "●" },
];

function journeyIndex(state: string): number {
  const map: Record<string, number> = {
    HARVESTED: 0,
    COLLECTED: 1,
    COLLECTION_REJECTED: 1,
    LAB_APPROVED: 2,
    LAB_REJECTED: 2,
    PROCESSED: 3,
    OUTPUT_APPROVED: 4,
    RELEASED: 4,
    FLAGGED: 4,
    REVOKED: 4,
  };
  return map[state] ?? 4;
}

function Journey({ state }: { state: string }) {
  const reached = journeyIndex(state);
  const flagged = state === "FLAGGED";
  const closed = state === "REVOKED" || state === "COLLECTION_REJECTED" || state === "LAB_REJECTED";
  return (
    <ol className={`journey ${closed ? "journey-closed" : ""}`} aria-label="Journey of this jar">
      {JOURNEY_STEPS.map((step, index) => {
        const done = index < reached;
        const current = index === reached && !closed;
        return (
          <li key={step.state} className={done ? "done" : current ? "current" : ""}>
            <span className="journey-dot" aria-hidden="true">{step.icon}</span>
            <div><strong>{step.label}</strong><small>{formatLabel(step.state)}</small></div>
          </li>
        );
      })}
      {flagged ? <li className="current"><span className="journey-dot">!</span><div><strong>Under review</strong><small>FLAGGED</small></div></li> : null}
    </ol>
  );
}

function TempGauge({ reading }: { reading: LatestReading | null }) {
  if (!reading || (reading.tempIn == null && reading.tempOut == null)) {
    return <p className="muted-value">No live sensor data</p>;
  }
  const inside = reading.tempIn ?? reading.tempOut ?? 0;
  const outside = reading.tempOut;
  const pct = Math.max(0, Math.min(100, ((inside - 0) / (45 - 0)) * 100));
  return (
    <div className="temp-gauge">
      <div className="temp-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
      <div className="temp-values">
        {reading.tempIn != null ? <span><b>{reading.tempIn.toFixed(1)}°C</b> inside</span> : null}
        {reading.tempOut != null ? <span><b>{reading.tempOut.toFixed(1)}°C</b> outside</span> : null}
        {reading.humIn != null ? <span><b>{reading.humIn.toFixed(0)}%</b> humidity</span> : null}
        {reading.weightKg != null ? <span><b>{reading.weightKg.toFixed(1)} kg</b> on the hive</span> : null}
      </div>
      <p className="temp-asof">Snapshot · {formatDate(reading.ts)}</p>
    </div>
  );
}

export default async function VerificationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await getVerification(token);
  if (result.kind === "not-found") notFound();
  if (result.kind === "unavailable") return <ServiceUnavailable token={token} />;

  const data = result.data;
  const presentation = statusPresentation(data);
  const timeline = data.timeline
    .map((event, index) => ({ event, index }))
    .sort((a, b) => {
      const left = new Date(a.event.timestamp).getTime();
      const right = new Date(b.event.timestamp).getTime();
      return (Number.isNaN(left) || Number.isNaN(right)) ? a.index - b.index : left - right;
    })
    .map(({ event }) => event);

  const origin = data.origin;
  const hives = data.hives ?? [];
  const jars = data.jars ?? [];
  const qrUrl = data.jar.qr_data_url ? `${backendUrl.replace(/\/$/, "")}${data.jar.qr_data_url.replace(/^https?:\/\/[^/]+/, "")}` : null;

  return (
    <main className={`verification-shell tone-${presentation.tone}`}>
      <header className="site-header verification-header">
        <Brand />
        <Link className="check-another" href="/">Check another jar <span>→</span></Link>
      </header>

      <section className="status-hero">
        <div className="status-copy">
          <p className="eyebrow">{presentation.kicker}</p>
          <h1>{presentation.title}</h1>
          <p>{data.authenticity.message || "Verification status supplied by the MadhuChain record."}</p>
          <div className="hero-badges">
            <span className="badge badge-green"><i>✓</i> Blockchain sealed</span>
            <span className="badge"><i>✧</i> {jars.length} jar{jars.length === 1 ? "" : "s"} released</span>
          </div>
        </div>
        <div className="sticker-wrap">
          <div className="sticker-card">
            <div className="sticker-top">
              <span>SCAN TO VERIFY</span>
              <strong>{formatShortDate(data.jar.packaged_at)}</strong>
            </div>
            {qrUrl ? (
              <img className="sticker-qr" src={qrUrl} alt={`QR code for jar ${data.jar.jar_id}`} />
            ) : (
              <div className="sticker-qr sticker-qr-placeholder" aria-hidden="true" />
            )}
            <strong className="sticker-id">{data.jar.jar_id}</strong>
            <span className="sticker-token">{data.batch.batch_id}</span>
            <em>MadhuChain</em>
          </div>
        </div>
      </section>

      <section className="identity-grid" aria-label="Jar identity">
        <div className="identity-barcode">
          <span>Associated barcode</span>
          <strong className="barcode-value">{data.jar.barcode_value || "Not recorded"}</strong>
          {data.jar.barcode_value ? <em className="barcode-human">{humanReadableBarcode(data.jar.barcode_value)}</em> : null}
        </div>
        <div><span>Batch</span><strong>{data.batch.batch_id || "Not recorded"}</strong></div>
        <div><span>Lot</span><strong>{data.batch.lot_id || "Not recorded"}</strong></div>
        <div><span>Batch state</span><strong>{formatLabel(data.batch.state || "Unknown")}</strong></div>
        <div><span>Packaged</span><strong>{formatDate(data.jar.packaged_at)}</strong></div>
      </section>

      <section className="integrity-strip" aria-label="Record integrity checks">
        <div className={data.integrity.database_matches_ledger ? "pass" : "fail"}>
          <i>{data.integrity.database_matches_ledger ? "✓" : "!"}</i>
          <span><strong>Database matches ledger</strong><small>{data.integrity.database_matches_ledger ? "Record values agree" : "Record mismatch detected"}</small></span>
        </div>
        <div className={data.integrity.jar_membership_verified ? "pass" : "fail"}>
          <i>{data.integrity.jar_membership_verified ? "✓" : "!"}</i>
          <span><strong>Jar membership verified</strong><small>{data.integrity.jar_membership_verified ? "Jar belongs to this batch" : "Batch membership not verified"}</small></span>
        </div>
      </section>

      <section className="journey-section">
        <div className="section-heading"><span>00</span><div><p className="eyebrow">FROM HIVE TO HOME</p><h2>How this honey travelled</h2></div></div>
        <Journey state={data.batch.state} />
      </section>

      <div className="record-layout">
        <div className="record-main">
          <section className="record-section">
            <div className="section-heading"><span>01</span><div><p className="eyebrow">BLOOM TO BATCH</p><h2>The hives</h2></div></div>
            <div className="origin-hero">
              <div className="flora-card">
                <span className="flora-emoji" aria-hidden="true">🐝</span>
                <div>
                  <p className="eyebrow">Bee breed</p>
                  <strong>{origin.bee_species || "Not recorded"}</strong>
                </div>
                <div>
                  <p className="eyebrow">Floral source</p>
                  <strong>{origin.nectar_source || "Not recorded"}</strong>
                </div>
              </div>
              <dl className="data-panel origin-meta">
                <div><dt>Beekeeper</dt><dd>{origin.beekeeper || <span className="muted-value">Not recorded</span>}</dd></div>
                <div><dt>Apiary</dt><dd>{origin.apiary || <span className="muted-value">Not recorded</span>}</dd></div>
                <div><dt>Location</dt><dd>{origin.location || <span className="muted-value">Not recorded</span>}</dd></div>
                <div><dt>Harvest window</dt><dd>{formatDate(origin.harvest_start)} → {formatDate(origin.harvest_end)}</dd></div>
                <div><dt>Batch weight</dt><dd>{origin.weight_kg != null ? `${origin.weight_kg.toLocaleString("en-IN")} kg` : <span className="muted-value">Not recorded</span>}</dd></div>
              </dl>
            </div>
            {hives.length ? (
              <div className="hive-grid">
                {hives.map((hive) => (
                  <div className="hive-card" key={hive.hive_id}>
                    <div className="hive-head">
                      <span className="hive-icon" aria-hidden="true">◆</span>
                      <div>
                        <strong>{hive.name || hive.hive_id}</strong>
                        <span>{hive.hive_id}{hive.location ? ` · ${hive.location}` : ""}</span>
                      </div>
                    </div>
                    <TempGauge reading={hive.latest_reading} />
                    {hive.gps_lat != null && hive.gps_lng != null ? (
                      <p className="hive-gps">{hive.gps_lat.toFixed(4)}, {hive.gps_lng.toFixed(4)}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-timeline">No hive records were supplied for this batch.</div>
            )}
          </section>

          <section className="record-section">
            <div className="section-heading"><span>03</span><div><p className="eyebrow">LABORATORY</p><h2>Test results</h2></div></div>
            <div className="data-panel">{showValue(data.quality)}</div>
          </section>

          <section className="record-section">
            <div className="section-heading"><span>04</span><div><p className="eyebrow">PACKED IN THIS BATCH</p><h2>The jars</h2></div></div>
            {jars.length ? (
              <div className="jar-grid">
                {jars.map((jar) => (
                  <div className="jar-chip" key={jar.jar_id}>
                    <span className="jar-chip-lid" aria-hidden="true" />
                    <strong>{jar.jar_id}</strong>
                    <small>{formatShortDate(jar.packaged_at)}</small>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-timeline">No jar records were supplied for this batch.</div>
            )}
          </section>
        </div>

        <section className="record-section timeline-section">
          <div className="section-heading"><span>02</span><div><p className="eyebrow">EVERY STEP · OLDEST TO NEWEST</p><h2>Chain of custody</h2></div></div>
          {timeline.length ? (
            <ol className="timeline">
              {timeline.map((event, index) => (
                <li key={`${event.transaction_id || event.event_type}-${index}`}>
                  <div className="timeline-node">{String(index + 1).padStart(2, "0")}</div>
                  <div className="timeline-card">
                    <div className="event-topline">
                      <span>{formatLabel(event.event_type || "Chain event")}</span>
                      <em>{formatDate(event.timestamp)}</em>
                    </div>
                    <h3>{event.title || "Untitled event"}</h3>
                    <p>{event.summary || "No event summary supplied."}</p>
                    <dl className="event-proof">
                      <div><dt>Actor</dt><dd>{event.actor || "Not recorded"}</dd></div>
                      <div><dt>Network identity</dt><dd>{event.actor_msp || "Not recorded"}</dd></div>
                      <div><dt>Block</dt><dd>{event.block_number ?? "Not recorded"}</dd></div>
                      <div><dt>Proof status</dt><dd><span className="proof-chip">{formatLabel(event.verification_status || "Unknown")}</span></dd></div>
                      <div className="wide-proof"><dt>Transaction ID</dt><dd>{event.transaction_id || "Not recorded"}{event.transaction_id ? <CopyButton value={event.transaction_id} label="Copy ID" /> : null}</dd></div>
                      <div className="wide-proof"><dt>Payload hash</dt><dd>{event.payload_hash || "Not recorded"}</dd></div>
                    </dl>
                  </div>
                </li>
              ))}
            </ol>
          ) : <div className="empty-timeline">No chain events were supplied for this record.</div>}
        </section>
      </div>

      <section className="record-section handler-section">
        <div className="section-heading"><span>05</span><div><p className="eyebrow">HANDLED BY</p><h2>Who handled this honey</h2></div></div>
        {data.handlers && data.handlers.length ? (
          <div className="handler-grid">
            {data.handlers.map((h, index) => (
              <div className="handler-card" key={`${h.operator_id}-${index}`}>
                <div className="handler-name">{h.name || "Unnamed operator"}</div>
                <div className="handler-stage">{h.stage ? formatLabel(h.stage) : "—"}</div>
                <div className="handler-role">{h.role ? formatLabel(h.role) : "—"}</div>
                <code className="handler-id">{h.operator_id}</code>
              </div>
            ))}
          </div>
        ) : <div className="empty-timeline">No operator identity records were supplied for this batch.</div>}
      </section>

      <details className="ledger-details">
        <summary><span>On-chain record</span><small>View ledger data</small></summary>
        <div>{showValue(data.on_chain)}</div>
      </details>

      <footer className="verification-footer">
        <Brand />
        <p>This verification reflects the latest uncached record returned by MadhuChain.</p>
        <span>Token: {token}</span>
      </footer>
    </main>
  );
}