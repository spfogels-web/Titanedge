// Brokerage connection metadata for the "Connect Broker" modal. Each entry
// declares what setup fields would be required if we actually wired the
// broker's API. Today this is UI-only with localStorage persistence; real
// OAuth / API auth lands when we add the broker-execution layer.

export interface BrokerField {
  name: string;
  label: string;
  type: "text" | "password" | "url" | "select";
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: { value: string; label: string }[];
}

export type BrokerCategory =
  | "Webhook Bridge"
  | "REST API"
  | "Desktop Bridge"
  | "Native";

export type BrokerStatus = "available" | "coming-soon" | "native";

export interface Broker {
  id: string;
  name: string;
  description: string;
  category: BrokerCategory;
  status: BrokerStatus;
  futures: boolean;
  stocks: boolean;
  initials: string;
  accentColor: string;
  fields: BrokerField[];
  docsUrl?: string;
}

export const brokers: Broker[] = [
  {
    id: "tradingview-paper",
    name: "TradingView Paper",
    description:
      "Built-in simulator. Already routed via your existing Pine alert webhook — no extra setup needed.",
    category: "Native",
    status: "native",
    futures: true,
    stocks: true,
    initials: "TV",
    accentColor: "#00d4b5",
    fields: [],
    docsUrl: "https://www.tradingview.com/support/folders/43000591361-paper-trading/",
  },
  {
    id: "traderspost",
    name: "TradersPost",
    description:
      "Webhook bridge to Tradovate, NinjaTrader, TradeStation, Interactive Brokers, and others. Easiest path to live execution from Pine alerts.",
    category: "Webhook Bridge",
    status: "available",
    futures: true,
    stocks: true,
    initials: "TP",
    accentColor: "#7c3aed",
    fields: [
      {
        name: "webhookUrl",
        label: "Strategy webhook URL",
        type: "url",
        placeholder: "https://webhooks.traderspost.io/trading/webhook/...",
        required: true,
        helpText: "From TradersPost → your Strategy → Webhook URL",
      },
      {
        name: "downstreamBroker",
        label: "Downstream broker",
        type: "select",
        required: true,
        options: [
          { value: "tradovate", label: "Tradovate" },
          { value: "ninjatrader", label: "NinjaTrader" },
          { value: "tradestation", label: "TradeStation" },
          { value: "interactive", label: "Interactive Brokers" },
          { value: "alpaca", label: "Alpaca" },
        ],
      },
      {
        name: "accountType",
        label: "Account type",
        type: "select",
        options: [
          { value: "paper", label: "Paper / Sim" },
          { value: "live", label: "Live" },
        ],
      },
    ],
    docsUrl: "https://traderspost.io/docs",
  },
  {
    id: "tradovate",
    name: "Tradovate",
    description:
      "Direct REST API for futures. Low commissions, popular with retail algo traders.",
    category: "REST API",
    status: "coming-soon",
    futures: true,
    stocks: false,
    initials: "Tv",
    accentColor: "#0ea5e9",
    fields: [
      { name: "username", label: "Username",  type: "text",     required: true },
      { name: "password", label: "Password",  type: "password", required: true },
      { name: "apiKey",   label: "API Key (cid)", type: "text", required: true },
      { name: "apiSecret",label: "API Secret",   type: "password", required: true },
      { name: "deviceId", label: "Device ID",    type: "text", placeholder: "auto-generated" },
      {
        name: "environment",
        label: "Environment",
        type: "select",
        options: [
          { value: "demo", label: "Demo / Sim" },
          { value: "live", label: "Live" },
        ],
      },
    ],
    docsUrl: "https://api.tradovate.com",
  },
  {
    id: "ninjatrader",
    name: "NinjaTrader 8",
    description:
      "Local ATM / Strategy automation. Requires the NT8 client running on your machine + a bridge service.",
    category: "Desktop Bridge",
    status: "coming-soon",
    futures: true,
    stocks: true,
    initials: "NT",
    accentColor: "#dc2626",
    fields: [
      { name: "host", label: "NT8 host", type: "text", placeholder: "127.0.0.1", required: true },
      { name: "port", label: "NT8 port", type: "text", placeholder: "36974",     required: true },
      { name: "account", label: "Account name", type: "text", required: true },
      {
        name: "atmStrategy",
        label: "ATM strategy",
        type: "text",
        placeholder: "TitanEdge_ATM_1",
        helpText: "Saved ATM strategy in NT8 that handles SL/TP/trail",
      },
    ],
    docsUrl: "https://ninjatrader.com/support/helpGuides/nt8/",
  },
  {
    id: "tradestation",
    name: "TradeStation",
    description: "REST API with futures + equities. OAuth 2.0 auth.",
    category: "REST API",
    status: "coming-soon",
    futures: true,
    stocks: true,
    initials: "TS",
    accentColor: "#f59e0b",
    fields: [
      { name: "clientId",     label: "Client ID",     type: "text",     required: true },
      { name: "clientSecret", label: "Client Secret", type: "password", required: true },
      {
        name: "environment",
        label: "Environment",
        type: "select",
        options: [
          { value: "sim",  label: "Simulator" },
          { value: "live", label: "Live" },
        ],
      },
    ],
    docsUrl: "https://api.tradestation.com/docs",
  },
  {
    id: "interactive",
    name: "Interactive Brokers",
    description:
      "TWS / IB Gateway API for stocks, futures, options. Requires TWS or IB Gateway running locally.",
    category: "Desktop Bridge",
    status: "coming-soon",
    futures: true,
    stocks: true,
    initials: "IB",
    accentColor: "#b91c1c",
    fields: [
      { name: "host",     label: "TWS host", type: "text", placeholder: "127.0.0.1", required: true },
      { name: "port",     label: "TWS port", type: "text", placeholder: "7497 (paper) / 7496 (live)", required: true },
      { name: "clientId", label: "Client ID", type: "text", placeholder: "1", required: true },
      { name: "account",  label: "Account",  type: "text", placeholder: "DU1234567 / U1234567", required: true },
    ],
    docsUrl: "https://interactivebrokers.github.io/tws-api/",
  },
  {
    id: "amp-rithmic",
    name: "AMP Futures (Rithmic / CQG)",
    description:
      "AMP routes orders via Rithmic or CQG — the same backend Topstep and Apex use. Best for prop accounts.",
    category: "Desktop Bridge",
    status: "coming-soon",
    futures: true,
    stocks: false,
    initials: "AMP",
    accentColor: "#06b6d4",
    fields: [
      {
        name: "gateway",
        label: "Gateway",
        type: "select",
        required: true,
        options: [
          { value: "rithmic", label: "Rithmic" },
          { value: "cqg",     label: "CQG" },
        ],
      },
      { name: "username", label: "Username", type: "text",     required: true },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "account",  label: "Account number", type: "text", required: true },
    ],
    docsUrl: "https://www.ampfutures.com/",
  },
  {
    id: "capitalise",
    name: "Capitalise.ai",
    description:
      "Plain-English strategy automation with webhook bridges to brokers. Alternative to TradersPost.",
    category: "Webhook Bridge",
    status: "available",
    futures: true,
    stocks: true,
    initials: "Cai",
    accentColor: "#8b5cf6",
    fields: [
      { name: "webhookUrl", label: "Webhook URL", type: "url",      required: true },
      { name: "apiKey",     label: "API Key",     type: "password", required: false },
    ],
    docsUrl: "https://www.capitalise.ai/",
  },
];

export interface ConnectedBroker {
  brokerId: string;
  brokerName: string;
  brokerInitials: string;
  brokerAccent: string;
  connectedAt: string;
}
