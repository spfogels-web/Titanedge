"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { TrendingDown } from "lucide-react";
import type { Trade } from "@/lib/types";

interface Props { trades: Trade[]; }

export default function DrawdownChart({ trades }: Props) {
  const closed = trades
    .filter((t) => t.status === "CLOSED" && t.closed_at && t.pnl != null)
    .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime());

  let cum = 0;
  let peak = 0;
  let maxDD = 0;
  const data = closed.map((t) => {
    cum += Number(t.pnl);
    if (cum > peak) peak = cum;
    const dd = cum - peak; // ≤ 0
    if (dd < maxDD) maxDD = dd;
    const d = new Date(t.closed_at!);
    return {
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      drawdown: Number(dd.toFixed(2)),
      peak: Number(peak.toFixed(2)),
    };
  });

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown size={14} className="text-accentRed" />
          <h2 className="text-sm font-semibold tracking-wide">DRAWDOWN ANALYSIS</h2>
        </div>
        <div className="text-[10px] text-muted">
          Max DD <span className="text-accentRed font-mono">${Math.abs(maxDD).toFixed(2)}</span>
          {" · "}
          Peak <span className="text-accent font-mono">${peak.toFixed(2)}</span>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-xs text-muted">
          Drawdown plots once trades start closing.
        </div>
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="dd-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff3366" stopOpacity={0.05} />
                  <stop offset="100%" stopColor="#ff3366" stopOpacity={0.45} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#27272f" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#888892", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={32}
              />
              <YAxis
                tick={{ fill: "#888892", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v: number) => `$${v.toLocaleString()}`}
                domain={[Math.floor(maxDD * 1.1), 0]}
              />
              <Tooltip
                contentStyle={{ background: "#13131a", border: "1px solid #27272f", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#888892" }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, "Drawdown"]}
              />
              <ReferenceLine y={0} stroke="#27272f" strokeDasharray="2 2" />
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#ff3366"
                strokeWidth={2}
                fill="url(#dd-grad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
