import Header from "@/components/Header";
import { Wrench, Layers, Code, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IdeaBuilder() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Wrench className="w-8 h-8 text-primary" />
          </div>
          <div className="inline-flex items-center gap-2 mb-4">
            <h1 className="text-4xl font-bold">Idea Builder</h1>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">PRO</span>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform research into actionable build plans
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="border rounded-lg p-8">
              <Layers className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-3">Step-by-Step Plans</h2>
              <p className="text-muted-foreground">
                Get detailed, actionable plans broken down into manageable steps. From MVP to launch.
              </p>
            </div>
            <div className="border rounded-lg p-8">
              <Code className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-3">Technical Stack</h2>
              <p className="text-muted-foreground">
                Recommended technologies, frameworks, and tools specifically suited for your idea.
              </p>
            </div>
            <div className="border rounded-lg p-8">
              <Rocket className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-3">Go-to-Market</h2>
              <p className="text-muted-foreground">
                Marketing strategies, channel recommendations, and launch timeline.
              </p>
            </div>
            <div className="border rounded-lg p-8">
              <Wrench className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-xl font-semibold mb-3">Resource Planning</h2>
              <p className="text-muted-foreground">
                Budget estimates, team requirements, and timeline projections.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Button size="lg" data-testid="button-start-building">
              Start Building Your Idea
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Available for PRO plan members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
