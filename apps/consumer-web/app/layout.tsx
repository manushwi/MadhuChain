import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MadhuChain | Verify your honey",
    template: "%s | MadhuChain",
  },
  description: "Verify the origin, authenticity, quality, and complete chain of custody of a MadhuChain jar.",
  applicationName: "MadhuChain Verification",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#d99a1d",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
