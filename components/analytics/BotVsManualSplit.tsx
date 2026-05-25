"use client";
import { Bot, User } from "lucide-react";
import { useTrades } from "@/lib/hooks/useTrades";
import type { Trade } from "@/lib/types";

interface SourceStats {
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  netPnl: number;
  avgWin: number;
  avgLoss: number;
  expectancy: number;
  profitFactor: number;
}

function compute(closed: Trade[]): SourceStats {
  if (closed.length === 0) {
    return {
      trades: 0, wins: 0, losses: 0, winRate: 0,
      netPnl: 0, avgWin: 0, avgLoss: 0,
      expectancy: 0, profitFactor: 0,
    };
  }
  const trades = closed.length;
  let wins = 0;
  let losses = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let netPnl = 0;
  for (const t of closed) {
    const pnl = Number(t.pnl ?? 0);
    netPnl += pnl;
    if (pnl > 0) { wins++; grossProfit += pnl; }
    else if (pnl < 0) { losses++; grossLoss += pnl; }
  }
  const winRate = (wins / trades) * 100;
  const avgWin = wins > 0 ? grossProfit / wins : 0;
  const avgLoss = losses > 0 ? grossLoss / losses : 0;
  const expectancy = trades > 0 ? netPnl / trades : 0;
  const profitFactor = grossLoss !== 0 ? Math.abs(grossProfit / grossLoss) : grossProfit > 0 ? Infinity : 0;
  return { trades, wins, losses, winRate, netPnl, avgWin, avgLoss, expectancy, profitFactor };
}

function fmtMoney(n: number, sign = false): string {
  const s = sign && n > 0 ? "+" : n < 0 ? "−" : "";
  return `${s}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function BotVsManualSplit() {
  const { data } = useTrades({ limit: 500 });
  const trades = (data?.trades ?? []).filter((t) => t.status === "CLOSED");
  const botStats = compute(trades.filter((t) => t.source === "BOT"));
  const manualStats = compute(trades.filter((t) => t.source === "MANUAL"));

  const totalTrades = botStats.trades + manualStats.trades;
  const botShare = totalTrades > 0 ? (botStats.trades / totalTrades) * 100 : 0;

  const edge = botStats.expectancy - manualStats.expectancy;

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wide">BOT vs MANUAL</h2>
        <span className="text-[10px] text-muted">Source attribution</span>
      </div>

      {totalTrades === 0 ? (
        <div className="bg-panel2 border border-dashed border-border rounded-lg p-6 text-center text-xs text-muted">
          No closed trades yet. Both sources will populate as trades fire.
        </div>
      ) : (
        <>
          {/* Split bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] text-muted mb-1.5">
              <span>Trade volume split</span>
              <span>{totalTrades} total</span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden bg-bg/40">
              <div
                className="bg-accentBlue transition-all"
                style={{ width: `${botShare}%` }}
                title={`Bot: ${botStats.trades}`}
              />
              <div
                className="bg-gold transition-all"
                style={{ width: `${100 - botShare}%` }}
                title={`Manual: ${manualStats.trades}`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] mt-1.5">
              <span className="text-accentBlue">
                <Bot size={10} className="inline mr-1" />
                Bot {botShare.toFixed(0)}%
              </span>
              <span className="text-gold">
                Manual {(100 - botShare).toFixed(0)}%
                <User size={10} className="inline ml-1" />
              </span>
            </div>
          </div>

          {/* Side-by-side stats */}
          <div className="grid grid-cols-2 gap-3">
            <SourcePanel label="BOT" icon={Bot} color="text-accentBlue" stats={botStats} />
            <SourcePanel label="MANUAL" icon={User} color="text-gold" stats={manualStats} />
          </div>

          {/* Edge */}
          {botStats.trades > 0 && manualStats.trades > 0 && (
            <div
              className={`mt-3 pt-3 border-t border-border text-xs ${
                edge > 0 ? "text-accentBlue" : edge < 0 ? "text-gold" : "text-muted"
              }`}
            >
              <strong>Edge:</strong>{" "}
              {edge > 0
                ? `Bot expectancy is ${fmtMoney(Math.abs(edge))} higher per trade than your manual entries.`
                : edge < 0
                ? `Your manual trades are outperforming the bot by ${fmtMoney(Math.abs(edge))} per trade.`
                : "Even split — bot and manual show identical expectancy."}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SourcePanel({
  label, icon: Icon, color, stats,
}: { label: string; icon: typeof Bot; color: string; stats: SourceStats }) {
  return (
    <div className="bg-panel2 border border-border rounded-md p-3">
      <div className={`flex items-center gap-2 mb-3 ${color}`}>
        <Icon size={12} />
        <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className="space-y-2">
        <Row label="Trades" value={`${stats.trades}`} />
        <Row label="Win rate" value={`${stats.winRate.toFixed(0)}%`} />
        <Row
          label="Net PnL"
          value={fmtMoney(stats.netPnl, true)}
          color={stats.netPnl >= 0 ? "text-accent" : "text-accentRed"}
        />
        <Row label="Avg win" value={fmtMoney(stats.avgWin)} color="text-accent" />
        <Row label="Avg loss" value={fmtMoney(stats.avgLoss)} color="text-accentRed" />
        <Row
          label="Expectancy"
          value={fmtMoney(stats.expectancy, true)}
          color={stats.expectancy >= 0 ? "text-accent" : "text-accentRed"}
        />
        <Row
          label="Profit factor"
          value={isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "∞"}
          color={stats.profitFactor >= 1 ? "text-accent" : "text-accentRed"}
        />
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-muted">{label}</span>
      <span className={`font-mono font-semibold ${color ?? "text-white"}`}>{value}</span>
    </div>
  );
}
