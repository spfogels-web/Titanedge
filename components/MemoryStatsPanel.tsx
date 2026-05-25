"use client";
import { Award, AlertCircle, Clock, Calendar, Activity, ShieldX } from "lucide-react";
import { memorySetups } from "@/lib/mock/ai";

const HIGHLIGHTS = [
  { label: "Strongest setup",       icon: Award,       color: "text-accent",    value: "TitanEdge Slingshot",   sub: "72.4% over 28 trades" },
  { label: "Weakest setup",         icon: AlertCircle, color: "text-accentRed", value: "Rejection Long",         sub: "38% over 13 trades" },
  { label: "Best time of day",      icon: Clock,       color: "text-accent",    value: "09:45 – 10:30 EST",      sub: "78% win rate" },
  { label: "Best session",          icon: Calendar,    color: "text-accent",    value: "US Open",                sub: "68% win rate" },
  { label: "Best volatility",       icon: Activity,    color: "text-accent",    value: "VIX 12 – 15",            sub: "74% win rate" },
  { label: "Avoid conditions",      icon: ShieldX,     color: "text-accentRed", value: "VIX > 20 + mixed Mag 7", sub: "32% win rate" },
];

export default function MemoryStatsPanel() {
  return (
    <div className="space-y-4">
      <div className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-wide">LEARNING MEMORY</h2>
          <span className="text-[10px] text-muted">1,420 entries · 247 trades</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon;
            return (
              <div
                key={h.label}
                className="flex gap-3 p-3 rounded-lg bg-panel2 border border-border"
              >
                <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-bg/40 ${h.color}`}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-muted uppercase tracking-wider">{h.label}</div>
                  <div className="text-xs font-semibold mt-0.5 truncate">{h.value}</div>
                  <div className="text-[10px] text-muted font-mono mt-0.5">{h.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-panel border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold tracking-wide mb-3">SETUP LEADERBOARD</h2>
        <div className="space-y-2">
          {memorySetups.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3 text-xs">
              <div className="w-5 text-muted font-mono text-right">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{s.name}</span>
                  <span className="font-mono text-muted text-[10px]">{s.trades} trades</span>
                </div>
                <div className="mt-1 h-1.5 bg-panel2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${s.winRate}%`,
                      backgroundColor:
                        s.winRate >= 65 ? "#00ff88" :
                        s.winRate >= 50 ? "#ffd700" :
                                          "#ff3366",
                    }}
                  />
                </div>
              </div>
              <div className="w-12 text-right font-mono text-xs font-semibold">{s.winRate.toFixed(1)}%</div>
              <div className={`w-16 text-right font-mono text-xs ${s.expectancy >= 0 ? "text-accent" : "text-accentRed"}`}>
                {s.expectancy >= 0 ? "+" : "−"}${Math.abs(s.expectancy)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
