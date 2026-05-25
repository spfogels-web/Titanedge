"use client";
import { useEffect, useState } from "react";
import {
  Target, Shield, TrendingUp, AlertCircle, CheckCircle2, Clock, Plug, RefreshCw, Edit3,
} from "lucide-react";
import { propAccounts, type PropFirmAccount } from "@/lib/mock/propAccounts";
import { useTradovateSync, type TradovateAccountSnapshot } from "@/lib/hooks/useTradovateSync";
import { loadOverride, type ManualOverride } from "@/lib/manualBalanceOverrides";
import ConnectTradovateModal from "./ConnectTradovateModal";
import UpdateBalanceModal from "./UpdateBalanceModal";

function fmtMoney(n: number, opts: { sign?: boolean } = {}): string {
  const sign = opts.sign && n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtAge(d: Date): string {
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

interface ProgressBarProps { pct: number; color: string; height?: string; }
function ProgressBar({ pct, color, height = "h-2" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className={`w-full ${height} bg-bg/60 rounded-full overflow-hidden`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

function ruleColor(pctRemaining: number): string {
  if (pctRemaining >= 70) return "#00ff88";
  if (pctRemaining >= 40) return "#ffd700";
  return "#ff3366";
}

// Live data layered on top of the seed PropFirmAccount config.
interface LiveBalance {
  cashBalance: number;
  realizedPnL: number;
  syncedAt: Date;
}

interface EvalCardProps {
  account: PropFirmAccount;
  live: LiveBalance | null;
  manual: ManualOverride | null;
  syncing: boolean;
  syncError: string | null;
  onConnectClick: () => void;
  onRefreshClick: () => void;
  onEditClick: () => void;
  connected: boolean;
}

function EvalCard({
  account, live, manual, syncing, syncError,
  onConnectClick, onRefreshClick, onEditClick, connected,
}: EvalCardProps) {
  if (account.accountType !== "EVALUATION") return null;

  // Priority: live Tradovate > manual override > seed
  const currentBalance = live?.cashBalance ?? manual?.currentBalance ?? account.currentBalance;
  const highWaterMark = Math.max(account.highWaterMark, currentBalance);
  const daysActive = manual?.daysActive ?? account.daysActive;

  const target = account.profitTarget ?? 0;
  const profit = currentBalance - account.accountSize;
  const profitPct = target > 0 ? (profit / target) * 100 : 0;

  const ddUsed = Math.max(0, highWaterMark - currentBalance);
  const ddRemaining = Math.max(0, account.trailingDrawdown - ddUsed);
  const ddPctLeft = (ddRemaining / account.trailingDrawdown) * 100;
  const ddBarColor = ruleColor(ddPctLeft);

  const consistencyPct = account.consistencyRulePct ?? 50;
  const bestDay = manual?.bestDayPnl ?? account.bestDayPnl ?? 0;
  const consistencyMax = profit > 0 ? (profit * consistencyPct) / 100 : 0;
  const consistencyOk = profit <= 0 || bestDay <= consistencyMax;

  const passed = profit >= target;
  const blown = ddRemaining <= 0;
  let statusLabel = "ACTIVE";
  let statusColor = "#00aaff";
  let statusBg = "rgba(0,170,255,0.12)";
  if (blown) {
    statusLabel = "BLOWN — TARGET NOT REACHED";
    statusColor = "#ff3366";
    statusBg = "rgba(255,51,102,0.12)";
  } else if (passed) {
    statusLabel = "TARGET HIT — REQUEST PAYOUT";
    statusColor = "#00ff88";
    statusBg = "rgba(0,255,136,0.12)";
  }

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: account.firmAccent + "20", color: account.firmAccent }}
          >
            {account.firmShort}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide">
                {account.firmName} · ${(account.accountSize / 1000).toFixed(0)}K Rapid
              </h2>
              <span className="text-[10px] text-muted uppercase tracking-wider px-1.5 py-0.5 rounded bg-bg/40 border border-border">
                Evaluation
              </span>
            </div>
            <div className="text-[10px] text-muted font-mono mt-0.5">{account.accountNumber}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Connection chip */}
          {connected ? (
            <button
              type="button"
              onClick={onRefreshClick}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border border-accent/40 bg-accent/10 text-accent hover:bg-accent/15 disabled:opacity-50"
              title="Sync now"
            >
              <RefreshCw size={10} className={syncing ? "animate-spin" : ""} />
              {live ? `Live · ${fmtAge(live.syncedAt)}` : syncing ? "Syncing…" : "Sync"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onConnectClick}
              className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border border-accentBlue/40 bg-accentBlue/10 text-accentBlue hover:bg-accentBlue/15"
            >
              <Plug size={10} />
              Connect Tradovate
            </button>
          )}
          {/* Manual update button — always available regardless of connection */}
          <button
            type="button"
            onClick={onEditClick}
            className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border border-border text-muted hover:text-white hover:border-white/40"
            title={manual ? `Last manual update: ${new Date(manual.updatedAt).toLocaleString()}` : "Update balance manually"}
          >
            <Edit3 size={10} />
            {manual ? "Edit" : "Update Balance"}
          </button>
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border"
            style={{ color: statusColor, borderColor: statusColor + "60", background: statusBg }}
          >
            {blown ? <AlertCircle size={11} /> : passed ? <CheckCircle2 size={11} /> : <Clock size={11} />}
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Sync error banner */}
      {syncError && (
        <div className="mb-4 bg-accentRed/10 border border-accentRed/30 rounded-md p-2.5 text-[11px] text-accentRed flex items-center gap-2">
          <AlertCircle size={11} />
          <span>{syncError}</span>
          <button
            onClick={onConnectClick}
            className="ml-auto underline hover:text-white"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Profit target */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Target size={11} className="text-accent" />
            <span className="text-[10px] uppercase tracking-wider text-muted">Profit Target</span>
          </div>
          <span className="text-sm font-mono font-bold text-accent">
            {fmtMoney(profit, { sign: true })}{" "}
            <span className="text-muted text-xs">/ {fmtMoney(target)}</span>
          </span>
        </div>
        <ProgressBar pct={profitPct} color="#00ff88" />
        <div className="text-[10px] text-muted mt-1">
          {profit >= target
            ? "Target reached — eligible for payout/funded account"
            : `${fmtMoney(target - profit)} remaining to pass`}
        </div>
      </div>

      {/* Drawdown buffer */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Shield size={11} style={{ color: ddBarColor }} />
            <span className="text-[10px] uppercase tracking-wider text-muted">
              Drawdown Buffer ({account.drawdownMode ?? "EOD"})
            </span>
          </div>
          <span className="text-sm font-mono font-bold" style={{ color: ddBarColor }}>
            {fmtMoney(ddRemaining)}{" "}
            <span className="text-muted text-xs">/ {fmtMoney(account.trailingDrawdown)}</span>
          </span>
        </div>
        <ProgressBar pct={ddPctLeft} color={ddBarColor} />
        <div className="text-[10px] text-muted mt-1">
          High-water: {fmtMoney(highWaterMark)} · Current: {fmtMoney(currentBalance)}
        </div>
      </div>

      {/* Consistency */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <TrendingUp size={11} className={consistencyOk ? "text-accent" : "text-accentRed"} />
            <span className="text-[10px] uppercase tracking-wider text-muted">
              Consistency Rule ({consistencyPct}%)
            </span>
          </div>
          <span
            className={`text-xs font-mono font-bold ${consistencyOk ? "text-accent" : "text-accentRed"}`}
          >
            {consistencyOk ? "OK" : "AT RISK"}
          </span>
        </div>
        <div className="text-[10px] text-muted">
          {profit <= 0
            ? "Build profit across multiple days to satisfy the rule"
            : `Best day so far: ${fmtMoney(bestDay)} · Max allowed: ${fmtMoney(consistencyMax)}`}
        </div>
      </div>

      {/* Rule sheet */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 border-t border-border">
        <Stat label="Days Active" value={`${daysActive}`} sub={`Min ${account.evalDaysMin ?? 1} to pass`} />
        <Stat
          label="Max Position"
          value={`${account.maxContracts ?? 0}`}
          sub={account.microScalingRatio ? `${(account.maxContracts ?? 0) * account.microScalingRatio} micros` : "minis"}
        />
        <Stat
          label="Daily DD"
          value={account.dailyLossLimit > 0 ? fmtMoney(account.dailyLossLimit) : "None"}
          sub="Intraday cap"
        />
        <Stat
          label="Realized PnL"
          value={live ? fmtMoney(live.realizedPnL, { sign: true }) : "—"}
          sub={live ? "From Tradovate" : "Connect to sync"}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-panel2/40 border border-border rounded-md px-2.5 py-2">
      <div className="text-[9px] uppercase tracking-wider text-muted">{label}</div>
      <div className="text-sm font-mono font-bold mt-0.5">{value}</div>
      <div className="text-[9px] text-muted mt-0.5">{sub}</div>
    </div>
  );
}

// Match a Tradovate live account back to the seed PropFirmAccount by
// account number. (Same logic as MultiAccountOverview's matcher.)
function findLiveForSeed(
  seedAcc: PropFirmAccount,
  liveAccounts: TradovateAccountSnapshot[],
): LiveBalance | null {
  const match = liveAccounts.find(
    (a) =>
      seedAcc.accountNumber === a.accountName ||
      seedAcc.accountNumber.includes(a.accountName) ||
      a.accountName.includes(seedAcc.accountNumber),
  );
  return match
    ? { cashBalance: match.cashBalance, realizedPnL: match.realizedPnL, syncedAt: new Date() }
    : null;
}

export default function EvaluationProgress() {
  const evals = propAccounts.filter((a) => a.accountType === "EVALUATION");
  const sync = useTradovateSync();
  const [connectOpen, setConnectOpen] = useState(false);
  const [editAcc, setEditAcc] = useState<PropFirmAccount | null>(null);
  // Track manual overrides as a state map keyed by accountNumber so React
  // re-renders when the user saves. Re-reads localStorage on storage events.
  const [overrides, setOverrides] = useState<Record<string, ManualOverride | null>>({});

  useEffect(() => {
    function readAll(): void {
      const next: Record<string, ManualOverride | null> = {};
      for (const acc of evals) {
        next[acc.accountNumber] = loadOverride(acc.accountNumber);
      }
      setOverrides(next);
    }
    readAll();
    const onChange = () => readAll();
    window.addEventListener("storage", onChange);
    window.addEventListener("titanedge:manualBalance", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("titanedge:manualBalance", onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evals.length]);

  if (evals.length === 0) return null;

  return (
    <>
      <div className="space-y-4">
        {evals.map((acc) => {
          const live = findLiveForSeed(acc, sync.accounts);
          const liveWithTimestamp = live && sync.syncedAt
            ? { ...live, syncedAt: sync.syncedAt }
            : live;
          return (
            <EvalCard
              key={acc.id}
              account={acc}
              live={liveWithTimestamp}
              manual={overrides[acc.accountNumber] ?? null}
              syncing={sync.syncing}
              syncError={sync.syncError}
              connected={sync.connected}
              onConnectClick={() => setConnectOpen(true)}
              onRefreshClick={sync.refresh}
              onEditClick={() => setEditAcc(acc)}
            />
          );
        })}
      </div>

      {connectOpen && (
        <ConnectTradovateModal
          onClose={() => setConnectOpen(false)}
          onConnected={() => sync.refresh()}
        />
      )}

      {editAcc && (
        <UpdateBalanceModal
          accountNumber={editAcc.accountNumber}
          accountLabel={`${editAcc.firmName} · $${(editAcc.accountSize / 1000).toFixed(0)}K Rapid`}
          defaultBalance={
            overrides[editAcc.accountNumber]?.currentBalance ?? editAcc.currentBalance
          }
          defaultBestDay={
            overrides[editAcc.accountNumber]?.bestDayPnl ?? editAcc.bestDayPnl ?? 0
          }
          defaultDaysActive={
            overrides[editAcc.accountNumber]?.daysActive ?? editAcc.daysActive
          }
          onClose={() => setEditAcc(null)}
          onSaved={() => {
            // The CustomEvent fired by saveOverride will trigger re-read
          }}
        />
      )}
    </>
  );
}
