"use client";
import type { AccountResponse } from "@/lib/types";
import { usePolling } from "./usePolling";

export function useAccount(intervalMs: number = 5000) {
  return usePolling<AccountResponse>("/api/account", intervalMs);
}
