import LiveTradesHero from "@/components/livetrades/LiveTradesHero";
import LiveTradesChart from "@/components/livetrades/LiveTradesChart";
import RiskMeter from "@/components/livetrades/RiskMeter";
import PositionExposure from "@/components/livetrades/PositionExposure";
import EnhancedPositionList from "@/components/livetrades/EnhancedPositionList";
import RecentActivityTape from "@/components/livetrades/RecentActivityTape";

export default function Page() {
  return (
    <div className="space-y-4">
      <LiveTradesHero />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <LiveTradesChart />
        </div>
        <div className="space-y-4">
          <RiskMeter />
          <PositionExposure />
        </div>
      </section>

      <EnhancedPositionList />

      <RecentActivityTape />
    </div>
  );
}
