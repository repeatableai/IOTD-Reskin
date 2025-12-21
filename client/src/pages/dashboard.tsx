import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { 
  Database, 
  TrendingUp, 
  Users, 
  Sparkles, 
  Star, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  Bookmark, 
  Lightbulb,
  Bell,
  Settings,
  CreditCard,
  Play,
  ArrowRight,
  ChevronDown,
  User
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch user data
  const { data: createdIdeas } = useQuery({
    queryKey: ["/api/user/created-ideas"],
    queryFn: async () => {
      const response = await fetch("/api/user/created-ideas");
      if (!response.ok) throw new Error("Failed to fetch created ideas");
      return response.json();
    },
  });

  const { data: savedIdeas } = useQuery({
    queryKey: ["/api/users/saved-ideas"],
  });

  // Calculate metrics
  const researchedIdeas = savedIdeas?.length || 0;
  const generatedIdeas = createdIdeas?.length || 0;
  const businessProfileCompletion = 68; // Placeholder - would come from user profile

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Section */}
            <Card className="relative">
              <Badge className="absolute top-3 right-3 bg-purple-500 text-white border-0">
                Pro
              </Badge>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                    <span className="text-2xl font-semibold text-gray-600">
                      {user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-center mb-4">
                    <div className="font-bold text-lg">User</div>
                    <div className="text-sm text-muted-foreground">{user?.email || 'user@example.com'}</div>
                  </div>
                  <Input 
                    placeholder="Add your bio..." 
                    className="w-full mb-4"
                  />
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Business Profile</span>
                    <span className="text-muted-foreground">{businessProfileCompletion}%</span>
                  </div>
                  <Progress value={businessProfileCompletion} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Skills, interests & preferences for better idea recommendations.
                  </p>
                </div>
                
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Finish for Better Matches
                </Button>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button 
                  onClick={() => setLocation('/settings')}
                  className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-md transition-colors text-left"
                >
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <span>Manage Account</span>
                </button>
                <button 
                  onClick={() => setLocation('/billing')}
                  className="w-full flex items-center gap-3 p-2 hover:bg-muted rounded-md transition-colors text-left"
                >
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <span>Billing & Subscription</span>
                </button>
              </CardContent>
            </Card>

            {/* Upgrade Available */}
            <Card>
              <div className="bg-purple-100 px-4 py-2 rounded-t-lg">
                <span className="text-xs font-semibold text-purple-700">Upgrade Available</span>
              </div>
              <CardContent className="pt-4">
                <h3 className="text-xl font-bold mb-2">Empire</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Turn ideas into cash-flowing assets.
                </p>
                <ul className="space-y-2 mb-4">
                  {[
                    "Weekly coaching & consulting",
                    "Monthly AMAs with Greg",
                    "Vibe coding office hours",
                    "Builder network & community"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Star className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Join Empire <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Notifications</CardTitle>
                <button className="text-sm text-primary hover:underline">View All →</button>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    title: "Your research report for \"AI Financial Educa...\"",
                    message: "Your research report is ready! 🎉"
                  },
                  {
                    title: "Your Profile",
                    message: "Have you filled out your profile yet and tried a fo..."
                  },
                  {
                    title: "Welcome",
                    message: "Welcome! Take a tour of what's i..."
                  }
                ].map((notif, idx) => (
                  <div key={idx} className="flex gap-3 p-2 hover:bg-muted rounded-md cursor-pointer">
                    <Bell className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm line-clamp-1">{notif.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{notif.message}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <button className="text-sm text-primary hover:underline">View All →</button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Welcome Banner */}
            <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 text-white border-0">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <Star className="w-8 h-8 flex-shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">Welcome to Pro</h2>
                    <p className="text-blue-100 mb-6">
                      Click the button below for a complete platform guide and learn how to get the most out of your Pro membership.
                    </p>
                    <div className="flex gap-3">
                      <Button className="bg-white text-purple-600 hover:bg-gray-100">
                        <Play className="w-4 h-4 mr-2" />
                        Platform Guide
                      </Button>
                      <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                        Compare Plans
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Explore & Build */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Explore & Build</h2>
              
              {/* FIND IDEAS */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">FIND IDEAS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: Database,
                      iconColor: "text-blue-500",
                      title: "Idea Database",
                      description: "Fully-researched startup ideas with market analysis.",
                      route: "/database"
                    },
                    {
                      icon: TrendingUp,
                      iconColor: "text-green-500",
                      title: "Trends",
                      description: "See what's exploding before markets get saturated.",
                      route: "/trends"
                    },
                    {
                      icon: Users,
                      iconColor: "text-purple-500",
                      title: "Market Insights",
                      description: "Real problems from online communities.",
                      route: "/market-insights"
                    },
                    {
                      icon: Sparkles,
                      iconColor: "text-pink-500",
                      title: "Idea Generator",
                      description: "AI creates ideas matched to your skills & situation.",
                      route: "/idea-generator"
                    }
                  ].map((item, idx) => (
                    <Card 
                      key={idx} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setLocation(item.route)}
                    >
                      <CardContent className="p-5 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center ${item.iconColor}`}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* BUILD IDEAS - Collapsed */}
              <div className="mb-6">
                <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-semibold">BUILD IDEAS</h3>
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* RESOURCES & SUPPORT - Collapsed */}
              <div className="mb-6">
                <button className="w-full flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-gray-50 transition-colors">
                  <h3 className="text-lg font-semibold">RESOURCES & SUPPORT</h3>
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Your Workspace */}
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Workspace</h2>
              <p className="text-muted-foreground mb-4">
                Your ideas, chats, assessments, and saved content.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: Star,
                    iconColor: "text-purple-500",
                    bgColor: "bg-purple-50",
                    title: "My Researched Ideas",
                    value: researchedIdeas.toString()
                  },
                  {
                    icon: Star,
                    iconColor: "text-purple-500",
                    bgColor: "bg-purple-50",
                    title: "My Generated Ideas",
                    value: `${generatedIdeas}/100`
                  },
                  {
                    icon: Search,
                    iconColor: "text-green-500",
                    bgColor: "bg-green-50",
                    title: "My Market Insights",
                    value: "1"
                  },
                  {
                    icon: TrendingUp,
                    iconColor: "text-blue-500",
                    bgColor: "bg-blue-50",
                    title: "My Trends",
                    value: "1"
                  },
                  {
                    icon: MessageSquare,
                    iconColor: "text-blue-500",
                    bgColor: "bg-blue-50",
                    title: "My Chats",
                    value: "0/100"
                  },
                  {
                    icon: CheckCircle2,
                    iconColor: "text-green-500",
                    bgColor: "bg-green-50",
                    title: "My Assessments",
                    value: "1/365"
                  }
                ].map((item, idx) => (
                  <Card 
                    key={idx}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      if (item.title.includes("Researched")) setLocation("/my-ideas");
                      else if (item.title.includes("Generated")) setLocation("/my-ideas");
                      else if (item.title.includes("Market Insights")) setLocation("/market-insights");
                      else if (item.title.includes("Trends")) setLocation("/trends");
                      else if (item.title.includes("Chats")) setLocation("/ai-chat");
                      else if (item.title.includes("Assessments")) setLocation("/founder-fit");
                    }}
                  >
                    <CardContent className="p-5">
                      <div className={`w-12 h-12 rounded-lg ${item.bgColor} flex items-center justify-center mb-3`}>
                        <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                      </div>
                      <div className="font-semibold mb-1">{item.title}</div>
                      <div className="text-2xl font-bold">{item.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">My Claimed Ideas</div>
                        <a href="#" className="text-sm text-primary hover:underline">Learn More</a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center">
                        <Bookmark className="w-5 h-5 text-pink-500" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">My Saved Ideas</div>
                        <div className="text-2xl font-bold">{savedIdeas?.length || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
