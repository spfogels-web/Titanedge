"use client";
import { Calendar } from "lucide-react";
import { todaysCalendar, type ImpactLevel } from "@/lib/mock/news";

const IMPACT_META: Record<ImpactLevel, { dot: string; label: string; pill: string }> = {
  HIGH: { dot: "bg-accentRed", label: "HIGH", pill: "bg-accentRed/10 text-accentRed" },
  MED:  { dot: "bg-gold",      label: "MED",  pill: "bg-gold/10 text-gold" },
  LOW:  { dot: "bg-accentBlue",label: "LOW",  pill: "bg-accentBlue/10 text-accentBlue" },
};

export default function EconomicCalendar() {
  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-md bg-accentBlue/10 flex items-center justify-center">
          <Calendar size={14} className="text-accentBlue" />
        </div>
        <h2 className="text-sm font-semibold tracking-wide">ECONOMIC CALENDAR — TODAY</h2>
        <span className="ml-auto text-[10px] text-muted">{todaysCalendar.length} events</span>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-xs">
          <thead className="text-muted uppercase tracking-wider">
            <tr>
              <th className="text-left py-2 font-normal">Time (EST)</th>
              <th className="text-left font-normal">Event</th>
              <th className="text-center font-normal">Impact</th>
              <th className="text-right font-normal">Forecast</th>
              <th className="text-right font-normal">Previous</th>
              <th className="text-right font-normal">Actual</th>
            </tr>
          </thead>
          <tbody>
            {todaysCalendar.map((ev, i) => {
              const meta = IMPACT_META[ev.impact];
              return (
                <tr key={i} className="border-t border-border">
                  <td className="py-2.5 font-mono text-muted">{ev.timeEst}</td>
                  <td>
                    <span className="text-[10px] text-muted font-mono mr-2">{ev.country}</span>
                    <span className="font-medium">{ev.title}</span>
                  </td>
                  <td className="text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${meta.pill}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="text-right font-mono text-muted">{ev.forecast ?? "—"}</td>
                  <td className="text-right font-mono text-muted">{ev.previous ?? "—"}</td>
                  <td className={`text-right font-mono ${ev.actual ? "text-white" : "text-muted"}`}>
                    {ev.actual ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
