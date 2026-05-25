import AIBrainStats from "@/components/AIBrainStats";
import AISequenceFlow from "@/components/AISequenceFlow";
import MemoryStatsPanel from "@/components/MemoryStatsPanel";
import AIRecommendationsFeed from "@/components/AIRecommendationsFeed";
import MarketRegimeIndicator from "@/components/MarketRegimeIndicator";
import AIMarketOutlook from "@/components/AIMarketOutlook";

export default function Page() {
  return (
    <div className="space-y-4">
      <AIBrainStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <AISequenceFlow />
          <MemoryStatsPanel />
        </div>
        <div className="space-y-4">
          <MarketRegimeIndicator />
          <AIMarketOutlook />
          <AIRecommendationsFeed limit={4} />
        </div>
      </div>
    </div>
  );
}
