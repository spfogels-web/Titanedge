"use client";
import { TrendingUp, TrendingDown, Award, Target, Zap, Activity } from "lucide-react";
import type { Trade } from "@/lib/types";

interface Props { trades: Trade[]; }

function fmtUsd(n: number, opts: { sign?: boolean } = {}): string {
  const sign = opts.sign && n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PerformanceHero({ trades }: Props) {
  const closed = trades.filter((t) => t.status === "CLOSED" && t.pnl != null);
  const wins = closed.filter((t) => Number(t.pnl) > 0);
  const losses = closed.filter((t) => Number(t.pnl) <= 0);
  const totalPnl = closed.reduce((a, t) => a + Number(t.pnl ?? 0), 0);
  const winRate = closed.length === 0 ? 0 : (wins.length / closed.length) * 100;
  const grossProfit = wins.reduce((a, t) => a + Number(t.pnl), 0);
  const grossLoss = Math.abs(losses.reduce((a, t) => a + Number(t.pnl), 0));
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;
  const expectancy = closed.length === 0 ? 0 : totalPnl / closed.length;
  const avgWin = wins.length === 0 ? 0 : wins.reduce((a, t) => a + Number(t.pnl), 0) / wins.length;
  const avgLoss = losses.length === 0 ? 0 : Math.abs(losses.reduce((a, t) => a + Number(t.pnl), 0) / losses.length);

  const good = totalPnl >= 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border p-6"
      style={{
        background:
          `linear-gradient(135deg, ${good ? "rgba(0,255,136,0.08)" : "rgba(255,51,102,0.08)"} 0%, rgba(0,170,255,0.04) 50%, rgba(170,80,255,0.05) 100%), #13131a`,
      }}
    >
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${good ? "rgba(0,255,136,0.18)" : "rgba(255,51,102,0.18)"}, transparent 65%)` }}
      />
      <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Stat icon={Activity} label="Total Trades" value={String(closed.length)} sub={`${wins.length}W · ${losses.length}L`} color="text-white" />
        <Stat icon={Target} label="Win Rate" value={`${winRate.toFixed(1)}%`} sub={`expectancy ${fmtUsd(expectancy, { sign: true })}/trade`} color={winRate >= 60 ? "text-accent" : winRate >= 45 ? "text-gold" : "text-accentRed"} />
        <Stat icon={good ? TrendingUp : TrendingDown} label="Net P&L" value={fmtUsd(totalPnl, { sign: true })} sub={`${closed.length} closed trades`} color={good ? "text-accent" : "text-accentRed"} />
        <Stat icon={Zap} label="Profit Factor" value={Number.isFinite(profitFactor) ? profitFactor.toFixed(2) : "∞"} sub={`gross +${(grossProfit/1000).toFixed(1)}K / −${(grossLoss/1000).toFixed(1)}K`} color={profitFactor >= 2 ? "text-accent" : profitFactor >= 1.2 ? "text-gold" : "text-accentRed"} />
        <Stat icon={Award} label="Avg Win" value={fmtUsd(avgWin)} sub={`over ${wins.length} winners`} color="text-accent" />
        <Stat icon={TrendingDown} label="Avg Loss" value={fmtUsd(-avgLoss)} sub={`over ${losses.length} losers`} color="text-accentRed" />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon, label, value, sub, color,
}: { icon: typeof Activity; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase tracking-wider">
        <Icon size={11} />
        {label}
      </div>
      <div className={`text-xl md:text-2xl font-bold font-mono leading-none ${color}`}>{value}</div>
      <div className="text-[10px] text-muted mt-0.5 truncate">{sub}</div>
    </div>
  );
}
