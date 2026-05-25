"use client";
import { Brain, AlertCircle, TrendingUp, TrendingDown, Minus, ShieldX } from "lucide-react";
import { todaysBriefing } from "@/lib/mock/news";

const BIAS_META = {
  "LONG-BIASED":  { icon: TrendingUp,   color: "text-accent",    bg: "bg-accent/10 border-accent/30",       label: "LONG-BIASED" },
  "SHORT-BIASED": { icon: TrendingDown, color: "text-accentRed", bg: "bg-accentRed/10 border-accentRed/30", label: "SHORT-BIASED" },
  "NEUTRAL":      { icon: Minus,        color: "text-muted",     bg: "bg-panel2 border-border",             label: "NEUTRAL" },
  "AVOID":        { icon: ShieldX,      color: "text-accentRed", bg: "bg-accentRed/10 border-accentRed/30", label: "AVOID — NO TRADE" },
} as const;

export default function DailyAIBriefing() {
  const biasMeta = BIAS_META[todaysBriefing.recommendedBias];
  const BiasIcon = biasMeta.icon;

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
               style={{ backgroundColor: "rgba(170,80,255,0.10)" }}>
            <Brain size={18} className="text-[#aa50ff]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide">AI MORNING BRIEFING</h2>
            <div className="text-[10px] text-muted mt-0.5">
              {todaysBriefing.generatedAt} · {todaysBriefing.symbol}
            </div>
          </div>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold ${biasMeta.bg} ${biasMeta.color}`}>
          <BiasIcon size={13} />
          {biasMeta.label}
        </div>
      </div>

      <p className="text-xs text-muted leading-relaxed mb-4 italic">
        {todaysBriefing.overnightTone}
      </p>

      <div className="space-y-4">
        {todaysBriefing.sections.map((s) => (
          <div key={s.heading}>
            <div className="text-[10px] text-muted uppercase tracking-wider mb-1.5">
              {s.heading}
            </div>
            <p className="text-xs leading-relaxed text-white/90">{s.body}</p>
          </div>
        ))}
      </div>

      {todaysBriefing.cautionWindows.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-[10px] text-accentRed uppercase tracking-wider mb-2">
            <AlertCircle size={11} />
            Caution windows
          </div>
          <ul className="space-y-1">
            {todaysBriefing.cautionWindows.map((w) => (
              <li key={w} className="text-xs text-muted flex items-start gap-2">
                <span className="text-accentRed mt-0.5">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
