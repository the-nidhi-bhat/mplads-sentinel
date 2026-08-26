"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ThemeToggle from "./ThemeToggle";
import HeroCarousel from "./HeroCarousel";
import {
  NAV_ITEMS,
  STATS,
  MPLADS_FUND_FLOW,
  PIPELINE_STEPS,
  DETECTION_SIGNALS,
  SCORE_BANDS,
  EXAMPLE_EVIDENCE,
  AUDITOR_ROLES,
  FOOTER_LINKS,
  POSITIONING_LINE,
  DISCLAIMER,
  HERO_HEADLINE,
  HERO_PITCH,
  HERO_CTA_PRIMARY,
  HERO_CTA_SECONDARY,
  HERO_TRUST_LINE,
  FINAL_CTA_HEADLINE,
  FINAL_CTA_SUBTEXT,
  SCORE_EXPLAINER_DISCLAIMER,
} from "./content";

/* ── Tiny inline SVG icon helper ── */
function Icon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    shield: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    "shield-alert": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v4" /><path d="M12 16h.01" />
      </svg>
    ),
    database: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    "upload-cloud": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>
    ),
    cpu: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
      </svg>
    ),
    target: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
      </svg>
    ),
    "file-text": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    "user-check": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" />
      </svg>
    ),
    "indian-rupee": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="7" y1="4" x2="17" y2="4" /><line x1="7" y1="8" x2="17" y2="8" /><path d="M7 12h10" /><path d="M10 16c1.5 1.5 3 2 5 2 3 0 5-2 5-5" />
      </svg>
    ),
    clock: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    "map-pin": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    "building-2": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
      </svg>
    ),
    activity: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    search: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    eye: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    settings: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    check: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    "chevron-right": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
    alert_triangle: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    "arrow-right": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    users: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    info: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    "external-link": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    ),
    github: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
    x: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  };
  return icons[name] || null;
}

