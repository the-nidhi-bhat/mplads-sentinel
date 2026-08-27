"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  KeyRound,
  Laptop,
  Lock,
  LogOut,
  Monitor,
  Pencil,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  User,
  type LucideIcon,
} from "lucide-react";
import { projectsData } from "@/lib/mock-data";

const FIELD_CLASS =
  "w-full rounded-lg border border-gov-border bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-glow)]";

const PRIMARY_BTN =
  "inline-flex items-center gap-2 rounded-lg bg-[var(--primary-blue)] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[var(--primary-blue-hover)] hover:shadow-md hover:shadow-[var(--primary-blue-glow)] active:scale-[0.98]";

const SECONDARY_BTN =
  "inline-flex items-center gap-2 rounded-lg border border-gov-border px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]";

const DANGER_BTN =
  "inline-flex items-center gap-2 rounded-lg bg-[var(--color-critical)] px-4 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]";

const RISK_LEVELS = [
  { value: "All", label: "All risk levels" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

// Same locale list the landing page top strip uses.
const LANGUAGES = ["English", "हिन्दी"];

const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

// The dashboard dataset does not yet carry district or work-type fields, so
// these are sample options until the backend provides them.
const SAMPLE_DISTRICTS = [
  "All Districts",
  "Belagavi",
  "Bengaluru Urban",
  "Chamarajanagar",
  "Dakshina Kannada",
  "Mysuru",
  "Udupi",
];

const SAMPLE_WORK_TYPES = [
  "All works",
  "Community Hall",
  "Road Works",
  "School Building",
  "Water Supply",
];

// Reuses the established critical/high/medium/low color tokens (no new color
// system) so notification styling matches the risk badges elsewhere.
const RISK_TONES = {
  critical: {
    badge:
      "bg-[var(--color-critical-bg)] text-[var(--color-critical)] border-[var(--color-critical-border)]",
    dot: "bg-[var(--color-critical)]",
  },
  high: {
    badge: "bg-[var(--color-high-bg)] text-[var(--color-high)] border-[var(--color-high-border)]",
    dot: "bg-[var(--color-high)]",
  },
  low: {
    badge: "bg-[var(--color-low-bg)] text-[var(--color-low)] border-[var(--color-low-border)]",
    dot: "bg-[var(--color-low)]",
  },
} as const;

const NOTIFICATION_PREFS = [
  {
    key: "critical",
    label: "Critical risk alerts",
    description: "Projects flagged critical by the anomaly engine",
    defaultOn: true,
  },
  {
    key: "high",
    label: "High-risk alerts",
    description: "High-risk reviews added to your queue",
    defaultOn: true,
  },
  {
    key: "assignments",
    label: "Investigation assignments",
    description: "Cases assigned to you for review",
    defaultOn: true,
  },
  {
    key: "dataset",
    label: "Dataset updates",
    description: "Sync completions and new source records",
    defaultOn: false,
  },
  {
    key: "system",
    label: "System alerts",
    description: "Maintenance windows and service notices",
    defaultOn: true,
  },
];

const EXAMPLE_NOTIFICATIONS = [
  {
    title: "Critical project detected",
    tone: "critical",
    meta: "MPL/IN/261120 · Cost outlier and progress-payment mismatch",
    time: "Just now",
  },
  {
    title: "New investigation assigned",
    tone: "high",
    meta: "Case INV-0427 added to your review queue",
    time: "2h ago",
  },
  {
    title: "Dataset updated",
    tone: "low",
    meta: "360 project records synced from the MPLADS portal",
    time: "Yesterday",
  },
] as const;

type Session = {
  id: number;
  label: string;
  location: string;
  lastActive: string;
  current?: boolean;
  icon: LucideIcon;
};

const INITIAL_SESSIONS: Session[] = [
  {
    id: 1,
    label: "Chrome · Windows 11",
    location: "New Delhi, IN",
    lastActive: "Active now",
    current: true,
    icon: Monitor,
  },
  {
    id: 2,
    label: "Safari · macOS",
    location: "Bengaluru, IN",
    lastActive: "2 hours ago",
    icon: Laptop,
  },
  {
    id: 3,
    label: "Chrome · Android",
    location: "Mumbai, IN",
    lastActive: "3 days ago",
    icon: Smartphone,
  },
];

const MOCK_PROFILE = {
  name: "Ananya Sharma",
  email: "a.sharma@example.com",
  role: "District Auditor",
  organization: "District Audit Office · MoSPI",
  districtRegion: "Bengaluru Urban, Karnataka",
  lastLogin: "28 Aug 2026 · 09:47 AM",
};

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-gov-border bg-[var(--bg-card)]">
      <div className="flex items-center gap-3 border-b border-gov-border px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-blue-glow)] text-[var(--primary-blue)]">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-[var(--text-primary)]">{title}</h2>
          {description && <p className="text-xs text-[var(--text-muted)]">{description}</p>}
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold text-[var(--text-muted)]">
      {children}
    </span>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={FIELD_CLASS}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[var(--primary-blue)]" : "bg-[var(--bg-card-hover)] ring-1 ring-inset ring-gov-border"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-[var(--text-primary)]">{value || "—"}</dd>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  // Derived live from the same dataset the dashboard filters on, so the list
  // cannot drift from what the dashboard actually uses.
  const states = useMemo(
    () => Array.from(new Set(projectsData.map((project) => project.state))).sort(),
    []
  );

  const [savedNote, setSavedNote] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profile, setProfile] = useState(MOCK_PROFILE);

  const [prefs, setPrefs] = useState({
    state: states[0] ?? "All",
    district: SAMPLE_DISTRICTS[0],
    riskLevel: "All",
    workType: SAMPLE_WORK_TYPES[0],
    language: LANGUAGES[0],
    dateFormat: DATE_FORMATS[0],
  });

  const initialNotifPrefs: Record<string, boolean> = {};
  NOTIFICATION_PREFS.forEach((pref) => {
    initialNotifPrefs[pref.key] = pref.defaultOn;
  });
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(initialNotifPrefs);

  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [passwordStatus, setPasswordStatus] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const flash = (message: string) => {
    setSavedNote(message);
    window.setTimeout(() => setSavedNote(""), 3200);
  };

  const handleProfileSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: connect to backend — persist profile updates.
    console.log("profile update (mock)", profile);
    setEditingProfile(false);
    flash("Profile saved (demo — nothing persisted).");
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.next !== password.confirm) {
      setPasswordStatus("New passwords do not match.");
      return;
    }
    // TODO: connect to backend — verify current password and update it.
    console.log("password change request (mock)", {
      current: password.current,
      next: password.next,
    });
    setPasswordStatus("Password updated (demo — nothing was persisted).");
    setPassword({ current: "", next: "", confirm: "" });
  };

  const handleLogout = () => {
    // TODO: clear session tokens once real auth is connected.
    console.log("logout (mock)");
    router.push("/sign-in");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          Your profile, preferences, notifications, and security. Nothing here is
          persisted yet — the backend is not connected.
        </p>
      </div>

      {savedNote && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-[var(--color-low-border)] bg-[var(--color-low-bg)] px-4 py-3 text-sm font-medium text-[var(--color-low)]"
        >
          <Check className="h-4 w-4" />
          {savedNote}
        </div>
      )}

      {/* ── Profile ── */}
      <Section icon={User} title="Profile" description="Your account details">
        {editingProfile ? (
          <form onSubmit={handleProfileSave}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <FieldLabel>Name</FieldLabel>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                  className={FIELD_CLASS}
                />
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                  className={FIELD_CLASS}
                />
              </div>
              <div>
                <FieldLabel>Role</FieldLabel>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(event) => setProfile({ ...profile, role: event.target.value })}
                  className={FIELD_CLASS}
                />
              </div>
              <div>
                <FieldLabel>Organization</FieldLabel>
                <input
                  type="text"
                  value={profile.organization}
                  onChange={(event) => setProfile({ ...profile, organization: event.target.value })}
                  className={FIELD_CLASS}
                />
              </div>
              <div>
                <FieldLabel>District / Region</FieldLabel>
                <input
                  type="text"
                  value={profile.districtRegion}
                  onChange={(event) =>
                    setProfile({ ...profile, districtRegion: event.target.value })
                  }
                  className={FIELD_CLASS}
                />
              </div>
              <div>
                <FieldLabel>Last Login</FieldLabel>
                <p className="rounded-lg border border-gov-border bg-[var(--bg-card-hover)]/50 px-3 py-2.5 text-sm text-[var(--text-muted)]">
                  {profile.lastLogin}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 border-t border-gov-border pt-4">
              <button type="submit" className={PRIMARY_BTN}>
                Save changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfile(MOCK_PROFILE);
                  setEditingProfile(false);
                }}
                className={SECONDARY_BTN}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <ProfileRow label="Name" value={profile.name} />
              <ProfileRow label="Email" value={profile.email} />
              <ProfileRow label="Role" value={profile.role} />
              <ProfileRow label="Organization" value={profile.organization} />
              <ProfileRow label="District / Region" value={profile.districtRegion} />
              <ProfileRow label="Last Login" value={profile.lastLogin} />
            </dl>
            <div className="mt-5 border-t border-gov-border pt-4">
              <button
                type="button"
                onClick={() => setEditingProfile(true)}
                className={SECONDARY_BTN}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit profile
              </button>
            </div>
          </>
        )}
      </Section>

      {/* ── Preferences ── */}
      <Section
        icon={SlidersHorizontal}
        title="Preferences"
        description="Defaults applied when you open the dashboard"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Default state"
            value={prefs.state}
            options={states}
            onChange={(state) => setPrefs({ ...prefs, state })}
          />
          <SelectField
            label="Default district"
            value={prefs.district}
            options={SAMPLE_DISTRICTS}
            onChange={(district) => setPrefs({ ...prefs, district })}
          />
          <div>
            <FieldLabel>Default risk level</FieldLabel>
            <select
              value={prefs.riskLevel}
              onChange={(event) => setPrefs({ ...prefs, riskLevel: event.target.value })}
              className={FIELD_CLASS}
            >
              {RISK_LEVELS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <SelectField
            label="Default work type"
            value={prefs.workType}
            options={SAMPLE_WORK_TYPES}
            onChange={(workType) => setPrefs({ ...prefs, workType })}
          />
          <SelectField
            label="Language"
            value={prefs.language}
            options={LANGUAGES}
            onChange={(language) => setPrefs({ ...prefs, language })}
          />
          <SelectField
            label="Date format"
            value={prefs.dateFormat}
            options={DATE_FORMATS}
            onChange={(dateFormat) => setPrefs({ ...prefs, dateFormat })}
          />
        </div>
        <p className="mt-4 text-xs text-[var(--text-muted)]">
          Demo only — these choices live in local state until the backend exposes a
          user settings API.
        </p>
      </Section>

      {/* ── Notifications ── */}
      <Section icon={Bell} title="Notifications" description="Choose what alerts reach you">
        <div className="space-y-2.5">
          {NOTIFICATION_PREFS.map((pref) => (
            <div
              key={pref.key}
              className="flex items-center justify-between gap-4 rounded-lg border border-gov-border px-4 py-3 transition-colors hover:bg-[var(--bg-card-hover)]"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{pref.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{pref.description}</p>
              </div>
              <Toggle
                checked={notifPrefs[pref.key]}
                onChange={() =>
                  setNotifPrefs((current) => ({ ...current, [pref.key]: !current[pref.key] }))
                }
                label={pref.label}
              />
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Recent example notifications
          </p>
          <ul className="space-y-2">
            {EXAMPLE_NOTIFICATIONS.map((notification) => {
              const tone = RISK_TONES[notification.tone];
              return (
                <li
                  key={notification.title}
                  className="flex items-start gap-3 rounded-lg border border-gov-border px-4 py-3"
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${tone.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {notification.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{notification.meta}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span
                      className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone.badge}`}
                    >
                      {notification.tone}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {notification.time}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Section>

      {/* ── Security ── */}
      <Section icon={ShieldCheck} title="Security" description="Password, two-factor, and sessions">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Change password</h3>
            <form onSubmit={handlePasswordSubmit} className="mt-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <FieldLabel>Current password</FieldLabel>
                  <input
                    type="password"
                    value={password.current}
                    onChange={(event) => setPassword({ ...password, current: event.target.value })}
                    className={FIELD_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel>New password</FieldLabel>
                  <input
                    type="password"
                    value={password.next}
                    onChange={(event) => setPassword({ ...password, next: event.target.value })}
                    className={FIELD_CLASS}
                  />
                </div>
                <div>
                  <FieldLabel>Confirm new password</FieldLabel>
                  <input
                    type="password"
                    value={password.confirm}
                    onChange={(event) => setPassword({ ...password, confirm: event.target.value })}
                    className={FIELD_CLASS}
                  />
                </div>
              </div>
              {passwordStatus && (
                <p className="mt-3 text-xs font-semibold text-[var(--color-low)]">
                  {passwordStatus}
                </p>
              )}
              {password.next !== password.confirm && (password.confirm || password.next) && (
                <p className="mt-1 text-xs font-semibold text-[var(--color-critical)]">
                  Passwords do not match.
                </p>
              )}
              <div className="mt-4 flex justify-end border-t border-gov-border pt-4">
                <button type="submit" className={PRIMARY_BTN}>
                  <Lock className="h-3.5 w-3.5" />
                  Update password
                </button>
              </div>
            </form>
          </div>

          <div className="border-t border-gov-border pt-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Two-factor authentication
            </h3>
            <div className="mt-3 flex items-center justify-between gap-4 rounded-lg border border-gov-border px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Authenticator app
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {mfaEnabled
                    ? "Enabled on this account (demo only)"
                    : "Add an extra verification step on sign-in"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Toggle
                  checked={mfaEnabled}
                  onChange={() => setMfaEnabled((current) => !current)}
                  label="Two-factor authentication"
                />
                <button
                  type="button"
                  onClick={() => {
                    // TODO: connect to backend — MFA setup flow.
                    console.log("mfa setup (mock)");
                    flash("MFA setup is a demo — not wired to a real provider yet.");
                  }}
                  className={SECONDARY_BTN}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Set up
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gov-border pt-5">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Active sessions</h3>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Devices currently signed in to your account
            </p>
            <ul className="mt-3 space-y-2">
              {sessions.map((session) => {
                const Icon = session.icon;
                return (
                  <li
                    key={session.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-gov-border px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-card-hover)] text-[var(--text-secondary)]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                          {session.label}
                          {session.current && (
                            <span className="inline-block rounded bg-[var(--primary-blue-glow)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--primary-blue)]">
                              This device
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {session.location} · {session.lastActive}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={session.current}
                      onClick={() =>
                        setSessions((current) => current.filter((entry) => entry.id !== session.id))
                      }
                      className={`${SECONDARY_BTN} ${
                        session.current
                          ? "cursor-not-allowed opacity-40 hover:bg-transparent hover:text-inherit"
                          : ""
                      }`}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-gov-border pt-5">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Log out</h3>
              <p className="text-xs text-[var(--text-muted)]">
                End your session and return to sign in
              </p>
            </div>
            <button type="button" onClick={handleLogout} className={DANGER_BTN}>
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}