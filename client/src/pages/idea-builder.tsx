import Header from "@/components/Header";
import { Wrench, Layers, Code, Rocket, CheckCircle2, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function IdeaBuilder() {
  const { user } = useAuth();
  const isPro = false;

  const builderFeatures = [
    {
      icon: Layers,
      title: "Step-by-Step Plans",
      description: "Get detailed, actionable plans broken down into manageable steps",
      benefits: [
        "MVP definition and feature prioritization",
        "Development milestones and timeline",
        "Launch checklist and preparation",
        "Post-launch growth strategies",
      ],
    },
    {
      icon: Code,
      title: "Technical Stack",
      description: "Recommended technologies, frameworks, and tools specifically suited for your solution",
      benefits: [
        "Technology recommendations based on requirements",
        "Architecture patterns and best practices",
        "Third-party service suggestions",
        "Scalability considerations",
      ],
    },
    {
      icon: Rocket,
      title: "Go-to-Market",
      description: "Marketing strategies, channel recommendations, and launch timeline",
      benefits: [
        "Target audience identification",
        "Marketing channel recommendations",
        "Content strategy and messaging",
        "Launch sequence and tactics",
      ],
    },
    {
      icon: Wrench,
      title: "Resource Planning",
      description: "Budget estimates, team requirements, and timeline projections",
      benefits: [
        "Budget breakdown by category",
        "Team composition recommendations",
        "Timeline and milestone planning",
        "Resource allocation strategies",
      ],
    },
  ];

  const process = [
    {
      step: 1,
      title: "Select Your Solution",
      description: "Choose a solution from your saved list or browse the database",
    },
    {
      step: 2,
      title: "Answer Key Questions",
      description: "Provide details about your skills, budget, and timeline",
    },
    {
      step: 3,
      title: "Get Your Plan",
      description: "Receive a comprehensive, customized build plan in minutes",
    },
    {
      step: 4,
      title: "Start Building",
      description: "Follow the plan, track progress, and iterate based on feedback",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Wrench className="w-8 h-8 text-primary" />
          </div>
          <div className="inline-flex items-center gap-2 mb-4">
            <h1 className="text-4xl font-bold">Solution Builder</h1>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">PRO</span>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform research into actionable build plans with AI-powered guidance
          </p>
        </div>

        {!user && (
          <div className="max-w-4xl mx-auto mb-8">
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                Sign in to access Solution Builder and start creating your custom build plan
              </AlertDescription>
            </Alert>
          </div>
        )}

        {user && !isPro && (
          <div className="max-w-4xl mx-auto mb-8">
            <Alert className="border-primary/50 bg-primary/5">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertDescription>
                Upgrade to PRO to unlock Solution Builder and get personalized build plans for your solutions
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {process.map((item) => (
              <div
                key={item.step}
                className="border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
                data-testid={`process-step-${item.step}`}
              >
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {builderFeatures.map((feature, index) => {
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
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, bIndex) => (
                      <li key={bIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <div className="border rounded-lg p-8 bg-muted/30">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Plans Generated in Minutes</h3>
                <p className="text-muted-foreground mb-4">
                  Our AI analyzes your solution, skills, resources, and goals to create a customized plan
                  tailored specifically for you. Most plans are generated in under 5 minutes.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Personalized based on your skills and experience</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Adjusted for your budget and timeline constraints</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Updated with latest best practices and tools</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          {!user || !isPro ? (
            <div>
              <Link href="/pricing">
                <Button size="lg" data-testid="button-upgrade-to-pro">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Upgrade to PRO
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                Start building with AI-powered guidance
              </p>
            </div>
          ) : (
            <div>
              <Button size="lg" data-testid="button-start-building">
                Start Building Your Solution
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Create your first build plan now
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
