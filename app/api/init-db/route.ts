import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // ============ trades ============
    await query(`
      CREATE TABLE IF NOT EXISTS trades (
        id            SERIAL PRIMARY KEY,
        symbol        TEXT NOT NULL,
        side          TEXT NOT NULL CHECK (side IN ('LONG','SHORT')),
        quantity      INTEGER NOT NULL,
        entry_price   NUMERIC(12,4),
        exit_price    NUMERIC(12,4),
        stop_price    NUMERIC(12,4),
        target_price  NUMERIC(12,4),
        pnl           NUMERIC(12,2),
        status        TEXT NOT NULL CHECK (status IN ('OPEN','CLOSED','CANCELED')) DEFAULT 'OPEN',
        strategy      TEXT,
        score         INTEGER,
        notes         TEXT,
        opened_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        closed_at     TIMESTAMPTZ
      );
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_trades_status    ON trades(status);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_trades_opened_at ON trades(opened_at DESC);`);

    // 6A.6 — add source column (idempotent migration).
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'trades' AND column_name = 'source'
        ) THEN
          ALTER TABLE trades ADD COLUMN source TEXT NOT NULL DEFAULT 'BOT'
            CHECK (source IN ('BOT','MANUAL'));
        END IF;
      END $$;
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_trades_source ON trades(source);`);

    // ============ signals ============
    await query(`
      CREATE TABLE IF NOT EXISTS signals (
        id            SERIAL PRIMARY KEY,
        symbol        TEXT NOT NULL,
        side          TEXT NOT NULL CHECK (side IN ('LONG','SHORT')),
        score         INTEGER,
        price         NUMERIC(12,4),
        zone_touches  INTEGER,
        trend_cloud   TEXT,
        vix           NUMERIC(8,2),
        mag7_bulls    INTEGER,
        executed      BOOLEAN NOT NULL DEFAULT FALSE,
        trade_id      INTEGER REFERENCES trades(id) ON DELETE SET NULL,
        fired_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_signals_fired_at ON signals(fired_at DESC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_signals_trade_id ON signals(trade_id);`);

    // ============ bot_status (singleton) ============
    await query(`
      CREATE TABLE IF NOT EXISTS bot_status (
        id            INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        active        BOOLEAN NOT NULL DEFAULT FALSE,
        strategy      TEXT,
        threshold     INTEGER,
        win_rate      NUMERIC(5,2),
        trades_today  INTEGER NOT NULL DEFAULT 0,
        daily_pnl     NUMERIC(12,2) NOT NULL DEFAULT 0,
        trend_cloud   TEXT,
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await query(`
      INSERT INTO bot_status (id, active, strategy, threshold, win_rate)
      VALUES (1, FALSE, 'PIVOT_MASTER_BOT_V4', 65, 0)
      ON CONFLICT (id) DO NOTHING;
    `);

    // ============ account_settings (singleton, added 6A.6) ============
    await query(`
      CREATE TABLE IF NOT EXISTS account_settings (
        id                INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        account_name      TEXT NOT NULL DEFAULT 'spfogels USD',
        account_source    TEXT NOT NULL DEFAULT 'TradingView Paper',
        starting_balance  NUMERIC(12,2) NOT NULL DEFAULT 100000,
        session           TEXT NOT NULL DEFAULT 'RTH',
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await query(`
      INSERT INTO account_settings (id, account_name, account_source, starting_balance, session)
      VALUES (1, 'spfogels USD', 'TradingView Paper', 100000, 'RTH')
      ON CONFLICT (id) DO NOTHING;
    `);

    return NextResponse.json({
      ok: true,
      message:
        "Tables ready (created or already existed): trades, signals, bot_status, account_settings. Migrations applied: trades.source.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
