"use client";
import { useState } from "react";
import { Maximize2, BarChart3 } from "lucide-react";

interface SymbolDef {
  label: string;
  tv: string;        // TradingView symbol id (exchange:ticker)
  accent: string;
}

const SYMBOLS: SymbolDef[] = [
  { label: "MNQ", tv: "CME_MINI:MNQ1!",   accent: "#00ff88" },
  { label: "MES", tv: "CME_MINI:MES1!",   accent: "#00aaff" },
  { label: "ES",  tv: "CME_MINI:ES1!",    accent: "#aa50ff" },
  { label: "MGC", tv: "COMEX_MINI:MGC1!", accent: "#ffd700" },
  { label: "MCL", tv: "NYMEX_MINI:MCL1!", accent: "#ff8c42" },
  { label: "VIX", tv: "CBOE:VIX",         accent: "#ff3366" },
];

const TIMEFRAMES = ["1", "5", "15", "60", "D"];

export default function LiveTradesChart({ initialSymbol = "MNQ" }: { initialSymbol?: string }) {
  const [symbol, setSymbol] = useState<SymbolDef>(
    SYMBOLS.find((s) => s.label === initialSymbol) ?? SYMBOLS[0],
  );
  const [tf, setTf] = useState<string>("5");

  // TradingView's widget embed — no API key needed, dark theme, ET timezone.
  const url =
    `https://s.tradingview.com/widgetembed/?` +
    `symbol=${encodeURIComponent(symbol.tv)}` +
    `&interval=${tf}` +
    `&theme=dark` +
    `&style=1` +
    `&timezone=America%2FNew_York` +
    `&toolbar_bg=%2313131a` +
    `&hidesidetoolbar=0` +
    `&studies=%5B%5D` +
    `&hideideas=1` +
    `&withdateranges=1` +
    `&allow_symbol_change=1`;

  function openFullscreen() {
    window.open(
      `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol.tv)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="bg-panel border border-border rounded-xl overflow-hidden flex flex-col h-full">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-panel2/40">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted uppercase tracking-wider mr-2">
            <BarChart3 size={11} />
            Symbol
          </div>
          <div className="flex items-center gap-1">
            {SYMBOLS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setSymbol(s)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition ${
                  symbol.label === s.label
                    ? "bg-panel border border-accent/40"
                    : "text-muted hover:text-white"
                }`}
                style={symbol.label === s.label ? { color: s.accent } : undefined}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {TIMEFRAMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTf(t)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition ${
                  tf === t
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "text-muted hover:text-white"
                }`}
              >
                {t === "D" ? "1D" : `${t}m`}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={openFullscreen}
            aria-label="Open in TradingView"
            className="p-1.5 rounded text-muted hover:text-white hover:bg-panel2 transition"
            title="Open in TradingView (new tab)"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Chart iframe */}
      <div className="flex-1 min-h-[480px] bg-black">
        <iframe
          // key forces a remount when symbol/timeframe changes so widget reloads
          key={`${symbol.tv}-${tf}`}
          src={url}
          title={`${symbol.label} ${tf} chart`}
          className="w-full h-full block"
          frameBorder={0}
          allow="fullscreen"
        />
      </div>

      <div className="px-4 py-2 border-t border-border bg-panel2/30 text-[10px] text-muted">
        Live TradingView widget · ET timezone · Click symbol or timeframe to switch.
      </div>
    </div>
  );
}
