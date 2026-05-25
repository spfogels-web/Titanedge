"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { Trade } from "@/lib/types";

interface Props {
  trades: Trade[];
}

export default function CumulativePnLChart({ trades }: Props) {
  // Sort closed trades by close time, compute running cumulative P&L
  const closed = trades
    .filter((t) => t.status === "CLOSED" && t.closed_at && t.pnl != null)
    .sort(
      (a, b) =>
        new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime(),
    );

  let cum = 0;
  const data = closed.map((t, i) => {
    cum += Number(t.pnl);
    const d = new Date(t.closed_at!);
    return {
      idx: i + 1,
      date: d,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      timeLabel: d.toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
      }),
      cumulative: Number(cum.toFixed(2)),
      tradePnl: Number(Number(t.pnl).toFixed(2)),
      symbol: t.symbol,
    };
  });

  const peak = Math.max(0, ...data.map((d) => d.cumulative));
  const trough = Math.min(0, ...data.map((d) => d.cumulative));

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-accent" />
          <h2 className="text-sm font-semibold tracking-wide">CUMULATIVE EQUITY CURVE</h2>
        </div>
        <div className="text-[10px] text-muted">
          {data.length} closed · peak ${peak.toFixed(2)}{trough < 0 ? ` · trough $${trough.toFixed(2)}` : ""}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-xs text-muted">
          No closed trades yet. Equity curve will plot here as trades close.
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="eq-pos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff88" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="eq-neg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff3366" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ff3366" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#27272f" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#888892", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={40}
              />
              <YAxis
                tick={{ fill: "#888892", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v: number) => `$${v.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{ background: "#13131a", border: "1px solid #27272f", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#888892" }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, "Cumulative"]}
                labelFormatter={(_v, payload) => {
                  const p = payload?.[0]?.payload as
                    | { label?: string; timeLabel?: string; symbol?: string; tradePnl?: number }
                    | undefined;
                  if (!p) return "";
                  const pnlStr = p.tradePnl != null
                    ? `${p.tradePnl >= 0 ? "+" : ""}$${p.tradePnl.toFixed(2)}`
                    : "";
                  return `${p.label} ${p.timeLabel} · ${p.symbol ?? ""} ${pnlStr}`;
                }}
              />
              <ReferenceLine y={0} stroke="#27272f" strokeDasharray="2 2" />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke={cum >= 0 ? "#00ff88" : "#ff3366"}
                strokeWidth={2}
                fill={cum >= 0 ? "url(#eq-pos)" : "url(#eq-neg)"}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
