// Browser-side persistence of the Tradovate session bearer token.
//
// Storage strategy: localStorage. The user is solo right now, the value is
// short-lived (token expires ~80 min), and Railway env vars aren't reliable.
// When we add multi-user auth, this moves server-side with proper encryption.

export interface TradovateConnection {
  accessToken: string;
  environment: "demo" | "live";
  pastedAt: string;               // ISO timestamp
  expectedExpiryAt?: string;      // Tradovate tokens last ~80 min
}

const STORAGE_KEY = "titanedge.tradovate.session";

export function loadConnection(): TradovateConnection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TradovateConnection;
  } catch {
    return null;
  }
}

export function saveConnection(c: TradovateConnection): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}

export function clearConnection(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function isLikelyExpired(c: TradovateConnection | null): boolean {
  if (!c) return true;
  if (!c.expectedExpiryAt) {
    // Default: assume 80 min from pastedAt
    const pasted = new Date(c.pastedAt).getTime();
    return Date.now() - pasted > 75 * 60 * 1000;
  }
  return Date.now() > new Date(c.expectedExpiryAt).getTime();
}
