import type { Metadata } from 'next';
import { IBM_Plex_Mono, Manrope } from 'next/font/google';
import './globals.css';

const sans = Manrope({ variable: '--font-sans', subsets: ['latin'] });
const mono = IBM_Plex_Mono({ variable: '--font-mono', subsets: ['latin'], weight: ['400', '500', '600'] });

export const metadata: Metadata = {
  title: 'HoneyChain | KVIC Control Room',
  description: 'Consortium oversight, hive telemetry, and ledger evidence',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${sans.variable} ${mono.variable}`}><body>{children}</body></html>;
}
