"use client";
import { CalendarClock } from "lucide-react";
import type { Trade } from "@/lib/types";

interface Props { trades: Trade[]; }

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toFixed(0)}`;
}

export default function DayOfWeekHeatmap({ trades }: Props) {
  const byDay: Record<number, { trades: number; wins: number; pnl: number }> = {
    1: { trades: 0, wins: 0, pnl: 0 },
    2: { trades: 0, wins: 0, pnl: 0 },
    3: { trades: 0, wins: 0, pnl: 0 },
    4: { trades: 0, wins: 0, pnl: 0 },
    5: { trades: 0, wins: 0, pnl: 0 },
  };
  for (const t of trades) {
    if (t.status !== "CLOSED" || !t.closed_at || t.pnl == null) continue;
    const d = new Date(t.closed_at);
    // Get day in ET to align with trading sessions
    const etDay = new Date(d.toLocaleString("en-US", { timeZone: "America/New_York" })).getDay();
    if (etDay >= 1 && etDay <= 5) {
      const cur = byDay[etDay];
      cur.trades += 1;
      cur.wins += Number(t.pnl) > 0 ? 1 : 0;
      cur.pnl += Number(t.pnl);
    }
  }

  const maxAbs = Math.max(1, ...Object.values(byDay).map((d) => Math.abs(d.pnl)));

  function bgFor(pnl: number) {
    if (pnl === 0) return "#1a1a24";
    const intensity = Math.min(1, Math.abs(pnl) / maxAbs);
    const alpha = 0.18 + intensity * 0.70;
    return pnl > 0 ? `rgba(0,255,136,${alpha.toFixed(2)})` : `rgba(255,51,102,${alpha.toFixed(2)})`;
  }

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock size={14} className="text-accentBlue" />
        <h2 className="text-sm font-semibold tracking-wide">DAY OF WEEK PERFORMANCE</h2>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((day) => {
          const d = byDay[day];
          const wr = d.trades === 0 ? 0 : (d.wins / d.trades) * 100;
          return (
            <div
              key={day}
              className="rounded-lg border border-border p-3 text-center"
              style={{ backgroundColor: bgFor(d.pnl) }}
            >
              <div className="text-[10px] uppercase tracking-wider text-white/70">
                {DAY_LABELS[day - 1]}
              </div>
              <div
                className={`text-base font-mono font-bold mt-1.5 ${
                  d.pnl === 0 ? "text-muted" : "text-white"
                }`}
              >
                {d.pnl === 0 ? "—" : fmtUsd(d.pnl)}
              </div>
              <div className="text-[10px] text-white/70 mt-1">
                {d.trades} trade{d.trades === 1 ? "" : "s"}
                {d.trades > 0 && (
                  <>
                    {" · "}
                    <span className={wr >= 60 ? "text-accent" : wr >= 45 ? "text-gold" : "text-accentRed"}>
                      {wr.toFixed(0)}%
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
