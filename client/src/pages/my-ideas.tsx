import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { 
  Flag, 
  Bookmark, 
  ThumbsUp, 
  Rocket, 
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
  Target,
  Sparkles
} from "lucide-react";

interface Idea {
  id: string;
  title: string;
  slug: string;
  description: string;
  market: string;
  type: string;
  opportunityScore: number;
  claimedAt?: string;
  claimProgress?: number;
}

export default function MyIdeas() {
  const { isAuthenticated, user } = useAuth();

  // Fetch claimed ideas
  const { data: claimedIdeas = [], isLoading: claimedLoading } = useQuery<Idea[]>({
    queryKey: ['/api/user/claimed-ideas'],
    enabled: isAuthenticated,
  });

  // Fetch saved ideas
  const { data: savedIdeas = [], isLoading: savedLoading } = useQuery<Idea[]>({
    queryKey: ['/api/users/saved-ideas'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-2xl font-bold mb-4">Sign in to view your ideas</h1>
            <p className="text-muted-foreground mb-8">
              Track your claimed ideas, saved favorites, and build progress all in one place.
            </p>
            <Button asChild size="lg">
              <Link href="/api/login">Sign In</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Ideas</h1>
          <p className="text-muted-foreground">
            Track your progress, saved ideas, and building journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-violet-200 dark:border-violet-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-violet-500/20 rounded-xl">
                  <Flag className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{claimedIdeas.length}</p>
                  <p className="text-sm text-muted-foreground">Claimed Ideas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <Bookmark className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{savedIdeas.length}</p>
                  <p className="text-sm text-muted-foreground">Saved Ideas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Rocket className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {claimedIdeas.filter(i => (i.claimProgress || 0) >= 100).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="claimed" className="space-y-6">
          <TabsList>
            <TabsTrigger value="claimed" className="gap-2">
              <Flag className="w-4 h-4" />
              Claimed ({claimedIdeas.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Bookmark className="w-4 h-4" />
              Saved ({savedIdeas.length})
            </TabsTrigger>
          </TabsList>

          {/* Claimed Ideas Tab */}
          <TabsContent value="claimed">
            {claimedLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : claimedIdeas.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Flag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No claimed ideas yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Claim an idea to start building and track your progress publicly.
                  </p>
                  <Button asChild>
                    <Link href="/database">Browse Ideas</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {claimedIdeas.map((idea) => (
                  <Card key={idea.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Link href={`/idea/${idea.slug}`}>
                            <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer">
                              {idea.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {idea.description}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-3">
                            <Badge variant="outline">{idea.market}</Badge>
                            <Badge variant="outline">{idea.type}</Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Target className="w-4 h-4" />
                              {idea.opportunityScore}/10
                            </div>
                          </div>
                          
                          {/* Progress */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{idea.claimProgress || 0}%</span>
                            </div>
                            <Progress value={idea.claimProgress || 0} className="h-2" />
                          </div>
                          
                          {idea.claimedAt && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Claimed {new Date(idea.claimedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/idea/${idea.slug}`}>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Saved Ideas Tab */}
          <TabsContent value="saved">
            {savedLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : savedIdeas.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No saved ideas yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Save ideas you're interested in to review them later.
                  </p>
                  <Button asChild>
                    <Link href="/database">Browse Ideas</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {savedIdeas.map((idea) => (
                  <Card key={idea.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <Link href={`/idea/${idea.slug}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors cursor-pointer">
                          {idea.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {idea.description}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <Badge variant="outline">{idea.market}</Badge>
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          {idea.opportunityScore}/10
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/idea/${idea.slug}`}>
                            View Details
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

