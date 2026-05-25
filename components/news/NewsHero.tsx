"use client";
import { useEffect, useState } from "react";
import { Clock, Newspaper, AlertTriangle, Sparkles, Landmark, Radio } from "lucide-react";
import { todaysCalendar, todaysBriefing } from "@/lib/mock/news";
import { sentimentSnapshot } from "@/lib/mock/marketSnapshot";

// Build a friendly ET timestamp like "Sat, May 24 · 09:18 AM EDT"
const FULL_FMT = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZoneName: "short",
});

// Current ET hour (0-23.99) so we can map to a session.
function etHour(d: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  })
    .formatToParts(d)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type === "hour" || p.type === "minute") acc[p.type] = p.value;
      return acc;
    }, {});
  const h = Number(parts.hour ?? 0);
  const m = Number(parts.minute ?? 0);
  return h + m / 60;
}

interface Session {
  name: string;
  start: number;       // ET hour
  end: number;         // ET hour (may wrap past midnight)
  color: string;
  description: string;
}

const SESSIONS: Session[] = [
  { name: "Pre-Market",   start: 4,    end: 9.5,  color: "#00aaff", description: "Light volume, gap-fill bias" },
  { name: "NY Open",      start: 9.5,  end: 11,   color: "#00ff88", description: "Peak volume, best entry window" },
  { name: "Midday",       start: 11,   end: 13.5, color: "#888892", description: "Lunch chop, tighten filters" },
  { name: "NY Power",     start: 13.5, end: 16,   color: "#ffd700", description: "Afternoon trend continuation" },
  { name: "After Hours",  start: 16,   end: 20,   color: "#aa50ff", description: "Earnings, light liquidity" },
  { name: "Asia",         start: 20,   end: 28,   color: "#0066cc", description: "Range-bound, fakeouts common" }, // wraps past midnight (28 = 4 AM)
];

function currentSession(hour: number): Session {
  // wrap so 0-4 AM is in the "Asia" bucket (start 20, end 28 → 4 AM)
  const wrappedHour = hour < 4 ? hour + 24 : hour;
  for (const s of SESSIONS) {
    if (wrappedHour >= s.start && wrappedHour < s.end) return s;
  }
  return SESSIONS[0];
}

interface PolicyImage {
  imageUrl: string;
  headline: string;
  source: string;
  publishedAt: string;
  linkUrl: string;
  fallback: boolean;
}

