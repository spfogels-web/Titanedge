// Per-account manual balance overrides, stored in browser localStorage.
//
// Why: while Tradovate OAuth is pending approval, users can keep their
// dashboard numbers accurate by typing in their end-of-day balance.
// When live Tradovate sync is available the live value wins; otherwise
// we fall back to the manual override; otherwise the seed default.

export interface ManualOverride {
  accountNumber: string;     // e.g. "MFFUEVRPD607486001"
  currentBalance: number;
  bestDayPnl: number;        // for consistency-rule tracking
  daysActive: number;
  updatedAt: string;         // ISO timestamp
}

const STORAGE_KEY = "titanedge.manualBalances";

interface StorageShape {
  [accountNumber: string]: ManualOverride;
}

function readAll(): StorageShape {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StorageShape;
  } catch {
    return {};
  }
}

function writeAll(data: StorageShape): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  // Notify same-tab listeners (storage events don't fire on the writing tab)
  window.dispatchEvent(new CustomEvent("titanedge:manualBalance"));
}

export function loadOverride(accountNumber: string): ManualOverride | null {
  const all = readAll();
  return all[accountNumber] ?? null;
}

export function saveOverride(o: ManualOverride): void {
  const all = readAll();
  all[o.accountNumber] = { ...o, updatedAt: new Date().toISOString() };
  writeAll(all);
}

export function clearOverride(accountNumber: string): void {
  const all = readAll();
  delete all[accountNumber];
  writeAll(all);
}
