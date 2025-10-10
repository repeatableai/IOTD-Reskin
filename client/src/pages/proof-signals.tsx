import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, TrendingUp, Users, MessageSquare, Star } from "lucide-react";
import type { Idea } from "@shared/schema";

export default function ProofSignals() {
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

  const proofData = idea.proofSignals || {};

  return (
    <div className="min-h-screen bg-background" data-testid="proof-signals-page">
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
          <Badge className="mb-4">Market Validation</Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-title">
            Proof & Signals
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-world evidence that validates this opportunity
          </p>
        </div>

        {/* Problem Score */}
        {idea.problemScore && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Problem Validation Score</CardTitle>
                    <p className="text-sm text-muted-foreground">High pain point intensity</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary" data-testid="text-problem-score">
                  {idea.problemScore}/10
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Customer Pain Points */}
        {proofData.painPoints && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <CardTitle>Validated Customer Pain Points</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {proofData.painPoints.map((pain: any, idx: number) => (
                <div key={idx} className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-destructive font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{pain.problem}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{pain.description}</p>
                      {pain.evidence && (
                        <div className="text-xs text-primary">
                          Evidence: {pain.evidence}
                        </div>
                      )}
                    </div>
                  </div>
                  {pain.frequency && (
                    <Badge variant="outline" className="mt-2">
                      Frequency: {pain.frequency}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Market Demand Signals */}
        {proofData.demandSignals && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Market Demand Signals</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {proofData.demandSignals.map((signal: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{signal.source}</h4>
                    <p className="text-sm text-muted-foreground">{signal.signal}</p>
                    {signal.metric && (
                      <p className="text-sm text-primary font-medium mt-1">{signal.metric}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Existing Solutions Gap */}
        {proofData.existingSolutionsGap && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Why Current Solutions Fall Short</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground mb-4">{proofData.existingSolutionsGap}</p>
              
              {proofData.competitorGaps && (
                <div className="space-y-3">
                  {proofData.competitorGaps.map((gap: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <h4 className="font-semibold mb-1">{gap.competitor}</h4>
                      <p className="text-sm text-muted-foreground">{gap.gap}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Community Evidence */}
        {proofData.communityEvidence && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Community Evidence</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {proofData.communityEvidence.map((evidence: any, idx: number) => (
                <div key={idx} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{evidence.platform}</Badge>
                    {evidence.memberCount && (
                      <span className="text-sm text-muted-foreground">
                        {evidence.memberCount} members
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{evidence.finding}</p>
                </div>
              ))}
              
              <Link href={`/idea/${slug}/community-signals`}>
                <Button variant="outline" className="w-full mt-4">
                  View Detailed Community Analysis
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Success Stories */}
        {proofData.successStories && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <CardTitle>Related Success Stories</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {proofData.successStories.map((story: any, idx: number) => (
                <div key={idx} className="p-4 bg-background rounded-lg border">
                  <h4 className="font-semibold mb-1">{story.company}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{story.achievement}</p>
                  {story.revenue && (
                    <p className="text-sm font-medium text-primary">{story.revenue}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Link href={`/idea/${slug}/why-now`}>
            <Button variant="outline" data-testid="button-previous-section">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Why Now
            </Button>
          </Link>
          <Link href={`/idea/${slug}/market-gap`}>
            <Button data-testid="button-next-section">
              Market Gap Analysis
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
