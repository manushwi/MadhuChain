import Link from 'next/link';
import { adminRegisterAction, loginAction } from '@/app/actions';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; mode?: string; registered?: string }> }) {
  const { error, mode, registered } = await searchParams;
  const registering = mode === 'register';
  return (
    <main className="login-shell">
      <section className="login-context">
        <div className="brand-mark">MC</div>
        <p className="eyebrow">KVIC Consortium Network</p>
        <h1>Evidence before assertion.</h1>
        <p className="login-copy">Monitor field telemetry, supply-chain custody, and cryptographic proofs from one accountable control room.</p>
        <div className="network-strip"><span>Traceable custody</span><span>Verified records</span><span>Accountable access</span></div>
      </section>
      <section className="login-panel">
        <div>
          <p className="eyebrow">Restricted access</p>
          <h2>{registering ? 'Register administrator' : 'Administrator sign in'}</h2>
          <p>{registering ? 'Create a KVIC administrator account with an authorized registration code.' : 'Use a provisioned KVIC administrator account.'}</p>
        </div>
        <nav className="auth-tabs" aria-label="Administrator access"><Link className={!registering ? 'active' : ''} href="/login">Sign in</Link><Link className={registering ? 'active' : ''} href="/login?mode=register">Register Admin</Link></nav>
        {registered ? <p className="success-banner">Administrator registered. Sign in with the new account.</p> : null}
        {error ? <p className="form-error">{error}</p> : null}
        {registering ? <form action={adminRegisterAction} className="form-stack">
          <label>Full name<input name="name" autoComplete="name" required /></label>
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" minLength={12} autoComplete="new-password" required /></label>
          <label>Registration code<input name="registration_code" type="text" autoComplete="off" aria-describedby="registration-code-help" required /></label>
          <small id="registration-code-help" className="field-help">Enter the authorization code issued for KVIC administrator registration.</small>
          <button className="button primary" type="submit">Register administrator</button>
        </form> : <form action={loginAction} className="form-stack">
          <label>Email<input name="email" type="email" autoComplete="username" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          <button className="button primary" type="submit">Enter control room</button>
        </form>}
        <p className="microcopy">Sessions are HttpOnly and limited to eight hours.</p>
      </section>
    </main>
  );
}