/* ── Reveal-on-scroll hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ── Section wrapper ── */
function Section({
  id,
  children,
  className = "",
  dark = false,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  const ref = useReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={`reveal section-padding ${dark ? "bg-navy text-white" : ""} ${className}`}
    >
      <div className="container-gov">{children}</div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const [isDark, setIsDark] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Sync theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("mplads-theme");
    if (stored) {
      setIsDark(stored === "dark");
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("mplads-theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  // Apply dark class on toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "dark" : ""}`}>
      {/* ─── 1. Top Government Strip ─── */}
      <div className={`border-b px-6 py-2 text-xs font-medium ${isDark ? "border-gov-border-dark bg-navy-dark text-gov-muted-dark" : "border-gov-border-light bg-navy text-white/80"}`}>
        <div className="container-gov flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon name="shield" className="w-3.5 h-3.5" />
            Government of India · MPLADS Monitoring
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline opacity-70">English</span>
            <span className="hidden sm:inline opacity-50">|</span>
            <span className="hidden sm:inline opacity-70">Font Size: A+ A A-</span>
          </div>
        </div>
      </div>

      {/* ─── 2. Header ─── */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${isDark ? "border-gov-border-dark bg-navy-dark/95" : "border-gov-border-light bg-white/95"}`}>
        <div className="container-gov flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5" aria-label="MPLADS Sentinel home">
            <Icon name="shield-alert" className={`w-7 h-7 ${isDark ? "text-saffron" : "text-navy"}`} />
            <div className="flex flex-col leading-tight">
              <span className={`text-lg font-extrabold tracking-tight ${isDark ? "text-white" : "text-navy"}`}>
                MPLADS SENTINEL
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-widest ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
                AI Audit Prioritization
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isDark
                    ? "text-gov-muted-dark hover:text-white hover:bg-white/5"
                    : "text-gov-muted-light hover:text-navy hover:bg-navy/5"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} size="sm" />
            <a
              href="#hero"
              className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                isDark
                  ? "bg-saffron text-navy-dark hover:bg-saffron-light"
                  : "bg-navy text-white hover:bg-navy-light"
              }`}
            >
              {HERO_CTA_PRIMARY}
              <Icon name="arrow-right" className="w-4 h-4" />
            </a>
            {/* Mobile nav toggle */}
            <button
              type="button"
              className={`lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border transition-colors ${
                isDark ? "border-gov-border-dark text-gov-muted-dark hover:text-white" : "border-gov-border-light text-gov-muted-light hover:text-navy"
              }`}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <Icon name="x" className="w-5 h-5" /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileNavOpen && (
          <nav className={`lg:hidden border-t px-6 py-4 ${isDark ? "border-gov-border-dark bg-navy-dark" : "border-gov-border-light bg-white"}`} aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`block py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isDark ? "text-gov-muted-dark hover:text-white" : "text-gov-muted-light hover:text-navy"
                }`}
              >
                {item.label}
              </a>
            ))}
            <a
              href="#hero"
              onClick={() => setMobileNavOpen(false)}
              className={`mt-3 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-lg ${
                isDark ? "bg-saffron text-navy-dark" : "bg-navy text-white"
              }`}
            >
              {HERO_CTA_PRIMARY} <Icon name="arrow-right" className="w-4 h-4" />
            </a>
          </nav>
        )}
      </header>

      {/* ─── 3. Hero ─── */}
      <section id="hero" className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
        <HeroCarousel isDark={isDark} />
        <div className="relative z-20 container-gov px-6 py-20">
          <div className="max-w-2xl">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 ${isDark ? "text-white" : "text-white"}`}>
              {HERO_HEADLINE}
            </h1>
            <p className={`text-lg sm:text-xl leading-relaxed mb-8 ${isDark ? "text-white/80" : "text-white/85"}`}>
              {HERO_PITCH}
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <a
                href="#"
                className={`inline-flex items-center gap-2 px-6 py-3 text-base font-bold rounded-lg transition-all ${
                  isDark
                    ? "bg-saffron text-navy-dark hover:bg-saffron-light shadow-lg shadow-saffron/20"
                    : "bg-saffron text-white hover:bg-saffron-dark shadow-lg shadow-saffron/30"
                }`}
              >
                {HERO_CTA_PRIMARY}
                <Icon name="arrow-right" className="w-5 h-5" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg border border-white/30 text-white transition-all hover:bg-white/10"
              >
                {HERO_CTA_SECONDARY}
              </a>
            </div>
            <p className={`text-sm font-medium tracking-wide ${isDark ? "text-white/50" : "text-white/60"}`}>
              {HERO_TRUST_LINE}
            </p>
          </div>
        </div>
      </section>

      {/* ─── 4. Stats Strip ─── */}
      <Section id="stats" className={`${isDark ? "bg-navy-dark border-y border-gov-border-dark" : "bg-navy border-y border-navy-light"}`}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-saffron font-mono tracking-tight">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium text-white/70">{stat.label}</div>
              {stat.note && (
                <div className="mt-0.5 text-[10px] text-white/40 italic">{stat.note}</div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 5. Understanding MPLADS ─── */}
      <Section id="overview">
        <div className="text-center mb-12">
          <h2 className={`text-3xl sm:text-4xl font-extrabold mb-4 ${isDark ? "text-white" : "text-navy"}`}>
            Understanding MPLADS
          </h2>
          <p className={`max-w-3xl mx-auto text-base leading-relaxed ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
            The Members of Parliament Local Area Development Scheme (MPLADS) was launched on
            23 December 1993, enabling MPs to recommend developmental works — emphasizing
            durable community assets — based on locally felt needs in their constituencies.
            Each MP receives an annual entitlement of ₹5 crore, administered by the Ministry
            of Statistics and Programme Implementation (MoSPI).
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MPLADS_FUND_FLOW.map((step, i) => (
            <div
              key={step.step}
              className={`relative rounded-xl border p-6 transition-all hover:shadow-lg ${
                isDark
                  ? "border-gov-border-dark bg-navy-light/50 hover:border-saffron/30"
                  : "border-gov-border-light bg-white hover:border-navy/20 hover:shadow-navy/5"
              }`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold mb-4 ${
                isDark ? "bg-saffron/20 text-saffron" : "bg-navy/10 text-navy"
              }`}>
                {i + 1}
              </div>
              <h3 className={`text-base font-bold mb-2 ${isDark ? "text-white" : "text-navy"}`}>
                {step.step}
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
                {step.description}
              </p>
              {i < MPLADS_FUND_FLOW.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                  <Icon name="chevron-right" className={`w-5 h-5 ${isDark ? "text-saffron/40" : "text-navy/30"}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 6. The Problem ─── */}
      <Section id="problem" dark>
        <div className="max-w-3xl mx-auto text-center">
          <Icon name="alert_triangle" className="w-12 h-12 text-saffron mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
            The challenge isn&apos;t a lack of data. It&apos;s knowing where to look first.
          </h2>
          <p className="text-lg text-white/70 leading-relaxed mb-8">
            With over 24,000 active MPLADS projects across India and limited audit capacity,
            manual review of every project is impractical. Traditional monitoring relies on
            delayed post-mortem audits — by the time anomalies are found, funds may already
            be misallocated. Sentinel turns a large project pool into an evidence-backed
            audit priority queue, so auditors can focus where it matters most.
          </p>
          <div className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg border ${
            isDark ? "border-saffron/30 bg-saffron/10 text-saffron" : "border-saffron/20 bg-saffron/5 text-saffron-dark"
          }`}>
            <Icon name="info" className="w-5 h-5" />
            <span className="text-sm font-semibold">
              Sentinel prioritizes attention — it does not establish wrongdoing.
            </span>
          </div>
        </div>
      </Section>

      {/* ─── 7. Positioning vs eSAKSHI ─── */}
      <Section id="positioning">
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-xl border p-8 sm:p-10 ${
            isDark ? "border-gov-border-dark bg-navy-light/30" : "border-gov-border-light bg-gov-bg-light"
          }`}>
            <div className="flex items-start gap-4 mb-6">
              <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                isDark ? "bg-india-green/20" : "bg-india-green/10"
              }`}>
                <Icon name="shield" className="w-6 h-6 text-india-green" />
              </div>
              <div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? "text-white" : "text-navy"}`}>
                  How Sentinel fits alongside eSAKSHI
                </h3>
                <blockquote className={`text-base leading-relaxed italic border-l-3 border-saffron pl-4 ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
                  {POSITIONING_LINE}
                </blockquote>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-8">
              {["eSAKSHI Portal", "Sentinel Analysis", "Human Investigation"].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`px-4 py-2.5 rounded-lg text-sm font-bold ${
                    i === 1
                      ? isDark ? "bg-saffron text-navy-dark" : "bg-navy text-white"
                      : isDark ? "bg-navy-light text-white/70 border border-gov-border-dark" : "bg-white text-navy border border-gov-border-light"
                  }`}>
                    {step}
                  </div>
                  {i < 2 && <Icon name="chevron-right" className={`w-5 h-5 hidden sm:block ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── 8. How Sentinel Works (Pipeline) ─── */}
      <Section id="how-it-works">
        <div className="text-center mb-12">
          <h2 className={`text-3xl sm:text-4xl font-extrabold mb-4 ${isDark ? "text-white" : "text-navy"}`}>
            How Sentinel Works
          </h2>
          <p className={`max-w-2xl mx-auto ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
            A six-step pipeline from raw data to human investigation, with full
            traceability at every stage.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PIPELINE_STEPS.map((step) => (
            <div
              key={step.number}
              className={`relative rounded-xl border p-6 transition-all hover:shadow-md group ${
                isDark
                  ? "border-gov-border-dark bg-navy-light/40 hover:border-saffron/20"
                  : "border-gov-border-light bg-white hover:shadow-lg hover:shadow-navy/5"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                  isDark
                    ? "bg-navy text-saffron group-hover:bg-saffron/20"
                    : "bg-navy/5 text-navy group-hover:bg-navy/10"
                }`}>
                  <Icon name={step.icon} className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold tracking-wider ${isDark ? "text-saffron" : "text-navy"}`}>
                  STEP {step.number}
                </span>
              </div>
              <h3 className={`text-base font-bold mb-2 ${isDark ? "text-white" : "text-navy"}`}>
                {step.title}
              </h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 9. Five Detection Signals ─── */}
      <Section id="signals" dark>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Five Detection Signals
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Each signal examines a different dimension of project data. Some are live in the
            prototype; others are designed for future extension.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DETECTION_SIGNALS.map((signal) => (
            <div
              key={signal.name}
              className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-saffron/20 hover:bg-white/8"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-saffron/15 text-saffron">
                  <Icon name={signal.icon} className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  signal.status === "live"
                    ? "bg-india-green/20 text-india-green"
                    : "bg-white/10 text-white/50"
                }`}>
                  {signal.status === "live" ? "Live in Prototype" : "Planned"}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-2">{signal.name}</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-3">{signal.description}</p>
              <p className="text-xs text-saffron/80 font-mono leading-relaxed">{signal.example}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 10. Audit Priority Score Explainer ─── */}
      <Section id="score">
        <div className="text-center mb-12">
          <h2 className={`text-3xl sm:text-4xl font-extrabold mb-4 ${isDark ? "text-white" : "text-navy"}`}>
            Audit Priority Score
          </h2>
          <p className={`max-w-2xl mx-auto ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
            A weighted composite of all five signals, producing a traceable score from 0 to 100.
            Weights are configurable — they reflect current model tuning, not fixed truths.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {SCORE_BANDS.map((band) => (
            <div
              key={band.label}
              className={`rounded-xl border p-6 text-center transition-all ${
                isDark
                  ? "border-gov-border-dark bg-navy-light/40 hover:shadow-lg"
                  : "border-gov-border-light bg-white hover:shadow-lg"
              }`}
            >
              <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                band.color === "risk-critical" ? "text-risk-critical"
                  : band.color === "risk-high" ? "text-risk-high"
                  : band.color === "risk-medium" ? "text-risk-medium"
                  : "text-risk-low"
              }`}>
                {band.label}
              </div>
              <div className={`text-2xl font-extrabold font-mono mb-2 ${isDark ? "text-white" : "text-navy"}`}>
                {band.range}
              </div>
              <p className={`text-sm ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
                {band.description}
              </p>
            </div>
          ))}
        </div>
        <div className={`text-center px-6 py-4 rounded-lg border ${
          isDark ? "border-saffron/20 bg-saffron/5" : "border-saffron/15 bg-saffron/5"
        }`}>
          <p className={`text-sm font-semibold ${isDark ? "text-saffron" : "text-saffron-dark"}`}>
            {SCORE_EXPLAINER_DISCLAIMER}
          </p>
        </div>
      </Section>

      {/* ─── 11. "Why Was This Flagged?" Evidence Card ─── */}
      <Section id="evidence">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className={`text-3xl sm:text-4xl font-extrabold mb-4 ${isDark ? "text-white" : "text-navy"}`}>
              Why Was This Flagged?
            </h2>
            <p className={`text-sm italic ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
              Illustrative example — project ID and data shown for demonstration purposes.
            </p>
          </div>
          <div className={`rounded-xl border overflow-hidden ${isDark ? "border-gov-border-dark" : "border-gov-border-light"}`}>
            {/* Project header */}
            <div className={`px-6 py-4 border-b flex flex-wrap items-center gap-3 ${
              isDark ? "border-gov-border-dark bg-navy-light/30" : "border-gov-border-light bg-gov-bg-light"
            }`}>
              <span className={`font-mono text-sm font-bold ${isDark ? "text-saffron" : "text-navy"}`}>
                MPL/KA/24081
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-risk-critical/15 text-risk-critical">
                Critical
              </span>
              <span className={`text-sm ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
                Construction of Community Hall, Belagavi, Karnataka
              </span>
            </div>
            {/* Evidence grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {EXAMPLE_EVIDENCE.map((ev, i) => (
                <div
                  key={ev.factor}
                  className={`px-6 py-5 border-b last:border-b-0 sm:last:border-b-0 sm:border-r ${
                    i < EXAMPLE_EVIDENCE.length - 2 || i === EXAMPLE_EVIDENCE.length - 1 ? "sm:border-r-0" : ""
                  } ${isDark ? "border-gov-border-dark" : "border-gov-border-light"}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm font-bold ${isDark ? "text-white" : "text-navy"}`}>
                      {ev.factor}
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      ev.riskClass === "critical" ? "bg-risk-critical/15 text-risk-critical"
                        : ev.riskClass === "high" ? "bg-risk-high/15 text-risk-high"
                        : "bg-risk-medium/15 text-risk-medium"
                    }`}>
                      {ev.points}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className={isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}>Observed</span>
                      <span className={`font-mono font-semibold ${isDark ? "text-white" : "text-navy"}`}>{ev.observed}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}>Benchmark</span>
                      <span className={`font-mono font-semibold ${isDark ? "text-white" : "text-navy"}`}>{ev.benchmark}</span>
                    </div>
                    <div className={`flex justify-between text-xs font-bold pt-2 border-t ${
                      isDark ? "border-gov-border-dark" : "border-gov-border-light"
                    }`}>
                      <span className={ev.riskClass === "critical" || ev.riskClass === "high" ? "text-risk-critical" : "text-risk-high"}>Deviation</span>
                      <span className={`font-mono ${ev.riskClass === "critical" || ev.riskClass === "high" ? "text-risk-critical" : "text-risk-high"}`}>{ev.deviation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── 12. Human-in-the-Loop ─── */}
      <Section id="auditors">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Icon name="user-check" className={`w-12 h-12 mx-auto mb-6 ${isDark ? "text-saffron" : "text-navy"}`} />
          <h2 className={`text-3xl sm:text-4xl font-extrabold mb-4 ${isDark ? "text-white" : "text-navy"}`}>
            AI Prioritizes. Humans Decide.
          </h2>
          <p className={`text-base leading-relaxed ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
            Sentinel never auto-declares fraud or triggers punitive action. Every flag is
            an invitation for a human auditor to examine the evidence. The final determination
            always rests with authorized officials.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {[
            { label: "AI Analysis", icon: "cpu" },
            { label: "Evidence Pack", icon: "file-text" },
            { label: "Human Review", icon: "user-check" },
            { label: "Decision", icon: "shield" },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                i === 2
                  ? isDark ? "border-saffron bg-saffron/10 text-saffron" : "border-navy bg-navy/5 text-navy"
                  : isDark ? "border-gov-border-dark bg-navy-light/40 text-white/70" : "border-gov-border-light bg-white text-gov-muted-light"
              }`}>
                <Icon name={step.icon} className="w-5 h-5" />
                <span className="text-sm font-semibold">{step.label}</span>
              </div>
              {i < 3 && <Icon name="chevron-right" className={`w-5 h-5 hidden sm:block ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`} />}
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 13. Who It's For ─── */}
      <Section id="roles" dark>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Who It&apos;s For
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Designed for the different roles involved in MPLADS oversight.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AUDITOR_ROLES.map((role) => (
            <div
              key={role.role}
              className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-saffron/20"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-saffron/15 text-saffron mb-4">
                <Icon name={role.icon} className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{role.role}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{role.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 14. Data Transparency ─── */}
      <Section id="transparency">
        <div className="max-w-3xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl font-extrabold text-center mb-8 ${isDark ? "text-white" : "text-navy"}`}>
            Data Transparency
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                title: "Public & Real Data",
                description: "Sourced from official MPLADS records and the eSAKSHI portal where publicly available.",
                color: "india-green",
              },
              {
                title: "Synthetic Validation",
                description: "Prototype testing uses clearly-labelled synthetic data that mimics real-world patterns.",
                color: "saffron",
              },
              {
                title: "Evidence Provenance",
                description: "Every result is traceable to its source record — no black-box outputs.",
                color: "navy",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-xl border p-6 text-center transition-all ${
                  isDark
                    ? "border-gov-border-dark bg-navy-light/40 hover:shadow-md"
                    : "border-gov-border-light bg-white hover:shadow-lg hover:shadow-navy/5"
                }`}
              >
                <div className={`w-2 h-2 rounded-full mx-auto mb-4 ${
                  item.color === "india-green" ? "bg-india-green"
                    : item.color === "saffron" ? "bg-saffron"
                    : "bg-navy"
                }`} />
                <h3 className={`text-sm font-bold mb-2 ${isDark ? "text-white" : "text-navy"}`}>
                  {item.title}
                </h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── 15. Responsible AI / Limitations ─── */}
      <Section id="responsible-ai" dark>
        <div className="max-w-3xl mx-auto text-center">
          <Icon name="shield" className="w-12 h-12 text-saffron mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
            Responsible AI & Limitations
          </h2>
          <div className="space-y-4 text-left max-w-2xl mx-auto">
            {[
              "An anomaly is not evidence of fraud. It is a statistical signal that warrants human review.",
              "Every investigation requires a qualified human auditor to examine the evidence and make a determination.",
              "Real-world data is always distinguished from synthetic validation data within the platform.",
              "Sentinel is an analytical layer — it does not have enforcement authority or access to classified data.",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-white/70 text-sm leading-relaxed"
              >
                <Icon name="check" className="w-5 h-5 text-india-green flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── 16. Final CTA ─── */}
      <Section id="cta">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className={`text-3xl sm:text-4xl font-extrabold mb-4 ${isDark ? "text-white" : "text-navy"}`}>
            {FINAL_CTA_HEADLINE}
          </h2>
          <p className={`text-base mb-8 ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
            {FINAL_CTA_SUBTEXT}
          </p>
          <a
            href="#"
            className={`inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-lg transition-all shadow-lg ${
              isDark
                ? "bg-saffron text-navy-dark hover:bg-saffron-light shadow-saffron/20"
                : "bg-navy text-white hover:bg-navy-light shadow-navy/20"
            }`}
          >
            {HERO_CTA_PRIMARY}
            <Icon name="arrow-right" className="w-5 h-5" />
          </a>
        </div>
      </Section>

      {/* ─── 17. Footer ─── */}
      <footer className={`border-t px-6 py-10 ${isDark ? "border-gov-border-dark bg-navy-dark" : "border-gov-border-light bg-gov-bg-light"}`}>
        <div className="container-gov">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            {/* Wordmark */}
            <div className="flex items-center gap-2.5">
              <Icon name="shield-alert" className={`w-6 h-6 ${isDark ? "text-saffron" : "text-navy"}`} />
              <div className="flex flex-col leading-tight">
                <span className={`text-base font-extrabold ${isDark ? "text-white" : "text-navy"}`}>
                  MPLADS SENTINEL
                </span>
                <span className={`text-[10px] font-medium ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
                  {DISCLAIMER}
                </span>
              </div>
            </div>
            {/* Links */}
            <div className="flex flex-wrap gap-4">
              {FOOTER_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isDark ? "text-gov-muted-dark hover:text-white" : "text-gov-muted-light hover:text-navy"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t ${
            isDark ? "border-gov-border-dark" : "border-gov-border-light"
          }`}>
            <p className={`text-xs ${isDark ? "text-gov-muted-dark" : "text-gov-muted-light"}`}>
              Smart India Hackathon 2026 · Problem Statement SIH26102
            </p>
            <a
              href="https://mplads.mospi.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                isDark ? "text-saffron hover:text-saffron-light" : "text-navy hover:text-navy-light"
              }`}
            >
              Official MPLADS–eSAKSHI portal (external)
              <Icon name="external-link" className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
