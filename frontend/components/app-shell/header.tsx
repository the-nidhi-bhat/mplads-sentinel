"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Settings, LogOut } from "lucide-react";
import { getStoredProfile } from "@/lib/auth";
import { getPageTitle } from "./navigation";

type Notification = {
  id: number;
  text: string;
  time: string;
  unread: boolean;
};

const mockNotifications: Notification[] = [
  { id: 1, text: "New project flagged: MPL/KA/24081", time: "5m ago", unread: true },
  { id: 2, text: "Agency watch: 3 recurring patterns detected", time: "2h ago", unread: true },
  { id: 3, text: "Data ingestion: sync completed for 214 records", time: "1d ago", unread: true },
];

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
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

  const unreadCount = notifications.filter((notification) => notification.unread).length;

  const notificationsRef = useClickOutside(() => setNotificationsOpen(false));
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
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen((current) => !current);
              setUserMenuOpen(false);
            }}
            aria-label={`Notifications (${unreadCount} unread)`}
            aria-expanded={notificationsOpen}
            className="relative rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <>
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-critical)]" />
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-critical)] opacity-60" />
                </span>
              </>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gov-border bg-white shadow-lg shadow-black/5">
              <div className="flex items-center justify-between border-b border-gov-border px-4 py-3">
                <p className="text-sm font-bold text-[var(--text-primary)]">Notifications</p>
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((current) =>
                      current.map((notification) => ({ ...notification, unread: false }))
                    )
                  }
                  className="text-xs font-semibold text-[var(--primary-blue)] transition-colors hover:text-[var(--primary-blue-hover)]"
                >
                  Mark all as read
                </button>
              </div>
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="flex items-start gap-3 border-b border-gov-border px-4 py-3 last:border-b-0"
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        notification.unread ? "bg-[var(--color-critical)]" : "bg-[var(--text-muted)]/40"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {notification.text}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {notification.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div ref={userMenuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen((current) => !current);
              setNotificationsOpen(false);
            }}
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