import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Cancel all OPEN trades (resets daily counter). Admin use only.
export async function POST() {
  try {
    const res = await query(
      `UPDATE trades SET status = 'CANCELED' WHERE status = 'OPEN' RETURNING id`
    );
    return NextResponse.json({ ok: true, canceled: res.rows.length, ids: res.rows.map((r: { id: number }) => r.id) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
