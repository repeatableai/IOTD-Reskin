import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  value: string | number;
  label: string;
  trend?: number;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
  onClick?: () => void;
}

export function StatsCard({
  value,
  label,
  trend,
  icon: Icon,
  iconColor = "text-primary",
  className,
  onClick,
}: StatsCardProps) {
  const isPositiveTrend = trend !== undefined && trend >= 0;
  const isNegativeTrend = trend !== undefined && trend < 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card rounded-xl p-6 backdrop-blur-md bg-white/70 border border-white/20 shadow-lg",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-mono-data text-3xl font-bold tracking-tight">
            {value}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>

          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 mt-2 text-sm font-medium",
                isPositiveTrend && "text-green-500",
                isNegativeTrend && "text-red-500"
              )}
            >
              {isPositiveTrend ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>
                {isPositiveTrend ? "+" : ""}
                {trend}%
              </span>
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full bg-opacity-20",
              iconColor.includes("bg-") ? iconColor : `bg-${iconColor}/20`
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6",
                iconColor.includes("text-") ? iconColor : `text-${iconColor}`
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
