import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Action = "BUY" | "SELL";
type TradeSide = "LONG" | "SHORT";
type TradeStatus = "OPEN" | "CLOSED" | "CANCELED";

interface TradeRow {
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
  opened_at: string;
  closed_at: string | null;
}

interface SignalRow {
  id: number;
  symbol: string;
  side: TradeSide;
  score: number | null;
  price: string | null;
  zone_touches: number | null;
  trend_cloud: string | null;
  vix: string | null;
  mag7_bulls: number | null;
  executed: boolean;
  trade_id: number | null;
  fired_at: string;
}

// Dollar value of a one-point move per contract, by futures root.
// Used to convert (exit - entry) points into dollar pnl when a trade closes.
const FUTURES_MULTIPLIERS: Record<string, number> = {
  MNQ: 2, NQ: 20,
  MES: 5, ES: 50,
  MYM: 0.5, YM: 5,
  M2K: 5, RTY: 50,
  MGC: 10, GC: 100,
  MCL: 100, CL: 1000,
};

// Minimum tick increment per futures root. Used to convert tick-based stop/
// target offsets from Pine (stopLossTicks / takeProfitTicks) into absolute
// price levels.
const TICK_SIZES: Record<string, number> = {
  MNQ: 0.25, NQ: 0.25, MES: 0.25, ES: 0.25,
  MYM: 1.0,  YM: 1.0,
  M2K: 0.10, RTY: 0.10,
  MGC: 0.10, GC: 0.10,
  MCL: 0.01, CL: 0.01,
};

// Reduce a symbol to its root for multiplier lookup. Handles both
// TradingView continuous-contract notation ("MNQ1!", "ES2!") and explicit
// month-year contracts ("MNQM6", "ESZ25").
function baseSymbol(symbol: string): string {
  return symbol
    .replace(/\d+!$/, "")
    .replace(/[FGHJKMNQUVXZ]\d{1,2}$/i, "")
    .toUpperCase();
}

function dollarsPnl(
  side: TradeSide,
  qty: number,
  entry: number,
  exit: number,
  symbol: string,
): number | null {
  const mult = FUTURES_MULTIPLIERS[baseSymbol(symbol)];
  if (mult == null) return null;
  const direction = side === "LONG" ? 1 : -1;
  return direction * (exit - entry) * qty * mult;
}

function tickSizeFor(symbol: string): number | null {
  return TICK_SIZES[baseSymbol(symbol)] ?? null;
}

// Convert a tick offset from the entry price into an absolute price level,
// in the correct direction for the trade side. Returns null when entry,
// ticks, or the symbol's tick size is unknown.
function offsetFromEntry(
  entry: number | null,
  ticks: number | null,
  symbol: string,
  direction: "long-stop" | "long-target" | "short-stop" | "short-target",
): number | null {
  if (entry == null || ticks == null) return null;
  const ts = tickSizeFor(symbol);
  if (ts == null) return null;
  const sign =
    direction === "long-stop"   ? -1 :
    direction === "long-target" ?  1 :
    direction === "short-stop"  ?  1 :
                                   -1;
  return entry + sign * ticks * ts;
}

function actionToSide(action: Action): TradeSide {
  return action === "BUY" ? "LONG" : "SHORT";
}

// ─── TradersPost forwarding ────────────────────────────────────────────────────
// Fire-and-forget: log to TitanEdge DB first, then forward the same signal
// to TradersPost so it executes the order at Tradovate.
// Set TRADERSPOST_WEBHOOK_URL in Railway env vars to enable.
async function forwardToTradersPost(payload: {
  ticker: string;
  action: "buy" | "sell" | "exit";
  sentiment: "bullish" | "bearish" | "flat";
  quantity?: number;
  price?: number | null;
  stopPrice?: number | null;
  takeProfit?: number | null;
}): Promise<void> {
  const url = process.env.TRADERSPOST_WEBHOOK_URL;
  if (!url) return; // not configured — skip silently

  // Strip null/undefined before sending
  const body: Record<string, unknown> = {
    ticker:    payload.ticker,
    action:    payload.action,
    sentiment: payload.sentiment,
    orderType: "market",
  };
  if (payload.quantity  != null) body.quantity   = payload.quantity;
  if (payload.price     != null) body.price       = payload.price;
  if (payload.stopPrice != null) body.stopPrice   = payload.stopPrice;
  if (payload.takeProfit != null) body.takeProfit = payload.takeProfit;

  try {
    await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
  } catch {
    // Never fail the main request because TradersPost is unreachable
  }
}

