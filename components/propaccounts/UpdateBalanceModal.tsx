"use client";
import { useState } from "react";
import { X, Edit3, Save } from "lucide-react";
import { saveOverride, type ManualOverride } from "@/lib/manualBalanceOverrides";

interface Props {
  accountNumber: string;
  accountLabel: string;        // e.g. "MyFundedFutures · $25K Rapid"
  defaultBalance: number;
  defaultBestDay: number;
  defaultDaysActive: number;
  onClose: () => void;
  onSaved: () => void;
}

export default function UpdateBalanceModal({
  accountNumber, accountLabel, defaultBalance, defaultBestDay, defaultDaysActive,
  onClose, onSaved,
}: Props) {
  const [balance, setBalance] = useState(String(defaultBalance));
  const [bestDay, setBestDay] = useState(String(defaultBestDay));
  const [days, setDays] = useState(String(defaultDaysActive));

  function handleSave(): void {
    const o: ManualOverride = {
      accountNumber,
      currentBalance: Number(balance) || 0,
      bestDayPnl: Number(bestDay) || 0,
      daysActive: Number(days) || 0,
      updatedAt: new Date().toISOString(),
    };
    saveOverride(o);
    onSaved();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-panel border border-border rounded-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 size={14} className="text-accentBlue" />
            <h2 className="text-sm font-semibold tracking-wide">UPDATE BALANCE</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-[11px] text-muted">
            <span className="text-white font-semibold">{accountLabel}</span>
            <div className="font-mono text-[10px] mt-0.5">{accountNumber}</div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted block mb-1.5">
              Current Account Balance (USD)
            </label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full bg-bg/60 border border-border rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-accentBlue/60"
              placeholder="25000"
            />
            <div className="text-[9px] text-muted mt-1">From your Tradovate / MFF dashboard</div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted block mb-1.5">
              Best single-day PnL so far (USD)
            </label>
            <input
              type="number"
              value={bestDay}
              onChange={(e) => setBestDay(e.target.value)}
              className="w-full bg-bg/60 border border-border rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-accentBlue/60"
              placeholder="0"
            />
            <div className="text-[9px] text-muted mt-1">
              Used to track the 50% consistency rule. Look at your daily PnL list and enter your single highest-profit day.
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted block mb-1.5">
              Days Active
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-full bg-bg/60 border border-border rounded-md px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-accentBlue/60"
              placeholder="0"
            />
            <div className="text-[9px] text-muted mt-1">How many distinct trading days you&apos;ve placed at least one trade</div>
          </div>

          <div className="bg-panel2/40 border border-border rounded-md p-2.5 text-[10px] text-muted">
            Saved to your browser. When Tradovate auto-sync goes live, the live
            numbers will take over automatically.
          </div>
        </div>

        <div className="border-t border-border px-5 py-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-border text-muted text-xs hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-accent/40 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/15"
          >
            <Save size={11} />
            Save balance
          </button>
        </div>
      </div>
    </div>
  );
}
