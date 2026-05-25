"use client";
import { Receipt, Download, ExternalLink } from "lucide-react";
import { invoices } from "@/lib/mock/subscription";

const STATUS_META = {
  paid:     { color: "#00ff88", label: "Paid" },
  pending:  { color: "#ffd700", label: "Pending" },
  failed:   { color: "#ff3366", label: "Failed" },
  refunded: { color: "#888892", label: "Refunded" },
} as const;

function fmtDate(iso: string): string {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function BillingHistoryTable() {
  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Receipt size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">BILLING HISTORY</h2>
        </div>
        <span className="text-[10px] text-muted">{invoices.length} invoices</span>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead className="text-muted uppercase tracking-wider">
            <tr>
              <th className="text-left py-2 font-normal">Invoice</th>
              <th className="text-left font-normal">Date</th>
              <th className="text-left font-normal">Plan</th>
              <th className="text-right font-normal">Amount</th>
              <th className="text-center font-normal">Status</th>
              <th className="text-right font-normal">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const status = STATUS_META[inv.status];
              return (
                <tr key={inv.id} className="border-t border-border hover:bg-panel2/40 transition">
                  <td className="py-2.5 font-mono text-[11px]">{inv.number}</td>
                  <td className="text-muted">{fmtDate(inv.date)}</td>
                  <td>{inv.planName}</td>
                  <td className="text-right font-mono font-semibold">${inv.amount}</td>
                  <td className="text-center">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ backgroundColor: status.color + "15", color: status.color }}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="text-right">
                    <a
                      href={inv.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accentBlue hover:text-accent text-[11px]"
                    >
                      <Download size={11} />
                      PDF
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
