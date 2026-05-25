"use client";
import { Crown, Calendar, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { currentSubscription, plans } from "@/lib/mock/subscription";

function fmtDate(iso: string): string {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

const STATUS_META = {
  active:    { color: "#00ff88", label: "Active",       icon: CheckCircle2 },
  trial:     { color: "#00aaff", label: "Free Trial",   icon: CheckCircle2 },
  past_due:  { color: "#ff3366", label: "Past Due",     icon: AlertCircle  },
  canceled:  { color: "#888892", label: "Canceled",     icon: AlertCircle  },
} as const;

export default function CurrentSubscriptionCard() {
  const plan = plans.find((p) => p.id === currentSubscription.planId) ?? plans[0];
  const statusMeta = STATUS_META[currentSubscription.status];
  const StatusIcon = statusMeta.icon;

  const tradesUsed = currentSubscription.tradesUsedThisMonth;
  const tradesLimit = currentSubscription.tradesLimitThisMonth;
  const showMeter = tradesLimit !== "unlimited" && tradesLimit > 0;
  const tradesPct = showMeter ? Math.min(100, (tradesUsed / tradesLimit) * 100) : 0;

  return (
    <div
      className="rounded-2xl border p-6 relative overflow-hidden"
      style={{
        borderColor: plan.accent + "40",
        background: `linear-gradient(135deg, ${plan.accent}15 0%, ${plan.accent}05 50%, transparent 100%), #13131a`,
      }}
    >
      <div
        className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${plan.accent}25, transparent 65%)` }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan info */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={14} style={{ color: plan.accent }} />
            <span className="text-[10px] uppercase tracking-widest text-muted">Current plan</span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-3xl font-extrabold" style={{ color: plan.accent }}>
              {plan.name}
            </h2>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{ backgroundColor: statusMeta.color + "20", color: statusMeta.color }}
            >
              <StatusIcon size={9} />
              {statusMeta.label}
            </span>
          </div>
          <p className="text-sm text-muted leading-relaxed max-w-xl">{plan.tagline}</p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-muted" />
              <span className="text-muted">Next billing</span>
              <span className="font-mono font-semibold">
                {fmtDate(currentSubscription.nextBillingDate)}
              </span>
            </div>
            <span className="text-muted">·</span>
            <div className="text-muted">
              Started <span className="font-mono text-white">{fmtDate(currentSubscription.startedAt)}</span>
            </div>
            <span className="text-muted">·</span>
            <div className="text-muted">
              Lifetime paid <span className="font-mono text-white">${currentSubscription.totalPaid}</span>
            </div>
          </div>
        </div>

        {/* Usage / Price */}
        <div className="space-y-3">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-muted">Billing</div>
            <div className="text-2xl font-bold font-mono">
              ${plan.price}<span className="text-xs text-muted">/{currentSubscription.billingCycle === "yearly" ? "yr" : "mo"}</span>
            </div>
          </div>

          {showMeter && (
            <div className="bg-bg/40 border border-border rounded-lg p-3">
              <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-wider mb-1">
                <span>Auto trades this month</span>
                <span className="font-mono">
                  <span className="text-white font-semibold">{tradesUsed}</span> / {tradesLimit}
                </span>
              </div>
              <div className="h-2 bg-panel2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${tradesPct}%`,
                    backgroundColor:
                      tradesPct >= 90 ? "#ff3366" :
                      tradesPct >= 70 ? "#ffd700" :
                                        plan.accent,
                  }}
                />
              </div>
              <div className="mt-1 text-[10px] text-muted">
                {tradesLimit - tradesUsed} trades remaining this cycle
              </div>
            </div>
          )}

          {tradesLimit === "unlimited" && (
            <div className="bg-bg/40 border border-border rounded-lg p-3 flex items-center gap-2">
              <Zap size={14} style={{ color: plan.accent }} />
              <span className="text-xs font-semibold">Unlimited auto trades</span>
            </div>
          )}

          {plan.autoTradeLimit === 0 && (
            <div className="bg-bg/40 border border-border rounded-lg p-3 text-xs text-muted italic">
              Indicator-only plan — upgrade to Pro to enable automated trade execution.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
