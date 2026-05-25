"use client";
import { useState } from "react";
import { PlusCircle, X, CheckCircle2, Loader2 } from "lucide-react";

const SETUPS = [
  "Slingshot",
  "Pivot Bounce",
  "Trend Continuation",
  "EMA Reclaim",
  "Liquidity Sweep",
  "VIX Divergence",
  "Failed Breakout",
  "Manual / Discretion",
];

export default function ManualTradeForm() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSubmitted(false);
    setLoading(false);
    setError(null);
  };

  const close = () => {
    setOpen(false);
    window.setTimeout(reset, 200);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const numOrNull = (k: string): number | null => {
      const v = fd.get(k);
      if (typeof v !== "string" || v.trim() === "") return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const body = {
      symbol: String(fd.get("symbol") ?? "").trim(),
      side: String(fd.get("side") ?? "LONG"),
      qty: numOrNull("qty"),
      strategy: String(fd.get("strategy") ?? "Manual"),
      entry_price: numOrNull("entry_price"),
      exit_price: numOrNull("exit_price"),
      stop_price: numOrNull("stop_price"),
      target_price: numOrNull("target_price"),
      notes: (() => {
        const v = fd.get("notes");
        return typeof v === "string" && v.trim() !== "" ? v : null;
      })(),
    };

    try {
      const res = await fetch("/api/trades/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      setSubmitted(true);
      window.setTimeout(close, 1300);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent/40 bg-accent/10 text-accent text-sm font-semibold hover:bg-accent/15 transition"
      >
        <PlusCircle size={14} />
        Log Manual Trade
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-lg bg-panel border border-border rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <PlusCircle size={15} className="text-accent" />
                <h2 className="text-sm font-semibold">Log Manual Trade</h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="text-muted hover:text-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {!submitted ? (
              <form className="p-5 space-y-3" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Symbol">
                    <input
                      name="symbol"
                      defaultValue="MNQ1!"
                      required
                      className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-accent/40"
                    />
                  </Field>
                  <Field label="Side">
                    <select
                      name="side"
                      defaultValue="LONG"
                      className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-accent/40"
                    >
                      <option value="LONG">LONG</option>
                      <option value="SHORT">SHORT</option>
                    </select>
                  </Field>
                  <Field label="Qty (contracts)">
                    <input
                      name="qty"
                      type="number"
                      defaultValue={1}
                      min={1}
                      required
                      className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-accent/40"
                    />
                  </Field>
                  <Field label="Setup">
                    <select
                      name="strategy"
                      defaultValue="Slingshot"
                      className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-accent/40"
                    >
                      {SETUPS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Entry price">
                    <input
                      name="entry_price"
                      type="number"
                      step="0.25"
                      placeholder="18000.00"
                      className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-accent/40"
                    />
                  </Field>
                  <Field label="Exit price (if closed)">
                    <input
                      name="exit_price"
                      type="number"
                      step="0.25"
                      placeholder="18050.00"
                      className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-accent/40"
                    />
                  </Field>
                  <Field label="Stop price">
                    <input
                      name="stop_price"
                      type="number"
                      step="0.25"
                      placeholder="17985.00"
                      className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-accent/40"
                    />
                  </Field>
                  <Field label="Target price">
                    <input
                      name="target_price"
                      type="number"
                      step="0.25"
                      placeholder="18060.00"
                      className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-accent/40"
                    />
                  </Field>
                </div>
                <Field label="Notes (reason, mistakes, lessons)">
                  <textarea
                    name="notes"
                    rows={2}
                    placeholder="Took this on a sweep of overnight low + reclaim..."
                    className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-accent/40 resize-none"
                  />
                </Field>

                {error && (
                  <div className="text-xs text-accentRed bg-accentRed/10 border border-accentRed/30 rounded-md p-2">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 mt-2 border-t border-border">
                  <div className="text-[10px] text-muted italic">
                    Saved to Postgres with source=MANUAL · appears on You-vs-Bot within 5s.
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={close}
                      className="px-3 py-1.5 text-xs text-muted hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-1.5 bg-accent/15 hover:bg-accent/25 border border-accent/30 text-accent rounded-md text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading && <Loader2 size={12} className="animate-spin" />}
                      {loading ? "Saving…" : "Save trade"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-12 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mb-3">
                  <CheckCircle2 size={24} className="text-accent" />
                </div>
                <div className="text-sm font-semibold">Trade saved</div>
                <div className="text-[11px] text-muted mt-1">
                  Will show up in You-vs-Bot on next 5-second poll.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] text-muted uppercase tracking-wider mb-1">{label}</span>
      {children}
    </label>
  );
}
