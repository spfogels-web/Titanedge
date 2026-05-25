"use client";
import { Activity, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { useStats } from "@/lib/hooks/useStats";
import { useTrades } from "@/lib/hooks/useTrades";
import { useAccount } from "@/lib/hooks/useAccount";

function fmtUsd(n: number, opts: { sign?: boolean } = {}): string {
  const sign = opts.sign && n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function LiveTradesHero() {
  const { data: statsData } = useStats();
  const { data: tradesData } = useTrades({ status: "OPEN" });
  const { data: accountData } = useAccount();

  const todayPnl = statsData?.stats.today_pnl ?? 0;
  const todayTrades = statsData?.stats.today_trades ?? 0;
  const openTrades = tradesData?.trades ?? [];
  const openCount = openTrades.length;
  const balance = accountData?.account.balance ?? 0;

  // Estimate dollars at risk on open positions: sum of |entry - stop| × multiplier × qty.
  // We use the same multiplier table the webhook uses.
  const MULTIPLIERS: Record<string, number> = {
    MNQ: 2, NQ: 20, MES: 5, ES: 50, MYM: 0.5, YM: 5,
    M2K: 5, RTY: 50, MGC: 10, GC: 100, MCL: 100, CL: 1000,
  };
  function baseSymbol(s: string): string {
    return s.replace(/\d+!$/, "").replace(/[FGHJKMNQUVXZ]\d{1,2}$/i, "").toUpperCase();
  }
  const atRisk = openTrades.reduce((acc, t) => {
    const entry = t.entry_price != null ? Number(t.entry_price) : null;
    const stop  = t.stop_price  != null ? Number(t.stop_price)  : null;
    if (entry == null || stop == null) return acc;
    const mult = MULTIPLIERS[baseSymbol(t.symbol)];
    if (mult == null) return acc;
    return acc + Math.abs(entry - stop) * t.quantity * mult;
  }, 0);

  const pnlGood = todayPnl >= 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border p-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(0,255,136,0.08) 0%, rgba(0,170,255,0.05) 50%, rgba(170,80,255,0.06) 100%), #13131a",
      }}
    >
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${pnlGood ? "rgba(0,255,136,0.18)" : "rgba(255,51,102,0.18)"}, transparent 65%)` }}
      />

      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
        <HeroStat
          icon={TrendingUp}
          label="Today's P&L"
          value={fmtUsd(todayPnl, { sign: true })}
          valueColor={pnlGood ? "text-accent" : "text-accentRed"}
          sub={`${todayTrades} trade${todayTrades === 1 ? "" : "s"} today`}
        />
        <HeroStat
          icon={Activity}
          label="Open Positions"
          value={String(openCount)}
          valueColor={openCount > 0 ? "text-accent" : "text-muted"}
          sub={openCount === 0 ? "Flat" : openTrades.map((t) => t.symbol).join(" · ")}
          pulse={openCount > 0}
        />
        <HeroStat
          icon={AlertTriangle}
          label="Capital at Risk"
          value={atRisk > 0 ? fmtUsd(atRisk) : "—"}
          valueColor={atRisk > 0 ? "text-gold" : "text-muted"}
          sub={
            atRisk > 0 && balance > 0
              ? `${((atRisk / balance) * 100).toFixed(2)}% of account`
              : "No open exposure"
          }
        />
        <HeroStat
          icon={Zap}
          label="Account Balance"
          value={accountData ? fmtUsd(balance) : "—"}
          valueColor="text-white"
          sub={
            accountData
              ? `Equity ${fmtUsd(accountData.account.equity)}`
              : "Loading…"
          }
        />
      </div>
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  valueColor,
  sub,
  pulse = false,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  valueColor: string;
  sub: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase tracking-wider">
        {pulse ? (
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        ) : (
          <Icon size={11} />
        )}
        {label}
      </div>
      <div className={`text-2xl md:text-3xl font-bold font-mono leading-none ${valueColor}`}>
        {value}
      </div>
      <div className="text-[11px] text-muted mt-0.5 truncate">{sub}</div>
    </div>
  );
}
