"use client";
import { useStats } from "@/lib/hooks/useStats";

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export default function BotStatus() {
  const { data, error } = useStats();
  const stats = data?.stats;
  const bot = data?.bot;

  const trendCloudActive =
    bot?.trend_cloud === "BULL" || bot?.trend_cloud === "BULLISH";

  const rows: Array<{ k: string; v: string; color: string }> = [
    {
      k: "Status",
      v: bot?.active ? "ACTIVE" : "IDLE",
      color: bot?.active ? "text-accent" : "text-muted",
    },
    { k: "Strategy", v: bot?.strategy ?? "—", color: "text-white" },
    {
      k: "Trend Cloud",
      v: bot?.trend_cloud ?? "—",
      color: trendCloudActive ? "text-accent" : "text-muted",
    },
    {
      k: "Win Rate",
      v: stats ? `${stats.win_rate.toFixed(1)}%` : "—",
      color: stats && stats.win_rate >= 50 ? "text-accent" : "text-accentRed",
    },
    {
      k: "Threshold",
      v: bot?.threshold != null ? String(bot.threshold) : "—",
      color: "text-accentBlue",
    },
    {
      k: "Trades Today",
      v: stats ? String(stats.today_trades) : "—",
      color: "text-white",
    },
    {
      k: "Daily P&L",
      v: stats ? fmtUsd(stats.today_pnl) : "—",
      color: stats && stats.today_pnl >= 0 ? "text-accent" : "text-accentRed",
    },
  ];

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Bot Status</h2>
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            bot?.active ? "bg-accent animate-pulse" : "bg-muted"
          }`}
        />
      </div>
      {error && (
        <div className="text-xs text-accentRed mb-3">Error: {error}</div>
      )}
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between text-sm">
            <span className="text-muted">{r.k}</span>
            <span className={`font-mono font-semibold ${r.color}`}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
