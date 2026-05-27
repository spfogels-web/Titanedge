import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// One-shot migration endpoint — creates all tables and seeds bot_settings.
// Safe to call multiple times (fully idempotent).
export async function POST() {
  const results: string[] = [];

  try {
    // ── trades ──────────────────────────────────────────────────────────────
    await query(`
      CREATE TABLE IF NOT EXISTS trades (
        id           SERIAL PRIMARY KEY,
        symbol       TEXT        NOT NULL,
        side         TEXT        NOT NULL CHECK (side IN ('LONG','SHORT')),
        quantity     INTEGER     NOT NULL DEFAULT 1,
        entry_price  NUMERIC(12,4),
        exit_price   NUMERIC(12,4),
        stop_price   NUMERIC(12,4),
        target_price NUMERIC(12,4),
        pnl          NUMERIC(12,2),
        status       TEXT        NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED','CANCELED')),
        strategy     TEXT,
        score        INTEGER,
        notes        TEXT,
        source       TEXT        NOT NULL DEFAULT 'BOT',
        opened_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        closed_at    TIMESTAMPTZ
      )
    `);
    results.push("trades ✓");

    // ── signals ─────────────────────────────────────────────────────────────
    await query(`
      CREATE TABLE IF NOT EXISTS signals (
        id           SERIAL PRIMARY KEY,
        symbol       TEXT        NOT NULL,
        side         TEXT        NOT NULL CHECK (side IN ('LONG','SHORT')),
        score        INTEGER,
        price        NUMERIC(12,4),
        zone_touches INTEGER,
        trend_cloud  TEXT,
        vix          NUMERIC(8,2),
        mag7_bulls   INTEGER,
        executed     BOOLEAN     NOT NULL DEFAULT FALSE,
        trade_id     INTEGER     REFERENCES trades(id),
        fired_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    results.push("signals ✓");

    // ── bot_settings ─────────────────────────────────────────────────────────
    await query(`
      CREATE TABLE IF NOT EXISTS bot_settings (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    results.push("bot_settings ✓");

    // ── seed TradersPost URL ─────────────────────────────────────────────────
    const tpUrl = process.env.TRADERSPOST_WEBHOOK_URL ??
      "https://webhooks.traderspost.io/trading/webhook/8970d3ec-b6e3-4f08-a4f7-b7aaa1fd8be6/97b086bc87bc77fd4a2fa8bf86a5fd1d";

    await query(`
      INSERT INTO bot_settings (key, value)
      VALUES ('TRADERSPOST_WEBHOOK_URL', $1)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `, [tpUrl]);
    results.push("bot_settings seeded ✓");

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message, results }, { status: 500 });
  }
}