export default function NewsHero() {
  const [now, setNow] = useState<Date | null>(null);
  const [policy, setPolicy] = useState<PolicyImage | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch today's policy image once on mount. Endpoint caches 6h server-side.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/policy-image")
      .then((r) => r.json())
      .then((d: PolicyImage) => {
        if (!cancelled) setPolicy(d);
      })
      .catch(() => {
        /* keep null; render shows fallback gradient */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const session = now ? currentSession(etHour(now)) : SESSIONS[0];
  const highImpact = todaysCalendar.filter((c) => c.impact === "HIGH").length;
  const sentimentLabel =
    sentimentSnapshot.score >= 75 ? "EXTREME GREED" :
    sentimentSnapshot.score >= 55 ? "GREED" :
    sentimentSnapshot.score >= 45 ? "NEUTRAL" :
    sentimentSnapshot.score >= 25 ? "FEAR" :
                                    "EXTREME FEAR";
  const sentimentColor =
    sentimentSnapshot.score >= 55 ? "#00ff88" :
    sentimentSnapshot.score >= 45 ? "#ffd700" :
                                    "#ff3366";

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border p-6"
      style={{
        background:
          `linear-gradient(135deg, ${session.color}15 0%, rgba(0,170,255,0.06) 50%, rgba(170,80,255,0.08) 100%), #13131a`,
      }}
    >
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${session.color}25, transparent 65%)` }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Title + Session */}
        <div className="lg:col-span-5 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-accentBlue/15 border border-accentBlue/30 text-accentBlue">
            <Newspaper size={11} />
            Trading Briefing
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
            Today's <span style={{ color: session.color }}>Briefing</span>
            <span className="block text-base md:text-lg font-medium text-muted mt-2">
              {now ? FULL_FMT.format(now) : "Loading…"}
            </span>
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-2xl italic">
            {todaysBriefing.overnightTone}
          </p>

          {/* Session indicator */}
          <div
            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border"
            style={{
              borderColor: session.color + "60",
              background: `linear-gradient(135deg, ${session.color}18 0%, transparent 100%)`,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: session.color }}
              />
              <span className="text-[10px] uppercase tracking-widest text-muted">Current session</span>
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: session.color }}>
                {session.name}
              </div>
              <div className="text-[10px] text-muted">{session.description}</div>
            </div>
          </div>
        </div>

        {/* Middle: Markets News Outlets panel */}
        <div className="lg:col-span-4 rounded-xl border border-border overflow-hidden"
             style={{ background: "linear-gradient(135deg, #0f0520 0%, #0a0a0f 60%, #051020 100%)" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Radio size={12} className="text-accentRed animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white">Markets News</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] text-muted">{highImpact} high-impact today</span>
            </div>
          </div>

          {/* News outlets grid */}
          <div className="p-3 grid grid-cols-2 gap-2">
            {[
              { name: "Bloomberg",   sub: "Global Markets",   color: "#aa50ff", url: "https://www.bloomberg.com/markets",              abbr: "BB" },
              { name: "CNBC",        sub: "Business News",    color: "#0099ff", url: "https://www.cnbc.com/markets/",                  abbr: "CN" },
              { name: "Reuters",     sub: "Financial News",   color: "#ff6600", url: "https://www.reuters.com/markets/",               abbr: "RE" },
              { name: "MarketWatch", sub: "Investing",        color: "#ffd700", url: "https://www.marketwatch.com/markets",            abbr: "MW" },
              { name: "WSJ",         sub: "Wall Street",      color: "#00cc66", url: "https://www.wsj.com/news/markets",               abbr: "WJ" },
              { name: "Barron's",    sub: "Investor News",    color: "#ff3366", url: "https://www.barrons.com/market-data",            abbr: "BR" },
            ].map((outlet) => (
              <a
                key={outlet.name}
                href={outlet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:border-opacity-60 transition cursor-pointer"
                style={{
                  borderColor: outlet.color + "30",
                  background: `linear-gradient(135deg, ${outlet.color}10 0%, transparent 80%)`,
                }}
              >
                {/* Logo badge */}
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
                  style={{ backgroundColor: outlet.color + "25", color: outlet.color }}
                >
                  {outlet.abbr}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate group-hover:text-white transition" style={{ color: outlet.color }}>
                    {outlet.name}
                  </div>
                  <div className="text-[9px] text-muted truncate">{outlet.sub}</div>
                </div>
                <Landmark size={10} className="ml-auto text-muted opacity-0 group-hover:opacity-100 transition shrink-0" />
              </a>
            ))}
          </div>

          {/* Today's top headline ticker */}
          <div className="px-3 pb-3">
            <div
              className="rounded-lg p-2.5 border"
              style={{ borderColor: "#ff3366" + "30", background: "#ff336608" }}
            >
              <div className="text-[9px] uppercase tracking-widest text-accentRed font-semibold mb-1">
                Top Macro Risk Today
              </div>
              <p className="text-[11px] text-white/80 leading-snug line-clamp-2">
                {policy?.fallback === false
                  ? policy.headline
                  : "FOMC minutes release 2:00 PM EST — historical ±20 NQ pts in first 30 min. Tighten filters 1:45–2:30 PM."}
              </p>
            </div>
          </div>
        </div>

        {/* Right: at-a-glance metric tiles */}
        <div className="lg:col-span-3 grid grid-cols-3 lg:grid-cols-1 gap-2">
          <HeroTile
            icon={Clock}
            color="#00aaff"
            label="ET Time"
            value={
              now
                ? new Intl.DateTimeFormat("en-US", {
                    timeZone: "America/New_York",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  }).format(now)
                : "—"
            }
            sub="Eastern"
          />
          <HeroTile
            icon={AlertTriangle}
            color="#ff3366"
            label="High-Impact"
            value={String(highImpact)}
            sub="events today"
          />
          <HeroTile
            icon={Sparkles}
            color={sentimentColor}
            label="Sentiment"
            value={`${sentimentSnapshot.score}`}
            sub={sentimentLabel}
          />
        </div>
      </div>
    </div>
  );
}

function HeroTile({
  icon: Icon, color, label, value, sub,
}: { icon: typeof Clock; color: string; label: string; value: string; sub: string }) {
  return (
    <div
      className="rounded-xl border border-border p-3 text-center"
      style={{ background: `linear-gradient(135deg, ${color}10 0%, transparent 100%), #1a1a24` }}
    >
      <Icon size={14} className="mx-auto" style={{ color }} />
      <div className="text-[9px] text-muted uppercase tracking-wider mt-1">{label}</div>
      <div className="text-lg font-bold font-mono mt-0.5" style={{ color }}>
        {value}
      </div>
      <div className="text-[9px] text-muted mt-0.5 truncate">{sub}</div>
    </div>
  );
}
