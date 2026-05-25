"use client";
import { useTrades } from "@/lib/hooks/useTrades";
import PerformanceHero from "@/components/performance/PerformanceHero";
import MonthlyPerformanceGrid from "@/components/performance/MonthlyPerformanceGrid";
import DrawdownChart from "@/components/performance/DrawdownChart";
import RiskMetrics from "@/components/performance/RiskMetrics";
import SymbolBreakdown from "@/components/performance/SymbolBreakdown";
import DayOfWeekHeatmap from "@/components/performance/DayOfWeekHeatmap";
import TopBottomTrades from "@/components/performance/TopBottomTrades";
import PropAccountsTable from "@/components/propaccounts/PropAccountsTable";
import PropFirmCompatibilityGrid from "@/components/propaccounts/PropFirmCompatibilityGrid";
import EvaluationProgress from "@/components/propaccounts/EvaluationProgress";
import MultiAccountOverview from "@/components/propaccounts/MultiAccountOverview";
import EquityCurve from "@/components/charts/EquityCurve";
import PerformanceSummary from "@/components/PerformanceSummary";
import PnLByDay from "@/components/charts/PnLByDay";
import WinRateBySetup from "@/components/charts/WinRateBySetup";

export default function Page() {
  const { data } = useTrades({ limit: 500 });
  const trades = data?.trades ?? [];

  return (
    <div className="space-y-4">
      {/* Multi-account live overview (Tradovate-synced) */}
      <MultiAccountOverview />

      {/* Hero stats */}
      <PerformanceHero trades={trades} />

      {/* Monthly grid */}
      <MonthlyPerformanceGrid trades={trades} />

      {/* Risk metrics */}
      <RiskMetrics trades={trades} />

      {/* Equity + Drawdown side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EquityCurve />
        <DrawdownChart trades={trades} />
      </div>

      {/* Day of week + Symbol breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DayOfWeekHeatmap trades={trades} />
        <SymbolBreakdown trades={trades} />
      </div>

      {/* Top winners / losers */}
      <TopBottomTrades trades={trades} />

      {/* Live evaluation progress (MFF $25K Rapid) */}
      <EvaluationProgress />

      {/* Prop firm accounts */}
      <PropAccountsTable />

      {/* Prop firm compatibility — honest map of what's connectable */}
      <PropFirmCompatibilityGrid />

      {/* Existing summary + charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-panel border border-border rounded-xl p-5">
          <PerformanceSummary />
        </div>
        <div className="space-y-4">
          <div className="bg-panel border border-border rounded-xl p-5 min-h-[260px]">
            <PnLByDay />
          </div>
          <div className="bg-panel border border-border rounded-xl p-5 min-h-[200px]">
            <WinRateBySetup />
          </div>
        </div>
      </div>
    </div>
  );
}
