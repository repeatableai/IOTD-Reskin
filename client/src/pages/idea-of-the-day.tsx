import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, Lightbulb, Users, ArrowRight, Sparkles } from "lucide-react";
import type { Idea } from "@shared/schema";

export default function IdeaOfTheDay() {
  const { data: idea, isLoading } = useQuery<Idea>({
    queryKey: ["/api/ideas/featured"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-12 w-64 bg-muted rounded mb-4"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">No Solution of the Day Available</h1>
            <p className="text-muted-foreground mb-6">Check back later for today's featured solution.</p>
            <Link href="/database">
              <Button>Browse All Solutions</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="idea-of-the-day-page">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0" data-testid="badge-idea-of-day">
            <Sparkles className="w-4 h-4 mr-1" />
            Solution of the Day
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-idea-title">
            {idea.title}
          </h1>
          {idea.subtitle && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-idea-subtitle">
              {idea.subtitle}
            </p>
          )}
        </div>

        {/* Badges */}
        {idea.signalBadges && idea.signalBadges.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {idea.signalBadges.map((badge, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1" data-testid={`badge-signal-${index}`}>
                {badge}
              </Badge>
            ))}
          </div>
        )}

        {/* Main Image */}
        {idea.imageUrl && (
          <div className="mb-12 rounded-xl overflow-hidden shadow-2xl">
            <img
              src={idea.imageUrl}
              alt={idea.title}
              className="w-full h-[400px] object-cover"
              data-testid="img-idea"
            />
          </div>
        )}

        {/* Description */}
        <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto mb-12">
          <p className="text-lg leading-relaxed whitespace-pre-wrap" data-testid="text-description">
            {idea.description}
          </p>
        </div>

        {/* Keyword Stats */}
        {idea.keyword && (
          <div className="bg-card border border-border rounded-xl p-6 mb-12 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Keyword</p>
                <p className="text-xl font-semibold" data-testid="text-keyword">{idea.keyword}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Volume</p>
                <p className="text-xl font-semibold" data-testid="text-keyword-volume">
                  {idea.keywordVolume?.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Growth</p>
                <p className="text-xl font-semibold text-green-600" data-testid="text-keyword-growth">
                  {idea.keywordGrowth}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground mb-2">Opportunity</h3>
            <div className="text-3xl font-bold mb-1" data-testid="score-opportunity">{idea.opportunityScore}</div>
            <p className="text-xs text-muted-foreground" data-testid="label-opportunity">{idea.opportunityLabel}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground mb-2">Problem</h3>
            <div className="text-3xl font-bold mb-1" data-testid="score-problem">{idea.problemScore}</div>
            <p className="text-xs text-muted-foreground" data-testid="label-problem">{idea.problemLabel}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground mb-2">Feasibility</h3>
            <div className="text-3xl font-bold mb-1" data-testid="score-feasibility">{idea.feasibilityScore}</div>
            <p className="text-xs text-muted-foreground" data-testid="label-feasibility">{idea.feasibilityLabel}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm text-muted-foreground mb-2">Why Now</h3>
            <div className="text-3xl font-bold mb-1" data-testid="score-timing">{idea.timingScore}</div>
            <p className="text-xs text-muted-foreground" data-testid="label-timing">{idea.timingLabel}</p>
          </div>
        </div>

        {/* Business Fit */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Business Fit</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">💰</div>
              <h3 className="font-semibold mb-2">Revenue Potential</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-revenue-potential">
                {idea.revenuePotential}
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">🛠️</div>
              <h3 className="font-semibold mb-2">Execution Difficulty</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-execution-difficulty">
                {idea.executionDifficulty}
              </p>
              <div className="mt-2">
                <span className="text-sm font-semibold">{idea.executionScore}/10</span>
              </div>
            </div>
            <div>
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-semibold mb-2">Go-To-Market</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-gtm-strength">
                {idea.gtmStrength}
              </p>
              <div className="mt-2">
                <span className="text-sm font-semibold">{idea.gtmScore}/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href={`/idea/${idea.slug}`}>
            <Button size="lg" className="group" data-testid="button-view-full">
              View Full Report
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
