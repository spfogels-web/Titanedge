"use client";
import { useState } from "react";
import {
  Copy, CheckCheck, Webhook, Link2, AlertTriangle,
  ChevronDown, ChevronUp, Zap,
} from "lucide-react";

// ─── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                 bg-panel2 border border-border hover:border-accent/50 transition"
    >
      {copied ? (
        <><CheckCheck size={13} className="text-accent" /><span className="text-accent">Copied</span></>
      ) : (
        <><Copy size={13} className="text-muted" /><span className="text-muted">Copy</span></>
      )}
    </button>
  );
}

// ─── Code block ────────────────────────────────────────────────────────────────
function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="relative">
      {label && (
        <div className="text-[10px] font-semibold tracking-widest text-muted uppercase mb-1.5">
          {label}
        </div>
      )}
      <div className="relative bg-bg border border-border rounded-lg overflow-hidden">
        <div className="absolute top-2 right-2">
          <CopyButton text={code} />
        </div>
        <pre className="text-xs font-mono text-accent leading-relaxed p-4 pr-24 overflow-x-auto whitespace-pre">
          {code}
        </pre>
      </div>
    </div>
  );
}

// ─── Collapsible section ───────────────────────────────────────────────────────
function Section({
  title, icon: Icon, defaultOpen = false, children,
}: {
  title: string;
  icon: typeof Webhook;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-panel border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-panel2 transition"
      >
        <div className="flex items-center gap-3">
          <Icon size={17} className="text-accent" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-muted" /> : <ChevronDown size={15} className="text-muted" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-5 border-t border-border pt-5">{children}</div>}
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ label, color = "accent" }: { label: string; color?: "accent" | "blue" | "red" | "gold" }) {
  const cls = {
    accent: "bg-accent/10 text-accent border-accent/30",
    blue:   "bg-accentBlue/10 text-accentBlue border-accentBlue/30",
    red:    "bg-accentRed/10 text-accentRed border-accentRed/30",
    gold:   "bg-gold/10 text-gold border-gold/30",
  }[color];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

// ─── Alert templates ───────────────────────────────────────────────────────────
// These JSON blobs go into TradingView → Create Alert → Message field.
// They are sent to TradersPost, which executes the order at Tradovate
// and (optionally) forwards to the TitanEdge /api/traderspost endpoint.

const ALERT_TEMPLATES = [
  {
    id: "long-entry",
    label: "Long Entry (Buy)",
    badge: { label: "BUY", color: "accent" as const },
    description: "Opens a new LONG position. Paste this in a buy-signal alert.",
    code: `{
  "ticker": "{{ticker}}",
  "action": "buy",
  "sentiment": "bullish",
  "orderType": "market",
  "quantity": 1,
  "price": {{close}}
}`,
  },
  {
    id: "short-entry",
    label: "Short Entry (Sell)",
    badge: { label: "SELL", color: "red" as const },
    description: "Opens a new SHORT position. Paste this in a sell-signal alert.",
    code: `{
  "ticker": "{{ticker}}",
  "action": "sell",
  "sentiment": "bearish",
  "orderType": "market",
  "quantity": 1,
  "price": {{close}}
}`,
  },
  {
    id: "exit",
    label: "Exit (Close Position)",
    badge: { label: "EXIT", color: "gold" as const },
    description: "Closes the current open position (LONG or SHORT). Use for TP/SL hit alerts.",
    code: `{
  "ticker": "{{ticker}}",
  "action": "exit",
  "sentiment": "flat",
  "price": {{close}}
}`,
  },
  {
    id: "long-with-levels",
    label: "Long Entry + Stop & Target",
    badge: { label: "BUY + SL/TP", color: "accent" as const },
    description: "Full long entry with stop-loss and take-profit. Requires your Pine script to plot those levels.",
    code: `{
  "ticker": "{{ticker}}",
  "action": "buy",
  "sentiment": "bullish",
  "orderType": "market",
  "quantity": 1,
  "price": {{close}},
  "stopPrice": {{plot("Stop Loss")}},
  "takeProfit": {{plot("Take Profit")}}
}`,
  },
  {
    id: "short-with-levels",
    label: "Short Entry + Stop & Target",
    badge: { label: "SELL + SL/TP", color: "red" as const },
    description: "Full short entry with stop-loss and take-profit levels from your Pine plot.",
    code: `{
  "ticker": "{{ticker}}",
  "action": "sell",
  "sentiment": "bearish",
  "orderType": "market",
  "quantity": 1,
  "price": {{close}},
  "stopPrice": {{plot("Stop Loss")}},
  "takeProfit": {{plot("Take Profit")}}
}`,
  },
  {
    id: "strategy-alert",
    label: "Strategy Script Alert (auto action)",
    badge: { label: "STRATEGY", color: "blue" as const },
    description: "When your Pine strategy fires any order. Uses {{strategy.order.action}} so one alert handles both sides.",
    code: `{
  "ticker": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "orderType": "market",
  "quantity": {{strategy.order.contracts}},
  "price": {{strategy.order.price}},
  "comment": "{{strategy.order.id}}"
}`,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  // Derive the deployed origin — works in both localhost and Railway
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://YOUR-APP.railway.app";

  const webhookUrl     = `${origin}/api/webhook`;
  const traderspostUrl = `${origin}/api/traderspost`;

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold mb-1">Settings</h1>
        <p className="text-sm text-muted">
          Webhook endpoints, TradersPost connection, and alert templates.
        </p>
      </div>

      {/* ── TradersPost Integration ─────────────────────────────────────────── */}
      <Section title="TradersPost Integration" icon={Zap} defaultOpen>
        <div className="space-y-3 text-sm text-muted leading-relaxed">
          <p>
            <span className="text-white font-medium">TradersPost</span> sits between
            TradingView and your broker (Tradovate). When a signal fires:
          </p>
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>TradingView sends the alert JSON to your <strong className="text-white">TradersPost webhook URL</strong>.</li>
            <li>TradersPost executes the order at Tradovate (demo or live).</li>
            <li>TradersPost also forwards the signal here to <strong className="text-white">TitanEdge</strong> for logging.</li>
          </ol>
        </div>

        {/* Step 1 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-bold">1</span>
            Add TitanEdge as a secondary webhook in TradersPost
          </div>
          <p className="text-xs text-muted pl-7">
            In TradersPost → your strategy → Webhooks → <em>Add webhook</em> → paste this URL:
          </p>
          <div className="pl-7">
            <div className="relative bg-bg border border-border rounded-lg p-3 font-mono text-xs text-accentBlue flex items-center justify-between gap-3">
              <span className="break-all">{traderspostUrl}</span>
              <CopyButton text={traderspostUrl} />
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-bold">2</span>
            Append your secret (if set)
          </div>
          <p className="text-xs text-muted pl-7">
            If <code className="bg-panel2 px-1 rounded">WEBHOOK_SECRET</code> is configured on Railway, append it as a query param:
          </p>
          <div className="pl-7">
            <CodeBlock code={`${traderspostUrl}?key=YOUR_WEBHOOK_SECRET`} />
          </div>
        </div>

        {/* Step 3 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-bold">3</span>
            Choose alert templates below and paste into TradingView
          </div>
          <p className="text-xs text-muted pl-7">
            Each alert in TradingView needs a JSON message body. Pick the template
            matching your signal type from the section below.
          </p>
        </div>

        {/* Field mapping reference */}
        <div>
          <div className="text-xs font-semibold text-muted uppercase tracking-widest mb-2">
            TradersPost → TitanEdge field mapping
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              ["ticker", "symbol"],
              ["quantity", "qty"],
              ["stopPrice", "stop_price"],
              ["takeProfit", "target_price"],
              ["action: exit", "closes open position"],
              ["action: cancel", "cancels open trade"],
            ].map(([from, to]) => (
              <div key={from} className="flex items-center gap-2 bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono">
                <span className="text-accentBlue">{from}</span>
                <span className="text-muted">→</span>
                <span className="text-accent">{to}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Pine Script Alert Templates ─────────────────────────────────────── */}
      <Section title="TradingView Alert Templates (Pine Script)" icon={Copy} defaultOpen>
        <p className="text-sm text-muted">
          Copy the JSON for your signal type and paste it into the{" "}
          <strong className="text-white">Message</strong> field when creating a TradingView alert.
          Set the <strong className="text-white">Webhook URL</strong> to your TradersPost strategy webhook URL.
        </p>

        <div className="grid gap-4">
          {ALERT_TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="bg-bg border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Badge label={tpl.badge.label} color={tpl.badge.color} />
                <span className="font-semibold text-sm">{tpl.label}</span>
              </div>
              <p className="text-xs text-muted">{tpl.description}</p>
              <CodeBlock code={tpl.code} />
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 bg-gold/5 border border-gold/20 rounded-xl p-4">
          <AlertTriangle size={15} className="text-gold mt-0.5 shrink-0" />
          <div className="text-xs text-muted space-y-1">
            <p>
              <span className="text-white font-medium">Plot variables</span> like{" "}
              <code className="bg-panel2 px-1 rounded">{"{{plot(\"Stop Loss\")}}"}</code> only
              work if your Pine script has a{" "}
              <code className="bg-panel2 px-1 rounded">plot(stopLevel, title="Stop Loss")</code>{" "}
              call. Replace the plot name to match yours exactly.
            </p>
            <p>
              The <code className="bg-panel2 px-1 rounded">{"{{strategy.order.action}}"}</code>{" "}
              variable is only available inside a Pine <em>strategy</em> (not an indicator).
              It returns <code className="bg-panel2 px-1 rounded">buy</code> or{" "}
              <code className="bg-panel2 px-1 rounded">sell</code> automatically.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Native TitanEdge Webhook ─────────────────────────────────────────── */}
      <Section title="TitanEdge Native Webhook (direct from TradingView)" icon={Webhook}>
        <p className="text-sm text-muted">
          You can also skip TradersPost and send alerts directly to TitanEdge — useful
          for paper-trading or logging only (no live order execution).
        </p>

        <CodeBlock label="Webhook URL" code={webhookUrl} />

        <CodeBlock
          label="Example payload"
          code={`{
  "action": "BUY",
  "symbol": "{{ticker}}",
  "qty": 1,
  "price": {{close}},
  "strategy": "PIVOT_MASTER_BOT_V4",
  "score": 78,
  "stopLossTicks": 20,
  "takeProfitTicks": 40
}`}
        />

        <div className="text-xs text-muted space-y-1">
          <p>
            Auth: set <code className="bg-panel2 px-1 rounded">WEBHOOK_SECRET</code> on Railway and
            send it as header <code className="bg-panel2 px-1 rounded">x-webhook-secret</code> or
            query <code className="bg-panel2 px-1 rounded">?key=…</code>.
          </p>
        </div>
      </Section>

      {/* ── Endpoint reference ───────────────────────────────────────────────── */}
      <Section title="API Endpoint Reference" icon={Link2}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border">
                {["Endpoint", "Method", "Purpose"].map((h) => (
                  <th key={h} className="pb-2 pr-6 font-semibold text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["/api/traderspost", "POST", "Receive TradersPost signals (ticker / quantity / stopPrice / takeProfit)"],
                ["/api/webhook",     "POST", "Receive TradingView direct alerts (symbol / qty / stopLossTicks)"],
                ["/api/trades",      "GET",  "List trades — ?status=OPEN|CLOSED&limit=50"],
                ["/api/stats",       "GET",  "Aggregate stats — ?source=BOT|MANUAL"],
                ["/api/account",     "GET",  "Account snapshot (balance, P&L, margins)"],
                ["/api/init-db",     "GET",  "Create / migrate DB tables (run once after deploy)"],
                ["/api/broker/tradovate-sync", "POST", "Sync Tradovate positions (needs Bearer token)"],
              ].map(([ep, method, desc]) => (
                <tr key={ep}>
                  <td className="py-2 pr-6 font-mono text-accentBlue">{ep}</td>
                  <td className="py-2 pr-6 font-mono">
                    <Badge label={method} color={method === "GET" ? "blue" : "accent"} />
                  </td>
                  <td className="py-2 text-muted">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
