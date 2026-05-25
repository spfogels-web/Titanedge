// Prop firm registry — what TitanEdge can realistically connect to today
// vs what requires manual entry or a future integration.
//
// Honest framing for each firm:
//   - "Auto-Sync API"     = we can READ balance + DD via a public API
//   - "Webhook Bridge"    = we can ROUTE orders via TradersPost / similar
//   - "Bot-Tagged Manual" = trades fired by the bot tag this account; we
//                           count them toward the account's stats, but
//                           balance is manual
//   - "Manual Entry"      = user pastes account state from broker dashboard
//
// Most futures prop firms use Rithmic, Tradovate, or CQG under the hood.
// Tradovate has a real REST API (so TopstepX can auto-sync). Rithmic/CQG
// require licensed institutional access — for retail, "manual + bot-tagged"
// is the realistic path until we build a desktop bridge.

export type ConnectionMethod =
  | "Auto-Sync API"
  | "Webhook Bridge"
  | "Bot-Tagged Manual"
  | "Manual Entry"
  | "NinjaTrader Bridge";

export type FirmStatus = "available" | "beta" | "coming-soon" | "manual-only";

export type FirmAccountType = "EVALUATION" | "FUNDED" | "XFA" | "LIVE" | "PRO";

export interface PropFirm {
  id: string;
  name: string;
  shortName: string;
  accent: string;
  accountSizes: number[];        // common account sizes offered (USD)
  accountTypes: FirmAccountType[];
  connectionMethods: ConnectionMethod[];
  primaryConnection: ConnectionMethod;
  backend: "Rithmic" | "Tradovate" | "CQG" | "Proprietary" | "MetaTrader" | "Mixed";
  autoSync: boolean;             // can we READ balance + DD + positions?
  autoRoute: boolean;            // can we ROUTE orders to this firm?
  status: FirmStatus;
  notes: string;                 // honest, plain-English explanation
  websiteUrl?: string;
}

