import Header from "@/components/Header";
import { TrendingUp, ArrowUpRight } from "lucide-react";

export default function Trends() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Market Trends</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover emerging market categories and opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "AI & Automation", growth: "+245%", color: "bg-blue-500" },
            { name: "Sustainable Tech", growth: "+189%", color: "bg-green-500" },
            { name: "Remote Work Tools", growth: "+156%", color: "bg-purple-500" },
            { name: "Health Tech", growth: "+134%", color: "bg-red-500" },
            { name: "Creator Economy", growth: "+128%", color: "bg-yellow-500" },
            { name: "Web3 & Blockchain", growth: "+112%", color: "bg-indigo-500" },
          ].map((trend) => (
            <div
              key={trend.name}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              data-testid={`card-trend-${trend.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${trend.color} rounded-lg`}></div>
                <div className="flex items-center text-green-600 font-semibold">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  {trend.growth}
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{trend.name}</h3>
              <p className="text-sm text-muted-foreground">
                Explore opportunities in this growing market category
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
