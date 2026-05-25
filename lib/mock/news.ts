// Mock news + economic-event data for the /news page. Phase 5C/6D will
// replace this with real Finnhub / NewsAPI fetches + a Claude-generated
// morning briefing.

export type ImpactLevel = "HIGH" | "MED" | "LOW";

export interface CalendarEvent {
  timeEst: string;        // "08:30 AM"
  country: string;        // "US"
  title: string;
  impact: ImpactLevel;
  forecast?: string;
  previous?: string;
  actual?: string;
}

export const todaysCalendar: CalendarEvent[] = [
  { timeEst: "08:30 AM", country: "US", title: "Initial Jobless Claims", impact: "HIGH", forecast: "220K", previous: "215K", actual: "218K" },
  { timeEst: "08:30 AM", country: "US", title: "Continuing Jobless Claims", impact: "MED",  forecast: "1.87M", previous: "1.85M", actual: "1.86M" },
  { timeEst: "10:00 AM", country: "US", title: "Existing Home Sales (Apr)",  impact: "MED",  forecast: "4.20M", previous: "4.19M" },
  { timeEst: "10:30 AM", country: "US", title: "Natural Gas Storage",        impact: "LOW",  forecast: "+95B",  previous: "+87B" },
  { timeEst: "01:00 PM", country: "US", title: "10-Year Treasury Auction",   impact: "MED" },
  { timeEst: "02:00 PM", country: "US", title: "FOMC Meeting Minutes",       impact: "HIGH" },
  { timeEst: "04:30 PM", country: "US", title: "Fed Balance Sheet",          impact: "LOW" },
];

export interface NewsHeadline {
  id: string;
  source: string;
  headline: string;
  summary: string;
  timeAgo: string;
  impact: ImpactLevel;
  symbols?: string[];   // related tickers
  url: string;          // article URL (real news API will fill this; mocks point at source homepage)
}

export const headlines: NewsHeadline[] = [
  {
    id: "n1",
    source: "Bloomberg",
    headline: "Powell signals patience on rate cuts ahead of FOMC minutes",
    summary: "Chair Powell told reporters the FOMC remains data-dependent and is in no hurry to ease policy, ahead of today's 2pm minutes release.",
    timeAgo: "12m",
    impact: "HIGH",
    symbols: ["MNQ", "ES", "ZN"],
    url: "https://www.bloomberg.com/markets",
  },
  {
    id: "n2",
    source: "Reuters",
    headline: "Nvidia hits new ATH on AI demand outlook",
    summary: "NVDA closed +3.4% after reports of expanded enterprise GPU orders. Mag 7 breadth widens.",
    timeAgo: "35m",
    impact: "MED",
    symbols: ["NQ", "MNQ", "NVDA"],
    url: "https://www.reuters.com/technology/",
  },
  {
    id: "n3",
    source: "CNBC",
    headline: "VIX dips below 14.5 as risk appetite returns",
    summary: "Volatility gauge slides for a fourth straight session as macro headlines turn benign.",
    timeAgo: "1h",
    impact: "MED",
    symbols: ["VX", "ES"],
    url: "https://www.cnbc.com/markets/",
  },
  {
    id: "n4",
    source: "Reuters",
    headline: "Crude jumps 2% on Middle East tensions",
    summary: "Brent and WTI surge after fresh shipping disruptions in the Red Sea. MCL up sharply premarket.",
    timeAgo: "2h",
    impact: "LOW",
    symbols: ["CL", "MCL"],
    url: "https://www.reuters.com/markets/commodities/",
  },
  {
    id: "n5",
    source: "WSJ",
    headline: "Gold steadies above $2,400 after Fed-minutes whisper",
    summary: "MGC futures consolidate as traders position for FOMC minutes and dollar weakness.",
    timeAgo: "3h",
    impact: "MED",
    symbols: ["GC", "MGC"],
    url: "https://www.wsj.com/news/markets",
  },
  {
    id: "n6",
    source: "Bloomberg",
    headline: "ECB hints at June rate decision; EUR firms",
    summary: "Eurozone signals from ECB officials suggest possible cuts; limited spillover to US futures.",
    timeAgo: "4h",
    impact: "LOW",
    symbols: ["6E"],
    url: "https://www.bloomberg.com/markets/currencies",
  },
  {
    id: "n7",
    source: "MarketWatch",
    headline: "Jobless claims tick up modestly, in line",
    summary: "Initial claims at 218K vs 220K consensus. Markets unfazed; small algorithmic buying noted on the print.",
    timeAgo: "5h",
    impact: "MED",
    symbols: ["ES", "MNQ"],
    url: "https://www.marketwatch.com/economy-politics",
  },
];

export interface AIBriefingSection {
  heading: string;
  body: string;
}

export interface AIBriefing {
  generatedAt: string;
  symbol: string;
  overnightTone: string;        // one-line summary
  sections: AIBriefingSection[];
  cautionWindows: string[];
  recommendedBias: "LONG-BIASED" | "SHORT-BIASED" | "NEUTRAL" | "AVOID";
}

export const todaysBriefing: AIBriefing = {
  generatedAt: "Generated 07:30 AM EST",
  symbol: "MNQ / MGC",
  overnightTone:
    "Constructive overnight tone. ES futures +0.4%, NQ +0.6%, VIX -2.8% to 14.32, Mag 7 breadth 6/7 bullish.",
  sections: [
    {
      heading: "Overnight summary",
      body:
        "Equity index futures traded higher in the Asian and European sessions, supported by continued strength in Nvidia (+3.4% after-hours yesterday) and broader AI-related names. Crude crept higher on geopolitical headlines but oil's correlation to index futures remains low this week. VIX continued its grind lower, a fourth consecutive down session, supporting a risk-on tape.",
    },
    {
      heading: "Today's catalysts",
      body:
        "The marquee event is the 2:00 PM EST FOMC meeting minutes. Historical reaction: ±20 NQ points in the first 30 minutes after release on average. Initial jobless claims at 8:30 AM printed mildly above consensus but provoked no real volatility. The 10-year Treasury auction at 1:00 PM may compress equity vol into the FOMC release.",
    },
    {
      heading: "Levels to watch",
      body:
        "MNQ: prior day high 18,265 is the upside reference; 18,200 acts as the most recent pivot zone (3 touches in the last 36 hours). MGC: 2,355 is the line in the sand on the upside; 2,338 is closest demand. ES: 5,485 is the working pivot, 5,510 is overhead supply.",
    },
    {
      heading: "Strategy bias for the day",
      body:
        "Slingshot and trend-continuation longs are favored on pullbacks to the 21 EMA. Counter-trend shorts are not recommended until VIX flips back above 15 or Mag 7 breadth weakens. Tighten filters between 1:30 PM and 2:30 PM around the FOMC release — historically chop intensifies and false breakouts spike.",
    },
  ],
  cautionWindows: [
    "11:30 AM – 1:30 PM: Lunch chop, win rate drops ~18% historically",
    "1:45 PM – 2:30 PM: FOMC minutes release window, false breakouts spike",
  ],
  recommendedBias: "LONG-BIASED",
};
