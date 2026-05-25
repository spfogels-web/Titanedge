// Prop firm account portfolio. When a real prop_accounts DB table lands,
// this file becomes a thin wrapper around an API fetch.
//
// Sean's real accounts live here. Add new ones via the +Add Account modal
// once we wire the modal to persist (currently UI-only).

export type AccountType = "EVALUATION" | "FUNDED" | "XFA" | "LIVE";
export type AccountStatus = "ACTIVE" | "PASSED" | "FAILED" | "PAYOUT_PENDING";
export type DrawdownMode = "EOD" | "INTRADAY" | "STATIC";

export interface PropFirmAccount {
  id: string;
  firmName: string;
  firmShort: string;          // "MFF", "APX", "TS", etc.
  firmAccent: string;         // hex
  accountSize: number;        // initial capital
  accountType: AccountType;
  accountNumber: string;      // user-facing account number from the firm
  brokerUsername?: string;    // Tradovate/Rithmic login (don't store password client-side)
  status: AccountStatus;
  currentBalance: number;
  highWaterMark: number;
  trailingDrawdown: number;   // max allowed trailing dd in $
  dailyLossLimit: number;     // in $ (0 if firm has no daily DD)
  daysActive: number;
  totalPayouts: number;
  rulesUntouched: number;     // streak days without violation

  // Eval-specific fields (only meaningful when accountType === "EVALUATION")
  profitTarget?: number;       // $ to pass
  consistencyRulePct?: number; // best-day-cap as % of total profit (e.g. 50)
  bestDayPnl?: number;         // for consistency tracking
  maxContracts?: number;       // e.g. 3 minis / 30 micros
  microScalingRatio?: number;  // e.g. 10 for 10:1
  drawdownMode?: DrawdownMode; // EOD vs INTRADAY
  evalDaysMin?: number;        // minimum trading days to pass
  purchasedAt?: string;        // ISO timestamp
}

// === Sean's portfolio ===
// Order of accounts is rendering order (eval at top while it's active).
export const propAccounts: PropFirmAccount[] = [
  {
    id: "mff-25k-rapid-1",
    firmName: "MyFundedFutures",
    firmShort: "MFF",
    firmAccent: "#f59e0b",
    accountSize: 25000,
    accountType: "EVALUATION",
    accountNumber: "MFFUEVRPD607486001",
    brokerUsername: "MFFUbkLiNMNaqc",
    status: "ACTIVE",
    currentBalance: 25000,
    highWaterMark: 25000,
    trailingDrawdown: 1000,
    dailyLossLimit: 0,             // Rapid plan: no intraday daily DD
    daysActive: 0,
    totalPayouts: 0,
    rulesUntouched: 0,
    profitTarget: 1500,
    consistencyRulePct: 50,
    bestDayPnl: 0,
    maxContracts: 3,
    microScalingRatio: 10,
    drawdownMode: "EOD",
    evalDaysMin: 1,
    purchasedAt: "2026-05-24T15:24:00Z",
  },
];

// Derived rollup stats. Computed once and used by both the Overview
// summary and the full table.
export interface PropAccountRollup {
  totalAccounts: number;
  liveCount: number;          // XFA + FUNDED + LIVE
  evaluationCount: number;
  totalCapital: number;
  totalBalance: number;
  totalPayouts: number;
  netProfit: number;          // sum of (balance - size)
  byFirm: Array<{ firmName: string; firmShort: string; accent: string; count: number; capital: number; live: number; }>;
}

export function computeRollup(accounts: PropFirmAccount[]): PropAccountRollup {
  const totalAccounts = accounts.length;
  const live = accounts.filter(
    (a) => a.accountType === "FUNDED" || a.accountType === "XFA" || a.accountType === "LIVE",
  );
  const evals = accounts.filter((a) => a.accountType === "EVALUATION");
  const totalCapital = accounts.reduce((acc, a) => acc + a.accountSize, 0);
  const totalBalance = accounts.reduce((acc, a) => acc + a.currentBalance, 0);
  const totalPayouts = accounts.reduce((acc, a) => acc + a.totalPayouts, 0);
  const netProfit = accounts.reduce((acc, a) => acc + (a.currentBalance - a.accountSize), 0);

  const byFirmMap: Record<string, { firmShort: string; accent: string; count: number; capital: number; live: number }> = {};
  for (const a of accounts) {
    const cur = byFirmMap[a.firmName] ?? { firmShort: a.firmShort, accent: a.firmAccent, count: 0, capital: 0, live: 0 };
    cur.count += 1;
    cur.capital += a.accountSize;
    if (a.accountType === "FUNDED" || a.accountType === "XFA" || a.accountType === "LIVE") cur.live += 1;
    byFirmMap[a.firmName] = cur;
  }
  const byFirm = Object.entries(byFirmMap).map(([firmName, v]) => ({
    firmName,
    firmShort: v.firmShort,
    accent: v.accent,
    count: v.count,
    capital: v.capital,
    live: v.live,
  }));

  return {
    totalAccounts,
    liveCount: live.length,
    evaluationCount: evals.length,
    totalCapital,
    totalBalance,
    totalPayouts,
    netProfit,
    byFirm,
  };
}
