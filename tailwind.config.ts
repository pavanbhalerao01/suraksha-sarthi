import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Disaster risk color scheme
        risk: {
          low: "#10b981",      // green
          moderate: "#f59e0b", // yellow/orange
          high: "#ef4444",     // red
          critical: "#7f1d1d", // dark red
        },
      },
    },
  },
  plugins: [],
};

export default config;
