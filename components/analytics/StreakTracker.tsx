"use client";
import { Flame, Snowflake, TrendingUp, TrendingDown } from "lucide-react";
import { useTrades } from "@/lib/hooks/useTrades";
import type { Trade } from "@/lib/types";

interface StreakStats {
  currentStreak: number;        // positive = winning, negative = losing
  longestWinStreak: number;
  longestLossStreak: number;
  recentResults: ("W" | "L" | "B")[];  // last 10 trades, B = breakeven
}

function computeStreaks(closed: Trade[]): StreakStats {
  // Chronological order (oldest first)
  const sorted = [...closed].sort(
    (a, b) => new Date(a.closed_at ?? a.opened_at).getTime() - new Date(b.closed_at ?? b.opened_at).getTime(),
  );

  let currentStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let runningWin = 0;
  let runningLoss = 0;

  for (const t of sorted) {
    const pnl = Number(t.pnl ?? 0);
    if (pnl > 0) {
      runningWin += 1;
      runningLoss = 0;
      longestWinStreak = Math.max(longestWinStreak, runningWin);
      currentStreak = runningWin;
    } else if (pnl < 0) {
      runningLoss += 1;
      runningWin = 0;
      longestLossStreak = Math.max(longestLossStreak, runningLoss);
      currentStreak = -runningLoss;
    }
  }

  // Last 10 results (newest first)
  const recent: ("W" | "L" | "B")[] = sorted
    .slice(-10)
    .reverse()
    .map((t) => {
      const pnl = Number(t.pnl ?? 0);
      if (pnl > 0) return "W";
      if (pnl < 0) return "L";
      return "B";
    });

  return { currentStreak, longestWinStreak, longestLossStreak, recentResults: recent };
}

export default function StreakTracker() {
  const { data } = useTrades({ limit: 500 });
  const closed = (data?.trades ?? []).filter((t) => t.status === "CLOSED");
  const stats = computeStreaks(closed);

  const isWinStreak = stats.currentStreak > 0;
  const isLossStreak = stats.currentStreak < 0;

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isWinStreak ? (
            <Flame size={14} className="text-accent" />
          ) : isLossStreak ? (
            <Snowflake size={14} className="text-accentBlue" />
          ) : (
            <TrendingUp size={14} className="text-muted" />
          )}
          <h2 className="text-sm font-semibold tracking-wide">STREAK TRACKER</h2>
        </div>
        <span className="text-[10px] text-muted">Discipline + tilt detection</span>
      </div>

      {closed.length === 0 ? (
        <div className="bg-panel2 border border-dashed border-border rounded-lg p-6 text-center text-xs text-muted">
          No closed trades yet — streak tracker activates after the first close.
        </div>
      ) : (
        <>
          {/* Current streak hero */}
          <div className="bg-panel2 border border-border rounded-lg p-4 mb-4">
            <div className="text-[10px] uppercase tracking-wider text-muted mb-1">Current Streak</div>
            <div className="flex items-baseline gap-2">
              <div
                className={`text-4xl font-bold font-mono ${
                  isWinStreak ? "text-accent" : isLossStreak ? "text-accentRed" : "text-muted"
                }`}
              >
                {Math.abs(stats.currentStreak)}
              </div>
              <div
                className={`text-sm font-semibold ${
                  isWinStreak ? "text-accent" : isLossStreak ? "text-accentRed" : "text-muted"
                }`}
              >
                {isWinStreak ? "consecutive wins" : isLossStreak ? "consecutive losses" : "—"}
              </div>
            </div>
            {isLossStreak && Math.abs(stats.currentStreak) >= 3 && (
              <div className="mt-2 text-[10px] text-accentRed bg-accentRed/10 border border-accentRed/30 rounded px-2 py-1">
                ⚠ 3+ losses in a row — consider stepping away or halving size on the next entry
              </div>
            )}
          </div>

          {/* Records */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-accent/5 border border-accent/20 rounded-md p-3 flex items-center gap-3">
              <TrendingUp size={16} className="text-accent" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted">Longest win streak</div>
                <div className="text-xl font-mono font-bold text-accent">{stats.longestWinStreak}</div>
              </div>
            </div>
            <div className="bg-accentRed/5 border border-accentRed/20 rounded-md p-3 flex items-center gap-3">
              <TrendingDown size={16} className="text-accentRed" />
              <div>
                <div className="text-[9px] uppercase tracking-wider text-muted">Longest loss streak</div>
                <div className="text-xl font-mono font-bold text-accentRed">{stats.longestLossStreak}</div>
              </div>
            </div>
          </div>

          {/* Last 10 results */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted mb-2">Last 10 results (newest first)</div>
            <div className="flex gap-1.5 flex-wrap">
              {stats.recentResults.length === 0 ? (
                <span className="text-[10px] text-muted">—</span>
              ) : (
                stats.recentResults.map((r, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold ${
                      r === "W"
                        ? "bg-accent/20 text-accent border border-accent/40"
                        : r === "L"
                        ? "bg-accentRed/20 text-accentRed border border-accentRed/40"
                        : "bg-bg/40 text-muted border border-border"
                    }`}
                    title={r === "W" ? "Win" : r === "L" ? "Loss" : "Breakeven"}
                  >
                    {r}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
