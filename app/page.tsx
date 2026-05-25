import TopStats from "@/components/TopStats";
import LiveTrades from "@/components/LiveTrades";
import TradeHistory from "@/components/TradeHistory";
import MarketConditions from "@/components/MarketConditions";
import AIMarketOutlook from "@/components/AIMarketOutlook";
import PerformanceSummary from "@/components/PerformanceSummary";
import EquityCurve from "@/components/charts/EquityCurve";
import PnLByDay from "@/components/charts/PnLByDay";
import WinRateBySetup from "@/components/charts/WinRateBySetup";
import MarketRegimeIndicator from "@/components/MarketRegimeIndicator";
import AIRecommendationsFeed from "@/components/AIRecommendationsFeed";
import AccountStatsPanel from "@/components/AccountStatsPanel";
import PropAccountsSummary from "@/components/propaccounts/PropAccountsSummary";

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <AccountStatsPanel />

      <PropAccountsSummary />

      <TopStats />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AIRecommendationsFeed limit={4} />
        </div>
        <MarketRegimeIndicator />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <EquityCurve />
        <LiveTrades />
        <div className="space-y-4">
          <MarketConditions />
          <AIMarketOutlook />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TradeHistory />
        <div className="bg-panel border border-border rounded-xl p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PerformanceSummary />
            <div className="space-y-4 min-h-[300px] flex flex-col">
              <div className="flex-1"><PnLByDay /></div>
              <div className="flex-1 border-t border-border pt-3"><WinRateBySetup /></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
