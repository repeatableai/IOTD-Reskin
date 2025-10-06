import Header from "@/components/Header";
import { Users, MessageSquare, TrendingUp } from "lucide-react";

export default function MarketInsights() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Market Insights</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uncover hidden opportunities from online communities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="border rounded-lg p-8">
            <MessageSquare className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Community Signals</h2>
            <p className="text-muted-foreground mb-4">
              We analyze discussions from Reddit, Twitter, and other online communities to identify
              emerging problems and unmet needs.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Real-time sentiment analysis</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Problem frequency tracking</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Trend detection algorithms</span>
              </li>
            </ul>
          </div>

          <div className="border rounded-lg p-8">
            <TrendingUp className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Opportunity Scoring</h2>
            <p className="text-muted-foreground mb-4">
              Every insight is scored based on market demand, competition level, and growth potential.
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Market size estimation</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Competitive landscape analysis</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Growth trajectory forecasting</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
