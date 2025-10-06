import Header from "@/components/Header";
import { Sparkles, Calendar } from "lucide-react";

export default function WhatsNew() {
  const updates = [
    {
      date: "October 2025",
      title: "Enhanced AI Chat Interface",
      description: "Improved conversation flow and better research capabilities for deeper idea analysis.",
      features: [
        "Faster response times",
        "Better context understanding",
        "Markdown support in responses",
      ],
    },
    {
      date: "September 2025",
      title: "Market Intelligence Dashboard",
      description: "New dashboard showing real-time market trends and community insights.",
      features: [
        "Live trend tracking",
        "Community sentiment analysis",
        "Custom alert system",
      ],
    },
    {
      date: "August 2025",
      title: "Founder Fit Assessment",
      description: "Match your skills and interests with the best startup ideas for you.",
      features: [
        "Skills matching algorithm",
        "Personalized recommendations",
        "Success probability scoring",
      ],
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

        <div className="max-w-4xl mx-auto space-y-8">
          {updates.map((update, index) => (
            <div
              key={index}
              className="border rounded-lg p-8"
              data-testid={`update-${index}`}
            >
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{update.date}</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">{update.title}</h2>
              <p className="text-muted-foreground mb-4">{update.description}</p>
              <ul className="space-y-2">
                {update.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start">
                    <span className="text-primary mr-2">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
