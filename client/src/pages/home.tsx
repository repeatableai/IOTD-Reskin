import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import IdeaCard from "@/components/IdeaCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, TrendingUp, Eye, Heart } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const { data: savedIdeas, isLoading: savedLoading } = useQuery({
    queryKey: ["/api/users/saved-ideas"],
  });

  const { data: topIdeas, isLoading: topLoading } = useQuery({
    queryKey: ["/api/ideas/top", { limit: 6 }],
  });

  const { data: featuredIdea } = useQuery({
    queryKey: ["/api/ideas/featured"],
  });

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || 'Explorer'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Discover your next big opportunity with data-driven startup solutions.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bookmark className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Saved Solutions</p>
                  <p className="text-2xl font-bold" data-testid="text-saved-count">
                    {savedIdeas?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-secondary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Solutions</p>
                  <p className="text-2xl font-bold">400+</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Solutions Viewed</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-chart-5" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Voted Solutions</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Idea */}
            {featuredIdea && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Solution of the Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <IdeaCard idea={featuredIdea} featured />
                </CardContent>
              </Card>
            )}

            {/* Trending Ideas */}
            <Card>
              <CardHeader>
                <CardTitle>Trending Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                {topLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-48 bg-muted rounded-lg mb-4"></div>
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-6 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : topIdeas && topIdeas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topIdeas.slice(0, 4).map((idea) => (
                      <IdeaCard key={idea.id} idea={idea} compact />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No trending solutions available.
                  </div>
                )}
                
                <div className="mt-6 text-center">
                  <Button data-testid="button-view-all-trending">
                    View All Trending Solutions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Ideas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bookmark className="w-5 h-5 mr-2" />
                  Your Saved Solutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded mb-1"></div>
                        <div className="h-3 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : savedIdeas && savedIdeas.length > 0 ? (
                  <div className="space-y-3">
                    {savedIdeas.slice(0, 5).map((idea) => (
                      <div key={idea.id} className="border-b border-border pb-2 last:border-0">
                        <h4 className="text-sm font-medium line-clamp-1">{idea.title}</h4>
                        <p className="text-xs text-muted-foreground">{idea.market} • {idea.type}</p>
                      </div>
                    ))}
                    {savedIdeas.length > 5 && (
                      <Button variant="outline" size="sm" className="w-full mt-3" data-testid="button-view-all-saved">
                        View All Saved ({savedIdeas.length})
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No saved solutions yet</p>
                    <Button variant="outline" size="sm" className="mt-2" data-testid="button-browse-database">
                      Browse Database
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" data-testid="button-browse-ideas">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Browse All Solutions
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-ai-research">
                  <Eye className="w-4 h-4 mr-2" />
                  AI Research Tool
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-logout">
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
