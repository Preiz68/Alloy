// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
  colors: {
    background: "#F9FAFB",
    card: "#FFFFFF",
    primary: {
      DEFAULT: "#6366F1",
      hover: "#4F46E5",
    },
    secondary: "#06B6D4",
    success: "#22C55E",
    error: "#EF4444",
    text: {
      primary: "#111827",
      muted: "#6B7280",
    },
  },
  boxShadow: {
    soft: "0 4px 12px rgba(0,0,0,0.05)",
  },
  borderRadius: {
    xl: "1rem",
  },
}

  },
  plugins: [],
};

export default config;
