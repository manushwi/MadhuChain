export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtWeight(kg: number | null | undefined): string {
  if (kg == null) return '—';
  return `${kg.toFixed(kg % 1 === 0 ? 0 : 1)} kg`;
}

export function fmtNum(n: number | null | undefined, digits = 2): string {
  if (n == null) return '—';
  return n.toFixed(digits);
}

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export function shortTx(tx: unknown): string {
  const s = typeof tx === 'string' ? tx : JSON.stringify(tx ?? '');
  if (!s) return '';
  return s.length > 26 ? `${s.slice(0, 26)}…` : s;
}