export default function RiskSettings() {
  const rows = [
    { k: "Max Daily Loss", v: "$500" },
    { k: "Max Contracts", v: "4" },
    { k: "Stop ATR", v: "1.5x" },
    { k: "Target ATR", v: "2.5x" },
    { k: "Max Trades / Day", v: "8" },
  ];
  return (
    <div className="bg-panel border border-border rounded-xl p-5">
      <h2 className="font-semibold mb-4">Risk Settings</h2>
      <div className="space-y-3">
        {rows.map(r => (
          <div key={r.k} className="flex items-center justify-between text-sm">
            <span className="text-muted">{r.k}</span>
            <span className="font-mono">{r.v}</span>
          </div>
        ))}
      </div>
      <button className="mt-4 w-full bg-panel2 hover:bg-border text-sm py-2 rounded-lg border border-border transition">Edit Risk</button>
    </div>
  );
}