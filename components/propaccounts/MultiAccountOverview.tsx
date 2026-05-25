"use client";
import { useState } from "react";
import {
  Briefcase, TrendingUp, TrendingDown, Plug, RefreshCw, AlertCircle, Activity,
} from "lucide-react";
import { useTradovateSync, type TradovateAccountSnapshot } from "@/lib/hooks/useTradovateSync";
import { propAccounts, type PropFirmAccount } from "@/lib/mock/propAccounts";
import ConnectTradovateModal from "./ConnectTradovateModal";

function fmtMoney(n: number, opts: { sign?: boolean; compact?: boolean } = {}): string {
  const sign = opts.sign && n > 0 ? "+" : n < 0 ? "−" : "";
  if (opts.compact && Math.abs(n) >= 1000) {
    return `${sign}$${(Math.abs(n) / 1000).toFixed(Math.abs(n) >= 100000 ? 0 : 1)}K`;
  }
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtAge(d: Date): string {
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

// Match a live Tradovate account to its seed config in propAccounts.ts by
// name. Tradovate exposes the account name as a short string (e.g. for an
// MFF eval it surfaces as a code that contains the account number).
function matchSeed(live: TradovateAccountSnapshot): PropFirmAccount | undefined {
  return propAccounts.find(
    (a) =>
      a.accountNumber === live.accountName ||
      a.accountNumber.includes(live.accountName) ||
      live.accountName.includes(a.accountNumber),
  );
}

export default function MultiAccountOverview() {
  const sync = useTradovateSync();
  const [modalOpen, setModalOpen] = useState(false);

  const accountCount = sync.accounts.length;
  const combinedNetPnL = sync.totalRealizedPnL;
  const combinedCash = sync.totalCashBalance;

  return (
    <>
      <div className="bg-panel border border-border rounded-xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-accentBlue" />
            <h2 className="text-sm font-semibold tracking-wide">CONNECTED ACCOUNTS</h2>
            <span className="text-[10px] text-muted">
              {accountCount === 0
                ? "No accounts connected"
                : `${accountCount} account${accountCount === 1 ? "" : "s"} live`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {sync.connected ? (
              <button
                type="button"
                onClick={sync.refresh}
                disabled={sync.syncing}
                className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border border-accent/40 bg-accent/10 text-accent hover:bg-accent/15 disabled:opacity-50"
                title="Sync all accounts now"
              >
                <RefreshCw size={10} className={sync.syncing ? "animate-spin" : ""} />
                {sync.syncedAt ? `Live · ${fmtAge(sync.syncedAt)}` : sync.syncing ? "Syncing…" : "Sync"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border border-accentBlue/40 bg-accentBlue/10 text-accentBlue hover:bg-accentBlue/15"
              >
                <Plug size={10} />
                Connect Tradovate
              </button>
            )}
          </div>
        </div>

        {/* Sync error banner */}
        {sync.syncError && (
          <div className="mb-4 bg-accentRed/10 border border-accentRed/30 rounded-md p-2.5 text-[11px] text-accentRed flex items-center gap-2">
            <AlertCircle size={11} />
            <span>{sync.syncError}</span>
            <button
              onClick={() => setModalOpen(true)}
              className="ml-auto underline hover:text-white"
            >
              Reconnect
            </button>
          </div>
        )}

        {/* Combined rollup tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <RollupTile
            label="Accounts Live"
            value={String(accountCount)}
            sub={accountCount === 0 ? "Connect Tradovate to begin" : "Auto-synced via Tradovate"}
            color="text-white"
          />
          <RollupTile
            label="Combined Cash"
            value={fmtMoney(combinedCash, { compact: true })}
            sub="Across all accounts"
            color="text-white"
          />
          <RollupTile
            label="Combined Realized PnL"
            value={fmtMoney(combinedNetPnL, { sign: true, compact: true })}
            sub="Live from Tradovate"
            color={combinedNetPnL >= 0 ? "text-accent" : "text-accentRed"}
            icon={combinedNetPnL >= 0 ? TrendingUp : TrendingDown}
          />
          <RollupTile
            label="Open Positions"
            value={String(sync.totalOpenPositions)}
            sub="Currently in market"
            color={sync.totalOpenPositions > 0 ? "text-accentBlue" : "text-muted"}
            icon={Activity}
          />
        </div>

        {/* Per-account tiles */}
        {accountCount === 0 ? (
          <div className="bg-panel2/40 border border-dashed border-border rounded-lg p-6 text-center">
            <Plug size={20} className="mx-auto mb-2 text-muted" />
            <div className="text-sm font-semibold mb-1">No live accounts yet</div>
            <div className="text-[11px] text-muted mb-3">
              Connect Tradovate to pull live balance and PnL for every account on your login.
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-accentBlue/40 bg-accentBlue/10 text-accentBlue hover:bg-accentBlue/15"
            >
              <Plug size={11} />
              Connect Tradovate
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sync.accounts.map((live) => (
              <AccountTile key={live.accountId} live={live} seed={matchSeed(live)} />
            ))}
          </div>
        )}

        {/* Footer hint */}
        {accountCount > 0 && (
          <div className="mt-4 pt-3 border-t border-border text-[10px] text-muted">
            Per-account drawdown / consistency / rule status shown in detail below.
            Tradovate token expires ~80 min &mdash; reconnect when prompted.
          </div>
        )}
      </div>

      {modalOpen && (
        <ConnectTradovateModal
          onClose={() => setModalOpen(false)}
          onConnected={() => {
            sync.refresh();
          }}
        />
      )}
    </>
  );
}

interface RollupTileProps {
  label: string;
  value: string;
  sub: string;
  color: string;
  icon?: typeof TrendingUp;
}
function RollupTile({ label, value, sub, color, icon: Icon }: RollupTileProps) {
  return (
    <div className="bg-panel2/40 border border-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
        {Icon && <Icon size={10} className={color} />}
      </div>
      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
      <div className="text-[10px] text-muted mt-0.5 truncate">{sub}</div>
    </div>
  );
}

interface AccountTileProps {
  live: TradovateAccountSnapshot;
  seed?: PropFirmAccount;
}
function AccountTile({ live, seed }: AccountTileProps) {
  const startingBalance = seed?.accountSize ?? live.cashBalance;
  const profit = live.cashBalance - startingBalance;
  const target = seed?.profitTarget ?? 0;
  const profitPct = target > 0 ? Math.max(0, Math.min(100, (profit / target) * 100)) : 0;

  const firmShort = seed?.firmShort ?? "TVD";
  const firmAccent = seed?.firmAccent ?? "#0ea5e9";
  const firmName = seed?.firmName ?? "Tradovate";
  const sizeLabel = seed ? `$${(seed.accountSize / 1000).toFixed(0)}K` : "—";
  const accountTypeLabel =
    seed?.accountType === "EVALUATION"
      ? "Eval"
      : seed?.accountType === "FUNDED" || seed?.accountType === "XFA" || seed?.accountType === "LIVE"
      ? "Funded"
      : "Demo";

  return (
    <div
      className="rounded-lg border p-3"
      style={{
        borderColor: firmAccent + "30",
        background: `linear-gradient(135deg, ${firmAccent}08 0%, transparent 70%), #1a1a24`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold"
          style={{ backgroundColor: firmAccent + "20", color: firmAccent }}
        >
          {firmShort}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate">
            {firmName} <span className="text-muted">· {sizeLabel}</span>
          </div>
          <div className="text-[9px] text-muted font-mono truncate">{live.accountName}</div>
        </div>
        <span
          className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ backgroundColor: firmAccent + "20", color: firmAccent }}
        >
          {accountTypeLabel}
        </span>
      </div>

      {/* Balance row */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <div className="text-[9px] uppercase text-muted">Balance</div>
          <div className="text-sm font-mono font-bold">{fmtMoney(live.cashBalance)}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase text-muted">Realized PnL</div>
          <div
            className={`text-sm font-mono font-bold ${live.realizedPnL >= 0 ? "text-accent" : "text-accentRed"}`}
          >
            {fmtMoney(live.realizedPnL, { sign: true })}
          </div>
        </div>
      </div>

      {/* Profit target bar (only if it's an eval) */}
      {target > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-[9px] mb-1">
            <span className="text-muted uppercase tracking-wider">Profit Target</span>
            <span className="font-mono text-accent">
              {fmtMoney(profit, { sign: true })} / {fmtMoney(target)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-bg/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{ width: `${profitPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Open positions */}
      <div className="flex items-center justify-between pt-2 border-t border-border text-[10px]">
        <span className="text-muted">Open positions</span>
        <span
          className={`font-mono font-bold ${live.openPositions > 0 ? "text-accentBlue" : "text-muted"}`}
        >
          {live.openPositions}
        </span>
      </div>
    </div>
  );
}
