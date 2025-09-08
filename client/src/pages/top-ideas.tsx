import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingUp, Star, Users, Eye } from "lucide-react";
import type { Idea } from "@shared/schema";

export default function TopIdeas() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('week');

  const { data: ideas, isLoading } = useQuery({
    queryKey: ['/api/ideas', { sortBy: 'popular', limit: 50 }],
  });

  const topIdeas = (ideas as any)?.ideas || [];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-8 h-8 mr-3 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">
              Top Startup Ideas
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Discover the most promising and highest-rated startup opportunities, ranked by community votes, opportunity scores, and market potential.
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex space-x-2 mb-8">
          {(['week', 'month', 'all'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? "default" : "outline"}
              onClick={() => setTimeframe(period)}
              data-testid={`button-timeframe-${period}`}
            >
              {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'All Time'}
            </Button>
          ))}
        </div>

        {/* Ideas Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-muted rounded mb-4"></div>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topIdeas.map((idea: Idea, index: number) => (
              <Card key={idea.id} className="hover:shadow-lg transition-shadow duration-200" data-testid={`card-idea-${idea.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl font-bold text-primary mr-2">#{index + 1}</span>
                        <Badge variant="secondary" className="text-xs">
                          {idea.market}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg leading-tight mb-2">
                        {idea.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {idea.subtitle}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {idea.imageUrl && (
                    <img 
                      src={idea.imageUrl} 
                      alt={idea.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {idea.description}
                  </p>
                  
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getScoreColor(idea.opportunityScore)}`}></div>
                      <span className="text-muted-foreground">Opportunity:</span>
                      <span className="font-semibold ml-1">{idea.opportunityScore}/10</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="w-3 h-3 mr-2 text-yellow-500" />
                      <span className="font-semibold">{idea.voteCount || 0}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-3 h-3 mr-2 text-blue-500" />
                      <span className="text-muted-foreground">Market:</span>
                      <span className="font-semibold ml-1">{idea.targetAudience}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Eye className="w-3 h-3 mr-2 text-gray-500" />
                      <span className="font-semibold">{idea.viewCount || 0}</span>
                    </div>
                  </div>
                  
                  <Link href={`/idea/${idea.slug}`}>
                    <Button className="w-full" variant="outline" data-testid={`button-view-${idea.id}`}>
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {topIdeas.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No ideas found
            </h3>
            <p className="text-muted-foreground">
              Check back later for trending startup ideas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}