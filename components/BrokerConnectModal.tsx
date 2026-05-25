"use client";
import { useState } from "react";
import { X, ArrowLeft, Plug, CheckCircle2, ExternalLink } from "lucide-react";
import { brokers, type Broker, type ConnectedBroker } from "@/lib/mock/brokers";

interface Props {
  onClose: () => void;
  connected: ConnectedBroker | null;
  onConnect: (b: Broker) => void;
  onDisconnect: () => void;
}

type CategoryFilter = "all" | "Webhook Bridge" | "REST API" | "Desktop Bridge";

export default function BrokerConnectModal({
  onClose,
  connected,
  onConnect,
  onDisconnect,
}: Props) {
  const [selected, setSelected] = useState<Broker | null>(null);
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const filtered = brokers.filter(
    (b) => filter === "all" || b.category === filter,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-panel border border-border rounded-xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            {selected ? (
              <button
                onClick={() => setSelected(null)}
                className="text-muted hover:text-white"
                aria-label="Back"
              >
                <ArrowLeft size={16} />
              </button>
            ) : (
              <Plug size={15} className="text-accent" />
            )}
            <h2 className="text-sm font-semibold">
              {selected ? `Connect ${selected.name}` : "Connect Your Broker"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-white"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {!selected ? (
          <>
            <div className="px-5 py-3 border-b border-border">
              <p className="text-xs text-muted">
                Route TitanEdge's trades into a real broker. Pick the connection method
                that fits your broker.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(["all", "Webhook Bridge", "REST API", "Desktop Bridge"] as const).map(
                  (c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFilter(c)}
                      className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border transition ${
                        filter === c
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-border text-muted hover:text-white"
                      }`}
                    >
                      {c === "all" ? "All" : c}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((b) => {
                const isConnected = connected?.brokerId === b.id;
                const isNative = b.status === "native";
                const isComingSoon = b.status === "coming-soon";
                return (
                  <div
                    key={b.id}
                    className={`p-4 rounded-lg border transition ${
                      isConnected
                        ? "border-accent/40 bg-accent/5"
                        : "border-border bg-panel2 hover:border-accent/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          backgroundColor: b.accentColor + "20",
                          color: b.accentColor,
                        }}
                      >
                        {b.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{b.name}</span>
                          {isConnected && (
                            <CheckCircle2 size={12} className="text-accent" />
                          )}
                        </div>
                        <div className="text-[9px] uppercase tracking-widest text-muted mt-0.5">
                          {b.category}
                          {b.futures && " · Futures"}
                          {b.stocks && " · Stocks"}
                        </div>
                        <p className="text-xs text-muted mt-1.5 leading-relaxed">
                          {b.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div>
                            {isNative ? (
                              <span className="text-[10px] font-semibold text-accentBlue uppercase tracking-wider">
                                Already Active
                              </span>
                            ) : isConnected ? (
                              <button
                                type="button"
                                onClick={onDisconnect}
                                className="text-[10px] font-semibold text-accentRed uppercase tracking-wider hover:underline"
                              >
                                Disconnect
                              </button>
                            ) : isComingSoon ? (
                              <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">
                                Coming Soon
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelected(b)}
                                className="text-[10px] font-semibold uppercase tracking-wider hover:underline"
                                style={{ color: b.accentColor }}
                              >
                                Connect →
                              </button>
                            )}
                          </div>
                          {b.docsUrl && (
                            <a
                              href={b.docsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-muted hover:text-accentBlue inline-flex items-center gap-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              docs
                              <ExternalLink size={9} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-2 border-t border-border bg-panel2/30 text-[10px] text-muted">
              Connection state is stored in your browser only for now. Real broker
              authentication and order routing wire up in a later phase.
            </div>
          </>
        ) : (
          <BrokerSetupForm
            broker={selected}
            onSave={() => {
              onConnect(selected);
              setSelected(null);
            }}
            onCancel={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}

function BrokerSetupForm({
  broker,
  onSave,
  onCancel,
}: {
  broker: Broker;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div
          className="w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            backgroundColor: broker.accentColor + "20",
            color: broker.accentColor,
          }}
        >
          {broker.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">{broker.name}</div>
          <p className="text-xs text-muted">{broker.description}</p>
        </div>
      </div>

      {broker.fields.length === 0 && (
        <p className="text-xs text-muted py-4">No setup required for this connection.</p>
      )}

      {broker.fields.map((f) => (
        <label key={f.name} className="block">
          <span className="block text-[10px] text-muted uppercase tracking-wider mb-1">
            {f.label}
            {f.required && " *"}
          </span>
          {f.type === "select" ? (
            <select
              name={f.name}
              required={f.required}
              className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-accent/40"
            >
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              name={f.name}
              type={f.type}
              placeholder={f.placeholder}
              required={f.required}
              className="w-full bg-bg border border-border rounded-md px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-accent/40"
            />
          )}
          {f.helpText && (
            <span className="block text-[10px] text-muted mt-1">{f.helpText}</span>
          )}
        </label>
      ))}

      <div className="text-[10px] text-muted italic pt-2 mt-2 border-t border-border">
        Form is visual only — values are stored in browser localStorage but not sent
        anywhere. Real OAuth / API auth + order routing wires up when we build the
        broker-execution layer.
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-muted hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 rounded-md text-xs font-semibold transition"
          style={{
            backgroundColor: broker.accentColor + "25",
            color: broker.accentColor,
            border: `1px solid ${broker.accentColor}40`,
          }}
        >
          Save Connection
        </button>
      </div>
    </form>
  );
}
