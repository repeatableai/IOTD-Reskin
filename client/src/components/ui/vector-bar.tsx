import * as React from "react";
import { cn } from "@/lib/utils";

type VectorBarColor = "purple" | "blue" | "green" | "orange";

interface VectorBarProps {
  value: number;
  label?: string;
  color?: VectorBarColor;
  showValue?: boolean;
  className?: string;
}

const colorGradients: Record<VectorBarColor, string> = {
  purple: "linear-gradient(90deg, rgba(139, 92, 246, 0.6) 0%, var(--module-purple, #8B5CF6) 100%)",
  blue: "linear-gradient(90deg, rgba(59, 130, 246, 0.6) 0%, var(--module-blue, #3B82F6) 100%)",
  green: "linear-gradient(90deg, rgba(34, 197, 94, 0.6) 0%, var(--module-green, #22C55E) 100%)",
  orange: "linear-gradient(90deg, rgba(245, 158, 11, 0.6) 0%, var(--module-orange, #F59E0B) 100%)",
};

export function VectorBar({
  value,
  label,
  color = "purple",
  showValue = false,
  className,
}: VectorBarProps) {
  const [mounted, setMounted] = React.useState(false);
  const clampedValue = Math.min(100, Math.max(0, value));

  React.useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground/80">{label}</span>
          {showValue && (
            <span className="text-sm font-semibold text-foreground">
              {clampedValue}%
            </span>
          )}
        </div>
      )}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/50">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: mounted ? `${clampedValue}%` : "0%",
            background: colorGradients[color],
          }}
        />
      </div>
      {!label && showValue && (
        <div className="flex justify-end">
          <span className="text-sm font-semibold text-foreground">
            {clampedValue}%
          </span>
        </div>
      )}
    </div>
  );
}

export type { VectorBarProps, VectorBarColor };
