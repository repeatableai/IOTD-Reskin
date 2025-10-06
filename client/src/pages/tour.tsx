import Header from "@/components/Header";
import { Play, Lightbulb, Database, TrendingUp, MessageSquare, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Tour() {
  const features = [
    {
      icon: Lightbulb,
      title: "Idea Discovery",
      description: "Browse 400+ curated startup ideas with comprehensive market analysis and opportunity scoring",
      steps: ["Filter by market and category", "View detailed metrics", "Save favorites for later"],
    },
    {
      icon: Database,
      title: "Research Database",
      description: "Access validated opportunities with real market data, community signals, and competitive analysis",
      steps: ["Search and filter ideas", "Read detailed research", "Compare opportunities"],
    },
    {
      icon: TrendingUp,
      title: "Market Intelligence",
      description: "Track trending markets and community insights from Reddit, Twitter, and online forums",
      steps: ["View trending markets", "Analyze community signals", "Set up market alerts"],
    },
    {
      icon: MessageSquare,
      title: "AI Chat",
      description: "Have deep conversations about any idea with AI-powered insights and strategic advice",
      steps: ["Ask detailed questions", "Get market analysis", "Receive strategic recommendations"],
    },
  ];

  const workflow = [
    {
      step: 1,
      title: "Browse & Discover",
      description: "Explore curated startup ideas filtered by market, score, and interest",
    },
    {
      step: 2,
      title: "Analyze & Research",
      description: "Deep dive into market data, community signals, and competitive landscape",
    },
    {
      step: 3,
      title: "Chat & Learn",
      description: "Ask AI questions about implementation, challenges, and opportunities",
    },
    {
      step: 4,
      title: "Build & Launch",
      description: "Use Idea Builder to create actionable plans and start building",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Play className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Platform Tour</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how we help entrepreneurs find and validate their next big idea
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
                <Play className="w-10 h-10 text-primary" />
              </div>
              <p className="text-lg font-semibold mb-1">Watch the 2-Minute Tour</p>
              <p className="text-sm text-muted-foreground">Coming soon - Full video walkthrough</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-2 text-center">How It Works</h2>
          <p className="text-center text-muted-foreground mb-10">
            From discovery to launch in four simple steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {workflow.map((item, index) => (
              <div key={index} className="relative" data-testid={`workflow-step-${index}`}>
                {index < workflow.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-8 top-8 w-6 h-6 text-muted-foreground" />
                )}
                <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-2 text-center">Key Features</h2>
          <p className="text-center text-muted-foreground mb-10">
            Everything you need to find and validate startup ideas
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="border rounded-lg p-8 hover:shadow-lg transition-shadow"
                  data-testid={`feature-${index}`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 ml-16">
                    {feature.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center border rounded-lg p-12 bg-primary/5">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of entrepreneurs discovering their next opportunity
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/ideas">
              <Button size="lg" data-testid="button-browse-ideas">
                Browse Ideas
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" data-testid="button-view-pricing">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
