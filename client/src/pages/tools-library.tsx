import Header from "@/components/Header";
import { Zap, ExternalLink, Search, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Tool } from "@shared/schema";

export default function ToolsLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { user } = useAuth();

  const { data: tools, isLoading } = useQuery<Tool[]>({
    queryKey: ["/api/tools", selectedCategory === "all" ? undefined : selectedCategory],
  });

  const { data: favoriteTools } = useQuery<Tool[]>({
    queryKey: ["/api/tools/favorites"],
    enabled: !!user,
  });

  const favoriteMutation = useMutation({
    mutationFn: (toolId: string) => apiRequest('POST', `/api/tools/${toolId}/favorite`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tools/favorites"] });
    },
  });

  const filteredTools = tools?.filter((tool) =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const isFavorite = (toolId: string) => {
    return favoriteTools?.some(fav => fav.id === toolId);
  };

  const categories = ["all", "Fundraising", "Finance", "Marketing", "Research", "Development", "Legal"];

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
            Curated tools and resources to help you build and launch faster
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search tools by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-tool-search"
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto mb-8">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-7">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  data-testid={`tab-${category.toLowerCase()}`}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {user && favoriteTools && favoriteTools.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              Your Favorites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isFavorite={true}
                  onFavoriteToggle={() => favoriteMutation.mutate(tool.id)}
                  isPending={favoriteMutation.isPending}
                  isAuthenticated={!!user}
                />
              ))}
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">
            {selectedCategory === "all" ? "All Tools" : `${selectedCategory} Tools`}
          </h2>
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading tools...
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No tools found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  isFavorite={isFavorite(tool.id)}
                  onFavoriteToggle={() => favoriteMutation.mutate(tool.id)}
                  isPending={favoriteMutation.isPending}
                  isAuthenticated={!!user}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ToolCardProps {
  tool: Tool;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  isPending: boolean;
  isAuthenticated: boolean;
}

function ToolCard({ tool, isFavorite, onFavoriteToggle, isPending, isAuthenticated }: ToolCardProps) {
  return (
    <div
      className="border rounded-lg p-6 hover:shadow-lg transition-shadow relative"
      data-testid={`card-tool-${tool.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            {tool.category}
          </span>
          {tool.isPremium && (
            <Badge variant="secondary" className="text-xs">
              PRO
            </Badge>
          )}
          {tool.isNew && (
            <Badge className="text-xs bg-green-500">
              <Sparkles className="w-3 h-3 mr-1" />
              New
            </Badge>
          )}
        </div>
        {isAuthenticated && (
          <button
            onClick={onFavoriteToggle}
            disabled={isPending}
            className="hover:scale-110 transition-transform"
            data-testid={`button-favorite-${tool.id}`}
          >
            <Star
              className={`w-5 h-5 ${
                isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
              }`}
            />
          </button>
        )}
      </div>
      <h3 className="font-semibold mb-2">{tool.name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
      {tool.tags && tool.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-muted px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        data-testid={`button-access-${tool.id}`}
      >
        Access Tool
        <ExternalLink className="w-4 h-4" />
      </Button>
    </div>
  );
}
