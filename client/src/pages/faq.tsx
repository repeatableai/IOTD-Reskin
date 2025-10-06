import Header from "@/components/Header";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "What is the Idea Database?",
      answer: "The Idea Database is a curated collection of 400+ validated startup opportunities. Each idea includes comprehensive research, market analysis, opportunity scoring, and community insights to help you make informed decisions.",
    },
    {
      question: "How do you score ideas?",
      answer: "We use a multi-factor scoring system that evaluates market opportunity, problem severity, execution difficulty, and competitive landscape. Each idea receives scores for opportunity potential, problem validation, and overall feasibility.",
    },
    {
      question: "What's included in a PRO plan?",
      answer: "PRO plan members get access to custom research reports (delivered in 24 hours), the Idea Builder tool for creating actionable plans, unlimited AI Chat conversations, and early access to new features.",
    },
    {
      question: "Can I submit my own ideas?",
      answer: "Yes! Authenticated users can submit ideas through the Create Idea page. All submissions go through our research and validation process before being added to the database.",
    },
    {
      question: "How often is the database updated?",
      answer: "We add new ideas weekly and continuously update existing ideas with fresh market data, trends, and community signals. The Idea of the Day is refreshed daily.",
    },
    {
      question: "What is Founder Fit?",
      answer: "Founder Fit is a tool that matches startup ideas to your skills, experience, and interests. It helps you identify which opportunities align best with your background and increases your chances of success.",
    },
    {
      question: "How does the AI Chat work?",
      answer: "The AI Chat allows you to have in-depth conversations about any idea in the database. You can ask questions about market size, competition, implementation details, and get strategic advice powered by AI.",
    },
    {
      question: "What are Community Signals?",
      answer: "Community Signals are real-time indicators we track from online communities (Reddit, Twitter, forums) showing genuine interest and discussion around specific problems and opportunities.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Common questions answered
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-lg px-6"
                data-testid={`faq-${index}`}
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
