"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { storeAuth } from "@/lib/auth";
import { apiUrl } from "@/lib/api";

function Icon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    check: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    eye: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    "eye-off": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("Username and Password are required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (response.ok) {
        const data = await response.json();
        storeAuth(
          {
            name: data.user.name || username.trim(),
            email: data.user.email || `${username.trim()}@mplads.gov.in`,
            username: data.user.username || username.trim(),
            role: data.user.role || "Auditor",
          },
          data.token
        );
        router.push("/dashboard");
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.detail || "Invalid Username or Password.");
      }
    } catch {
      // Offline / fallback verification against dummy data
      const validDummies: Record<string, string> = {
        ravi_kishan: "ravi_kishan123",
        admin: "password123",
      };
      const cleanUser = username.trim().toLowerCase();
      if (validDummies[cleanUser] && validDummies[cleanUser] === password) {
        storeAuth({
          name: cleanUser === "ravi_kishan" ? "Ravi Kishan" : "System Administrator",
          email: `${cleanUser}@mplads.gov.in`,
          username: cleanUser,
          role: cleanUser === "admin" ? "Administrator" : "Auditor",
        });
        router.push("/dashboard");
      } else {
        setError("Invalid Username or Password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-white">
      {/* LEFT PANEL */}
      <div className="hidden w-1/2 flex-col justify-between bg-navy p-12 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-saffron text-navy font-bold">
              MS
            </div>
            <div>
              <div className="text-lg font-bold tracking-wide">MPLADS SENTINEL</div>
              <div className="text-xs tracking-wider text-slate-300 uppercase">National Monitoring Portal</div>
            </div>
          </div>
          
          <div className="mt-20 max-w-md">
            <h2 className="text-3xl font-extrabold leading-tight">
              AI-Powered Audit & Fraud Detection System
            </h2>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Detect expenditure anomalies, track spatial geographic mapping, and automate audit prioritization across nationwide MPLADS projects.
            </p>
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-700/60 pt-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Icon name="check" className="h-4 w-4 text-teal" />
            <span>IsolationForest & Dynamic Feature Anomaly Scoring</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="check" className="h-4 w-4 text-teal" />
            <span>GIS Map Coordinate Risk Visualization</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex w-full flex-col justify-between p-8 lg:w-1/2 lg:p-16">
        <div>
          <a href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-navy transition-colors">
            &larr; Back to home
          </a>
        </div>
        
        <div className="flex w-full max-w-md flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-navy">
              Login to Sentinel
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your username and password to access your workspace.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 font-medium" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-semibold text-slate-700">Username</label>
              <input
                required
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username (e.g. ravi_kishan)"
                className="mt-1.5 w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative mt-1.5">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-md border border-slate-300 px-4 py-3 pr-10 text-slate-900 outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Icon name={showPassword ? "eye-off" : "eye"} className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-md bg-saffron px-4 py-3.5 font-bold text-white transition-all hover:bg-saffron-dark hover:shadow-lg hover:shadow-saffron/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-700">User Credentials (users.json):</p>
            <p><span className="font-semibold text-navy">ravi_kishan</span> / <span className="font-semibold text-navy">ravi_kishan123</span> (Auditor)</p>
            <p><span className="font-semibold text-navy">admin</span> / <span className="font-semibold text-navy">password123</span> (Administrator)</p>
          </div>

          <div className="mt-12 text-xs text-slate-400">
            MPLADS Sentinel System
          </div>
        </div>
      </div>
    </main>
  );
}
