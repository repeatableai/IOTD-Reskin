import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Calendar, Zap, AlertCircle } from "lucide-react";
import type { Idea } from "@shared/schema";

export default function WhyNow() {
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

  const whyNowData = idea.whyNowAnalysis || {};

  return (
    <div className="min-h-screen bg-background" data-testid="why-now-page">
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
          <Badge className="mb-4">Market Timing Analysis</Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-title">
            Why Now?
          </h1>
          <p className="text-xl text-muted-foreground">
            Understanding why this opportunity exists right now and why timing matters
          </p>
        </div>

        {/* Why Now Score */}
        {idea.whyNowScore && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Timing Score</CardTitle>
                    <p className="text-sm text-muted-foreground">Perfect timing opportunity</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary" data-testid="text-why-now-score">
                  {idea.whyNowScore}/10
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Market Trends */}
        {whyNowData.marketTrends && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <CardTitle>Market Trends Driving This Opportunity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{whyNowData.marketTrends}</p>
              
              {/* Growth Projections */}
              {whyNowData.growthProjections && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Growth Projections</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {whyNowData.growthProjections.map((projection: any, idx: number) => (
                      <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="font-medium">{projection.timeframe}</span>
                        </div>
                        <p className="text-2xl font-bold text-primary">{projection.value}</p>
                        <p className="text-sm text-muted-foreground">{projection.metric}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Technology Enablers */}
        {whyNowData.technologyDrivers && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <CardTitle>Technology Enablers</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground mb-4">{whyNowData.technologyDrivers}</p>
              
              {whyNowData.technologyList && (
                <div className="grid gap-3">
                  {whyNowData.technologyList.map((tech: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{tech.name}</h4>
                        <p className="text-sm text-muted-foreground">{tech.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Regulatory/Market Changes */}
        {whyNowData.regulatoryChanges && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                <CardTitle>Regulatory & Market Changes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{whyNowData.regulatoryChanges}</p>
            </CardContent>
          </Card>
        )}

        {/* Consumer Behavior Shifts */}
        {whyNowData.behaviorShifts && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Consumer Behavior Shifts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {whyNowData.behaviorShifts.map((shift: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">{shift}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Window of Opportunity */}
        {whyNowData.opportunityWindow && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle>Window of Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{whyNowData.opportunityWindow}</p>
              
              {whyNowData.urgencyFactors && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Why You Should Act Now:</h4>
                  <ul className="space-y-2">
                    {whyNowData.urgencyFactors.map((factor: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="mt-8 flex gap-4">
          <Link href={`/idea/${slug}`}>
            <Button variant="outline" data-testid="button-back-to-idea">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Overview
            </Button>
          </Link>
          <Link href={`/idea/${slug}/proof-signals`}>
            <Button data-testid="button-next-section">
              View Proof & Signals
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
