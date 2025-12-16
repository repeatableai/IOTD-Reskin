import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import ScoreDisplay from "@/components/ScoreDisplay";
import IdeaActionButtons from "@/components/IdeaActionButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Award,
  Check,
  Flame,
  ChevronRight,
  Play,
  MessageSquare
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import RoastDialog from "@/components/RoastDialog";
import CommunitySignalDialog from "@/components/CommunitySignalDialog";
import ClaimButton from "@/components/ClaimButton";
import ExportDialog from "@/components/ExportDialog";

export default function IdeaDetail() {
  const { slug } = useParams();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showBuilderDialog, setShowBuilderDialog] = useState(false);
  const [showRoastDialog, setShowRoastDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

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
      toast({ title: "Solution saved successfully!" });
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
        description: "Failed to save solution. Please try again.",
        variant: "destructive" 
      });
    },
  });

  const unsaveIdeaMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/ideas/${idea.id}/save`);
    },
    onSuccess: () => {
      toast({ title: "Solution unsaved successfully!" });
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
        description: "Failed to unsave solution. Please try again.",
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
      setShowBuilderDialog(true);
      return { success: true };
    },
    onSuccess: () => {
      // Dialog is shown via setShowBuilderDialog
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
    onSuccess: async () => {
      toast({ title: "Solution claimed successfully!" });
      await queryClient.refetchQueries({ queryKey: ["/api/ideas", idea.slug] });
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
        description: "Failed to claim solution. Please try again.",
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
            <h1 className="text-2xl font-bold mb-4">Solution Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The solution you're looking for doesn't exist or has been removed.
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
          
          {/* Dynamic Insight Badges */}
          {(() => {
            // Generate dynamic badges based on scores
            const dynamicBadges: { text: string; icon: string; color: string }[] = [];
            
            // Why Now / Timing badges
            if (idea.whyNowScore >= 8) {
              dynamicBadges.push({ text: 'Perfect Timing', icon: '⏰', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' });
            } else if (idea.whyNowScore >= 6) {
              dynamicBadges.push({ text: 'Good Timing', icon: '⏰', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' });
            }
            
            // Market size badges
            if (idea.opportunityScore >= 9) {
              dynamicBadges.push({ text: 'Massive Market', icon: '🌍', color: 'bg-blue-100 text-blue-800 border-blue-300' });
            } else if (idea.opportunityScore >= 7) {
              dynamicBadges.push({ text: 'Large Market', icon: '🌐', color: 'bg-blue-50 text-blue-700 border-blue-200' });
            }
            
            // Problem severity badges
            if (idea.problemScore >= 9) {
              dynamicBadges.push({ text: 'Severe Pain', icon: '🔥', color: 'bg-red-100 text-red-800 border-red-300' });
            } else if (idea.problemScore >= 7) {
              dynamicBadges.push({ text: 'Real Problem', icon: '💡', color: 'bg-orange-50 text-orange-700 border-orange-200' });
            }
            
            // Feasibility badges
            if (idea.feasibilityScore >= 8) {
              dynamicBadges.push({ text: 'Easy to Build', icon: '🚀', color: 'bg-green-100 text-green-800 border-green-300' });
            } else if (idea.feasibilityScore <= 4) {
              dynamicBadges.push({ text: 'Complex Build', icon: '⚙️', color: 'bg-gray-100 text-gray-700 border-gray-300' });
            }
            
            // Competitive advantage badges
            if (idea.uniquenessFactor === '10x Better' || idea.innovationScore >= 8) {
              dynamicBadges.push({ text: '10x Better', icon: '✨', color: 'bg-purple-100 text-purple-800 border-purple-300' });
            }
            
            // Revenue potential badges
            if (idea.revenuePotential && idea.revenuePotential.includes('$10M+')) {
              dynamicBadges.push({ text: 'High Revenue', icon: '💰', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' });
            }
            
            // Trend badges
            if (idea.trendGrowth && parseFloat(idea.trendGrowth) > 50) {
              dynamicBadges.push({ text: 'Trending Up', icon: '📈', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' });
            }
            
            // Add existing signal badges
            const existingBadges = idea.signalBadges || [];
            const allBadges = [...dynamicBadges.map(b => b.text), ...existingBadges];
            const displayBadges = dynamicBadges.slice(0, 4);
            const remainingCount = allBadges.length - displayBadges.length;
            
            if (displayBadges.length === 0 && existingBadges.length === 0) return null;
            
            return (
              <div className="flex flex-wrap gap-2 mb-4">
                {displayBadges.map((badge, index) => (
                  <Badge 
                    key={`dynamic-${index}`}
                    variant="outline" 
                    className={`px-3 py-1.5 text-sm font-medium ${badge.color}`}
                    data-testid={`badge-insight-${index}`}
                  >
                    <span className="mr-1">{badge.icon}</span>
                    {badge.text}
                  </Badge>
                ))}
                {existingBadges.slice(0, Math.max(0, 4 - displayBadges.length)).map((signalBadge: string, index: number) => (
                  <Badge 
                    key={`signal-${index}`}
                    variant="outline" 
                    className="px-3 py-1.5 text-sm font-medium"
                    data-testid={`badge-signal-${index}`}
                  >
                    {signalBadge === "Perfect Timing" && "⏰ "}
                    {signalBadge === "Unfair Advantage" && "⚡ "}
                    {signalBadge === "Organic Growth" && "🌱 "}
                    {signalBadge === "Proven Model" && "✓ "}
                    {signalBadge === "Low Competition" && "🎯 "}
                    {signalBadge === "High Demand" && "🔥 "}
                    {signalBadge === "Strong Community" && "👥 "}
                    {signalBadge === "Tech Tailwind" && "🚀 "}
                    {signalBadge === "Clear Monetization" && "💰 "}
                    {signalBadge}
                  </Badge>
                ))}
                {remainingCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="px-3 py-1.5 text-sm cursor-pointer hover:bg-secondary/80"
                    title={`${remainingCount} more insights available`}
                  >
                    +{remainingCount} More
                  </Badge>
                )}
              </div>
            );
          })()}
          
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

          <div className="flex flex-wrap gap-3 items-center">
            {isAuthenticated && idea?.id && (
              <IdeaActionButtons ideaId={idea.id} />
            )}
            
            <Separator orientation="vertical" className="h-8 mx-2" />
            
            <Button 
              variant="outline" 
              onClick={() => buildIdeaMutation.mutate()}
              disabled={buildIdeaMutation.isPending}
              data-testid="button-build-idea"
            >
              <Code className="w-4 h-4 mr-2" />
              {buildIdeaMutation.isPending ? 'Creating...' : 'Build This Solution'}
            </Button>

            <Button 
              variant="outline"
              onClick={() => setShowRoastDialog(true)}
              className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950"
              data-testid="button-roast-idea"
            >
              <Flame className="w-4 h-4 mr-2" />
              Roast
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowExportDialog(true)}
              data-testid="button-export-data"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <ClaimButton 
              ideaId={idea.id} 
              ideaTitle={idea.title}
            />
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
                    <TabsList className="flex flex-wrap gap-2 h-auto p-1 bg-muted/50">
                      {idea.offerTiers && <TabsTrigger value="offer" className="px-4">Offer</TabsTrigger>}
                      {idea.whyNowAnalysis && <TabsTrigger value="whynow" className="px-4">Why Now</TabsTrigger>}
                      {idea.proofSignals && <TabsTrigger value="proof" className="px-4">Proof</TabsTrigger>}
                      {idea.marketGap && <TabsTrigger value="gap" className="px-4">Gap</TabsTrigger>}
                      {idea.executionPlan && <TabsTrigger value="execution" className="px-4">Plan</TabsTrigger>}
                      {idea.frameworkData && <TabsTrigger value="framework" className="px-4">Framework</TabsTrigger>}
                      {idea.trendAnalysis && <TabsTrigger value="trends" className="px-4">Trends</TabsTrigger>}
                      {idea.keywordData && <TabsTrigger value="keywords" className="px-4">Keywords</TabsTrigger>}
                      {idea.builderPrompts && <TabsTrigger value="builders" className="px-4">Builders</TabsTrigger>}
                    </TabsList>

                    {idea.offerTiers && (
                      <TabsContent value="offer" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <DollarSign className="w-5 h-5 mr-2 text-primary" />
                            <h3 className="text-lg font-semibold">Value Ladder</h3>
                          </div>
                          <Link href={`/idea/${slug}/value-ladder`}>
                            <Button variant="outline" size="sm">
                              View full value ladder →
                            </Button>
                          </Link>
                        </div>
                        
                        {/* IdeaBrowser-style numbered value ladder */}
                        <div className="space-y-3">
                          {idea.offerTiers.leadMagnet && (
                            <div className="flex items-start gap-4 p-4 rounded-lg border bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/30 border-green-200 dark:border-green-800">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm">
                                1
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Lead Magnet</span>
                                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                    {idea.offerTiers.leadMagnet.price}
                                  </Badge>
                                </div>
                                <h4 className="font-semibold mb-1">{idea.offerTiers.leadMagnet.name}</h4>
                                <p className="text-sm text-muted-foreground">{idea.offerTiers.leadMagnet.description}</p>
                              </div>
                            </div>
                          )}
                          
                          {idea.offerTiers.frontend && (
                            <div className="flex items-start gap-4 p-4 rounded-lg border bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/30 border-blue-200 dark:border-blue-800">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                                2
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Frontend</span>
                                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                    {idea.offerTiers.frontend.price}
                                  </Badge>
                                </div>
                                <h4 className="font-semibold mb-1">{idea.offerTiers.frontend.name}</h4>
                                <p className="text-sm text-muted-foreground">{idea.offerTiers.frontend.description}</p>
                              </div>
                            </div>
                          )}
                          
                          {idea.offerTiers.core && (
                            <div className="flex items-start gap-4 p-4 rounded-lg border-2 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/30 border-purple-400 dark:border-purple-600 shadow-sm">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm">
                                3
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Core Offer ⭐</span>
                                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                    {idea.offerTiers.core.price}
                                  </Badge>
                                </div>
                                <h4 className="font-semibold mb-1">{idea.offerTiers.core.name}</h4>
                                <p className="text-sm text-muted-foreground">{idea.offerTiers.core.description}</p>
                              </div>
                            </div>
                          )}
                          
                          {idea.offerTiers.backend && (
                            <div className="flex items-start gap-4 p-4 rounded-lg border bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/30 border-orange-200 dark:border-orange-800">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">
                                4
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">Backend</span>
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                                    {idea.offerTiers.backend.price}
                                  </Badge>
                                </div>
                                <h4 className="font-semibold mb-1">{idea.offerTiers.backend.name}</h4>
                                <p className="text-sm text-muted-foreground">{idea.offerTiers.backend.description}</p>
                              </div>
                            </div>
                          )}
                          
                          {idea.offerTiers.continuity && (
                            <div className="flex items-start gap-4 p-4 rounded-lg border bg-gradient-to-r from-cyan-50/50 to-transparent dark:from-cyan-950/30 border-cyan-200 dark:border-cyan-800">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center font-bold text-sm">
                                5
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">Continuity</span>
                                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300">
                                    {idea.offerTiers.continuity.price}
                                  </Badge>
                                </div>
                                <h4 className="font-semibold mb-1">{idea.offerTiers.continuity.name}</h4>
                                <p className="text-sm text-muted-foreground">{idea.offerTiers.continuity.description}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    )}

                    {idea.whyNowAnalysis && (
                      <TabsContent value="whynow" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-primary" />
                            <h3 className="text-lg font-semibold">Why Now Analysis</h3>
                          </div>
                          <Link href={`/idea/${idea.slug}/why-now`}>
                            <Button variant="outline" size="sm" data-testid="button-view-why-now">
                              View Full Analysis
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                          </Link>
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{idea.whyNowAnalysis}</p>
                      </TabsContent>
                    )}

                    {idea.proofSignals && (
                      <TabsContent value="proof" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-primary" />
                            <h3 className="text-lg font-semibold">Proof & Signals</h3>
                          </div>
                          <Link href={`/idea/${idea.slug}/proof-signals`}>
                            <Button variant="outline" size="sm" data-testid="button-view-proof-signals">
                              View Full Analysis
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                          </Link>
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{idea.proofSignals}</p>
                      </TabsContent>
                    )}

                    {idea.marketGap && (
                      <TabsContent value="gap" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Target className="w-5 h-5 mr-2 text-primary" />
                            <h3 className="text-lg font-semibold">Market Gap</h3>
                          </div>
                          <Link href={`/idea/${idea.slug}/market-gap`}>
                            <Button variant="outline" size="sm" data-testid="button-view-market-gap">
                              View Full Analysis
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                          </Link>
                        </div>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{idea.marketGap}</p>
                      </TabsContent>
                    )}

                    {idea.executionPlan && (
                      <TabsContent value="execution" className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Rocket className="w-5 h-5 mr-2 text-primary" />
                            <h3 className="text-lg font-semibold">Execution Plan</h3>
                          </div>
                          <Link href={`/idea/${idea.slug}/execution-analysis`}>
                            <Button variant="outline" size="sm" data-testid="button-view-execution-plan">
                              View Full Analysis
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                          </Link>
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
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold">Value Equation</h4>
                              <Link href={`/idea/${idea.slug}/value-equation`}>
                                <Button variant="outline" size="sm" data-testid="button-view-value-equation">
                                  View Full Analysis
                                  <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                              </Link>
                            </div>
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
                                <p className="text-sm text-muted-foreground">{idea.frameworkData.valueEquation.effortAndSacrifice}</p>
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
                                  onClick={() => window.open(`https://claude.ai/?prompt=${encodeURIComponent(prompt)}`, '_blank')}
                                >
                                  Claude Codex
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

            {/* Research Tool Promotional Section */}
            {!researchReport && (
              <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 border-2 border-purple-200 dark:border-purple-800">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">Get AI-Powered Market Research</h3>
                      <p className="text-muted-foreground mb-4">
                        Generate a comprehensive market analysis report for this solution in seconds. Our AI analyzes market size, competition, customer segments, revenue potential, and provides actionable next steps.
                      </p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span>Market size and growth analysis</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span>Competitive landscape overview</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span>Revenue projections and business model</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span>Risk assessment and mitigation strategies</span>
                        </li>
                      </ul>
                      <Button 
                        size="lg"
                        onClick={generateResearchReport}
                        disabled={isGeneratingReport || !isAuthenticated}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        data-testid="button-generate-research"
                      >
                        {isGeneratingReport ? (
                          <>
                            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                            Generating Research...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Research Report
                          </>
                        )}
                      </Button>
                      {!isAuthenticated && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Sign in to generate AI research reports
                        </p>
                      )}
                    </div>
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
            {/* Interactive Opportunity Scores - IdeaBrowser Style */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Opportunity Scores</CardTitle>
                <p className="text-xs text-muted-foreground">Click any score for detailed analysis</p>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <ScoreDisplay 
                  score={idea.opportunityScore} 
                  label="Opportunity" 
                  sublabel={idea.opportunityLabel}
                  interactive={true}
                  scoreType="opportunity"
                  ideaSlug={slug}
                />
                <ScoreDisplay 
                  score={idea.problemScore} 
                  label="Problem" 
                  sublabel={idea.problemLabel}
                  interactive={true}
                  scoreType="problem"
                  ideaSlug={slug}
                />
                <ScoreDisplay 
                  score={idea.feasibilityScore} 
                  label="Feasibility" 
                  sublabel={idea.feasibilityLabel}
                  interactive={true}
                  scoreType="feasibility"
                  ideaSlug={slug}
                />
                <ScoreDisplay 
                  score={idea.timingScore || idea.whyNowScore} 
                  label="Why Now" 
                  sublabel={idea.timingLabel}
                  interactive={true}
                  scoreType="timing"
                  ideaSlug={slug}
                />
                <ScoreDisplay 
                  score={idea.executionScore} 
                  label="Execution" 
                  sublabel="Difficulty"
                  interactive={true}
                  scoreType="execution"
                  ideaSlug={slug}
                />
                <ScoreDisplay 
                  score={idea.gtmScore} 
                  label="Go-to-Market" 
                  sublabel="Strength"
                  interactive={true}
                  scoreType="gtm"
                  ideaSlug={slug}
                />
              </CardContent>
            </Card>

            {/* Business Fit Section - Clean Design */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Business Fit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {/* Revenue Potential */}
                <div 
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group"
                  onClick={() => setLocation(`/idea/${slug}/revenue-analysis`)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Revenue Potential</p>
                      <p className="text-xs text-muted-foreground">{idea.revenuePotential || '$1M-$10M ARR'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>

                <Separator />

                {/* Execution Difficulty */}
                <div 
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group"
                  onClick={() => setLocation(`/idea/${slug}/execution-analysis`)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Rocket className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Execution</p>
                      <p className="text-xs text-muted-foreground">{idea.executionScore || 6}/10 difficulty</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>

                <Separator />

                {/* Go-To-Market */}
                <div 
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group"
                  onClick={() => setLocation(`/idea/${slug}/gtm-strategy`)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Go-To-Market</p>
                      <p className="text-xs text-muted-foreground">{idea.gtmScore || 8}/10 strength</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>

                <Separator />

                {/* Founder Fit */}
                <div 
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors group"
                  onClick={() => setLocation(`/idea/${slug}/founder-fit-analysis`)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-md bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                      <Users className="w-4 h-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Founder Fit</p>
                      <p className="text-xs text-muted-foreground">Is this right for you?</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Community Signals - Primary Position */}
            <Card className="border-2 border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Community Signals
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">Live Data</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Where people are discussing this problem</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Reddit */}
                <div 
                  className="flex items-center justify-between p-3 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/50 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors group"
                  onClick={() => setLocation(`/idea/${slug}/community-signals`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      R
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Reddit</p>
                      <p className="text-xs text-muted-foreground">
                        {idea.communitySignals?.reddit?.subreddits || '5'} subreddits · {idea.communitySignals?.reddit?.members || '2.5M+'} members
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-500 text-white">
                      {idea.communitySignals?.reddit?.score || 8}/10
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </div>

                {/* Twitter/X */}
                <div 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/30 transition-colors group"
                  onClick={() => setLocation(`/idea/${slug}/community-signals`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold">
                      𝕏
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Twitter/X</p>
                      <p className="text-xs text-muted-foreground">
                        Active discussions · High engagement
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {idea.communitySignals?.twitter?.score || 7}/10
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </div>

                {/* YouTube */}
                <div 
                  className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/50 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors group"
                  onClick={() => setLocation(`/idea/${slug}/community-signals`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
                      <Play className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">YouTube</p>
                      <p className="text-xs text-muted-foreground">
                        {idea.communitySignals?.youtube?.channels || '14'} channels · {idea.communitySignals?.youtube?.views || '10M+'} views
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {idea.communitySignals?.youtube?.score || 7}/10
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </div>

                {/* Facebook Groups */}
                <div 
                  className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors group"
                  onClick={() => setLocation(`/idea/${slug}/community-signals`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      f
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Facebook</p>
                      <p className="text-xs text-muted-foreground">
                        {idea.communitySignals?.facebook?.groups || '5'} groups · {idea.communitySignals?.facebook?.members || '500K+'} members
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {idea.communitySignals?.facebook?.score || 6}/10
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                  </div>
                </div>

                {/* View Full Analysis */}
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => setLocation(`/idea/${slug}/community-signals`)}
                >
                  View Full Community Analysis
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* User Rating - Moved Below */}
            {isAuthenticated && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Your Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => rateIdeaMutation.mutate(rating)}
                        disabled={rateIdeaMutation.isPending}
                        className="transition-transform hover:scale-110"
                        data-testid={`button-rate-${rating}`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            (userRating as any)?.rating >= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {idea.averageRating && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Avg: {idea.averageRating}/5 ({idea.ratingCount || 0})
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Legacy Community Signals - Hidden if new one exists */}
            {false && idea.communitySignals && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Community Signals
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Click any platform for detailed analysis</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {idea.communitySignals.reddit && (
                    <CommunitySignalDialog
                      platform="reddit"
                      data={idea.communitySignals.reddit}
                      ideaSlug={slug || ''}
                    >
                      <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/50 rounded-lg border border-orange-200 dark:border-orange-800 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold">R</div>
                          <div>
                            <p className="font-semibold text-sm">Reddit</p>
                            <p className="text-xs text-muted-foreground">
                              {idea.communitySignals.reddit.subreddits} subreddits · {idea.communitySignals.reddit.members}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                          {idea.communitySignals.reddit.score}/10
                        </Badge>
                      </div>
                    </CommunitySignalDialog>
                  )}
                  
                  {idea.communitySignals.facebook && (
                    <CommunitySignalDialog
                      platform="facebook"
                      data={idea.communitySignals.facebook}
                      ideaSlug={slug || ''}
                    >
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">f</div>
                          <div>
                            <p className="font-semibold text-sm">Facebook</p>
                            <p className="text-xs text-muted-foreground">
                              {idea.communitySignals.facebook.groups} groups · {idea.communitySignals.facebook.members}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                          {idea.communitySignals.facebook.score}/10
                        </Badge>
                      </div>
                    </CommunitySignalDialog>
                  )}
                  
                  {idea.communitySignals.youtube && (
                    <CommunitySignalDialog
                      platform="youtube"
                      data={idea.communitySignals.youtube}
                      ideaSlug={slug || ''}
                    >
                      <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">▶</div>
                          <div>
                            <p className="font-semibold text-sm">YouTube</p>
                            <p className="text-xs text-muted-foreground">
                              {idea.communitySignals.youtube.channels} channels · {idea.communitySignals.youtube.views}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                          {idea.communitySignals.youtube.score}/10
                        </Badge>
                      </div>
                    </CommunitySignalDialog>
                  )}
                  
                  {idea.communitySignals.other && (
                    <CommunitySignalDialog
                      platform="other"
                      data={idea.communitySignals.other}
                      ideaSlug={slug || ''}
                    >
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/50 rounded-lg border border-purple-200 dark:border-purple-800 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">+</div>
                          <div>
                            <p className="font-semibold text-sm">Other</p>
                            <p className="text-xs text-muted-foreground">
                              {idea.communitySignals.other.segments} segments · {idea.communitySignals.other.priorities} priorities
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                          {idea.communitySignals.other.score}/10
                        </Badge>
                      </div>
                    </CommunitySignalDialog>
                  )}
                  
                  {/* View Full Analysis Link */}
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm text-primary hover:text-primary/80"
                    onClick={() => setLocation(`/idea/${slug}/community-signals`)}
                  >
                    View detailed breakdown →
                  </Button>
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
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setLocation(`/ai-chat/${slug}`)}
                  data-testid="button-ai-chat"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Chat
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setLocation('/founder-fit')}
                  data-testid="button-founder-fit"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Founder Fit Test
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-similar-ideas">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Similar Solutions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Builder Options Dialog */}
      <Dialog open={showBuilderDialog} onOpenChange={setShowBuilderDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Start Building in 1-click</DialogTitle>
            <DialogDescription>
              Turn this idea into your business with pre-built prompts for any AI platform
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            {/* Works With Section */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Works with:</span>
              <div className="flex gap-3">
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-medium">
                  <span className="text-pink-500">♥</span> Lovable
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-medium">
                  <span>⚡</span> v0
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-medium">
                  <span className="text-orange-500">◎</span> Replit
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-medium">
                  ChatGPT
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs font-medium">
                  Claude
                </div>
                <span className="text-xs">+more</span>
              </div>
            </div>

            {/* Build Prompt Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Replit */}
              <Card 
                className="cursor-pointer hover:border-orange-400 hover:shadow-md transition-all group"
                onClick={() => {
                  setLocation(`/idea/${slug}/build/replit`);
                  setShowBuilderDialog(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                      <span className="text-orange-500 text-xl">◎</span>
                    </div>
                    <h3 className="font-semibold">Replit Agent</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI-powered full-stack development platform
                  </p>
                </CardContent>
              </Card>

              {/* v0 */}
              <Card 
                className="cursor-pointer hover:border-purple-400 hover:shadow-md transition-all group"
                onClick={() => {
                  setLocation(`/idea/${slug}/build/v0`);
                  setShowBuilderDialog(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                      <span className="text-purple-500 text-xl">⚡</span>
                    </div>
                    <h3 className="font-semibold">v0 by Vercel</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI UI component generator for React/Next.js
                  </p>
                </CardContent>
              </Card>

              {/* Lovable */}
              <Card 
                className="cursor-pointer hover:border-pink-400 hover:shadow-md transition-all group"
                onClick={() => {
                  setLocation(`/idea/${slug}/build/bolt`);
                  setShowBuilderDialog(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/50 rounded-lg">
                      <span className="text-pink-500 text-xl">♥</span>
                    </div>
                    <h3 className="font-semibold">Lovable</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Build full-stack apps with natural language
                  </p>
                </CardContent>
              </Card>

              {/* Cursor */}
              <Card 
                className="cursor-pointer hover:border-green-400 hover:shadow-md transition-all group"
                onClick={() => {
                  setLocation(`/idea/${slug}/build/cursor`);
                  setShowBuilderDialog(false);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                      <Target className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="font-semibold">Cursor IDE</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI-first code editor with intelligent suggestions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Prompt Types */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">More prompts...</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    setLocation(`/idea/${slug}/build/ad-creatives`);
                    setShowBuilderDialog(false);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2 text-pink-500" />
                  Ad Creatives
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    setLocation(`/idea/${slug}/build/brand-package`);
                    setShowBuilderDialog(false);
                  }}
                >
                  <Star className="w-4 h-4 mr-2 text-indigo-500" />
                  Brand Package
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    setLocation(`/idea/${slug}/build/replit`);
                    setShowBuilderDialog(false);
                  }}
                >
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Landing Page
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Roast Dialog */}
      {idea && (
        <RoastDialog
          open={showRoastDialog}
          onOpenChange={setShowRoastDialog}
          idea={{
            id: idea.id,
            title: idea.title,
            description: idea.description,
            market: idea.market,
            type: idea.type,
            targetAudience: idea.targetAudience,
            opportunityScore: idea.opportunityScore,
            problemScore: idea.problemScore,
          }}
        />
      )}

      {/* Export Dialog */}
      {idea && (
        <ExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          ideaId={idea.id}
          ideaSlug={idea.slug}
          ideaTitle={idea.title}
        />
      )}
    </div>
  );
}