export const propFirms: PropFirm[] = [
  // ===== Tier A: full or partial integration available =====
  {
    id: "topstep",
    name: "TopstepX",
    shortName: "TS",
    accent: "#ff8c42",
    accountSizes: [50000, 100000, 150000],
    accountTypes: ["EVALUATION", "FUNDED"],
    connectionMethods: ["Auto-Sync API", "Webhook Bridge", "Bot-Tagged Manual"],
    primaryConnection: "Auto-Sync API",
    backend: "Tradovate",
    autoSync: true,
    autoRoute: true,
    status: "available",
    notes: "Backend is Tradovate. We can pull balance/DD/positions via Tradovate REST and route orders through the same API. OAuth flow on connect.",
    websiteUrl: "https://www.topstep.com",
  },
  {
    id: "tradovate-direct",
    name: "Tradovate (direct)",
    shortName: "TVD",
    accent: "#0ea5e9",
    accountSizes: [],   // any
    accountTypes: ["LIVE", "PRO"],
    connectionMethods: ["Auto-Sync API", "Webhook Bridge"],
    primaryConnection: "Auto-Sync API",
    backend: "Tradovate",
    autoSync: true,
    autoRoute: true,
    status: "available",
    notes: "Personal Tradovate account (not via a prop firm). Full REST API access for read + route.",
    websiteUrl: "https://www.tradovate.com",
  },
  {
    id: "leeloo",
    name: "Leeloo Trading",
    shortName: "LEE",
    accent: "#06b6d4",
    accountSizes: [25000, 50000, 100000, 150000, 250000],
    accountTypes: ["EVALUATION", "FUNDED"],
    connectionMethods: ["Auto-Sync API", "Webhook Bridge", "Bot-Tagged Manual"],
    primaryConnection: "Auto-Sync API",
    backend: "Tradovate",
    autoSync: true,
    autoRoute: true,
    status: "beta",
    notes: "Routes through Tradovate. Auto-sync works once you connect Tradovate credentials.",
    websiteUrl: "https://leeloo-trading.com",
  },

  // ===== Tier B: order routing possible, balance is manual =====
  {
    id: "apex",
    name: "Apex Trader Funding",
    shortName: "APX",
    accent: "#00ff88",
    accountSizes: [25000, 50000, 75000, 100000, 150000, 250000, 300000],
    accountTypes: ["EVALUATION", "XFA"],
    connectionMethods: ["Bot-Tagged Manual", "Webhook Bridge", "NinjaTrader Bridge", "Manual Entry"],
    primaryConnection: "Bot-Tagged Manual",
    backend: "Rithmic",
    autoSync: false,
    autoRoute: true,
    status: "available",
    notes: "Rithmic backend — no public account-read API. Route orders via Tradovate or NinjaTrader. You paste your balance/DD periodically; trades fired by the bot get tagged to your account automatically.",
    websiteUrl: "https://apextraderfunding.com",
  },
  {
    id: "amp",
    name: "AMP Futures",
    shortName: "AMP",
    accent: "#06b6d4",
    accountSizes: [],
    accountTypes: ["LIVE", "EVALUATION"],
    connectionMethods: ["NinjaTrader Bridge", "Webhook Bridge", "Manual Entry"],
    primaryConnection: "NinjaTrader Bridge",
    backend: "Rithmic",
    autoSync: false,
    autoRoute: true,
    status: "beta",
    notes: "Routes via Rithmic / CQG. Local NinjaTrader bridge for order routing; account state is manual.",
    websiteUrl: "https://www.ampfutures.com",
  },

  // ===== Tier C: manual entry + bot-tagged today; integration on roadmap =====
  {
    id: "tpt",
    name: "Take Profit Trader",
    shortName: "TPT",
    accent: "#aa50ff",
    accountSizes: [25000, 50000, 75000, 100000, 150000],
    accountTypes: ["EVALUATION", "FUNDED", "PRO"],
    connectionMethods: ["Bot-Tagged Manual", "Manual Entry"],
    primaryConnection: "Bot-Tagged Manual",
    backend: "Proprietary",
    autoSync: false,
    autoRoute: false,
    status: "manual-only",
    notes: "Proprietary platform with no public account API. Track via bot-tagged trades + manual balance updates.",
    websiteUrl: "https://takeprofittrader.com",
  },
  {
    id: "earn2trade",
    name: "Earn2Trade",
    shortName: "E2T",
    accent: "#10b981",
    accountSizes: [25000, 50000, 100000, 150000, 200000],
    accountTypes: ["EVALUATION", "FUNDED"],
    connectionMethods: ["Bot-Tagged Manual", "NinjaTrader Bridge", "Manual Entry"],
    primaryConnection: "Bot-Tagged Manual",
    backend: "Mixed",
    autoSync: false,
    autoRoute: false,
    status: "manual-only",
    notes: "Multi-backend (Finamark / NinjaTrader). Manual balance entry; routing via NT8 bridge possible.",
    websiteUrl: "https://www.earn2trade.com",
  },
  {
    id: "mff",
    name: "MyFundedFutures",
    shortName: "MFF",
    accent: "#f59e0b",
    accountSizes: [50000, 100000, 150000],
    accountTypes: ["EVALUATION", "FUNDED"],
    connectionMethods: ["Bot-Tagged Manual", "Manual Entry"],
    primaryConnection: "Bot-Tagged Manual",
    backend: "Rithmic",
    autoSync: false,
    autoRoute: false,
    status: "manual-only",
    notes: "Rithmic backend. Order routing via Tradovate or NT8 possible; account state is manual.",
    websiteUrl: "https://myfundedfutures.com",
  },
  {
    id: "bluesky",
    name: "BluSky Trading",
    shortName: "BLU",
    accent: "#3b82f6",
    accountSizes: [25000, 50000, 100000],
    accountTypes: ["EVALUATION", "FUNDED"],
    connectionMethods: ["Bot-Tagged Manual", "Manual Entry"],
    primaryConnection: "Manual Entry",
    backend: "Rithmic",
    autoSync: false,
    autoRoute: false,
    status: "manual-only",
    notes: "Rithmic-based. Manual entry today.",
    websiteUrl: "https://blusky.trading",
  },
  {
    id: "tradingpit",
    name: "The Trading Pit",
    shortName: "TTP",
    accent: "#dc2626",
    accountSizes: [25000, 50000, 100000, 200000, 500000],
    accountTypes: ["EVALUATION", "FUNDED"],
    connectionMethods: ["Manual Entry"],
    primaryConnection: "Manual Entry",
    backend: "Mixed",
    autoSync: false,
    autoRoute: false,
    status: "manual-only",
    notes: "Multi-asset firm (futures, FX, stocks). Manual entry only for now.",
    websiteUrl: "https://thetradingpit.com",
  },
  {
    id: "fundednext",
    name: "FundedNext",
    shortName: "FND",
    accent: "#8b5cf6",
    accountSizes: [10000, 25000, 50000, 100000, 200000],
    accountTypes: ["EVALUATION", "FUNDED"],
    connectionMethods: ["Manual Entry"],
    primaryConnection: "Manual Entry",
    backend: "MetaTrader",
    autoSync: false,
    autoRoute: false,
    status: "manual-only",
    notes: "Forex/CFD focus on MT4/MT5. Futures support limited. Manual entry today.",
    websiteUrl: "https://fundednext.com",
  },

  // ===== Tier D: roadmap =====
  {
    id: "maverick",
    name: "Maverick Trading",
    shortName: "MAV",
    accent: "#f97316",
    accountSizes: [10000, 25000, 50000, 100000],
    accountTypes: ["EVALUATION", "FUNDED"],
    connectionMethods: ["Manual Entry"],
    primaryConnection: "Manual Entry",
    backend: "Proprietary",
    autoSync: false,
    autoRoute: false,
    status: "coming-soon",
    notes: "On roadmap for manual-tracking support.",
    websiteUrl: "https://maverick-trading.com",
  },
  {
    id: "tickticktrader",
    name: "TickTick Trader",
    shortName: "TTT",
    accent: "#14b8a6",
    accountSizes: [25000, 50000, 100000, 150000],
    accountTypes: ["EVALUATION", "FUNDED"],
    connectionMethods: ["Manual Entry"],
    primaryConnection: "Manual Entry",
    backend: "Rithmic",
    autoSync: false,
    autoRoute: false,
    status: "coming-soon",
    notes: "Newer firm. On roadmap.",
    websiteUrl: "https://tickticktrader.com",
  },
];

export interface RegistryRollup {
  total: number;
  autoSyncCount: number;
  routeCount: number;
  manualOnly: number;
}

export function registryRollup(): RegistryRollup {
  return {
    total: propFirms.length,
    autoSyncCount: propFirms.filter((f) => f.autoSync).length,
    routeCount: propFirms.filter((f) => f.autoRoute).length,
    manualOnly: propFirms.filter((f) => !f.autoSync && !f.autoRoute).length,
  };
}
