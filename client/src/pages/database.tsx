import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import IdeaCard from "@/components/IdeaCard";
import IdeaFilters from "@/components/IdeaFilters";
import { Button } from "@/components/ui/button";
import type { IdeaFilters as IdeaFiltersType } from "@shared/schema";

export default function Database() {
  const [filters, setFilters] = useState<IdeaFiltersType>({
    sortBy: 'newest',
    limit: 20,
    offset: 0,
  });

  const { data: result, isLoading, error } = useQuery({
    queryKey: ["/api/ideas", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      const response = await fetch(`/api/ideas?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ideas');
      }
      return response.json();
    },
  });

  const handleFiltersChange = (newFilters: Partial<IdeaFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }));
  };

  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, offset: prev.offset + prev.limit }));
  };

  return (
    <div className="min-h-screen bg-background" data-testid="database-page">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">The Idea Database</h1>
          <p className="text-muted-foreground">Dive into deep research and analysis on 400+ business ideas</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <IdeaFilters filters={filters} onFiltersChange={handleFiltersChange} />
          </div>
          
          {/* Ideas Grid */}
          <div className="lg:w-3/4">
            {error ? (
              <div className="text-center py-12">
                <p className="text-destructive">Failed to load ideas. Please try again.</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => window.location.reload()}
                  data-testid="button-retry"
                >
                  Retry
                </Button>
              </div>
            ) : isLoading && filters.offset === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <div className="h-48 bg-muted"></div>
                      <div className="p-6">
                        <div className="flex gap-2 mb-3">
                          <div className="h-6 w-16 bg-muted rounded"></div>
                          <div className="h-6 w-20 bg-muted rounded"></div>
                        </div>
                        <div className="h-6 bg-muted rounded mb-2"></div>
                        <div className="h-16 bg-muted rounded mb-4"></div>
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex gap-2">
                            {[...Array(3)].map((_, j) => (
                              <div key={j} className="text-center">
                                <div className="h-6 w-6 bg-muted rounded mb-1"></div>
                                <div className="h-3 w-12 bg-muted rounded"></div>
                              </div>
                            ))}
                          </div>
                          <div className="text-right">
                            <div className="h-4 w-16 bg-muted rounded mb-1"></div>
                            <div className="h-3 w-12 bg-muted rounded"></div>
                          </div>
                        </div>
                        <div className="h-8 bg-muted rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : result?.ideas && result.ideas.length > 0 ? (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-muted-foreground" data-testid="text-results-count">
                    Showing {filters.offset + 1}-{Math.min(filters.offset + filters.limit, result.total)} of {result.total} ideas
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.ideas.map((idea) => (
                    <IdeaCard key={idea.id} idea={idea} />
                  ))}
                </div>
                
                {result.total > filters.offset + filters.limit && (
                  <div className="text-center mt-12">
                    <Button 
                      onClick={handleLoadMore} 
                      disabled={isLoading}
                      data-testid="button-load-more"
                    >
                      {isLoading ? 'Loading...' : 'Load More Ideas'}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No ideas found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ sortBy: 'newest', limit: 20, offset: 0 })}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
