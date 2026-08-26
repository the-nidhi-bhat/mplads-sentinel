import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1F3D",
          light: "#0F2E5C",
          dark: "#061328",
        },
        saffron: {
          DEFAULT: "#FF9933",
          light: "#FFB366",
          dark: "#E68A2E",
        },
        "india-green": {
          DEFAULT: "#128A3E",
          light: "#1AAF50",
          dark: "#0E6B30",
        },
        "gov-bg": {
          light: "#F5F6F8",
          dark: "#0B1220",
        },
        "gov-text": {
          light: "#10182B",
          dark: "#E8EAF0",
        },
        "gov-muted": {
          light: "#64748B",
          dark: "#94A3B8",
        },
        "gov-card": {
          light: "#FFFFFF",
          dark: "#111827",
        },
        "gov-border": {
          light: "#E2E8F0",
          dark: "#1E293B",
        },
        risk: {
          critical: "#DC2626",
          high: "#EA580C",
          medium: "#CA8A04",
          low: "#059669",
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
