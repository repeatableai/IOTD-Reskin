import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bookmark, 
  BookmarkCheck, 
  ThumbsUp, 
  ThumbsDown, 
  Eye, 
  Download, 
  Code, 
  ExternalLink,
  TrendingUp,
  Users
} from "lucide-react";

export default function IdeaDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: idea, isLoading, error } = useQuery({
    queryKey: ["/api/ideas", slug],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch idea');
      }
      return response.json();
    },
  });

  const { data: userVote } = useQuery({
    queryKey: ["/api/ideas", idea?.id, "vote"],
    enabled: isAuthenticated && !!idea?.id,
    retry: false,
  });

  const { data: communitySignals } = useQuery({
    queryKey: ["/api/ideas", idea?.id, "community-signals"],
    enabled: !!idea?.id,
  });

  const saveIdeaMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/ideas/${idea.id}/save`);
    },
    onSuccess: () => {
      toast({ title: "Idea saved successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/users/saved-ideas"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "Error", 
        description: "Failed to save idea. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const unsaveIdeaMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/ideas/${idea.id}/save`);
    },
    onSuccess: () => {
      toast({ title: "Idea unsaved successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/users/saved-ideas"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "Error", 
        description: "Failed to unsave idea. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (voteType: 'up' | 'down') => {
      await apiRequest("POST", `/api/ideas/${idea.id}/vote`, { voteType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", idea?.id, "vote"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "Error", 
        description: "Failed to vote. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const removeVoteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/ideas/${idea.id}/vote`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", idea?.id, "vote"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ 
        title: "Error", 
        description: "Failed to remove vote. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const handleVote = (voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote on ideas.",
        variant: "destructive",
      });
      return;
    }

    if (userVote?.vote === voteType) {
      removeVoteMutation.mutate();
    } else {
      voteMutation.mutate(voteType);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Idea Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The idea you're looking for doesn't exist or has been removed.
            </p>
            <Button data-testid="button-back-to-database">
              Back to Database
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="idea-detail-page">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-blue-50 text-blue-700 border-blue-200">{idea.market}</Badge>
            <Badge className="bg-green-50 text-green-700 border-green-200">{idea.type}</Badge>
            {idea.targetAudience && (
              <Badge className="bg-purple-50 text-purple-700 border-purple-200">{idea.targetAudience}</Badge>
            )}
          </div>
          
          <h1 className="text-4xl font-bold mb-4" data-testid="text-idea-title">{idea.title}</h1>
          
          {idea.subtitle && (
            <p className="text-xl text-muted-foreground mb-6" data-testid="text-idea-subtitle">
              {idea.subtitle}
            </p>
          )}

          <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span data-testid="text-view-count">{idea.viewCount || 0} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="w-4 h-4" />
              <span data-testid="text-save-count">{idea.saveCount || 0} saves</span>
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4" />
              <span data-testid="text-vote-count">{idea.voteCount || 0} votes</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isAuthenticated && (
              <>
                <Button
                  variant="outline"
                  onClick={() => saveIdeaMutation.mutate()}
                  disabled={saveIdeaMutation.isPending}
                  data-testid="button-save-idea"
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save Idea
                </Button>
                
                <Button
                  variant={userVote?.vote === 'up' ? 'default' : 'outline'}
                  onClick={() => handleVote('up')}
                  disabled={voteMutation.isPending || removeVoteMutation.isPending}
                  data-testid="button-vote-up"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Vote Up
                </Button>
                
                <Button
                  variant={userVote?.vote === 'down' ? 'default' : 'outline'}
                  onClick={() => handleVote('down')}
                  disabled={voteMutation.isPending || removeVoteMutation.isPending}
                  data-testid="button-vote-down"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Vote Down
                </Button>
              </>
            )}
            
            <Button variant="outline" data-testid="button-build-idea">
              <Code className="w-4 h-4 mr-2" />
              Build This Idea
            </Button>
            
            <Button variant="outline" data-testid="button-export-data">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Image */}
        {idea.imageUrl && (
          <div className="mb-8">
            <img 
              src={idea.imageUrl} 
              alt={idea.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <p className="text-lg leading-relaxed" data-testid="text-idea-description">
                  {idea.description}
                </p>
              </CardContent>
            </Card>

            {/* Full Content */}
            {idea.content && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: idea.content.replace(/\n/g, '<br>') }} />
                </CardContent>
              </Card>
            )}

            {/* Business Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Business Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Revenue Potential</h4>
                  <p className="text-muted-foreground" data-testid="text-revenue-potential">
                    {idea.revenuePotential || 'Not specified'}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Execution Difficulty</h4>
                  <p className="text-muted-foreground" data-testid="text-execution-difficulty">
                    {idea.executionDifficulty || 'Not specified'}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Go-to-Market Strength</h4>
                  <p className="text-muted-foreground" data-testid="text-gtm-strength">
                    {idea.gtmStrength || 'Not specified'}
                  </p>
                </div>

                {idea.mainCompetitor && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Main Competitor</h4>
                      <p className="text-muted-foreground" data-testid="text-main-competitor">
                        {idea.mainCompetitor}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Community Signals */}
            {communitySignals && communitySignals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Community Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {communitySignals.map((signal) => (
                      <div key={signal.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{signal.name}</h4>
                          <Badge>{signal.platform}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {signal.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{signal.memberCount?.toLocaleString()} members</span>
                          <span>Score: {signal.engagementScore}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Scoring */}
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ScoreDisplay 
                  score={idea.opportunityScore} 
                  label="Opportunity" 
                  sublabel={idea.opportunityLabel} 
                />
                <ScoreDisplay 
                  score={idea.problemScore} 
                  label="Problem" 
                  sublabel={idea.problemLabel} 
                />
                <ScoreDisplay 
                  score={idea.feasibilityScore} 
                  label="Feasibility" 
                  sublabel={idea.feasibilityLabel} 
                />
                <ScoreDisplay 
                  score={idea.timingScore} 
                  label="Timing" 
                  sublabel={idea.timingLabel} 
                />
                <ScoreDisplay 
                  score={idea.executionScore} 
                  label="Execution" 
                  sublabel="Difficulty" 
                />
                <ScoreDisplay 
                  score={idea.gtmScore} 
                  label="Go-to-Market" 
                  sublabel="Strength" 
                />
              </CardContent>
            </Card>

            {/* Keyword Data */}
            {idea.keyword && (
              <Card>
                <CardHeader>
                  <CardTitle>Market Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Primary Keyword</p>
                    <p className="font-semibold" data-testid="text-keyword">{idea.keyword}</p>
                  </div>
                  
                  {idea.keywordVolume && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Search Volume</p>
                      <p className="font-semibold" data-testid="text-keyword-volume">
                        {idea.keywordVolume.toLocaleString()}/month
                      </p>
                    </div>
                  )}
                  
                  {idea.keywordGrowth && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                      <p className="font-semibold text-green-600" data-testid="text-keyword-growth">
                        +{idea.keywordGrowth}%
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" data-testid="button-ai-research">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  AI Research Report
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-founder-fit">
                  <Users className="w-4 h-4 mr-2" />
                  Founder Fit Test
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-similar-ideas">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Similar Ideas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
