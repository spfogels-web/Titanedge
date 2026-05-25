"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, Bot, User } from "lucide-react";
import type { Trade } from "@/lib/types";

interface Props {
  trades: Trade[];
}

const FUTURES_MULTIPLIERS: Record<string, number> = {
  MNQ: 2, NQ: 20, MES: 5, ES: 50, MYM: 0.5, YM: 5,
  M2K: 5, RTY: 50, MGC: 10, GC: 100, MCL: 100, CL: 1000,
};

function baseSymbol(s: string): string {
  return s.replace(/\d+!$/, "").replace(/[FGHJKMNQUVXZ]\d{1,2}$/i, "").toUpperCase();
}

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

function holdDuration(opened: string, closed: string | null): string {
  if (!closed) return "—";
  const ms = new Date(closed).getTime() - new Date(opened).getTime();
  const sec = Math.max(0, Math.floor(ms / 1000));
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

function rMultiple(
  pnl: number | null, entry: number | null, stop: number | null,
  qty: number, symbol: string,
): number | null {
  if (pnl == null || entry == null || stop == null) return null;
  const mult = FUTURES_MULTIPLIERS[baseSymbol(symbol)];
  if (mult == null) return null;
  const risk = Math.abs(entry - stop) * mult * qty;
  if (risk === 0) return null;
  return pnl / risk;
}

export default function EnhancedTradeTable({ trades }: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wide">
          ALL TRADES <span className="text-muted font-normal">({trades.length})</span>
        </h2>
        <span className="text-[10px] text-muted">Click a row to expand</span>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-12 text-xs text-muted">
          No trades match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead className="text-muted uppercase tracking-wider">
              <tr>
                <th className="text-left py-2 w-6 font-normal"></th>
                <th className="text-left font-normal">Time</th>
                <th className="text-left font-normal">Symbol</th>
                <th className="text-left font-normal">Side</th>
                <th className="text-right font-normal">Qty</th>
                <th className="text-right font-normal">Entry</th>
                <th className="text-right font-normal">Exit</th>
                <th className="text-right font-normal">P&amp;L</th>
                <th className="text-right font-normal">R</th>
                <th className="text-left font-normal pl-3">Setup</th>
                <th className="text-right font-normal">Source</th>
                <th className="text-right font-normal">Result</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => {
                const entry = t.entry_price != null ? Number(t.entry_price) : null;
                const exit = t.exit_price != null ? Number(t.exit_price) : null;
                const stop = t.stop_price != null ? Number(t.stop_price) : null;
                const target = t.target_price != null ? Number(t.target_price) : null;
                const pnl = t.pnl != null ? Number(t.pnl) : null;
                const r = rMultiple(pnl, entry, stop, t.quantity, t.symbol);
                const win = pnl != null && pnl > 0;
                const open = t.status === "OPEN";
                const isOpen = expanded.has(t.id);

                return (
                  <>
                    <tr
                      key={t.id}
                      onClick={() => toggle(t.id)}
                      className="border-t border-border cursor-pointer hover:bg-panel2/50 transition"
                    >
                      <td className="py-2.5">
                        {isOpen ? (
                          <ChevronDown size={12} className="text-muted" />
                        ) : (
                          <ChevronRight size={12} className="text-muted" />
                        )}
                      </td>
                      <td className="text-muted font-mono text-[11px]">
                        {fmtTime(t.closed_at ?? t.opened_at)}
                      </td>
                      <td className="font-mono">{t.symbol}</td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                            t.side === "LONG" ? "text-accent" : "text-accentRed"
                          }`}
                        >
                          {t.side === "LONG" ? <ArrowUp size={9} /> : <ArrowDown size={9} />}
                          {t.side}
                        </span>
                      </td>
                      <td className="text-right font-mono">{t.quantity}</td>
                      <td className="text-right font-mono">{entry != null ? entry.toFixed(2) : "—"}</td>
                      <td className="text-right font-mono">{exit != null ? exit.toFixed(2) : "—"}</td>
                      <td
                        className={`text-right font-mono font-semibold ${
                          pnl == null ? "text-muted" : pnl >= 0 ? "text-accent" : "text-accentRed"
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
                      <td className="pl-3 text-muted truncate max-w-[180px]">
                        {t.strategy ?? "—"}
                      </td>
                      <td className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${
                            t.source === "BOT" ? "text-accent" : "text-[#aa50ff]"
                          }`}
                        >
                          {t.source === "BOT" ? <Bot size={10} /> : <User size={10} />}
                          {t.source}
                        </span>
                      </td>
                      <td
                        className={`text-right text-[10px] font-semibold uppercase tracking-wider ${
                          open ? "text-accentBlue" : pnl == null ? "text-muted" : win ? "text-accent" : "text-accentRed"
                        }`}
                      >
                        {open ? "OPEN" : pnl == null ? "—" : win ? "WIN" : "LOSS"}
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="bg-panel2/40 border-b border-border">
                        <td colSpan={12} className="px-4 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <DetailCell label="Opened" value={fmtTime(t.opened_at)} />
                            <DetailCell
                              label="Closed"
                              value={t.closed_at ? fmtTime(t.closed_at) : "Still open"}
                            />
                            <DetailCell label="Hold time" value={holdDuration(t.opened_at, t.closed_at)} />
                            <DetailCell label="Status" value={t.status} />
                            <DetailCell label="Stop price" value={stop != null ? stop.toFixed(2) : "—"} />
                            <DetailCell label="Target price" value={target != null ? target.toFixed(2) : "—"} />
                            <DetailCell
                              label="Risk per contract"
                              value={
                                stop != null && entry != null
                                  ? `${Math.abs(entry - stop).toFixed(2)} pts`
                                  : "—"
                              }
                            />
                            <DetailCell
                              label="Reward per contract"
                              value={
                                target != null && entry != null
                                  ? `${Math.abs(target - entry).toFixed(2)} pts`
                                  : "—"
                              }
                            />
                            <DetailCell label="Confidence score" value={t.score != null ? String(t.score) : "—"} />
                            <DetailCell label="Trade ID" value={`#${t.id}`} />
                            {t.notes && (
                              <div className="md:col-span-4">
                                <div className="text-[10px] uppercase tracking-wider text-muted mb-1">Notes</div>
                                <div className="text-sm text-white/85 bg-bg/40 border border-border rounded-md p-2.5 font-mono whitespace-pre-wrap">
                                  {t.notes}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
      <div className="text-sm font-mono mt-0.5">{value}</div>
    </div>
  );
}
