import { Pool, type QueryResult, type QueryResultRow } from "pg";

// IMPORTANT — pool creation MUST stay lazy.
//
// Next.js runs a "collect page data" phase during `next build` that imports
// every server module to extract route segment config (dynamic / runtime /
// etc.). If we created the Pool at module top level, that import would throw
// "DATABASE_URL is not set" during build (Railway only injects DATABASE_URL
// at runtime, not at build time) — and the whole deploy would fail.
//
// Keeping the pool inside a getter that's only called from `query()` means
// nothing touches the DB until a real request comes in.

const globalForPool = globalThis as unknown as { __pgPool?: Pool };

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Railway Postgres requires TLS over the public proxy and is happy with it
  // on the internal network too. rejectUnauthorized:false is the standard
  // pattern because Railway uses a self-signed chain.
  const ssl =
    process.env.PGSSLMODE === "disable"
      ? false
      : { rejectUnauthorized: false };

  return new Pool({ connectionString, ssl });
}

function getPool(): Pool {
  if (globalForPool.__pgPool) return globalForPool.__pgPool;
  const pool = createPool();
  globalForPool.__pgPool = pool;
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: ReadonlyArray<unknown>,
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params as unknown[] | undefined);
}
