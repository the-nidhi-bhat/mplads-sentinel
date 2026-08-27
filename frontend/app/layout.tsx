import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "../lib/i18n";

export const metadata: Metadata = {
  title: "MPLADS Sentinel — AI Audit Prioritization Platform",
  description:
    "An explainable AI audit-prioritization tool for MPLADS. Identifies unusual patterns in public project data and prioritizes projects for human review.",
  keywords: [
    "MPLADS",
    "audit",
    "AI",
    "government",
    "public works",
    "anomaly detection",
    "Smart India Hackathon",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
