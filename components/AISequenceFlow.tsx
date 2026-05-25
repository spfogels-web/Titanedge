"use client";
import { Check, X, ArrowDown, Clock } from "lucide-react";
import { currentSequence, currentSequenceConfidence } from "@/lib/mock/ai";
import ConfidenceGauge from "./ConfidenceGauge";

export default function AISequenceFlow() {
  const hasSequence = currentSequence.length > 0;

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wide">AI SEQUENCE ENGINE</h2>
        <span className="text-[10px] text-muted">
          {hasSequence ? "Live evaluation" : "Idle"}
        </span>
      </div>

      {!hasSequence ? (
        <div className="bg-panel2 border border-dashed border-border rounded-lg p-8 text-center">
          <Clock size={20} className="mx-auto mb-2 text-muted" />
          <div className="text-sm font-semibold mb-1">Awaiting first market scan</div>
          <div className="text-[11px] text-muted max-w-md mx-auto leading-relaxed">
            The sequence engine evaluates 7 market conditions per bar (VIX direction,
            Mag 7 breadth, trend cloud, pivot reactions, EMA reclaim, momentum
            expansion, news risk window) — it activates once the bot receives its
            first signal via the TradingView webhook.
          </div>
        </div>
      ) : (
        <div className="flex gap-5">
          {/* Sequence steps */}
          <div className="flex-1 space-y-1.5">
            {currentSequence.map((step, i) => (
              <div key={step.label}>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-panel2 border border-border">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      step.passed
                        ? "bg-accent/15 text-accent"
                        : "bg-accentRed/15 text-accentRed"
                    }`}
                  >
                    {step.passed ? <Check size={12} /> : <X size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium">{step.label}</div>
                    <div className="text-[10px] text-muted font-mono">{step.value}</div>
                  </div>
                </div>
                {i < currentSequence.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown size={10} className="text-muted" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Confidence + verdict */}
          <div className="w-44 shrink-0 flex flex-col items-center justify-center bg-panel2 border border-border rounded-lg p-4">
            <ConfidenceGauge value={currentSequenceConfidence} size={120} label="Confidence" thickness={8} />
            <div className="mt-4 text-center">
              <div className="text-[10px] text-muted uppercase tracking-wider mb-1">Verdict</div>
              <div className="text-sm font-bold text-accent">HIGH PROBABILITY</div>
              <div className="text-[10px] text-accent mt-0.5">LONG SETUP</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
