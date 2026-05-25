"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTrades } from "@/lib/hooks/useTrades";
import type { Trade } from "@/lib/types";

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  const h = String(((d.getHours() + 11) % 12) + 1).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  const ap = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${m}:${s} ${ap}`;
}

function fmtDuration(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(sec / 3600)).padStart(2, "0");
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function TradeCard({ t }: { t: Trade }) {
  const entry = t.entry_price != null ? Number(t.entry_price) : null;
  const stop = t.stop_price != null ? Number(t.stop_price) : null;
  const target = t.target_price != null ? Number(t.target_price) : null;
  const pnl = t.pnl != null ? Number(t.pnl) : null;
  const isLong = t.side === "LONG";

  return (
    <div className="bg-panel2 border border-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm">{t.symbol}</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              isLong
                ? "bg-accent/15 text-accent"
                : "bg-accentRed/15 text-accentRed"
            }`}
          >
            {t.side}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-[11px]">
        <div>
          <div className="text-muted">Entry</div>
          <div className="font-mono font-semibold">{entry != null ? entry.toFixed(2) : "—"}</div>
        </div>
        <div>
          <div className="text-muted">Size</div>
          <div className="font-mono font-semibold">
            {t.quantity} {t.quantity === 1 ? "Contract" : "Contracts"}
          </div>
        </div>
        <div>
          <div className="text-muted">P&amp;L</div>
          <div className={`font-mono font-semibold ${pnl == null ? "text-muted" : pnl >= 0 ? "text-accent" : "text-accentRed"}`}>
            {pnl == null ? "—" : fmtUsd(pnl)}
          </div>
        </div>
        <div>
          <div className="text-muted">Stop Loss</div>
          <div className="font-mono font-semibold">{stop != null ? stop.toFixed(2) : "—"}</div>
        </div>
        <div>
          <div className="text-muted">Trailing Stop</div>
          <div className="font-mono font-semibold">{target != null ? target.toFixed(2) : "—"}</div>
        </div>
        <div>
          <div className="text-muted">Open Time</div>
          <div className="font-mono font-semibold">{fmtTime(t.opened_at)}</div>
        </div>
        <div>
          <div className="text-muted">Duration</div>
          <div className="font-mono font-semibold">{fmtDuration(t.opened_at)}</div>
        </div>
      </div>
    </div>
  );
}

export default function LiveTrades() {
  const { data, error, loading } = useTrades({ status: "OPEN" });
  const trades = data?.trades ?? [];

  return (
    <div className="bg-panel border border-border rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wide">
          LIVE TRADES{" "}
          <span className="text-muted font-normal">
            ({loading && !data ? "…" : trades.length})
          </span>
        </h2>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin">
        {error && (
          <div className="text-xs text-accentRed">Error: {error}</div>
        )}
        {!error && !loading && trades.length === 0 && (
          <div className="text-xs text-muted text-center py-8">
            No open positions
          </div>
        )}
        {trades.map((t) => (
          <TradeCard key={t.id} t={t} />
        ))}
      </div>

      <Link
        href="#"
        className="mt-3 flex items-center justify-center gap-1 text-xs text-accentBlue hover:text-accent transition"
      >
        View All Live Trades <ArrowRight size={12} />
      </Link>
    </div>
  );
}
