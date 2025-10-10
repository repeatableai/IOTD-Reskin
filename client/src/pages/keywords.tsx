import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, TrendingUp, DollarSign, Target } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";

export default function Keywords() {
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
      <div className="min-h-screen bg-background" data-testid="keywords-page">
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

  // Extract keyword data from keywordData or use placeholder
  const keywordData = idea.keywordData || {
    primaryKeyword: {
      term: idea.keyword || "productivity software",
      volume: idea.keywordVolume || 45000,
      difficulty: "Medium",
      cpc: "$12.50",
      trend: "Growing",
      intent: "Commercial"
    },
    relatedKeywords: [
      { term: "project management tool", volume: 35000, difficulty: "High", cpc: "$18.20" },
      { term: "team collaboration software", volume: 28000, difficulty: "Medium", cpc: "$15.80" },
      { term: "workflow automation", volume: 22000, difficulty: "Medium", cpc: "$14.50" },
      { term: "task management app", volume: 18000, difficulty: "Low", cpc: "$9.40" }
    ],
    longtailKeywords: [
      { term: "best productivity software for small teams", volume: 3400, difficulty: "Low", cpc: "$11.20" },
      { term: "affordable project management tools", volume: 2800, difficulty: "Low", cpc: "$10.50" },
      { term: "simple task management for startups", volume: 1900, difficulty: "Low", cpc: "$8.90" },
      { term: "free collaboration software alternatives", volume: 1600, difficulty: "Low", cpc: "$7.40" }
    ],
    competitors: [
      { name: "Asana", estimatedTraffic: "12M/mo", topKeywords: 850 },
      { name: "Monday.com", estimatedTraffic: "8.5M/mo", topKeywords: 620 },
      { name: "Trello", estimatedTraffic: "15M/mo", topKeywords: 1200 }
    ],
    seoStrategy: [
      "Target long-tail keywords with lower competition for faster wins",
      "Create comparison content (vs Asana, vs Monday) for commercial intent keywords",
      "Build educational content around workflow automation and productivity",
      "Focus on industry-specific use cases (marketing teams, developers, etc.)"
    ]
  };

  return (
    <div className="min-h-screen bg-background" data-testid="keywords-page">
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
          <span className="text-foreground">Keywords</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-3">SEO Analysis</Badge>
          <h1 className="text-4xl font-bold mb-3" data-testid="text-page-title">
            Keyword Research & SEO
          </h1>
          <p className="text-xl text-muted-foreground">
            {idea.title}
          </p>
          <p className="text-muted-foreground mt-4">
            Comprehensive keyword analysis revealing search volume, competition, and opportunities 
            to capture organic traffic and reduce customer acquisition costs.
          </p>
        </div>

        {/* Primary Keyword */}
        <Card className="mb-8" data-testid="card-primary-keyword">
          <CardHeader>
            <CardTitle>Primary Keyword</CardTitle>
            <CardDescription>
              Main target keyword with the highest strategic value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{keywordData.primaryKeyword.term}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">{keywordData.primaryKeyword.trend}</Badge>
                  <Badge variant="outline">{keywordData.primaryKeyword.intent} Intent</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold">{keywordData.primaryKeyword.volume.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Monthly Searches</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{keywordData.primaryKeyword.difficulty}</div>
                  <div className="text-sm text-muted-foreground">SEO Difficulty</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{keywordData.primaryKeyword.cpc}</div>
                  <div className="text-sm text-muted-foreground">Cost Per Click</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-muted-foreground">Trend Direction</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Keywords */}
        <Card className="mb-8" data-testid="card-related-keywords">
          <CardHeader>
            <CardTitle>High-Volume Related Keywords</CardTitle>
            <CardDescription>
              Secondary keywords with significant search volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keywordData.relatedKeywords.map((keyword: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{keyword.term}</div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        {keyword.volume.toLocaleString()}/mo
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {keyword.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {keyword.cpc} CPC
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Long-tail Keywords */}
        <Card className="mb-8" data-testid="card-longtail-keywords">
          <CardHeader>
            <CardTitle>Long-Tail Opportunities</CardTitle>
            <CardDescription>
              Lower competition keywords perfect for quick wins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {keywordData.longtailKeywords.map((keyword: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{keyword.term}</div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Search className="w-3 h-3" />
                        {keyword.volume.toLocaleString()}/mo
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {keyword.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {keyword.cpc} CPC
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    Easy Win
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competitor Analysis */}
        <Card className="mb-8" data-testid="card-competitors">
          <CardHeader>
            <CardTitle>Competitor Keyword Performance</CardTitle>
            <CardDescription>
              Top competitors and their organic search presence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keywordData.competitors.map((comp: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                  <div>
                    <div className="font-semibold text-lg mb-1">{comp.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {comp.topKeywords} ranking keywords
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{comp.estimatedTraffic}</div>
                    <div className="text-sm text-muted-foreground">Est. Traffic</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SEO Strategy */}
        <Card className="mb-8" data-testid="card-seo-strategy">
          <CardHeader>
            <CardTitle>Recommended SEO Strategy</CardTitle>
            <CardDescription>
              Action plan to capture organic traffic and reduce CAC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {keywordData.seoStrategy.map((strategy: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{strategy}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/idea/${slug}/value-ladder`)}
            data-testid="button-back"
          >
            Value Ladder
          </Button>
          <Button 
            onClick={() => navigate(`/idea/${slug}`)}
            data-testid="button-overview"
          >
            Back to Overview
          </Button>
        </div>
      </div>
    </div>
  );
}
