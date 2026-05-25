"use client";
import Sparkline from "./charts/Sparkline";

interface Row {
  label: string;
  value: string;
  color?: string;
}

const VIX_SPARK = [16.0, 15.8, 15.5, 15.7, 15.3, 14.9, 15.1, 14.7, 14.5, 14.6, 14.3, 14.5, 14.32];

const rows: Row[] = [
  { label: "Market Regime", value: "TRENDING", color: "text-accent" },
  { label: "Volatility",    value: "MEDIUM",   color: "text-gold" },
  { label: "Session",       value: "US MARKET", color: "text-accentBlue" },
  { label: "Magnificent 7", value: "BULLISH",  color: "text-accent" },
  { label: "News Impact",   value: "LOW",      color: "text-accent" },
];

export default function MarketConditions() {
  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold tracking-wide mb-3">
        MARKET CONDITIONS
      </h2>

      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div>
          <div className="text-xs text-muted">VIX</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-mono font-bold text-lg">14.32</span>
            <span className="text-[10px] text-accentRed font-mono">-3.21%</span>
          </div>
        </div>
        <div className="w-24 h-10">
          <Sparkline data={VIX_SPARK} color="#00ff88" height={40} />
        </div>
      </div>

      <div className="space-y-2.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-muted">{r.label}</span>
            <span className={`font-mono font-semibold ${r.color ?? "text-white"}`}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
