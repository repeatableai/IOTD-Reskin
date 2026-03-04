import { useState } from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Breadcrumb[];
  showSidebar?: boolean;
}

export function AppLayout({
  children,
  title,
  breadcrumbs,
  showSidebar = true,
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Full-width layout without sidebar (for landing page, login, etc.)
  if (!showSidebar) {
    return (
      <div className="min-h-screen">
        <main className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--ive-bg, #FAFAFA)' }}>
      {/* Atmospheric background gradients */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: '-30%',
          right: '-20%',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(109,90,230,0.04) 0%, transparent 60%)',
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          bottom: '-20%',
          left: '10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(5,150,105,0.03) 0%, transparent 60%)',
        }}
      />

      {/* Desktop Sidebar - Fixed position, hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Hamburger Menu */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                'p-2 rounded-md',
                'bg-white shadow-md',
                'hover:bg-gray-100',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
              )}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[252px]">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-col min-h-screen relative z-[1]',
          'md:ml-[252px]' // Margin for sidebar on desktop
        )}
      >
        {/* TopBar */}
        <TopBar title={title} breadcrumbs={breadcrumbs} />

        {/* Scrollable Content Area */}
        <main className="flex-1">
          <div className="max-w-[1080px] mx-auto px-8 py-8 pb-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
