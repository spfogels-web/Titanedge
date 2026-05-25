// AI panel data. Defaults to a "no activity yet" zero-state so the
// dashboard reflects reality: the bot hasn't traded anything yet, so
// every stat is 0 / empty / "AWAITING DATA". As trades flow in via the
// /api/webhook + DB the corresponding numbers fill in (Phase 6B will
// move these to derived queries instead of static mock).

export interface Recommendation {
  id: string;
  kind: "insight" | "alert" | "tip";
  title: string;
  body: string;
  timestamp: string;
}

export const recommendations: Recommendation[] = [];

export interface SetupMemory {
  name: string;
  winRate: number;
  trades: number;
  bestSession: string;
  avgProfit: number;
  avgLoss: number;
  expectancy: number;
}

export const memorySetups: SetupMemory[] = [];

export interface PatternRow {
  name: string;
  winRate: number;
  trades: number;
  avgProfit: number;
  avgLoss: number;
  expectancy: number;
  bestSession: string;
  bestVixRange: string;
  freqPerWeek: number;
  status: "hot" | "neutral" | "cold";
}

export const patterns: PatternRow[] = [];

export type MarketRegime =
  | "AWAITING DATA"
  | "TRENDING UP"
  | "TRENDING DOWN"
  | "RANGING"
  | "HIGH VOLATILITY"
  | "LOW VOLATILITY"
  | "CHOP"
  | "BREAKOUT"
  | "LIQUIDITY HUNT";

export interface RegimeSnapshot {
  regime: MarketRegime;
  confidence: number;          // 0-100
  description: string;
  recommended: string;
}

export const currentRegime: RegimeSnapshot = {
  regime: "AWAITING DATA",
  confidence: 0,
  description:
    "No bot trades yet. Market regime analysis activates after the first signal fires via the TradingView webhook. Connect a Pine alert or place trades to start training the model.",
  recommended:
    "Send a test signal from TradingView, or place a manual trade to populate the engine.",
};

export interface SequenceStep {
  label: string;
  value: string;
  passed: boolean;
}

// Empty by default — engine waits for the first market scan
export const currentSequence: SequenceStep[] = [];
export const currentSequenceConfidence = 0;

export interface MissedWinner {
  symbol: string;
  side: "LONG" | "SHORT";
  time: string;
  pointsAvailable: number;
  scoreFired: number;
  scoreNeeded: number;
  reason: string;
}

export const missedWinners: MissedWinner[] = [];

export interface AIBrainStat {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  helper?: string;
}

// All zeros — the bot hasn't traded anything yet. Numbers will fill in
// as real trades flow through /api/webhook into the trades table.
export const brainStats: AIBrainStat[] = [
  { label: "Trades analyzed",      value: "0", trend: "flat", helper: "Bot is idle" },
  { label: "Patterns tracked",     value: "0", trend: "flat", helper: "Awaiting trades" },
  { label: "Memory entries",       value: "0", trend: "flat", helper: "Awaiting trades" },
  { label: "Active correlations",  value: "0", trend: "flat", helper: "Need 20+ trades" },
  { label: "Confidence accuracy",  value: "—", trend: "flat", helper: "Awaiting trades" },
  { label: "Adaptation cycles",    value: "0", trend: "flat", helper: "Awaiting trades" },
];
