import MarketConditions from "@/components/MarketConditions";
import AIMarketOutlook from "@/components/AIMarketOutlook";

export default function Page() {
  return (
    <div className="space-y-4 max-w-2xl">
      <MarketConditions />
      <AIMarketOutlook />
    </div>
  );
}
