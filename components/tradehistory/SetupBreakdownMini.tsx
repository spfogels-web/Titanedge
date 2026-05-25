"use client";
import { Target } from "lucide-react";
import type { Trade } from "@/lib/types";

interface Props {
  trades: Trade[];
}

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toFixed(0)}`;
}

export default function SetupBreakdownMini({ trades }: Props) {
  const byStrategy: Record<string, { count: number; wins: number; pnl: number }> = {};
  for (const t of trades) {
    if (t.status !== "CLOSED" || t.pnl == null) continue;
    const key = t.strategy?.trim() || "(uncategorized)";
    const prev = byStrategy[key] ?? { count: 0, wins: 0, pnl: 0 };
    byStrategy[key] = {
      count: prev.count + 1,
      wins: prev.wins + (Number(t.pnl) > 0 ? 1 : 0),
      pnl: prev.pnl + Number(t.pnl),
    };
  }

  const rows = Object.entries(byStrategy)
    .map(([name, d]) => ({
      name,
      count: d.count,
      winRate: (d.wins / d.count) * 100,
      totalPnl: d.pnl,
      avgPnl: d.pnl / d.count,
    }))
    .sort((a, b) => b.totalPnl - a.totalPnl);

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Target size={14} className="text-gold" />
        <h2 className="text-sm font-semibold tracking-wide">SETUP BREAKDOWN</h2>
        <span className="ml-auto text-[10px] text-muted">{rows.length} setups</span>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted">
          No closed trades to analyze yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => {
            const wrColor =
              r.winRate >= 65 ? "text-accent" :
              r.winRate >= 50 ? "text-gold" :
                                "text-accentRed";
            const pnlColor = r.totalPnl >= 0 ? "text-accent" : "text-accentRed";
            return (
              <div key={r.name} className="flex items-center gap-3 text-xs">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{r.name}</span>
                    <span className="text-[10px] text-muted font-mono">{r.count} trades</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-panel2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, r.winRate)}%`,
                        backgroundColor:
                          r.winRate >= 65 ? "#00ff88" :
                          r.winRate >= 50 ? "#ffd700" :
                                            "#ff3366",
                      }}
                    />
                  </div>
                </div>
                <div className={`w-12 text-right font-mono ${wrColor}`}>
                  {r.winRate.toFixed(0)}%
                </div>
                <div className={`w-16 text-right font-mono font-semibold ${pnlColor}`}>
                  {fmtUsd(r.totalPnl)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
