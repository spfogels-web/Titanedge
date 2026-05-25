"use client";
import { Lightbulb, AlertTriangle, Sparkles, Brain } from "lucide-react";
import { recommendations, type Recommendation } from "@/lib/mock/ai";

const KIND_META: Record<
  Recommendation["kind"],
  { icon: typeof Lightbulb; color: string; bg: string }
> = {
  insight: { icon: Sparkles,       color: "text-accentBlue", bg: "bg-accentBlue/10" },
  alert:   { icon: AlertTriangle,  color: "text-accentRed",  bg: "bg-accentRed/10" },
  tip:     { icon: Lightbulb,      color: "text-gold",       bg: "bg-gold/10" },
};

export default function AIRecommendationsFeed({ limit }: { limit?: number }) {
  const items = typeof limit === "number" ? recommendations.slice(0, limit) : recommendations;

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center">
          <Brain size={15} className="text-accent" />
        </div>
        <h2 className="text-sm font-semibold tracking-wide">AI RECOMMENDATIONS</h2>
        <span className="ml-auto text-[10px] text-muted">{items.length} active</span>
      </div>
      <div className="space-y-3">
        {items.map((r) => {
          const meta = KIND_META[r.kind];
          const Icon = meta.icon;
          return (
            <div
              key={r.id}
              className="flex gap-3 p-3 rounded-lg bg-panel2 border border-border hover:border-accent/30 transition"
            >
              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${meta.bg}`}>
                <Icon size={14} className={meta.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold">{r.title}</div>
                  <div className="text-[10px] text-muted shrink-0">{r.timestamp}</div>
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">{r.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
