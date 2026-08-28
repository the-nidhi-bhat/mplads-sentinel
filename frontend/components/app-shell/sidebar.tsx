"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { NAV_ITEMS, isNavItemActive } from "./navigation";

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        aria-label="App navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gov-border bg-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gov-border px-5 py-4">
          <div className="flex items-center gap-3">
            <svg className="h-9 w-9 shrink-0 text-[var(--primary-blue)]" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
              <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1" opacity="0.2" />
              <path d="M20 8 L24 16 L20 14 L16 16 Z" fill="currentColor" opacity="0.9" />
              <path d="M20 8 L26 18 L20 15 L14 18 Z" fill="currentColor" opacity="0.6" />
              <circle cx="20" cy="22" r="3" fill="currentColor" opacity="0.7" />
              <path d="M14 28 L20 25 L26 28" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5" />
            </svg>
            <div className="leading-tight">
              <p className="text-sm font-extrabold tracking-tight text-[var(--text-primary)]">
                MPLADS Sentinel
              </p>
              <p className="text-[11px] font-medium text-[var(--text-muted)]">
                Audit Workspace · SIH 2026
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-md p-1.5 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item, pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                  active
                    ? "bg-[var(--primary-blue)] text-white shadow-sm shadow-[var(--primary-blue-glow)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span
                  className={`border-b-2 pb-0.5 ${
                    active ? "border-current" : "border-transparent group-hover:border-current"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gov-border px-5 py-3">
          <p className="text-[11px] text-[var(--text-muted)]">
            Explainable AI · Evidence-backed · Human-led
          </p>
        </div>
      </aside>
    </>
  );
}