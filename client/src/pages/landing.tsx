import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import IdeaCard from "@/components/IdeaCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  TrendingUp,
  Target,
  Rocket,
  Users,
  Search,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Database,
  LineChart,
  Calendar
} from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const { data: response, isLoading: ideasLoading } = useQuery<{ ideas: any[]; total: number }>({
    queryKey: ["/api/ideas", { limit: 6, sortBy: "opportunity" }],
  });

  const topIdeas = response?.ideas || [];
  const totalVentures = response?.total || 400;

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 px-4 py-1.5 text-sm" variant="secondary">
              <Sparkles className="w-4 h-4 mr-2" />
              Intelligent Venture Engine
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Discover Your Next
              <span className="block mt-2 bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">
                Venture in Minutes
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              AI-powered research, market validation, and one-week build frameworks
              for {totalVentures}+ validated business opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="text-lg px-8 h-14"
                onClick={() => setLocation("/database")}
              >
                <Database className="w-5 h-5 mr-2" />
                Explore Venture Incubator
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 h-14"
                onClick={() => setLocation("/idea-generator")}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Custom Ideas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalVentures}+</div>
              <div className="text-sm text-muted-foreground">Validated Ventures</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">AI-Powered</div>
              <div className="text-sm text-muted-foreground">Research & Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">1 Week</div>
              <div className="text-sm text-muted-foreground">Build Framework</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">Real-Time</div>
              <div className="text-sm text-muted-foreground">Community Signals</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From discovery to deployment in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute top-8 left-1/2 w-full h-0.5 bg-border hidden md:block" style={{ transform: 'translateX(50%)' }} />
                <h3 className="text-xl font-semibold mb-3">1. Discover</h3>
                <p className="text-muted-foreground">
                  Browse {totalVentures}+ pre-validated ventures filtered by market, opportunity score, and your skills.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-secondary" />
                </div>
                <div className="absolute top-8 left-1/2 w-full h-0.5 bg-border hidden md:block" style={{ transform: 'translateX(50%)' }} />
                <h3 className="text-xl font-semibold mb-3">2. Research</h3>
                <p className="text-muted-foreground">
                  Deep dive with AI research reports, community signals, market gaps, and competitor analysis.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                  <Rocket className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Build</h3>
                <p className="text-muted-foreground">
                  Follow the one-week build framework with Claude Code prompts and execution plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ventures */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Top-Rated Ventures</h2>
              <p className="text-muted-foreground">Highest opportunity scores in the incubator</p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/database")}>
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {ideasLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <div className="animate-pulse">
                    <div className="h-48 bg-muted" />
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-6 bg-muted rounded mb-2" />
                      <div className="h-16 bg-muted rounded mb-4" />
                      <div className="h-8 bg-muted rounded" />
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : topIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topIdeas.slice(0, 6).map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Loading ventures...
            </div>
          )}
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Validate & Build</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Comprehensive tools for every stage of your venture journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI Research Reports</h3>
              <p className="text-muted-foreground text-sm">
                One-click deep research on market size, competitors, and growth potential.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Community Signals</h3>
              <p className="text-muted-foreground text-sm">
                Real-time sentiment from Reddit, YouTube, Twitter, and Facebook groups.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Market Gap Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Identify underserved niches and competitive advantages.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Founder Fit Assessment</h3>
              <p className="text-muted-foreground text-sm">
                Match ventures to your skills, budget, and time commitment.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">One-Week Build Plans</h3>
              <p className="text-muted-foreground text-sm">
                Day-by-day execution roadmaps with OWVI feasibility scores.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Claude Code Prompts</h3>
              <p className="text-muted-foreground text-sm">
                Ready-to-use prompts to build with AI-assisted development.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Stop Guessing. Start Building.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Every venture in our incubator comes with comprehensive research,
                validated market signals, and actionable build plans.
              </p>
              <ul className="space-y-4">
                {[
                  "Pre-validated with community signals and trend data",
                  "Scored on opportunity, feasibility, and timing",
                  "Complete with execution plans and cost breakdowns",
                  "Exportable research for your pitch decks"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <LineChart className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold">87%</div>
                <div className="text-sm text-muted-foreground">Avg. Opportunity Score</div>
              </Card>
              <Card className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-2xl font-bold">$2.4M</div>
                <div className="text-sm text-muted-foreground">Avg. Market Size</div>
              </Card>
              <Card className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold">150+</div>
                <div className="text-sm text-muted-foreground">Communities Tracked</div>
              </Card>
              <Card className="p-6 text-center">
                <Rocket className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <div className="text-2xl font-bold">7 Days</div>
                <div className="text-sm text-muted-foreground">Avg. Build Time</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Venture?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse {totalVentures}+ validated opportunities and start building today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 h-14"
              onClick={() => setLocation("/database")}
            >
              <Database className="w-5 h-5 mr-2" />
              Enter the Incubator
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Repeatable
                </div>
                <span className="text-xl font-bold text-foreground">.AI</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The Intelligent Venture Engine for discovering and building validated business opportunities.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => setLocation("/database")} className="hover:text-foreground transition-colors">
                    Venture Incubator
                  </button>
                </li>
                <li>
                  <button onClick={() => setLocation("/idea-generator")} className="hover:text-foreground transition-colors">
                    Idea Generator
                  </button>
                </li>
                <li>
                  <button onClick={() => setLocation("/market-insights")} className="hover:text-foreground transition-colors">
                    Market Insights
                  </button>
                </li>
                <li>
                  <button onClick={() => setLocation("/trends")} className="hover:text-foreground transition-colors">
                    Trend Analysis
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => setLocation("/founder-fit")} className="hover:text-foreground transition-colors">
                    Founder Fit Test
                  </button>
                </li>
                <li>
                  <button onClick={() => setLocation("/tools")} className="hover:text-foreground transition-colors">
                    Tools Library
                  </button>
                </li>
                <li>
                  <button onClick={() => setLocation("/faq")} className="hover:text-foreground transition-colors">
                    FAQ
                  </button>
                </li>
                <li>
                  <button onClick={() => setLocation("/about")} className="hover:text-foreground transition-colors">
                    About
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => setLocation("/contact")} className="hover:text-foreground transition-colors">
                    Contact
                  </button>
                </li>
                <li>
                  <button onClick={() => setLocation("/pricing")} className="hover:text-foreground transition-colors">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Repeatable.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
