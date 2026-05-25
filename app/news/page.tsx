import NewsHero from "@/components/news/NewsHero";
import FuturesSnapshot from "@/components/news/FuturesSnapshot";
import Mag7Heatmap from "@/components/news/Mag7Heatmap";
import SentimentGauge from "@/components/news/SentimentGauge";
import SessionTimeline from "@/components/news/SessionTimeline";
import TrendingStories from "@/components/news/TrendingStories";
import DailyAIBriefing from "@/components/DailyAIBriefing";
import EconomicCalendar from "@/components/EconomicCalendar";
import NewsHeadlinesFeed from "@/components/NewsHeadlinesFeed";

export default function Page() {
  return (
    <div className="space-y-4">
      {/* Premium hero */}
      <NewsHero />

      {/* Session timeline + Futures snapshot */}
      <SessionTimeline />
      <FuturesSnapshot />

      {/* Mag 7 + Sentiment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Mag7Heatmap />
        </div>
        <SentimentGauge />
      </div>

      {/* Trending Stories */}
      <TrendingStories />

      {/* AI Briefing */}
      <DailyAIBriefing />

      {/* Economic Calendar + Headlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EconomicCalendar />
        <NewsHeadlinesFeed />
      </div>
    </div>
  );
}
