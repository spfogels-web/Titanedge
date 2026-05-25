"use client";
import { useState } from "react";
import { Check, Star, ArrowRight } from "lucide-react";
import { plans, currentSubscription, type Plan } from "@/lib/mock/subscription";

type Cycle = "monthly" | "yearly";

function priceFor(p: Plan, cycle: Cycle): { display: string; perMonth: number; total: number } {
  if (cycle === "monthly") {
    return { display: `$${p.price}`, perMonth: p.price, total: p.price };
  }
  const monthly = Math.round(p.price * (1 - p.yearlyDiscount / 100));
  return { display: `$${monthly}`, perMonth: monthly, total: monthly * 12 };
}

export default function PlanComparisonGrid() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <div className="space-y-4">
      {/* Header + cycle toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-wide">CHOOSE YOUR PLAN</h2>
          <p className="text-xs text-muted mt-1">
            Switch tiers anytime. Annual saves 20% across all plans.
          </p>
        </div>
        <div className="inline-flex items-center bg-panel border border-border rounded-lg p-0.5">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                cycle === c ? "bg-accent/15 text-accent" : "text-muted hover:text-white"
              }`}
            >
              {c === "monthly" ? "Monthly" : "Yearly · save 20%"}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {plans.map((p) => {
          const isCurrent = p.id === currentSubscription.planId;
          const price = priceFor(p, cycle);
          return (
            <div
              key={p.id}
              className="relative rounded-2xl border p-5 flex flex-col transition"
              style={{
                borderColor: p.popular ? p.accent + "70" : "#27272f",
                background: p.popular
                  ? `linear-gradient(180deg, ${p.accent}10 0%, transparent 60%), #13131a`
                  : "#13131a",
                boxShadow: p.popular ? `0 0 24px ${p.accent}25` : "none",
              }}
            >
              {p.popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 z-10"
                  style={{ backgroundColor: p.accent, color: "#0a0a0f" }}
                >
                  <Star size={10} fill="#0a0a0f" />
                  Most Popular
                </div>
              )}

              {/* Header */}
              <div className="text-center pb-4 border-b border-border">
                <div
                  className="text-[10px] font-bold uppercase tracking-widest mb-1"
                  style={{ color: p.accent }}
                >
                  Tier · {p.name}
                </div>
                <div className="text-3xl font-extrabold font-mono">
                  {price.display}
                  <span className="text-xs text-muted font-normal">
                    /{cycle === "yearly" ? "mo, billed yearly" : "mo"}
                  </span>
                </div>
                {cycle === "yearly" && (
                  <div className="text-[10px] text-accent mt-1">
                    ${price.total}/yr · save ${p.price * 12 - price.total}
                  </div>
                )}
                <p className="text-xs text-muted mt-3 leading-relaxed">{p.tagline}</p>
              </div>

              {/* Features */}
              <ul className="space-y-2 my-5 flex-1">
                {p.features.map((f, i) => {
                  const isHero = i === 0;
                  return (
                    <li key={f} className="flex gap-2 text-xs">
                      <Check
                        size={12}
                        className="shrink-0 mt-0.5"
                        style={{ color: p.accent }}
                      />
                      <span className={isHero ? "font-semibold" : "text-white/85"}>{f}</span>
                    </li>
                  );
                })}
              </ul>

              {/* CTA */}
              <button
                type="button"
                disabled={isCurrent}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isCurrent ? "#1a1a24" : p.accent + "25",
                  border: `1px solid ${isCurrent ? "#27272f" : p.accent + "60"}`,
                  color: isCurrent ? "#888892" : p.accent,
                }}
              >
                {isCurrent ? (
                  <>
                    <Check size={13} />
                    Current Plan
                  </>
                ) : (
                  <>
                    {p.cta}
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted text-center italic">
        Plan upgrade / downgrade is UI-only for now — real Stripe checkout wires in when the
        billing backend lands.
      </p>
    </div>
  );
}
