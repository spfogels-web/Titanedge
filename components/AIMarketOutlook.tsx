import { Brain } from "lucide-react";

export default function AIMarketOutlook() {
  return (
    <div className="bg-panel border border-border rounded-xl p-4 flex gap-3">
      <div className="flex-1">
        <div className="text-xs font-semibold tracking-wide mb-1.5">
          AI MARKET OUTLOOK
        </div>
        <p className="text-xs text-muted leading-relaxed">
          Market showing bullish momentum with VIX declining and Mag 7 strong.
          Favoring long setups on pullbacks to pivot support zones.
        </p>
      </div>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 self-start"
        style={{ backgroundColor: "rgba(170,80,255,0.1)" }}
      >
        <Brain size={18} className="text-[#aa50ff]" />
      </div>
    </div>
  );
}
