"use client";
import { TrendingUp, TrendingDown, Award, Flame, Target, Activity } from "lucide-react";
import type { Trade } from "@/lib/types";

interface Props {
  trades: Trade[];   // already filtered
}

function fmtUsd(n: number, opts: { sign?: boolean } = {}): string {
  const sign = opts.sign && n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Compute current streak: walk closed trades newest → oldest; count
// consecutive wins or losses. Returns positive int for winning streak,
// negative for losing streak.
function currentStreak(closed: Trade[]): number {
  if (closed.length === 0) return 0;
  const sorted = [...closed].sort(
    (a, b) =>
      new Date(b.closed_at ?? b.opened_at).getTime() -
      new Date(a.closed_at ?? a.opened_at).getTime(),
  );
  let streak = 0;
  const firstPnl = Number(sorted[0].pnl ?? 0);
  const isWin = firstPnl > 0;
  for (const t of sorted) {
    const p = Number(t.pnl ?? 0);
    const w = p > 0;
    if (w !== isWin) break;
    streak += 1;
  }
  return isWin ? streak : -streak;
}

export default function TradeHistoryHero({ trades }: Props) {
  const closed = trades.filter((t) => t.status === "CLOSED" && t.pnl != null);
  const wins = closed.filter((t) => Number(t.pnl) > 0);
  const losses = closed.filter((t) => Number(t.pnl) <= 0);
  const totalPnl = closed.reduce((acc, t) => acc + Number(t.pnl ?? 0), 0);
  const winRate = closed.length === 0 ? 0 : (wins.length / closed.length) * 100;
  const biggestWin = wins.length > 0 ? Math.max(...wins.map((t) => Number(t.pnl))) : 0;
  const biggestLoss = losses.length > 0 ? Math.min(...losses.map((t) => Number(t.pnl))) : 0;
  const expectancy = closed.length === 0 ? 0 : totalPnl / closed.length;
  const streak = currentStreak(closed);

  const pnlGood = totalPnl >= 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border p-6"
      style={{
        background:
          `linear-gradient(135deg, ${pnlGood ? "rgba(0,255,136,0.08)" : "rgba(255,51,102,0.08)"} 0%, rgba(0,170,255,0.04) 50%, rgba(170,80,255,0.05) 100%), #13131a`,
      }}
    >
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${pnlGood ? "rgba(0,255,136,0.18)" : "rgba(255,51,102,0.18)"}, transparent 65%)` }}
      />

      <div className="relative grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <HeroStat
          icon={Activity}
          label="Total Trades"
          value={String(closed.length)}
          sub={`${wins.length}W · ${losses.length}L`}
          color="text-white"
        />
        <HeroStat
          icon={Target}
          label="Win Rate"
          value={`${winRate.toFixed(1)}%`}
          sub={closed.length > 0 ? `over ${closed.length} closed` : "no closed trades"}
          color={winRate >= 60 ? "text-accent" : winRate >= 45 ? "text-gold" : "text-accentRed"}
        />
        <HeroStat
          icon={pnlGood ? TrendingUp : TrendingDown}
          label="Total P&L"
          value={fmtUsd(totalPnl, { sign: true })}
          sub={`Expectancy ${fmtUsd(expectancy, { sign: true })}/trade`}
          color={pnlGood ? "text-accent" : "text-accentRed"}
        />
        <HeroStat
          icon={Award}
          label="Biggest Win"
          value={fmtUsd(biggestWin, { sign: true })}
          sub="single trade"
          color="text-accent"
        />
        <HeroStat
          icon={TrendingDown}
          label="Biggest Loss"
          value={fmtUsd(biggestLoss, { sign: true })}
          sub="single trade"
          color="text-accentRed"
        />
        <HeroStat
          icon={Flame}
          label="Current Streak"
          value={
            streak === 0
              ? "—"
              : `${Math.abs(streak)}${streak > 0 ? "W" : "L"}`
          }
          sub={
            streak === 0
              ? "no closed trades"
              : streak > 0
              ? "consecutive winners"
              : "consecutive losers"
          }
          color={streak > 0 ? "text-accent" : streak < 0 ? "text-accentRed" : "text-muted"}
        />
      </div>
    </div>
  );
}

function HeroStat({
  icon: Icon, label, value, sub, color,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase tracking-wider">
        <Icon size={11} />
        {label}
      </div>
      <div className={`text-xl md:text-2xl font-bold font-mono leading-none ${color}`}>
        {value}
      </div>
      <div className="text-[10px] text-muted mt-0.5 truncate">{sub}</div>
    </div>
  );
}
