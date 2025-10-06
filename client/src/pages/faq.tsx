import Header from "@/components/Header";
import { HelpCircle, Search, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import type { FaqQuestion } from "@shared/schema";

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { data: faqQuestions, isLoading } = useQuery<FaqQuestion[]>({
    queryKey: ["/api/faq", selectedCategory === "all" ? undefined : selectedCategory],
  });

  const voteMutation = useMutation({
    mutationFn: ({ id, helpful }: { id: string; helpful: boolean }) =>
      apiRequest('POST', `/api/faq/${id}/vote`, { helpful }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/faq"] });
    },
  });

  const filteredFaqs = faqQuestions?.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const categories = ["all", "general", "features", "billing", "technical"];

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
            Find answers to common questions
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-faq-search"
            />
          </div>
        </div>

        <div className="max-w-3xl mx-auto mb-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  data-testid={`tab-${category}`}
                  className="capitalize"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading FAQs...
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No questions found matching your search.
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={faq.id}
                  className="border rounded-lg px-6"
                  data-testid={`faq-${faq.id}`}
                >
                  <AccordionTrigger className="text-left font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-muted-foreground mb-4">
                      {faq.answer}
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <span className="text-sm text-muted-foreground">
                        Was this helpful?
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => voteMutation.mutate({ id: faq.id, helpful: true })}
                          disabled={voteMutation.isPending}
                          data-testid={`button-helpful-${faq.id}`}
                          className="gap-1"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs">{faq.helpful}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => voteMutation.mutate({ id: faq.id, helpful: false })}
                          disabled={voteMutation.isPending}
                          data-testid={`button-not-helpful-${faq.id}`}
                          className="gap-1"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-xs">{faq.notHelpful}</span>
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        <div className="max-w-3xl mx-auto mt-12 text-center border rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground mb-4">
            Can't find the answer you're looking for? Get in touch with our support team.
          </p>
          <Button data-testid="button-contact-support">
            <a href="/contact">Contact Support</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
