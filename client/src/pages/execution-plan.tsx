import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Rocket } from "lucide-react";
import type { Idea } from "@shared/schema";

export default function ExecutionPlan() {
  const { slug } = useParams();

  if (!slug) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p>Solution not found</p>
        </div>
      </div>
    );
  }

  const { data: idea, isLoading } = useQuery<Idea>({
    queryKey: ["/api/ideas", slug],
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
            Step-by-step roadmap to bring this solution to life
          </p>
        </div>

        {/* Main Analysis Content */}
        {idea.executionPlan ? (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                <CardTitle>Implementation Roadmap</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {idea.executionPlan}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No execution plan available for this solution yet.
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
