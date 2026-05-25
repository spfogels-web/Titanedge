"use client";
import { ChevronDown, Info, Wallet } from "lucide-react";
import { useAccount } from "@/lib/hooks/useAccount";

function fmt(n: number, opts: { sign?: boolean } = {}): string {
  const sign = opts.sign && n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

interface Cell {
  label: string;
  value: string;
  color?: string;
  hint?: boolean;
}

export default function AccountStatsPanel() {
  const { data, loading, error } = useAccount();
  const a = data?.account;

  const realizedCol =
    !a ? "text-muted" :
    a.realizedPnl > 0 ? "text-accent" :
    a.realizedPnl < 0 ? "text-accentRed" :
                        "text-muted";

  const cells: Cell[] = [
    { label: "Account balance", value: a ? fmt(a.balance) : "—" },
    { label: "Equity",          value: a ? fmt(a.equity)  : "—" },
    {
      label: "Realized PnL",
      value: a ? fmt(a.realizedPnl, { sign: true }) : "—",
      color: realizedCol,
    },
    {
      label: "Unrealized PnL",
      value: a?.unrealizedPnl == null ? "—" : fmt(a.unrealizedPnl, { sign: true }),
      color: "text-muted",
      hint: true,
    },
    { label: "Account margin",  value: a ? fmt(a.accountMargin)  : "—" },
    { label: "Available funds", value: a ? fmt(a.availableFunds) : "—" },
    { label: "Orders margin",   value: a ? fmt(a.ordersMargin)   : "—" },
    {
      label: "Margin buffer",
      value: a ? `${a.marginBufferPct.toFixed(2)}%` : "—",
      hint: true,
    },
  ];

  return (
    <div className="bg-panel border border-border rounded-xl overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-panel2/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accentBlue/15 flex items-center justify-center">
            <Wallet size={13} className="text-accentBlue" />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-muted">{a?.source ?? "—"}</span>
            <ChevronDown size={12} className="text-muted" />
            <span>{a?.accountName ?? "—"}</span>
            <ChevronDown size={12} className="text-muted" />
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted">
          <span className="px-2 py-0.5 rounded bg-bg/40 border border-border font-mono">
            {a?.session ?? "—"}
          </span>
          <span>· {loading && !a ? "Syncing…" : a ? `Synced ${new Date(a.asOf).toLocaleTimeString()}` : ""}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 divide-y md:divide-y-0 md:divide-x divide-border">
        {cells.map((c) => (
          <div key={c.label} className="px-5 py-3">
            <div className="flex items-center gap-1 text-[10px] text-muted uppercase tracking-wider">
              <span>{c.label}</span>
              {c.hint && <Info size={9} className="text-muted opacity-60" />}
            </div>
            <div className={`mt-1 text-base font-bold font-mono ${c.color ?? "text-white"}`}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <div className="px-5 py-2 border-t border-border bg-panel2/30 text-[10px] text-muted flex items-center gap-2">
        <Info size={10} />
        {error ? (
          <span className="text-accentRed">Error: {error}</span>
        ) : (
          <span>
            Balance + realized PnL computed from your trades. Unrealized PnL needs a
            live market-data feed (coming). Orders margin is a rough placeholder.
          </span>
        )}
      </div>
    </div>
  );
}
