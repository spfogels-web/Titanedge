"use client";
import { User, Bell, Key, Shield, Globe, Save } from "lucide-react";
import { userProfile } from "@/lib/mock/subscription";

export default function Page() {
  return (
    <div className="space-y-4 max-w-4xl">
      {/* Profile header */}
      <div className="bg-panel border border-border rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accentBlue flex items-center justify-center text-bg text-lg font-bold">
            {userProfile.initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{userProfile.fullName}</h1>
            <div className="text-xs text-muted mt-1">{userProfile.email}</div>
            <div className="text-[10px] text-muted mt-0.5">
              Joined {new Date(userProfile.joinedAt + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              {" · "}
              Timezone: {userProfile.timezone}
            </div>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <section className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">PROFILE</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Full name"     defaultValue={userProfile.fullName} />
          <Field label="Email"         defaultValue={userProfile.email}     type="email" />
          <Field label="Discord user"  defaultValue={userProfile.discordUser ?? ""} />
          <Field label="Timezone"      defaultValue={userProfile.timezone} />
          <Field label="Default symbol" defaultValue={userProfile.defaultSymbol} />
        </div>
        <div className="mt-4 flex justify-end">
          <SaveButton />
        </div>
      </section>

      {/* Notification preferences */}
      <section className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={14} className="text-accentBlue" />
          <h2 className="text-sm font-semibold tracking-wide">NOTIFICATIONS</h2>
        </div>
        <div className="space-y-2">
          <Toggle label="Email alerts"           defaultOn={userProfile.notifications.email}       hint="Trade fills, daily briefing, account alerts" />
          <Toggle label="SMS alerts"             defaultOn={userProfile.notifications.sms}         hint="High-impact news, risk alerts, account violations" />
          <Toggle label="Discord webhook"        defaultOn={userProfile.notifications.discord}     hint="Posts to your private Discord channel" />
          <Toggle label="Browser push"           defaultOn={userProfile.notifications.pushBrowser} hint="Native browser notifications when the dashboard is open" />
        </div>
      </section>

      {/* Trading defaults */}
      <section className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={14} className="text-accent" />
          <h2 className="text-sm font-semibold tracking-wide">TRADING DEFAULTS</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field label="Risk per trade (%)"    defaultValue={String(userProfile.tradingDefaults.riskPerTradePct)}   type="number" />
          <Field label="Max daily loss (%)"    defaultValue={String(userProfile.tradingDefaults.maxDailyLossPct)}    type="number" />
          <Field label="Max trades / day"      defaultValue={String(userProfile.tradingDefaults.maxTradesPerDay)}    type="number" />
          <Field label="Default position size" defaultValue={String(userProfile.tradingDefaults.defaultPositionSize)} type="number" />
        </div>
        <div className="mt-3 text-[10px] text-muted">
          Risk Meter on Live Trades reads these values to render the daily loss gauge.
        </div>
      </section>

      {/* API keys & integrations */}
      <section className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Key size={14} className="text-gold" />
          <h2 className="text-sm font-semibold tracking-wide">API KEYS & INTEGRATIONS</h2>
        </div>
        <ul className="space-y-2">
          <IntegrationRow name="TradingView Webhook"  status="Connected"     accent="#00ff88" />
          <IntegrationRow name="TradingView Paper Trading" status="Connected" accent="#00ff88" />
          <IntegrationRow name="Discord Bot"          status="Connected"     accent="#5865F2" />
          <IntegrationRow name="Anthropic Claude"     status="Not configured" accent="#aa50ff" />
          <IntegrationRow name="Finnhub Market Data"  status="Not configured" accent="#888892" />
          <IntegrationRow name="TradersPost"          status="Not configured" accent="#888892" />
        </ul>
      </section>

      {/* Security */}
      <section className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={14} className="text-accentRed" />
          <h2 className="text-sm font-semibold tracking-wide">SECURITY</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-panel2 border border-border">
            <div>
              <div className="text-sm font-semibold">Change Password</div>
              <div className="text-[10px] text-muted">Last changed 4 months ago</div>
            </div>
            <button className="text-xs text-accentBlue hover:text-accent transition">Change</button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-panel2 border border-border">
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                Two-Factor Authentication
                {!userProfile.twoFactorEnabled && (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-gold/15 text-gold px-1.5 py-0.5 rounded">
                    Recommended
                  </span>
                )}
              </div>
              <div className="text-[10px] text-muted">
                {userProfile.twoFactorEnabled ? "Enabled" : "Disabled — enable for stronger account security"}
              </div>
            </div>
            <button className="text-xs text-accentBlue hover:text-accent transition">
              {userProfile.twoFactorEnabled ? "Manage" : "Enable"}
            </button>
          </div>
        </div>
      </section>

      <p className="text-[10px] text-muted text-center italic pt-2">
        Form values are UI-only for now — persistence wires to a user_profile table later.
      </p>
    </div>
  );
}

function Field({
  label, defaultValue, type = "text",
}: { label: string; defaultValue: string; type?: "text" | "email" | "number" }) {
  return (
    <label className="block">
      <span className="block text-[10px] text-muted uppercase tracking-wider mb-1">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs focus:outline-none focus:border-accent/40"
      />
    </label>
  );
}

function Toggle({ label, defaultOn, hint }: { label: string; defaultOn: boolean; hint: string }) {
  return (
    <label className="flex items-center justify-between gap-3 p-3 rounded-lg bg-panel2 border border-border cursor-pointer">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-[10px] text-muted mt-0.5">{hint}</div>
      </div>
      <div className="relative shrink-0">
        <input type="checkbox" defaultChecked={defaultOn} className="sr-only peer" />
        <div className="w-9 h-5 bg-bg border border-border rounded-full peer-checked:bg-accent peer-checked:border-accent transition" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition" />
      </div>
    </label>
  );
}

function IntegrationRow({ name, status, accent }: { name: string; status: string; accent: string }) {
  const isConnected = status === "Connected";
  return (
    <li className="flex items-center justify-between p-3 rounded-lg bg-panel2 border border-border">
      <div className="flex items-center gap-3">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: isConnected ? accent : "#888892" }}
        />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: isConnected ? accent : "#888892" }}
        >
          {status}
        </span>
        <button className="text-xs text-accentBlue hover:text-accent transition">
          {isConnected ? "Manage" : "Connect"}
        </button>
      </div>
    </li>
  );
}

function SaveButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-accent/40 bg-accent/15 text-accent text-xs font-semibold hover:bg-accent/20 transition"
    >
      <Save size={12} />
      Save changes
    </button>
  );
}
