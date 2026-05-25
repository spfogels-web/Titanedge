import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SettingsRow {
  id: number;
  account_name: string;
  account_source: string;
  starting_balance: string;
  session: string;
  updated_at: string;
}

interface AccountAggRow {
  realized_pnl: string | null;
  open_count: string;
}

export async function GET() {
  try {
    const [settingsRes, aggRes] = await Promise.all([
      query<SettingsRow>(`SELECT * FROM account_settings WHERE id = 1`),
      query<AccountAggRow>(`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'CLOSED' THEN pnl END), 0) AS realized_pnl,
          COUNT(*) FILTER (WHERE status = 'OPEN')                    AS open_count
        FROM trades
      `),
    ]);

    const settings = settingsRes.rows[0];
    const startingBalance = settings ? Number(settings.starting_balance) : 100000;
    const accountName = settings?.account_name ?? "spfogels USD";
    const accountSource = settings?.account_source ?? "TradingView Paper";
    const session = settings?.session ?? "RTH";

    const realizedPnl = Number(aggRes.rows[0]?.realized_pnl ?? 0);
    const openCount = Number(aggRes.rows[0]?.open_count ?? 0);

    const balance = startingBalance + realizedPnl;
    // Unrealized PnL on open positions requires a live market-data feed
    // (Polygon / Alpaca / etc.) which we don't have wired yet — keep null
    // and let the UI render "—".
    const unrealizedPnl: number | null = null;
    const equity = balance; // + unrealizedPnl when available

    // Rough margin per open contract — placeholder until we look up the real
    // per-symbol margin requirement table.
    const ordersMargin = openCount * 1500;
    const availableFunds = Math.max(0, balance - ordersMargin);
    const accountMargin = 0;
    const marginBufferPct = 100;

    return NextResponse.json({
      ok: true,
      account: {
        accountName,
        source: accountSource,
        startingBalance,
        realizedPnl: Number(realizedPnl.toFixed(2)),
        unrealizedPnl,
        balance: Number(balance.toFixed(2)),
        equity: Number(equity.toFixed(2)),
        availableFunds: Number(availableFunds.toFixed(2)),
        ordersMargin: Number(ordersMargin.toFixed(2)),
        accountMargin,
        marginBufferPct,
        session,
        asOf: new Date().toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
