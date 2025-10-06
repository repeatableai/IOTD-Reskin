import Header from "@/components/Header";
import { Info, Target, Users, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Info className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn about our mission and team
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We believe great startup ideas shouldn't be left to chance. Our platform helps
              entrepreneurs discover data-driven business opportunities with comprehensive
              research, market validation, and AI-powered insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 border rounded-lg">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Data-Driven</h3>
              <p className="text-sm text-muted-foreground">
                Every idea is backed by market research and validated insights
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Built by entrepreneurs, for entrepreneurs
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Success</h3>
              <p className="text-sm text-muted-foreground">
                We're dedicated to helping you build successful startups
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-8 bg-muted/30">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground mb-4">
              Founded in 2024, we started with a simple observation: finding the right startup
              idea was more about luck than skill. Entrepreneurs spent months brainstorming,
              often missing great opportunities hidden in plain sight.
            </p>
            <p className="text-muted-foreground">
              Today, we've curated and analyzed 400+ validated business opportunities, helping
              thousands of entrepreneurs discover ideas that match their skills and the market's
              needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
