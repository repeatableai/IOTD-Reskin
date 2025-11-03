import Header from "@/components/Header";
import { Sparkles, Calendar, CheckCircle2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WhatsNew() {
  const updates = [
    {
      date: "October 2025",
      title: "Enhanced AI Chat Interface",
      description: "Improved conversation flow and better research capabilities for deeper solution analysis.",
      features: [
        "Faster response times with GPT-4 integration",
        "Better context understanding across conversations",
        "Markdown support in responses with code blocks",
        "Export chat history to PDF",
      ],
      badge: "New",
    },
    {
      date: "September 2025",
      title: "Market Intelligence Dashboard",
      description: "New dashboard showing real-time market trends and community insights from 50+ sources.",
      features: [
        "Live trend tracking across Reddit, Twitter, HackerNews",
        "Community sentiment analysis with AI",
        "Custom alert system for market changes",
        "Historical trend data and comparisons",
      ],
      badge: null,
    },
    {
      date: "August 2025",
      title: "Founder Fit Assessment",
      description: "Match your skills and interests with the best startup solutions for you using our proprietary algorithm.",
      features: [
        "Skills matching algorithm with 50+ parameters",
        "Personalized recommendations based on experience",
        "Success probability scoring using historical data",
        "Career path suggestions and resources",
      ],
      badge: null,
    },
    {
      date: "July 2025",
      title: "Tools Library Expansion",
      description: "Added 20+ new startup tools and templates to help you build faster.",
      features: [
        "Financial modeling templates for SaaS, E-commerce, B2B",
        "Pitch deck templates reviewed by VCs",
        "Legal document generator for common agreements",
        "Customer interview scripts and survey templates",
      ],
      badge: null,
    },
    {
      date: "June 2025",
      title: "Research Reports API",
      description: "Pro users can now request custom research reports delivered in 24 hours.",
      features: [
        "Comprehensive market analysis with TAM/SAM/SOM",
        "Competitor landscape mapping and positioning",
        "Customer validation interviews and surveys",
        "Go-to-market strategy recommendations",
      ],
      badge: null,
    },
    {
      date: "May 2025",
      title: "Community Features",
      description: "Connect with other entrepreneurs and share insights.",
      features: [
        "Vote and comment on solutions",
        "Signal interest in problems you've encountered",
        "Join discussions on market trends",
        "Follow users and get updates on their activity",
      ],
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">What's New</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Latest features and improvements to the platform
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-8">
            {updates.map((update, index) => (
              <div
                key={index}
                className="relative pl-16"
                data-testid={`update-${index}`}
              >
                <div className="absolute left-6 top-0 w-5 h-5 rounded-full bg-primary border-4 border-background" />
                
                <div className="border rounded-lg p-8 hover:shadow-lg transition-shadow bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">{update.date}</span>
                    {update.badge && (
                      <Badge className="ml-2 bg-green-500">
                        <Zap className="w-3 h-3 mr-1" />
                        {update.badge}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-3">{update.title}</h2>
                  <p className="text-muted-foreground mb-6">{update.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {update.features.map((feature, fIndex) => (
                      <div key={fIndex} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-12 border rounded-lg p-8 text-center bg-muted/30">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground mb-4">
            We're always working on new features. Have a suggestion?
          </p>
          <a
            href="/contact"
            className="text-primary hover:underline font-medium"
            data-testid="link-suggest-feature"
          >
            Send us your feedback →
          </a>
        </div>
      </div>
    </div>
  );
}
