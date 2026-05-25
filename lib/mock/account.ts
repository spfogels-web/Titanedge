// Mock account snapshot + You-vs-Bot comparison data. Phase 6A.6 will
// derive these from a `source` column on trades + an account_snapshots
// table.

export interface AccountSnapshot {
  accountName: string;        // "spfogels USD"
  source: "TradingView Paper" | "Tradovate" | "NinjaTrader" | "Manual";
  asOf: string;               // "Just now" or ISO
  balance: number;
  equity: number;
  realizedPnl: number;
  unrealizedPnl: number;
  accountMargin: number;
  availableFunds: number;
  ordersMargin: number;
  marginBufferPct: number;    // 0-100
  session: string;            // "RTH" / "ETH"
}

// Mirrors the screenshot the user shared.
export const accountSnapshot: AccountSnapshot = {
  accountName: "spfogels USD",
  source: "TradingView Paper",
  asOf: "Just now",
  balance: 100454.0,
  equity: 100454.0,
  realizedPnl: 454.0,
  unrealizedPnl: 0,
  accountMargin: 0,
  availableFunds: 100454.0,
  ordersMargin: 29593.0,
  marginBufferPct: 100,
  session: "RTH",
};

// ===== You vs Bot =====

export interface TraderStats {
  label: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;        // 0-100
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  biggestWin: number;
  biggestLoss: number;
  expectancy: number;
  profitFactor: number;
  avgHoldMinutes: number;
}

export const botStats: TraderStats = {
  label: "TitanEdge Bot",
  trades: 28,
  wins: 20,
  losses: 8,
  winRate: 71.4,
  totalPnl: 3140.00,
  avgWin: 210,
  avgLoss: 95,
  biggestWin: 260,
  biggestLoss: 130,
  expectancy: 84.4,
  profitFactor: 2.21,
  avgHoldMinutes: 18,
};

export const userStats: TraderStats = {
  label: "Your Calls",
  trades: 14,
  wins: 9,
  losses: 5,
  winRate: 64.3,
  totalPnl: 1820.00,
  avgWin: 285,
  avgLoss: 215,
  biggestWin: 450,
  biggestLoss: 280,
  expectancy: 130.0,
  profitFactor: 1.32,
  avgHoldMinutes: 42,
};

// Equity curve overlay points — 30 sessions of cumulative P&L.
export interface CurvePoint {
  label: string;
  bot: number;
  user: number;
}

export const equityOverlay: CurvePoint[] = (() => {
  const labels = [
    "Apr 18","Apr 19","Apr 20","Apr 21","Apr 22","Apr 23","Apr 24","Apr 25","Apr 26","Apr 27",
    "Apr 28","Apr 29","Apr 30","May 1","May 2","May 3","May 5","May 6","May 7","May 8",
    "May 9","May 10","May 12","May 13","May 14","May 15","May 16","May 17","May 18","May 19",
  ];
  // Hand-picked daily deltas so the totals match botStats / userStats roughly.
  const botDeltas = [120, 90, -80, 220, 180, 240, 60, -140, 200, 280, 110, 230, -40, 180, 320,
                     150, 240, -70, 280, 110, 190, 320, 140, 230, -60, 180, 270, 220, 320, 210];
  const userDeltas = [180,-120, 60, 280,-220,  90,-180, 220, 410,-280, 110,-160, 320,-110, 230,
                       80,-280, 360,-150, 290, 120,-220, 410,-180, 240,-310, 280,-90, 250,-120];
  let bot = 0;
  let user = 0;
  return labels.map((label, i) => {
    bot += botDeltas[i];
    user += userDeltas[i];
    return { label, bot, user };
  });
})();

// Per-setup breakdown for the comparison page.
export interface SetupBreakdown {
  setup: string;
  botTrades: number;
  botWinRate: number;
  userTrades: number;
  userWinRate: number;
}

export const setupBreakdown: SetupBreakdown[] = [
  { setup: "Slingshot",           botTrades: 11, botWinRate: 72.7, userTrades: 3, userWinRate: 66.7 },
  { setup: "Pivot Bounce",        botTrades:  9, botWinRate: 66.7, userTrades: 4, userWinRate: 75.0 },
  { setup: "Trend Continuation",  botTrades:  5, botWinRate: 80.0, userTrades: 2, userWinRate: 50.0 },
  { setup: "EMA Reclaim",         botTrades:  2, botWinRate: 50.0, userTrades: 0, userWinRate: 0    },
  { setup: "Liquidity Sweep",     botTrades:  1, botWinRate: 100,  userTrades: 1, userWinRate: 100  },
  { setup: "VIX Divergence",      botTrades:  0, botWinRate: 0,    userTrades: 2, userWinRate: 100  },
  { setup: "Manual / Discretion", botTrades:  0, botWinRate: 0,    userTrades: 2, userWinRate: 50.0 },
];

// AI-generated insight bullets for the comparison view.
export const comparisonInsights: string[] = [
  "Your average WIN ($285) is 36% bigger than the bot's ($210) — you let winners run further.",
  "Your average LOSS ($215) is 2.3× the bot's ($95) — you're not cutting losers as fast.",
  "Bot wins by consistency (72% WR, expectancy $84). You win by magnitude (64% WR, expectancy $130).",
  "VIX Divergence trades: you took 2, the bot took 0 (filter didn't fire). You won both. Consider lowering bot's VIX threshold.",
  "Trend Continuation: bot 80% WR over 5 trades. You: 50% over 2. Defer to the bot here.",
  "Your holds avg 42 minutes vs bot's 18 — you're swinging, bot is scalping. Two different games.",
];
