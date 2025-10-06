import Header from "@/components/Header";
import { Play, Lightbulb, Database, TrendingUp, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Tour() {
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
            Watch our 2-minute walkthrough video to see how the platform works
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
            <div className="text-center">
              <Play className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Video walkthrough coming soon</p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 border rounded-lg">
              <Lightbulb className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Idea Discovery</h3>
              <p className="text-sm text-muted-foreground">
                Browse curated startup ideas
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <Database className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Research Database</h3>
              <p className="text-sm text-muted-foreground">
                400+ validated opportunities
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <TrendingUp className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Market Intelligence</h3>
              <p className="text-sm text-muted-foreground">
                Track trends and insights
              </p>
            </div>
            <div className="text-center p-6 border rounded-lg">
              <MessageSquare className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">AI Chat</h3>
              <p className="text-sm text-muted-foreground">
                Deep dive with AI assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
