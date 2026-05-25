import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface AggregateRow {
  total_pnl: string | null;
  win_count: string;
  loss_count: string;
  active_count: string;
  today_pnl: string | null;
  today_trades: string;
  gross_profit: string | null;
  gross_loss: string | null;
  biggest_win: string | null;
  biggest_loss: string | null;
  avg_win: string | null;
  avg_loss: string | null;
  avg_hold_minutes: string | null;
}

interface BotStatusRow {
  id: number;
  active: boolean;
  strategy: string | null;
  threshold: number | null;
  win_rate: string | null;
  trades_today: number;
  daily_pnl: string;
  trend_cloud: string | null;
  updated_at: string;
}

type Source = "BOT" | "MANUAL";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sourceRaw = searchParams.get("source")?.toUpperCase();
  const source: Source | null =
    sourceRaw === "BOT" || sourceRaw === "MANUAL" ? sourceRaw : null;

  try {
    // The source filter is applied as `($1::text IS NULL OR source = $1)`
    // so the same query handles both "all" and source-specific calls.
    const [agg, bot] = await Promise.all([
      query<AggregateRow>(
        `
        SELECT
          COALESCE(SUM(CASE WHEN status = 'CLOSED' THEN pnl END), 0)               AS total_pnl,
          COUNT(*) FILTER (WHERE status = 'CLOSED' AND pnl >  0)                    AS win_count,
          COUNT(*) FILTER (WHERE status = 'CLOSED' AND pnl <= 0)                    AS loss_count,
          COUNT(*) FILTER (WHERE status = 'OPEN')                                   AS active_count,
          COALESCE(SUM(CASE WHEN status = 'CLOSED'
                             AND closed_at::date = CURRENT_DATE
                       THEN pnl END), 0)                                            AS today_pnl,
          COUNT(*) FILTER (WHERE opened_at::date = CURRENT_DATE)                    AS today_trades,
          COALESCE(SUM(CASE WHEN status = 'CLOSED' AND pnl >  0 THEN pnl END), 0)   AS gross_profit,
          COALESCE(SUM(CASE WHEN status = 'CLOSED' AND pnl <= 0 THEN pnl END), 0)   AS gross_loss,
          COALESCE(MAX(CASE WHEN status = 'CLOSED' AND pnl >  0 THEN pnl END), 0)   AS biggest_win,
          COALESCE(MIN(CASE WHEN status = 'CLOSED' AND pnl <  0 THEN pnl END), 0)   AS biggest_loss,
          COALESCE(AVG(CASE WHEN status = 'CLOSED' AND pnl >  0 THEN pnl END), 0)   AS avg_win,
          COALESCE(AVG(CASE WHEN status = 'CLOSED' AND pnl <= 0 THEN pnl END), 0)   AS avg_loss,
          COALESCE(AVG(CASE WHEN status = 'CLOSED'
                             AND closed_at IS NOT NULL AND opened_at IS NOT NULL
                       THEN EXTRACT(EPOCH FROM (closed_at - opened_at))/60 END), 0) AS avg_hold_minutes
        FROM trades
        WHERE ($1::text IS NULL OR source = $1)
        `,
        [source],
      ),
      query<BotStatusRow>(`SELECT * FROM bot_status WHERE id = 1`),
    ]);

    const row: AggregateRow = agg.rows[0] ?? {
      total_pnl: "0", win_count: "0", loss_count: "0", active_count: "0",
      today_pnl: "0", today_trades: "0", gross_profit: "0", gross_loss: "0",
      biggest_win: "0", biggest_loss: "0", avg_win: "0", avg_loss: "0",
      avg_hold_minutes: "0",
    };

    const wins = Number(row.win_count);
    const losses = Number(row.loss_count);
    const totalTrades = wins + losses;
    const winRate = totalTrades === 0 ? 0 : (wins / totalTrades) * 100;
    const totalPnl = Number(row.total_pnl ?? 0);
    const grossProfit = Number(row.gross_profit ?? 0);
    const grossLoss = Math.abs(Number(row.gross_loss ?? 0));
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? Infinity : 0) : grossProfit / grossLoss;
    const expectancy = totalTrades === 0 ? 0 : totalPnl / totalTrades;

    return NextResponse.json({
      ok: true,
      source,
      stats: {
        total_pnl: totalPnl,
        wins,
        losses,
        total_trades: totalTrades,
        win_rate: Number(winRate.toFixed(2)),
        today_pnl: Number(row.today_pnl ?? 0),
        today_trades: Number(row.today_trades),
        active_trades: Number(row.active_count),
        gross_profit: Number(grossProfit.toFixed(2)),
        gross_loss: Number(Number(row.gross_loss ?? 0).toFixed(2)),
        biggest_win: Number(Number(row.biggest_win ?? 0).toFixed(2)),
        biggest_loss: Number(Number(row.biggest_loss ?? 0).toFixed(2)),
        avg_win: Number(Number(row.avg_win ?? 0).toFixed(2)),
        avg_loss: Number(Number(row.avg_loss ?? 0).toFixed(2)),
        expectancy: Number(expectancy.toFixed(2)),
        profit_factor: Number.isFinite(profitFactor) ? Number(profitFactor.toFixed(2)) : 0,
        avg_hold_minutes: Number(Number(row.avg_hold_minutes ?? 0).toFixed(1)),
      },
      bot: bot.rows[0] ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
