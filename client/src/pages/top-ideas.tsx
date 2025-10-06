import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Eye,
  Bookmark,
  ThumbsUp,
  Star
} from "lucide-react";
import { format, subDays, addDays, isAfter } from "date-fns";

export default function TopIdeas() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [showReminder, setShowReminder] = useState(false);
  const { toast } = useToast();

  const { data: featuredIdea, isLoading } = useQuery<any>({
    queryKey: ["/api/ideas/featured"],
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
            <h1 className="text-4xl md:text-5xl font-bold">
              Idea of the Day
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fully researched business opportunity delivered daily
          </p>
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
          <div className="max-w-4xl mx-auto">
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

                {/* Scores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-6 text-sm text-muted-foreground">
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

                {/* CTA */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    size="lg"
                    onClick={() => setLocation(`/idea/${featuredIdea.slug}`)}
                    data-testid="button-view-full-analysis"
                  >
                    View Full Analysis
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setLocation('/founder-fit')}
                    data-testid="button-founder-fit"
                  >
                    Check Founder Fit
                  </Button>
                </div>
              </div>
            </div>
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

        {/* Browse All Ideas CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Want to explore more ideas?
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => setLocation('/database')}
            data-testid="button-browse-all"
          >
            Browse All Ideas
          </Button>
        </div>
      </div>
    </div>
  );
}
