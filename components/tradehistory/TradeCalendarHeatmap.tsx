"use client";
import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import type { Trade } from "@/lib/types";

interface Props {
  trades: Trade[];
  days?: number;     // how many days back to show (default 90)
}

// Returns "YYYY-MM-DD" in ET so a midnight-EST trade groups with that
// trading day rather than UTC.
function etDateKey(iso: string): string {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d);  // en-CA gives YYYY-MM-DD natively
}

function colorFor(pnl: number, maxAbs: number): string {
  if (pnl === 0) return "#1a1a24";
  const intensity = Math.min(1, Math.abs(pnl) / Math.max(maxAbs, 1));
  // Map 0..1 → opacity 0.18..0.95
  const alpha = 0.18 + intensity * 0.77;
  return pnl > 0
    ? `rgba(0,255,136,${alpha.toFixed(2)})`
    : `rgba(255,51,102,${alpha.toFixed(2)})`;
}

export default function TradeCalendarHeatmap({ trades, days = 90 }: Props) {
  const [hover, setHover] = useState<null | { date: string; pnl: number; count: number }>(null);

  const { weeks, totalDaysTraded, profitDays, lossDays } = useMemo(() => {
    // Aggregate pnl + count per ET date
    const byDay: Record<string, { pnl: number; count: number }> = {};
    for (const t of trades) {
      if (t.status !== "CLOSED" || !t.closed_at || t.pnl == null) continue;
      const key = etDateKey(t.closed_at);
      const prev = byDay[key] ?? { pnl: 0, count: 0 };
      byDay[key] = { pnl: prev.pnl + Number(t.pnl), count: prev.count + 1 };
    }

    // Build day list — newest at right; align right edge to today (in ET).
    const todayKey = etDateKey(new Date().toISOString());
    const allKeys: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      allKeys.push(etDateKey(d.toISOString()));
    }

    // Day-of-week of first key determines top padding so cells align by weekday.
    const firstDate = new Date(allKeys[0] + "T12:00:00Z");
    const firstDow = firstDate.getUTCDay(); // 0 = Sun

    // Build columns of 7 (week strips)
    const cells: Array<{ key: string; pnl: number; count: number; isToday: boolean } | null> = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (const k of allKeys) {
      const d = byDay[k];
      cells.push({
        key: k,
        pnl: d?.pnl ?? 0,
        count: d?.count ?? 0,
        isToday: k === todayKey,
      });
    }
    // Pad to multiple of 7
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: Array<Array<typeof cells[number]>> = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    let totalDaysTraded = 0;
    let profitDays = 0;
    let lossDays = 0;
    for (const k of Object.keys(byDay)) {
      const d = byDay[k];
      if (d.count > 0) totalDaysTraded += 1;
      if (d.pnl > 0) profitDays += 1;
      else if (d.pnl < 0) lossDays += 1;
    }

    return { weeks, totalDaysTraded, profitDays, lossDays };
  }, [trades, days]);

  const maxAbs = useMemo(() => {
    let max = 0;
    for (const w of weeks) for (const c of w) if (c && Math.abs(c.pnl) > max) max = Math.abs(c.pnl);
    return max;
  }, [weeks]);

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">P&amp;L CALENDAR · LAST {days}D</h2>
        </div>
        <div className="text-[10px] text-muted">
          {totalDaysTraded} traded · {profitDays} green · {lossDays} red
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <div className="inline-flex gap-[3px] pb-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell, di) =>
                cell ? (
                  <div
                    key={cell.key}
                    onMouseEnter={() => setHover({ date: cell.key, pnl: cell.pnl, count: cell.count })}
                    onMouseLeave={() => setHover(null)}
                    className={`w-[14px] h-[14px] rounded-sm transition ${
                      cell.isToday ? "ring-1 ring-accent" : ""
                    }`}
                    style={{ backgroundColor: colorFor(cell.pnl, maxAbs) }}
                  />
                ) : (
                  <div key={`empty-${wi}-${di}`} className="w-[14px] h-[14px] rounded-sm bg-transparent" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hover read-out + legend */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-muted">
        <div className="font-mono">
          {hover
            ? `${hover.date} · ${hover.count} trade${hover.count === 1 ? "" : "s"} · ${hover.pnl >= 0 ? "+" : "−"}$${Math.abs(hover.pnl).toFixed(2)}`
            : "Hover a day for details"}
        </div>
        <div className="flex items-center gap-1.5">
          <span>Less</span>
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(255,51,102,0.85)" }} />
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(255,51,102,0.35)" }} />
          <span className="w-3 h-3 rounded-sm bg-panel2" />
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(0,255,136,0.35)" }} />
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(0,255,136,0.85)" }} />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
