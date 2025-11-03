import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import IdeaCard from "@/components/IdeaCard";
import ScoreDisplay from "@/components/ScoreDisplay";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, ChartLine, Target, Rocket, Users, Download } from "lucide-react";

export default function Landing() {
  const { data: featuredIdea, isLoading: featuredLoading } = useQuery({
    queryKey: ["/api/ideas/featured"],
  });

  const { data: topIdeas, isLoading: topLoading } = useQuery({
    queryKey: ["/api/ideas/top"],
  });

  return (
    <div className="min-h-screen bg-background" data-testid="landing-page">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              The <span className="infinity-logo">#1 Software</span> to Spot Trends and 
              <br className="hidden md:block" />
              Startup Solutions Worth Building
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover profitable startup opportunities backed by comprehensive data analysis. 
              From Reddit trends to market validation - find your next venture in minutes, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-3" data-testid="button-browse-ideas">
                Browse 400+ Solutions
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3" data-testid="button-watch-demo">
                <i className="fas fa-play mr-2"></i>
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Idea of the Day */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Solution of the Day</h2>
            <p className="text-muted-foreground">Fully researched business opportunity delivered daily</p>
          </div>
          
          {featuredLoading ? (
            <div className="max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-8 bg-muted rounded mb-4"></div>
                    <div className="h-20 bg-muted rounded mb-6"></div>
                    <div className="grid grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted rounded"></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : featuredIdea ? (
            <div className="gradient-border max-w-5xl mx-auto">
              <div className="gradient-border-inner p-8">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/3">
                    <img 
                      src={featuredIdea.imageUrl || "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"} 
                      alt={featuredIdea.title}
                      className="rounded-xl w-full h-64 object-cover"
                    />
                  </div>
                  
                  <div className="lg:w-2/3">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-green-50 text-green-700 border-green-200">Perfect Timing</Badge>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">Unfair Advantage</Badge>
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200">Proven Founder Fit</Badge>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{featuredIdea.title}</h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {featuredIdea.description}
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <ScoreDisplay 
                        score={featuredIdea.opportunityScore} 
                        label="Opportunity" 
                        sublabel={featuredIdea.opportunityLabel} 
                      />
                      <ScoreDisplay 
                        score={featuredIdea.problemScore} 
                        label="Problem" 
                        sublabel={featuredIdea.problemLabel} 
                      />
                      <ScoreDisplay 
                        score={featuredIdea.feasibilityScore} 
                        label="Feasibility" 
                        sublabel={featuredIdea.feasibilityLabel} 
                      />
                      <ScoreDisplay 
                        score={featuredIdea.timingScore} 
                        label="Why Now" 
                        sublabel={featuredIdea.timingLabel} 
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button data-testid="button-view-analysis">
                        <i className="fas fa-external-link-alt mr-2"></i>
                        View Full Analysis
                      </Button>
                      <Button variant="outline" data-testid="button-build-idea">
                        <i className="fas fa-code mr-2"></i>
                        Build This Solution
                      </Button>
                      <Button variant="outline" data-testid="button-export-data">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No featured solution available at the moment.
            </div>
          )}
        </div>
      </section>

      {/* Top Ideas Preview */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trending Solutions</h2>
            <p className="text-muted-foreground">Most popular startup opportunities this week</p>
          </div>
          
          {topLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <div className="animate-pulse">
                    <div className="h-48 bg-muted"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-6 bg-muted rounded mb-2"></div>
                      <div className="h-16 bg-muted rounded mb-4"></div>
                      <div className="flex gap-2 mb-4">
                        {[...Array(3)].map((_, j) => (
                          <div key={j} className="h-8 w-8 bg-muted rounded"></div>
                        ))}
                      </div>
                      <div className="h-8 bg-muted rounded"></div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : topIdeas && topIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topIdeas.slice(0, 6).map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              No solutions available at the moment.
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button size="lg" data-testid="button-view-all-ideas">
              View All Solutions
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Research & Analysis Tools</h2>
            <p className="text-muted-foreground">Everything you need to validate and execute startup ideas</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Brain className="text-primary text-xl" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI-Powered Research</h3>
              <p className="text-muted-foreground">
                Automated market research using AI to analyze trends, competitors, and opportunities across multiple data sources.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <ChartLine className="text-secondary text-xl" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Market Intelligence</h3>
              <p className="text-muted-foreground">
                Real-time trend analysis, search volume data, and community signals from Reddit, YouTube, and social platforms.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="text-accent text-xl" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Founder-Fit Assessment</h3>
              <p className="text-muted-foreground">
                Personalized matching based on your skills, capital, and time commitment to find solutions perfect for you.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center mb-4">
                <Rocket className="text-blue-500 text-xl" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Go-to-Market Plans</h3>
              <p className="text-muted-foreground">
                Detailed execution strategies, revenue models, and step-by-step launch plans for every validated solution.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="w-12 h-12 bg-chart-5/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-yellow-600 text-xl" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Community Signals</h3>
              <p className="text-muted-foreground">
                Track real demand through Reddit sentiment, Facebook group engagement, and YouTube channel analysis.
              </p>
            </Card>
            
            <Card className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Download className="text-primary text-xl" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Export & Build Tools</h3>
              <p className="text-muted-foreground">
                Export research data, generate landing pages, and connect with AI development tools to start building immediately.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Venture?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of entrepreneurs discovering profitable startup solutions backed by data
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3" data-testid="button-start-trial">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3" data-testid="button-view-pricing">
              View Pricing
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            ✓ No credit card required  ✓ Full access to database  ✓ Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="text-2xl font-bold infinity-logo">∞</div>
                <span className="text-xl font-bold text-foreground">Ai</span>
              </div>
              <p className="text-muted-foreground">
                The #1 software to spot trends and startup solutions worth building.
              </p>
              <div className="flex space-x-4">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <i className="fab fa-twitter"></i>
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <i className="fab fa-linkedin"></i>
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <i className="fab fa-github"></i>
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">Features</button></li>
                <li><button className="hover:text-foreground transition-colors">Database</button></li>
                <li><button className="hover:text-foreground transition-colors">AI Research</button></li>
                <li><button className="hover:text-foreground transition-colors">Pricing</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">Documentation</button></li>
                <li><button className="hover:text-foreground transition-colors">Blog</button></li>
                <li><button className="hover:text-foreground transition-colors">Case Studies</button></li>
                <li><button className="hover:text-foreground transition-colors">Help Center</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><button className="hover:text-foreground transition-colors">About</button></li>
                <li><button className="hover:text-foreground transition-colors">Careers</button></li>
                <li><button className="hover:text-foreground transition-colors">Privacy</button></li>
                <li><button className="hover:text-foreground transition-colors">Terms</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Ideabrowser. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
