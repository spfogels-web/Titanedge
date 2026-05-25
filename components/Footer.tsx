"use client";
import { useEffect, useState } from "react";
import { Bot, AlertOctagon } from "lucide-react";

// Reference start: bot "uptime" begins when the page first loads.
// Phase 5C will swap this for a real timestamp from /api/bot-status.
const BOT_START_REF: Date = new Date();
const VERSION = "0.5.0";
const WEBHOOK_CHECK_SEC = 1.2;

function formatUptime(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

function formatTimestamp(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Footer() {
  const [uptime, setUptime] = useState<string>("0d 0h 0m");

  useEffect(() => {
    const tick = () =>
      setUptime(formatUptime(Date.now() - BOT_START_REF.getTime()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-3 border-t border-border bg-panel/80 backdrop-blur text-xs">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
        <span className="flex items-center gap-1.5">
          <Bot size={12} className="text-accent" />
          Bot Uptime:{" "}
          <span className="text-white font-mono">{uptime}</span>
        </span>
        <span className="hidden md:inline">
          Last Restart:{" "}
          <span className="text-white">{formatTimestamp(BOT_START_REF)}</span>
        </span>
        <span className="hidden md:inline">
          Version: <span className="text-white">{VERSION}</span>
        </span>
        <span className="hidden lg:inline">
          Next Webhook Check:{" "}
          <span className="text-accent font-mono">{WEBHOOK_CHECK_SEC}s</span>
        </span>
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <span className="flex items-center gap-1.5 text-accent">
          <span className="w-2 h-2 rounded-full bg-accent" />
          All Systems Operational
        </span>
        <button
          className="flex items-center gap-2 px-3 py-1.5 bg-accentRed/10 hover:bg-accentRed/20 border border-accentRed/30 rounded-md text-accentRed transition font-semibold"
          type="button"
        >
          <AlertOctagon size={14} /> Kill Switch
        </button>
      </div>
    </footer>
  );
}
