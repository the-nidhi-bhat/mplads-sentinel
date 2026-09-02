"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings, LogOut } from "lucide-react";
import { getStoredProfile } from "@/lib/auth";
import { getPageTitle } from "./navigation";

function useClickOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return ref;
}

function getNameInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  return initials || "U";
}

export default function Header({
  onOpenSidebar,
}: {
  onOpenSidebar: () => void;
}) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState({
    name: "Ananya Sharma",
    email: "a.sharma@example.com",
  });

  useEffect(() => {
    // Reflect whoever signed in, falling back to the mock defaults for direct
    // dev access when nothing is stored yet.
    const stored = getStoredProfile();
    if (stored) setUser(stored);
  }, []);

  const userMenuRef = useClickOutside(() => setUserMenuOpen(false));

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-gov-border bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          className="rounded-md p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-lg font-extrabold tracking-tight text-[var(--text-primary)]">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((current) => !current)}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-blue)] text-sm font-bold text-white transition-transform hover:scale-105"
          >
            {getNameInitials(user.name)}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-gov-border bg-white shadow-lg shadow-black/5">
              <div className="border-b border-gov-border px-4 py-3">
                <p className="text-sm font-bold text-[var(--text-primary)]">{user.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                <span className="mt-1.5 inline-block rounded-full bg-[var(--bg-card-hover)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
                  Auditor
                </span>
              </div>
              <div className="py-1.5">
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                >
                  <Settings className="h-4 w-4" />
                  User Settings
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--color-critical)] transition-colors hover:bg-[var(--bg-card-hover)]"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}