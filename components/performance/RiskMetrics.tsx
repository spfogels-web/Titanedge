"use client";
import { Activity } from "lucide-react";
import type { Trade } from "@/lib/types";

interface Props { trades: Trade[]; }

// Daily returns from closed trades.
function dailyReturns(trades: Trade[]): number[] {
  const byDay: Record<string, number> = {};
  for (const t of trades) {
    if (t.status !== "CLOSED" || !t.closed_at || t.pnl == null) continue;
    const key = new Date(t.closed_at).toISOString().slice(0, 10);
    byDay[key] = (byDay[key] ?? 0) + Number(t.pnl);
  }
  return Object.values(byDay);
}

function mean(xs: number[]) {
  return xs.length === 0 ? 0 : xs.reduce((a, x) => a + x, 0) / xs.length;
}

function stdDev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const variance = xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

function downsideStdDev(xs: number[]): number {
  const losers = xs.filter((x) => x < 0);
  if (losers.length < 2) return 0;
  return stdDev(losers);
}

function streaks(closed: Trade[]) {
  const sorted = [...closed].sort(
    (a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime(),
  );
  let curWin = 0, curLoss = 0, maxWin = 0, maxLoss = 0;
  for (const t of sorted) {
    const p = Number(t.pnl ?? 0);
    if (p > 0) {
      curWin += 1; curLoss = 0;
      if (curWin > maxWin) maxWin = curWin;
    } else {
      curLoss += 1; curWin = 0;
      if (curLoss > maxLoss) maxLoss = curLoss;
    }
  }
  return { maxWin, maxLoss };
}

function maxDrawdownDollars(closed: Trade[]): number {
  const sorted = [...closed].sort(
    (a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime(),
  );
  let cum = 0, peak = 0, maxDD = 0;
  for (const t of sorted) {
    cum += Number(t.pnl ?? 0);
    if (cum > peak) peak = cum;
    const dd = cum - peak;
    if (dd < maxDD) maxDD = dd;
  }
  return Math.abs(maxDD);
}

interface Metric {
  label: string;
  value: string;
  hint: string;
  color: string;
}

function fmtUsd(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function RiskMetrics({ trades }: Props) {
  const closed = trades.filter((t) => t.status === "CLOSED" && t.pnl != null && t.closed_at);
  const dailies = dailyReturns(closed);
  const dMean = mean(dailies);
  const dStd = stdDev(dailies);
  const dDown = downsideStdDev(dailies);
  // Annualize: sqrt(252)
  const ANNUAL = Math.sqrt(252);
  const sharpe = dStd === 0 ? 0 : (dMean / dStd) * ANNUAL;
  const sortino = dDown === 0 ? 0 : (dMean / dDown) * ANNUAL;

  const totalPnl = closed.reduce((a, t) => a + Number(t.pnl), 0);
  const maxDD = maxDrawdownDollars(closed);
  const recoveryFactor = maxDD === 0 ? 0 : totalPnl / maxDD;

  const grossProfit = closed.reduce((a, t) => Number(t.pnl) > 0 ? a + Number(t.pnl) : a, 0);
  const grossLoss = Math.abs(closed.reduce((a, t) => Number(t.pnl) <= 0 ? a + Number(t.pnl) : a, 0));
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;

  const { maxWin, maxLoss } = streaks(closed);
  const dayCount = dailies.length;
  const winningDays = dailies.filter((x) => x > 0).length;
  const dayWinRate = dayCount === 0 ? 0 : (winningDays / dayCount) * 100;

  const thin = closed.length < 20;

  const metrics: Metric[] = [
    {
      label: "Sharpe Ratio",
      value: sharpe === 0 ? "—" : sharpe.toFixed(2),
      hint: "Annualized return / volatility",
      color: sharpe >= 1.5 ? "text-accent" : sharpe >= 0.8 ? "text-gold" : "text-accentRed",
    },
    {
      label: "Sortino Ratio",
      value: sortino === 0 ? "—" : sortino.toFixed(2),
      hint: "Like Sharpe but penalizes only downside",
      color: sortino >= 1.5 ? "text-accent" : sortino >= 0.8 ? "text-gold" : "text-accentRed",
    },
    {
      label: "Profit Factor",
      value: Number.isFinite(profitFactor) ? profitFactor.toFixed(2) : "∞",
      hint: "Gross profit ÷ |gross loss|",
      color: profitFactor >= 2 ? "text-accent" : profitFactor >= 1.2 ? "text-gold" : "text-accentRed",
    },
    {
      label: "Recovery Factor",
      value: maxDD === 0 ? "—" : recoveryFactor.toFixed(2),
      hint: "Net P&L ÷ max drawdown",
      color: recoveryFactor >= 3 ? "text-accent" : recoveryFactor >= 1 ? "text-gold" : "text-accentRed",
    },
    {
      label: "Max Drawdown",
      value: maxDD === 0 ? "$0" : `−${fmtUsd(maxDD)}`,
      hint: "Largest peak-to-trough loss",
      color: "text-accentRed",
    },
    {
      label: "Max Win Streak",
      value: `${maxWin}`,
      hint: "Longest consecutive winners",
      color: "text-accent",
    },
    {
      label: "Max Loss Streak",
      value: `${maxLoss}`,
      hint: "Longest consecutive losers",
      color: "text-accentRed",
    },
    {
      label: "Winning Days",
      value: dayCount === 0 ? "—" : `${dayWinRate.toFixed(0)}%`,
      hint: `${winningDays} of ${dayCount} trading days`,
      color: dayWinRate >= 60 ? "text-accent" : dayWinRate >= 45 ? "text-gold" : "text-accentRed",
    },
  ];

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-accent" />
          <h2 className="text-sm font-semibold tracking-wide">RISK & PERFORMANCE METRICS</h2>
        </div>
        {thin && (
          <span className="text-[10px] text-gold">Thin sample — needs 20+ closed trades for stable values</span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-panel2/40 border border-border rounded-lg p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted">{m.label}</div>
            <div className={`text-xl font-bold font-mono mt-1 ${m.color}`}>{m.value}</div>
            <div className="text-[10px] text-muted mt-0.5 leading-tight">{m.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
