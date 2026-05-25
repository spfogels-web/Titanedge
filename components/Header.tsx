"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Clock, Bell } from "lucide-react";
import { useStats } from "@/lib/hooks/useStats";
import { useTimezone } from "@/lib/hooks/useTimezone";
import BrokerConnectButton from "./BrokerConnectButton";
import UserProfileDropdown from "./UserProfileDropdown";
import ClockCalendar from "./ClockCalendar";

// Format the current instant in the user-selected timezone (from
// useTimezone). timeZoneName:'short' returns the proper abbreviation
// (EDT/EST/GMT/JST/etc.) automatically, so the label never lies.
function formatClock(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZoneName: "short",
  }).format(d);
}

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/live-trades": "Live Trades",
  "/trade-history": "Trade History",
  "/performance": "Performance",
  "/analytics": "Analytics",
  "/ai-insights": "AI Insights",
  "/strategy": "Strategy",
  "/risk": "Risk Management",
  "/market-conditions": "Market Conditions",
  "/news": "News & AI Briefing",
  "/chat": "Bot Chat",
  "/academy": "TitanEdge Academy",
  "/comparison": "You vs the Bot",
  "/account": "Account",
  "/billing": "Billing & Subscription",
  "/settings": "Settings",
  "/logs": "Logs",
};

export default function Header() {
  const pathname = usePathname() ?? "/";
  const title = TITLES[pathname] ?? "Dashboard";
  const { tz } = useTimezone();
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [now, setNow] = useState<Date | null>(null);
  const { data } = useStats();
  const botActive = data?.bot?.active ?? false;

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-border bg-bg/80 backdrop-blur sticky top-0 z-30">
      <h1 className="text-xl md:text-2xl font-bold shrink-0">{title}</h1>
      <div className="flex-1 flex justify-center">
        <BrokerConnectButton />
      </div>
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div
          className={`hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-md border ${
            botActive
              ? "border-accent text-accent bg-accent/5"
              : "border-border text-muted"
          }`}
        >
          <span className="opacity-70">Bot Status:</span>
          <span className="font-semibold">{botActive ? "ACTIVE" : "IDLE"}</span>
        </div>
        <div className="hidden md:block relative">
          <button
            type="button"
            onClick={() => setCalendarOpen((v) => !v)}
            aria-haspopup="dialog"
            aria-expanded={calendarOpen}
            aria-label="Open calendar and notes"
            className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md transition ${
              calendarOpen
                ? "bg-accent/10 border border-accent/30 text-accent"
                : "text-muted hover:text-white hover:bg-panel border border-transparent"
            }`}
          >
            <Clock size={14} />
            <span className="font-mono">{now ? formatClock(now, tz) : "—:—:—"}</span>
          </button>
          {calendarOpen && (
            <ClockCalendar onClose={() => setCalendarOpen(false)} />
          )}
        </div>
        <button
          className="relative p-2 hover:bg-panel rounded-md transition"
          aria-label="Notifications"
        >
          <Bell size={18} className="text-muted" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-accentRed text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        <UserProfileDropdown />
      </div>
    </header>
  );
}
