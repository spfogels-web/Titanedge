"use client";
import { Flame, Snowflake, Minus } from "lucide-react";
import { patterns } from "@/lib/mock/ai";

const STATUS_META = {
  hot:     { icon: Flame,     color: "text-accentRed", label: "HOT"     },
  cold:    { icon: Snowflake, color: "text-accentBlue",label: "COLD"    },
  neutral: { icon: Minus,     color: "text-muted",     label: "NEUTRAL" },
};

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toFixed(0)}`;
}

export default function PatternStatsTable() {
  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wide">PATTERN RECOGNITION</h2>
        <span className="text-[10px] text-muted">{patterns.length} patterns tracked</span>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead className="text-muted uppercase tracking-wider">
            <tr>
              <th className="text-left py-2 font-normal">Pattern</th>
              <th className="text-right font-normal">Win Rate</th>
              <th className="text-right font-normal">Trades</th>
              <th className="text-right font-normal">Avg Win</th>
              <th className="text-right font-normal">Avg Loss</th>
              <th className="text-right font-normal">Expectancy</th>
              <th className="text-left font-normal pl-4">Best Session</th>
              <th className="text-left font-normal">VIX Range</th>
              <th className="text-right font-normal">Freq/Wk</th>
              <th className="text-right font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {patterns.map((p) => {
              const status = STATUS_META[p.status];
              const StatusIcon = status.icon;
              return (
                <tr key={p.name} className="border-t border-border hover:bg-panel2/50 transition">
                  <td className="py-3 font-medium">{p.name}</td>
                  <td className="text-right font-mono">
                    <span className={p.winRate >= 65 ? "text-accent" : p.winRate >= 50 ? "text-gold" : "text-accentRed"}>
                      {p.winRate}%
                    </span>
                  </td>
                  <td className="text-right font-mono text-muted">{p.trades}</td>
                  <td className="text-right font-mono text-accent">{fmtUsd(p.avgProfit)}</td>
                  <td className="text-right font-mono text-accentRed">{fmtUsd(-p.avgLoss)}</td>
                  <td className={`text-right font-mono font-semibold ${p.expectancy >= 0 ? "text-accent" : "text-accentRed"}`}>
                    {fmtUsd(p.expectancy)}
                  </td>
                  <td className="pl-4 text-muted">{p.bestSession}</td>
                  <td className="text-muted font-mono">{p.bestVixRange}</td>
                  <td className="text-right font-mono text-muted">{p.freqPerWeek}</td>
                  <td className="text-right">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${status.color}`}>
                      <StatusIcon size={11} /> {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
