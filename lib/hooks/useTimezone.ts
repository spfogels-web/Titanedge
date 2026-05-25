"use client";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_TIMEZONE } from "@/lib/timezones";

const STORAGE_KEY = "titanedge.tz";
const CHANGE_EVENT = "titanedge:tz-change";

// Share a single selected timezone across components via localStorage +
// a custom window event so updates in the Calendar popover propagate to
// the Header clock (and anything else that subscribes).
export function useTimezone(): { tz: string; setTz: (tz: string) => void } {
  const [tz, setTzState] = useState<string>(DEFAULT_TIMEZONE);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setTzState(stored);
    } catch {
      // ignore (private mode, etc.)
    }

    function onChange(e: Event) {
      const detail = (e as CustomEvent<{ tz: string }>).detail;
      if (detail?.tz) setTzState(detail.tz);
    }
    // Listen for cross-component updates AND cross-tab updates.
    window.addEventListener(CHANGE_EVENT, onChange);
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue) setTzState(e.newValue);
    }
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setTz = useCallback((newTz: string) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, newTz);
    } catch {
      // ignore
    }
    setTzState(newTz);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { tz: newTz } }));
  }, []);

  return { tz, setTz };
}
