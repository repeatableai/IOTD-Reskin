import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import type { Idea } from "@shared/schema";

export default function MarketGap() {
  const { slug } = useParams();

  const { data: idea, isLoading } = useQuery<Idea>({
    queryKey: ["/api/ideas", slug],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch idea');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p>Idea not found</p>
        </div>
      </div>
    );
  }

  const marketGapData = idea.marketGap || {};

  return (
    <div className="min-h-screen bg-background" data-testid="market-gap-page">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link href={`/idea/${slug}`}>
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {idea.title}
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-4">Market Analysis</Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-title">
            The Market Gap
          </h1>
          <p className="text-xl text-muted-foreground">
            Identifying the underserved opportunity in this market
          </p>
        </div>

        {/* Opportunity Score */}
        {idea.opportunityScore && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Opportunity Score</CardTitle>
                    <p className="text-sm text-muted-foreground">Market opportunity strength</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary" data-testid="text-opportunity-score">
                  {idea.opportunityScore}/10
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Gap Overview */}
        {marketGapData.overview && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Market Gap Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">{marketGapData.overview}</p>
            </CardContent>
          </Card>
        )}

        {/* Underserved Segments */}
        {marketGapData.underservedSegments && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <CardTitle>Underserved Market Segments</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketGapData.underservedSegments.map((segment: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{segment.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{segment.description}</p>
                      {segment.size && (
                        <Badge variant="outline" className="mb-2">
                          Market Size: {segment.size}
                        </Badge>
                      )}
                      {segment.whyUnderserved && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Why underserved:</strong> {segment.whyUnderserved}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Competitive Landscape Gaps */}
        {marketGapData.competitiveGaps && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Competitive Landscape Gaps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground mb-4">{marketGapData.competitiveGaps.summary}</p>
              
              {marketGapData.competitiveGaps.gaps && (
                <div className="grid gap-3">
                  {marketGapData.competitiveGaps.gaps.map((gap: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-2 mb-1">
                        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">{gap.area}</h4>
                          <p className="text-sm text-muted-foreground">{gap.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Market Size & Opportunity */}
        {marketGapData.marketSize && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <CardTitle>Market Size & Opportunity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {marketGapData.marketSize.current && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Current Market</p>
                    <p className="text-2xl font-bold text-primary">{marketGapData.marketSize.current}</p>
                  </div>
                )}
                {marketGapData.marketSize.projected && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Projected Market</p>
                    <p className="text-2xl font-bold text-primary">{marketGapData.marketSize.projected}</p>
                  </div>
                )}
                {marketGapData.marketSize.cagr && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Growth Rate (CAGR)</p>
                    <p className="text-2xl font-bold text-primary">{marketGapData.marketSize.cagr}</p>
                  </div>
                )}
              </div>
              
              {marketGapData.marketSize.addressable && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Addressable Opportunity</p>
                  <p className="text-xl font-bold text-primary mb-2">{marketGapData.marketSize.addressable}</p>
                  <p className="text-sm text-muted-foreground">{marketGapData.marketSize.rationale}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Growth Drivers */}
        {marketGapData.growthDrivers && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Growth Drivers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {marketGapData.growthDrivers.map((driver: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{driver}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Entry Strategy */}
        {marketGapData.entryStrategy && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle>Recommended Entry Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground mb-3">{marketGapData.entryStrategy.overview}</p>
              
              {marketGapData.entryStrategy.steps && (
                <div className="space-y-2">
                  {marketGapData.entryStrategy.steps.map((step: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Link href={`/idea/${slug}/proof-signals`}>
            <Button variant="outline" data-testid="button-previous-section">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Proof & Signals
            </Button>
          </Link>
          <Link href={`/idea/${slug}/execution-plan`}>
            <Button data-testid="button-next-section">
              Execution Plan
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
