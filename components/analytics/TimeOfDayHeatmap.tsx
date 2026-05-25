"use client";
import { Clock } from "lucide-react";
import { useTrades } from "@/lib/hooks/useTrades";
import type { Trade } from "@/lib/types";

// 24-hour ET grid showing win rate + trade count per hour.

const ET_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  hour12: false,
});

interface HourBucket {
  hour: number;
  trades: number;
  wins: number;
  losses: number;
  pnl: number;
}

function bucketByHour(trades: Trade[]): HourBucket[] {
  const buckets: HourBucket[] = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    trades: 0,
    wins: 0,
    losses: 0,
    pnl: 0,
  }));
  for (const t of trades) {
    if (t.status !== "CLOSED" || !t.opened_at) continue;
    const hourStr = ET_FMT.format(new Date(t.opened_at));
    const hour = Number(hourStr);
    if (Number.isNaN(hour) || hour < 0 || hour > 23) continue;
    const pnl = Number(t.pnl ?? 0);
    buckets[hour].trades += 1;
    buckets[hour].pnl += pnl;
    if (pnl > 0) buckets[hour].wins += 1;
    else if (pnl < 0) buckets[hour].losses += 1;
  }
  return buckets;
}

function hourLabel(h: number): string {
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

function cellColor(b: HourBucket): string {
  if (b.trades === 0) return "#13131a";
  const wr = b.wins / b.trades;
  if (wr >= 0.7) return "rgba(0,255,136,0.65)";
  if (wr >= 0.55) return "rgba(0,255,136,0.4)";
  if (wr >= 0.45) return "rgba(255,215,0,0.4)";
  if (wr >= 0.3) return "rgba(255,51,102,0.4)";
  return "rgba(255,51,102,0.65)";
}

export default function TimeOfDayHeatmap() {
  const { data } = useTrades({ limit: 500 });
  const trades = data?.trades ?? [];
  const buckets = bucketByHour(trades);
  const totalTraded = buckets.reduce((s, b) => s + b.trades, 0);

  const best = buckets.reduce<HourBucket | null>((bestSoFar, b) => {
    if (b.trades < 3) return bestSoFar;
    const wr = b.wins / b.trades;
    if (!bestSoFar || wr > bestSoFar.wins / bestSoFar.trades) return b;
    return bestSoFar;
  }, null);
  const worst = buckets.reduce<HourBucket | null>((worstSoFar, b) => {
    if (b.trades < 3) return worstSoFar;
    const wr = b.wins / b.trades;
    if (!worstSoFar || wr < worstSoFar.wins / worstSoFar.trades) return b;
    return worstSoFar;
  }, null);

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">TIME-OF-DAY HEATMAP</h2>
        </div>
        <span className="text-[10px] text-muted">24-hour ET · win rate by hour</span>
      </div>

      {totalTraded === 0 ? (
        <div className="bg-panel2 border border-dashed border-border rounded-lg p-6 text-center">
          <div className="text-xs text-muted">
            No trades yet. Heatmap activates once trades flow in from the bot or manual entry.
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-12 gap-1 mb-3">
            {buckets.map((b) => {
              const wr = b.trades > 0 ? Math.round((b.wins / b.trades) * 100) : 0;
              return (
                <div
                  key={b.hour}
                  className="aspect-square rounded flex flex-col items-center justify-center text-[9px] border border-border/40 transition hover:scale-105"
                  style={{ backgroundColor: cellColor(b) }}
                  title={`${hourLabel(b.hour)} ET · ${b.trades} trades · ${wr}% win`}
                >
                  <div className="font-mono text-white/90">{hourLabel(b.hour)}</div>
                  {b.trades > 0 && (
                    <div className="font-mono font-bold text-white/95">{wr}%</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] text-muted pt-3 border-t border-border">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: "rgba(0,255,136,0.65)" }} /> 70%+
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: "rgba(0,255,136,0.4)" }} /> 55-69%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: "rgba(255,215,0,0.4)" }} /> 45-54%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: "rgba(255,51,102,0.4)" }} /> 30-44%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: "rgba(255,51,102,0.65)" }} /> &lt; 30%
              </span>
            </div>
            <span>{totalTraded} trades</span>
          </div>

          {/* Best / worst callout */}
          {best && worst && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-accent/5 border border-accent/20 rounded-md p-2.5">
                <div className="text-[9px] uppercase tracking-wider text-muted">Best hour</div>
                <div className="text-sm font-bold text-accent">
                  {hourLabel(best.hour)} ET ·{" "}
                  {Math.round((best.wins / best.trades) * 100)}% WR
                </div>
                <div className="text-[10px] text-muted">{best.trades} trades</div>
              </div>
              <div className="bg-accentRed/5 border border-accentRed/20 rounded-md p-2.5">
                <div className="text-[9px] uppercase tracking-wider text-muted">Worst hour</div>
                <div className="text-sm font-bold text-accentRed">
                  {hourLabel(worst.hour)} ET ·{" "}
                  {Math.round((worst.wins / worst.trades) * 100)}% WR
                </div>
                <div className="text-[10px] text-muted">{worst.trades} trades</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
