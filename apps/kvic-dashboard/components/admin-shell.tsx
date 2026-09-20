import Link from 'next/link';
import { logoutAction } from '@/app/actions';

const navigation = [
  ['/', 'Overview'], ['/directory', 'Members'], ['/blockchain', 'Chain Activity'],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand"><span className="brand-mark small">MC</span><div><strong>MadhuChain</strong><span>KVIC control room</span></div></div>
        <nav>{navigation.map(([href, label], index) => <Link href={href} key={href}><span>{String(index + 1).padStart(2, '0')}</span>{label}</Link>)}</nav>
        <div className="sidebar-foot">KVIC administration session<form action={logoutAction}><button type="submit">Sign out</button></form></div>
      </aside>
      <div className="workspace"><header className="mobile-header"><strong>MadhuChain · KVIC</strong><nav>{navigation.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</nav></header>{children}</div>
    </div>
  );
}
