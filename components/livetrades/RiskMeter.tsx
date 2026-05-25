"use client";
import { Shield, AlertTriangle } from "lucide-react";
import { useStats } from "@/lib/hooks/useStats";
import { useAccount } from "@/lib/hooks/useAccount";

// Default daily loss limit — should come from a settings table later.
const DEFAULT_DAILY_LIMIT_PCT = 3; // 3% of account

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function RiskMeter() {
  const { data: statsData } = useStats();
  const { data: accountData } = useAccount();

  const todayPnl = statsData?.stats.today_pnl ?? 0;
  const balance = accountData?.account.balance ?? 0;

  const dailyLimit = balance > 0 ? balance * (DEFAULT_DAILY_LIMIT_PCT / 100) : 0;
  const consumed = todayPnl < 0 ? Math.abs(todayPnl) : 0;
  const consumedPct =
    dailyLimit > 0 ? Math.min(100, (consumed / dailyLimit) * 100) : 0;

  const status =
    consumedPct >= 80 ? "danger" :
    consumedPct >= 50 ? "warning" :
                        "ok";
  const statusColor =
    status === "danger" ? "#ff3366" :
    status === "warning" ? "#ffd700" :
                           "#00ff88";
  const statusLabel =
    status === "danger" ? "AT RISK" :
    status === "warning" ? "WATCH" :
                           "HEALTHY";

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-accent" />
          <h2 className="text-sm font-semibold tracking-wide">RISK METER</h2>
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ backgroundColor: statusColor + "20", color: statusColor }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Daily limit bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-wider">
          <span>Daily loss limit</span>
          <span className="font-mono">{fmtUsd(dailyLimit)}</span>
        </div>
        <div className="h-2 bg-panel2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${consumedPct}%`,
              backgroundColor: statusColor,
              boxShadow: status !== "ok" ? `0 0 12px ${statusColor}80` : "none",
            }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted">Consumed</span>
          <span className="font-mono font-semibold" style={{ color: statusColor }}>
            {consumed > 0 ? `−$${consumed.toFixed(2)} (${consumedPct.toFixed(0)}%)` : "—"}
          </span>
        </div>
      </div>

      {/* Today's PnL summary */}
      <div className="mt-4 pt-3 border-t border-border space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Today's P&L</span>
          <span
            className={`font-mono font-semibold ${
              todayPnl >= 0 ? "text-accent" : "text-accentRed"
            }`}
          >
            {fmtUsd(todayPnl)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">Account balance</span>
          <span className="font-mono">{accountData ? `$${balance.toFixed(2)}` : "—"}</span>
        </div>
      </div>

      {status !== "ok" && (
        <div
          className="mt-3 p-2.5 rounded-md flex items-start gap-2 text-[11px] leading-relaxed"
          style={{
            backgroundColor: statusColor + "12",
            border: `1px solid ${statusColor}40`,
            color: statusColor,
          }}
        >
          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
          {status === "danger"
            ? "Within 20% of daily loss limit — consider stopping for the day."
            : "Halfway to daily loss limit — tighten filters or reduce size."}
        </div>
      )}
    </div>
  );
}
