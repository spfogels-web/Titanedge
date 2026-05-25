"use client";
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Waves, Zap, Target, Wind, Clock } from "lucide-react";
import { currentRegime, type MarketRegime } from "@/lib/mock/ai";

const REGIME_META: Record<MarketRegime, { icon: typeof TrendingUp; color: string; bg: string }> = {
  "AWAITING DATA":   { icon: Clock,          color: "text-muted",     bg: "bg-panel2 border-border" },
  "TRENDING UP":     { icon: TrendingUp,     color: "text-accent",    bg: "bg-accent/10 border-accent/30" },
  "TRENDING DOWN":   { icon: TrendingDown,   color: "text-accentRed", bg: "bg-accentRed/10 border-accentRed/30" },
  "RANGING":         { icon: Activity,       color: "text-accentBlue",bg: "bg-accentBlue/10 border-accentBlue/30" },
  "HIGH VOLATILITY": { icon: AlertTriangle,  color: "text-gold",      bg: "bg-gold/10 border-gold/30" },
  "LOW VOLATILITY":  { icon: Wind,           color: "text-accentBlue",bg: "bg-accentBlue/10 border-accentBlue/30" },
  "CHOP":            { icon: Waves,          color: "text-muted",     bg: "bg-panel2 border-border" },
  "BREAKOUT":        { icon: Zap,            color: "text-gold",      bg: "bg-gold/10 border-gold/30" },
  "LIQUIDITY HUNT":  { icon: Target,         color: "text-accentRed", bg: "bg-accentRed/10 border-accentRed/30" },
};

export default function MarketRegimeIndicator() {
  const meta = REGIME_META[currentRegime.regime];
  const Icon = meta.icon;

  return (
    <div className={`rounded-xl border p-4 ${meta.bg}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-bg/40 ${meta.color}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] text-muted uppercase tracking-wider">Market Regime</div>
              <div className={`text-base font-bold ${meta.color}`}>{currentRegime.regime}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-muted uppercase tracking-wider">Confidence</div>
              <div className={`text-base font-bold font-mono ${meta.color}`}>{currentRegime.confidence}%</div>
            </div>
          </div>
          <p className="text-xs text-muted mt-2 leading-relaxed">{currentRegime.description}</p>
          <div className="mt-2 pt-2 border-t border-border">
            <span className="text-[10px] text-muted uppercase tracking-wider">Recommended: </span>
            <span className="text-xs text-white">{currentRegime.recommended}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
