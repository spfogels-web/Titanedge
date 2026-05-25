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
  opened_at: string;
  closed_at: string | null;
}

const SIDES: readonly TradeSide[] = ["LONG", "SHORT"];
const STATUSES: readonly TradeStatus[] = ["OPEN", "CLOSED", "CANCELED"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const limitRaw = searchParams.get("limit");
  const limit = Math.min(Math.max(parseInt(limitRaw ?? "50", 10) || 50, 1), 500);

  try {
    const params: unknown[] = [];
    let where = "";
    if (statusParam && (STATUSES as readonly string[]).includes(statusParam)) {
      params.push(statusParam);
      where = `WHERE status = $${params.length}`;
    }
    params.push(limit);
    const result = await query<TradeRow>(
      `SELECT * FROM trades ${where} ORDER BY opened_at DESC LIMIT $${params.length}`,
      params,
    );
    return NextResponse.json({ ok: true, trades: result.rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const symbol = typeof body.symbol === "string" ? body.symbol : null;
  const side = typeof body.side === "string" ? body.side.toUpperCase() : null;
  const quantity = typeof body.quantity === "number" ? body.quantity : null;

  if (!symbol || !side || quantity == null) {
    return NextResponse.json(
      { ok: false, error: "symbol (string), side (LONG|SHORT), quantity (number) are required" },
      { status: 400 },
    );
  }
  if (!(SIDES as readonly string[]).includes(side)) {
    return NextResponse.json({ ok: false, error: "side must be LONG or SHORT" }, { status: 400 });
  }

  const status = typeof body.status === "string" ? body.status.toUpperCase() : "OPEN";
  if (!(STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json(
      { ok: false, error: "status must be OPEN, CLOSED, or CANCELED" },
      { status: 400 },
    );
  }

  const num = (k: string): number | null =>
    typeof body[k] === "number" ? (body[k] as number) : null;
  const str = (k: string): string | null =>
    typeof body[k] === "string" ? (body[k] as string) : null;

  try {
    const result = await query<TradeRow>(
      `INSERT INTO trades
         (symbol, side, quantity, entry_price, exit_price, stop_price, target_price,
          pnl, status, strategy, score, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        symbol,
        side,
        quantity,
        num("entry_price"),
        num("exit_price"),
        num("stop_price"),
        num("target_price"),
        num("pnl"),
        status,
        str("strategy"),
        num("score"),
        str("notes"),
      ],
    );
    return NextResponse.json({ ok: true, trade: result.rows[0] }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
