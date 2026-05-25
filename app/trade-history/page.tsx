"use client";
import { useMemo, useState } from "react";
import { useTrades } from "@/lib/hooks/useTrades";
import TradeHistoryHero from "@/components/tradehistory/TradeHistoryHero";
import CumulativePnLChart from "@/components/tradehistory/CumulativePnLChart";
import TradeHistoryFilters, {
  defaultFilters,
  type Filters,
} from "@/components/tradehistory/TradeHistoryFilters";
import TradeCalendarHeatmap from "@/components/tradehistory/TradeCalendarHeatmap";
import SetupBreakdownMini from "@/components/tradehistory/SetupBreakdownMini";
import EnhancedTradeTable from "@/components/tradehistory/EnhancedTradeTable";
import type { Trade } from "@/lib/types";

const RANGE_DAYS: Record<Filters["range"], number | null> = {
  TODAY: 1,
  "7D": 7,
  "30D": 30,
  "90D": 90,
  ALL: null,
};

function applyFilters(trades: Trade[], f: Filters): Trade[] {
  const days = RANGE_DAYS[f.range];
  const cutoff = days != null ? Date.now() - days * 24 * 3600 * 1000 : null;
  const symbolNeedle = f.symbol.trim().toUpperCase();

  return trades.filter((t) => {
    if (cutoff != null) {
      const when = new Date(t.closed_at ?? t.opened_at).getTime();
      if (when < cutoff) return false;
    }
    if (f.side !== "ALL" && t.side !== f.side) return false;
    if (f.source !== "ALL" && t.source !== f.source) return false;
    if (f.result === "OPEN" && t.status !== "OPEN") return false;
    if (f.result === "WIN") {
      if (t.status !== "CLOSED" || t.pnl == null || Number(t.pnl) <= 0) return false;
    }
    if (f.result === "LOSS") {
      if (t.status !== "CLOSED" || t.pnl == null || Number(t.pnl) > 0) return false;
    }
    if (symbolNeedle && !t.symbol.toUpperCase().includes(symbolNeedle)) return false;
    return true;
  });
}

export default function Page() {
  const { data, error, loading } = useTrades({ limit: 500 });
  const all = data?.trades ?? [];
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-accentRed/10 border border-accentRed/30 text-accentRed text-xs p-3 rounded-md">
          Error loading trades: {error}
        </div>
      )}

      <TradeHistoryHero trades={filtered} />

      <CumulativePnLChart trades={filtered} />

      <TradeHistoryFilters
        filters={filters}
        onChange={setFilters}
        totalCount={all.length}
        filteredCount={filtered.length}
        trades={filtered}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TradeCalendarHeatmap trades={filtered} />
        <SetupBreakdownMini trades={filtered} />
      </div>

      <EnhancedTradeTable trades={filtered} />

      {loading && all.length === 0 && (
        <div className="text-center text-xs text-muted py-4">Loading trades…</div>
      )}
    </div>
  );
}
