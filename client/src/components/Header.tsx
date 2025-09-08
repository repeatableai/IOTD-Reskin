import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Search, Menu } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
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
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/database" 
              className={`text-muted-foreground hover:text-foreground transition-colors ${
                location.startsWith('/database') ? 'text-foreground font-medium' : ''
              }`}
              data-testid="link-database"
            >
              Database
            </Link>
            <Link 
              href="/top-ideas" 
              className={`text-muted-foreground hover:text-foreground transition-colors ${
                location.startsWith('/top-ideas') ? 'text-foreground font-medium' : ''
              }`}
              data-testid="link-top-ideas"
            >
              Top Ideas
            </Link>
            <Link 
              href="/features" 
              className={`text-muted-foreground hover:text-foreground transition-colors ${
                location.startsWith('/features') ? 'text-foreground font-medium' : ''
              }`}
              data-testid="link-features"
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className={`text-muted-foreground hover:text-foreground transition-colors ${
                location.startsWith('/pricing') ? 'text-foreground font-medium' : ''
              }`}
              data-testid="link-pricing"
            >
              Pricing
            </Link>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" data-testid="button-search">
              <Search className="w-5 h-5" />
            </Button>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground hidden sm:inline" data-testid="text-user-greeting">
                  Hi, {(user as any)?.firstName || 'User'}!
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="button-logout"
                >
                  Log Out
                </Button>
              </div>
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
