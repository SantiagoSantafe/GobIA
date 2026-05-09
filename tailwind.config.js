/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── VIGÍA Brand ────────────────────────────────────────────────────────
        vigia: {
          bg:       "#f5f5f7",   // Apple-style light base
          surface:  "#ffffff",   // elevated (cards, modals)
          subtle:   "#fafafa",   // section alt
          border:   "#e8e8ed",   // default border
          strong:   "#d2d2d7",   // strong border / divider
          accent:   "#e8601c",   // VIGÍA orange (slightly darker for readability on light)
          muted:    "#6e6e73",   // secondary text (Apple)
          dim:      "#aeaeb2",   // disabled / subtle text
          heading:  "#1d1d1f",   // near-black (Apple)
          body:     "#3d3d3f",   // body text
        },
        // ── Risk scale ─────────────────────────────────────────────────────────
        risk: {
          critical: "#dc2626",   // red-600  — more legible on light bg
          high:     "#ea580c",   // orange-600
          medium:   "#ca8a04",   // yellow-600
          low:      "#16a34a",   // green-600
          info:     "#0891b2",   // cyan-600
        },
        // ── Surface scale (light mode) ─────────────────────────────────────────
        surface: {
          0: "#ffffff",    // card bg
          1: "#f5f5f7",    // page bg (Apple gray)
          2: "#f0f0f5",    // hover / alt row
          3: "#e8e8ed",    // border
          4: "#6e6e73",    // muted text
        },
        // ── Actions ────────────────────────────────────────────────────────────
        action: {
          primary: "#1d1d1f",   // dark fill button
          hover:   "#3d3d3f",   // dark hover
          light:   "#f5f5f7",   // light button bg
          border:  "#d2d2d7",   // button border
          accent:  "#e8601c",   // orange accent button
        },
        // ── OCDS flag ──────────────────────────────────────────────────────────
        ocds: {
          DEFAULT: "#2563eb",
          light:   "#eff6ff",
          border:  "#bfdbfe",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "Menlo", "monospace"],
      },
      letterSpacing: {
        label: "0.18em",
        ultra: "0.28em",
      },
      animation: {
        "pulse-dot": "pulse-dot 2s cubic-bezier(0.4,0,0.6,1) infinite",
        glow:        "glow 2s ease-in-out infinite alternate",
        shimmer:     "shimmer 1.5s infinite",
        "fade-in":   "fade-in 0.3s ease-out",
        "slide-up":  "slide-up 0.4s ease-out",
      },
      keyframes: {
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.4", transform: "scale(0.85)" },
        },
        glow: {
          "0%":   { boxShadow: "0 0 8px 2px rgba(232,96,28,0.2)" },
          "100%": { boxShadow: "0 0 20px 6px rgba(232,96,28,0.35)" },
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
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        card:        "0 1px 2px rgba(0,0,0,0.04), 0 1px 6px rgba(0,0,0,0.03)",
        "card-md":   "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
        "card-lg":   "0 4px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
        "inner-top": "inset 0 1px 0 rgba(255,255,255,0.8)",
        "glow-orange": "0 0 16px rgba(232,96,28,0.2)",
        "glow-red":    "0 0 12px rgba(220,38,38,0.15)",
      },
    },
  },
  plugins: [],
};
