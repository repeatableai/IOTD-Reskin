import Header from "@/components/Header";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Lightbulb, Users, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import type { Idea } from "@shared/schema";
import { Link } from "wouter";

export default function Trends() {
  const { data: response, isLoading } = useQuery<{ ideas: Idea[]; total: number }>({
    queryKey: ["/api/ideas"],
  });

  const ideas = response?.ideas;

  const getTrendingMarkets = () => {
    if (!ideas) return [];
    
    const marketCounts = ideas.reduce((acc, idea) => {
      const market = idea.market || "Other";
      if (!acc[market]) {
        acc[market] = {
          name: market,
          count: 0,
          avgScore: 0,
          totalScore: 0,
        };
      }
      acc[market].count++;
      if (idea.opportunityScore) {
        acc[market].totalScore += parseFloat(idea.opportunityScore);
      }
      return acc;
    }, {} as Record<string, { name: string; count: number; avgScore: number; totalScore: number }>);

    return Object.values(marketCounts)
      .map((market) => ({
        ...market,
        avgScore: market.count > 0 ? market.totalScore / market.count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  };

  const getTopIdeasByScore = () => {
    if (!ideas) return [];
    return [...ideas]
      .sort((a, b) => parseFloat(b.opportunityScore || "0") - parseFloat(a.opportunityScore || "0"))
      .slice(0, 5);
  };

  const getRecentIdeas = () => {
    if (!ideas) return [];
    return [...ideas]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const trendingMarkets = getTrendingMarkets();
  const topIdeas = getTopIdeasByScore();
  const recentIdeas = getRecentIdeas();

  const marketColors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-indigo-500",
  ];

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
            Discover emerging market categories and high-opportunity ideas
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading trend data...
          </div>
        ) : (
          <>
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Trending Markets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingMarkets.map((market, index) => (
                  <Link key={market.name} href={`/ideas?market=${encodeURIComponent(market.name)}`}>
                    <div
                      className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      data-testid={`card-trend-${market.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 ${marketColors[index % marketColors.length]} rounded-lg flex items-center justify-center`}>
                          <Lightbulb className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center text-green-600 font-semibold">
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                          {market.avgScore.toFixed(1)}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{market.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Lightbulb className="w-4 h-4" />
                          {market.count} ideas
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Avg score: {market.avgScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Explore Ideas</h2>
              <Tabs defaultValue="top-scored" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="top-scored" data-testid="tab-top-scored">
                    Highest Scored
                  </TabsTrigger>
                  <TabsTrigger value="recently-added" data-testid="tab-recently-added">
                    Recently Added
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="top-scored" className="space-y-4">
                  {topIdeas.map((idea) => (
                    <Link key={idea.id} href={`/ideas/${idea.slug}`}>
                      <div
                        className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        data-testid={`idea-card-${idea.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold flex-1">{idea.title}</h3>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {idea.market}
                            </span>
                            <div className="flex items-center text-green-600 font-semibold">
                              <ArrowUpRight className="w-4 h-4 mr-1" />
                              {idea.opportunityScore}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {idea.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {idea.problemScore && (
                            <span>Problem: {idea.problemScore}</span>
                          )}
                          {idea.executionDifficulty && (
                            <span>Difficulty: {idea.executionDifficulty}</span>
                          )}
                          {idea.viewCount && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {idea.viewCount} views
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </TabsContent>
                
                <TabsContent value="recently-added" className="space-y-4">
                  {recentIdeas.map((idea) => (
                    <Link key={idea.id} href={`/ideas/${idea.slug}`}>
                      <div
                        className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        data-testid={`recent-idea-card-${idea.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold flex-1">{idea.title}</h3>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {idea.market}
                            </span>
                            <div className="flex items-center text-green-600 font-semibold">
                              <ArrowUpRight className="w-4 h-4 mr-1" />
                              {idea.opportunityScore}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {idea.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Added: {new Date(idea.createdAt).toLocaleDateString()}</span>
                          {idea.viewCount && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {idea.viewCount} views
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
