import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  label: string;
  sublabel?: string;
  compact?: boolean;
  className?: string;
}

export default function ScoreDisplay({ 
  score, 
  label, 
  sublabel, 
  compact = false, 
  className 
}: ScoreDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
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

  if (compact) {
    return (
      <div className={cn("text-center", className)} data-testid={`score-${label.toLowerCase()}`}>
        <div className={cn("text-lg font-bold", getScoreColor(score))}>
          {score}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
        {sublabel && (
          <div className="text-xs text-muted-foreground font-medium">
            {sublabel}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "text-center p-3 rounded-lg border",
      getScoreColor(score),
      className
    )} data-testid={`score-${label.toLowerCase()}`}>
      <div className="text-2xl font-bold">{score}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-xs font-medium">
        {sublabel || getScoreLabel(score)}
      </div>
    </div>
  );
}
