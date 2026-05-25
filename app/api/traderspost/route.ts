import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── TradersPost canonical payload ────────────────────────────────────────────
// TradersPost forwards signals from TradingView to your broker (Tradovate, etc.)
// and can also POST to a secondary webhook URL — this endpoint is that target.
//
// Docs: https://traderspost.io/docs/webhooks
//
// Key field differences vs our native webhook:
//   ticker   → symbol
//   quantity → qty
//   stopPrice   (camelCase) → stop_price
//   takeProfit  (camelCase) → target_price
//   action: buy | sell | exit | cancel | add
//   sentiment: bullish | bearish | flat
// ─────────────────────────────────────────────────────────────────────────────

type TPAction = "buy" | "sell" | "exit" | "cancel" | "add";
type TPSentiment = "bullish" | "bearish" | "flat";
type TPOrderType = "market" | "limit" | "stop" | "stop_limit";
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
  executed: boolean;
  trade_id: number | null;
  fired_at: string;
}

// ─── Futures multipliers & tick sizes ─────────────────────────────────────────
const FUTURES_MULTIPLIERS: Record<string, number> = {
  MNQ: 2,   NQ: 20,
  MES: 5,   ES: 50,
  MYM: 0.5, YM: 5,
  M2K: 5,   RTY: 50,
  MGC: 10,  GC: 100,
  MCL: 100, CL: 1000,
};

function baseSymbol(symbol: string): string {
  return symbol
    .replace(/\d+!$/, "")                       // MNQ1! → MNQ
    .replace(/[FGHJKMNQUVXZ]\d{1,2}$/i, "")    // MNQM6 → MNQ
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

// ─── Auth ──────────────────────────────────────────────────────────────────────
// TradersPost allows you to set a secret in the webhook URL as a query param.
// We check WEBHOOK_SECRET the same way as the native webhook so both
// endpoints share one env var.
function authorized(req: NextRequest): boolean {
  const expected = process.env.WEBHOOK_SECRET;
  if (!expected) return true;
  const provided =
    req.headers.get("x-webhook-secret") ??
    new URL(req.url).searchParams.get("key") ??
    new URL(req.url).searchParams.get("secret");
  return provided === expected;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function readNum(body: Record<string, unknown>, key: string): number | null {
  const v = body[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)))
    return Number(v);
  return null;
}

function readStr(body: Record<string, unknown>, key: string): string | null {
  const v = body[key];
  return typeof v === "string" && v.trim() !== "" ? v : null;
}

// ─── GET — endpoint description ───────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "TitanEdge TradersPost webhook. POST the TradersPost signal JSON here.",
    expectedPayload: {
      ticker:     "MNQ1! — the TradingView symbol (mapped to 'symbol' in DB)",
      action:     "buy | sell | exit | cancel | add",
      sentiment:  "bullish | bearish | flat (optional)",
      orderType:  "market | limit | stop | stop_limit (optional, logged)",
      quantity:   "number of contracts",
      price:      "fill / close price (optional, enables PnL calc)",
      stopPrice:  "stop-loss price (optional)",
      takeProfit: "take-profit price (optional)",
      comment:    "strategy name / notes (optional)",
    },
    auth: process.env.WEBHOOK_SECRET
      ? "Required — append ?key=YOUR_SECRET to this URL in TradersPost."
      : "Not configured. Set WEBHOOK_SECRET on Railway.",
  });
}

