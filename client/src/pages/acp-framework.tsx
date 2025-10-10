import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Target, 
  Users, 
  ShoppingCart,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Share2,
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";

export default function ACPFramework() {
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
      <div className="min-h-screen bg-background" data-testid="acp-framework-page">
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

  // Extract ACP data from frameworkData or use placeholder
  const acpData = idea.frameworkData?.acp || {
    awareness: {
      score: 7,
      description: "The market shows strong awareness patterns with increasing search trends and social media discussions. Target customers are actively seeking solutions in this space.",
      channels: ["Social Media", "SEO", "Content Marketing", "Industry Forums"],
      strategies: [
        "Create educational content addressing pain points",
        "Build presence in relevant online communities",
        "Leverage SEO for high-intent keywords",
        "Partner with influencers in the space"
      ]
    },
    consideration: {
      score: 8,
      description: "Strong consideration phase with users actively researching and comparing options. Clear differentiation opportunities exist.",
      factors: [
        "Product features and capabilities",
        "Pricing and value proposition",
        "Customer reviews and social proof",
        "Ease of implementation",
        "Support and documentation quality"
      ],
      strategies: [
        "Develop detailed comparison content",
        "Offer free trials or demos",
        "Showcase customer success stories",
        "Provide transparent pricing"
      ]
    },
    purchase: {
      score: 6,
      description: "Purchase decision influenced by pricing model, onboarding experience, and perceived risk reduction.",
      barriers: [
        "Switching costs from existing solutions",
        "Budget approval processes",
        "Implementation concerns",
        "ROI uncertainty"
      ],
      strategies: [
        "Offer migration assistance",
        "Provide flexible pricing options",
        "Guarantee satisfaction with money-back policy",
        "Share ROI calculators and case studies"
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="acp-framework-page">
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
          <span className="text-foreground">A.C.P. Framework</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-3">Framework Analysis</Badge>
          <h1 className="text-4xl font-bold mb-3" data-testid="text-page-title">
            A.C.P. Framework Analysis
          </h1>
          <p className="text-xl text-muted-foreground">
            {idea.title}
          </p>
          <p className="text-muted-foreground mt-4">
            The Awareness-Consideration-Purchase (A.C.P.) framework maps the customer journey 
            from first contact to conversion. Understanding each phase helps optimize marketing 
            strategies and improve conversion rates.
          </p>
        </div>

        {/* Framework Scores Overview */}
        <Card className="mb-8" data-testid="card-scores-overview">
          <CardHeader>
            <CardTitle>Framework Scores</CardTitle>
            <CardDescription>
              Each phase is scored 1-10 based on market readiness and conversion potential
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{acpData.awareness.score}/10</div>
                <div className="text-sm text-muted-foreground">Awareness</div>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{acpData.consideration.score}/10</div>
                <div className="text-sm text-muted-foreground">Consideration</div>
              </div>
              <div className="text-center">
                <ShoppingCart className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold mb-1">{acpData.purchase.score}/10</div>
                <div className="text-sm text-muted-foreground">Purchase</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Awareness Phase */}
        <Card className="mb-6" data-testid="card-awareness">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-primary" />
              <CardTitle>Phase 1: Awareness</CardTitle>
            </div>
            <CardDescription>
              Building visibility and reaching potential customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Market Analysis</h4>
              <p className="text-muted-foreground">{acpData.awareness.description}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Key Channels</h4>
              <div className="flex flex-wrap gap-2">
                {acpData.awareness.channels.map((channel: string, i: number) => (
                  <Badge key={i} variant="outline">{channel}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Recommended Strategies</h4>
              <ul className="space-y-2">
                {acpData.awareness.strategies.map((strategy: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Consideration Phase */}
        <Card className="mb-6" data-testid="card-consideration">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-primary" />
              <CardTitle>Phase 2: Consideration</CardTitle>
            </div>
            <CardDescription>
              Engaging prospects and building trust
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Phase Analysis</h4>
              <p className="text-muted-foreground">{acpData.consideration.description}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Key Decision Factors</h4>
              <ul className="space-y-2">
                {acpData.consideration.factors.map((factor: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Recommended Strategies</h4>
              <ul className="space-y-2">
                {acpData.consideration.strategies.map((strategy: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Phase */}
        <Card className="mb-8" data-testid="card-purchase">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-6 h-6 text-primary" />
              <CardTitle>Phase 3: Purchase</CardTitle>
            </div>
            <CardDescription>
              Converting prospects into customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Conversion Analysis</h4>
              <p className="text-muted-foreground">{acpData.purchase.description}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Purchase Barriers</h4>
              <ul className="space-y-2">
                {acpData.purchase.barriers.map((barrier: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <Share2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{barrier}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Conversion Strategies</h4>
              <ul className="space-y-2">
                {acpData.purchase.strategies.map((strategy: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{strategy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/idea/${slug}`)}
            data-testid="button-back"
          >
            Back to Overview
          </Button>
          <Button 
            onClick={() => navigate(`/idea/${slug}/value-matrix`)}
            data-testid="button-next"
          >
            Value Matrix
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
