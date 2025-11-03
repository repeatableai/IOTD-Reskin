import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Minus, TrendingUp, Clock, Zap, Award } from "lucide-react";
import type { Idea } from "@shared/schema";

export default function ValueEquation() {
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
          <p>Solution not found</p>
        </div>
      </div>
    );
  }

  const valueEquation = (idea.frameworkData as any)?.valueEquation || {};

  return (
    <div className="min-h-screen bg-background" data-testid="value-equation-page">
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
          <Badge className="mb-4">Framework Analysis</Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-title">
            Value Equation Analysis
          </h1>
          <p className="text-xl text-muted-foreground">
            Alex Hormozi's framework for maximizing perceived value
          </p>
        </div>

        {/* Formula Card */}
        <Card className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-2">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">The Value Equation</h2>
              <div className="flex items-center justify-center gap-4 text-lg flex-wrap">
                <span className="font-semibold">Value =</span>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 pb-2 border-b-2 border-foreground">
                    <span>(Dream Outcome</span>
                    <Plus className="w-4 h-4" />
                    <span>Perceived Likelihood)</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <span>(Time Delay</span>
                    <Plus className="w-4 h-4" />
                    <span>Effort & Sacrifice)</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Maximize numerator (outcome + certainty) • Minimize denominator (time + effort)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Overall Score */}
        <div className="mb-8 text-center">
          <div className="inline-block p-6 bg-card border border-border rounded-xl">
            <p className="text-sm text-muted-foreground mb-2">Overall Value Score</p>
            <div className="text-5xl font-bold text-purple-600" data-testid="score-overall">
              {valueEquation.valueScore || 'N/A'}/10
            </div>
          </div>
        </div>

        {/* Components */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Dream Outcome */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Dream Outcome
                <Badge variant="secondary" className="ml-auto">
                  {valueEquation.dreamOutcomeScore || 0}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground" data-testid="text-dream-outcome">
                {valueEquation.dreamOutcome || 'The ultimate result customers desire when using this product.'}
              </p>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  <Plus className="w-4 h-4 inline mr-1" />
                  Increases Value
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Perceived Likelihood */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Perceived Likelihood
                <Badge variant="secondary" className="ml-auto">
                  {valueEquation.perceivedLikelihoodScore || 0}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground" data-testid="text-perceived-likelihood">
                {valueEquation.perceivedLikelihood || 'Customer confidence that the solution will deliver the promised outcome.'}
              </p>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                  <Plus className="w-4 h-4 inline mr-1" />
                  Increases Value
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Time Delay */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                Time Delay
                <Badge variant="secondary" className="ml-auto">
                  {valueEquation.timeDelayScore || 0}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground" data-testid="text-time-delay">
                {valueEquation.timeDelay || 'How long it takes for customers to achieve the desired outcome.'}
              </p>
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded">
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                  <Minus className="w-4 h-4 inline mr-1" />
                  Decreases Value (minimize this)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Effort & Sacrifice */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-600" />
                Effort & Sacrifice
                <Badge variant="secondary" className="ml-auto">
                  {valueEquation.effortScore || 0}/10
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground" data-testid="text-effort">
                {valueEquation.effortAndSacrifice || 'The work, cost, or inconvenience customers must endure.'}
              </p>
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded">
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  <Minus className="w-4 h-4 inline mr-1" />
                  Decreases Value (minimize this)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actionable Insights */}
        <Card>
          <CardHeader>
            <CardTitle>How to Maximize Value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">✓ Amplify the Numerator</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Paint a vivid picture of the dream outcome with specific results</li>
                <li>Build credibility through case studies, testimonials, and guarantees</li>
                <li>Reduce risk with money-back guarantees and free trials</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-red-600 mb-2">✓ Minimize the Denominator</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Deliver quick wins and show early progress</li>
                <li>Make it effortless with automation and done-for-you services</li>
                <li>Reduce complexity and remove friction from the process</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
