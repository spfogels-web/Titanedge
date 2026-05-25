"use client";
import type { Module } from "@/lib/mock/academy";
import { themeFor } from "@/lib/academyTheme";

// Inline SVG illustrations per module. Small (140x60), themed via the
// module's primary color. Used inside the module card and the module page
// header.
interface Props {
  iconKey: Module["icon"];
  width?: number;
  height?: number;
  opacity?: number;
}

export default function ModuleVisual({
  iconKey,
  width = 140,
  height = 60,
  opacity = 1,
}: Props) {
  const t = themeFor(iconKey);
  const stroke = t.primary;
  const stroke2 = "#27272f";

  switch (iconKey) {
    case "foundations":
      // Stacked rectangles like building blocks rising
      return (
        <svg width={width} height={height} viewBox="0 0 140 60" style={{ opacity }} aria-hidden>
          <rect x="10"  y="42" width="22" height="10" fill={stroke2} rx="1" />
          <rect x="36"  y="34" width="22" height="18" fill={stroke2} rx="1" />
          <rect x="62"  y="22" width="22" height="30" fill={stroke}   rx="1" opacity="0.65" />
          <rect x="88"  y="14" width="22" height="38" fill={stroke}   rx="1" opacity="0.85" />
          <rect x="114" y="6"  width="22" height="46" fill={stroke}   rx="1" />
        </svg>
      );

    case "technical":
      // EMA-ish line chart with two crossing curves
      return (
        <svg width={width} height={height} viewBox="0 0 140 60" style={{ opacity }} aria-hidden>
          <polyline
            points="0,45 20,42 40,38 60,30 80,22 100,18 120,12 140,8"
            fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
          <polyline
            points="0,50 20,48 40,46 60,40 80,34 100,30 120,26 140,22"
            fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"
          />
          <line x1="0" y1="58" x2="140" y2="58" stroke={stroke2} strokeWidth="1" />
        </svg>
      );

    case "setups":
      // 3 candlesticks: bear, doji, bull (pattern abstraction)
      return (
        <svg width={width} height={height} viewBox="0 0 140 60" style={{ opacity }} aria-hidden>
          {/* candle 1 - bear */}
          <line x1="30" y1="10" x2="30" y2="50" stroke="#ff3366" strokeWidth="1.5" />
          <rect x="24" y="20" width="12" height="22" fill="#ff3366" rx="1" />
          {/* candle 2 - doji */}
          <line x1="70" y1="14" x2="70" y2="48" stroke={stroke} strokeWidth="1.5" />
          <rect x="64" y="28" width="12" height="6"  fill={stroke} rx="1" />
          {/* candle 3 - bull */}
          <line x1="110" y1="8" x2="110" y2="52" stroke="#00ff88" strokeWidth="1.5" />
          <rect x="104" y="18" width="12" height="28" fill="#00ff88" rx="1" />
          {/* horizontal "level" line */}
          <line x1="6" y1="46" x2="134" y2="46" stroke={stroke} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
        </svg>
      );

    case "risk":
      // Shield with checkmark
      return (
        <svg width={width} height={height} viewBox="0 0 140 60" style={{ opacity }} aria-hidden>
          <path
            d="M70 6 L98 18 L98 32 C98 44 86 52 70 56 C54 52 42 44 42 32 L42 18 Z"
            fill={stroke} opacity="0.18"
            stroke={stroke} strokeWidth="2"
          />
          <polyline
            points="58,32 67,40 84,22"
            fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      );

    case "psychology":
      // Brain node graph
      return (
        <svg width={width} height={height} viewBox="0 0 140 60" style={{ opacity }} aria-hidden>
          <circle cx="30"  cy="20" r="4" fill={stroke} />
          <circle cx="70"  cy="10" r="3" fill={stroke} opacity="0.7" />
          <circle cx="110" cy="22" r="4" fill={stroke} />
          <circle cx="50"  cy="42" r="3" fill={stroke} opacity="0.7" />
          <circle cx="90"  cy="44" r="4" fill={stroke} />
          <circle cx="30"  cy="50" r="2" fill={stroke} opacity="0.6" />
          <circle cx="120" cy="50" r="2" fill={stroke} opacity="0.6" />
          <g stroke={stroke} strokeWidth="1" opacity="0.55">
            <line x1="30"  y1="20" x2="70"  y2="10" />
            <line x1="70"  y1="10" x2="110" y2="22" />
            <line x1="30"  y1="20" x2="50"  y2="42" />
            <line x1="50"  y1="42" x2="90"  y2="44" />
            <line x1="90"  y1="44" x2="110" y2="22" />
            <line x1="30"  y1="50" x2="50"  y2="42" />
            <line x1="120" y1="50" x2="90"  y2="44" />
          </g>
        </svg>
      );

    case "context":
      // Globe / latitudinal grid
      return (
        <svg width={width} height={height} viewBox="0 0 140 60" style={{ opacity }} aria-hidden>
          <circle cx="70" cy="30" r="22" fill="none" stroke={stroke} strokeWidth="1.5" />
          <ellipse cx="70" cy="30" rx="22" ry="10" fill="none" stroke={stroke} strokeWidth="1" opacity="0.7" />
          <ellipse cx="70" cy="30" rx="22" ry="6" fill="none" stroke={stroke} strokeWidth="1" opacity="0.5" />
          <line x1="48" y1="30" x2="92" y2="30" stroke={stroke} strokeWidth="1" />
          <line x1="70" y1="8"  x2="70" y2="52" stroke={stroke} strokeWidth="1" />
        </svg>
      );

    case "bot":
      // Sequence flow: nodes connected by arrows
      return (
        <svg width={width} height={height} viewBox="0 0 140 60" style={{ opacity }} aria-hidden>
          <circle cx="14"  cy="30" r="5" fill={stroke} />
          <circle cx="46"  cy="14" r="4" fill={stroke} opacity="0.7" />
          <circle cx="46"  cy="46" r="4" fill={stroke} opacity="0.7" />
          <circle cx="80"  cy="30" r="5" fill={stroke} />
          <circle cx="116" cy="14" r="4" fill={stroke} opacity="0.7" />
          <circle cx="116" cy="46" r="4" fill={stroke} opacity="0.7" />
          <g stroke={stroke} strokeWidth="1.5" fill="none" opacity="0.8">
            <line x1="19"  y1="28" x2="42"  y2="16" />
            <line x1="19"  y1="32" x2="42"  y2="44" />
            <line x1="50"  y1="14" x2="76"  y2="28" />
            <line x1="50"  y1="46" x2="76"  y2="32" />
            <line x1="85"  y1="28" x2="112" y2="16" />
            <line x1="85"  y1="32" x2="112" y2="44" />
          </g>
        </svg>
      );

    default:
      return null;
  }
}
