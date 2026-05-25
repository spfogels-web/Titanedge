"use client";
import { Compass, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { sentimentSnapshot } from "@/lib/mock/marketSnapshot";

// Semi-circular gauge from 0 (extreme fear) to 100 (extreme greed).
function SentimentArc({ value, size = 220 }: { value: number; size?: number }) {
  // Use an SVG with a semicircle 180° → 0° (left to right)
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - 24) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;

  // Arc background segments
  const segments = [
    { from: 0,   to: 20,  color: "#ff3366" }, // extreme fear
    { from: 20,  to: 40,  color: "#ff8c42" }, // fear
    { from: 40,  to: 60,  color: "#ffd700" }, // neutral
    { from: 60,  to: 80,  color: "#9ee493" }, // greed
    { from: 80,  to: 100, color: "#00ff88" }, // extreme greed
  ];

  function polarToCartesian(angle: number) {
    // angle in degrees, 0 = right, 180 = left, sweeping top half
    const rad = ((180 - angle) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy - radius * Math.sin(rad),
    };
  }

  function arcPath(from: number, to: number): string {
    const angleFrom = (from / 100) * 180;
    const angleTo = (to / 100) * 180;
    const start = polarToCartesian(angleFrom);
    const end = polarToCartesian(angleTo);
    const largeArc = angleTo - angleFrom > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  // Needle position
  const needleAngle = (clamped / 100) * 180;
  const needleEnd = polarToCartesian(needleAngle);

  const labelColor =
    clamped >= 75 ? "#00ff88" :
    clamped >= 55 ? "#9ee493" :
    clamped >= 45 ? "#ffd700" :
    clamped >= 25 ? "#ff8c42" :
                    "#ff3366";

  const label =
    clamped >= 75 ? "EXTREME GREED" :
    clamped >= 55 ? "GREED" :
    clamped >= 45 ? "NEUTRAL" :
    clamped >= 25 ? "FEAR" :
                    "EXTREME FEAR";

  return (
    <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
      {segments.map((s) => (
        <path
          key={s.from}
          d={arcPath(s.from, s.to)}
          stroke={s.color}
          strokeWidth={14}
          fill="none"
          strokeLinecap="butt"
        />
      ))}
      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map((v) => {
        const a = (v / 100) * 180;
        const p1 = polarToCartesian(a);
        const inner = {
          x: cx + (radius - 22) * Math.cos(((180 - a) * Math.PI) / 180),
          y: cy - (radius - 22) * Math.sin(((180 - a) * Math.PI) / 180),
        };
        return (
          <line
            key={v}
            x1={inner.x}
            y1={inner.y}
            x2={p1.x}
            y2={p1.y}
            stroke="#27272f"
            strokeWidth={2}
          />
        );
      })}
      {/* Needle */}
      <line
        x1={cx}
        y1={cy}
        x2={needleEnd.x}
        y2={needleEnd.y}
        stroke={labelColor}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r={6} fill={labelColor} />
      {/* Center value */}
      <text
        x={cx}
        y={cy - 35}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={28}
        fontWeight={700}
        fill={labelColor}
      >
        {clamped}
      </text>
      <text
        x={cx}
        y={cy - 18}
        textAnchor="middle"
        fontFamily="monospace"
        fontSize={9}
        fill="#888892"
      >
        {label}
      </text>
    </svg>
  );
}

export default function SentimentGauge() {
  const s = sentimentSnapshot;
  const TrendIcon = s.trend === "rising" ? TrendingUp : s.trend === "falling" ? TrendingDown : Minus;
  const trendColor =
    s.trend === "rising" ? "text-accent" :
    s.trend === "falling" ? "text-accentRed" :
                            "text-muted";

  const biasColor = (b: "BULL" | "BEAR" | "NEUTRAL") =>
    b === "BULL" ? "text-accent" : b === "BEAR" ? "text-accentRed" : "text-muted";

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Compass size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">MARKET SENTIMENT</h2>
        </div>
        <div className={`text-[10px] font-semibold flex items-center gap-1 ${trendColor}`}>
          <TrendIcon size={11} />
          {s.trend.toUpperCase()}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <SentimentArc value={s.score} />
      </div>

      {/* Distribution row */}
      <div className="grid grid-cols-3 gap-1.5 mt-2">
        <DistBar label="Bullish" value={s.bullishPct} color="#00ff88" />
        <DistBar label="Neutral" value={s.neutralPct} color="#888892" />
        <DistBar label="Bearish" value={s.bearishPct} color="#ff3366" />
      </div>

      {/* Components */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="text-[10px] text-muted uppercase tracking-wider mb-2">Inputs</div>
        <div className="space-y-1.5">
          {s.components.map((c) => (
            <div key={c.label} className="flex items-center justify-between text-[11px]">
              <span className="text-muted">{c.label}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-white/85">{c.reading}</span>
                <span className={`text-[9px] font-bold ${biasColor(c.bias)}`}>{c.bias}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DistBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="h-1.5 bg-panel2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <div className="mt-1 text-[10px] text-muted">
        {label} <span className="font-mono font-semibold text-white">{value}%</span>
      </div>
    </div>
  );
}
