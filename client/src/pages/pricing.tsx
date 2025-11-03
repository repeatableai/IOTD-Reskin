import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Explorer",
    icon: Star,
    price: "Free",
    description: "Perfect for getting started with solution discovery",
    features: [
      "Access to 50+ curated startup solutions",
      "Basic opportunity scoring",
      "Community voting access",
      "Standard search and filters",
      "Save up to 5 favorite solutions"
    ],
    limitations: [
      "Limited to 10 solutions per day",
      "Basic analytics only",
      "Community features only"
    ],
    cta: "Get Started Free",
    popular: false,
    color: "bg-gray-500"
  },
  {
    name: "Pro",
    icon: Zap,
    price: "$19",
    period: "/month",
    description: "For serious entrepreneurs validating opportunities",
    features: [
      "Access to entire solution database (500+)",
      "Advanced AI-powered analysis",
      "Detailed market validation data",
      "Advanced search with all filters",
      "Unlimited saved solutions",
      "Trending alerts and notifications",
      "Export solutions to PDF/CSV",
      "Priority community features"
    ],
    limitations: [],
    cta: "Start Pro Trial",
    popular: true,
    color: "bg-primary"
  },
  {
    name: "Enterprise",
    icon: Crown,
    price: "$99",
    period: "/month",
    description: "For teams and organizations scaling innovation",
    features: [
      "Everything in Pro",
      "Team collaboration tools",
      "Custom solution submissions",
      "API access for integrations",
      "White-label options",
      "Dedicated account manager",
      "Custom market research",
      "Advanced analytics dashboard",
      "Priority support"
    ],
    limitations: [],
    cta: "Contact Sales",
    popular: false,
    color: "bg-purple-500"
  }
];

const faqs = [
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access to Pro features until the end of your billing period."
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes! All paid plans come with a 14-day free trial. No credit card required to start."
  },
  {
    question: "How often is the solution database updated?",
    answer: "We add new solutions weekly and update existing ones based on market changes and community feedback."
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer: "Absolutely! You can change your plan at any time. Changes will be prorated based on your billing cycle."
  },
  {
    question: "Is there a discount for annual billing?",
    answer: "Yes, we offer a 20% discount when you choose annual billing for any paid plan."
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Simple, Transparent
            <span className="block text-primary">Pricing</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the plan that fits your entrepreneurial journey. Start free and scale as you grow.
          </p>
          <Badge variant="secondary" className="text-sm px-4 py-2">
            ✨ 14-day free trial on all paid plans
          </Badge>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative hover:shadow-lg transition-all duration-200 ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              }`}
              data-testid={`card-plan-${plan.name.toLowerCase()}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="px-4 py-1 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className={`w-16 h-16 rounded-full ${plan.color} bg-opacity-10 flex items-center justify-center mx-auto mb-4`}>
                  <plan.icon className={`w-8 h-8 text-foreground`} />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">
                  {plan.name}
                </CardTitle>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-1">
                      {plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button 
                  className={`w-full mb-6 ${plan.popular ? '' : 'variant-outline'}`}
                  variant={plan.popular ? "default" : "outline"}
                  data-testid={`button-${plan.name.toLowerCase()}-cta`}
                >
                  {plan.cta}
                </Button>
                
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-foreground mb-2">
                    What's included:
                  </div>
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6" data-testid={`card-faq-${index}`}>
                <h3 className="font-semibold text-foreground mb-3">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary/5 rounded-2xl p-8 text-center mt-16 border">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Still Have Questions?
          </h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our team is here to help you choose the right plan for your entrepreneurial goals.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" data-testid="button-contact-sales">
              Contact Sales
            </Button>
            <Button variant="outline" size="lg" data-testid="button-book-demo">
              Book a Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}