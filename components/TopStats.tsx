"use client";
import { DollarSign, TrendingUp, BarChart3, TrendingDown, Activity, Wallet } from "lucide-react";
import { useStats } from "@/lib/hooks/useStats";
import Sparkline from "./charts/Sparkline";
import MiniLine from "./charts/MiniLine";
import MiniBars from "./charts/MiniBars";
import Donut from "./charts/Donut";

function fmtUsd(n: number, opts: { sign?: boolean } = {}): string {
  const sign = opts.sign && n >= 0 ? "+" : n < 0 ? "−" : "";
  const body = Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}$${body}`;
}

// Mock decoration series for the cards that don't have real data yet (5C wires them).
const PNL_SPARK = [120, 145, 160, 180, 175, 200, 230, 220, 260, 290, 310, 340, 360, 380, 420, 450, 490, 520, 560, 600];
const PROFIT_FACTOR_SERIES = [1.6, 1.8, 1.7, 1.9, 2.1, 1.95, 2.2, 2.05, 2.0, 2.15, 2.1, 2.25, 2.1, 2.05, 2.2, 2.15, 2.1, 2.3, 2.15, 2.14];
const DRAWDOWN_BARS = [-80, -120, -150, -200, -180, -260, -290, -340, -380, -420];

export default function TopStats() {
  const { data } = useStats();
  const s = data?.stats;

  const todayPnl = s?.today_pnl ?? 0;
  const winRate = s?.win_rate ?? 0;
  const wins = s?.wins ?? 0;
  const losses = s?.losses ?? 0;

  // Mocked / not yet wired to API:
  const profitFactor = 2.14;
  const maxDrawdown = -420.5;
  const totalTrades30d = 66;
  const longs = 38;
  const shorts = 28;
  const accountBalance = 52418.75;
  const equity = 52418.75;
  const available = 49872.2;

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* 1. TOTAL P&L (TODAY) */}
      <div className="bg-panel border border-border rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-wider">
          <span>Total P&amp;L (Today)</span>
          <DollarSign size={14} className="text-muted" />
        </div>
        <div className={`mt-3 text-2xl font-bold ${todayPnl >= 0 ? "text-accent" : "text-accentRed"}`}>
          {fmtUsd(todayPnl, { sign: true })}
        </div>
        <div className="text-[10px] text-accent mt-0.5">+2.34%</div>
        <div className="mt-3 -mx-1">
          <Sparkline data={PNL_SPARK} color={todayPnl >= 0 ? "#00ff88" : "#ff3366"} height={36} />
        </div>
        <div className="text-[10px] text-muted mt-1">
          Vs Yesterday <span className="text-white font-mono">$632.10</span>
        </div>
      </div>

      {/* 2. WIN RATE (30D) */}
      <div className="bg-panel border border-border rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-wider">
          <span>Win Rate (30D)</span>
          <TrendingUp size={14} className="text-muted" />
        </div>
        <div className="mt-3 text-2xl font-bold">{winRate.toFixed(1)}%</div>
        <div className="mt-3 h-1.5 bg-panel2 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(winRate, 100)}%`,
              backgroundColor: "#aa50ff",
            }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px]">
          <div>
            <div className="text-muted uppercase tracking-wider">Wins</div>
            <div className="font-mono font-semibold text-accent">{wins}</div>
          </div>
          <div className="text-right">
            <div className="text-muted uppercase tracking-wider">Losses</div>
            <div className="font-mono font-semibold text-accentRed">{losses}</div>
          </div>
        </div>
      </div>

      {/* 3. PROFIT FACTOR (30D) */}
      <div className="bg-panel border border-border rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-wider">
          <span>Profit Factor (30D)</span>
          <BarChart3 size={14} className="text-muted" />
        </div>
        <div className="mt-3 text-2xl font-bold">{profitFactor.toFixed(2)}</div>
        <div className="mt-3 -mx-1 flex-1 min-h-[50px]">
          <MiniLine
            data={PROFIT_FACTOR_SERIES}
            color="#00aaff"
            height={50}
            ticks={[1, 2, 3]}
            domain={[0.5, 3.5]}
          />
        </div>
      </div>

      {/* 4. MAX DRAWDOWN (30D) */}
      <div className="bg-panel border border-border rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-wider">
          <span>Max Drawdown (30D)</span>
          <TrendingDown size={14} className="text-accentRed" />
        </div>
        <div className="mt-3 text-2xl font-bold text-accentRed">
          {fmtUsd(maxDrawdown)}
        </div>
        <div className="mt-3 -mx-1 flex-1 min-h-[50px]">
          <MiniBars data={DRAWDOWN_BARS} color="#ff3366" height={50} showAxis />
        </div>
      </div>

      {/* 5. TOTAL TRADES (30D) */}
      <div className="bg-panel border border-border rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-wider">
          <span>Total Trades (30D)</span>
          <Activity size={14} className="text-muted" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl font-bold">{totalTrades30d}</div>
            <div className="mt-2 space-y-0.5 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-muted">Longs</span>
                <span className="font-mono font-semibold ml-auto">{longs}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accentRed" />
                <span className="text-muted">Shorts</span>
                <span className="font-mono font-semibold ml-auto">{shorts}</span>
              </div>
            </div>
          </div>
          <Donut
            slices={[
              { name: "Longs", value: longs, color: "#00ff88" },
              { name: "Shorts", value: shorts, color: "#ff3366" },
            ]}
            size={72}
            innerRadius={20}
            outerRadius={32}
          />
        </div>
      </div>

      {/* 6. ACCOUNT BALANCE */}
      <div className="bg-panel border border-border rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-wider">
          <span>Account Balance</span>
          <Wallet size={14} className="text-muted" />
        </div>
        <div className="mt-3 text-2xl font-bold">
          {fmtUsd(accountBalance)}
        </div>
        <div className="mt-4 space-y-1.5 text-[10px]">
          <div className="flex items-center justify-between">
            <span className="text-muted uppercase tracking-wider">Equity</span>
            <span className="font-mono font-semibold">{fmtUsd(equity)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted uppercase tracking-wider">Available</span>
            <span className="font-mono font-semibold">{fmtUsd(available)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
