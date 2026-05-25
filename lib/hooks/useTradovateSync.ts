"use client";
import { useCallback, useEffect, useState } from "react";
import { loadConnection, clearConnection, isLikelyExpired } from "@/lib/tradovateConnection";

export interface TradovateAccountSnapshot {
  accountId: number;
  accountName: string;
  cashBalance: number;
  realizedPnL: number;
  openPositions: number;
  positions: Array<{ contractId: number; netPos: number; netPrice?: number }>;
}

export interface TradovateSyncState {
  connected: boolean;
  syncing: boolean;
  syncError: string | null;
  syncedAt: Date | null;
  accounts: TradovateAccountSnapshot[];
  // Derived rollups across all accounts
  totalCashBalance: number;
  totalRealizedPnL: number;
  totalOpenPositions: number;
  refresh: () => Promise<void>;
}

interface SyncApiResponse {
  ok: boolean;
  syncedAt: string;
  environment: "demo" | "live";
  accounts?: TradovateAccountSnapshot[];
  error?: string;
  hint?: string;
}

export function useTradovateSync(pollMs: number = 60_000): TradovateSyncState {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const [accounts, setAccounts] = useState<TradovateAccountSnapshot[]>([]);

  const refresh = useCallback(async () => {
    const conn = loadConnection();
    if (!conn) {
      setConnected(false);
      setAccounts([]);
      return;
    }
    if (isLikelyExpired(conn)) {
      setConnected(false);
      setSyncError("Tradovate token expired — reconnect to refresh");
      return;
    }
    setConnected(true);
    setSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch("/api/broker/tradovate-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: conn.accessToken, environment: conn.environment }),
      });
      const data: SyncApiResponse = await res.json();
      if (!res.ok || !data.ok) {
        if (res.status === 401) {
          clearConnection();
          setConnected(false);
          setSyncError("Tradovate token expired — reconnect to refresh");
        } else {
          setSyncError(data.error ?? "Sync failed");
        }
        return;
      }
      setAccounts(data.accounts ?? []);
      setSyncedAt(new Date(data.syncedAt));
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : String(e));
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, pollMs);
    // Re-sync when the tab regains focus (the user probably just came back)
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh, pollMs]);

  const totalCashBalance = accounts.reduce((s, a) => s + a.cashBalance, 0);
  const totalRealizedPnL = accounts.reduce((s, a) => s + a.realizedPnL, 0);
  const totalOpenPositions = accounts.reduce((s, a) => s + a.openPositions, 0);

  return {
    connected,
    syncing,
    syncError,
    syncedAt,
    accounts,
    totalCashBalance,
    totalRealizedPnL,
    totalOpenPositions,
    refresh,
  };
}
