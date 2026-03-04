import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  dotColor?: 'rose' | 'purple' | 'gold' | 'green' | 'amber' | 'blue';
  icon?: React.ReactNode;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Intelligence",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5"/>
          </svg>
        )
      },
      { label: "Idea Database", path: "/database", dotColor: "rose" },
      { label: "Score Analysis", path: "/score-analysis", dotColor: "purple" },
      { label: "Execution Plans", path: "/execution-plan", dotColor: "gold" },
    ],
  },
  {
    label: "Frameworks",
    items: [
      { label: "Value Equation", path: "/value-equation", dotColor: "green" },
      { label: "Market Insights", path: "/market-insights", dotColor: "amber" },
      { label: "Trends", path: "/trends", dotColor: "blue" },
    ],
  },
  {
    label: "Build",
    items: [
      { label: "Idea Generator", path: "/idea-generator", dotColor: "purple" },
      { label: "Solution Builder", path: "/idea-builder", dotColor: "green" },
      { label: "AI Chat", path: "/ai-chat", dotColor: "blue" },
    ],
  },
  {
    label: "VC Modules",
    items: [
      {
        label: "Venture OS",
        path: "/venture-os",
        dotColor: "gold",
        icon: <Layers className="w-4 h-4" />,
      },
    ],
  },
];

const dotColors: Record<string, string> = {
  rose: 'bg-[#E11D48]',
  purple: 'bg-[#6D5AE6]',
  gold: 'bg-[#B8860B]',
  green: 'bg-[#059669]',
  amber: 'bg-[#D97706]',
  blue: 'bg-[#3B82F6]',
};

export function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <aside
      className="flex flex-col h-screen w-[252px] fixed left-0 top-0 z-[100]"
      style={{
        backgroundColor: "var(--sidebar-bg, #111113)",
        borderRight: "1px solid rgba(255, 255, 255, 0.04)",
      }}
    >
      {/* Brand */}
      <div className="p-5 pb-4" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-sm"
            style={{ background: "linear-gradient(135deg, #6D5AE6, #8B5CF6)" }}
          >
            IVE
          </div>
          <div>
            <div className="text-[15px] font-bold text-[#FAFAFA] tracking-tight">
              Venture Engine <span className="text-[#A1A1AA] font-normal text-[13px] ml-1">v1.0</span>
            </div>
          </div>
        </Link>
        <div className="text-[11px] text-white/30 mt-1.5 tracking-wide">by Repeatable.ai</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navSections.map((section) => (
          <div key={section.label} className="mb-1">
            <div className="px-3 py-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/20">
              {section.label}
            </div>
            {section.items.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 mb-px",
                  isActive(item.path)
                    ? "text-[#FAFAFA] bg-[rgba(109,90,230,0.15)]"
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
                )}
              >
                {item.icon ? (
                  <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>
                ) : item.dotColor ? (
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColors[item.dotColor])} />
                ) : null}
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
        <div className="text-[11px] text-white/20">
          <a href="https://repeatable.ai" className="text-white/35 hover:text-white/50 transition-colors">
            repeatable.ai
          </a>
          {" · "}
          <span>Enterprise Preview</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
