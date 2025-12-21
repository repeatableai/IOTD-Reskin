import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  User,
  X,
  ArrowRight,
  Home,
  Award,
  LogOut
} from "lucide-react";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const navigateTo = (path: string) => {
    setShowMobileMenu(false);
    setLocation(path);
  };

  // Focus input when search opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearch(false);
      setLocation(`/database?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const quickSearches = [
    { label: "AI Tools", query: "AI" },
    { label: "SaaS Ideas", query: "SaaS" },
    { label: "B2B Solutions", query: "B2B" },
    { label: "Mobile Apps", query: "mobile app" },
    { label: "Healthcare", query: "health" },
    { label: "Fintech", query: "finance" },
  ];

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
                          <div className="font-semibold">Featured Business Plan</div>
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
                          <div className="font-semibold">Business Incubator</div>
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
                          <div className="font-semibold">Business Leaderboard</div>
                          <div className="text-sm text-muted-foreground">Most looked at start-ups</div>
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
                  <button
                    onClick={() => setLocation('/collaboration')}
                    className="flex items-start gap-3 text-left w-full hover:bg-muted/50 p-2 rounded-md transition-colors"
                    data-testid="link-collaboration-portal"
                  >
                    <Users className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold inline-flex items-center gap-2">
                        Collaboration Portal
                        <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">PRO</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Collaborate with team members on solutions</div>
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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSearch(true)}
              className="gap-2"
              data-testid="button-search"
            >
              <Search className="w-5 h-5" />
              <span className="hidden lg:inline text-muted-foreground text-xs">⌘K</span>
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
                    onClick={() => setLocation('/dashboard')}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors"
                    data-testid="link-dashboard"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setLocation('/my-ideas')}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors"
                    data-testid="link-my-ideas"
                  >
                    My Ideas
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
            
            {/* Mobile Menu */}
            <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <div className="text-2xl font-bold infinity-logo">∞</div>
                    <span className="text-xl font-bold">Ai</span>
                  </SheetTitle>
                </SheetHeader>

                {/* User Section */}
                {isAuthenticated && (
                  <div className="mb-6 pb-4 border-b">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{(user as any)?.firstName || 'User'}</p>
                        <p className="text-sm text-muted-foreground">Welcome back!</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigateTo('/home')} className="justify-start">
                        <Home className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => navigateTo('/my-ideas')} className="justify-start">
                        <Award className="w-4 h-4 mr-2" />
                        My Ideas
                      </Button>
                    </div>
                  </div>
                )}

                {/* Navigation Accordion */}
                <Accordion type="multiple" className="w-full">
                  {/* Browse Solutions */}
                  <AccordionItem value="browse">
                    <AccordionTrigger className="text-base font-semibold">
                      Browse Solutions
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        <button
                          onClick={() => navigateTo('/')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>Featured Business Plan</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/database')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Database className="w-4 h-4 text-muted-foreground" />
                          <span>Business Incubator</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/database?sort=popular')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Trophy className="w-4 h-4 text-muted-foreground" />
                          <span>Business Leaderboard</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/trends')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          <span>Trends</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/market-insights')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>Market Insights</span>
                        </button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Tools */}
                  <AccordionItem value="tools">
                    <AccordionTrigger className="text-base font-semibold">
                      Tools
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        <button
                          onClick={() => navigateTo('/research')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Search className="w-4 h-4 text-muted-foreground" />
                          <span>Research Your Apps</span>
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded ml-auto">PRO</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/founder-fit')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span>Founder Fit</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/idea-builder')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Wrench className="w-4 h-4 text-muted-foreground" />
                          <span>Solution Builder</span>
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded ml-auto">PRO</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/ai-chat')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <span>Chat & Strategize</span>
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded ml-auto">PRO</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/collaboration')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>Collaboration Portal</span>
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded ml-auto">PRO</span>
                        </button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Resources */}
                  <AccordionItem value="resources">
                    <AccordionTrigger className="text-base font-semibold">
                      Resources
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        <button
                          onClick={() => navigateTo('/tour')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Play className="w-4 h-4 text-muted-foreground" />
                          <span>Platform Tour</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/features')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span>Explore Features</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/tools-library')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Zap className="w-4 h-4 text-muted-foreground" />
                          <span>Tools Library</span>
                        </button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Company */}
                  <AccordionItem value="company">
                    <AccordionTrigger className="text-base font-semibold">
                      Company
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        <button
                          onClick={() => navigateTo('/whats-new')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Sparkles className="w-4 h-4 text-muted-foreground" />
                          <span>What's New</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/about')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Info className="w-4 h-4 text-muted-foreground" />
                          <span>About</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/faq')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          <span>FAQ</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/contact')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>Contact & Support</span>
                        </button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Plans */}
                  <AccordionItem value="plans">
                    <AccordionTrigger className="text-base font-semibold">
                      Plans & Pricing
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-2">
                        <button
                          onClick={() => navigateTo('/plan-details')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span>Your Plan Details</span>
                        </button>
                        <button
                          onClick={() => navigateTo('/pricing')}
                          className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-muted transition-colors text-left"
                        >
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span>Upgrade Plans</span>
                        </button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t space-y-3">
                  {isAuthenticated ? (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigateTo('/create-idea')}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Solution
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={() => {
                          setShowMobileMenu(false);
                          window.location.href = '/api/logout';
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setShowMobileMenu(false);
                        window.location.href = '/api/login';
                      }}
                    >
                      Get Started
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-lg font-semibold">Search Solutions</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSearch} className="px-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search by keyword, industry, or technology..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-12 text-lg"
                data-testid="input-global-search"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </form>

          <div className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-3">Quick searches:</p>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((item) => (
                <Button
                  key={item.query}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowSearch(false);
                    setLocation(`/database?search=${encodeURIComponent(item.query)}`);
                  }}
                  className="text-sm"
                >
                  {item.label}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t bg-muted/50 px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">↵</kbd>
                to search
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">esc</kbd>
                to close
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSearch(false);
                setLocation('/database');
              }}
              className="text-xs h-auto py-1"
            >
              Browse all solutions
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
