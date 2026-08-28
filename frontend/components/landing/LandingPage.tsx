"use client";

import { useState, useEffect, useRef } from "react";
import HeroCarousel from "./HeroCarousel";
import DocumentsModal from "./DocumentsModal";
import VideoModal from "./VideoModal";
import { useI18n } from "../../lib/i18n";
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
    play: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5.14v13.72a1 1 0 0 0 1.53.85l10.25-6.86a1 1 0 0 0 0-1.7L9.53 4.29A1 1 0 0 0 8 5.14Z" />
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
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={`reveal section-padding ${className}`}
    >
      <div className="container-gov">{children}</div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [fontScale, setFontScale] = useState<0.9 | 1 | 1.1>(1);
  const { locale, setLocale, t } = useI18n();

  useEffect(() => {
    const stored = localStorage.getItem("mplads-font-scale");
    if (stored === "0.9" || stored === "1" || stored === "1.1") {
      setFontScale(Number(stored) as 0.9 | 1 | 1.1);
    }
  }, []);

  const updateFontScale = (scale: 0.9 | 1 | 1.1) => {
    setFontScale(scale);
    localStorage.setItem("mplads-font-scale", String(scale));
    document.documentElement.style.setProperty("--font-scale", String(scale));
  };

  const navKeys = ["nav.home", "nav.about", "nav.howItWorks", "nav.signals", "nav.dashboard"] as const;
  const statKeys = ["stats.projects", "stats.states", "stats.signals", "stats.flagged"] as const;
  const stepKeys = ["data", "ingestion", "analysis", "score", "evidence", "human"] as const;
  const signalKeys = ["cost", "timeline", "spatial", "agency", "progress"] as const;
  const footerKeys = ["footer.about", "footer.methodology", "footer.dataSources", "footer.privacy", "footer.accessibility"] as const;
  const scoreKeys = ["low", "medium", "high", "critical"] as const;
  const scoreDescriptionKeys = ["lowDesc", "mediumDesc", "highDesc", "criticalDesc"] as const;
  const evidenceKeys = ["cost", "payment", "delay", "progress"] as const;
  const roleKeys = ["district", "monitoring", "state", "mospi"] as const;
  const heroHeadline = t("hero.headline").split(/(MPLADS:)/g);

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* ─── 1. Top Government Strip ─── */}
      <div className="border-b border-navy-light px-6 py-1.5 text-[11px] font-medium bg-navy text-white/75">
        <div className="container-gov flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            {t("topStrip")}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`transition-colors ${locale === "en" ? "text-teal font-bold" : "text-white/50 hover:text-white/80"}`}
            >
              EN
            </button>
            <span className="text-white/30">|</span>
            <button
              type="button"
              onClick={() => setLocale("hi")}
              className={`transition-colors ${locale === "hi" ? "text-teal font-bold" : "text-white/50 hover:text-white/80"}`}
            >
              HI
            </button>
            <span className="hidden sm:inline text-white/30 mx-1">|</span>
            <span className="hidden sm:inline">{t("fontSize")}</span>
            <button onClick={() => updateFontScale(0.9)} className={`hidden sm:inline text-white/60 hover:text-white ${fontScale === 0.9 ? "font-bold text-white" : ""}`} aria-label="Decrease font size">A-</button>
            <button onClick={() => updateFontScale(1)} className={`hidden sm:inline text-white/60 hover:text-white ${fontScale === 1 ? "font-bold text-white" : ""}`} aria-label="Default font size">A</button>
            <button onClick={() => updateFontScale(1.1)} className={`hidden sm:inline text-white/60 hover:text-white ${fontScale === 1.1 ? "font-bold text-white" : ""}`} aria-label="Increase font size">A+</button>
          </div>
        </div>
      </div>

      {/* ─── 2. Header ─── */}
      <header className="sticky top-0 z-50 border-b border-navy-light bg-navy transition-colors">
        <div className="container-gov flex items-center justify-between px-6 py-3">
          {/* Logo: emblem + stacked text */}
          <a href="#hero" className="flex items-center gap-3 shrink-0" aria-label="MPLADS Sentinel home">
            {/* Emblem placeholder — shield with Ashoka-style four lions silhouette */}
            <svg className="hidden h-10 w-10 text-white shrink-0 sm:block" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
              <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1" opacity="0.2" />
              <path d="M20 8 L24 16 L20 14 L16 16 Z" fill="currentColor" opacity="0.9" />
              <path d="M20 8 L26 18 L20 15 L14 18 Z" fill="currentColor" opacity="0.6" />
              <circle cx="20" cy="22" r="3" fill="currentColor" opacity="0.7" />
              <path d="M14 28 L20 25 L26 28" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5" />
            </svg>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-medium text-white/60 tracking-wide">
                {t("header.government")}
              </span>
              <span className="text-base font-extrabold text-white tracking-tight leading-snug">
                {t("header.brand")}
              </span>
              <span className="text-[9px] font-medium text-white/40 uppercase tracking-widest">
                {t("header.tagline")}
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-8" aria-label="Main navigation">
          {NAV_ITEMS.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                className={`nav-link-underline px-3 py-2 text-sm font-medium transition-colors ${
                  i === 0 ? "text-teal active" : "text-white/70 hover:text-white"
                }`}
              >
                {t(navKeys[i])}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/sign-in"
              className="hidden sm:inline-flex items-center px-4 py-1.5 text-sm font-semibold rounded-full bg-white text-navy hover:bg-white/90 transition-colors"
            >
              {t("header.login")}
            </a>
            {/* Mobile nav toggle */}
            <button
              type="button"
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/20 text-white/70 hover:text-white"
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
          <nav className="lg:hidden border-t border-white/10 px-6 py-4 bg-navy" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`block py-2.5 text-sm font-medium transition-colors ${
                  i === 0 ? "text-teal" : "text-white/70 hover:text-white"
                }`}
              >
                {t(navKeys[i])}
              </a>
            ))}
            <a
              href="/sign-in"
              onClick={() => setMobileNavOpen(false)}
              className="mt-3 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-full bg-white text-navy"
            >
              {t("header.login")}
            </a>
          </nav>
        )}
      </header>

      {/* ─── 3. Hero ─── */}
      <section id="hero" className="relative min-h-[600px] lg:min-h-[700px] flex items-center overflow-hidden">
        <HeroCarousel />
        <div className="relative z-20 container-gov px-6 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-white">
              {heroHeadline.map((part, index) => part === "MPLADS:" ? <span key={index} className="text-teal">{part}</span> : part)}
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed mb-8 text-white/85">
              {t("hero.pitch")}
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-bold rounded-lg transition-all bg-saffron text-white hover:bg-saffron-dark shadow-lg shadow-saffron/30"
              >
                {t("hero.enter")}
                <Icon name="arrow-right" className="w-5 h-5" />
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-lg border border-white/30 text-white transition-all hover:bg-white/10"
              >
                {t("hero.explore")}
              </a>
            </div>
            <p className="text-sm font-medium tracking-wide text-white/60">
              {t("hero.trust")}
            </p>
            <div className="mt-8 flex items-start gap-6">
              <button type="button" onClick={() => setShowDocsModal(true)} className="flex w-20 flex-col items-center gap-2 text-center text-xs font-semibold text-white/75 hover:text-white" aria-label="Documentation">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white shadow-lg ring-1 ring-white/20"><Icon name="file-text" className="h-5 w-5" /></span>
                Documentation
              </button>
              <button type="button" onClick={() => setShowVideoModal(true)} className="flex w-20 flex-col items-center gap-2 text-center text-xs font-semibold text-white/75 hover:text-white" aria-label="Demo Video">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/70 text-white shadow-lg ring-1 ring-white/20"><Icon name="play" className="ml-0.5 h-5 w-5" /></span>
                Demo Video
              </button>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-32" aria-hidden="true">
          <svg className="h-full w-full" viewBox="0 0 1200 64" preserveAspectRatio="none">
            <path d="M0 14C200 46 400 46 600 14s400-32 600 0v50H0Z" fill="var(--saffron)" />
            <path d="M0 28C200 60 400 60 600 28s400-32 600 0v28H0Z" fill="white" />
            <path d="M0 42C200 74 400 74 600 42s400-32 600 0v22H0Z" fill="var(--india-green)" />
          </svg>
        </div>
        {showDocsModal && <DocumentsModal onClose={() => setShowDocsModal(false)} />}
        {showVideoModal && <VideoModal onClose={() => setShowVideoModal(false)} />}
      </section>

      {/* ─── 4. Stats Strip ─── */}
      <Section id="stats" className="bg-navy border-y border-navy-light text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-extrabold text-saffron font-mono tracking-tight">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-medium text-white/70">{t(statKeys[i])}</div>
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
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gov-text">
            {t("overview.heading")}
          </h2>
          <p className="max-w-3xl mx-auto text-base leading-relaxed text-gov-muted">
            {t("overview.body")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MPLADS_FUND_FLOW.map((step, i) => (
            <div
              key={step.step}
              className="relative rounded-xl border border-gov-border p-6 transition-all hover:shadow-lg bg-gov-card hover:border-navy/20 hover:shadow-navy/5"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold mb-4 bg-navy/10 text-navy">
                {i + 1}
              </div>
              <h3 className="text-base font-bold mb-2 text-gov-text">
                {t(["step.data.title", "step.ingestion.title", "step.analysis.title", "step.score.title"][i] as Parameters<typeof t>[0])}
              </h3>
              <p className="text-sm leading-relaxed text-gov-muted">
                {t(["step.data.description", "step.ingestion.description", "step.analysis.description", "step.score.description"][i] as Parameters<typeof t>[0])}
              </p>
              {i < MPLADS_FUND_FLOW.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 z-10">
                  <Icon name="chevron-right" className="w-5 h-5 text-navy/30" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 6. The Problem ─── */}
      <Section id="problem" className="bg-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <Icon name="alert_triangle" className="w-12 h-12 text-saffron mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
            {t("problem.heading")}
          </h2>
          <p className="text-lg text-white/70 leading-relaxed mb-8">
            {t("problem.body")}
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-saffron/20 bg-saffron/5 text-saffron-dark">
            <Icon name="info" className="w-5 h-5" />
            <span className="text-sm font-semibold">
              {t("problem.note")}
            </span>
          </div>
        </div>
      </Section>

      {/* ─── 7. Positioning vs eSAKSHI ─── */}
      <Section id="positioning">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-gov-border p-8 sm:p-10 bg-[var(--bg-secondary)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-india-green/10">
                <Icon name="shield" className="w-6 h-6 text-india-green" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 text-gov-text">
                  How Sentinel fits alongside eSAKSHI
                </h3>
                <blockquote className="text-base leading-relaxed italic border-l-3 border-saffron pl-4 text-gov-muted">
                  {POSITIONING_LINE}
                </blockquote>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-8">
              {["eSAKSHI Portal", "Sentinel Analysis", "Human Investigation"].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`px-4 py-2.5 rounded-lg text-sm font-bold ${
                    i === 1
                      ? "bg-navy text-white"
                      : "bg-gov-card text-gov-text border border-gov-border"
                  }`}>
                    {step}
                  </div>
                  {i < 2 && <Icon name="chevron-right" className="w-5 h-5 hidden sm:block text-gov-muted" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── 8. How Sentinel Works (Pipeline) ─── */}
      <Section id="how-it-works">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gov-text">
            {t("how.heading")}
          </h2>
          <p className="max-w-2xl mx-auto text-gov-muted">
            {t("how.body")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PIPELINE_STEPS.map((step) => (
            <div
              key={step.number}
              className="relative rounded-xl border border-gov-border p-6 transition-all hover:shadow-md group bg-gov-card hover:shadow-lg hover:shadow-navy/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors bg-navy/5 text-navy group-hover:bg-navy/10">
                  <Icon name={step.icon} className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold tracking-wider text-gov-text">
                  STEP {step.number}
                </span>
              </div>
              <h3 className="text-base font-bold mb-2 text-gov-text">
                {t(["step.data.title", "step.ingestion.title", "step.analysis.title", "step.score.title", "step.evidence.title", "step.human.title"][step.number - 1] as Parameters<typeof t>[0])}
              </h3>
              <p className="text-sm leading-relaxed text-gov-muted">
                {t(["step.data.description", "step.ingestion.description", "step.analysis.description", "step.score.description", "step.evidence.description", "step.human.description"][step.number - 1] as Parameters<typeof t>[0])}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 9. Five Detection Signals ─── */}
      <Section id="signals" className="bg-navy text-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {t("signals.heading")}
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            {t("signals.body")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DETECTION_SIGNALS.map((signal, i) => (
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
              <h3 className="text-base font-bold text-white mb-2">{t(["signal.cost.name", "signal.timeline.name", "signal.spatial.name", "signal.agency.name", "signal.progress.name"][i] as Parameters<typeof t>[0])}</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-3">{t(["signal.cost.description", "signal.timeline.description", "signal.spatial.description", "signal.agency.description", "signal.progress.description"][i] as Parameters<typeof t>[0])}</p>
              <p className="text-xs text-saffron/80 font-mono leading-relaxed">{signal.example}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 10. Audit Priority Score Explainer ─── */}
      <Section id="score">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gov-text">
            {t("score.heading")}
          </h2>
          <p className="max-w-2xl mx-auto text-gov-muted">
            {t("score.body")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {SCORE_BANDS.map((band, i) => (
            <div
              key={band.label}
              className="rounded-xl border border-gov-border p-6 text-center transition-all bg-gov-card hover:shadow-lg"
            >
              <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                band.color === "risk-critical" ? "text-risk-critical"
                  : band.color === "risk-high" ? "text-risk-high"
                  : band.color === "risk-medium" ? "text-risk-medium"
                  : "text-risk-low"
              }`}>
                {t(`score.${scoreKeys[i]}` as Parameters<typeof t>[0])}
              </div>
              <div className="text-2xl font-extrabold font-mono mb-2 text-gov-text">
                {band.range}
              </div>
              <p className="text-sm text-gov-muted">
                {t(`score.${scoreDescriptionKeys[i]}` as Parameters<typeof t>[0])}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center px-6 py-4 rounded-lg border border-saffron/15 bg-saffron/5">
          <p className="text-sm font-semibold text-saffron-dark">
            {t("score.note")}
          </p>
        </div>
      </Section>

      {/* ─── 11. "Why Was This Flagged?" Evidence Card ─── */}
      <Section id="evidence">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gov-text">
              {t("evidence.heading")}
            </h2>
            <p className="text-sm italic text-gov-muted">
              {t("evidence.intro")}
            </p>
          </div>
          <div className="rounded-xl border border-gov-border overflow-hidden">
            {/* Project header */}
            <div className="px-6 py-4 border-b border-gov-border bg-[var(--bg-secondary)]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm font-bold text-gov-text">
                  MPL/KA/24081
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-risk-critical/15 text-risk-critical">
                  {t("evidence.critical")}
                </span>
                <span className="text-sm text-gov-muted">
                  {t("evidence.project")}
                </span>
              </div>
            </div>
            {/* Evidence grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {EXAMPLE_EVIDENCE.map((ev, i) => (
                <div
                  key={ev.factor}
                  className={`px-6 py-5 border-b border-gov-border last:border-b-0 sm:last:border-b-0 sm:border-r ${
                    i < EXAMPLE_EVIDENCE.length - 2 || i === EXAMPLE_EVIDENCE.length - 1 ? "sm:border-r-0" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gov-text">
                      {t(`evidence.${evidenceKeys[i]}` as Parameters<typeof t>[0])}
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
                      <span className="text-gov-muted">{t("evidence.observed")}</span>
                      <span className="font-mono font-semibold text-gov-text">{ev.observed}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gov-muted">{t("evidence.benchmark")}</span>
                      <span className="font-mono font-semibold text-gov-text">{ev.benchmark}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold pt-2 border-t border-gov-border">
                      <span className={ev.riskClass === "critical" || ev.riskClass === "high" ? "text-risk-critical" : "text-risk-high"}>{t("evidence.deviation")}</span>
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
          <Icon name="user-check" className="w-12 h-12 mx-auto mb-6 text-teal" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gov-text">
            {t("human.heading")}
          </h2>
          <p className="text-base leading-relaxed text-gov-muted">
            {t("human.body")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {[
            { label: "human.ai", icon: "cpu" },
            { label: "human.pack", icon: "file-text" },
            { label: "human.review", icon: "user-check" },
            { label: "human.decision", icon: "shield" },
          ].map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                i === 2
                  ? "border-navy bg-navy/5 text-gov-text"
                  : "border-gov-border bg-gov-card text-gov-muted"
              }`}>
                <Icon name={step.icon} className="w-5 h-5" />
                <span className="text-sm font-semibold">{t(step.label as Parameters<typeof t>[0])}</span>
              </div>
              {i < 3 && <Icon name="chevron-right" className="w-5 h-5 hidden sm:block text-gov-muted" />}
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 13. Who It's For ─── */}
      <Section id="roles" className="bg-navy text-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {t("roles.heading")}
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            {t("roles.body")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {AUDITOR_ROLES.map((role, i) => (
            <div
              key={role.role}
              className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-saffron/20"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-saffron/15 text-saffron mb-4">
                <Icon name={role.icon} className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{t(`role.${roleKeys[i]}` as Parameters<typeof t>[0])}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{t(`role.${roleKeys[i]}Desc` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ─── 14. Data Transparency ─── */}
      <Section id="transparency">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-8 text-gov-text">
            {t("transparency.heading")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { title: "transparency.public", description: "transparency.publicDesc", color: "india-green" },
              { title: "transparency.synthetic", description: "transparency.syntheticDesc", color: "saffron" },
              { title: "transparency.provenance", description: "transparency.provenanceDesc", color: "navy" },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-gov-border p-6 text-center transition-all bg-gov-card hover:shadow-lg hover:shadow-navy/5"
              >
                <div className={`w-2 h-2 rounded-full mx-auto mb-4 ${
                  item.color === "india-green" ? "bg-india-green"
                    : item.color === "saffron" ? "bg-saffron"
                    : "bg-navy"
                }`} />
                <h3 className="text-sm font-bold mb-2 text-gov-text">
                  {t(item.title as Parameters<typeof t>[0])}
                </h3>
                <p className="text-sm leading-relaxed text-gov-muted">
                  {t(item.description as Parameters<typeof t>[0])}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── 15. Responsible AI / Limitations ─── */}
      <Section id="responsible-ai" className="bg-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <Icon name="shield" className="w-12 h-12 text-saffron mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
            {t("responsible.heading")}
          </h2>
          <div className="space-y-4 text-left max-w-2xl mx-auto">
            {[
              "responsible.one",
              "responsible.two",
              "responsible.three",
              "responsible.four",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-white/70 text-sm leading-relaxed"
              >
                <Icon name="check" className="w-5 h-5 text-india-green flex-shrink-0 mt-0.5" />
                <span>{t(item as Parameters<typeof t>[0])}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─── 16. Final CTA ─── */}
      <Section id="cta">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gov-text">
            {t("cta.heading")}
          </h2>
          <p className="text-base mb-8 text-gov-muted">
            {t("cta.body")}
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold rounded-lg transition-all shadow-lg bg-navy text-white hover:bg-navy-light shadow-navy/20"
          >
            {t("hero.explore")}
            <Icon name="arrow-right" className="w-5 h-5" />
          </a>
        </div>
      </Section>

      {/* ─── 17. Footer ─── */}
      <footer className="border-t border-gov-border px-6 py-10 bg-[var(--bg-secondary)]">
        <div className="container-gov">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            {/* Wordmark */}
            <div className="flex items-center gap-3">
              <svg className="w-7 h-7 text-navy shrink-0" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1" opacity="0.2" />
                <path d="M20 8 L24 16 L20 14 L16 16 Z" fill="currentColor" opacity="0.9" />
                <path d="M20 8 L26 18 L20 15 L14 18 Z" fill="currentColor" opacity="0.6" />
                <circle cx="20" cy="22" r="3" fill="currentColor" opacity="0.7" />
                <path d="M14 28 L20 25 L26 28" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5" />
              </svg>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-extrabold text-gov-text">
                  MPLADS Sentinel
                </span>
                <span className="text-[10px] font-medium text-gov-muted">
                  {t("footer.disclaimer")}
                </span>
              </div>
            </div>
            {/* Links */}
            <div className="flex flex-wrap gap-4">
              {FOOTER_LINKS.map((link, i) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium transition-colors text-gov-muted hover:text-navy"
                >
                  {t(footerKeys[i])}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-gov-border">
            <p className="text-xs text-gov-muted">
              Smart India Hackathon 2026 · Problem Statement SIH26102
            </p>
            <a
              href="https://mplads.mospi.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors text-gov-text hover:text-saffron"
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
