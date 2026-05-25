"use client";
import { Activity, ArrowUp, ArrowDown } from "lucide-react";
import { useTrades } from "@/lib/hooks/useTrades";

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export default function RecentActivityTape() {
  // Use the all-trades endpoint and split into events client-side: opens and
  // closes both appear in the tape.
  const { data } = useTrades({ limit: 25 });
  const trades = data?.trades ?? [];

  // Build event tape: each trade contributes an "OPEN" event, and if closed
  // a "CLOSE" event. Sort by event time desc, take 12.
  type TapeEvent = {
    id: string;
    when: string;
    kind: "OPEN" | "CLOSE";
    symbol: string;
    side: "LONG" | "SHORT";
    qty: number;
    price: number | null;
    pnl: number | null;
    source: "BOT" | "MANUAL";
  };
  const events: TapeEvent[] = [];
  for (const t of trades) {
    events.push({
      id: `o-${t.id}`,
      when: t.opened_at,
      kind: "OPEN",
      symbol: t.symbol,
      side: t.side,
      qty: t.quantity,
      price: t.entry_price != null ? Number(t.entry_price) : null,
      pnl: null,
      source: t.source,
    });
    if (t.closed_at) {
      events.push({
        id: `c-${t.id}`,
        when: t.closed_at,
        kind: "CLOSE",
        symbol: t.symbol,
        side: t.side,
        qty: t.quantity,
        price: t.exit_price != null ? Number(t.exit_price) : null,
        pnl: t.pnl != null ? Number(t.pnl) : null,
        source: t.source,
      });
    }
  }
  events.sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());
  const top = events.slice(0, 12);

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-accent" />
          <h2 className="text-sm font-semibold tracking-wide">RECENT ACTIVITY TAPE</h2>
        </div>
        <span className="text-[10px] text-muted">{top.length} events</span>
      </div>

      {top.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted">
          No activity yet. Fired webhooks and manual trades will tape here.
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead className="text-muted uppercase tracking-wider">
              <tr>
                <th className="text-left py-2 font-normal">Time</th>
                <th className="text-left font-normal">Event</th>
                <th className="text-left font-normal">Symbol</th>
                <th className="text-left font-normal">Side</th>
                <th className="text-right font-normal">Qty</th>
                <th className="text-right font-normal">Price</th>
                <th className="text-right font-normal">P&amp;L</th>
                <th className="text-right font-normal">Source</th>
              </tr>
            </thead>
            <tbody>
              {top.map((e) => (
                <tr key={e.id} className="border-t border-border hover:bg-panel2/50 transition">
                  <td className="py-2 font-mono text-muted">{fmtTime(e.when)}</td>
                  <td>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        e.kind === "OPEN" ? "text-accentBlue" : "text-gold"
                      }`}
                    >
                      {e.kind}
                    </span>
                  </td>
                  <td className="font-mono">{e.symbol}</td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                        e.side === "LONG" ? "text-accent" : "text-accentRed"
                      }`}
                    >
                      {e.side === "LONG" ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                      {e.side}
                    </span>
                  </td>
                  <td className="text-right font-mono">{e.qty}</td>
                  <td className="text-right font-mono">{e.price != null ? e.price.toFixed(2) : "—"}</td>
                  <td
                    className={`text-right font-mono ${
                      e.pnl == null ? "text-muted" : e.pnl >= 0 ? "text-accent" : "text-accentRed"
                    }`}
                  >
                    {e.pnl == null ? "—" : fmtUsd(e.pnl)}
                  </td>
                  <td className="text-right">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${
                        e.source === "BOT" ? "text-accent" : "text-[#aa50ff]"
                      }`}
                    >
                      {e.source}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
