import Link from "next/link";
import { Brand } from "./components/brand";

export default function NotFound() {
  return (
    <main className="message-page">
      <Brand />
      <section className="message-card danger-message">
        <span className="message-code">404 / RECORD NOT FOUND</span>
        <h1>This jar could not be found.</h1>
        <p>The code may be incomplete, mistyped, or not registered with HoneyChain. Check the label and try again.</p>
        <Link className="primary-link" href="/">Try another code <span>→</span></Link>
      </section>
    </main>
  );
}
