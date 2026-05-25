"use client";
import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";
import { propAccounts, computeRollup } from "@/lib/mock/propAccounts";

function fmtMoney(n: number, opts: { sign?: boolean; compact?: boolean } = {}): string {
  const sign = opts.sign && n > 0 ? "+" : n < 0 ? "−" : "";
  if (opts.compact && Math.abs(n) >= 1000) {
    return `${sign}$${(Math.abs(n) / 1000).toFixed(Math.abs(n) >= 100000 ? 0 : 1)}K`;
  }
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function PropAccountsSummary() {
  const r = computeRollup(propAccounts);

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accentBlue/15 flex items-center justify-center">
            <Briefcase size={13} className="text-accentBlue" />
          </div>
          <h2 className="text-sm font-semibold tracking-wide">PROP FIRM ACCOUNTS</h2>
        </div>
        <Link
          href="/performance"
          className="inline-flex items-center gap-1 text-xs text-accentBlue hover:text-accent transition"
        >
          Full details on Performance <ArrowRight size={11} />
        </Link>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Metric label="Active Accounts" value={String(r.totalAccounts)} sub={`across ${r.byFirm.length} firm${r.byFirm.length === 1 ? "" : "s"}`} color="text-white" />
        <Metric label="Live / Funded" value={`${r.liveCount}`} sub={`${r.evaluationCount} in evaluation`} color="text-accent" />
        <Metric label="Total Capital" value={fmtMoney(r.totalCapital, { compact: true })} sub={`${propAccounts.length} accounts deployed`} color="text-white" />
        <Metric
          label="Net Profit"
          value={fmtMoney(r.netProfit, { sign: true, compact: true })}
          sub={`${fmtMoney(r.totalPayouts, { sign: true, compact: true })} paid out`}
          color={r.netProfit >= 0 ? "text-accent" : "text-accentRed"}
        />
      </div>

      {/* By-firm strip */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
        <span className="text-[10px] text-muted uppercase tracking-wider mr-1">By firm:</span>
        {r.byFirm.map((f) => (
          <div
            key={f.firmName}
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border bg-panel2"
            style={{ borderColor: f.accent + "40" }}
          >
            <span
              className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
              style={{ backgroundColor: f.accent + "20", color: f.accent }}
            >
              {f.firmShort}
            </span>
            <span className="text-xs font-semibold">{f.firmName}</span>
            <span className="text-[10px] text-muted">
              {f.live}/{f.count} live · {fmtMoney(f.capital, { compact: true })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Metric({
  label, value, sub, color,
}: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-panel2/40 border border-border rounded-lg p-3">
      <div className="text-[10px] text-muted uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold font-mono mt-1 ${color}`}>{value}</div>
      <div className="text-[10px] text-muted mt-0.5 truncate">{sub}</div>
    </div>
  );
}
