"use client";
import { useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

interface EquityPoint {
  label: string;
  value: number;
}

// 30 day mock equity curve walking up to ~$52,418
const MOCK_30D: EquityPoint[] = [
  { label: "Apr 18", value: 46500 },
  { label: "Apr 19", value: 46720 },
  { label: "Apr 20", value: 47100 },
  { label: "Apr 21", value: 46900 },
  { label: "Apr 22", value: 47350 },
  { label: "Apr 23", value: 47800 },
  { label: "Apr 24", value: 48050 },
  { label: "Apr 25", value: 48300 },
  { label: "Apr 26", value: 48400 },
  { label: "Apr 27", value: 48900 },
  { label: "Apr 28", value: 49050 },
  { label: "Apr 29", value: 49500 },
  { label: "Apr 30", value: 49350 },
  { label: "May 1",  value: 49800 },
  { label: "May 2",  value: 50100 },
  { label: "May 3",  value: 50450 },
  { label: "May 5",  value: 50700 },
  { label: "May 6",  value: 50950 },
  { label: "May 7",  value: 51200 },
  { label: "May 8",  value: 51100 },
  { label: "May 9",  value: 51400 },
  { label: "May 10", value: 51650 },
  { label: "May 12", value: 51800 },
  { label: "May 13", value: 51950 },
  { label: "May 14", value: 52000 },
  { label: "May 15", value: 52150 },
  { label: "May 16", value: 52300 },
  { label: "May 17", value: 52380 },
  { label: "May 18", value: 52418.75 },
];

export default function EquityCurve() {
  const [range, setRange] = useState<"30 Days" | "7 Days" | "90 Days">(
    "30 Days",
  );

  return (
    <div className="bg-panel border border-border rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm tracking-wide">EQUITY CURVE</h2>
        <button
          type="button"
          onClick={() =>
            setRange(
              range === "30 Days"
                ? "90 Days"
                : range === "90 Days"
                ? "7 Days"
                : "30 Days",
            )
          }
          className="flex items-center gap-1 text-xs text-muted bg-panel2 px-2 py-1 rounded-md border border-border hover:text-white transition"
        >
          {range} <ChevronDown size={12} />
        </button>
      </div>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={MOCK_30D}
            margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff88" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#27272f" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#888892", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={5}
            />
            <YAxis
              tick={{ fill: "#888892", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={48}
              tickFormatter={(v: number) => `$${Math.round(v / 1000)}K`}
              domain={["dataMin - 500", "dataMax + 500"]}
            />
            <Tooltip
              contentStyle={{
                background: "#13131a",
                border: "1px solid #27272f",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#888892" }}
              formatter={(v: number) => [
                `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                "Equity",
              ]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#00ff88"
              strokeWidth={2}
              fill="url(#equityGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