function authorized(req: NextRequest): boolean {
  const expected = process.env.WEBHOOK_SECRET;
  if (!expected) return true; // No secret configured: accept all (dev mode)
  const provided =
    req.headers.get("x-webhook-secret") ??
    new URL(req.url).searchParams.get("key");
  return provided === expected;
}

function readNum(body: Record<string, unknown>, key: string): number | null {
  const v = body[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return null;
}

function readStr(body: Record<string, unknown>, key: string): string | null {
  const v = body[key];
  return typeof v === "string" && v.trim() !== "" ? v : null;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "TitanEdge webhook endpoint. POST JSON here from TradingView.",
    expectedPayload: {
      action: "BUY | SELL",
      symbol: "e.g. MNQ1! or MNQM6",
      qty: "1 (or 'contracts' alias)",
      orderType: "Market (optional)",
      account: "DEMO7810715 (optional)",
      price: "optional, helps compute pnl on close",
      score: "optional 0-100 (or 'confidence' alias)",
      strategy: "optional, string (becomes trades.strategy)",
      stop_price: "optional, absolute",
      target_price: "optional, absolute",
      stopLossTicks: "optional, ticks from entry (converted via tick-size table)",
      takeProfitTicks: "optional, ticks from entry",
      trailStartTicks: "optional, logged to notes",
      trailDistanceTicks: "optional, logged to notes",
      bot: "optional, logged to notes",
      pnl: "optional, explicit dollar pnl override",
    },
    auth: process.env.WEBHOOK_SECRET
      ? "Required. Send via header `x-webhook-secret` or query `?key=...`"
      : "Not configured. Set WEBHOOK_SECRET on Railway to require auth.",
  });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const actionRaw = typeof body.action === "string" ? body.action.toUpperCase() : null;
  const action: Action | null = actionRaw === "BUY" || actionRaw === "SELL" ? actionRaw : null;
  const symbol = readStr(body, "symbol");
  // qty has a 'contracts' alias for Pine scripts that name the field that way.
  const qtyRaw = readNum(body, "qty") ?? readNum(body, "contracts");
  const qty = qtyRaw != null && qtyRaw > 0 ? Math.trunc(qtyRaw) : null;

  if (!action || !symbol || qty == null) {
    return NextResponse.json(
      {
        ok: false,
        error: "action (BUY|SELL), symbol (string), qty (or contracts, positive number) are required",
      },
      { status: 400 },
    );
  }

  const price = readNum(body, "price");
  // score has a 'confidence' alias for Pine scripts that use that name.
  const score = readNum(body, "score") ?? readNum(body, "confidence");
  const explicitPnl = readNum(body, "pnl");
  const strategy = readStr(body, "strategy");
  const orderType = readStr(body, "orderType");
  const account = readStr(body, "account");
  const bot = readStr(body, "bot");

  // Optional absolute stop/target — fall through to tick-offset variants
  // (stopLossTicks / takeProfitTicks) when absolute prices aren't given.
  const stopPriceRaw   = readNum(body, "stop_price");
  const targetPriceRaw = readNum(body, "target_price");
  const stopLossTicks    = readNum(body, "stopLossTicks");
  const takeProfitTicks  = readNum(body, "takeProfitTicks");
  const trailStartTicks  = readNum(body, "trailStartTicks");
  const trailDistTicks   = readNum(body, "trailDistanceTicks");

  const intendedSide = actionToSide(action);

  try {
    const openRes = await query<TradeRow>(
      `SELECT * FROM trades
       WHERE symbol = $1 AND status = 'OPEN'
       ORDER BY opened_at DESC
       LIMIT 1`,
      [symbol],
    );
    const openTrade = openRes.rows[0] ?? null;

    let trade: TradeRow;
    let resolution: "opened" | "closed";

    if (openTrade && openTrade.side !== intendedSide) {
      // Opposite-side alert → close the most recent open trade for this symbol
      const entry = openTrade.entry_price != null ? Number(openTrade.entry_price) : null;
      const computedPnl =
        explicitPnl ??
        (entry != null && price != null
          ? dollarsPnl(openTrade.side, openTrade.quantity, entry, price, symbol)
          : null);

      const closeRes = await query<TradeRow>(
        `UPDATE trades
           SET status     = 'CLOSED',
               closed_at  = NOW(),
               exit_price = COALESCE($2, exit_price),
               pnl        = COALESCE($3, pnl)
         WHERE id = $1
         RETURNING *`,
        [openTrade.id, price, computedPnl],
      );
      trade = closeRes.rows[0];
      resolution = "closed";

      // Forward exit to TradersPost
      void forwardToTradersPost({
        ticker:    symbol,
        action:    "exit",
        sentiment: "flat",
        price,
      });
    } else {
      // No open trade, or same-side alert (scale-in) → open a new trade row.
      // Resolve stop / target. Prefer absolute values from the payload; fall
      // back to tick-offset variants using the entry price + tick size.
      const stopPrice =
        stopPriceRaw ??
        offsetFromEntry(
          price,
          stopLossTicks,
          symbol,
          intendedSide === "LONG" ? "long-stop" : "short-stop",
        );
      const targetPrice =
        targetPriceRaw ??
        offsetFromEntry(
          price,
          takeProfitTicks,
          symbol,
          intendedSide === "LONG" ? "long-target" : "short-target",
        );

      // The trades table doesn't have columns for these — pack to notes.
      const noteParts: string[] = [];
      if (bot) noteParts.push(`bot=${bot}`);
      if (orderType) noteParts.push(`orderType=${orderType}`);
      if (account) noteParts.push(`account=${account}`);
      if (trailStartTicks != null) noteParts.push(`trailStart=${trailStartTicks}t`);
      if (trailDistTicks  != null) noteParts.push(`trailDist=${trailDistTicks}t`);
      const notes = noteParts.length > 0 ? noteParts.join(" | ") : null;

      const insertRes = await query<TradeRow>(
        `INSERT INTO trades
           (symbol, side, quantity, entry_price, stop_price, target_price,
            status, strategy, score, notes, source)
         VALUES ($1,$2,$3,$4,$5,$6,'OPEN',$7,$8,$9,'BOT')
         RETURNING *`,
        [
          symbol,
          intendedSide,
          qty,
          price,
          stopPrice,
          targetPrice,
          strategy,
          score,
          notes,
        ],
      );
      trade = insertRes.rows[0];
      resolution = "opened";

      // Forward entry to TradersPost
      void forwardToTradersPost({
        ticker:     symbol,
        action:     intendedSide === "LONG" ? "buy" : "sell",
        sentiment:  intendedSide === "LONG" ? "bullish" : "bearish",
        quantity:   qty,
        price,
        stopPrice:  stopPrice ?? null,
        takeProfit: targetPrice ?? null,
      });
    }

    const signalRes = await query<SignalRow>(
      `INSERT INTO signals
         (symbol, side, score, price, executed, trade_id)
       VALUES ($1,$2,$3,$4,TRUE,$5)
       RETURNING *`,
      [symbol, intendedSide, score, price, trade.id],
    );

    return NextResponse.json(
      { ok: true, resolution, trade, signal: signalRes.rows[0] },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
