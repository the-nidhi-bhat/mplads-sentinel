import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Landing page accent palette (not in raw tokens) */
        navy: {
          DEFAULT: "var(--navy)",
          light: "var(--navy-light)",
          dark: "var(--navy-dark)",
        },
        saffron: {
          DEFAULT: "var(--saffron)",
          light: "var(--saffron-light)",
          dark: "var(--saffron-dark)",
        },
        "india-green": {
          DEFAULT: "var(--india-green)",
        },
        teal: {
          DEFAULT: "var(--teal)",
          light: "var(--teal-light)",
          dark: "var(--teal-dark)",
        },
        /* Shared shell + raw tokens */
        "gov-bg": "var(--bg-primary)",
        "gov-text": "var(--text-primary)",
        "gov-muted": "var(--text-muted)",
        "gov-card": "var(--bg-card)",
        "gov-border": "var(--border-color)",
        risk: {
          critical: "var(--color-critical)",
          high: "var(--color-high)",
          medium: "var(--color-medium)",
          low: "var(--color-low)",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-in-left": "slideInLeft 0.5s ease-out forwards",
        "count-up": "countUp 1.5s ease-out forwards",
        "carousel-crossfade": "carouselCrossfade 4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        countUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        carouselCrossfade: {
          "0%, 20%": { opacity: "1" },
          "25%, 95%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
