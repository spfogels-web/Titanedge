"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Row {
  label: string;
  value: string;
  color: string;
}

// Mock metrics — wired to real /api/stats aggregates in Phase 5C.
const ROWS: Row[] = [
  { label: "Total Net Profit", value: "$2,453.75", color: "text-accent" },
  { label: "Gross Profit",     value: "$4,120.80", color: "text-accent" },
  { label: "Gross Loss",       value: "-$1,667.05", color: "text-accentRed" },
  { label: "Average Win",      value: "$91.57",   color: "text-accent" },
  { label: "Average Loss",     value: "-$79.38",  color: "text-accentRed" },
  { label: "Largest Win",      value: "$262.50",  color: "text-accent" },
  { label: "Largest Loss",     value: "-$150.00", color: "text-accentRed" },
  { label: "Sharpe Ratio",     value: "1.82",     color: "text-white" },
  { label: "Expectancy",       value: "$37.18",   color: "text-accent" },
];

export default function PerformanceSummary() {
  const [range, setRange] = useState("30 Days");
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-wide">
          PERFORMANCE SUMMARY
        </h2>
        <button
          type="button"
          onClick={() =>
            setRange(range === "30 Days" ? "90 Days" : "30 Days")
          }
          className="flex items-center gap-1 text-xs text-muted bg-panel2 px-2 py-1 rounded-md border border-border hover:text-white transition"
        >
          {range} <ChevronDown size={12} />
        </button>
      </div>
      <div className="space-y-2 text-xs">
        {ROWS.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between"
          >
            <span className="text-muted">{r.label}</span>
            <span className={`font-mono font-semibold ${r.color}`}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
