"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  History,
  BarChart3,
  PieChart,
  Sparkles,
  Target,
  Shield,
  Globe,
  Newspaper,
  MessageSquare,
  GraduationCap,
  Users,
  Settings,
  FileText,
  Menu,
  X,
} from "lucide-react";

const navItems: Array<{
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
}> = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: Newspaper, label: "News & Briefing", href: "/news" },
  { icon: LineChart, label: "Live Trades", href: "/live-trades" },
  { icon: History, label: "Trade History", href: "/trade-history" },
  { icon: BarChart3, label: "Performance", href: "/performance" },
  { icon: PieChart, label: "Analytics", href: "/analytics" },
  { icon: Sparkles, label: "AI Insights", href: "/ai-insights" },
  { icon: Target, label: "Strategy", href: "/strategy" },
  { icon: Shield, label: "Risk Management", href: "/risk" },
  { icon: Globe, label: "Market Conditions", href: "/market-conditions" },
  { icon: MessageSquare, label: "Bot Chat", href: "/chat" },
  { icon: GraduationCap, label: "Academy", href: "/academy" },
  { icon: Users, label: "You vs Bot", href: "/comparison" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: FileText, label: "Logs", href: "/logs" },
];

const tickers: Array<{ sym: string; price?: string; change: string; up: boolean }> = [
  { sym: "MNQ", price: "18,234.50", change: "+0.64%", up: true },
  { sym: "MGC", price: "2,345.10", change: "-0.21%", up: false },
  { sym: "VIX", price: "14.32", change: "-3.21%", up: false },
  { sym: "MAG 7", change: "+0.48%", up: true },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 right-4 z-50 bg-panel border border-border p-2 rounded-lg"
        aria-label="Toggle navigation"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-panel border-r border-border z-40 flex flex-col transform transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-4 shrink-0">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block"
            aria-label="TitanEdge home"
          >
            <Image
              src="/logo.png"
              alt="TitanEdge — AI Auto Trading System"
              width={1290}
              height={398}
              priority
              className="w-full h-auto"
            />
          </Link>
        </div>

        <nav className="px-3 space-y-0.5 flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          {navItems.map((it) => {
            const isActive =
              it.href === "/"
                ? pathname === "/"
                : pathname === it.href || pathname.startsWith(`${it.href}/`);
            return (
              <Link
                key={it.label}
                href={it.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition border-l-2 pl-[10px] ${
                  isActive
                    ? "bg-panel2 text-accent border-accent"
                    : "text-muted hover:text-white hover:bg-panel2 border-transparent"
                }`}
              >
                <it.icon size={16} />
                <span>{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-border shrink-0">
          <div className="px-3 text-[10px] text-muted tracking-[0.2em] mb-2">
            MARKETS
          </div>
          <div className="space-y-0.5">
            {tickers.map((t) => (
              <div
                key={t.sym}
                className="flex items-center justify-between px-3 py-1.5 text-xs"
              >
                <span className="font-mono font-semibold">{t.sym}</span>
                <div className="flex items-center gap-2">
                  {t.price && (
                    <span className="font-mono text-muted">{t.price}</span>
                  )}
                  <span
                    className={`font-mono ${
                      t.up ? "text-accent" : "text-accentRed"
                    }`}
                  >
                    {t.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 shrink-0">
          <a
            href="#"
            className="block rounded-lg p-3 text-sm transition border"
            style={{
              backgroundColor: "rgba(88,101,242,0.10)",
              borderColor: "rgba(88,101,242,0.30)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#5865F2" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs">Need Help?</div>
                <div className="text-[10px] text-muted">Join our Discord</div>
              </div>
            </div>
          </a>
        </div>
      </aside>
    </>
  );
}
