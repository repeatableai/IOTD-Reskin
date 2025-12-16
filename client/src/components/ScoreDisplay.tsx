import { cn } from "@/lib/utils";
import ScoreDetailDialog, { ScoreType } from "./ScoreDetailDialog";

interface ScoreDisplayProps {
  score: number;
  label: string;
  sublabel?: string;
  compact?: boolean;
  className?: string;
  // New props for interactivity
  interactive?: boolean;
  scoreType?: ScoreType;
  ideaSlug?: string;
}

export default function ScoreDisplay({ 
  score, 
  label, 
  sublabel, 
  compact = false, 
  className,
  interactive = false,
  scoreType,
  ideaSlug,
}: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800';
    if (score >= 6) return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:border-yellow-800';
    return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/50 dark:border-orange-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Exceptional';
    if (score >= 8) return 'Very High';
    if (score >= 7) return 'High';
    if (score >= 6) return 'Good';
    if (score >= 5) return 'Moderate';
    if (score >= 4) return 'Fair';
    return 'Challenging';
  };

  const scoreContent = compact ? (
    <div 
      className={cn(
        "text-center transition-all",
        interactive && "cursor-pointer hover:scale-105 hover:shadow-md rounded-lg p-2",
        className
      )} 
      data-testid={`score-${label.toLowerCase()}`}
    >
      <div className={cn(
        "text-lg font-bold px-2 py-1 rounded",
        getScoreColor(score)
      )}>
        {score}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
      {sublabel && (
        <div className="text-xs text-muted-foreground font-medium">
          {sublabel}
        </div>
      )}
    </div>
  ) : (
    <div 
      className={cn(
        "text-center p-4 rounded-lg border transition-all",
        getScoreColor(score),
        interactive && "cursor-pointer hover:scale-[1.02] hover:shadow-lg",
        className
      )} 
      data-testid={`score-${label.toLowerCase()}`}
    >
      <div className="text-3xl font-bold">{score}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      <div className="text-xs opacity-80">
        {sublabel || getScoreLabel(score)}
      </div>
      {interactive && (
        <div className="text-xs mt-2 opacity-60 flex items-center justify-center gap-1">
          <span>Click for details</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );

  // If interactive and we have the required props, wrap in ScoreDetailDialog
  if (interactive && scoreType && ideaSlug) {
    return (
      <ScoreDetailDialog
        score={score}
        scoreType={scoreType}
        ideaSlug={ideaSlug}
        sublabel={sublabel}
      >
        {scoreContent}
      </ScoreDetailDialog>
    );
  }

  return scoreContent;
}
