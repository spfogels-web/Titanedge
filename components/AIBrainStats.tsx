"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { brainStats } from "@/lib/mock/ai";

export default function AIBrainStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {brainStats.map((s) => {
        const TrendIcon = s.trend === "up" ? TrendingUp : s.trend === "down" ? TrendingDown : Minus;
        const trendColor =
          s.trend === "up" ? "text-accent" :
          s.trend === "down" ? "text-accentRed" :
                               "text-muted";
        return (
          <div
            key={s.label}
            className="bg-panel border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted uppercase tracking-wider">{s.label}</span>
              {s.trend && <TrendIcon size={12} className={trendColor} />}
            </div>
            <div className="mt-2 text-2xl font-bold">{s.value}</div>
            {s.helper && (
              <div className={`mt-0.5 text-[10px] ${trendColor}`}>{s.helper}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
