export type TradeSide = "LONG" | "SHORT";
export type TradeStatus = "OPEN" | "CLOSED" | "CANCELED";
export type TradeSource = "BOT" | "MANUAL";

// NUMERIC columns come back from pg as strings; we keep that shape and
// convert with Number() at the display layer.
export interface Trade {
  id: number;
  symbol: string;
  side: TradeSide;
  quantity: number;
  entry_price: string | null;
  exit_price: string | null;
  stop_price: string | null;
  target_price: string | null;
  pnl: string | null;
  status: TradeStatus;
  strategy: string | null;
  score: number | null;
  notes: string | null;
  source: TradeSource;
  opened_at: string;
  closed_at: string | null;
}

export interface Stats {
  // Counts / totals
  total_pnl: number;
  wins: number;
  losses: number;
  win_rate: number;          // percent 0-100
  today_pnl: number;
  today_trades: number;
  active_trades: number;
  total_trades: number;      // wins + losses (closed)

  // Aggregates added in 6A.6
  gross_profit: number;      // sum of positive pnl
  gross_loss: number;        // sum of negative pnl (returned as negative number)
  biggest_win: number;
  biggest_loss: number;
  avg_win: number;
  avg_loss: number;          // negative number
  expectancy: number;        // total_pnl / total_trades
  profit_factor: number;     // gross_profit / |gross_loss|
  avg_hold_minutes: number;
}

export interface BotInfo {
  id: number;
  active: boolean;
  strategy: string | null;
  threshold: number | null;
  win_rate: string | null;
  trades_today: number;
  daily_pnl: string;
  trend_cloud: string | null;
  updated_at: string;
}

export interface StatsResponse {
  ok: boolean;
  stats: Stats;
  bot: BotInfo | null;
  source?: TradeSource | null;
  error?: string;
}

export interface TradesResponse {
  ok: boolean;
  trades: Trade[];
  error?: string;
}

// Account snapshot derived from account_settings + closed trades.
export interface AccountSnapshot {
  accountName: string;
  source: string;            // e.g. "TradingView Paper"
  startingBalance: number;
  realizedPnl: number;
  unrealizedPnl: number | null;  // null until a market-data feed lands
  balance: number;            // starting + realized
  equity: number;             // balance + unrealized (if known)
  availableFunds: number;
  ordersMargin: number;
  accountMargin: number;
  marginBufferPct: number;    // 0-100
  session: string;
  asOf: string;
}

export interface AccountResponse {
  ok: boolean;
  account: AccountSnapshot;
  error?: string;
}
