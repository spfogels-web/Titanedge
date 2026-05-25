"use client";
import { useMemo } from "react";
import type { TradesResponse, TradeStatus } from "@/lib/types";
import { usePolling } from "./usePolling";

interface UseTradesOptions {
  status?: TradeStatus;
  limit?: number;
}

export function useTrades(opts: UseTradesOptions = {}, intervalMs: number = 5000) {
  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (opts.status) params.set("status", opts.status);
    if (opts.limit != null) params.set("limit", String(opts.limit));
    const qs = params.toString();
    return `/api/trades${qs ? `?${qs}` : ""}`;
  }, [opts.status, opts.limit]);
  return usePolling<TradesResponse>(url, intervalMs);
}
