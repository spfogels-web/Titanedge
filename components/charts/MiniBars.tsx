"use client";
import { BarChart, Bar, ResponsiveContainer, YAxis } from "recharts";

interface MiniBarsProps {
  data: number[];
  color?: string;
  height?: number;
  showAxis?: boolean;
}

export default function MiniBars({
  data,
  color = "#ff3366",
  height = 50,
  showAxis = false,
}: MiniBarsProps) {
  const series = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={series} margin={{ top: 2, right: 2, bottom: 2, left: showAxis ? 22 : 2 }}>
          <YAxis
            hide={!showAxis}
            tick={{ fill: "#888892", fontSize: 9 }}
            tickLine={false}
            axisLine={false}
            width={20}
          />
          <Bar dataKey="v" fill={color} isAnimationActive={false} radius={[1, 1, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
