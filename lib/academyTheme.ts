// Per-module visual theme tokens. Used by AcademyModuleCard, module page
// header, and lesson header so each module has its own visual identity.

import type { Module } from "@/lib/mock/academy";

export interface ModuleTheme {
  primary: string;      // hex
  glow: string;         // rgba glow color
  gradientFrom: string; // tailwind-friendly hex
  gradientTo: string;
  label: string;        // short label shown as a chip
}

export const MODULE_THEMES: Record<Module["icon"], ModuleTheme> = {
  foundations: {
    primary: "#00aaff",
    glow: "rgba(0,170,255,0.25)",
    gradientFrom: "rgba(0,170,255,0.22)",
    gradientTo:   "rgba(0,170,255,0.02)",
    label: "FUNDAMENTALS",
  },
  technical: {
    primary: "#00ff88",
    glow: "rgba(0,255,136,0.25)",
    gradientFrom: "rgba(0,255,136,0.22)",
    gradientTo:   "rgba(0,255,136,0.02)",
    label: "TECHNICAL",
  },
  setups: {
    primary: "#ffd700",
    glow: "rgba(255,215,0,0.25)",
    gradientFrom: "rgba(255,215,0,0.22)",
    gradientTo:   "rgba(255,215,0,0.02)",
    label: "SETUPS",
  },
  risk: {
    primary: "#ff3366",
    glow: "rgba(255,51,102,0.25)",
    gradientFrom: "rgba(255,51,102,0.22)",
    gradientTo:   "rgba(255,51,102,0.02)",
    label: "RISK",
  },
  psychology: {
    primary: "#aa50ff",
    glow: "rgba(170,80,255,0.25)",
    gradientFrom: "rgba(170,80,255,0.22)",
    gradientTo:   "rgba(170,80,255,0.02)",
    label: "MINDSET",
  },
  context: {
    primary: "#00d4b5",
    glow: "rgba(0,212,181,0.25)",
    gradientFrom: "rgba(0,212,181,0.22)",
    gradientTo:   "rgba(0,212,181,0.02)",
    label: "CONTEXT",
  },
  bot: {
    primary: "#ff8c42",
    glow: "rgba(255,140,66,0.25)",
    gradientFrom: "rgba(255,140,66,0.22)",
    gradientTo:   "rgba(255,140,66,0.02)",
    label: "BOT",
  },
};

export function themeFor(icon: Module["icon"]): ModuleTheme {
  return MODULE_THEMES[icon];
}
