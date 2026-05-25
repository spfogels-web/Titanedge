"use client";
import { useEffect, useState } from "react";
import { Plug } from "lucide-react";
import BrokerConnectModal from "./BrokerConnectModal";
import type { Broker, ConnectedBroker } from "@/lib/mock/brokers";

const STORAGE_KEY = "titanedge.broker";

export default function BrokerConnectButton() {
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState<ConnectedBroker | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setConnected(JSON.parse(raw) as ConnectedBroker);
    } catch {
      // ignore localStorage errors (private mode, etc.)
    }
  }, []);

  function handleConnect(b: Broker) {
    const payload: ConnectedBroker = {
      brokerId: b.id,
      brokerName: b.name,
      brokerInitials: b.initials,
      brokerAccent: b.accentColor,
      connectedAt: new Date().toISOString(),
    };
    setConnected(payload);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }

  function handleDisconnect() {
    setConnected(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={connected ? `Connected to ${connected.brokerName}` : "Connect a broker"}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs transition shadow-sm ${
          connected
            ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/15"
            : "border-border bg-panel2 text-muted hover:text-white hover:border-accent/40"
        }`}
        style={
          connected
            ? { boxShadow: `0 0 18px ${connected.brokerAccent}25` }
            : undefined
        }
      >
        {connected ? (
          <>
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: connected.brokerAccent }}
            />
            <span
              className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
              style={{
                backgroundColor: connected.brokerAccent + "25",
                color: connected.brokerAccent,
              }}
            >
              {connected.brokerInitials}
            </span>
            <span className="font-semibold hidden sm:inline">
              {connected.brokerName}
            </span>
            <span className="text-[10px] text-muted hidden md:inline">Connected</span>
          </>
        ) : (
          <>
            <Plug size={12} />
            <span className="font-semibold">Connect Broker</span>
          </>
        )}
      </button>

      {open && (
        <BrokerConnectModal
          onClose={() => setOpen(false)}
          connected={connected}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      )}
    </>
  );
}
