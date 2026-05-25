"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  User, Settings, CreditCard, Bell, Key, HelpCircle, LogOut,
  ChevronDown, Crown, Zap, ArrowUp,
} from "lucide-react";
import { currentSubscription, plans, userProfile } from "@/lib/mock/subscription";

export default function UserProfileDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onEscape);
    }
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const currentPlan = plans.find((p) => p.id === currentSubscription.planId) ?? plans[0];
  const upgradeTarget =
    currentPlan.id === "indicator" ? plans.find((p) => p.id === "pro") :
    currentPlan.id === "pro"        ? plans.find((p) => p.id === "elite") :
                                      null;

  const tradesUsed = currentSubscription.tradesUsedThisMonth;
  const tradesLimit = currentSubscription.tradesLimitThisMonth;
  const showTradeMeter = tradesLimit !== "unlimited" && tradesLimit > 0;
  const tradesPct = showTradeMeter ? Math.min(100, (tradesUsed / tradesLimit) * 100) : 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 pl-2 md:pl-3 md:border-l md:border-border hover:opacity-80 transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="hidden sm:block text-right">
          <div className="text-xs font-semibold">{userProfile.fullName}</div>
          <div className="text-[10px]" style={{ color: currentPlan.accent }}>
            {currentPlan.name} Plan
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accentBlue flex items-center justify-center text-bg text-xs font-bold">
          {userProfile.initials}
        </div>
        <ChevronDown
          size={12}
          className={`text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-80 bg-panel border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          {/* User header */}
          <div className="p-4 border-b border-border bg-panel2/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accentBlue flex items-center justify-center text-bg text-sm font-bold shrink-0">
                {userProfile.initials}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">{userProfile.fullName}</div>
                <div className="text-[11px] text-muted truncate">{userProfile.email}</div>
              </div>
            </div>

            {/* Plan strip */}
            <div
              className="mt-3 p-3 rounded-lg border"
              style={{
                borderColor: currentPlan.accent + "40",
                background: `linear-gradient(135deg, ${currentPlan.accent}15 0%, transparent 100%)`,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Crown size={12} style={{ color: currentPlan.accent }} />
                  <span className="text-xs font-bold" style={{ color: currentPlan.accent }}>
                    {currentPlan.name} Plan
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-muted">
                    {currentSubscription.status}
                  </span>
                </div>
                <span className="text-[11px] text-muted font-mono">${currentPlan.price}/mo</span>
              </div>
              {showTradeMeter && (
                <>
                  <div className="flex items-center justify-between text-[10px] text-muted">
                    <span>Auto trades this month</span>
                    <span className="font-mono">
                      <span className="text-white font-semibold">{tradesUsed}</span> / {tradesLimit}
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-bg/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${tradesPct}%`,
                        backgroundColor:
                          tradesPct >= 90 ? "#ff3366" :
                          tradesPct >= 70 ? "#ffd700" :
                                            currentPlan.accent,
                      }}
                    />
                  </div>
                </>
              )}
              {tradesLimit === "unlimited" && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted">
                  <Zap size={10} style={{ color: currentPlan.accent }} />
                  Unlimited auto trades
                </div>
              )}
              {currentPlan.autoTradeLimit === 0 && (
                <div className="text-[10px] text-muted italic">
                  Indicator only — no auto trading on this plan
                </div>
              )}
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <MenuItem href="/account"  icon={User}        label="View Profile"          onClick={() => setOpen(false)} />
            <MenuItem href="/account"  icon={Settings}    label="Account Settings"      onClick={() => setOpen(false)} />
            <MenuItem href="/billing"  icon={CreditCard}  label="Billing & Subscription" badge={currentSubscription.status === "past_due" ? "Action needed" : undefined} onClick={() => setOpen(false)} />
            <MenuItem href="/account"  icon={Bell}        label="Notification Preferences" onClick={() => setOpen(false)} />
            <MenuItem href="/account"  icon={Key}         label="API Keys & Integrations" onClick={() => setOpen(false)} />
          </div>

          <div className="py-1 border-t border-border">
            <MenuItem href="#"         icon={HelpCircle}  label="Help & Support"        onClick={() => setOpen(false)} />
            <MenuItem href="#"         icon={LogOut}      label="Sign Out"              onClick={() => setOpen(false)} danger />
          </div>

          {/* Upgrade CTA */}
          {upgradeTarget && (
            <div className="p-3 border-t border-border bg-bg/40">
              <Link
                href="/billing"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 py-2 rounded-md border text-xs font-semibold transition"
                style={{
                  borderColor: upgradeTarget.accent + "60",
                  backgroundColor: upgradeTarget.accent + "15",
                  color: upgradeTarget.accent,
                }}
              >
                <ArrowUp size={12} />
                Upgrade to {upgradeTarget.name} · ${upgradeTarget.price}/mo
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href, icon: Icon, label, onClick, danger = false, badge,
}: {
  href: string;
  icon: typeof User;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      role="menuitem"
      className={`flex items-center justify-between gap-3 px-4 py-2.5 text-xs transition ${
        danger ? "text-accentRed hover:bg-accentRed/10" : "text-white hover:bg-panel2"
      }`}
    >
      <span className="flex items-center gap-3">
        <Icon size={14} className={danger ? "text-accentRed" : "text-muted"} />
        {label}
      </span>
      {badge && (
        <span className="text-[9px] font-bold uppercase tracking-wider bg-gold/15 text-gold px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
    </Link>
  );
}
