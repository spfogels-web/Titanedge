"use client";
import { BarChart3 } from "lucide-react";
import { useTrades } from "@/lib/hooks/useTrades";
import type { Trade } from "@/lib/types";

// R-Multiple = (exit - entry) / (entry - stop) for longs, sign-flipped for shorts.
// Tells you how many "R units" of risk a trade returned. The MOST important
// metric in pro trading: positive expectancy can survive a 40% win rate.

interface RBucket {
  label: string;
  min: number;          // R-multiple lower bound (inclusive)
  max: number;          // R-multiple upper bound (exclusive)
  count: number;
  color: string;
}

const BUCKETS: Omit<RBucket, "count">[] = [
  { label: "≤ −3R",  min: -Infinity, max: -3,   color: "#ff3366" },
  { label: "−3 to −2R", min: -3,    max: -2,   color: "#ff3366" },
  { label: "−2 to −1R", min: -2,    max: -1,   color: "#ff5577" },
  { label: "−1 to 0R",  min: -1,    max: 0,    color: "#ff8c42" },
  { label: "0 to 1R",   min: 0,     max: 1,    color: "#ffd700" },
  { label: "1 to 2R",   min: 1,     max: 2,    color: "#7ad06d" },
  { label: "2 to 3R",   min: 2,     max: 3,    color: "#00ff88" },
  { label: "3 to 5R",   min: 3,     max: 5,    color: "#00ff88" },
  { label: "5R+",       min: 5,     max: Infinity, color: "#00ff88" },
];

function rMultiple(t: Trade): number | null {
  if (!t.entry_price || !t.stop_price || !t.exit_price) return null;
  const entry = Number(t.entry_price);
  const stop = Number(t.stop_price);
  const exit = Number(t.exit_price);
  if (!entry || !stop || !exit) return null;
  const risk = Math.abs(entry - stop);
  if (risk === 0) return null;
  const reward = t.side === "LONG" ? exit - entry : entry - exit;
  return reward / risk;
}

export default function RMultipleDistribution() {
  const { data } = useTrades({ limit: 500 });
  const trades = data?.trades ?? [];
  const closed = trades.filter((t) => t.status === "CLOSED");

  const rValues = closed
    .map((t) => rMultiple(t))
    .filter((r): r is number => r !== null);

  const buckets: RBucket[] = BUCKETS.map((b) => ({ ...b, count: 0 }));
  for (const r of rValues) {
    const idx = buckets.findIndex((b) => r >= b.min && r < b.max);
    if (idx >= 0) buckets[idx].count += 1;
  }

  const maxCount = Math.max(1, ...buckets.map((b) => b.count));
  const total = rValues.length;
  const avgR = total > 0 ? rValues.reduce((s, r) => s + r, 0) / total : 0;
  const withSL = closed.filter((t) => t.stop_price).length;
  const withoutSL = closed.length - withSL;

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">R-MULTIPLE DISTRIBUTION</h2>
        </div>
        <div className="text-[10px] text-muted">
          Reward ÷ risk — pro traders track this above win rate
        </div>
      </div>

      {total === 0 ? (
        <div className="bg-panel2 border border-dashed border-border rounded-lg p-6 text-center">
          <div className="text-xs text-muted mb-1">No R-multiples to plot yet</div>
          <div className="text-[10px] text-muted">
            Requires closed trades with stop_price set. Bot trades include this automatically;
            manual trades need a stop value when entered.
          </div>
        </div>
      ) : (
        <>
          {/* Histogram */}
          <div className="space-y-1.5">
            {buckets.map((b) => {
              const pct = (b.count / total) * 100;
              const width = (b.count / maxCount) * 100;
              return (
                <div key={b.label} className="flex items-center gap-3">
                  <div className="w-20 text-right text-[10px] font-mono text-muted">{b.label}</div>
                  <div className="flex-1 h-5 bg-bg/40 rounded overflow-hidden">
                    <div
                      className="h-full rounded transition-all flex items-center justify-end pr-2"
                      style={{ width: `${width}%`, backgroundColor: b.color + "AA" }}
                    >
                      {b.count > 0 && (
                        <span className="text-[10px] font-mono font-bold text-bg">
                          {b.count}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-12 text-right text-[10px] font-mono text-muted">
                    {pct.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer summary */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border">
            <Stat
              label="Average R"
              value={`${avgR >= 0 ? "+" : ""}${avgR.toFixed(2)}R`}
              color={avgR >= 0 ? "text-accent" : "text-accentRed"}
            />
            <Stat label="With stop set" value={`${withSL} / ${closed.length}`} color="text-white" />
            <Stat
              label="Missing stop"
              value={`${withoutSL}`}
              color={withoutSL > 0 ? "text-gold" : "text-muted"}
            />
          </div>
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
