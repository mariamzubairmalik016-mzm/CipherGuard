import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: "#05070e",
          card: "#0c101d",
          border: "#1e293b",
          primary: "#06b6d4",
          secondary: "#8b5cf6",
          accent: "#10b981",
          danger: "#ef4444",
          warning: "#f59e0b",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scanline 2s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(6, 182, 212, 0.3)" },
          "100%": { boxShadow: "0 0 20px rgba(6, 182, 212, 0.8), 0 0 30px rgba(139, 92, 246, 0.4)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
