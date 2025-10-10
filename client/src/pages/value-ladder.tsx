import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, DollarSign, Crown, Repeat, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";

export default function ValueLadder() {
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
      <div className="min-h-screen bg-background" data-testid="value-ladder-page">
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

  // Extract Value Ladder from offerTiers or frameworkData
  const ladder = idea.offerTiers || idea.frameworkData?.valueLadder || {
    tiers: [
      {
        name: "Lead Magnet",
        price: "Free",
        description: "High-value free offer to attract and qualify leads",
        items: [
          "Free templates or tools",
          "Educational content guide",
          "Industry report or checklist",
          "Free trial or demo"
        ],
        strategy: "Build email list and establish expertise"
      },
      {
        name: "Frontend Offer",
        price: "$29-$99",
        description: "Low-friction entry point to convert leads into paying customers",
        items: [
          "Starter plan or basic tier",
          "Single module or course",
          "Entry-level service package",
          "Essential features only"
        ],
        strategy: "Prove value and build trust with minimal risk"
      },
      {
        name: "Core Offer",
        price: "$299-$999",
        description: "Main product delivering comprehensive solution and maximum value",
        items: [
          "Full platform access",
          "Complete feature set",
          "Professional tier",
          "Priority support included"
        ],
        strategy: "Primary revenue driver and customer success vehicle"
      },
      {
        name: "Backend Offer",
        price: "$2,999-$9,999",
        description: "Premium offering for advanced needs and high-value customers",
        items: [
          "Enterprise features",
          "Custom integrations",
          "Dedicated account manager",
          "White-label options"
        ],
        strategy: "Maximize revenue from committed customers"
      },
      {
        name: "Continuity",
        price: "Recurring",
        description: "Ongoing relationship creating predictable revenue",
        items: [
          "Monthly/annual subscriptions",
          "Maintenance and updates",
          "Community access",
          "Continued support"
        ],
        strategy: "Build sustainable, recurring revenue base"
      }
    ],
    ltv: "$2,500-$8,000",
    avgCac: "$150-$400"
  };

  return (
    <div className="min-h-screen bg-background" data-testid="value-ladder-page">
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
          <span className="text-foreground">Value Ladder</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-3">Framework Analysis</Badge>
          <h1 className="text-4xl font-bold mb-3" data-testid="text-page-title">
            Value Ladder Framework
          </h1>
          <p className="text-xl text-muted-foreground">
            {idea.title}
          </p>
          <p className="text-muted-foreground mt-4">
            The Value Ladder shows how to progressively increase customer value and revenue through 
            strategic pricing tiers. Each step builds trust and delivers more value.
          </p>
        </div>

        {/* Key Metrics */}
        <Card className="mb-8" data-testid="card-key-metrics">
          <CardHeader>
            <CardTitle>Revenue Metrics</CardTitle>
            <CardDescription>
              Estimated customer lifetime value and acquisition costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-primary mb-1">{ladder.ltv}</div>
                <div className="text-sm text-muted-foreground">Customer Lifetime Value</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">{ladder.avgCac}</div>
                <div className="text-sm text-muted-foreground">Average Customer Acquisition Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Value Ladder Tiers */}
        <div className="space-y-6 mb-8">
          {/* Lead Magnet */}
          <Card data-testid="card-lead-magnet">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Gift className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <CardTitle>{ladder.tiers[0].name}</CardTitle>
                  <CardDescription>{ladder.tiers[0].description}</CardDescription>
                </div>
                <Badge variant="outline" className="text-lg">{ladder.tiers[0].price}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Includes:</h4>
                <ul className="grid md:grid-cols-2 gap-2">
                  {ladder.tiers[0].items.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm"><span className="font-semibold">Strategy:</span> {ladder.tiers[0].strategy}</p>
              </div>
            </CardContent>
          </Card>

          {/* Frontend Offer */}
          <Card data-testid="card-frontend">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <CardTitle>{ladder.tiers[1].name}</CardTitle>
                  <CardDescription>{ladder.tiers[1].description}</CardDescription>
                </div>
                <Badge variant="outline" className="text-lg">{ladder.tiers[1].price}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Includes:</h4>
                <ul className="grid md:grid-cols-2 gap-2">
                  {ladder.tiers[1].items.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm"><span className="font-semibold">Strategy:</span> {ladder.tiers[1].strategy}</p>
              </div>
            </CardContent>
          </Card>

          {/* Core Offer */}
          <Card className="border-primary" data-testid="card-core">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <CardTitle>{ladder.tiers[2].name}</CardTitle>
                  <CardDescription>{ladder.tiers[2].description}</CardDescription>
                </div>
                <Badge className="text-lg">{ladder.tiers[2].price}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Includes:</h4>
                <ul className="grid md:grid-cols-2 gap-2">
                  {ladder.tiers[2].items.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm"><span className="font-semibold">Strategy:</span> {ladder.tiers[2].strategy}</p>
              </div>
            </CardContent>
          </Card>

          {/* Backend Offer */}
          <Card data-testid="card-backend">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <CardTitle>{ladder.tiers[3].name}</CardTitle>
                  <CardDescription>{ladder.tiers[3].description}</CardDescription>
                </div>
                <Badge variant="outline" className="text-lg">{ladder.tiers[3].price}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Includes:</h4>
                <ul className="grid md:grid-cols-2 gap-2">
                  {ladder.tiers[3].items.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm"><span className="font-semibold">Strategy:</span> {ladder.tiers[3].strategy}</p>
              </div>
            </CardContent>
          </Card>

          {/* Continuity */}
          <Card data-testid="card-continuity">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Repeat className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <CardTitle>{ladder.tiers[4].name}</CardTitle>
                  <CardDescription>{ladder.tiers[4].description}</CardDescription>
                </div>
                <Badge variant="outline" className="text-lg">{ladder.tiers[4].price}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Includes:</h4>
                <ul className="grid md:grid-cols-2 gap-2">
                  {ladder.tiers[4].items.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm"><span className="font-semibold">Strategy:</span> {ladder.tiers[4].strategy}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/idea/${slug}/value-matrix`)}
            data-testid="button-back"
          >
            Value Matrix
          </Button>
          <Button 
            onClick={() => navigate(`/idea/${slug}/keywords`)}
            data-testid="button-next"
          >
            Keywords Analysis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
