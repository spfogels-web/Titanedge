// Mock market snapshot data for the News page. Phase 6D will replace
// with Finnhub / Polygon live feeds.

export interface FuturesQuote {
  sym: string;
  desc: string;
  price: number;
  change: number;        // % change
  changeAbs: number;     // absolute change in price units
  high: number;
  low: number;
  spark: number[];       // 20 points for sparkline
}

function trend(start: number, drift: number, vol: number, n = 20): number[] {
  const out: number[] = [];
  let cur = start;
  for (let i = 0; i < n; i++) {
    cur += drift + (Math.sin(i * 0.7) * vol);
    out.push(Number(cur.toFixed(2)));
  }
  return out;
}

export const futuresQuotes: FuturesQuote[] = [
  { sym: "ES",  desc: "E-mini S&P 500",    price: 5491.25,  change: 0.45,  changeAbs: 24.50, high: 5495.75, low: 5462.50, spark: trend(5470, 1.1, 3.5) },
  { sym: "NQ",  desc: "E-mini Nasdaq-100", price: 19241.50, change: 0.62,  changeAbs: 119.00, high: 19255.00, low: 19102.25, spark: trend(19100, 7.5, 15) },
  { sym: "MNQ", desc: "Micro Nasdaq-100",  price: 19241.75, change: 0.62,  changeAbs: 119.25, high: 19255.25, low: 19103.00, spark: trend(19100, 7.5, 15) },
  { sym: "MGC", desc: "Micro Gold",        price: 2347.20,  change: -0.18, changeAbs: -4.20, high: 2358.40, low: 2344.10, spark: trend(2352, -0.25, 2.0) },
  { sym: "MCL", desc: "Micro Crude",       price: 74.85,    change: 1.42,  changeAbs: 1.05, high: 75.18, low: 73.62, spark: trend(73.5, 0.08, 0.25) },
  { sym: "VIX", desc: "CBOE Volatility",   price: 14.18,    change: -2.81, changeAbs: -0.41, high: 14.62, low: 14.05, spark: trend(14.5, -0.02, 0.12) },
];

export interface Mag7Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;        // %
  aboveEma50: boolean;
  spark: number[];
}

export const mag7Stocks: Mag7Stock[] = [
  { ticker: "AAPL",  name: "Apple",     price: 232.45, change: 1.24,  aboveEma50: true,  spark: trend(228, 0.25, 0.4) },
  { ticker: "MSFT",  name: "Microsoft", price: 412.18, change: 0.82,  aboveEma50: true,  spark: trend(408, 0.22, 0.6) },
  { ticker: "NVDA",  name: "Nvidia",    price: 142.78, change: 3.45,  aboveEma50: true,  spark: trend(135, 0.41, 0.6) },
  { ticker: "AMZN",  name: "Amazon",    price: 198.32, change: 0.55,  aboveEma50: true,  spark: trend(196, 0.12, 0.4) },
  { ticker: "META",  name: "Meta",      price: 615.21, change: 1.92,  aboveEma50: true,  spark: trend(605, 0.55, 1.0) },
  { ticker: "GOOGL", name: "Alphabet",  price: 178.45, change: -0.28, aboveEma50: true,  spark: trend(179, -0.03, 0.4) },
  { ticker: "TSLA",  name: "Tesla",     price: 358.12, change: -1.15, aboveEma50: false, spark: trend(364, -0.32, 1.2) },
];

// Sentiment 0..100. 0 = extreme fear, 100 = extreme greed.
export interface SentimentSnapshot {
  score: number;
  trend: "rising" | "falling" | "flat";
  bullishPct: number;
  neutralPct: number;
  bearishPct: number;
  components: { label: string; reading: string; bias: "BULL" | "BEAR" | "NEUTRAL" }[];
}

export const sentimentSnapshot: SentimentSnapshot = {
  score: 68,
  trend: "rising",
  bullishPct: 62,
  neutralPct: 24,
  bearishPct: 14,
  components: [
    { label: "VIX direction",      reading: "Falling (14.18)",         bias: "BULL" },
    { label: "Mag 7 breadth",      reading: "6 of 7 above 50 EMA",     bias: "BULL" },
    { label: "ES vs 50 EMA",       reading: "Above by 1.2%",           bias: "BULL" },
    { label: "NYSE Advance/Decline", reading: "3.2:1 advancing",       bias: "BULL" },
    { label: "Put/Call Ratio",     reading: "0.72 (neutral-bullish)",  bias: "NEUTRAL" },
    { label: "10Y Yield",          reading: "4.21% (stable)",          bias: "NEUTRAL" },
    { label: "USD Index",          reading: "Weakening (-0.15%)",      bias: "BULL" },
    { label: "Crude Oil",          reading: "Rising 1.4%",             bias: "NEUTRAL" },
  ],
};

// Trending stories — top 3 hero stories, denser than headlines feed.
export interface TrendingStory {
  id: string;
  source: string;
  category: string;
  title: string;
  preview: string;
  impactLevel: "HIGH" | "MED" | "LOW";
  bias: "BULL" | "BEAR" | "NEUTRAL";
  publishedAt: string;
  readTimeMin: number;
  url: string;
  symbols: string[];
}

export const trendingStories: TrendingStory[] = [
  {
    id: "ts-1",
    source: "Bloomberg",
    category: "Federal Reserve",
    title: "FOMC Minutes Signal Cautious Path Forward on Rates",
    preview:
      "Today's release suggests the committee remains data-dependent, with most members favoring patience. Pre-release MNQ futures already up 0.6% — historically a 'sell the news' setup forms when prints align with expectations.",
    impactLevel: "HIGH",
    bias: "NEUTRAL",
    publishedAt: "8m ago",
    readTimeMin: 4,
    url: "https://www.bloomberg.com/markets",
    symbols: ["MNQ", "ES", "ZN"],
  },
  {
    id: "ts-2",
    source: "Reuters",
    category: "Tech / AI",
    title: "Nvidia Hits Fresh ATH on Enterprise GPU Demand Surge",
    preview:
      "NVDA +3.4% with broker upgrades flowing in. Mag 7 breadth strengthens to 6/7 bullish. Trend continuation setups on NQ favored while this momentum persists; watch for divergence into close.",
    impactLevel: "MED",
    bias: "BULL",
    publishedAt: "27m ago",
    readTimeMin: 3,
    url: "https://www.reuters.com/technology/",
    symbols: ["NQ", "MNQ", "NVDA"],
  },
  {
    id: "ts-3",
    source: "CNBC",
    category: "Macro / Volatility",
    title: "VIX Approaches 14-Handle as Risk-On Tone Persists",
    preview:
      "Volatility index dips for a fifth straight session. Slingshot setups historically post 72% win rate in declining-VIX regimes — favored over counter-trend shorts until VIX flips back above 15.",
    impactLevel: "MED",
    bias: "BULL",
    publishedAt: "1h ago",
    readTimeMin: 2,
    url: "https://www.cnbc.com/markets/",
    symbols: ["VX", "ES"],
  },
];
