import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Menu, 
  ChevronDown, 
  Calendar,
  Database,
  Trophy,
  TrendingUp,
  Users,
  MessageSquare,
  Wrench,
  Target,
  Play,
  FileText,
  Zap,
  HelpCircle,
  Mail,
  Info,
  Sparkles,
  CreditCard,
  User
} from "lucide-react";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <div className="text-3xl font-bold infinity-logo">∞</div>
            <span className="text-2xl font-bold text-foreground">Ai</span>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {/* Browse Ideas Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-primary hover:text-primary hover:bg-primary/10"
                  data-testid="dropdown-browse-ideas"
                >
                  Browse Solutions
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[600px] p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">Solution Discovery</h3>
                    <div className="space-y-4">
                      <button
                        onClick={() => setLocation('/')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-idea-of-day"
                      >
                        <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Solution of the Day</div>
                          <div className="text-sm text-muted-foreground">Get daily curated startup solutions tailored to current trends</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setLocation('/database')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-database"
                      >
                        <Database className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Solution Database</div>
                          <div className="text-sm text-muted-foreground">Explore 400+ validated business opportunities with research</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setLocation('/database?sort=popular')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-leaderboard"
                      >
                        <Trophy className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Solution Leaderboard</div>
                          <div className="text-sm text-muted-foreground">Most popular solutions right now</div>
                        </div>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">Market Intelligence</h3>
                    <div className="space-y-4">
                      <button
                        onClick={() => setLocation('/trends')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-trends"
                      >
                        <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Trends</div>
                          <div className="text-sm text-muted-foreground">Discover emerging market categories and opportunities</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setLocation('/market-insights')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-market-insights"
                      >
                        <Users className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Market Insights</div>
                          <div className="text-sm text-muted-foreground">Uncover hidden opportunities from online communities</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost"
                  className="hover:bg-muted"
                  data-testid="dropdown-tools"
                >
                  Tools
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[600px] p-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">Research & Build Your Solutions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setLocation('/research')}
                    className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                    data-testid="link-research"
                  >
                    <Search className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold inline-flex items-center gap-2">
                        Research Your Apps 
                        <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">PRO</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Get comprehensive research reports in 24 hours</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setLocation('/founder-fit')}
                    className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                    data-testid="link-founder-fit"
                  >
                    <Target className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold inline-flex items-center gap-2">
                        Founder Fit
                        <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">Starter</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Discover which solutions match your skills</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setLocation('/idea-builder')}
                    className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                    data-testid="link-idea-builder"
                  >
                    <Wrench className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold inline-flex items-center gap-2">
                        Solution Builder
                        <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">PRO</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Transform research into actionable build plans</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setLocation('/ai-chat')}
                    className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                    data-testid="link-chat-strategize"
                  >
                    <MessageSquare className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold inline-flex items-center gap-2">
                        Chat & Strategize
                        <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">PRO</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Dive deep into any opportunity with AI</div>
                    </div>
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost"
                  className="hover:bg-muted"
                  data-testid="dropdown-more"
                >
                  More
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[700px] p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">Resources</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setLocation('/tour')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-tour"
                      >
                        <Play className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Platform Tour</div>
                          <div className="text-sm text-muted-foreground">Watch 2-minute walkthrough video</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setLocation('/features')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-features"
                      >
                        <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Explore Features</div>
                          <div className="text-sm text-muted-foreground">Discover all platform capabilities</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setLocation('/tools-library')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-tools-library"
                      >
                        <Zap className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Tools Library</div>
                          <div className="text-sm text-muted-foreground">Startup tools and resources</div>
                        </div>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">Company</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setLocation('/whats-new')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-whats-new"
                      >
                        <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">What's New</div>
                          <div className="text-sm text-muted-foreground">Latest features and improvements</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setLocation('/about')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-about"
                      >
                        <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">About</div>
                          <div className="text-sm text-muted-foreground">Learn about our mission and team</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setLocation('/faq')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-faq"
                      >
                        <HelpCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">FAQ</div>
                          <div className="text-sm text-muted-foreground">Common questions answered</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setLocation('/contact')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-contact"
                      >
                        <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Contact & Support</div>
                          <div className="text-sm text-muted-foreground">Get help from our team</div>
                        </div>
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-4">Your Starter Features</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setLocation('/plan-details')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-plan-details"
                      >
                        <FileText className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Your Plan Details</div>
                          <div className="text-sm text-muted-foreground">See what's included and what you can upgrade to</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setLocation('/pricing')}
                        className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                        data-testid="link-upgrade"
                      >
                        <CreditCard className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">Upgrade Plans</div>
                          <div className="text-sm text-muted-foreground">Unlock more powerful features</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" data-testid="button-search">
              <Search className="w-5 h-5" />
            </Button>
            
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2" data-testid="button-user-menu">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{(user as any)?.firstName || 'User'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <button
                    onClick={() => setLocation('/home')}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors"
                    data-testid="link-dashboard"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setLocation('/create-idea')}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors"
                    data-testid="link-create-idea"
                  >
                    Create Solution
                  </button>
                  <div className="border-t my-2"></div>
                  <button
                    onClick={() => window.location.href = '/api/logout'}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors text-destructive"
                    data-testid="button-logout"
                  >
                    Log Out
                  </button>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                Get Started
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="md:hidden" data-testid="button-mobile-menu">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
