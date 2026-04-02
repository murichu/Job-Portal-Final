/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Font families ─────────────────────────────────────────────────
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        display: ["DM Serif Display", "Georgia", "serif"],
      },

      // ── Brand colours ─────────────────────────────────────────────────
      colors: {
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",  // primary action
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },

      // ── Border radius ─────────────────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ── Box shadows ───────────────────────────────────────────────────
      boxShadow: {
        "card":        "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover":  "0 4px 16px -2px rgb(0 0 0 / 0.10), 0 2px 6px -2px rgb(0 0 0 / 0.06)",
        "modal":       "0 25px 60px -12px rgb(0 0 0 / 0.30)",
        "button":      "0 1px 3px 0 rgb(37 99 235 / 0.25)",
        "inner-sm":    "inset 0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },

      // ── Spacing extras ────────────────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "88": "22rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
      },

      // ── Typography scale extras ───────────────────────────────────────
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
      },

      // ── Animations ────────────────────────────────────────────────────
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%":   { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up":  "fadeInUp 0.35s ease-out both",
        "fade-in":     "fadeIn 0.25s ease-out both",
        "slide-down":  "slideDown 0.25s ease-out both",
        "scale-in":    "scaleIn 0.2s ease-out both",
        "shimmer":     "shimmer 1.8s infinite linear",
      },

      // ── Background extras ─────────────────────────────────────────────
      backgroundImage: {
        "dots": "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
        "dots-dark": "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
        "gradient-brand": "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
        "gradient-card":  "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
      },
      backgroundSize: {
        "dots": "28px 28px",
      },

      // ── Max-width ─────────────────────────────────────────────────────
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },

      // ── Letter spacing ────────────────────────────────────────────────
      letterSpacing: {
        "tighter": "-0.04em",
        "tight":   "-0.02em",
      },
    },
  },
  plugins: [],
};