// ─── POST — ingest TradersPost signal ─────────────────────────────────────────
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

  // ── Normalise action ───────────────────────────────────────────────────────
  const actionRaw = readStr(body, "action")?.toLowerCase() as TPAction | null;
  const validActions: TPAction[] = ["buy", "sell", "exit", "cancel", "add"];
  if (!actionRaw || !validActions.includes(actionRaw)) {
    return NextResponse.json(
      { ok: false, error: "action must be buy | sell | exit | cancel | add" },
      { status: 400 },
    );
  }

  // ── Symbol — TradersPost calls it "ticker" ────────────────────────────────
  const symbol =
    readStr(body, "ticker") ?? readStr(body, "symbol");
  if (!symbol) {
    return NextResponse.json(
      { ok: false, error: "ticker (or symbol) is required" },
      { status: 400 },
    );
  }

  // ── Quantity — TradersPost calls it "quantity"; also accept "qty" ─────────
  const qtyRaw = readNum(body, "quantity") ?? readNum(body, "qty");
  const qty =
    qtyRaw != null && qtyRaw > 0 ? Math.trunc(qtyRaw) : null;

  // qty is required for entry actions but not for exit/cancel
  if ((actionRaw === "buy" || actionRaw === "sell" || actionRaw === "add") && qty == null) {
    return NextResponse.json(
      { ok: false, error: "quantity is required for buy/sell/add actions" },
      { status: 400 },
    );
  }

  // ── Prices ────────────────────────────────────────────────────────────────
  const price      = readNum(body, "price");
  const stopPrice  = readNum(body, "stopPrice")  ?? readNum(body, "stop_price");
  const takeProfit = readNum(body, "takeProfit") ?? readNum(body, "target_price");
  const sentiment  = readStr(body, "sentiment") as TPSentiment | null;
  const orderType  = readStr(body, "orderType") as TPOrderType | null;
  const comment    = readStr(body, "comment") ?? readStr(body, "strategy");

  // ── Determine intended side ───────────────────────────────────────────────
  // exit/cancel don't imply a side — we derive it from the open position.
  const intendedSide: TradeSide | null =
    actionRaw === "buy" || actionRaw === "add"
      ? "LONG"
      : actionRaw === "sell"
      ? "SHORT"
      : null; // exit / cancel

  // ── Notes metadata ────────────────────────────────────────────────────────
  const noteParts: string[] = [];
  if (sentiment) noteParts.push(`sentiment=${sentiment}`);
  if (orderType) noteParts.push(`orderType=${orderType}`);
  if (comment)   noteParts.push(`strategy=${comment}`);
  const notes = noteParts.length ? noteParts.join(" | ") : null;

  try {
    // Fetch the most-recent open trade for this symbol
    const openRes = await query<TradeRow>(
      `SELECT * FROM trades
       WHERE symbol = $1 AND status = 'OPEN'
       ORDER BY opened_at DESC
       LIMIT 1`,
      [symbol],
    );
    const openTrade = openRes.rows[0] ?? null;

    // ── CANCEL: mark open trade as CANCELED ──────────────────────────────
    if (actionRaw === "cancel") {
      if (!openTrade) {
        return NextResponse.json(
          { ok: true, resolution: "no_open_trade", message: "Nothing to cancel." },
          { status: 200 },
        );
      }
      const cancelRes = await query<TradeRow>(
        `UPDATE trades SET status = 'CANCELED', closed_at = NOW()
         WHERE id = $1 RETURNING *`,
        [openTrade.id],
      );
      await query<SignalRow>(
        `INSERT INTO signals (symbol, side, price, executed, trade_id)
         VALUES ($1,$2,$3,TRUE,$4)`,
        [symbol, openTrade.side, price, openTrade.id],
      );
      return NextResponse.json(
        { ok: true, resolution: "canceled", trade: cancelRes.rows[0] },
        { status: 200 },
      );
    }

    // ── EXIT: close the open position regardless of side ─────────────────
    if (actionRaw === "exit") {
      if (!openTrade) {
        return NextResponse.json(
          { ok: true, resolution: "no_open_trade", message: "No open position to exit." },
          { status: 200 },
        );
      }
      const entry = openTrade.entry_price != null ? Number(openTrade.entry_price) : null;
      const computedPnl =
        entry != null && price != null
          ? dollarsPnl(openTrade.side, openTrade.quantity, entry, price, symbol)
          : null;

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
      const sigRes = await query<SignalRow>(
        `INSERT INTO signals (symbol, side, price, executed, trade_id)
         VALUES ($1,$2,$3,TRUE,$4) RETURNING *`,
        [symbol, openTrade.side, price, openTrade.id],
      );
      return NextResponse.json(
        { ok: true, resolution: "closed", trade: closeRes.rows[0], signal: sigRes.rows[0] },
        { status: 201 },
      );
    }

    // ── BUY / SELL / ADD ──────────────────────────────────────────────────
    // intendedSide is guaranteed non-null here (buy/sell/add paths above)
    const side = intendedSide!;

    // Close opposite-side trade first (reversal)
    if (openTrade && openTrade.side !== side) {
      const entry = openTrade.entry_price != null ? Number(openTrade.entry_price) : null;
      const computedPnl =
        entry != null && price != null
          ? dollarsPnl(openTrade.side, openTrade.quantity, entry, price, symbol)
          : null;
      await query<TradeRow>(
        `UPDATE trades
           SET status     = 'CLOSED',
               closed_at  = NOW(),
               exit_price = COALESCE($2, exit_price),
               pnl        = COALESCE($3, pnl)
         WHERE id = $1`,
        [openTrade.id, price, computedPnl],
      );
    }

    // Open the new trade
    const insertRes = await query<TradeRow>(
      `INSERT INTO trades
         (symbol, side, quantity, entry_price, stop_price, target_price,
          status, strategy, notes, source)
       VALUES ($1,$2,$3,$4,$5,$6,'OPEN',$7,$8,'BOT')
       RETURNING *`,
      [
        symbol,
        side,
        qty,
        price,
        stopPrice,
        takeProfit,
        comment,
        notes,
      ],
    );
    const trade = insertRes.rows[0];

    const sigRes = await query<SignalRow>(
      `INSERT INTO signals (symbol, side, price, executed, trade_id)
       VALUES ($1,$2,$3,TRUE,$4) RETURNING *`,
      [symbol, side, price, trade.id],
    );

    return NextResponse.json(
      {
        ok: true,
        resolution: openTrade && openTrade.side !== side ? "reversed" : "opened",
        trade,
        signal: sigRes.rows[0],
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
