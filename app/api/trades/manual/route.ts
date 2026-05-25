import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

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
  source: "BOT" | "MANUAL";
  opened_at: string;
  closed_at: string | null;
}

// Per-symbol point multiplier — keep in sync with the table in the webhook
// route. Used to compute dollar pnl when the manual form provides both an
// entry and an exit price.
const FUTURES_MULTIPLIERS: Record<string, number> = {
  MNQ: 2, NQ: 20, MES: 5, ES: 50,
  MYM: 0.5, YM: 5, M2K: 5, RTY: 50,
  MGC: 10, GC: 100, MCL: 100, CL: 1000,
};

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
  return (side === "LONG" ? 1 : -1) * (exit - entry) * qty * mult;
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

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const symbol = readStr(body, "symbol");
  const sideRaw = readStr(body, "side")?.toUpperCase() ?? null;
  const side: TradeSide | null =
    sideRaw === "LONG" || sideRaw === "SHORT" ? sideRaw : null;
  const qtyRaw = readNum(body, "qty") ?? readNum(body, "quantity");
  const qty = qtyRaw != null && qtyRaw > 0 ? Math.trunc(qtyRaw) : null;

  if (!symbol || !side || qty == null) {
    return NextResponse.json(
      { ok: false, error: "symbol, side (LONG|SHORT), and qty (positive) are required" },
      { status: 400 },
    );
  }

  const entry = readNum(body, "entry_price");
  const exit = readNum(body, "exit_price");
  const stop = readNum(body, "stop_price");
  const target = readNum(body, "target_price");
  const strategy = readStr(body, "strategy") ?? "Manual";
  const userNotes = readStr(body, "notes");

  const explicitPnl = readNum(body, "pnl");
  const computedPnl =
    explicitPnl ??
    (entry != null && exit != null ? dollarsPnl(side, qty, entry, exit, symbol) : null);

  const status: TradeStatus = exit != null ? "CLOSED" : "OPEN";
  const closedAt = status === "CLOSED" ? new Date().toISOString() : null;

  try {
    const insertRes = await query<TradeRow>(
      `INSERT INTO trades
         (symbol, side, quantity, entry_price, exit_price, stop_price, target_price,
          pnl, status, strategy, score, notes, source, closed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NULL,$11,'MANUAL',$12)
       RETURNING *`,
      [
        symbol, side, qty, entry, exit, stop, target,
        computedPnl, status, strategy, userNotes, closedAt,
      ],
    );

    return NextResponse.json(
      { ok: true, trade: insertRes.rows[0] },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
