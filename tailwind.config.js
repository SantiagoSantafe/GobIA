/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        risk: {
          critical: "#ef4444",
          high:     "#f59e0b",
          medium:   "#eab308",
          info:     "#22d3ee",
        },
        // Light "white technology" surface scale
        surface: {
          0: "#ffffff",   // page / card bg
          1: "#F8FAFC",   // section bg
          2: "#F1F5F9",   // chip / tag bg
          3: "#E2E8F0",   // borders
          4: "#94A3B8",   // muted text / icons
        },
        // Primary CTA — indigo
        action: {
          primary: "#6366F1",
          hover:   "#4F46E5",
          light:   "#EEF2FF",
          border:  "#C7D2FE",
        },
        // OCDS flag accent — blue
        ocds: {
          DEFAULT: "#3B82F6",
          light:   "#EFF6FF",
          border:  "#BFDBFE",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Menlo", "monospace"],
      },
      animation: {
        "pulse-dot": "pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        glow:        "glow 2s ease-in-out infinite alternate",
        shimmer:     "shimmer 1.5s infinite",
        "fade-in":   "fade-in 0.35s ease-out",
        "slide-up":  "slide-up 0.45s ease-out",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.4", transform: "scale(0.85)" },
        },
        glow: {
          "0%":   { boxShadow: "0 0 8px 2px rgba(99,102,241,0.3)" },
          "100%": { boxShadow: "0 0 24px 8px rgba(99,102,241,0.5)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        card:       "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        "card-md":  "0 4px 16px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04)",
        "card-lg":  "0 8px 32px rgba(15,23,42,0.1),  0 2px 8px rgba(15,23,42,0.05)",
        "glow-indigo": "0 0 20px rgba(99,102,241,0.25)",
        "glow-red":    "0 0 16px rgba(239,68,68,0.2)",
      },
    },
  },
  plugins: [],
};
