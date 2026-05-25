"use client";
import { Timer } from "lucide-react";
import { useTrades } from "@/lib/hooks/useTrades";
import type { Trade } from "@/lib/types";

// Hold-duration buckets — how long did trades sit open?
//   Scalp     = under 5 min     (in-and-out, news/momentum)
//   Quick     = 5-15 min        (typical day-trade entry-exit)
//   Standard  = 15-60 min       (a bar or two of M5/M15)
//   Extended  = 1-4 hours       (intraday swing inside the session)
//   Overnight = 4h+             (held into next session)

interface Bucket {
  label: string;
  sublabel: string;
  trades: number;
  wins: number;
  losses: number;
  pnl: number;
  color: string;
}

const BUCKETS: Omit<Bucket, "trades" | "wins" | "losses" | "pnl">[] = [
  { label: "Scalp",     sublabel: "< 5 min",   color: "#aa50ff" },
  { label: "Quick",     sublabel: "5-15 min",  color: "#00aaff" },
  { label: "Standard",  sublabel: "15-60 min", color: "#00ff88" },
  { label: "Extended",  sublabel: "1-4 hrs",   color: "#ffd700" },
  { label: "Overnight", sublabel: "4 hrs+",    color: "#ff8c42" },
];

function bucketForMinutes(min: number): number {
  if (min < 5) return 0;
  if (min < 15) return 1;
  if (min < 60) return 2;
  if (min < 240) return 3;
  return 4;
}

function holdMinutes(t: Trade): number | null {
  if (!t.opened_at || !t.closed_at) return null;
  const open = new Date(t.opened_at).getTime();
  const close = new Date(t.closed_at).getTime();
  if (close < open) return null;
  return (close - open) / 60_000;
}

function fmtMoney(n: number, sign = false): string {
  const s = sign && n > 0 ? "+" : n < 0 ? "−" : "";
  return `${s}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function HoldDurationAnalysis() {
  const { data } = useTrades({ limit: 500 });
  const closed = (data?.trades ?? []).filter((t) => t.status === "CLOSED");

  const buckets: Bucket[] = BUCKETS.map((b) => ({ ...b, trades: 0, wins: 0, losses: 0, pnl: 0 }));
  let totalDuration = 0;
  let totalWithDuration = 0;
  let winnerDuration = 0;
  let winnerCount = 0;
  let loserDuration = 0;
  let loserCount = 0;

  for (const t of closed) {
    const min = holdMinutes(t);
    if (min === null) continue;
    const idx = bucketForMinutes(min);
    const pnl = Number(t.pnl ?? 0);
    buckets[idx].trades += 1;
    buckets[idx].pnl += pnl;
    if (pnl > 0) {
      buckets[idx].wins += 1;
      winnerDuration += min;
      winnerCount += 1;
    } else if (pnl < 0) {
      buckets[idx].losses += 1;
      loserDuration += min;
      loserCount += 1;
    }
    totalDuration += min;
    totalWithDuration += 1;
  }

  const totalTraded = buckets.reduce((s, b) => s + b.trades, 0);
  const maxTrades = Math.max(1, ...buckets.map((b) => b.trades));

  const avgWinner = winnerCount > 0 ? winnerDuration / winnerCount : 0;
  const avgLoser = loserCount > 0 ? loserDuration / loserCount : 0;
  const avgAll = totalWithDuration > 0 ? totalDuration / totalWithDuration : 0;

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Timer size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">HOLD DURATION</h2>
        </div>
        <span className="text-[10px] text-muted">How long trades stay open</span>
      </div>

      {totalTraded === 0 ? (
        <div className="bg-panel2 border border-dashed border-border rounded-lg p-6 text-center text-xs text-muted">
          No closed trades with timestamps yet.
        </div>
      ) : (
        <>
          {/* Bucket bars */}
          <div className="space-y-2.5 mb-4">
            {buckets.map((b) => {
              const wr = b.trades > 0 ? (b.wins / b.trades) * 100 : 0;
              const width = (b.trades / maxTrades) * 100;
              return (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-white font-semibold">
                      {b.label}{" "}
                      <span className="text-muted font-normal">· {b.sublabel}</span>
                    </span>
                    <span className="text-muted font-mono">
                      {b.trades} trades · {wr.toFixed(0)}% WR ·{" "}
                      <span className={b.pnl >= 0 ? "text-accent" : "text-accentRed"}>
                        {fmtMoney(b.pnl, true)}
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-bg/40 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${width}%`, backgroundColor: b.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Winner vs Loser duration */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
            <Stat label="Avg winner" value={fmtDur(avgWinner)} color="text-accent" />
            <Stat label="Avg loser" value={fmtDur(avgLoser)} color="text-accentRed" />
            <Stat label="Overall avg" value={fmtDur(avgAll)} color="text-white" />
          </div>

          {/* Diagnostic note */}
          {winnerCount > 0 && loserCount > 0 && (
            <div
              className={`mt-3 text-[10px] px-2.5 py-2 rounded border ${
                avgWinner > avgLoser
                  ? "text-accent border-accent/20 bg-accent/5"
                  : "text-gold border-gold/20 bg-gold/5"
              }`}
            >
              {avgWinner > avgLoser
                ? `✓ Healthy: winners run ~${(avgWinner / avgLoser).toFixed(1)}× longer than losers — you're letting profits ride.`
                : `⚠ Suspect: losers are held ~${(avgLoser / avgWinner).toFixed(1)}× longer than winners — review exit discipline.`}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-[9px] uppercase tracking-wider text-muted">{label}</div>
      <div className={`text-sm font-mono font-bold mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}

function fmtDur(minutes: number): string {
  if (minutes === 0) return "—";
  if (minutes < 1) return `${(minutes * 60).toFixed(0)}s`;
  if (minutes < 60) return `${minutes.toFixed(0)}m`;
  const hours = minutes / 60;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}
