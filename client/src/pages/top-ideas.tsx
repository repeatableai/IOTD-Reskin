import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
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
  Lock
} from "lucide-react";
import { format, subDays, addDays, isAfter } from "date-fns";

export default function TopIdeas() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [showReminder, setShowReminder] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
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

  const handleSetReminder = () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Reminder Set!",
      description: "You'll receive tomorrow's Idea of the Day via email.",
    });
    setShowReminder(false);
    setEmail("");
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
          <div className="flex items-center justify-center mb-4">
            <Calendar className="w-10 h-10 mr-3 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Solution of the Day</h1>
          </div>
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

        {/* Reminder Section */}
        {isToday && !showReminder && (
          <div className="text-center mb-8">
            <Button
              variant="outline"
              onClick={() => setShowReminder(true)}
              data-testid="button-show-reminder"
            >
              <Bell className="w-4 h-4 mr-2" />
              Get Tomorrow's Idea via Email
            </Button>
          </div>
        )}

        {showReminder && (
          <Card className="mb-8 max-w-md mx-auto">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Set Email Reminder</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get tomorrow's Idea of the Day delivered to your inbox
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-reminder-email"
                />
                <Button onClick={handleSetReminder} data-testid="button-set-reminder">
                  <Bell className="w-4 h-4 mr-2" />
                  Set
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                <h2 className="text-3xl font-bold mb-3" data-testid="text-featured-title">
                  {featuredIdea.title}
                </h2>
                
                {featuredIdea.subtitle && (
                  <p className="text-lg text-muted-foreground mb-4">
                    {featuredIdea.subtitle}
                  </p>
                )}
                
                <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
                  {featuredIdea.description}
                </p>

                {/* Keyword Info */}
                {featuredIdea.keyword && (
                  <Card className="mb-6 bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Keyword</div>
                          <div className="font-semibold">{featuredIdea.keyword}</div>
                        </div>
                        {featuredIdea.keywordVolume && (
                          <div className="text-center px-4">
                            <div className="text-2xl font-bold">{featuredIdea.keywordVolume}</div>
                            <div className="text-xs text-muted-foreground">Volume</div>
                          </div>
                        )}
                        {featuredIdea.keywordGrowth && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">+{featuredIdea.keywordGrowth}%</div>
                            <div className="text-xs text-muted-foreground">Growth</div>
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
                    AI Chat with this Idea
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground border-t pt-4">
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
                  {featuredIdea.averageRating && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{featuredIdea.averageRating}/5 ({featuredIdea.ratingCount} ratings)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Start Building Section */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-2">Start Building in 1-click</h3>
                <p className="text-muted-foreground mb-6">
                  Turn this idea into your business with AI-powered development tools
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start"
                    onClick={() => window.open(`https://bolt.new`, '_blank')}
                  >
                    <Code className="w-5 h-5 mb-2" />
                    <div className="text-left">
                      <div className="font-semibold">Bolt.new</div>
                      <div className="text-xs text-muted-foreground">AI Full-Stack Dev</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start"
                    onClick={() => window.open('https://v0.dev', '_blank')}
                  >
                    <Code className="w-5 h-5 mb-2" />
                    <div className="text-left">
                      <div className="font-semibold">v0 by Vercel</div>
                      <div className="text-xs text-muted-foreground">UI Generation</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start"
                    onClick={() => window.open(`https://replit.com/new?description=${encodeURIComponent(featuredIdea?.description || '')}`, '_blank')}
                  >
                    <Code className="w-5 h-5 mb-2" />
                    <div className="text-left">
                      <div className="font-semibold">Replit Agent</div>
                      <div className="text-xs text-muted-foreground">Build with AI</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-start"
                    onClick={() => window.open('https://cursor.sh', '_blank')}
                  >
                    <Code className="w-5 h-5 mb-2" />
                    <div className="text-left">
                      <div className="font-semibold">Cursor IDE</div>
                      <div className="text-xs text-muted-foreground">AI Code Editor</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

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

            {/* Idea Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Idea Actions</h3>
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
                    Claim Idea
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
