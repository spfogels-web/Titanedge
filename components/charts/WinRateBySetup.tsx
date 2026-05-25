"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface SetupSlice {
  name: string;
  value: number;
  color: string;
}

const MOCK: SetupSlice[] = [
  { name: "Pivot Bounce",       value: 68, color: "#00ff88" },
  { name: "Breakout",           value: 54, color: "#ffd700" },
  { name: "Trend Continuation", value: 72, color: "#00aaff" },
  { name: "Rejection",          value: 48, color: "#ff3366" },
];

export default function WinRateBySetup() {
  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-semibold mb-2">WIN RATE BY SETUP</div>
      <div className="flex items-center gap-4 flex-1">
        <div className="w-[100px] h-[100px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={MOCK}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={26}
                outerRadius={48}
                stroke="none"
                isAnimationActive={false}
              >
                {MOCK.map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5">
          {MOCK.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-muted">{s.name}</span>
              </div>
              <span className="font-mono font-semibold">{s.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
