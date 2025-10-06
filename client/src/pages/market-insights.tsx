import Header from "@/components/Header";
import { Users, MessageSquare, TrendingUp, ArrowUpRight, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Idea, CommunitySignal } from "@shared/schema";

export default function MarketInsights() {
  const { data: response, isLoading: ideasLoading } = useQuery<{ ideas: Idea[]; total: number }>({
    queryKey: ["/api/ideas"],
  });

  const ideas = response?.ideas;

  const getIdeasWithSignals = () => {
    if (!ideas) return [];
    return ideas.filter(idea => idea.communityEngagement && parseInt(idea.communityEngagement) > 0);
  };

  const getTopEngagementIdeas = () => {
    if (!ideas) return [];
    return [...ideas]
      .filter(idea => idea.communityEngagement)
      .sort((a, b) => parseInt(b.communityEngagement || "0") - parseInt(a.communityEngagement || "0"))
      .slice(0, 10);
  };

  const getRecentSignals = () => {
    if (!ideas) return [];
    return [...ideas]
      .filter(idea => idea.communityEngagement)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);
  };

  const ideasWithSignals = getIdeasWithSignals();
  const topEngagement = getTopEngagementIdeas();
  const recentSignals = getRecentSignals();

  const totalSignals = ideasWithSignals.length;
  const avgEngagement = ideasWithSignals.length > 0
    ? ideasWithSignals.reduce((sum, idea) => sum + parseInt(idea.communityEngagement || "0"), 0) / ideasWithSignals.length
    : 0;

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

        {ideasLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading market insights...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="border rounded-lg p-6 text-center">
                <MessageSquare className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold mb-1">{totalSignals}</div>
                <div className="text-sm text-muted-foreground">Active Community Signals</div>
              </div>
              <div className="border rounded-lg p-6 text-center">
                <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-1">{avgEngagement.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Avg Engagement Score</div>
              </div>
              <div className="border rounded-lg p-6 text-center">
                <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-1">{ideas?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Total Ideas Tracked</div>
              </div>
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

            <div>
              <h2 className="text-2xl font-bold mb-6">Community Insights</h2>
              <Tabs defaultValue="top-engagement" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="top-engagement" data-testid="tab-top-engagement">
                    Highest Engagement
                  </TabsTrigger>
                  <TabsTrigger value="recent" data-testid="tab-recent-signals">
                    Recent Signals
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="top-engagement" className="space-y-4">
                  {topEngagement.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No community signals available yet.
                    </div>
                  ) : (
                    topEngagement.map((idea) => (
                      <Link key={idea.id} href={`/ideas/${idea.slug}`}>
                        <div
                          className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                          data-testid={`insight-card-${idea.id}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold flex-1">{idea.title}</h3>
                            <div className="flex items-center gap-2 ml-4">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {idea.market}
                              </span>
                              <div className="flex items-center text-green-600 font-semibold">
                                <Users className="w-4 h-4 mr-1" />
                                {idea.communityEngagement}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {idea.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3" />
                              Score: {idea.opportunityScore}
                            </span>
                            {idea.viewCount && (
                              <span>{idea.viewCount} views</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="recent" className="space-y-4">
                  {recentSignals.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No recent signals available.
                    </div>
                  ) : (
                    recentSignals.map((idea) => (
                      <Link key={idea.id} href={`/ideas/${idea.slug}`}>
                        <div
                          className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                          data-testid={`recent-signal-card-${idea.id}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold flex-1">{idea.title}</h3>
                            <div className="flex items-center gap-2 ml-4">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {idea.market}
                              </span>
                              <div className="flex items-center text-green-600 font-semibold">
                                <Users className="w-4 h-4 mr-1" />
                                {idea.communityEngagement}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {idea.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Updated: {new Date(idea.updatedAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <ArrowUpRight className="w-3 h-3" />
                              Score: {idea.opportunityScore}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
