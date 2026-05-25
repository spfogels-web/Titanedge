"use client";
import { Award, Skull } from "lucide-react";
import type { Trade } from "@/lib/types";

interface Props { trades: Trade[]; }

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export default function TopBottomTrades({ trades }: Props) {
  const closed = trades
    .filter((t) => t.status === "CLOSED" && t.pnl != null)
    .map((t) => ({ ...t, pnlNum: Number(t.pnl) }));

  const topWins = [...closed].sort((a, b) => b.pnlNum - a.pnlNum).slice(0, 5);
  const topLosses = [...closed].sort((a, b) => a.pnlNum - b.pnlNum).slice(0, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Panel
        title="TOP 5 WINNERS"
        icon={Award}
        color="text-accent"
        accent="#00ff88"
        trades={topWins}
        emptyText="No winners yet."
      />
      <Panel
        title="TOP 5 LOSERS"
        icon={Skull}
        color="text-accentRed"
        accent="#ff3366"
        trades={topLosses.filter((t) => t.pnlNum < 0)}
        emptyText="No losers yet (impressive)."
      />
    </div>
  );
}

function Panel({
  title, icon: Icon, color, accent, trades, emptyText,
}: {
  title: string;
  icon: typeof Award;
  color: string;
  accent: string;
  trades: Array<Trade & { pnlNum: number }>;
  emptyText: string;
}) {
  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} className={color} />
        <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted">{emptyText}</div>
      ) : (
        <ul className="space-y-2">
          {trades.map((t, i) => (
            <li
              key={t.id}
              className="flex items-center gap-3 p-2.5 rounded-md bg-panel2/40 border border-border"
            >
              <div
                className="w-6 h-6 rounded font-mono text-[10px] font-bold flex items-center justify-center shrink-0"
                style={{ backgroundColor: accent + "20", color: accent }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-semibold">{t.symbol}</span>
                  <span
                    className={`text-[9px] font-semibold ${
                      t.side === "LONG" ? "text-accent" : "text-accentRed"
                    }`}
                  >
                    {t.side}
                  </span>
                  <span className="text-[10px] text-muted">×{t.quantity}</span>
                </div>
                <div className="text-[10px] text-muted mt-0.5 truncate">
                  {t.closed_at ? fmtDate(t.closed_at) : "—"}
                  {t.strategy && ` · ${t.strategy}`}
                </div>
              </div>
              <div className={`font-mono font-bold ${color}`}>{fmtUsd(t.pnlNum)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
