"use client";
import { useEffect, useState } from "react";
import { Clock, Target, ShieldCheck, ArrowUp, ArrowDown } from "lucide-react";
import { useTrades } from "@/lib/hooks/useTrades";
import type { Trade } from "@/lib/types";

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(d);
}

function fmtDuration(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// Visualizes stop / entry / target on a horizontal bar.
function RRBar({
  side, entry, stop, target,
}: { side: "LONG" | "SHORT"; entry: number | null; stop: number | null; target: number | null }) {
  if (entry == null || (stop == null && target == null)) {
    return (
      <div className="text-[10px] text-muted italic py-2">
        Stop/target not set — R:R unavailable
      </div>
    );
  }
  // Compute distances. For LONG: stop is below, target above. For SHORT: inverse.
  const lo = side === "LONG" ? stop : target;
  const hi = side === "LONG" ? target : stop;
  const safeLo = lo ?? (entry - Math.abs(entry - (hi ?? entry)));
  const safeHi = hi ?? (entry + Math.abs(entry - (lo ?? entry)));
  const range = safeHi - safeLo;
  if (range <= 0) return null;

  const entryPct = ((entry - safeLo) / range) * 100;
  const stopPct = stop != null ? ((stop - safeLo) / range) * 100 : null;
  const tgtPct = target != null ? ((target - safeLo) / range) * 100 : null;

  const risk = stop != null ? Math.abs(entry - stop) : 0;
  const reward = target != null ? Math.abs(target - entry) : 0;
  const rr = risk > 0 ? reward / risk : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[10px] text-muted uppercase tracking-wider">
        <span>Stop</span>
        <span>Entry</span>
        <span>Target</span>
      </div>
      <div className="relative h-2.5 bg-panel rounded-full overflow-visible">
        {/* Loss zone (entry → stop) */}
        {stopPct != null && (
          <div
            className="absolute top-0 bottom-0 bg-accentRed/30"
            style={{
              left: side === "LONG" ? `${stopPct}%` : `${entryPct}%`,
              width: `${Math.abs(entryPct - stopPct)}%`,
            }}
          />
        )}
        {/* Profit zone (entry → target) */}
        {tgtPct != null && (
          <div
            className="absolute top-0 bottom-0 bg-accent/30"
            style={{
              left: side === "LONG" ? `${entryPct}%` : `${tgtPct}%`,
              width: `${Math.abs(tgtPct - entryPct)}%`,
            }}
          />
        )}
        {/* Stop marker */}
        {stopPct != null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-4 rounded bg-accentRed"
            style={{ left: `calc(${stopPct}% - 4px)` }}
          />
        )}
        {/* Entry marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-5 rounded bg-white"
          style={{ left: `calc(${entryPct}% - 4px)` }}
        />
        {/* Target marker */}
        {tgtPct != null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2 h-4 rounded bg-accent"
            style={{ left: `calc(${tgtPct}% - 4px)` }}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-accentRed">{stop?.toFixed(2) ?? "—"}</span>
        <span className="text-white">{entry.toFixed(2)}</span>
        <span className="text-accent">{target?.toFixed(2) ?? "—"}</span>
      </div>
      {risk > 0 && reward > 0 && (
        <div className="text-[10px] text-muted text-center pt-0.5">
          R:R <span className="text-white font-mono font-semibold">{rr.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

function PositionCard({ t }: { t: Trade }) {
  const [, force] = useState(0);
  // Re-render every second so duration ticks.
  useEffect(() => {
    const id = setInterval(() => force((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const entry = t.entry_price != null ? Number(t.entry_price) : null;
  const stop = t.stop_price != null ? Number(t.stop_price) : null;
  const target = t.target_price != null ? Number(t.target_price) : null;
  const pnl = t.pnl != null ? Number(t.pnl) : null;
  const isLong = t.side === "LONG";

  return (
    <div className="bg-panel2 border border-border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-mono font-bold text-base">{t.symbol}</div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isLong
                ? "bg-accent/15 text-accent"
                : "bg-accentRed/15 text-accentRed"
            }`}
          >
            {isLong ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {t.side}
          </span>
          <span className="text-[10px] text-muted font-mono">
            {t.quantity} ct
          </span>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted uppercase tracking-wider">Unrealized</div>
          <div className={`text-sm font-mono font-bold ${pnl == null ? "text-muted" : pnl >= 0 ? "text-accent" : "text-accentRed"}`}>
            {pnl == null ? "—" : fmtUsd(pnl)}
          </div>
        </div>
      </div>

      {/* R:R Bar */}
      <RRBar side={t.side} entry={entry} stop={stop} target={target} />

      {/* Footer meta */}
      <div className="flex items-center justify-between text-[10px] text-muted pt-2 border-t border-border">
        <span className="flex items-center gap-1.5">
          <Clock size={11} />
          Opened {fmtTime(t.opened_at)} EST
        </span>
        <span className="flex items-center gap-1.5 font-mono">
          <Target size={11} />
          {fmtDuration(t.opened_at)}
        </span>
        {t.strategy && (
          <span className="hidden md:flex items-center gap-1.5">
            <ShieldCheck size={11} />
            {t.strategy}
          </span>
        )}
      </div>
    </div>
  );
}

export default function EnhancedPositionList() {
  const { data, error, loading } = useTrades({ status: "OPEN" });
  const trades = data?.trades ?? [];

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wide">
          OPEN POSITIONS{" "}
          <span className="text-muted font-normal">
            ({loading && !data ? "…" : trades.length})
          </span>
        </h2>
        {trades.length > 0 && (
          <span className="text-[10px] text-accent flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Live
          </span>
        )}
      </div>

      {error && (
        <div className="text-xs text-accentRed">Error: {error}</div>
      )}
      {!error && !loading && trades.length === 0 && (
        <div className="text-center py-12 text-xs text-muted">
          No open positions. New entries from the webhook will appear here within ~5 seconds.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {trades.map((t) => (
          <PositionCard key={t.id} t={t} />
        ))}
      </div>
    </div>
  );
}
