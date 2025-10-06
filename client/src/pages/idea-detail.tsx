import { useState } from "react";
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
  Users,
  FileText,
  Sparkles,
  DollarSign,
  Clock,
  Target,
  Rocket,
  BarChart,
  Activity,
  Search,
  Star,
  Award
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const { data: userRating } = useQuery({
    queryKey: ["/api/ideas", idea?.id, "rating"],
    enabled: isAuthenticated && !!idea?.id,
    retry: false,
  });

  const { data: communitySignals } = useQuery({
    queryKey: ["/api/ideas", idea?.id, "community-signals"],
    enabled: !!idea?.id,
  });

  const [researchReport, setResearchReport] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

  const buildIdeaMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/ideas/${idea.id}/build`);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your no-code builder project has been created.",
      });
      window.open(data.builderUrl, '_blank');
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
        description: "Failed to create builder project. Please try again.",
        variant: "destructive"
      });
    },
  });

  const claimIdeaMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/ideas/${idea.id}/claim`);
    },
    onSuccess: () => {
      toast({ title: "Idea claimed successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", idea.slug] });
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
        description: "Failed to claim idea. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const rateIdeaMutation = useMutation({
    mutationFn: async (rating: number) => {
      await apiRequest("POST", `/api/ideas/${idea.id}/rate`, { rating });
    },
    onSuccess: () => {
      toast({ title: "Rating submitted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", idea?.id, "rating"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas", idea.slug] });
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
        description: "Failed to submit rating. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/ideas/${idea.id}/export`);
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${idea.slug}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Data exported successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateResearchReport = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate AI research reports.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingReport(true);
    
    try {
      const response = await apiRequest('POST', '/api/ai/research-report', {
        ideaTitle: idea.title,
        ideaDescription: idea.description,
      });
      const report = await response.json();
      setResearchReport(report);
      
      toast({
        title: "Research Report Generated!",
        description: "Your AI-powered research report is ready.",
      });
    } catch (error) {
      console.error('Error generating research report:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate research report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleVote = (voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote on ideas.",
        variant: "destructive",
      });
      return;
    }

    if ((userVote as any)?.vote === voteType) {
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
                  variant={(userVote as any)?.vote === 'up' ? 'default' : 'outline'}
                  onClick={() => handleVote('up')}
                  disabled={voteMutation.isPending || removeVoteMutation.isPending}
                  data-testid="button-vote-up"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Vote Up
                </Button>
                
                <Button
                  variant={(userVote as any)?.vote === 'down' ? 'default' : 'outline'}
                  onClick={() => handleVote('down')}
                  disabled={voteMutation.isPending || removeVoteMutation.isPending}
                  data-testid="button-vote-down"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Vote Down
                </Button>
              </>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => buildIdeaMutation.mutate()}
              disabled={buildIdeaMutation.isPending}
              data-testid="button-build-idea"
            >
              <Code className="w-4 h-4 mr-2" />
              {buildIdeaMutation.isPending ? 'Creating...' : 'Build This Idea'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleExportData}
              data-testid="button-export-data"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            
            {isAuthenticated && !idea.claimedBy && (
              <Button 
                variant="default"
                onClick={() => claimIdeaMutation.mutate()}
                disabled={claimIdeaMutation.isPending}
                data-testid="button-claim-idea"
              >
                <Award className="w-4 h-4 mr-2" />
                {claimIdeaMutation.isPending ? 'Claiming...' : 'Claim This Idea'}
              </Button>
            )}
            
            {idea.claimedBy && (
              <Badge variant="secondary" className="px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                Claimed
              </Badge>
            )}
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

            {/* Comprehensive Analysis Sections */}
            {(idea.offerTiers || idea.whyNowAnalysis || idea.proofSignals || idea.marketGap || 
              idea.executionPlan || idea.frameworkData || idea.trendAnalysis || idea.keywordData || idea.builderPrompts) && (
              <Card>
                <CardHeader>
                  <CardTitle>In-Depth Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="offer" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9">
                      {idea.offerTiers && <TabsTrigger value="offer">Offer</TabsTrigger>}
                      {idea.whyNowAnalysis && <TabsTrigger value="whynow">Why Now</TabsTrigger>}
                      {idea.proofSignals && <TabsTrigger value="proof">Proof</TabsTrigger>}
                      {idea.marketGap && <TabsTrigger value="gap">Gap</TabsTrigger>}
                      {idea.executionPlan && <TabsTrigger value="execution">Plan</TabsTrigger>}
                      {idea.frameworkData && <TabsTrigger value="framework">Framework</TabsTrigger>}
                      {idea.trendAnalysis && <TabsTrigger value="trends">Trends</TabsTrigger>}
                      {idea.keywordData && <TabsTrigger value="keywords">Keywords</TabsTrigger>}
                      {idea.builderPrompts && <TabsTrigger value="builders">Builders</TabsTrigger>}
                    </TabsList>

                    {idea.offerTiers && (
                      <TabsContent value="offer" className="space-y-4">
                        <div className="flex items-center mb-4">
                          <DollarSign className="w-5 h-5 mr-2 text-primary" />
                          <h3 className="text-lg font-semibold">Value Ladder</h3>
                        </div>
                        <div className="grid gap-4">
                          {idea.offerTiers.leadMagnet && (
                            <div className="border rounded-lg p-4 bg-muted/50">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">Lead Magnet</h4>
                                <Badge variant="secondary">{idea.offerTiers.leadMagnet.price}</Badge>
                              </div>
                              <p className="text-sm font-medium mb-1">{idea.offerTiers.leadMagnet.name}</p>
                              <p className="text-sm text-muted-foreground">{idea.offerTiers.leadMagnet.description}</p>
                            </div>
                          )}
                          {idea.offerTiers.frontend && (
                            <div className="border rounded-lg p-4 bg-muted/50">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">Frontend Offer</h4>
                                <Badge variant="secondary">{idea.offerTiers.frontend.price}</Badge>
                              </div>
                              <p className="text-sm font-medium mb-1">{idea.offerTiers.frontend.name}</p>
                              <p className="text-sm text-muted-foreground">{idea.offerTiers.frontend.description}</p>
                            </div>
                          )}
                          {idea.offerTiers.core && (
                            <div className="border rounded-lg p-4 bg-primary/10">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">Core Offer</h4>
                                <Badge>{idea.offerTiers.core.price}</Badge>
                              </div>
                              <p className="text-sm font-medium mb-1">{idea.offerTiers.core.name}</p>
                              <p className="text-sm text-muted-foreground">{idea.offerTiers.core.description}</p>
                            </div>
                          )}
                          {idea.offerTiers.backend && (
                            <div className="border rounded-lg p-4 bg-muted/50">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">Backend Offer</h4>
                                <Badge variant="secondary">{idea.offerTiers.backend.price}</Badge>
                              </div>
                              <p className="text-sm font-medium mb-1">{idea.offerTiers.backend.name}</p>
                              <p className="text-sm text-muted-foreground">{idea.offerTiers.backend.description}</p>
                            </div>
                          )}
                          {idea.offerTiers.continuity && (
                            <div className="border rounded-lg p-4 bg-muted/50">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold">Continuity</h4>
                                <Badge variant="secondary">{idea.offerTiers.continuity.price}</Badge>
                              </div>
                              <p className="text-sm font-medium mb-1">{idea.offerTiers.continuity.name}</p>
                              <p className="text-sm text-muted-foreground">{idea.offerTiers.continuity.description}</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    )}

                    {idea.whyNowAnalysis && (
                      <TabsContent value="whynow" className="space-y-4">
                        <div className="flex items-center mb-4">
                          <Clock className="w-5 h-5 mr-2 text-primary" />
                          <h3 className="text-lg font-semibold">Why Now Analysis</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{idea.whyNowAnalysis}</p>
                      </TabsContent>
                    )}

                    {idea.proofSignals && (
                      <TabsContent value="proof" className="space-y-4">
                        <div className="flex items-center mb-4">
                          <Activity className="w-5 h-5 mr-2 text-primary" />
                          <h3 className="text-lg font-semibold">Proof & Signals</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{idea.proofSignals}</p>
                      </TabsContent>
                    )}

                    {idea.marketGap && (
                      <TabsContent value="gap" className="space-y-4">
                        <div className="flex items-center mb-4">
                          <Target className="w-5 h-5 mr-2 text-primary" />
                          <h3 className="text-lg font-semibold">Market Gap</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{idea.marketGap}</p>
                      </TabsContent>
                    )}

                    {idea.executionPlan && (
                      <TabsContent value="execution" className="space-y-4">
                        <div className="flex items-center mb-4">
                          <Rocket className="w-5 h-5 mr-2 text-primary" />
                          <h3 className="text-lg font-semibold">Execution Plan</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{idea.executionPlan}</p>
                      </TabsContent>
                    )}

                    {idea.frameworkData && (
                      <TabsContent value="framework" className="space-y-4">
                        <div className="flex items-center mb-4">
                          <BarChart className="w-5 h-5 mr-2 text-primary" />
                          <h3 className="text-lg font-semibold">Framework Analysis</h3>
                        </div>
                        
                        {idea.frameworkData.valueEquation && (
                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-3">Value Equation</h4>
                            <div className="grid gap-3">
                              <div>
                                <p className="text-sm font-medium">Dream Outcome</p>
                                <p className="text-sm text-muted-foreground">{idea.frameworkData.valueEquation.dreamOutcome}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Perceived Likelihood</p>
                                <p className="text-sm text-muted-foreground">{idea.frameworkData.valueEquation.perceivedLikelihood}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Time Delay</p>
                                <p className="text-sm text-muted-foreground">{idea.frameworkData.valueEquation.timeDelay}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Effort & Sacrifice</p>
                                <p className="text-sm text-muted-foreground">{idea.frameworkData.valueEquation.effortSacrifice}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {idea.frameworkData.marketMatrix && (
                          <div className="border rounded-lg p-4 mt-4">
                            <h4 className="font-semibold mb-3">Market Matrix</h4>
                            <div className="grid gap-3">
                              <div>
                                <p className="text-sm font-medium">Market Size</p>
                                <p className="text-sm text-muted-foreground">{idea.frameworkData.marketMatrix.marketSize}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Pain Level</p>
                                <p className="text-sm text-muted-foreground">{idea.frameworkData.marketMatrix.painLevel}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Targeting Ease</p>
                                <p className="text-sm text-muted-foreground">{idea.frameworkData.marketMatrix.targetingEase}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Purchasing Power</p>
                                <p className="text-sm text-muted-foreground">{idea.frameworkData.marketMatrix.purchasingPower}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {idea.frameworkData.acpFramework && (
                          <div className="border rounded-lg p-4 mt-4">
                            <h4 className="font-semibold mb-3">A.C.P. Framework</h4>
                            <div className="grid gap-3">
                              <div>
                                <p className="text-sm font-medium">Avatar</p>
                                <p className="text-sm text-muted-foreground">{idea.frameworkData.acpFramework.avatar}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Catalyst</p>
                                <p className="text-sm text-muted-foreground">{idea.frameworkData.acpFramework.catalyst}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">Promise</p>
                                <p className="text-sm text-muted-foreground">{idea.frameworkData.acpFramework.promise}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    )}

                    {idea.trendAnalysis && (
                      <TabsContent value="trends" className="space-y-4">
                        <div className="flex items-center mb-4">
                          <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                          <h3 className="text-lg font-semibold">Trend Analysis</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{idea.trendAnalysis}</p>
                      </TabsContent>
                    )}

                    {idea.keywordData && (
                      <TabsContent value="keywords" className="space-y-4">
                        <div className="flex items-center mb-4">
                          <Search className="w-5 h-5 mr-2 text-primary" />
                          <h3 className="text-lg font-semibold">Enhanced Keywords</h3>
                        </div>
                        
                        <Tabs defaultValue="fastest" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="fastest">Fastest Growing</TabsTrigger>
                            <TabsTrigger value="highest">Highest Volume</TabsTrigger>
                            <TabsTrigger value="relevant">Most Relevant</TabsTrigger>
                          </TabsList>

                          <TabsContent value="fastest" className="space-y-2 mt-4">
                            {idea.keywordData.fastestGrowing?.map((kw: any, i: number) => (
                              <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium">{kw.keyword}</p>
                                  <p className="text-sm text-muted-foreground">{kw.volume.toLocaleString()} searches/mo</p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="secondary" className="mb-1">{kw.growth}</Badge>
                                  <p className="text-xs text-muted-foreground">Competition: {kw.competition}</p>
                                </div>
                              </div>
                            ))}
                          </TabsContent>

                          <TabsContent value="highest" className="space-y-2 mt-4">
                            {idea.keywordData.highestVolume?.map((kw: any, i: number) => (
                              <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium">{kw.keyword}</p>
                                  <p className="text-sm text-muted-foreground">{kw.volume.toLocaleString()} searches/mo</p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="secondary" className="mb-1">{kw.growth}</Badge>
                                  <p className="text-xs text-muted-foreground">Competition: {kw.competition}</p>
                                </div>
                              </div>
                            ))}
                          </TabsContent>

                          <TabsContent value="relevant" className="space-y-2 mt-4">
                            {idea.keywordData.mostRelevant?.map((kw: any, i: number) => (
                              <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                                <div>
                                  <p className="font-medium">{kw.keyword}</p>
                                  <p className="text-sm text-muted-foreground">{kw.volume.toLocaleString()} searches/mo</p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="secondary" className="mb-1">{kw.growth}</Badge>
                                  <p className="text-xs text-muted-foreground">Competition: {kw.competition}</p>
                                </div>
                              </div>
                            ))}
                          </TabsContent>
                        </Tabs>
                      </TabsContent>
                    )}

                    {idea.builderPrompts && (
                      <TabsContent value="builders" className="space-y-4">
                        <div className="flex items-center mb-4">
                          <Code className="w-5 h-5 mr-2 text-primary" />
                          <h3 className="text-lg font-semibold">AI Builder Integrations</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Use these pre-built prompts with your favorite AI builders to bring this idea to life.
                        </p>
                        <div className="grid gap-4">
                          {Object.entries(idea.builderPrompts).map(([key, prompt]: [string, any]) => (
                            <div key={key} className="border rounded-lg p-4">
                              <h4 className="font-semibold capitalize mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                              <p className="text-sm text-muted-foreground mb-3">{prompt}</p>
                              <div className="flex flex-wrap gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    navigator.clipboard.writeText(prompt);
                                    toast({ title: "Copied!", description: "Prompt copied to clipboard" });
                                  }}
                                >
                                  Copy Prompt
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(`https://bolt.new/?prompt=${encodeURIComponent(prompt)}`, '_blank')}
                                >
                                  Bolt.new
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(`https://lovable.dev/create?prompt=${encodeURIComponent(prompt)}`, '_blank')}
                                >
                                  Lovable
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(`https://v0.dev/?prompt=${encodeURIComponent(prompt)}`, '_blank')}
                                >
                                  v0.dev
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(`https://chat.openai.com/?q=${encodeURIComponent(prompt)}`, '_blank')}
                                >
                                  ChatGPT
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(prompt);
                                    window.open('https://claude.ai/new', '_blank');
                                    toast({ 
                                      title: "Prompt Copied!", 
                                      description: "Paste it into Claude to get started" 
                                    });
                                  }}
                                >
                                  Claude
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )}
                  </Tabs>
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
            {communitySignals && (communitySignals as any).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Community Signals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(communitySignals as any).map((signal: any) => (
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

            {/* AI Research Report */}
            {researchReport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    AI Research Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Executive Summary</h4>
                    <p className="text-sm text-muted-foreground">{researchReport.executiveSummary}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Market Analysis</h4>
                    <p className="text-sm text-muted-foreground">{researchReport.marketAnalysis}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Key Findings</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {researchReport.keyFindings?.map((finding: string, index: number) => (
                        <li key={index}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Market Opportunities</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {researchReport.opportunities?.map((opportunity: string, index: number) => (
                          <li key={index}>{opportunity}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Potential Barriers</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {researchReport.barriers?.map((barrier: string, index: number) => (
                          <li key={index}>{barrier}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Next Steps</h4>
                    <p className="text-sm text-muted-foreground">{researchReport.nextSteps}</p>
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

            {/* User Rating */}
            {isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle>Rate This Idea</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => rateIdeaMutation.mutate(rating)}
                        disabled={rateIdeaMutation.isPending}
                        className="transition-transform hover:scale-110"
                        data-testid={`button-rate-${rating}`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            (userRating as any)?.rating >= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {idea.averageRating && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Average: {idea.averageRating}/5 ({idea.ratingCount || 0} ratings)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
                <Button 
                  className="w-full" 
                  onClick={generateResearchReport}
                  disabled={isGeneratingReport || !isAuthenticated}
                  data-testid="button-ai-research"
                >
                  {isGeneratingReport ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      AI Research Report
                    </>
                  )}
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
