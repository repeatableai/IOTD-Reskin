import Header from "@/components/Header";
import { FileText, Check, X, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";

export default function PlanDetails() {
  const { user } = useAuth();
  const currentPlan = "starter";

  const plans = [
    {
      id: "starter",
      name: "Starter",
      icon: Zap,
      price: "Free",
      period: "Forever free",
      description: "Perfect for exploring ideas and getting started",
      features: [
        { text: "Browse 400+ curated startup ideas", included: true },
        { text: "View opportunity scores and metrics", included: true },
        { text: "Save up to 10 favorite ideas", included: true },
        { text: "Basic Founder Fit assessment", included: true },
        { text: "Community voting and comments", included: true },
        { text: "Email support", included: true },
        { text: "Custom research reports", included: false },
        { text: "AI Chat unlimited", included: false },
        { text: "Idea Builder tool", included: false },
        { text: "Priority support", included: false },
      ],
      buttonText: "Current Plan",
      buttonVariant: "outline" as const,
      highlighted: false,
    },
    {
      id: "pro",
      name: "Pro",
      icon: Crown,
      price: "$29",
      period: "per month",
      description: "For serious entrepreneurs ready to build",
      features: [
        { text: "Everything in Starter, plus:", included: true, bold: true },
        { text: "Unlimited saved ideas", included: true },
        { text: "Custom research reports (24h turnaround)", included: true },
        { text: "Unlimited AI Chat with GPT-4", included: true },
        { text: "Advanced Idea Builder with templates", included: true },
        { text: "Market trend alerts and notifications", included: true },
        { text: "Export data to PDF/CSV", included: true },
        { text: "Priority email & chat support", included: true },
        { text: "Early access to new features", included: true },
        { text: "Tools library (20+ resources)", included: true },
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "default" as const,
      highlighted: true,
      savings: "Save $60 with annual billing",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: Building2,
      price: "Custom",
      period: "For teams",
      description: "Advanced features for scaling organizations",
      features: [
        { text: "Everything in Pro, plus:", included: true, bold: true },
        { text: "Team collaboration workspace", included: true },
        { text: "Custom research priorities & SLA", included: true },
        { text: "Dedicated account manager", included: true },
        { text: "API access for integrations", included: true },
        { text: "Custom integrations & webhooks", included: true },
        { text: "Advanced analytics dashboard", included: true },
        { text: "White-label options", included: true },
        { text: "Onboarding & training sessions", included: true },
        { text: "24/7 phone support", included: true },
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your entrepreneurial journey
          </p>
          {user && (
            <Badge className="mt-4" variant="secondary">
              Currently on {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan
            </Badge>
          )}
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-8 relative ${
                    plan.highlighted ? "border-2 border-primary shadow-lg" : ""
                  }`}
                  data-testid={`plan-${plan.id}`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold mb-1">{plan.price}</div>
                    <p className="text-sm text-muted-foreground mb-3">{plan.period}</p>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    {plan.savings && (
                      <Badge className="mt-3 bg-green-500">
                        {plan.savings}
                      </Badge>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.included ? "" : "text-muted-foreground"
                          } ${feature.bold ? "font-semibold" : ""}`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {plan.id === currentPlan && user ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                      data-testid={`button-${plan.id}`}
                    >
                      {plan.buttonText}
                    </Button>
                  ) : plan.id === "enterprise" ? (
                    <Link href="/contact">
                      <Button
                        variant={plan.buttonVariant}
                        className="w-full"
                        data-testid={`button-${plan.id}`}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/pricing">
                      <Button
                        variant={plan.buttonVariant}
                        className="w-full"
                        data-testid={`button-${plan.id}`}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border rounded-lg p-8 bg-muted/30">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is there a refund policy?</h3>
                <p className="text-sm text-muted-foreground">
                  We offer a 30-day money-back guarantee on all paid plans, no questions asked.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Do you offer educational discounts?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes! Students and educators get 50% off Pro plans. Contact us for verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
