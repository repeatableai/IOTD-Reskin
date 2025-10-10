import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Rocket, Calendar, DollarSign, Users, CheckCircle2 } from "lucide-react";
import type { Idea } from "@shared/schema";

export default function ExecutionPlan() {
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

  const executionData = idea.executionPlan || {};

  return (
    <div className="min-h-screen bg-background" data-testid="execution-plan-page">
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
          <Badge className="mb-4">Implementation Guide</Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-title">
            Execution Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            Step-by-step roadmap to bring this idea to life
          </p>
        </div>

        {/* Execution Difficulty Score */}
        {idea.executionDifficulty && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Execution Difficulty</CardTitle>
                    <p className="text-sm text-muted-foreground">Complexity level</p>
                  </div>
                </div>
                <div className="text-4xl font-bold text-primary" data-testid="text-execution-difficulty">
                  {idea.executionDifficulty}/10
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Overview */}
        {executionData.overview && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Execution Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground">{executionData.overview}</p>
            </CardContent>
          </Card>
        )}

        {/* MVP Definition */}
        {executionData.mvp && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                <CardTitle>Minimum Viable Product (MVP)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">{executionData.mvp.description}</p>
              
              {executionData.mvp.coreFeatures && (
                <div>
                  <h4 className="font-semibold mb-3">Core Features</h4>
                  <div className="space-y-2">
                    {executionData.mvp.coreFeatures.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {executionData.mvp.timeline && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium">Estimated Timeline</span>
                  </div>
                  <p className="text-muted-foreground">{executionData.mvp.timeline}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Roadmap Phases */}
        {executionData.phases && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle>6-Month Roadmap</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {executionData.phases.map((phase: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{phase.name}</h4>
                      <Badge variant="outline" className="mb-2">{phase.duration}</Badge>
                      <p className="text-sm text-muted-foreground">{phase.description}</p>
                    </div>
                  </div>
                  
                  {phase.milestones && (
                    <div className="ml-11 space-y-2 mt-3">
                      <h5 className="text-sm font-medium">Key Milestones:</h5>
                      {phase.milestones.map((milestone: string, mIdx: number) => (
                        <div key={mIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span>{milestone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Resource Requirements */}
        {executionData.resources && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle>Resource Requirements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Team */}
              {executionData.resources.team && (
                <div>
                  <h4 className="font-semibold mb-3">Team Structure</h4>
                  <div className="grid gap-3">
                    {executionData.resources.team.map((member: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Users className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h5 className="font-medium">{member.role}</h5>
                          <p className="text-sm text-muted-foreground">{member.description}</p>
                          {member.timing && (
                            <Badge variant="outline" className="mt-1">{member.timing}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget */}
              {executionData.resources.budget && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Initial Budget Breakdown
                  </h4>
                  <div className="grid gap-2">
                    {executionData.resources.budget.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm">{item.category}</span>
                        <span className="font-medium">{item.amount}</span>
                      </div>
                    ))}
                  </div>
                  {executionData.resources.totalBudget && (
                    <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Initial Investment</span>
                        <span className="text-xl font-bold text-primary">{executionData.resources.totalBudget}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Key Success Metrics */}
        {executionData.successMetrics && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Key Success Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {executionData.successMetrics.map((metric: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <h5 className="font-medium">{metric.name}</h5>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                    {metric.target && (
                      <p className="text-sm text-primary font-medium mt-1">Target: {metric.target}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {executionData.nextSteps && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle>Your Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {executionData.nextSteps.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-muted-foreground">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Link href={`/idea/${slug}/market-gap`}>
            <Button variant="outline" data-testid="button-previous-section">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Market Gap
            </Button>
          </Link>
          <Link href={`/idea/${slug}/build/replit`}>
            <Button data-testid="button-build">
              Start Building
              <Rocket className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
