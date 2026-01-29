import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Bookmark,
  ThumbsUp,
  Star,
  DollarSign,
  Wrench,
  Rocket,
  Brain,
  Code,
  TrendingUp,
  Download,
  Lock,
  Lightbulb,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { format, subDays, addDays, isAfter } from "date-fns";

export default function TopIdeas() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [, setLocation] = useLocation();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [storytellingNarrative, setStorytellingNarrative] = useState<string | null>(null);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const { toast } = useToast();

  const dateString = format(selectedDate, 'yyyy-MM-dd');

  const { data: featuredIdea, isLoading } = useQuery<any>({
    queryKey: ["/api/ideas/featured", dateString],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/featured?date=${dateString}`);
      if (!response.ok) throw new Error('Failed to fetch featured idea');
      return response.json();
    },
  });

  const generateNarrative = async (force = false) => {
    if (!featuredIdea) return;
    setIsGeneratingNarrative(true);
    try {
      const response = await apiRequest('POST', '/api/ai/generate-storytelling-narrative', {
        ideaId: featuredIdea.id,
        slug: featuredIdea.slug,
        force,
      });
      const data = await response.json();
      setStorytellingNarrative(data.narrative);
      if (force) {
        toast({
          title: "Narrative Regenerated",
          description: "A fresh storytelling narrative has been generated.",
        });
      }
    } catch (error) {
      console.error('Error generating storytelling narrative:', error);
      if (force) {
        toast({
          title: "Generation Failed",
          description: "Failed to generate storytelling narrative. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  useEffect(() => {
    if (!featuredIdea) return;
    if (featuredIdea.storytellingNarrative) {
      setStorytellingNarrative(featuredIdea.storytellingNarrative);
    } else {
      setStorytellingNarrative(null);
      generateNarrative();
    }
  }, [featuredIdea?.id]);

  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      return apiRequest(`/api/ideas/${featuredIdea.id}/rate`, 'POST', { rating });
    },
    onSuccess: () => {
      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas/featured", dateString] });
    },
  });

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    const nextDate = addDays(selectedDate, 1);
    if (!isAfter(nextDate, new Date())) {
      setSelectedDate(nextDate);
    }
  };

  const handleRating = (rating: number) => {
    setSelectedRating(rating);
    ratingMutation.mutate(rating);
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isFutureDate = isAfter(selectedDate, new Date());

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-solution-title">
            Application Arbitrage Platform
          </h1>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousDay}
            data-testid="button-previous-day"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center">
            <div className="text-2xl font-bold" data-testid="text-selected-date">
              {format(selectedDate, 'MMMM d, yyyy')}
            </div>
            {isToday && (
              <Badge className="mt-1 bg-green-500">Today</Badge>
            )}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextDay}
            disabled={isFutureDate}
            data-testid="button-next-day"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Featured Idea of the Day */}
        {isLoading ? (
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="animate-pulse">
                <div className="h-6 bg-muted rounded mb-4 w-3/4"></div>
                <div className="h-8 bg-muted rounded mb-4"></div>
                <div className="h-40 bg-muted rounded mb-6"></div>
                <div className="grid grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : featuredIdea ? (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Main Idea Card */}
            <div className="gradient-border">
              <div className="gradient-border-inner p-8">
                {/* Signal Badges */}
                {featuredIdea.signalBadges && featuredIdea.signalBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredIdea.signalBadges.slice(0, 3).map((badge: string, index: number) => (
                      <Badge 
                        key={index}
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300"
                      >
                        {badge}
                      </Badge>
                    ))}
                    {featuredIdea.signalBadges.length > 3 && (
                      <Badge variant="outline">
                        +{featuredIdea.signalBadges.length - 3} More
                      </Badge>
                    )}
                  </div>
                )}

                {/* Image */}
                {featuredIdea.imageUrl && (
                  <img 
                    src={featuredIdea.imageUrl} 
                    alt={featuredIdea.title}
                    className="rounded-xl w-full h-80 object-cover mb-6"
                    data-testid="img-featured-idea"
                  />
                )}

                {/* Title & Description */}
                <h2 className="text-3xl font-bold mb-3 text-white" data-testid="text-featured-title">
                  {featuredIdea.title}
                </h2>

                {featuredIdea.subtitle && (
                  <p className="text-lg text-white/80 mb-4">
                    {featuredIdea.subtitle}
                  </p>
                )}

                <p className="text-white/90 mb-6 leading-relaxed text-lg">
                  {featuredIdea.description}
                </p>

                {/* Storytelling Narrative */}
                {isGeneratingNarrative && !storytellingNarrative ? (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span>Generating storytelling narrative...</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-white/10 rounded animate-pulse w-full" />
                      <div className="h-4 bg-white/10 rounded animate-pulse w-11/12" />
                      <div className="h-4 bg-white/10 rounded animate-pulse w-10/12" />
                      <div className="h-4 bg-white/10 rounded animate-pulse w-full" />
                      <div className="h-4 bg-white/10 rounded animate-pulse w-9/12" />
                    </div>
                  </div>
                ) : storytellingNarrative ? (
                  <div className="mb-6">
                    <div className="space-y-4">
                      {storytellingNarrative.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-white/90 leading-relaxed text-lg">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={() => generateNarrative(true)}
                        disabled={isGeneratingNarrative}
                        className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                      >
                        <RefreshCw className={`h-3 w-3 ${isGeneratingNarrative ? 'animate-spin' : ''}`} />
                        Regenerate narrative
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Keyword Info */}
                {featuredIdea.keyword && (
                  <Card className="mb-6 bg-white/10 border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-white/70 mb-1">Keyword</div>
                          <div className="font-semibold text-white">{featuredIdea.keyword}</div>
                        </div>
                        {featuredIdea.keywordVolume && (
                          <div className="text-center px-4">
                            <div className="text-2xl font-bold text-white">{featuredIdea.keywordVolume}</div>
                            <div className="text-xs text-white/70">Volume</div>
                          </div>
                        )}
                        {featuredIdea.keywordGrowth && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">+{featuredIdea.keywordGrowth}%</div>
                            <div className="text-xs text-white/70">Growth</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Scores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <ScoreDisplay 
                    score={featuredIdea.opportunityScore} 
                    label="Opportunity" 
                    sublabel={featuredIdea.opportunityLabel} 
                  />
                  <ScoreDisplay 
                    score={featuredIdea.problemScore} 
                    label="Problem" 
                    sublabel={featuredIdea.problemLabel} 
                  />
                  <ScoreDisplay 
                    score={featuredIdea.feasibilityScore} 
                    label="Feasibility" 
                    sublabel={featuredIdea.feasibilityLabel} 
                  />
                  <ScoreDisplay 
                    score={featuredIdea.timingScore} 
                    label="Why Now" 
                    sublabel={featuredIdea.timingLabel} 
                  />
                </div>

                {/* Why Now Section */}
                {featuredIdea.whyNowAnalysis && (
                  <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-purple-200 dark:border-purple-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">Why Now?</h3>
                      </div>
                      <p className="text-purple-800 dark:text-purple-200 leading-relaxed">
                        {featuredIdea.whyNowAnalysis}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Proof Signals Section */}
                {featuredIdea.proofSignals && (
                  <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-bold text-green-900 dark:text-green-100">Proof & Signals</h3>
                      </div>
                      <p className="text-green-800 dark:text-green-200 leading-relaxed">
                        {featuredIdea.proofSignals}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Market Gap Section */}
                {featuredIdea.marketGap && (
                  <Card className="mb-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Market Gap</h3>
                      </div>
                      <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                        {featuredIdea.marketGap}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Trend Analysis Section */}
                {featuredIdea.trendAnalysis && (
                  <Card className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-orange-600" />
                        <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">Trend Analysis</h3>
                      </div>
                      <p className="text-orange-800 dark:text-orange-200 leading-relaxed">
                        {featuredIdea.trendAnalysis}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Business Fit Section */}
                <Card className="mb-8">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Business Fit</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          <span className="font-semibold">Revenue Potential</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {featuredIdea.revenuePotential || "Potential to reach significant ARR"}
                        </p>
                        <div className="mt-2 text-2xl font-bold text-green-600">
                          {featuredIdea.revenuePotential?.includes('$') ? '' : '$$$'}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench className="w-5 h-5 text-orange-600" />
                          <span className="font-semibold">Execution Difficulty</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {featuredIdea.executionDifficulty || "Moderate complexity"}
                        </p>
                        <div className="mt-2 text-2xl font-bold">
                          {featuredIdea.executionScore || featuredIdea.feasibilityScore}/10
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Rocket className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold">Go-To-Market</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {featuredIdea.gtmStrength || "Clear growth channels"}
                        </p>
                        <div className="mt-2 text-2xl font-bold">
                          {featuredIdea.gtmScore || 8}/10
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-6"
                      onClick={() => setLocation('/founder-fit')}
                      data-testid="button-founder-fit-card"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Right for You? Find Out
                    </Button>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  <Button 
                    size="lg"
                    className="w-full"
                    onClick={() => setLocation(`/idea/${featuredIdea.slug}`)}
                    data-testid="button-view-full-analysis"
                  >
                    View Full Analysis
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="w-full"
                    onClick={() => setLocation(`/ai-chat/${featuredIdea.slug}`)}
                    data-testid="button-ai-chat-iotd"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    AI Chat with this Solution
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm text-white/70 border-t border-white/20 pt-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{featuredIdea.viewCount || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    <span>{featuredIdea.saveCount || 0} saves</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{featuredIdea.voteCount || 0} votes</span>
                  </div>
                  {featuredIdea.sourceData && (featuredIdea.sourceData.startsWith('http://') || featuredIdea.sourceData.startsWith('https://') || /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/i.test(featuredIdea.sourceData.trim())) && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">App preview:</span>
                      <a 
                        href={featuredIdea.sourceData.startsWith('http') ? featuredIdea.sourceData : `https://${featuredIdea.sourceData}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {featuredIdea.sourceData.length > 40 ? `${featuredIdea.sourceData.substring(0, 40)}...` : featuredIdea.sourceData}
                      </a>
                    </div>
                  )}
                  {featuredIdea.averageRating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{featuredIdea.averageRating}/5 ({featuredIdea.ratingCount} ratings)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Categorization */}
            {(featuredIdea.type || featuredIdea.market || featuredIdea.targetAudience) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">Categorization</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {featuredIdea.type && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Type</div>
                        <Badge variant="secondary">{featuredIdea.type}</Badge>
                      </div>
                    )}
                    {featuredIdea.market && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Market</div>
                        <Badge variant="secondary">{featuredIdea.market}</Badge>
                      </div>
                    )}
                    {featuredIdea.targetAudience && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Target</div>
                        <Badge variant="secondary">{featuredIdea.targetAudience}</Badge>
                      </div>
                    )}
                    {featuredIdea.mainCompetitor && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Main Competitor</div>
                        <Badge variant="secondary">{featuredIdea.mainCompetitor}</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Solution Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Solution Actions</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setLocation(`/ai-chat/${featuredIdea.slug}`)}
                    data-testid="button-ai-chat-action"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Get Instant Answers
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    data-testid="button-download-data"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Data
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setLocation('/founder-fit')}
                    data-testid="button-founder-fit-action"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Founder Fit
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start"
                    data-testid="button-claim-idea"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Submit for Approval
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rating Section */}
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-4">Rate this Use Case</h3>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRating(rating)}
                      className={`transition-all ${
                        selectedRating && selectedRating >= rating
                          ? 'scale-110'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                      data-testid={`button-rating-${rating}`}
                    >
                      <Star
                        className={`w-10 h-10 ${
                          selectedRating && selectedRating >= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedRating === 5 && "Chef's kiss"}
                  {selectedRating === 4 && "Pretty interesting"}
                  {selectedRating === 3 && "It's okay"}
                  {selectedRating === 2 && "Not for me"}
                  {selectedRating === 1 && "Not interested"}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                No Idea Available
              </h3>
              <p className="text-muted-foreground">
                Check back later for today's featured idea.
              </p>
            </CardContent>
          </Card>
        )}

        {/* The Idea Database Section */}
        <div className="mt-16 border-t pt-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">The Application Database</h2>
            <p className="text-xl text-muted-foreground">Dive into deep research and analysis on 400+ business solutions</p>
          </div>
          
          <DatabasePreview />
          
          <div className="text-center mt-8">
            <Button 
              size="lg"
              onClick={() => setLocation('/database')}
              data-testid="button-browse-all"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              See Full Database
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Database Preview Component
function DatabasePreview() {
  const { data: ideas, isLoading } = useQuery<any>({
    queryKey: ["/api/ideas?limit=6&sortBy=newest"],
  });

  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-48 bg-muted rounded mb-4"></div>
              <div className="h-6 bg-muted rounded mb-2"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const ideaList = ideas?.ideas || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ideaList.map((idea: any) => (
        <Card 
          key={idea.id} 
          className="hover:shadow-lg transition-shadow cursor-pointer group"
          onClick={() => setLocation(`/idea/${idea.slug}`)}
          data-testid={`card-preview-${idea.id}`}
        >
          {idea.imageUrl && (
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
              <img 
                src={idea.imageUrl} 
                alt={idea.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {idea.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {idea.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {idea.opportunityScore && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  <span>{idea.opportunityScore}/10</span>
                </div>
              )}
              {idea.viewCount && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{idea.viewCount}</span>
                </div>
              )}
              {idea.market && (
                <Badge variant="secondary" className="text-xs">
                  {idea.market}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
