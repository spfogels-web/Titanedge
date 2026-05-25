"use client";
import { Layers } from "lucide-react";
import type { Trade } from "@/lib/types";

interface Props { trades: Trade[]; }

function baseSymbol(s: string): string {
  return s.replace(/\d+!$/, "").replace(/[FGHJKMNQUVXZ]\d{1,2}$/i, "").toUpperCase();
}

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}$${Math.abs(n).toFixed(0)}`;
}

export default function SymbolBreakdown({ trades }: Props) {
  const bySym: Record<string, { trades: number; wins: number; pnl: number; biggestWin: number; biggestLoss: number }> = {};
  for (const t of trades) {
    if (t.status !== "CLOSED" || t.pnl == null) continue;
    const sym = baseSymbol(t.symbol);
    const cur = bySym[sym] ?? { trades: 0, wins: 0, pnl: 0, biggestWin: 0, biggestLoss: 0 };
    const p = Number(t.pnl);
    cur.trades += 1;
    cur.wins += p > 0 ? 1 : 0;
    cur.pnl += p;
    if (p > cur.biggestWin) cur.biggestWin = p;
    if (p < cur.biggestLoss) cur.biggestLoss = p;
    bySym[sym] = cur;
  }
  const rows = Object.entries(bySym)
    .map(([sym, d]) => ({
      sym,
      trades: d.trades,
      winRate: (d.wins / d.trades) * 100,
      pnl: d.pnl,
      avgPnl: d.pnl / d.trades,
      biggestWin: d.biggestWin,
      biggestLoss: d.biggestLoss,
    }))
    .sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Layers size={14} className="text-accentBlue" />
        <h2 className="text-sm font-semibold tracking-wide">PERFORMANCE BY SYMBOL</h2>
        <span className="ml-auto text-[10px] text-muted">{rows.length} symbols traded</span>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted">No closed trades to analyze yet.</div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead className="text-muted uppercase tracking-wider">
              <tr>
                <th className="text-left py-2 font-normal">Symbol</th>
                <th className="text-right font-normal">Trades</th>
                <th className="text-right font-normal">Win Rate</th>
                <th className="text-right font-normal">Net P&amp;L</th>
                <th className="text-right font-normal">Avg P&amp;L</th>
                <th className="text-right font-normal">Best</th>
                <th className="text-right font-normal">Worst</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const wrCol = r.winRate >= 65 ? "text-accent" : r.winRate >= 50 ? "text-gold" : "text-accentRed";
                const pnlCol = r.pnl >= 0 ? "text-accent" : "text-accentRed";
                return (
                  <tr key={r.sym} className="border-t border-border">
                    <td className="py-2.5 font-mono font-semibold">{r.sym}</td>
                    <td className="text-right font-mono">{r.trades}</td>
                    <td className={`text-right font-mono ${wrCol}`}>{r.winRate.toFixed(0)}%</td>
                    <td className={`text-right font-mono font-semibold ${pnlCol}`}>{fmtUsd(r.pnl)}</td>
                    <td className={`text-right font-mono ${r.avgPnl >= 0 ? "text-accent" : "text-accentRed"}`}>{fmtUsd(r.avgPnl)}</td>
                    <td className="text-right font-mono text-accent">{fmtUsd(r.biggestWin)}</td>
                    <td className="text-right font-mono text-accentRed">{fmtUsd(r.biggestLoss)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
