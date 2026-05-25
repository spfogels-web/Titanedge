"use client";
import { CreditCard, Edit3 } from "lucide-react";
import { currentSubscription } from "@/lib/mock/subscription";

export default function PaymentMethodCard() {
  const pm = currentSubscription.paymentMethod;

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">PAYMENT METHOD</h2>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[10px] text-muted hover:text-accent transition"
        >
          <Edit3 size={11} />
          Update
        </button>
      </div>

      {/* Card visual */}
      <div
        className="rounded-xl p-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d4d 50%, #0066cc 100%)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-[10px] text-white/70 uppercase tracking-wider">{pm.brand}</div>
          <div
            className="px-2 py-0.5 rounded text-[9px] font-bold"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            ACTIVE
          </div>
        </div>
        <div className="font-mono text-lg tracking-widest text-white/95">
          •••• •••• •••• {pm.last4}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-white/60 uppercase tracking-wider">Expires</div>
            <div className="text-sm font-mono text-white">
              {String(pm.expMonth).padStart(2, "0")}/{String(pm.expYear).slice(-2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-white/60 uppercase tracking-wider">Default</div>
            <div className="text-sm text-white">✓</div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-[10px] text-muted text-center italic">
        Payment processing wires to Stripe in a future commit.
      </div>
    </div>
  );
}
