import { Users } from "lucide-react";
import YouVsBotComparison from "@/components/YouVsBotComparison";
import ManualTradeForm from "@/components/ManualTradeForm";

export default function Page() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="bg-panel border border-border rounded-xl p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              <Users size={19} />
            </div>
            <div>
              <h1 className="text-xl font-bold">You vs the Bot</h1>
              <p className="text-xs text-muted mt-1 max-w-2xl">
                Track your manual calls separately from the bot's automated trades. Spot where you
                add edge — and where you should defer.
              </p>
            </div>
          </div>
          <ManualTradeForm />
        </div>
      </header>

      <YouVsBotComparison />
    </div>
  );
}
