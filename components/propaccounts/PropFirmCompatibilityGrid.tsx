"use client";
import { useState } from "react";
import { CheckCircle2, Zap, Clock, ExternalLink, Briefcase, Info, AlertCircle } from "lucide-react";
import { propFirms, registryRollup, type PropFirm, type ConnectionMethod, type FirmStatus } from "@/lib/mock/propFirmRegistry";

const STATUS_META: Record<FirmStatus, { color: string; label: string }> = {
  "available":   { color: "#00ff88", label: "Available" },
  "beta":        { color: "#ffd700", label: "Beta" },
  "coming-soon": { color: "#888892", label: "Coming Soon" },
  "manual-only": { color: "#00aaff", label: "Manual / Bot-tagged" },
};

const CONNECTION_META: Record<ConnectionMethod, { color: string; icon: typeof Zap; short: string }> = {
  "Auto-Sync API":       { color: "#00ff88", icon: Zap,           short: "API" },
  "Webhook Bridge":      { color: "#7c3aed", icon: Zap,           short: "Webhook" },
  "Bot-Tagged Manual":   { color: "#00aaff", icon: CheckCircle2,  short: "Bot-tagged" },
  "Manual Entry":        { color: "#888892", icon: Clock,         short: "Manual" },
  "NinjaTrader Bridge":  { color: "#dc2626", icon: Briefcase,     short: "NT8" },
};

type FilterKey = "all" | "autoSync" | "autoRoute" | "manual";

export default function PropFirmCompatibilityGrid() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const rollup = registryRollup();

  const filtered = propFirms.filter((f) => {
    if (filter === "autoSync") return f.autoSync;
    if (filter === "autoRoute") return f.autoRoute;
    if (filter === "manual") return !f.autoSync && !f.autoRoute;
    return true;
  });

  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-accentBlue" />
            <h2 className="text-sm font-semibold tracking-wide">
              PROP FIRM COMPATIBILITY
            </h2>
          </div>
          <p className="text-xs text-muted mt-1">
            What we can connect to today vs what's manual. Honest matrix of {rollup.total} firms.
          </p>
        </div>
      </div>

      {/* Rollup metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <RollupTile
          label="Total firms"
          value={String(rollup.total)}
          sub="supported"
          color="text-white"
        />
        <RollupTile
          label="Auto-Sync"
          value={String(rollup.autoSyncCount)}
          sub="balance + positions readable via API"
          color="text-accent"
        />
        <RollupTile
          label="Auto-Route"
          value={String(rollup.routeCount)}
          sub="we can place orders"
          color="text-accentBlue"
        />
        <RollupTile
          label="Manual / Bot-tagged"
          value={String(rollup.manualOnly)}
          sub="track via bot signals + paste"
          color="text-muted"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {([
          ["all", "All"],
          ["autoSync", "Auto-Sync"],
          ["autoRoute", "Auto-Route"],
          ["manual", "Manual / Bot-tagged"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border transition ${
              filter === key
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border text-muted hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((f) => (
          <FirmCard key={f.id} firm={f} />
        ))}
      </div>

      {/* Footnote */}
      <div className="mt-5 pt-4 border-t border-border flex items-start gap-2 text-[10px] text-muted">
        <Info size={11} className="shrink-0 mt-0.5 text-accentBlue" />
        <span>
          Most futures prop firms use <span className="text-white font-mono">Rithmic</span>,{" "}
          <span className="text-white font-mono">Tradovate</span>, or{" "}
          <span className="text-white font-mono">CQG</span> under the hood.
          Tradovate has a public REST API (auto-sync works). Rithmic/CQG require institutional
          access — for retail accounts we route orders via Tradovate or a local NinjaTrader bridge
          and you paste balance / DD periodically. All status badges below are honest.
        </span>
      </div>
    </div>
  );
}

function FirmCard({ firm }: { firm: PropFirm }) {
  const status = STATUS_META[firm.status];
  return (
    <div
      className="rounded-lg border p-4 flex flex-col"
      style={{
        borderColor: firm.accent + "30",
        background: `linear-gradient(135deg, ${firm.accent}08 0%, transparent 70%), #1a1a24`,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
          style={{ backgroundColor: firm.accent + "20", color: firm.accent }}
        >
          {firm.shortName}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{firm.name}</span>
          </div>
          <div className="text-[10px] text-muted mt-0.5">
            {firm.backend} backend · {firm.accountTypes.join(" / ")}
          </div>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
          style={{ backgroundColor: status.color + "20", color: status.color }}
        >
          {firm.status === "available" ? <CheckCircle2 size={9} /> :
           firm.status === "beta"      ? <AlertCircle size={9} /> :
                                         <Clock size={9} />}
          {status.label}
        </span>
      </div>

      {/* Account sizes */}
      {firm.accountSizes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {firm.accountSizes.slice(0, 6).map((s) => (
            <span
              key={s}
              className="text-[9px] font-mono bg-bg/40 border border-border rounded px-1.5 py-0.5"
            >
              ${(s / 1000).toFixed(0)}K
            </span>
          ))}
          {firm.accountSizes.length > 6 && (
            <span className="text-[9px] text-muted">+{firm.accountSizes.length - 6}</span>
          )}
        </div>
      )}

      {/* Connection methods */}
      <div className="mt-3 space-y-1">
        <div className="text-[9px] text-muted uppercase tracking-wider">Connection</div>
        <div className="flex flex-wrap gap-1">
          {firm.connectionMethods.map((m) => {
            const meta = CONNECTION_META[m];
            const isPrimary = m === firm.primaryConnection;
            const Icon = meta.icon;
            return (
              <span
                key={m}
                className={`inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                  isPrimary ? "" : "opacity-70"
                }`}
                style={{ backgroundColor: meta.color + "15", color: meta.color }}
                title={isPrimary ? "Primary connection method" : "Available alternative"}
              >
                <Icon size={9} />
                {meta.short}
                {isPrimary && <span className="opacity-70">★</span>}
              </span>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <p className="mt-3 text-[10px] text-muted leading-relaxed flex-1">{firm.notes}</p>

      {/* Footer */}
      {firm.websiteUrl && (
        <div className="mt-3 pt-2 border-t border-border">
          <a
            href={firm.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted hover:text-accentBlue inline-flex items-center gap-1"
          >
            Visit firm
            <ExternalLink size={9} />
          </a>
        </div>
      )}
    </div>
  );
}

function RollupTile({
  label, value, sub, color,
}: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-panel2/40 border border-border rounded-lg p-3">
      <div className="text-[10px] text-muted uppercase tracking-wider">{label}</div>
      <div className={`text-xl font-bold font-mono mt-1 ${color}`}>{value}</div>
      <div className="text-[10px] text-muted mt-0.5 leading-tight">{sub}</div>
    </div>
  );
}
