import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight,
  Users,
  TrendingUp,
  MessageSquare,
  Video,
  ExternalLink,
  ThumbsUp,
  Eye
} from "lucide-react";
import { SiReddit, SiFacebook, SiYoutube } from "react-icons/si";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";

export default function CommunitySignalsDetail() {
  const { slug } = useParams();
  const [, navigate] = useLocation();

  if (!slug) {
    return <NotFound />;
  }

  const { data: idea, isLoading } = useQuery<any>({
    queryKey: ['/api/ideas', slug],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="community-signals-page">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!idea) {
    return <NotFound />;
  }

  // Extract community signals data or use placeholder
  const signals = (idea.communitySignals && typeof idea.communitySignals === 'object' && 'platforms' in idea.communitySignals) 
    ? idea.communitySignals 
    : {
    overallScore: 8.5,
    totalCommunities: 47,
    totalMembers: 2450000,
    platforms: {
      reddit: {
        score: 9,
        communities: [
          { name: "r/SideProject", members: 185000, engagement: "High", url: "https://reddit.com/r/SideProject", posts30d: 245 },
          { name: "r/Entrepreneur", members: 1200000, engagement: "Medium", url: "https://reddit.com/r/Entrepreneur", posts30d: 890 },
          { name: "r/startups", members: 950000, engagement: "High", url: "https://reddit.com/r/startups", posts30d: 430 },
          { name: "r/SaaS", members: 95000, engagement: "Very High", url: "https://reddit.com/r/SaaS", posts30d: 180 }
        ],
        totalMembers: 2430000,
        insights: "Strong presence across entrepreneurship and tech subreddits. High engagement rates indicate active problem discussion."
      },
      facebook: {
        score: 7,
        communities: [
          { name: "Startup Founders Network", members: 125000, engagement: "Medium", url: "#", posts30d: 320 },
          { name: "SaaS Entrepreneurs", members: 89000, engagement: "High", url: "#", posts30d: 210 },
          { name: "Digital Product Creators", members: 67000, engagement: "Medium", url: "#", posts30d: 150 }
        ],
        totalMembers: 281000,
        insights: "Active discussion in business-focused groups. Members frequently seek solutions for productivity and workflow problems."
      },
      youtube: {
        score: 8,
        channels: [
          { name: "Y Combinator", subscribers: 450000, engagement: "High", views30d: 2500000 },
          { name: "MicroConf", subscribers: 85000, engagement: "Very High", views30d: 450000 },
          { name: "Indie Hackers", subscribers: 120000, engagement: "High", views30d: 680000 }
        ],
        totalSubscribers: 655000,
        insights: "Strong interest in startup content. Viewers actively searching for business ideas and validation advice."
      }
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid="community-signals-page">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button 
            onClick={() => navigate('/database')} 
            className="hover:text-foreground"
            data-testid="breadcrumb-database"
          >
            Database
          </button>
          <span>/</span>
          <button 
            onClick={() => navigate(`/idea/${slug}`)} 
            className="hover:text-foreground"
            data-testid="breadcrumb-idea"
          >
            {idea.title}
          </button>
          <span>/</span>
          <span className="text-foreground">Community Signals</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-3">Social Validation</Badge>
          <h1 className="text-4xl font-bold mb-3" data-testid="text-page-title">
            Community Signals
          </h1>
          <p className="text-xl text-muted-foreground">
            {idea.title}
          </p>
          <p className="text-muted-foreground mt-4">
            Discover where your target audience is already gathering online. These communities 
            represent validated demand and provide direct access to potential customers.
          </p>
        </div>

        {/* Overview Stats */}
        <Card className="mb-8" data-testid="card-overview">
          <CardHeader>
            <CardTitle>Community Overview</CardTitle>
            <CardDescription>
              Total reach across all platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-1">{signals.overallScore}/10</div>
                <div className="text-sm text-muted-foreground">Signal Strength</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{signals.totalCommunities}</div>
                <div className="text-sm text-muted-foreground">Active Communities</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-1">{(signals.totalMembers / 1000000).toFixed(1)}M+</div>
                <div className="text-sm text-muted-foreground">Total Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Tabs */}
        <Tabs defaultValue="reddit" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reddit" data-testid="tab-reddit">
              <SiReddit className="w-4 h-4 mr-2" />
              Reddit
            </TabsTrigger>
            <TabsTrigger value="facebook" data-testid="tab-facebook">
              <SiFacebook className="w-4 h-4 mr-2" />
              Facebook
            </TabsTrigger>
            <TabsTrigger value="youtube" data-testid="tab-youtube">
              <SiYoutube className="w-4 h-4 mr-2" />
              YouTube
            </TabsTrigger>
          </TabsList>

          {/* Reddit Tab */}
          <TabsContent value="reddit" data-testid="content-reddit">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Reddit Communities</CardTitle>
                    <CardDescription>
                      {signals.platforms.reddit.totalMembers.toLocaleString()} total members across {signals.platforms.reddit.communities.length} subreddits
                    </CardDescription>
                  </div>
                  <Badge className="text-lg">Score: {signals.platforms.reddit.score}/10</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{signals.platforms.reddit.insights}</p>
                </div>
                <div className="space-y-3">
                  {signals.platforms.reddit.communities.map((community: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`reddit-community-${i}`}>
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{community.name}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {community.members.toLocaleString()} members
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {community.posts30d} posts/30d
                          </span>
                          <Badge variant="outline">{community.engagement}</Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={community.url} target="_blank" rel="noopener noreferrer" data-testid={`link-reddit-${i}`}>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facebook Tab */}
          <TabsContent value="facebook" data-testid="content-facebook">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Facebook Groups</CardTitle>
                    <CardDescription>
                      {signals.platforms.facebook.totalMembers.toLocaleString()} total members across {signals.platforms.facebook.communities.length} groups
                    </CardDescription>
                  </div>
                  <Badge className="text-lg">Score: {signals.platforms.facebook.score}/10</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{signals.platforms.facebook.insights}</p>
                </div>
                <div className="space-y-3">
                  {signals.platforms.facebook.communities.map((community: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`facebook-group-${i}`}>
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{community.name}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {community.members.toLocaleString()} members
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {community.posts30d} posts/30d
                          </span>
                          <Badge variant="outline">{community.engagement}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* YouTube Tab */}
          <TabsContent value="youtube" data-testid="content-youtube">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>YouTube Channels</CardTitle>
                    <CardDescription>
                      {signals.platforms.youtube.totalSubscribers.toLocaleString()} total subscribers across {signals.platforms.youtube.channels.length} channels
                    </CardDescription>
                  </div>
                  <Badge className="text-lg">Score: {signals.platforms.youtube.score}/10</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">{signals.platforms.youtube.insights}</p>
                </div>
                <div className="space-y-3">
                  {signals.platforms.youtube.channels.map((channel: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`youtube-channel-${i}`}>
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{channel.name}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {channel.subscribers.toLocaleString()} subscribers
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {(channel.views30d / 1000000).toFixed(1)}M views/30d
                          </span>
                          <Badge variant="outline">{channel.engagement}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/idea/${slug}`)}
            data-testid="button-back"
          >
            Back to Overview
          </Button>
          <Button 
            onClick={() => navigate(`/idea/${slug}/founder-fit`)}
            data-testid="button-founder-fit"
          >
            Founder Fit Analysis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
