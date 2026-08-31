export function PageHeader({ kicker, title, description, aside }: { kicker: string; title: string; description: string; aside?: React.ReactNode }) {
  return <header className="page-header"><div><p className="eyebrow">{kicker}</p><h1>{title}</h1><p>{description}</p></div>{aside}</header>;
}

export function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong>{note ? <small>{note}</small> : null}</article>;
}

export function Status({ children }: { children: React.ReactNode }) {
  const key = String(children).toLowerCase().replaceAll('_', '-');
  return <span className={`status status-${key}`}>{children}</span>;
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="empty">{children}</div>;
}
