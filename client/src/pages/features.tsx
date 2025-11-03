import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Search, 
  TrendingUp, 
  Users, 
  BarChart3, 
  Filter, 
  Star, 
  Heart, 
  Target,
  Brain,
  Zap,
  Shield,
  Globe
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Advanced Search & Discovery",
    description: "Find the perfect startup solution with our intelligent search engine that filters by market, opportunity score, execution difficulty, and revenue potential.",
    benefits: ["Smart keyword matching", "Multi-criteria filtering", "Personalized recommendations"],
    status: "live"
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Every solution is analyzed using advanced algorithms to provide opportunity scores, market validation data, and competitive landscape insights.",
    benefits: ["Opportunity scoring (1-10)", "Market size analysis", "Competition assessment"],
    status: "live"
  },
  {
    icon: BarChart3,
    title: "Comprehensive Scoring System",
    description: "Multi-dimensional scoring across opportunity, problem validation, execution difficulty, and market timing to help you make data-driven decisions.",
    benefits: ["Problem validation scores", "Execution difficulty ratings", "Market timing analysis"],
    status: "live"
  },
  {
    icon: Users,
    title: "Community Insights",
    description: "Tap into collective wisdom with community voting, signals, and feedback from fellow entrepreneurs and industry experts.",
    benefits: ["Community voting system", "Expert signals", "Collaborative feedback"],
    status: "live"
  },
  {
    icon: Heart,
    title: "Personal Favorites",
    description: "Save solutions that resonate with you and build your personal collection of potential business opportunities for future reference.",
    benefits: ["Save favorite solutions", "Personal collections", "Quick access dashboard"],
    status: "live"
  },
  {
    icon: Target,
    title: "Market Validation Data",
    description: "Access real market data including search volumes, growth trends, and competitive analysis to validate solution potential.",
    benefits: ["Keyword search volume", "Growth trend analysis", "Market size estimates"],
    status: "live"
  },
  {
    icon: Zap,
    title: "Real-time Trending",
    description: "Stay ahead of the curve with real-time tracking of trending solutions, emerging markets, and hot opportunities.",
    benefits: ["Trending solution alerts", "Market emergence tracking", "Opportunity notifications"],
    status: "coming-soon"
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Understand potential risks and challenges with detailed risk assessments and mitigation strategies for each solution.",
    benefits: ["Risk factor analysis", "Mitigation strategies", "Success probability"],
    status: "coming-soon"
  },
  {
    icon: Globe,
    title: "Global Market Intelligence",
    description: "Expand your horizons with global market data, regional opportunities, and international expansion insights.",
    benefits: ["Global market data", "Regional opportunities", "International insights"],
    status: "coming-soon"
  }
];

export default function Features() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Powerful Features for
            <span className="block text-primary">Smart Entrepreneurs</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Everything you need to discover, analyze, and validate startup opportunities with confidence. 
            From AI-powered insights to community wisdom.
          </p>
          <div className="flex justify-center">
            <Link href="/database">
              <Button size="lg" data-testid="button-explore-ideas">
                Explore Solutions Now
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="relative hover:shadow-lg transition-shadow duration-200" data-testid={`card-feature-${index}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge 
                    variant={feature.status === 'live' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {feature.status === 'live' ? 'Live' : 'Coming Soon'}
                  </Badge>
                </div>
                <CardTitle className="text-xl mb-2">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {feature.description}
                </p>
                
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="bg-card rounded-2xl p-8 mb-16 border">
          <h2 className="text-3xl font-bold text-center text-foreground mb-8">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Curated Ideas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Market Categories</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Accuracy Rate</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 rounded-2xl p-8 text-center border">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Find Your Next Big Solution?
          </h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who are using our platform to discover and validate their next startup opportunity.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/database">
              <Button size="lg" data-testid="button-browse-ideas">
                Browse Solutions
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" data-testid="button-view-pricing">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}