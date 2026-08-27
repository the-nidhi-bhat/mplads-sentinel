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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('mplads-theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches
                      ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                  var scale = localStorage.getItem('mplads-font-scale');
                  if (scale === '0.9' || scale === '1' || scale === '1.1') {
                    document.documentElement.style.setProperty('--font-scale', scale);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
