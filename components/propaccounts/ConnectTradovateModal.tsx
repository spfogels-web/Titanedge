"use client";
import { useState } from "react";
import { X, KeyRound, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { saveConnection, type TradovateConnection } from "@/lib/tradovateConnection";

interface Props {
  onClose: () => void;
  onConnected: (snapshot: {
    accounts: Array<{ accountId: number; accountName: string; cashBalance: number; realizedPnL: number }>;
  }) => void;
}

export default function ConnectTradovateModal({ onClose, onConnected }: Props) {
  const [environment, setEnvironment] = useState<"demo" | "live">("demo");
  const [token, setToken] = useState("");
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [successPreview, setSuccessPreview] = useState<{
    accountName: string;
    cashBalance: number;
    realizedPnL: number;
    accountId: number;
  }[] | null>(null);

  async function handleTest(): Promise<void> {
    setTesting(true);
    setError(null);
    setHint(null);
    setSuccessPreview(null);
    try {
      const res = await fetch("/api/broker/tradovate-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token.trim(), environment }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Sync failed");
        setHint(data.hint ?? null);
        return;
      }
      const accs = (data.accounts ?? []) as Array<{
        accountName: string;
        cashBalance: number;
        realizedPnL: number;
        accountId: number;
      }>;
      setSuccessPreview(accs);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setTesting(false);
    }
  }

  function handleSave(): void {
    const conn: TradovateConnection = {
      accessToken: token.trim(),
      environment,
      pastedAt: new Date().toISOString(),
      expectedExpiryAt: new Date(Date.now() + 80 * 60 * 1000).toISOString(),
    };
    saveConnection(conn);
    onConnected({
      accounts: successPreview ?? [],
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-panel border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-panel border-b border-border px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound size={14} className="text-accentBlue" />
            <h2 className="text-sm font-semibold tracking-wide">CONNECT TRADOVATE</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* How-to */}
          <div className="bg-panel2/40 border border-border rounded-md p-4 text-xs leading-relaxed">
            <div className="text-[10px] uppercase tracking-wider text-accentBlue font-semibold mb-2">
              How to get your token (one-time, 60 seconds)
            </div>
            <ol className="space-y-1.5 list-decimal list-inside text-muted">
              <li>
                Open <span className="text-white font-mono">trader.tradovate.com</span> and log in
                with your MFF credentials.
              </li>
              <li>
                Press <span className="text-white font-mono">F12</span> to open DevTools, click the{" "}
                <span className="text-white font-mono">Network</span> tab.
              </li>
              <li>
                Refresh the page (<span className="text-white font-mono">Ctrl+R</span>). Watch the
                Network list populate.
              </li>
              <li>
                Click any request to <span className="text-white font-mono">tradovateapi.com</span>.
                In the right pane, look at <span className="text-white font-mono">Request Headers</span>.
              </li>
              <li>
                Find the <span className="text-white font-mono">Authorization</span> header. It
                looks like <span className="text-white font-mono">Bearer eyJhbGc...</span>. Copy
                everything <em>after</em> the word <span className="text-white font-mono">Bearer</span>{" "}
                (just the token string).
              </li>
              <li>Paste it below.</li>
            </ol>
            <div className="mt-3 pt-3 border-t border-border text-[10px] text-muted">
              The token expires after ~80 minutes. You&apos;ll re-paste once per trading session
              until we wire full OAuth.
            </div>
          </div>

          {/* Environment toggle */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted block mb-1.5">
              Environment
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEnvironment("demo")}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold border transition ${
                  environment === "demo"
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border text-muted hover:text-white"
                }`}
              >
                Demo / Sim
                <div className="text-[9px] text-muted font-normal mt-0.5">MFF evals · Topstep evals</div>
              </button>
              <button
                type="button"
                onClick={() => setEnvironment("live")}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-semibold border transition ${
                  environment === "live"
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border text-muted hover:text-white"
                }`}
              >
                Live
                <div className="text-[9px] text-muted font-normal mt-0.5">Funded accounts · personal</div>
              </button>
            </div>
          </div>

          {/* Token input */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted block mb-1.5">
              Bearer access token
            </label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              rows={4}
              placeholder="Paste your token here (starts with eyJ... usually)"
              className="w-full bg-bg/60 border border-border rounded-md px-3 py-2 text-xs font-mono text-white placeholder:text-muted/50 focus:outline-none focus:border-accentBlue/60"
              spellCheck={false}
            />
          </div>

          {/* Errors */}
          {error && (
            <div className="bg-accentRed/10 border border-accentRed/30 rounded-md p-3 text-xs">
              <div className="flex items-center gap-2 text-accentRed font-semibold">
                <AlertCircle size={12} />
                {error}
              </div>
              {hint && <div className="text-muted text-[11px] mt-1.5 leading-relaxed">{hint}</div>}
            </div>
          )}

          {/* Success preview */}
          {successPreview && (
            <div className="bg-accent/10 border border-accent/30 rounded-md p-3 text-xs">
              <div className="flex items-center gap-2 text-accent font-semibold mb-2">
                <CheckCircle2 size={12} />
                Connected — found {successPreview.length} account
                {successPreview.length === 1 ? "" : "s"}
              </div>
              <div className="space-y-1.5">
                {successPreview.map((a) => (
                  <div
                    key={a.accountId}
                    className="flex items-center justify-between font-mono text-[11px] py-1"
                  >
                    <span className="text-white">{a.accountName}</span>
                    <span className="text-muted">
                      bal{" "}
                      <span className="text-white">
                        ${a.cashBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>{" "}
                      · realized{" "}
                      <span className={a.realizedPnL >= 0 ? "text-accent" : "text-accentRed"}>
                        {a.realizedPnL >= 0 ? "+" : "−"}$
                        {Math.abs(a.realizedPnL).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-panel border-t border-border px-5 py-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-border text-muted text-xs hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={!token.trim() || testing}
            className="px-3 py-1.5 rounded-md border border-accentBlue/40 bg-accentBlue/10 text-accentBlue text-xs font-semibold hover:bg-accentBlue/15 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            {testing && <Loader2 size={12} className="animate-spin" />}
            {successPreview ? "Re-test" : "Test connection"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!successPreview}
            className="px-3 py-1.5 rounded-md border border-accent/40 bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/15 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save &amp; connect
          </button>
        </div>
      </div>
    </div>
  );
}
