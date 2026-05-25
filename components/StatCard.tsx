export default function StatCard({ label, value, delta, up, icon }: { label: string; value: string; delta?: string; up?: boolean; icon: React.ReactNode }) {
  return (
    <div className="bg-panel border border-border rounded-xl p-4 md:p-5">
      <div className="flex items-center justify-between text-muted text-xs uppercase tracking-wider">
        <span>{label}</span>{icon}
      </div>
      <div className="mt-3 text-xl md:text-2xl font-bold">{value}</div>
      {delta && <div className={`mt-1 text-xs ${up ? "text-accent" : "text-muted"}`}>{delta}</div>}
    </div>
  );
}