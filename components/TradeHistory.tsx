"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTrades } from "@/lib/hooks/useTrades";

// Per-symbol futures point value, for converting pnl & R-multiples back to
// price units when needed. Mirrors the table in app/api/webhook/route.ts.
const FUTURES_MULTIPLIERS: Record<string, number> = {
  MNQ: 2, NQ: 20, MES: 5, ES: 50, MYM: 0.5, YM: 5,
  M2K: 5, RTY: 50, MGC: 10, GC: 100, MCL: 100, CL: 1000,
};

function baseSymbol(symbol: string): string {
  return symbol
    .replace(/\d+!$/, "")
    .replace(/[FGHJKMNQUVXZ]\d{1,2}$/i, "")
    .toUpperCase();
}

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

// R-multiple = pnl / risk-per-trade; risk = |entry - stop| × multiplier × qty.
// Returns null when stop is missing or symbol multiplier is unknown.
function rMultiple(
  pnl: number | null,
  entry: number | null,
  stop: number | null,
  qty: number,
  symbol: string,
): number | null {
  if (pnl == null || entry == null || stop == null) return null;
  const mult = FUTURES_MULTIPLIERS[baseSymbol(symbol)];
  if (mult == null) return null;
  const risk = Math.abs(entry - stop) * mult * qty;
  if (risk === 0) return null;
  return pnl / risk;
}

export default function TradeHistory() {
  const { data, error, loading } = useTrades({ status: "CLOSED", limit: 10 });
  const trades = data?.trades ?? [];

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold tracking-wide mb-3">
        TRADE HISTORY{" "}
        <span className="text-muted font-normal">(RECENT {trades.length || 5})</span>
      </h2>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead className="text-muted uppercase tracking-wider">
            <tr>
              <th className="text-left py-2 font-normal">Time</th>
              <th className="text-left font-normal">Symbol</th>
              <th className="text-left font-normal">Side</th>
              <th className="text-right font-normal">Entry</th>
              <th className="text-right font-normal">Exit</th>
              <th className="text-right font-normal">P&amp;L</th>
              <th className="text-right font-normal">R-Multiple</th>
              <th className="text-left font-normal pl-4">Reason</th>
              <th className="text-right font-normal">Result</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={9} className="py-4 text-center text-accentRed">
                  Error: {error}
                </td>
              </tr>
            )}
            {!error && !loading && trades.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-muted">
                  No closed trades yet
                </td>
              </tr>
            )}
            {trades.map((t) => {
              const entry = t.entry_price != null ? Number(t.entry_price) : null;
              const exit = t.exit_price != null ? Number(t.exit_price) : null;
              const stop = t.stop_price != null ? Number(t.stop_price) : null;
              const pnl = t.pnl != null ? Number(t.pnl) : null;
              const win = pnl != null && pnl > 0;
              const r = rMultiple(pnl, entry, stop, t.quantity, t.symbol);
              return (
                <tr key={t.id} className="border-t border-border">
                  <td className="py-2.5 text-muted font-mono">
                    {t.closed_at ? fmtTime(t.closed_at) : "—"}
                  </td>
                  <td className="font-mono">{t.symbol}</td>
                  <td>
                    <span
                      className={`text-[10px] font-semibold ${
                        t.side === "LONG" ? "text-accent" : "text-accentRed"
                      }`}
                    >
                      {t.side}
                    </span>
                  </td>
                  <td className="text-right font-mono">
                    {entry != null ? entry.toFixed(2) : "—"}
                  </td>
                  <td className="text-right font-mono">
                    {exit != null ? exit.toFixed(2) : "—"}
                  </td>
                  <td
                    className={`text-right font-mono ${
                      pnl == null
                        ? "text-muted"
                        : pnl >= 0
                        ? "text-accent"
                        : "text-accentRed"
                    }`}
                  >
                    {pnl == null ? "—" : fmtUsd(pnl)}
                  </td>
                  <td
                    className={`text-right font-mono ${
                      r == null ? "text-muted" : r >= 0 ? "text-accent" : "text-accentRed"
                    }`}
                  >
                    {r == null ? "—" : `${r >= 0 ? "+" : ""}${r.toFixed(2)}R`}
                  </td>
                  <td className="pl-4 text-muted truncate max-w-[180px]">
                    {t.strategy ?? "—"}
                  </td>
                  <td
                    className={`text-right text-[10px] font-semibold ${
                      pnl == null
                        ? "text-muted"
                        : win
                        ? "text-accent"
                        : "text-accentRed"
                    }`}
                  >
                    {pnl == null ? "—" : win ? "WIN" : "LOSS"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Link
        href="#"
        className="mt-3 flex items-center justify-center gap-1 text-xs text-accentBlue hover:text-accent transition"
      >
        View All Trade History <ArrowRight size={12} />
      </Link>
    </div>
  );
}
