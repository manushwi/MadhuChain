import { Brand } from "./components/brand";
import { VerificationForm } from "./components/verification-form";

export default function Home() {
  return (
    <main className="home-shell">
      <header className="site-header">
        <Brand />
        <span className="network-label"><i /> Secured record</span>
      </header>

      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">FROM HIVE TO HOME</p>
          <h1>Know the story<br />inside your jar.</h1>
          <p className="hero-intro">
            Every MadhuChain jar carries a unique record of its origin, quality,
            and journey. Scan the code on the label to verify yours.
          </p>
          <VerificationForm />
        </div>

        <div className="scan-illustration" aria-hidden="true">
          <div className="sun-disc" />
          <div className="flight-path" />
          <div className="bee">MC</div>
          <div className="jar-card">
            <div className="jar-lid" />
            <div className="jar-body">
              <div className="jar-label">
                <span>PURE &amp; TRACEABLE</span>
                <strong>HONEY</strong>
                <small>MADHUCHAIN VERIFIED</small>
              </div>
              <div className="qr-mini"><i /><i /><i /><i /></div>
            </div>
          </div>
          <p className="scan-note"><span>01</span> Point your camera at the QR code</p>
        </div>
      </section>

      <section className="how-it-works" aria-labelledby="how-title">
        <div>
          <p className="eyebrow">A TRUSTED TRAIL</p>
          <h2 id="how-title">Proof at every step.</h2>
        </div>
        <ol className="steps">
          <li><span>01</span><div><strong>Scan the seal</strong><p>Use your phone camera or enter the code printed beside the jar barcode.</p></div></li>
          <li><span>02</span><div><strong>Check the match</strong><p>Confirm the barcode, lot, and product record match the jar in your hand.</p></div></li>
          <li><span>03</span><div><strong>Follow its journey</strong><p>See the complete chain of custody, from harvest through packaging.</p></div></li>
        </ol>
      </section>

      <footer className="site-footer">
        <Brand />
        <p>Independent product traceability, backed by an immutable ledger.</p>
      </footer>
    </main>
  );
}
