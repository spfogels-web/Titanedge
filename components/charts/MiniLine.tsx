"use client";
import { LineChart, Line, ResponsiveContainer, YAxis } from "recharts";

interface MiniLineProps {
  data: number[];
  color?: string;
  height?: number;
  ticks?: number[];
  domain?: [number, number];
}

export default function MiniLine({
  data,
  color = "#00aaff",
  height = 50,
  ticks,
  domain,
}: MiniLineProps) {
  const series = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={series} margin={{ top: 2, right: 2, bottom: 2, left: 22 }}>
          <YAxis
            tick={{ fill: "#888892", fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            width={20}
            {...(ticks ? { ticks } : {})}
            {...(domain ? { domain } : {})}
          />
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
