import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface TopBarProps {
  title?: string;
  breadcrumbs?: Breadcrumb[];
  showAiBadge?: boolean;
  className?: string;
}

export function TopBar({
  title,
  breadcrumbs,
  showAiBadge = true,
  className,
}: TopBarProps) {
  return (
    <div
      className={cn(
        "h-[52px] flex items-center justify-between px-8 sticky top-0 z-50",
        className
      )}
      style={{
        background: 'rgba(250, 250, 250, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--ive-border, rgba(0,0,0,0.06))',
      }}
    >
      {/* Left side: Breadcrumbs / Title */}
      <div className="text-[13px] text-[var(--text-secondary,#71717A)]">
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="flex items-center gap-1">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center gap-1">
                {index > 0 && <span className="text-[var(--text-tertiary,#A1A1AA)]">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-[var(--text-primary,#18181B)] transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-[var(--text-primary,#18181B)]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : title ? (
          <span className="font-semibold text-[var(--text-primary,#18181B)]">{title}</span>
        ) : null}
      </div>

      {/* Right side: Badges */}
      <div className="flex items-center gap-3">
        {showAiBadge && (
          <div
            className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-md"
            style={{
              color: 'var(--ive-emerald, #059669)',
              background: 'var(--ive-emerald-soft, rgba(5,150,105,0.06))',
            }}
          >
            <span
              className="w-[5px] h-[5px] rounded-full animate-pulse"
              style={{ background: 'var(--ive-emerald, #059669)' }}
            />
            AI Connected
          </div>
        )}
        <div
          className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md"
          style={{
            color: 'var(--text-tertiary, #A1A1AA)',
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid var(--ive-border, rgba(0,0,0,0.06))',
          }}
        >
          Confidential
        </div>
      </div>
    </div>
  );
}

export default TopBar;
