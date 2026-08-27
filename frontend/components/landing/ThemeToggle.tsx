"use client";

import { useCallback } from "react";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md";
}

export default function ThemeToggle({
  isDark,
  onToggle,
  className = "",
  size = "md",
}: ThemeToggleProps) {
  const handleToggle = useCallback(() => {
    onToggle();
  }, [onToggle]);

  const sizeClasses = size === "sm" ? "w-9 h-9" : "w-10 h-10";

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`flex items-center justify-center rounded-lg border transition-all duration-200 focus-visible:outline-3 focus-visible:outline-offset-2 ${sizeClasses} ${
        isDark
          ? "border-white/10 bg-white/5 text-[var(--saffron)] hover:bg-white/10"
          : "border-black/8 bg-white text-[var(--navy)] hover:bg-[var(--bg-secondary)]"
      } ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
