"use client";
import { Activity, Award, Gauge, Layers, Sigma, Target, TrendingDown, TrendingUp } from "lucide-react";
import { useTrades } from "@/lib/hooks/useTrades";
import type { Trade } from "@/lib/types";

interface AdvancedMetrics {
  sharpe: number | null;
  sortino: number | null;
  maxDrawdown: number;
  recoveryFactor: number | null;
  bestDay: number;
  worstDay: number;
  avgRR: number | null;          // average reward-to-risk ratio on closed trades
  expectancyR: number | null;    // expectancy in R units
}

function dailyPnLMap(closed: Trade[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of closed) {
    if (!t.closed_at) continue;
    const date = new Date(t.closed_at).toISOString().slice(0, 10);
    out[date] = (out[date] ?? 0) + Number(t.pnl ?? 0);
  }
  return out;
}

function stddev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
  const variance = xs.reduce((s, x) => s + (x - mean) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

function downsideDeviation(xs: number[]): number {
  if (xs.length < 2) return 0;
  const downsides = xs.filter((x) => x < 0);
  if (downsides.length === 0) return 0;
  return Math.sqrt(downsides.reduce((s, x) => s + x * x, 0) / xs.length);
}

function compute(closed: Trade[]): AdvancedMetrics {
  if (closed.length === 0) {
    return {
      sharpe: null, sortino: null, maxDrawdown: 0, recoveryFactor: null,
      bestDay: 0, worstDay: 0, avgRR: null, expectancyR: null,
    };
  }

  // Daily PnL series (for Sharpe/Sortino/best-worst-day/drawdown)
  const dailyMap = dailyPnLMap(closed);
  const dailyReturns = Object.values(dailyMap);
  const bestDay = dailyReturns.length > 0 ? Math.max(...dailyReturns) : 0;
  const worstDay = dailyReturns.length > 0 ? Math.min(...dailyReturns) : 0;

  // Sharpe (rf=0, daily series, annualized by sqrt(252))
  const meanDaily = dailyReturns.length > 0
    ? dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length
    : 0;
  const sd = stddev(dailyReturns);
  const sharpe = sd > 0 ? (meanDaily / sd) * Math.sqrt(252) : null;

  // Sortino (downside dev only)
  const dd = downsideDeviation(dailyReturns);
  const sortino = dd > 0 ? (meanDaily / dd) * Math.sqrt(252) : null;

  // Max drawdown (peak-to-trough on cumulative PnL)
  const sortedDates = Object.keys(dailyMap).sort();
  let peak = 0;
  let cumulative = 0;
  let maxDrawdown = 0;
  for (const date of sortedDates) {
    cumulative += dailyMap[date];
    if (cumulative > peak) peak = cumulative;
    const dd = peak - cumulative;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const totalNet = dailyReturns.reduce((s, r) => s + r, 0);
  const recoveryFactor = maxDrawdown > 0 ? totalNet / maxDrawdown : null;

  // R-multiple averages (where stop is known)
  const rValues: number[] = [];
  for (const t of closed) {
    if (!t.entry_price || !t.stop_price || !t.exit_price) continue;
    const entry = Number(t.entry_price);
    const stop = Number(t.stop_price);
    const exit = Number(t.exit_price);
    if (!entry || !stop || !exit) continue;
    const risk = Math.abs(entry - stop);
    if (risk === 0) continue;
    const reward = t.side === "LONG" ? exit - entry : entry - exit;
    rValues.push(reward / risk);
  }
  const expectancyR = rValues.length > 0
    ? rValues.reduce((s, r) => s + r, 0) / rValues.length
    : null;
  const avgRR = rValues.length > 0
    ? Math.abs(rValues.filter((r) => r > 0).reduce((s, r) => s + r, 0) /
        Math.max(1, rValues.filter((r) => r > 0).length)) /
      Math.max(0.01, Math.abs(rValues.filter((r) => r < 0).reduce((s, r) => s + r, 0) /
        Math.max(1, rValues.filter((r) => r < 0).length)))
    : null;

  return { sharpe, sortino, maxDrawdown, recoveryFactor, bestDay, worstDay, avgRR, expectancyR };
}

function fmt(n: number | null, type: "ratio" | "money" | "r"): string {
  if (n === null || !isFinite(n)) return "—";
  if (type === "money") {
    const sign = n > 0 ? "+" : n < 0 ? "−" : "";
    return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  if (type === "r") return `${n >= 0 ? "+" : ""}${n.toFixed(2)}R`;
  return n.toFixed(2);
}

export default function AdvancedMetricsRibbon() {
  const { data } = useTrades({ limit: 500 });
  const closed = (data?.trades ?? []).filter((t) => t.status === "CLOSED");
  const m = compute(closed);

  const tiles = [
    { label: "Sharpe Ratio",   value: fmt(m.sharpe, "ratio"),  icon: Gauge,      color: (m.sharpe ?? 0) >= 1 ? "text-accent" : "text-muted",   sub: "Annualized risk-adjusted" },
    { label: "Sortino",        value: fmt(m.sortino, "ratio"), icon: Sigma,      color: (m.sortino ?? 0) >= 1 ? "text-accent" : "text-muted",  sub: "Downside-only volatility" },
    { label: "Max Drawdown",   value: fmt(-m.maxDrawdown, "money"), icon: TrendingDown, color: m.maxDrawdown === 0 ? "text-muted" : "text-accentRed", sub: "Peak to trough loss" },
    { label: "Recovery Factor", value: fmt(m.recoveryFactor, "ratio"), icon: Activity, color: (m.recoveryFactor ?? 0) >= 2 ? "text-accent" : "text-muted", sub: "Net PnL ÷ max DD" },
    { label: "Best Day",       value: fmt(m.bestDay, "money"), icon: TrendingUp,  color: m.bestDay > 0 ? "text-accent" : "text-muted",          sub: "Single-day high" },
    { label: "Worst Day",      value: fmt(m.worstDay, "money"), icon: TrendingDown, color: m.worstDay < 0 ? "text-accentRed" : "text-muted",   sub: "Single-day low" },
    { label: "Avg R:R",        value: m.avgRR !== null ? `${m.avgRR.toFixed(2)} : 1` : "—", icon: Target, color: (m.avgRR ?? 0) >= 1.5 ? "text-accent" : "text-muted", sub: "Win-size to loss-size" },
    { label: "Expectancy (R)", value: fmt(m.expectancyR, "r"), icon: Award,       color: (m.expectancyR ?? 0) > 0 ? "text-accent" : "text-muted", sub: "Per trade in R units" },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Layers size={13} className="text-accentBlue" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Advanced Risk Metrics</h3>
        {closed.length < 20 && (
          <span className="text-[9px] text-gold ml-2">
            ⚠ Thin sample — needs 20+ closed trades for stable values
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="bg-panel border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] uppercase tracking-wider text-muted">{t.label}</span>
                <Icon size={10} className={t.color} />
              </div>
              <div className={`text-base font-bold font-mono ${t.color}`}>{t.value}</div>
              <div className="text-[9px] text-muted mt-0.5 truncate">{t.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
