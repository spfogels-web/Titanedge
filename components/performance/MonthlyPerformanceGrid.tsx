"use client";
import { CalendarRange } from "lucide-react";
import type { Trade } from "@/lib/types";

interface Props { trades: Trade[]; }

function monthLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export default function MonthlyPerformanceGrid({ trades }: Props) {
  // Last 12 months including current.
  const now = new Date();
  const months: { year: number; month: number; label: string; pnl: number; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: monthLabel(d),
      pnl: 0,
      count: 0,
    });
  }

  for (const t of trades) {
    if (t.status !== "CLOSED" || !t.closed_at || t.pnl == null) continue;
    const d = new Date(t.closed_at);
    const idx = months.findIndex((m) => m.year === d.getFullYear() && m.month === d.getMonth());
    if (idx >= 0) {
      months[idx].pnl += Number(t.pnl);
      months[idx].count += 1;
    }
  }

  const maxAbs = Math.max(1, ...months.map((m) => Math.abs(m.pnl)));

  function bgFor(pnl: number) {
    if (pnl === 0) return "#1a1a24";
    const intensity = Math.min(1, Math.abs(pnl) / maxAbs);
    const alpha = 0.15 + intensity * 0.70;
    return pnl > 0 ? `rgba(0,255,136,${alpha.toFixed(2)})` : `rgba(255,51,102,${alpha.toFixed(2)})`;
  }

  const ytdPnl = months
    .filter((m) => m.year === now.getFullYear())
    .reduce((acc, m) => acc + m.pnl, 0);
  const trailingYear = months.reduce((acc, m) => acc + m.pnl, 0);

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarRange size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">MONTHLY PERFORMANCE</h2>
        </div>
        <div className="text-[10px] text-muted">
          YTD <span className={ytdPnl >= 0 ? "text-accent" : "text-accentRed"}>
            {ytdPnl >= 0 ? "+" : "−"}${Math.abs(ytdPnl).toFixed(0)}
          </span>
          {" · "}
          Trailing 12mo <span className={trailingYear >= 0 ? "text-accent" : "text-accentRed"}>
            {trailingYear >= 0 ? "+" : "−"}${Math.abs(trailingYear).toFixed(0)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
        {months.map((m) => (
          <div
            key={`${m.year}-${m.month}`}
            className="rounded-md border border-border p-2.5 text-center transition hover:border-accent/30"
            style={{ backgroundColor: bgFor(m.pnl) }}
            title={`${m.label}: ${m.count} trades · ${m.pnl >= 0 ? "+" : "−"}$${Math.abs(m.pnl).toFixed(2)}`}
          >
            <div className="text-[9px] uppercase tracking-wider text-white/70">{m.label}</div>
            <div
              className={`text-xs font-mono font-bold mt-1 ${
                m.pnl === 0 ? "text-muted" : m.pnl > 0 ? "text-white" : "text-white"
              }`}
            >
              {m.pnl === 0 ? "—" : `${m.pnl >= 0 ? "+" : "−"}${(Math.abs(m.pnl) / 1000).toFixed(1)}K`}
            </div>
            <div className="text-[9px] text-white/60 mt-0.5">{m.count}t</div>
          </div>
        ))}
      </div>
    </div>
  );
}
