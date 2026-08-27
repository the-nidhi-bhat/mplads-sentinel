"use client";

import { useState } from "react";

const roles = ["Auditor", "Administrator", "Monitoring Officer"];
const languages = ["English", "हिन्दी"];

export default function SettingsPage() {
  const [name, setName] = useState("A. Sharma");
  const [email, setEmail] = useState("a.sharma@example.com");
  const [role, setRole] = useState("Auditor");
  const [language, setLanguage] = useState("English");
  const [flagAlerts, setFlagAlerts] = useState(true);
  const [pipelineAlerts, setPipelineAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Replace with real API call when a user/settings service exists
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Manage your profile, language preferences, and notifications.
        </p>
      </div>

      {saved && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-[var(--color-low-border)] bg-[var(--color-low-bg)] px-4 py-3 text-sm font-medium text-[var(--color-low)]"
        >
          Settings saved.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 rounded-xl border border-gov-border bg-white p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="setting-name" className="block text-sm font-semibold text-[var(--text-primary)]">
              Name
            </label>
            <input
              id="setting-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-gov-border bg-white px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--primary-blue-glow)]"
            />
          </div>

          <div>
            <label htmlFor="setting-email" className="block text-sm font-semibold text-[var(--text-primary)]">
              Email
            </label>
            <input
              id="setting-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-gov-border bg-white px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--primary-blue-glow)]"
            />
          </div>

          <div>
            <label htmlFor="setting-role" className="block text-sm font-semibold text-[var(--text-primary)]">
              Role
            </label>
            <select
              id="setting-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-gov-border bg-white px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--primary-blue-glow)]"
            >
              {roles.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="setting-language" className="block text-sm font-semibold text-[var(--text-primary)]">
              Language preference
            </label>
            <select
              id="setting-language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="mt-1.5 w-full rounded-md border border-gov-border bg-white px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--primary-blue-glow)]"
            >
              {languages.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="space-y-3 border-t border-gov-border pt-5">
          <legend className="text-sm font-semibold text-[var(--text-primary)]">
            Notification preferences
          </legend>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-gov-border px-4 py-3 transition-colors hover:bg-[var(--bg-card-hover)]">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Flagged project alerts
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={flagAlerts}
              onClick={() => setFlagAlerts((current) => !current)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                flagAlerts ? "bg-[var(--primary-blue)]" : "bg-[var(--bg-card-hover)] ring-1 ring-inset ring-gov-border"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  flagAlerts ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-gov-border px-4 py-3 transition-colors hover:bg-[var(--bg-card-hover)]">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Pipeline and sync alerts
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={pipelineAlerts}
              onClick={() => setPipelineAlerts((current) => !current)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                pipelineAlerts ? "bg-[var(--primary-blue)]" : "bg-[var(--bg-card-hover)] ring-1 ring-inset ring-gov-border"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  pipelineAlerts ? "translate-x-[22px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </label>
        </fieldset>

        <div className="flex justify-end border-t border-gov-border pt-5">
          <button
            type="submit"
            className="rounded-md bg-[var(--primary-blue)] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[var(--primary-blue-hover)] hover:shadow-md hover:shadow-[var(--primary-blue-glow)] active:scale-[0.98]"
          >
            Save changes
          </button>
        </div>
      </form>
    </section>
  );
}