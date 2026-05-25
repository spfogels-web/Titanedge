"use client";
import { useMemo } from "react";
import type { StatsResponse, TradeSource } from "@/lib/types";
import { usePolling } from "./usePolling";

interface UseStatsOptions {
  source?: TradeSource;
}

export function useStats(
  opts: UseStatsOptions = {},
  intervalMs: number = 5000,
) {
  const url = useMemo(() => {
    if (opts.source) {
      const params = new URLSearchParams();
      params.set("source", opts.source);
      return `/api/stats?${params.toString()}`;
    }
    return "/api/stats";
  }, [opts.source]);
  return usePolling<StatsResponse>(url, intervalMs);
}
