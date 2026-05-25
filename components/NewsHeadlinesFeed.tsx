"use client";
import { Newspaper, AlertTriangle, AlertCircle, Info, ExternalLink } from "lucide-react";
import { headlines, type ImpactLevel } from "@/lib/mock/news";

const IMPACT_META: Record<ImpactLevel, { icon: typeof AlertTriangle; color: string }> = {
  HIGH: { icon: AlertTriangle, color: "text-accentRed" },
  MED:  { icon: AlertCircle,   color: "text-gold" },
  LOW:  { icon: Info,          color: "text-accentBlue" },
};

export default function NewsHeadlinesFeed({ limit }: { limit?: number }) {
  const items = typeof limit === "number" ? headlines.slice(0, limit) : headlines;

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-md bg-gold/10 flex items-center justify-center">
          <Newspaper size={14} className="text-gold" />
        </div>
        <h2 className="text-sm font-semibold tracking-wide">LIVE NEWS HEADLINES</h2>
        <span className="ml-auto text-[10px] text-muted">{items.length} headlines</span>
      </div>
      <div className="space-y-3">
        {items.map((n) => {
          const meta = IMPACT_META[n.impact];
          const Icon = meta.icon;
          return (
            <a
              key={n.id}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-3 p-3 rounded-lg bg-panel2 border border-border hover:border-accent/40 hover:bg-panel2/80 transition cursor-pointer"
            >
              <div className={`shrink-0 ${meta.color}`}>
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[10px] text-muted uppercase tracking-wider">
                    <span className="font-semibold">{n.source}</span>
                    {n.symbols && n.symbols.length > 0 && (
                      <>
                        <span className="mx-2">·</span>
                        <span className="font-mono">{n.symbols.join(" · ")}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted">{n.timeAgo} ago</span>
                    <ExternalLink size={11} className="text-muted opacity-0 group-hover:opacity-100 transition" />
                  </div>
                </div>
                <div className="text-xs font-semibold mt-1 group-hover:text-accent transition">
                  {n.headline}
                </div>
                <p className="text-xs text-muted mt-1 leading-relaxed">{n.summary}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
