"use client";
import { Flame, ExternalLink, AlertTriangle, AlertCircle, Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { trendingStories } from "@/lib/mock/marketSnapshot";

// ─── Outlet branding ───────────────────────────────────────────────────────
const OUTLET_BRAND: Record<string, {
  gradient: string; accent: string; abbr: string; logoColor: string;
}> = {
  Bloomberg:   { gradient: "from-[#18003a] to-[#2d0a5a]", accent: "#aa50ff", abbr: "BB",  logoColor: "#cc77ff" },
  Reuters:     { gradient: "from-[#2a0e00] to-[#4d2000]", accent: "#ff6600", abbr: "RE",  logoColor: "#ff8833" },
  CNBC:        { gradient: "from-[#001230] to-[#00235a]", accent: "#0080ff", abbr: "CN",  logoColor: "#3399ff" },
  WSJ:         { gradient: "from-[#00150f] to-[#002b1a]", accent: "#00cc66", abbr: "WJ",  logoColor: "#00ff88" },
  MarketWatch: { gradient: "from-[#1a1200] to-[#332400]", accent: "#ffd700", abbr: "MW",  logoColor: "#ffd700" },
  FT:          { gradient: "from-[#1a0800] to-[#331500]", accent: "#ff8c00", abbr: "FT",  logoColor: "#ffaa44" },
};

const DEFAULT_BRAND = { gradient: "from-[#0a0a0f] to-[#13131a]", accent: "#888892", abbr: "N",  logoColor: "#888892" };

const IMPACT_ICON   = { HIGH: AlertTriangle, MED: AlertCircle, LOW: Info } as const;
const IMPACT_COLOR  = { HIGH: "#ff3366",     MED: "#ffd700",   LOW: "#00aaff" } as const;
const BIAS_META     = {
  BULL:    { icon: TrendingUp,   color: "#00ff88", label: "BULL" },
  BEAR:    { icon: TrendingDown, color: "#ff3366", label: "BEAR" },
  NEUTRAL: { icon: Minus,        color: "#888892", label: "NEUTRAL" },
} as const;

// ─── Outlet logo badge ─────────────────────────────────────────────────────
function OutletLogo({ source }: { source: string }) {
  const brand = OUTLET_BRAND[source] ?? DEFAULT_BRAND;
  return (
    <div
      className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-[11px] tracking-wider shrink-0"
      style={{ backgroundColor: brand.accent + "25", color: brand.logoColor, border: `1px solid ${brand.accent}40` }}
    >
      {brand.abbr}
    </div>
  );
}

// ─── Card image banner ─────────────────────────────────────────────────────
function CardBanner({ source, category, impactLevel }: {
  source: string; category: string; impactLevel: "HIGH" | "MED" | "LOW";
}) {
  const brand   = OUTLET_BRAND[source] ?? DEFAULT_BRAND;
  const impColor = IMPACT_COLOR[impactLevel];
  const ImpIcon  = IMPACT_ICON[impactLevel];

  return (
    <div
      className={`relative h-[80px] rounded-t-xl overflow-hidden bg-gradient-to-br ${brand.gradient} flex items-end p-3`}
    >
      {/* Glow orb */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl pointer-events-none"
        style={{ background: brand.accent + "30" }}
      />
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(${brand.accent} 1px, transparent 1px)`,
          backgroundSize: "18px 18px",
        }}
      />
      {/* Source + category */}
      <div className="relative flex items-end justify-between w-full">
        <div>
          <div className="text-[9px] uppercase tracking-widest" style={{ color: brand.accent + "aa" }}>
            {category}
          </div>
          <div className="text-base font-black tracking-tight" style={{ color: brand.logoColor }}>
            {source}
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: impColor + "20", color: impColor, border: `1px solid ${impColor}40` }}
        >
          <ImpIcon size={8} />
          {impactLevel}
        </span>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function TrendingStories() {
  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Flame size={14} className="text-accentRed" />
        <h2 className="text-sm font-semibold tracking-wide">TRENDING NOW</h2>
        <span className="ml-auto text-[10px] text-muted">{trendingStories.length} featured</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trendingStories.map((story) => {
          const biasMeta = BIAS_META[story.bias];
          const BiasIcon = biasMeta.icon;

          return (
            <a
              key={story.id}
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-border bg-panel2 overflow-hidden transition hover:border-accent/40 hover:shadow-glow"
            >
              {/* Image banner */}
              <CardBanner
                source={story.source}
                category={story.category}
                impactLevel={story.impactLevel}
              />

              {/* Content */}
              <div className="p-4 space-y-2.5">
                {/* Source row */}
                <div className="flex items-center gap-2">
                  <OutletLogo source={story.source} />
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                      {story.source}
                    </div>
                    <div className="text-[9px] text-muted">{story.category}</div>
                  </div>
                  <ExternalLink size={11} className="text-muted opacity-0 group-hover:opacity-100 transition ml-auto" />
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold leading-snug group-hover:text-accent transition">
                  {story.title}
                </h3>

                {/* Preview */}
                <p className="text-xs text-muted leading-relaxed line-clamp-3">
                  {story.preview}
                </p>

                {/* Footer chips */}
                <div className="pt-2.5 border-t border-border flex items-center flex-wrap gap-2 text-[10px]">
                  <span
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: biasMeta.color + "15", color: biasMeta.color }}
                  >
                    <BiasIcon size={9} />
                    {biasMeta.label}
                  </span>
                  <span className="ml-auto text-muted">
                    {story.publishedAt} · {story.readTimeMin} min read
                  </span>
                </div>

                {/* Symbols */}
                {story.symbols.length > 0 && (
                  <div className="text-[10px] text-muted font-mono">
                    {story.symbols.join(" · ")}
                  </div>
                )}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
