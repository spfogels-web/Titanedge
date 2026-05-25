"use client";
import { useTrades } from "@/lib/hooks/useTrades";

import PerformanceHero from "@/components/performance/PerformanceHero";
import EquityCurve from "@/components/charts/EquityCurve";
import DrawdownChart from "@/components/performance/DrawdownChart";
import RiskMetrics from "@/components/performance/RiskMetrics";
import DayOfWeekHeatmap from "@/components/performance/DayOfWeekHeatmap";
import SymbolBreakdown from "@/components/performance/SymbolBreakdown";
import TopBottomTrades from "@/components/performance/TopBottomTrades";

import AdvancedMetricsRibbon from "@/components/analytics/AdvancedMetricsRibbon";
import TimeOfDayHeatmap from "@/components/analytics/TimeOfDayHeatmap";
import RMultipleDistribution from "@/components/analytics/RMultipleDistribution";
import HoldDurationAnalysis from "@/components/analytics/HoldDurationAnalysis";
import StreakTracker from "@/components/analytics/StreakTracker";
import BotVsManualSplit from "@/components/analytics/BotVsManualSplit";

import PatternStatsTable from "@/components/PatternStatsTable";
import PnLByDay from "@/components/charts/PnLByDay";
import WinRateBySetup from "@/components/charts/WinRateBySetup";

export default function Page() {
  const { data } = useTrades({ limit: 500 });
  const trades = data?.trades ?? [];

  return (
    <div className="space-y-5">
      {/* === Section 1: Core KPI ribbon === */}
      <PerformanceHero trades={trades} />

      {/* === Section 2: Advanced risk metrics ribbon === */}
      <AdvancedMetricsRibbon />

      {/* === Section 3: Equity + Drawdown === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EquityCurve />
        <DrawdownChart trades={trades} />
      </div>

      {/* === Section 4: Full risk metrics card === */}
      <RiskMetrics trades={trades} />

      {/* === Section 5: Time analysis === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TimeOfDayHeatmap />
        <DayOfWeekHeatmap trades={trades} />
      </div>

      {/* === Section 6: R-multiple + hold duration === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RMultipleDistribution />
        <HoldDurationAnalysis />
      </div>

      {/* === Section 7: Streaks + Bot vs Manual === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StreakTracker />
        <BotVsManualSplit />
      </div>

      {/* === Section 8: Symbol + Setup breakdown === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SymbolBreakdown trades={trades} />
        <div className="bg-panel border border-border rounded-xl p-5">
          <WinRateBySetup />
        </div>
      </div>

      {/* === Section 9: Daily PnL stream === */}
      <div className="bg-panel border border-border rounded-xl p-5 min-h-[280px]">
        <PnLByDay />
      </div>

      {/* === Section 10: Top winners / losers === */}
      <TopBottomTrades trades={trades} />

      {/* === Section 11: Pattern recognition (existing) === */}
      <PatternStatsTable />
    </div>
  );
}
