// Tradovate "session-bearer" sync.
//
// Honest note on auth:
//   The "proper" path is registering a Tradovate developer app (cid + sec)
//   and calling /auth/accessTokenRequest with username/password. Approval
//   takes 1-3 business days.
//
//   This endpoint takes a SHORTCUT: the user grabs a Bearer access token
//   from their already-logged-in trader.tradovate.com browser session
//   (DevTools -> Network -> any API request -> copy Authorization header)
//   and pastes it into our Connect modal. We use that token directly.
//
//   Trade-off: tokens expire after ~80 min, so the user re-pastes once
//   per session. When their Tradovate dev app is approved we'll swap this
//   for full OAuth with auto-refresh.

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SyncRequest {
  accessToken: string;
  environment: "demo" | "live";   // demo = eval accounts (MFF/Topstep evals);
                                  // live = funded/personal
}

interface TradovateAccount {
  id: number;
  name: string;
  userId: number;
  accountType: string;            // "Customer" etc.
  active: boolean;
  clearingHouseId?: number;
  riskCategoryId?: number;
  autoLiqProfileId?: number;
  marginAccountType?: string;
  legalStatus?: string;
  archived?: boolean;
}

interface TradovateCashBalance {
  id?: number;
  accountId: number;
  timestamp: string;
  tradeDate: { year: number; month: number; day: number };
  currencyId: number;
  amount: number;                 // cash balance
  realizedPnL: number;            // realized PnL
  weekRealizedPnL?: number;
  archived?: boolean;
}

interface TradovatePosition {
  id: number;
  accountId: number;
  contractId: number;
  timestamp: string;
  tradeDate: { year: number; month: number; day: number };
  netPos: number;
  netPrice?: number;
  bought?: number;
  boughtValue?: number;
  sold?: number;
  soldValue?: number;
  prevPos?: number;
  prevPrice?: number;
  archived?: boolean;
}

interface SyncedAccountSnapshot {
  accountId: number;
  accountName: string;
  cashBalance: number;
  realizedPnL: number;
  openPositions: number;          // count of open positions
  positions: Array<{
    contractId: number;
    netPos: number;
    netPrice?: number;
  }>;
}

interface SyncResponse {
  ok: boolean;
  syncedAt: string;
  environment: "demo" | "live";
  accounts?: SyncedAccountSnapshot[];
  error?: string;
  hint?: string;
}

function baseUrlFor(env: "demo" | "live"): string {
  return env === "live"
    ? "https://live.tradovateapi.com/v1"
    : "https://demo.tradovateapi.com/v1";
}

async function tradovateGet<T>(
  base: string,
  path: string,
  token: string,
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const res = await fetch(`${base}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, status: res.status, error: text.slice(0, 200) };
    }
    const data = (await res.json()) as T;
    return { ok: true, status: 200, data };
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function POST(req: Request): Promise<Response> {
  let body: SyncRequest;
  try {
    body = (await req.json()) as SyncRequest;
  } catch {
    return Response.json(
      {
        ok: false,
        syncedAt: new Date().toISOString(),
        environment: "demo",
        error: "Invalid JSON body",
      } satisfies SyncResponse,
      { status: 400 },
    );
  }

  if (!body.accessToken || typeof body.accessToken !== "string") {
    return Response.json(
      {
        ok: false,
        syncedAt: new Date().toISOString(),
        environment: body.environment ?? "demo",
        error: "Missing accessToken",
        hint: "Open trader.tradovate.com -> F12 -> Network -> any request -> copy the Authorization Bearer token",
      } satisfies SyncResponse,
      { status: 400 },
    );
  }

  const env: "demo" | "live" = body.environment === "live" ? "live" : "demo";
  const base = baseUrlFor(env);

  // 1. List accounts visible to this token
  const accountsRes = await tradovateGet<TradovateAccount[]>(
    base,
    "/account/list",
    body.accessToken,
  );

  if (!accountsRes.ok) {
    const hint =
      accountsRes.status === 401
        ? "Token expired or invalid. Re-grab from trader.tradovate.com DevTools."
        : `Tradovate returned ${accountsRes.status}. Check that environment (demo/live) matches the account.`;
    return Response.json(
      {
        ok: false,
        syncedAt: new Date().toISOString(),
        environment: env,
        error: accountsRes.error ?? "Tradovate /account/list failed",
        hint,
      } satisfies SyncResponse,
      { status: accountsRes.status === 401 ? 401 : 502 },
    );
  }

  const accounts = accountsRes.data ?? [];
  if (accounts.length === 0) {
    return Response.json(
      {
        ok: true,
        syncedAt: new Date().toISOString(),
        environment: env,
        accounts: [],
      } satisfies SyncResponse,
    );
  }

  // 2. For each account, fetch balance + positions in parallel
  const snapshots: SyncedAccountSnapshot[] = await Promise.all(
    accounts.map(async (acc) => {
      const [balanceRes, positionsRes] = await Promise.all([
        tradovateGet<TradovateCashBalance>(
          base,
          `/cashBalance/getCashBalanceSnapshot?accountId=${acc.id}`,
          body.accessToken,
        ),
        tradovateGet<TradovatePosition[]>(
          base,
          `/position/list`,
          body.accessToken,
        ),
      ]);

      const cashBalance = balanceRes.data?.amount ?? 0;
      const realizedPnL = balanceRes.data?.realizedPnL ?? 0;
      const positionsAll = positionsRes.data ?? [];
      const positionsForAccount = positionsAll.filter(
        (p) => p.accountId === acc.id && p.netPos !== 0,
      );

      return {
        accountId: acc.id,
        accountName: acc.name,
        cashBalance,
        realizedPnL,
        openPositions: positionsForAccount.length,
        positions: positionsForAccount.map((p) => ({
          contractId: p.contractId,
          netPos: p.netPos,
          netPrice: p.netPrice,
        })),
      };
    }),
  );

  return Response.json({
    ok: true,
    syncedAt: new Date().toISOString(),
    environment: env,
    accounts: snapshots,
  } satisfies SyncResponse);
}
