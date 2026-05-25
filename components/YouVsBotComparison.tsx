"use client";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { User, Bot, Sparkles, AlertCircle } from "lucide-react";
import { useStats } from "@/lib/hooks/useStats";
import type { Stats } from "@/lib/types";
import { equityOverlay } from "@/lib/mock/account";

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

interface TraderView {
  label: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;        // positive number for display
  biggestWin: number;
  biggestLoss: number;    // positive number for display
  expectancy: number;
  profitFactor: number;
  avgHoldMinutes: number;
}

function viewFromStats(label: string, s: Stats | undefined): TraderView {
  if (!s) {
    return {
      label, trades: 0, wins: 0, losses: 0, winRate: 0, totalPnl: 0,
      avgWin: 0, avgLoss: 0, biggestWin: 0, biggestLoss: 0,
      expectancy: 0, profitFactor: 0, avgHoldMinutes: 0,
    };
  }
  return {
    label,
    trades: s.total_trades,
    wins: s.wins,
    losses: s.losses,
    winRate: s.win_rate,
    totalPnl: s.total_pnl,
    avgWin: s.avg_win,
    avgLoss: Math.abs(s.avg_loss),
    biggestWin: s.biggest_win,
    biggestLoss: Math.abs(s.biggest_loss),
    expectancy: s.expectancy,
    profitFactor: s.profit_factor,
    avgHoldMinutes: s.avg_hold_minutes,
  };
}

function StatRow({
  label,
  user,
  bot,
  format,
  higherIsBetter = true,
}: {
  label: string;
  user: number | string;
  bot: number | string;
  format?: "usd" | "percent" | "number";
  higherIsBetter?: boolean;
}) {
  const userN = typeof user === "number" ? user : parseFloat(String(user));
  const botN = typeof bot === "number" ? bot : parseFloat(String(bot));
  const eitherZero = userN === 0 && botN === 0;

  const userWins = !eitherZero && (higherIsBetter ? userN > botN : userN < botN);
  const botWins = !eitherZero && (higherIsBetter ? botN > userN : botN < userN);

  const fmt = (v: number | string) => {
    if (typeof v === "string") return v;
    if (format === "usd") return fmtUsd(v);
    if (format === "percent") return `${v.toFixed(1)}%`;
    return v.toFixed(format === "number" ? 0 : 2);
  };

  return (
    <div className="grid grid-cols-3 gap-3 items-center py-2.5 border-b border-border last:border-b-0">
      <div className={`text-right font-mono text-sm ${userWins ? "text-accent font-bold" : "text-white"}`}>
        {fmt(user)}
      </div>
      <div className="text-center text-[10px] text-muted uppercase tracking-wider">
        {label}
      </div>
      <div className={`text-left font-mono text-sm ${botWins ? "text-accent font-bold" : "text-white"}`}>
        {fmt(bot)}
      </div>
    </div>
  );
}

function HeaderCard({
  view,
  icon: Icon,
  accent,
  align,
}: {
  view: TraderView;
  icon: typeof User;
  accent: string;
  align: "left" | "right";
}) {
  return (
    <div
      className="bg-panel border rounded-xl p-5"
      style={{ borderColor: accent + "40", boxShadow: `0 0 24px ${accent}15` }}
    >
      <div className={`flex items-center gap-3 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: accent + "20", color: accent }}
        >
          <Icon size={20} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: accent }}>
            {view.label}
          </div>
          <div className="text-2xl font-bold mt-0.5">{fmtUsd(view.totalPnl)}</div>
          <div className="text-[11px] text-muted mt-0.5">
            {view.trades} trades · {view.winRate.toFixed(1)}% win rate
          </div>
        </div>
      </div>
    </div>
  );
}

function buildInsights(user: TraderView, bot: TraderView): string[] {
  const insights: string[] = [];

  if (user.trades + bot.trades === 0) {
    return [
      "No trades logged yet. Fire a paper trade from TradingView or click 'Log Manual Trade' to start building the comparison.",
    ];
  }
  if (user.trades === 0) {
    insights.push("You haven't logged any manual trades yet. Click 'Log Manual Trade' to start tracking your own calls separately from the bot.");
  }
  if (bot.trades === 0) {
    insights.push("No bot trades yet — confirm the TradingView alert is firing into /api/webhook.");
  }
  if (user.trades > 0 && bot.trades > 0) {
    if (user.avgWin > bot.avgWin) {
      const pct = ((user.avgWin / bot.avgWin - 1) * 100).toFixed(0);
      insights.push(`Your avg WIN ($${user.avgWin.toFixed(0)}) is ${pct}% bigger than the bot's ($${bot.avgWin.toFixed(0)}) — you let winners run further.`);
    }
    if (user.avgLoss > bot.avgLoss) {
      const ratio = (user.avgLoss / bot.avgLoss).toFixed(1);
      insights.push(`Your avg LOSS ($${user.avgLoss.toFixed(0)}) is ${ratio}× the bot's — you're not cutting losers as fast.`);
    }
    if (bot.winRate > user.winRate + 3 && user.expectancy > bot.expectancy) {
      insights.push(`Bot wins by consistency (${bot.winRate.toFixed(0)}% WR). You win by magnitude (expectancy $${user.expectancy.toFixed(0)} vs bot's $${bot.expectancy.toFixed(0)}). Two different games.`);
    }
    if (user.avgHoldMinutes > bot.avgHoldMinutes * 1.5) {
      insights.push(`Your holds avg ${user.avgHoldMinutes.toFixed(0)} min vs the bot's ${bot.avgHoldMinutes.toFixed(0)} — you're swinging, bot is scalping.`);
    }
  }
  if (insights.length === 0) {
    insights.push("Comparison data is still thin. Log a few more trades to surface meaningful patterns.");
  }
  return insights;
}

