import * as React from "react";
import { cn } from "@/lib/utils";

type ModuleColor = "purple" | "blue" | "green" | "orange" | "red" | "cyan";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  moduleColor?: ModuleColor;
  children?: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, moduleColor, children, style, ...props }, ref) => {
    const moduleColorClass = moduleColor ? `module-border-${moduleColor}` : "";

    return (
      <div
        ref={ref}
        className={cn("glass-card", moduleColorClass, className)}
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "rgba(255, 255, 255, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "16px",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
export type { GlassCardProps, ModuleColor };
