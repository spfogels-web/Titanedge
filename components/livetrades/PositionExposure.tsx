"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Briefcase } from "lucide-react";
import { useTrades } from "@/lib/hooks/useTrades";

const SYMBOL_COLORS: Record<string, string> = {
  MNQ: "#00ff88", NQ: "#00ff88",
  MES: "#00aaff", ES: "#00aaff",
  MYM: "#aa50ff", YM: "#aa50ff",
  M2K: "#ff8c42", RTY: "#ff8c42",
  MGC: "#ffd700", GC: "#ffd700",
  MCL: "#ff3366", CL: "#ff3366",
};
const MULTIPLIERS: Record<string, number> = {
  MNQ: 2, NQ: 20, MES: 5, ES: 50, MYM: 0.5, YM: 5,
  M2K: 5, RTY: 50, MGC: 10, GC: 100, MCL: 100, CL: 1000,
};

function baseSymbol(s: string): string {
  return s.replace(/\d+!$/, "").replace(/[FGHJKMNQUVXZ]\d{1,2}$/i, "").toUpperCase();
}

export default function PositionExposure() {
  const { data } = useTrades({ status: "OPEN" });
  const trades = data?.trades ?? [];

  // Aggregate exposure per base symbol: notional = qty × entry × multiplier
  const exposureMap: Record<string, number> = {};
  let total = 0;
  for (const t of trades) {
    const base = baseSymbol(t.symbol);
    const entry = t.entry_price != null ? Number(t.entry_price) : 0;
    const mult = MULTIPLIERS[base] ?? 1;
    const notional = entry * t.quantity * mult;
    exposureMap[base] = (exposureMap[base] ?? 0) + notional;
    total += notional;
  }
  const slices = Object.entries(exposureMap).map(([sym, value]) => ({
    name: sym,
    value,
    color: SYMBOL_COLORS[sym] ?? "#888892",
  }));

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Briefcase size={14} className="text-accentBlue" />
        <h2 className="text-sm font-semibold tracking-wide">POSITION EXPOSURE</h2>
      </div>

      {slices.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted">No open positions</div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-[110px] h-[110px] shrink-0 relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={52}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {slices.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-[9px] text-muted uppercase tracking-wider">Total</div>
              <div className="text-xs font-bold font-mono">
                ${(total / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {slices.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-muted">{s.name}</span>
                </div>
                <span className="font-mono font-semibold">
                  ${(s.value / 1000).toFixed(1)}K
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
