import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Idea } from '@shared/schema';
import { 
  Sparkles, 
  Search, 
  MessageSquare,
  TrendingUp,
  Target
} from 'lucide-react';

export default function AIChatLanding() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: ideasData, isLoading } = useQuery({
    queryKey: ['/api/ideas', { limit: 100 }],
    queryFn: async () => {
      const response = await fetch('/api/ideas?limit=100');
      if (!response.ok) throw new Error('Failed to fetch ideas');
      return response.json();
    },
  });

  const filteredIdeas = ideasData?.ideas?.filter((idea: Idea) =>
    searchQuery === '' ||
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const topIdeas = filteredIdeas.slice(0, 12);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-chat-landing-title">
            AI Chat & Strategize
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Dive deep into any startup opportunity with AI-powered insights. Select a solution to begin your strategic conversation.
          </p>
          
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a solution to discuss..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
              data-testid="input-search-ideas"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading solutions...</p>
            </div>
          </div>
        ) : topIdeas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No solutions found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topIdeas.map((idea: Idea) => (
              <Card 
                key={idea.id} 
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setLocation(`/ai-chat/${idea.slug}`)}
                data-testid={`card-chat-idea-${idea.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="mb-2">
                      {idea.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span>{idea.opportunityScore}/10</span>
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {idea.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {idea.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Target className="w-4 h-4" />
                      <span>{idea.market} Market</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/ai-chat/${idea.slug}`);
                      }}
                      data-testid={`button-chat-${idea.id}`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Don't see what you're looking for?
          </p>
          <Button 
            variant="outline" 
            onClick={() => setLocation('/database')}
            data-testid="button-browse-all"
          >
            Browse Full Database
          </Button>
        </div>
      </div>
    </div>
  );
}
