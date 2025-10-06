import Header from "@/components/Header";
import { Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ToolsLibrary() {
  const tools = [
    {
      name: "Pitch Deck Template",
      description: "Professional pitch deck template for fundraising",
      category: "Fundraising",
    },
    {
      name: "Financial Model",
      description: "Startup financial planning spreadsheet",
      category: "Finance",
    },
    {
      name: "Landing Page Builder",
      description: "Quick MVP landing page generator",
      category: "Marketing",
    },
    {
      name: "Legal Templates",
      description: "Terms of service and privacy policy templates",
      category: "Legal",
    },
    {
      name: "Customer Interview Script",
      description: "Framework for customer discovery interviews",
      category: "Research",
    },
    {
      name: "MVP Checklist",
      description: "Essential features for your minimum viable product",
      category: "Development",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Tools Library</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Startup tools and resources to help you build and launch
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
              data-testid={`card-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {tool.category}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">{tool.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
              <Button variant="outline" size="sm" className="w-full" data-testid={`button-access-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}>
                Access Tool
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
