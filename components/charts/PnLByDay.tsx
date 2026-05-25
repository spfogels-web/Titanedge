"use client";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DayPnl {
  label: string;
  value: number;
}

// Mock 30 days of daily P&L
const MOCK: DayPnl[] = [
  { label: "Apr 18", value: 180 },
  { label: "Apr 19", value: 240 },
  { label: "Apr 20", value: -140 },
  { label: "Apr 21", value: 360 },
  { label: "Apr 22", value: 220 },
  { label: "Apr 23", value: 480 },
  { label: "Apr 24", value: 90 },
  { label: "Apr 25", value: -210 },
  { label: "Apr 26", value: 310 },
  { label: "Apr 27", value: 420 },
  { label: "Apr 28", value: 150 },
  { label: "Apr 29", value: 380 },
  { label: "Apr 30", value: -80 },
  { label: "May 1", value: 260 },
  { label: "May 2", value: 510 },
  { label: "May 3", value: 290 },
  { label: "May 5", value: 320 },
  { label: "May 6", value: -110 },
  { label: "May 7", value: 400 },
  { label: "May 8", value: 175 },
  { label: "May 9", value: 280 },
  { label: "May 10", value: 440 },
  { label: "May 12", value: 200 },
  { label: "May 13", value: 360 },
  { label: "May 14", value: -50 },
  { label: "May 15", value: 250 },
  { label: "May 16", value: 390 },
  { label: "May 17", value: 310 },
  { label: "May 18", value: 470 },
];

export default function PnLByDay() {
  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-semibold mb-2">PnL By Day</div>
      <div className="flex-1 min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#27272f" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#888892", fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              interval={5}
            />
            <YAxis
              tick={{ fill: "#888892", fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              width={36}
              tickFormatter={(v: number) => `$${v}`}
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
                `${v >= 0 ? "+" : "−"}$${Math.abs(v).toFixed(2)}`,
                "P&L",
              ]}
            />
            <Bar dataKey="value" isAnimationActive={false} radius={[2, 2, 0, 0]}>
              {MOCK.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.value >= 0 ? "#00ff88" : "#ff3366"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