export default function YouVsBotComparison() {
  const { data: userData, error: userErr, loading: userLoading } = useStats({ source: "MANUAL" });
  const { data: botData,  error: botErr,  loading: botLoading  } = useStats({ source: "BOT" });

  const user = viewFromStats("Your Calls", userData?.stats);
  const bot  = viewFromStats("TitanEdge Bot", botData?.stats);

  const insights = buildInsights(user, bot);
  const initialLoading = (userLoading && !userData) || (botLoading && !botData);

  return (
    <div className="space-y-4">
      {(userErr || botErr) && (
        <div className="flex items-center gap-2 text-xs text-accentRed bg-accentRed/10 border border-accentRed/30 rounded-md px-3 py-2">
          <AlertCircle size={13} />
          {userErr ?? botErr}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HeaderCard view={user} icon={User} accent="#aa50ff" align="left" />
        <HeaderCard view={bot}  icon={Bot}  accent="#00ff88" align="right" />
      </div>

      <div className="bg-panel border border-border rounded-xl p-5">
        <div className="grid grid-cols-3 gap-3 pb-2 border-b border-border">
          <div className="text-right text-[10px] text-muted uppercase tracking-wider font-semibold">
            <span style={{ color: "#aa50ff" }}>YOU</span>
          </div>
          <div className="text-center text-[10px] text-muted uppercase tracking-wider font-semibold">
            METRIC
          </div>
          <div className="text-left text-[10px] text-muted uppercase tracking-wider font-semibold">
            <span style={{ color: "#00ff88" }}>BOT</span>
          </div>
        </div>
        <StatRow label="Total trades"    user={user.trades}        bot={bot.trades}        format="number" />
        <StatRow label="Win rate"        user={user.winRate}       bot={bot.winRate}       format="percent" />
        <StatRow label="Total P&L"       user={user.totalPnl}      bot={bot.totalPnl}      format="usd" />
        <StatRow label="Avg win"         user={user.avgWin}        bot={bot.avgWin}        format="usd" />
        <StatRow label="Avg loss"        user={user.avgLoss}       bot={bot.avgLoss}       format="usd" higherIsBetter={false} />
        <StatRow label="Biggest win"     user={user.biggestWin}    bot={bot.biggestWin}    format="usd" />
        <StatRow label="Biggest loss"    user={user.biggestLoss}   bot={bot.biggestLoss}   format="usd" higherIsBetter={false} />
        <StatRow label="Expectancy"      user={user.expectancy}    bot={bot.expectancy}    format="usd" />
        <StatRow label="Profit factor"   user={user.profitFactor}  bot={bot.profitFactor}  />
        <StatRow label="Avg hold (min)"  user={user.avgHoldMinutes} bot={bot.avgHoldMinutes} format="number" />
      </div>

      {/* Equity overlay — still mock until we compute daily aggregates from trades */}
      <div className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold tracking-wide">EQUITY CURVES — 30 SESSIONS</h2>
          <span className="text-[10px] text-muted italic">demo curves · live aggregation coming</span>
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={equityOverlay} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#27272f" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#888892", fontSize: 10 }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fill: "#888892", fontSize: 10 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => `$${v}`} />
              <Tooltip
                contentStyle={{ background: "#13131a", border: "1px solid #27272f", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#888892" }}
                formatter={(v: number, n: string) => [`$${v.toLocaleString()}`, n === "user" ? "You" : "Bot"]}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: "#888892", paddingTop: 4 }}
                formatter={(v: string) => (v === "user" ? "You" : "Bot")}
              />
              <Line type="monotone" dataKey="bot"  stroke="#00ff88" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="user" stroke="#aa50ff" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">AI INSIGHTS</h2>
        </div>
        {initialLoading ? (
          <div className="text-xs text-muted">Loading…</div>
        ) : (
          <ul className="space-y-2.5">
            {insights.map((s, i) => (
              <li key={i} className="text-sm leading-relaxed flex gap-2.5 text-white/90">
                <span className="text-accentBlue shrink-0">›</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
