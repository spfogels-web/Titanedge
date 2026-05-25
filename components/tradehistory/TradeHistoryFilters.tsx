"use client";
import { Search, Download } from "lucide-react";
import type { Trade } from "@/lib/types";

export type SideFilter = "ALL" | "LONG" | "SHORT";
export type SourceFilter = "ALL" | "BOT" | "MANUAL";
export type ResultFilter = "ALL" | "WIN" | "LOSS" | "OPEN";
export type DateRange = "TODAY" | "7D" | "30D" | "90D" | "ALL";

export interface Filters {
  side: SideFilter;
  source: SourceFilter;
  result: ResultFilter;
  range: DateRange;
  symbol: string;
}

export const defaultFilters: Filters = {
  side: "ALL",
  source: "ALL",
  result: "ALL",
  range: "30D",
  symbol: "",
};

interface Props {
  filters: Filters;
  onChange: (next: Filters) => void;
  totalCount: number;
  filteredCount: number;
  trades: Trade[];           // for CSV export (the filtered trades)
}

function Pill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition border ${
        active
          ? "bg-accent/15 border-accent/40 text-accent"
          : "bg-panel2 border-border text-muted hover:text-white hover:border-accent/30"
      }`}
    >
      {children}
    </button>
  );
}

function exportCSV(trades: Trade[]) {
  const headers = [
    "id", "opened_at", "closed_at", "symbol", "side", "qty",
    "entry_price", "exit_price", "stop_price", "target_price",
    "pnl", "status", "strategy", "score", "source", "notes",
  ];
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = trades.map((t) => [
    t.id, t.opened_at, t.closed_at ?? "", t.symbol, t.side, t.quantity,
    t.entry_price ?? "", t.exit_price ?? "", t.stop_price ?? "", t.target_price ?? "",
    t.pnl ?? "", t.status, t.strategy ?? "", t.score ?? "", t.source, t.notes ?? "",
  ]);
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `titanedge-trades-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function TradeHistoryFilters({
  filters, onChange, totalCount, filteredCount, trades,
}: Props) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="bg-panel border border-border rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-[10px] uppercase tracking-wider text-muted mr-1">Range</div>
        {(["TODAY", "7D", "30D", "90D", "ALL"] as const).map((r) => (
          <Pill key={r} active={filters.range === r} onClick={() => set("range", r)}>
            {r === "TODAY" ? "Today" : r === "ALL" ? "All time" : `Last ${r}`}
          </Pill>
        ))}

        <span className="mx-2 text-muted">·</span>

        <div className="text-[10px] uppercase tracking-wider text-muted mr-1">Side</div>
        {(["ALL", "LONG", "SHORT"] as const).map((s) => (
          <Pill key={s} active={filters.side === s} onClick={() => set("side", s)}>
            {s}
          </Pill>
        ))}

        <span className="mx-2 text-muted">·</span>

        <div className="text-[10px] uppercase tracking-wider text-muted mr-1">Source</div>
        {(["ALL", "BOT", "MANUAL"] as const).map((s) => (
          <Pill key={s} active={filters.source === s} onClick={() => set("source", s)}>
            {s}
          </Pill>
        ))}

        <span className="mx-2 text-muted">·</span>

        <div className="text-[10px] uppercase tracking-wider text-muted mr-1">Result</div>
        {(["ALL", "WIN", "LOSS", "OPEN"] as const).map((r) => (
          <Pill key={r} active={filters.result === r} onClick={() => set("result", r)}>
            {r}
          </Pill>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={filters.symbol}
            onChange={(e) => set("symbol", e.target.value)}
            placeholder="Filter by symbol (e.g. MNQ)"
            className="w-full bg-bg border border-border rounded-md pl-7 pr-3 py-1.5 text-xs focus:outline-none focus:border-accent/40 font-mono"
          />
        </div>
        <div className="text-xs text-muted">
          Showing <span className="text-white font-semibold">{filteredCount}</span> of{" "}
          <span className="text-white font-semibold">{totalCount}</span>
        </div>
        <button
          type="button"
          onClick={() => exportCSV(trades)}
          disabled={trades.length === 0}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-accent/30 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/15 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={12} />
          Export CSV
        </button>
      </div>
    </div>
  );
}
