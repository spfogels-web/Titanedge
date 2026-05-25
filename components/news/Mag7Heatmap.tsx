"use client";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";
import { Layers } from "lucide-react";
import { mag7Stocks } from "@/lib/mock/marketSnapshot";

function fmtNum(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Mag7Heatmap() {
  const bullishCount = mag7Stocks.filter((s) => s.aboveEma50).length;
  const avgChange = mag7Stocks.reduce((acc, s) => acc + s.change, 0) / mag7Stocks.length;

  const breadthColor =
    bullishCount >= 6 ? "text-accent" :
    bullishCount >= 4 ? "text-gold" :
                        "text-accentRed";

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">MAG 7 BREADTH</h2>
        </div>
        <div className="text-[10px] text-muted">
          <span className={`font-mono font-bold ${breadthColor}`}>{bullishCount} / 7</span> above 50 EMA
          {" · avg "}
          <span className={avgChange >= 0 ? "text-accent" : "text-accentRed"}>
            {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {mag7Stocks.map((s) => {
          const up = s.change >= 0;
          const color = up ? "#00ff88" : "#ff3366";
          return (
            <div
              key={s.ticker}
              className="rounded-lg border p-3 transition"
              style={{
                borderColor: s.aboveEma50 ? color + "30" : "#27272f",
                background: `linear-gradient(135deg, ${color}12 0%, transparent 70%), #1a1a24`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold">{s.ticker}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${s.aboveEma50 ? "" : "opacity-50"}`}
                  style={{ backgroundColor: color }}
                  title={s.aboveEma50 ? "Above 50 EMA" : "Below 50 EMA"}
                />
              </div>
              <div className="text-[9px] text-muted mt-0.5">{s.name}</div>
              <div className="mt-2 text-sm font-mono font-bold">{fmtNum(s.price)}</div>
              <div className={`text-[10px] font-mono font-semibold ${up ? "text-accent" : "text-accentRed"}`}>
                {up ? "+" : ""}{s.change.toFixed(2)}%
              </div>
              <div className="mt-1.5 -mx-1" style={{ height: 24 }}>
                <ResponsiveContainer>
                  <LineChart data={s.spark.map((v, i) => ({ i, v }))} margin={{ top: 1, right: 1, bottom: 1, left: 1 }}>
                    <YAxis hide domain={["dataMin", "dataMax"]} />
                    <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
