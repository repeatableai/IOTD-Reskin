import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, TrendingUp, Zap, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";

export default function ValueMatrix() {
  const { slug } = useParams();
  const [, navigate] = useLocation();

  if (!slug) {
    return <NotFound />;
  }

  const { data: idea, isLoading } = useQuery<any>({
    queryKey: ['/api/ideas', slug],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="value-matrix-page">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!idea) {
    return <NotFound />;
  }

  // Extract Value Matrix data from frameworkData or use placeholder
  const matrixData = idea.frameworkData?.valueMatrix || {
    overallScore: 8.5,
    quadrants: [
      {
        name: "Dream Come True",
        score: 9,
        description: "High value, low cost - the ideal positioning for rapid adoption",
        items: [
          "Automated workflow features",
          "Template library",
          "One-click integrations",
          "Instant setup"
        ]
      },
      {
        name: "Status Quo",
        score: 5,
        description: "Low value, low cost - basic features that meet minimum expectations",
        items: [
          "Basic dashboard",
          "Standard reporting",
          "Email notifications",
          "File storage"
        ]
      },
      {
        name: "Major Hassle",
        score: 3,
        description: "Low value, high cost - features that add friction without benefits",
        items: [
          "Complex onboarding",
          "Manual data entry",
          "Limited customization"
        ]
      },
      {
        name: "Expensive But Worth It",
        score: 7,
        description: "High value, high cost - premium features that justify their price",
        items: [
          "Advanced analytics",
          "White label branding",
          "Priority support",
          "Custom integrations"
        ]
      }
    ],
    recommendations: [
      "Focus on expanding 'Dream Come True' features - these drive adoption",
      "Automate or eliminate 'Major Hassle' items immediately",
      "Consider tiered pricing to monetize 'Expensive But Worth It' features",
      "Maintain 'Status Quo' features as table stakes"
    ]
  };

  return (
    <div className="min-h-screen bg-background" data-testid="value-matrix-page">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => navigate('/database')} className="hover:text-foreground">
            Database
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/idea/${slug}`)} className="hover:text-foreground">
            {idea.title}
          </button>
          <span>/</span>
          <span className="text-foreground">Value Matrix</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-3">Framework Analysis</Badge>
          <h1 className="text-4xl font-bold mb-3" data-testid="text-page-title">
            Value Matrix Analysis
          </h1>
          <p className="text-xl text-muted-foreground">
            {idea.title}
          </p>
          <p className="text-muted-foreground mt-4">
            The Value Matrix helps prioritize features based on customer perceived value and cost to deliver. 
            This framework guides product development and pricing strategy decisions.
          </p>
        </div>

        {/* Overall Score */}
        <Card className="mb-8" data-testid="card-overall-score">
          <CardHeader>
            <CardTitle>Value Matrix Score</CardTitle>
            <CardDescription>
              Overall product positioning based on value-cost balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">{matrixData.overallScore}/10</div>
              <p className="text-muted-foreground">Excellent value positioning with strong competitive advantages</p>
            </div>
          </CardContent>
        </Card>

        {/* Value Matrix Quadrants */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Dream Come True */}
          <Card className="border-green-500" data-testid="card-dream-come-true">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-500" />
                  <CardTitle>{matrixData.quadrants[0].name}</CardTitle>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500">
                  {matrixData.quadrants[0].score}/10
                </Badge>
              </div>
              <CardDescription className="text-xs">
                High Value · Low Cost
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {matrixData.quadrants[0].description}
              </p>
              <div>
                <h4 className="font-semibold text-sm mb-2">Features:</h4>
                <ul className="space-y-1">
                  {matrixData.quadrants[0].items.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Expensive But Worth It */}
          <Card className="border-blue-500" data-testid="card-expensive-worth-it">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <CardTitle>{matrixData.quadrants[3].name}</CardTitle>
                </div>
                <Badge variant="outline" className="text-blue-500 border-blue-500">
                  {matrixData.quadrants[3].score}/10
                </Badge>
              </div>
              <CardDescription className="text-xs">
                High Value · High Cost
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {matrixData.quadrants[3].description}
              </p>
              <div>
                <h4 className="font-semibold text-sm mb-2">Features:</h4>
                <ul className="space-y-1">
                  {matrixData.quadrants[3].items.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Status Quo */}
          <Card className="border-yellow-500" data-testid="card-status-quo">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-500" />
                  <CardTitle>{matrixData.quadrants[1].name}</CardTitle>
                </div>
                <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                  {matrixData.quadrants[1].score}/10
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Low Value · Low Cost
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {matrixData.quadrants[1].description}
              </p>
              <div>
                <h4 className="font-semibold text-sm mb-2">Features:</h4>
                <ul className="space-y-1">
                  {matrixData.quadrants[1].items.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Major Hassle */}
          <Card className="border-red-500" data-testid="card-major-hassle">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-500" />
                  <CardTitle>{matrixData.quadrants[2].name}</CardTitle>
                </div>
                <Badge variant="outline" className="text-red-500 border-red-500">
                  {matrixData.quadrants[2].score}/10
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Low Value · High Cost
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {matrixData.quadrants[2].description}
              </p>
              <div>
                <h4 className="font-semibold text-sm mb-2">Features:</h4>
                <ul className="space-y-1">
                  {matrixData.quadrants[2].items.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="mb-8" data-testid="card-recommendations">
          <CardHeader>
            <CardTitle>Strategic Recommendations</CardTitle>
            <CardDescription>
              Actions to optimize value delivery and competitive positioning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {matrixData.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/idea/${slug}/acp-framework`)}
            data-testid="button-back"
          >
            A.C.P. Framework
          </Button>
          <Button 
            onClick={() => navigate(`/idea/${slug}/value-ladder`)}
            data-testid="button-next"
          >
            Value Ladder
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
