import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0f",
        panel: "#13131a",
        panel2: "#1a1a24",
        border: "#27272f",
        accent: "#00ff88",
        accentRed: "#ff3366",
        accentBlue: "#00aaff",
        gold: "#ffd700",
        muted: "#888892",
      },
      boxShadow: { glow: "0 0 24px rgba(0,255,136,0.15)" },
    },
  },
  plugins: [],
};
export default config;