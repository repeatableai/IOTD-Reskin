import * as React from "react";
import { ArrowRight, LucideIcon } from "lucide-react";
import { GlassCard, ModuleColor } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: ModuleColor;
  onClick?: () => void;
  className?: string;
}

const colorStyles: Record<ModuleColor, { bg: string; text: string }> = {
  purple: {
    bg: "bg-purple-500/20",
    text: "text-purple-600",
  },
  blue: {
    bg: "bg-blue-500/20",
    text: "text-blue-600",
  },
  green: {
    bg: "bg-green-500/20",
    text: "text-green-600",
  },
  orange: {
    bg: "bg-orange-500/20",
    text: "text-orange-600",
  },
  red: {
    bg: "bg-red-500/20",
    text: "text-red-600",
  },
  cyan: {
    bg: "bg-cyan-500/20",
    text: "text-cyan-600",
  },
};

const ModuleCard: React.FC<ModuleCardProps> = ({
  icon: Icon,
  title,
  description,
  color,
  onClick,
  className,
}) => {
  const styles = colorStyles[color];

  return (
    <GlassCard
      moduleColor={color}
      onClick={onClick}
      className={cn(
        "p-6 cursor-pointer transition-all duration-200 ease-out",
        "hover:translate-y-[-2px] hover:shadow-lg",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full",
              styles.bg
            )}
          >
            <Icon className={cn("w-6 h-6", styles.text)} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400" />
      </div>
    </GlassCard>
  );
};

export { ModuleCard };
export type { ModuleCardProps };
