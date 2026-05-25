"use client";
import { useState } from "react";
import { TrendingUp, TrendingDown, Activity, ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area,
  ResponsiveContainer, YAxis, XAxis, Tooltip, CartesianGrid,
} from "recharts";
import { futuresQuotes, type FuturesQuote } from "@/lib/mock/marketSnapshot";

function fmtNum(n: number, dec = 2): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ─── Expanded detail panel ─────────────────────────────────────────────────
function ExpandedCard({ q, onClose }: { q: FuturesQuote; onClose: () => void }) {
  const up = q.change >= 0;
  const color = up ? "#00ff88" : "#ff3366";
  const chartData = q.spark.map((v, i) => ({ i: i + 1, v }));
  const range = ((q.high - q.low) / q.low * 100).toFixed(3);

  return (
    <div
      className="rounded-xl border p-5 mt-2 space-y-4"
      style={{ borderColor: color + "40", background: `linear-gradient(135deg, ${color}08 0%, transparent 60%), #13131a` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-mono font-extrabold">{q.sym}</span>
          <span className="text-xs text-muted">{q.desc}</span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
            style={{ backgroundColor: color + "20", color }}
          >
            {up ? "▲" : "▼"} {up ? "+" : ""}{q.change.toFixed(2)}%
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-muted hover:text-white transition text-sm px-2 py-1 rounded-lg hover:bg-panel2"
        >
          ✕ Close
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Last Price",   value: fmtNum(q.price),            color: "text-white" },
          { label: "Change",       value: `${up ? "+" : ""}${fmtNum(q.changeAbs)}`, color: up ? "text-accent" : "text-accentRed" },
          { label: "Session High", value: fmtNum(q.high),             color: "text-accent" },
          { label: "Session Low",  value: fmtNum(q.low),              color: "text-accentRed" },
          { label: "Range",        value: `${range}%`,                color: "text-gold" },
          { label: "Mid",          value: fmtNum((q.high + q.low) / 2), color: "text-accentBlue" },
          { label: "Data Source",  value: "Simulated",                color: "text-muted" },
          { label: "Live Feed",    value: "Add FINNHUB_API_KEY",      color: "text-muted" },
        ].map((s) => (
          <div key={s.label} className="bg-panel2 border border-border rounded-lg p-3">
            <div className="text-[9px] uppercase tracking-widest text-muted mb-1">{s.label}</div>
            <div className={`text-sm font-mono font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted mb-2">Session Trend (Simulated)</div>
        <div style={{ height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <defs>
                <linearGradient id={`grad-${q.sym}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272f" />
              <XAxis dataKey="i" hide />
              <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip
                contentStyle={{ background: "#1a1a24", border: "1px solid #27272f", borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [fmtNum(v), q.sym]}
              />
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${q.sym})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function FuturesSnapshot() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (sym: string) =>
    setExpanded((prev) => (prev === sym ? null : sym));

  const expandedQuote = futuresQuotes.find((q) => q.sym === expanded) ?? null;

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Activity size={14} className="text-accentBlue" />
        <h2 className="text-sm font-semibold tracking-wide">FUTURES SNAPSHOT</h2>
        <div className="ml-auto flex items-center gap-2">
          {/* Data source badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold/10 border border-gold/30 text-[10px] font-semibold text-gold">
            <Info size={9} />
            SIMULATED DATA
          </div>
          <span className="text-[10px] text-muted">Click any card to expand</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted mb-4 pl-0.5">
        Numbers below are <strong className="text-gold">simulated</strong> and for layout purposes only.
        Add a <code className="bg-panel2 px-1 rounded">FINNHUB_API_KEY</code> to Railway for live pre-market prices.
      </p>

      {/* Cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {futuresQuotes.map((q) => {
          const up = q.change >= 0;
          const color = up ? "#00ff88" : "#ff3366";
          const isOpen = expanded === q.sym;

          return (
            <button
              key={q.sym}
              onClick={() => toggle(q.sym)}
              className="rounded-lg border border-border p-3 text-left transition hover:border-accent/30 hover:scale-[1.02] cursor-pointer w-full"
              style={{ background: `linear-gradient(135deg, ${color}10 0%, transparent 70%), #1a1a24` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold">{q.sym}</span>
                <div className="flex items-center gap-1">
                  {up ? <TrendingUp size={11} className="text-accent" /> : <TrendingDown size={11} className="text-accentRed" />}
                  {isOpen
                    ? <ChevronUp size={10} className="text-muted" />
                    : <ChevronDown size={10} className="text-muted" />}
                </div>
              </div>
              <div className="text-[9px] text-muted mt-0.5 truncate">{q.desc}</div>
              <div className="mt-2 text-base font-mono font-bold">{fmtNum(q.price)}</div>
              <div className={`text-[11px] font-mono font-semibold ${up ? "text-accent" : "text-accentRed"}`}>
                {up ? "+" : ""}{q.changeAbs.toFixed(2)} ({up ? "+" : ""}{q.change.toFixed(2)}%)
              </div>
              <div className="mt-2 -mx-1" style={{ height: 28 }}>
                <ResponsiveContainer>
                  <LineChart data={q.spark.map((v, i) => ({ i, v }))} margin={{ top: 1, right: 1, bottom: 1, left: 1 }}>
                    <YAxis hide domain={["dataMin", "dataMax"]} />
                    <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-1 flex items-center justify-between text-[9px] text-muted font-mono">
                <span>L {fmtNum(q.low)}</span>
                <span>H {fmtNum(q.high)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded detail panel */}
      {expandedQuote && (
        <ExpandedCard q={expandedQuote} onClose={() => setExpanded(null)} />
      )}
    </div>
  );
}
