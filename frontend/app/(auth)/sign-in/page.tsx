"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { storeAuth } from "@/lib/auth";

type AuthMode = "signin" | "signup";
type Role = "Auditor" | "Administrator" | "Monitoring Officer";

const roles: Role[] = ["Auditor", "Administrator", "Monitoring Officer"];

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

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "", role: "Auditor" as Role, remember: false });

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "signup") setMode("signup");
  }, []);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrors([]);
    setMessage("");
  };

  const updateField = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: string[] = [];
    if (mode === "signup" && !form.fullName.trim()) nextErrors.push("Full Name is required.");
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.push("Enter a valid email address.");
    if (!form.password) nextErrors.push("Password is required.");
    if (mode === "signup" && form.password !== form.confirmPassword) nextErrors.push("Passwords do not match.");
    
    if (nextErrors.length) {
      setErrors(nextErrors);
      setMessage("");
      return;
    }

    setErrors([]);
    setMessage(mode === "signin" ? "Signing you in..." : "Creating account...");
    
    // TODO: replace with real API call to ${process.env.NEXT_PUBLIC_API_URL}/auth/sign-in or /auth/sign-up
    console.log(mode === "signin" ? { email: form.email, password: form.password, remember: form.remember } : form);

    // Mock session: a localStorage flag is enough to route the app for the
    // hackathon — sign-in doesn't collect a name, so default to "Demo User".
    storeAuth({
      name: mode === "signup" && form.fullName.trim() ? form.fullName.trim() : "Demo User",
      email: form.email.trim().toLowerCase(),
    });

    window.setTimeout(() => router.push("/dashboard"), 800);
  };

  return (
    <main className="flex min-h-screen bg-white">
      {/* LEFT PANEL */}
      <div className="relative hidden w-[40%] flex-col overflow-hidden bg-navy md:flex">
        <Image
          src="/landmarks/new-parliament.jpg"
          alt="Parliament House background"
          fill
          priority
          className="object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/40 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-end p-10 pb-24 text-white">
          <div className="mb-6 flex items-center gap-3">
            <svg className="h-10 w-10 shrink-0 text-white" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
              <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="1" opacity="0.2" />
              <path d="M20 8 L24 16 L20 14 L16 16 Z" fill="currentColor" opacity="0.9" />
              <path d="M20 8 L26 18 L20 15 L14 18 Z" fill="currentColor" opacity="0.6" />
              <circle cx="20" cy="22" r="3" fill="currentColor" opacity="0.7" />
              <path d="M14 28 L20 25 L26 28" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.5" />
            </svg>
            <span className="text-2xl font-extrabold tracking-tight">MPLADS Sentinel</span>
          </div>
          <p className="mb-8 text-lg font-medium text-white/90">
            AI-assisted · Evidence-backed · Human-led
          </p>
          <ul className="space-y-3">
            {["Explainable audit prioritization", "Human-in-the-loop review", "SIH 2026 prototype"].map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-white/70">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white">
                  <Icon name="check" className="h-3 w-3" />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Tricolor wave SVG divider */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16" aria-hidden="true">
          <svg className="h-full w-full" viewBox="0 0 1200 64" preserveAspectRatio="none">
            <path d="M0 14C200 46 400 46 600 14s400-32 600 0v50H0Z" fill="var(--saffron)" />
            <path d="M0 28C200 60 400 60 600 28s400-32 600 0v28H0Z" fill="white" />
            <path d="M0 42C200 74 400 74 600 42s400-32 600 0v22H0Z" fill="var(--india-green)" />
          </svg>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex w-full flex-col px-8 py-8 sm:px-12 md:w-[60%] lg:px-24 xl:px-32">
        <div className="mb-12">
          <a href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-navy">
            &larr; Back to home
          </a>
        </div>
        
        <div className="flex w-full max-w-md flex-col justify-center">
          <div className="mb-8 flex gap-6 border-b border-slate-200">
            {(["signin", "signup"] as AuthMode[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => switchMode(tab)}
                className={`nav-link-underline pb-3 text-lg font-bold transition-colors ${
                  mode === tab ? "active text-navy" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {tab === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-navy">
              {mode === "signin" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {mode === "signin"
                ? "Enter your details to access your workspace."
                : "Join the MPLADS monitoring workspace."}
            </p>
          </div>

          {errors.length > 0 && (
            <div className="mb-6 space-y-1 rounded-md bg-red-50 p-4 text-sm text-red-700" role="alert">
              {errors.map((error) => (
                <p key={error} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  {error}
                </p>
              ))}
            </div>
          )}
          
          {message && (
            <div className="mb-6 rounded-md bg-blue-50 p-4 text-sm font-medium text-blue-800" role="status">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  required
                  type="text"
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="mt-1.5 w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="mt-1.5 w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative mt-1.5">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
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
            
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                  <div className="relative mt-1.5">
                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(event) => updateField("confirmPassword", event.target.value)}
                      className="w-full rounded-md border border-slate-300 px-4 py-3 pr-10 text-slate-900 outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <Icon name={showConfirmPassword ? "eye-off" : "eye"} className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Role</label>
                  <select
                    value={form.role}
                    onChange={(event) => updateField("role", event.target.value)}
                    className="mt-1.5 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            {mode === "signin" && (
              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={(event) => updateField("remember", event.target.checked)}
                    className="h-4 w-4 cursor-pointer accent-teal border-slate-300 rounded"
                  />
                  Remember me
                </label>
                <a href="#" onClick={(event) => event.preventDefault()} className="font-medium text-teal hover:text-navy transition-colors">
                  Forgot password?
                </a>
              </div>
            )}
            
            <button
              type="submit"
              className="mt-6 w-full rounded-md bg-saffron px-4 py-3.5 font-bold text-white transition-all hover:bg-saffron-dark hover:shadow-lg hover:shadow-saffron/20 active:scale-[0.98]"
            >
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-slate-500">
            {mode === "signin" ? (
              <p>
                Don&apos;t have an account?{" "}
                <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-teal hover:text-navy transition-colors">
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button type="button" onClick={() => switchMode("signin")} className="font-semibold text-teal hover:text-navy transition-colors">
                  Sign in
                </button>
              </p>
            )}
          </div>
          
          <div className="mt-12 text-xs text-slate-400">
            This is a hackathon prototype — no real data is stored or verified.
          </div>
        </div>
      </div>
    </main>
  );
}
