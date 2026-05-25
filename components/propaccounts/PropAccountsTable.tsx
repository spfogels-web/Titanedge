"use client";
import { useState } from "react";
import { Briefcase, Shield, CheckCircle2, AlertTriangle, PlusCircle } from "lucide-react";
import { propAccounts, type PropFirmAccount } from "@/lib/mock/propAccounts";
import AddPropAccountModal from "./AddPropAccountModal";

function fmtMoney(n: number, opts: { sign?: boolean } = {}): string {
  const sign = opts.sign && n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function typeLabel(t: PropFirmAccount["accountType"]): string {
  return t === "XFA" ? "XFA · Live" : t === "FUNDED" ? "Funded · Live" : t === "LIVE" ? "Live" : "Evaluation";
}

function typeColor(t: PropFirmAccount["accountType"]): string {
  if (t === "XFA" || t === "FUNDED" || t === "LIVE") return "#00ff88";
  return "#ffd700";
}

export default function PropAccountsTable() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">
            PROP FIRM ACCOUNTS — DETAIL
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted">{propAccounts.length} active accounts</span>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-accent/40 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/15 transition"
          >
            <PlusCircle size={12} />
            Add Account
          </button>
        </div>
      </div>

      {addOpen && <AddPropAccountModal onClose={() => setAddOpen(false)} />}

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead className="text-muted uppercase tracking-wider">
            <tr>
              <th className="text-left py-2 font-normal">Firm / Account</th>
              <th className="text-right font-normal">Size</th>
              <th className="text-left pl-4 font-normal">Type</th>
              <th className="text-right font-normal">Balance</th>
              <th className="text-right font-normal">High Water</th>
              <th className="text-right font-normal">Net P&amp;L</th>
              <th className="text-right font-normal">DD Budget</th>
              <th className="text-right font-normal">Daily Cap</th>
              <th className="text-right font-normal">Payouts</th>
              <th className="text-right font-normal">Days</th>
            </tr>
          </thead>
          <tbody>
            {propAccounts.map((a) => {
              const net = a.currentBalance - a.accountSize;
              const ddRemaining = Math.max(0, a.trailingDrawdown - (a.highWaterMark - a.currentBalance));
              const ddPctLeft = (ddRemaining / a.trailingDrawdown) * 100;
              const ddCol =
                ddPctLeft >= 60 ? "#00ff88" :
                ddPctLeft >= 30 ? "#ffd700" :
                                  "#ff3366";
              return (
                <tr key={a.id} className="border-t border-border hover:bg-panel2/40 transition">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: a.firmAccent + "20", color: a.firmAccent }}
                      >
                        {a.firmShort}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{a.firmName}</div>
                        <div className="text-[10px] text-muted font-mono truncate max-w-[200px]">
                          {a.accountNumber}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right font-mono font-semibold">{fmtMoney(a.accountSize)}</td>
                  <td className="pl-4">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ backgroundColor: typeColor(a.accountType) + "20", color: typeColor(a.accountType) }}
                    >
                      {a.accountType === "EVALUATION" ? (
                        <AlertTriangle size={9} />
                      ) : (
                        <CheckCircle2 size={9} />
                      )}
                      {typeLabel(a.accountType)}
                    </span>
                  </td>
                  <td className="text-right font-mono">{fmtMoney(a.currentBalance)}</td>
                  <td className="text-right font-mono text-muted">{fmtMoney(a.highWaterMark)}</td>
                  <td className={`text-right font-mono font-semibold ${net >= 0 ? "text-accent" : "text-accentRed"}`}>
                    {fmtMoney(net, { sign: true })}
                  </td>
                  <td className="text-right">
                    <div className="inline-flex flex-col items-end gap-1">
                      <span className="font-mono text-[11px]" style={{ color: ddCol }}>
                        {fmtMoney(ddRemaining)}
                      </span>
                      <div className="w-16 h-1 bg-bg/60 rounded overflow-hidden">
                        <div
                          className="h-full rounded transition-all"
                          style={{ width: `${ddPctLeft}%`, backgroundColor: ddCol }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="text-right font-mono text-gold">{fmtMoney(a.dailyLossLimit)}</td>
                  <td className="text-right font-mono text-accent">
                    {a.totalPayouts > 0 ? fmtMoney(a.totalPayouts, { sign: true }) : "—"}
                  </td>
                  <td className="text-right font-mono">{a.daysActive}d</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-[10px] text-muted">
        <Shield size={11} className="text-accentBlue" />
        DD Budget = trailing drawdown remaining from high-water mark. Daily Cap = daily loss limit.
        Mock data — wires to a real prop_accounts table when broker APIs land.
      </div>
    </div>
  );
}
