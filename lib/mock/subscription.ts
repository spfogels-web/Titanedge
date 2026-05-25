// Subscription plan definitions + current user mock state. Real
// implementation: Stripe products + customer subscription stored in DB.

export type PlanId = "indicator" | "pro" | "elite";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  price: number;              // USD / month
  yearlyDiscount: number;     // %
  accent: string;             // hex
  popular?: boolean;
  features: string[];
  highlights: string[];       // 1-3 short bullets shown on chip CTAs
  cta: string;
  autoTradeLimit: number | "unlimited" | 0;
}

export const plans: Plan[] = [
  {
    id: "indicator",
    name: "Indicator",
    tagline: "TitanEdge AI indicator on your charts + alerts. No auto trading.",
    price: 89,
    yearlyDiscount: 20,
    accent: "#00aaff",
    autoTradeLimit: 0,
    features: [
      "TitanEdge AI indicator on TradingView",
      "Real-time setup detection (7 patterns)",
      "Confidence scoring on each signal",
      "Multi-symbol support (MNQ / MES / ES / MGC / MCL / VIX)",
      "Live risk metrics on your charts",
      "Email + Discord alerts",
      "Trader Academy — Foundations + Setups modules",
      "Webhook signal log (read-only)",
    ],
    highlights: ["Indicator on TradingView", "Alerts only — no auto trading"],
    cta: "Start with Indicator",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Indicator + 20 automated trades per month + full briefing room.",
    price: 249,
    yearlyDiscount: 20,
    accent: "#00ff88",
    popular: true,
    autoTradeLimit: 20,
    features: [
      "Everything in Indicator",
      "20 automated trades per month via webhook → broker",
      "TradingView Paper + live broker webhook integration",
      "Live position tracking with real-time P&L",
      "Daily AI Morning Briefing with macro context",
      "Full Trader Academy access (29 lessons, all quizzes)",
      "Bot Chat — upload docs + ask questions",
      "Risk meter + daily loss limit automation",
      "SMS + Email + Discord priority alerts",
      "Priority support response < 12 hours",
    ],
    highlights: ["Includes Indicator", "20 auto trades / month", "AI Briefing"],
    cta: "Go Pro",
  },
  {
    id: "elite",
    name: "Elite",
    tagline: "Unlimited auto trading, prop firm portfolio tracking, advanced analytics.",
    price: 499,
    yearlyDiscount: 20,
    accent: "#aa50ff",
    autoTradeLimit: "unlimited",
    features: [
      "Everything in Pro",
      "UNLIMITED automated trades",
      "Multi-account prop firm portfolio (Apex, TopstepX, TPT, IB, etc.)",
      "Advanced analytics — Sharpe, Sortino, drawdown analysis, monthly grid",
      "Custom strategy builder + backtest engine",
      "REST API access for custom integrations",
      "Webhook auth + 2FA on broker connections",
      "1-on-1 onboarding call (60 min)",
      "Dedicated Discord channel with founder access",
      "White-glove support response < 1 hour",
    ],
    highlights: ["Includes Pro", "Unlimited auto trades", "Prop firm portfolio"],
    cta: "Go Elite",
  },
];

// Mock current user subscription
export interface CurrentSubscription {
  planId: PlanId;
  status: "active" | "trial" | "past_due" | "canceled";
  startedAt: string;
  nextBillingDate: string;
  billingCycle: "monthly" | "yearly";
  paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number };
  tradesUsedThisMonth: number;
  tradesLimitThisMonth: number | "unlimited";
  // Lifetime
  totalPaid: number;
}

export const currentSubscription: CurrentSubscription = {
  planId: "pro",
  status: "active",
  startedAt: "2026-02-15",
  nextBillingDate: "2026-06-15",
  billingCycle: "monthly",
  paymentMethod: { brand: "Visa", last4: "4242", expMonth: 9, expYear: 2027 },
  tradesUsedThisMonth: 12,
  tradesLimitThisMonth: 20,
  totalPaid: 836,
};

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed" | "refunded";
  planName: string;
  downloadUrl: string;
}

export const invoices: Invoice[] = [
  { id: "inv-005", number: "INV-2026-005", date: "2026-05-15", amount: 249, status: "paid",    planName: "Pro Plan",       downloadUrl: "#" },
  { id: "inv-004", number: "INV-2026-004", date: "2026-04-15", amount: 249, status: "paid",    planName: "Pro Plan",       downloadUrl: "#" },
  { id: "inv-003", number: "INV-2026-003", date: "2026-03-15", amount: 249, status: "paid",    planName: "Pro Plan",       downloadUrl: "#" },
  { id: "inv-002", number: "INV-2026-002", date: "2026-02-15", amount:  89, status: "paid",    planName: "Indicator Plan", downloadUrl: "#" },
  { id: "inv-001", number: "INV-2026-001", date: "2026-01-15", amount:  89, status: "paid",    planName: "Indicator Plan", downloadUrl: "#" },
];

// User profile mock — real version pulls from auth provider + DB.
export interface UserProfile {
  fullName: string;
  email: string;
  initials: string;
  joinedAt: string;
  timezone: string;
  discordUser?: string;
  defaultSymbol: string;
  twoFactorEnabled: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
    discord: boolean;
    pushBrowser: boolean;
  };
  tradingDefaults: {
    riskPerTradePct: number;     // 1 = 1%
    maxDailyLossPct: number;     // 3 = 3%
    maxTradesPerDay: number;
    defaultPositionSize: number; // contracts
  };
}

export const userProfile: UserProfile = {
  fullName: "Elite Trader",
  email: "sean@versatilecon.com",
  initials: "ET",
  joinedAt: "2026-01-15",
  timezone: "America/New_York",
  discordUser: "sean#7281",
  defaultSymbol: "MNQ1!",
  twoFactorEnabled: false,
  notifications: {
    email: true,
    sms: true,
    discord: true,
    pushBrowser: false,
  },
  tradingDefaults: {
    riskPerTradePct: 1,
    maxDailyLossPct: 3,
    maxTradesPerDay: 8,
    defaultPositionSize: 2,
  },
};
