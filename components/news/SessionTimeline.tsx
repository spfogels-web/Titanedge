"use client";
import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";

// Map 0-24 ET hour to a fraction across the day; we show 4 AM → next 4 AM
// so the timeline aligns with how futures traders think (overnight is on
// the right, NY day in the middle).
function etHour(d: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  })
    .formatToParts(d)
    .reduce<Record<string, string>>((acc, p) => {
      if (p.type === "hour" || p.type === "minute") acc[p.type] = p.value;
      return acc;
    }, {});
  const h = Number(parts.hour ?? 0);
  const m = Number(parts.minute ?? 0);
  return h + m / 60;
}

interface Block {
  name: string;
  startHr: number;
  endHr: number;
  color: string;
}

// 24-hour ET layout starting at 4 AM. Hours that wrap past midnight get +24.
const BLOCKS: Block[] = [
  { name: "Pre-Mkt",   startHr: 4,    endHr: 9.5,  color: "#00aaff" },
  { name: "NY Open",   startHr: 9.5,  endHr: 11,   color: "#00ff88" },
  { name: "Midday",    startHr: 11,   endHr: 13.5, color: "#888892" },
  { name: "NY Power",  startHr: 13.5, endHr: 16,   color: "#ffd700" },
  { name: "After Hrs", startHr: 16,   endHr: 20,   color: "#aa50ff" },
  { name: "Asia",      startHr: 20,   endHr: 28,   color: "#0066cc" }, // → 4 AM
];

const DAY_START = 4;
const DAY_END = 28;
const DAY_WIDTH = DAY_END - DAY_START;

function pctFor(hr: number): number {
  const wrapped = hr < DAY_START ? hr + 24 : hr;
  return ((wrapped - DAY_START) / DAY_WIDTH) * 100;
}

export default function SessionTimeline() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const currentHour = now ? etHour(now) : 9.5;
  const markerPct = pctFor(currentHour);

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock3 size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">TRADING DAY TIMELINE</h2>
        </div>
        <div className="text-[10px] text-muted">
          ET reference · {now ? new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hour12: true,
          }).format(now) : "—"}
        </div>
      </div>

      {/* Timeline bar */}
      <div className="relative">
        <div className="flex h-9 rounded-lg overflow-hidden border border-border">
          {BLOCKS.map((b) => {
            const width = ((b.endHr - b.startHr) / DAY_WIDTH) * 100;
            return (
              <div
                key={b.name}
                style={{
                  width: `${width}%`,
                  background: `linear-gradient(180deg, ${b.color}30 0%, ${b.color}10 100%)`,
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                }}
                className="relative flex items-center justify-center text-[10px] font-semibold uppercase tracking-wider"
              >
                <span style={{ color: b.color }}>{b.name}</span>
              </div>
            );
          })}
        </div>

        {/* NOW marker */}
        {now && (
          <div
            className="absolute top-[-6px] bottom-[-6px] w-0.5 bg-accent z-10"
            style={{ left: `${markerPct}%`, boxShadow: "0 0 8px rgba(0,255,136,0.7)" }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-accent text-bg text-[9px] font-bold uppercase tracking-wider">
              NOW
            </div>
          </div>
        )}
      </div>

      {/* Hour labels */}
      <div className="mt-2 flex justify-between text-[9px] text-muted font-mono">
        <span>4:00 AM</span>
        <span>9:30 AM</span>
        <span>11:00 AM</span>
        <span>1:30 PM</span>
        <span>4:00 PM</span>
        <span>8:00 PM</span>
        <span>4:00 AM</span>
      </div>
    </div>
  );
}
