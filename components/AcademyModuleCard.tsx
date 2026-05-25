"use client";
import Link from "next/link";
import { ArrowRight, BookOpen, TrendingUp, Target, Shield, Brain, Compass, Bot } from "lucide-react";
import type { Module } from "@/lib/mock/academy";
import { themeFor } from "@/lib/academyTheme";
import ModuleVisual from "./academy/ModuleVisual";

const ICONS = {
  foundations: BookOpen,
  technical:   TrendingUp,
  setups:      Target,
  risk:        Shield,
  psychology:  Brain,
  context:     Compass,
  bot:         Bot,
} as const;

export default function AcademyModuleCard({
  module,
  index,
}: {
  module: Module;
  index: number;
}) {
  const Icon = ICONS[module.icon];
  const totalMinutes = module.lessons.reduce((acc, l) => acc + l.durationMin, 0);
  const theme = themeFor(module.icon);

  return (
    <Link
      href={`/academy/${module.slug}`}
      className="group relative block bg-panel border border-border rounded-xl p-5 overflow-hidden transition hover:-translate-y-0.5"
      style={{
        boxShadow: "0 0 0 0 transparent",
      }}
    >
      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
        }}
      />
      {/* Border glow on hover */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition"
        style={{
          boxShadow: `inset 0 0 0 1px ${theme.primary}40, 0 0 24px ${theme.glow}`,
        }}
      />

      <div className="relative space-y-3">
        {/* Top row: module number + chip */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-muted font-mono">
            Module {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded"
            style={{ color: theme.primary, backgroundColor: theme.primary + "15" }}
          >
            {theme.label}
          </span>
        </div>

        {/* Icon + title */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: theme.primary + "18",
              color: theme.primary,
            }}
          >
            <Icon size={19} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold leading-tight">{module.title}</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted leading-relaxed">{module.description}</p>

        {/* Visual */}
        <div className="rounded-lg bg-bg/30 border border-border p-3 flex items-center justify-center">
          <ModuleVisual iconKey={module.icon} />
        </div>

        {/* Bottom row: meta + CTA */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-muted">
            {module.lessons.length} lessons · {totalMinutes} min
          </span>
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold transition group-hover:translate-x-1"
            style={{ color: theme.primary }}
          >
            Start <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
