"use client";

interface ConfidenceGaugeProps {
  value: number; // 0-100
  size?: number;
  label?: string;
  thickness?: number;
}

export default function ConfidenceGauge({
  value,
  size = 100,
  label,
  thickness = 6,
}: ConfidenceGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 70 ? "#00ff88" :
    clamped >= 40 ? "#ffd700" :
                    "#ff3366";

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#27272f"
          strokeWidth={thickness}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold leading-none" style={{ color }}>
          {Math.round(clamped)}
        </div>
        {label && (
          <div className="text-[9px] text-muted uppercase tracking-wider mt-0.5">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
