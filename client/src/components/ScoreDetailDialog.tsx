import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Minus, Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { OpportunityScoreDetail } from "../../../server/externalDataService";

interface ScoreDetailDialogProps {
  scoreType: 'opportunity' | 'problem' | 'feasibility' | 'timing' | 'execution' | 'gtm';
  score: number;
  label: string;
  ideaContext?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const scoreTypeLabels: Record<string, string> = {
  opportunity: 'Opportunity Score',
  problem: 'Problem Score',
  feasibility: 'Feasibility Score',
  timing: 'Timing Score',
  execution: 'Execution Score',
  gtm: 'Go-to-Market Score'
};

export function ScoreDetailDialog({
  scoreType,
  score,
  label,
  ideaContext,
  open,
  onOpenChange
}: ScoreDetailDialogProps) {
  const { data: details, isLoading } = useQuery<OpportunityScoreDetail>({
    queryKey: ['/api/external/score-details', scoreType, score, ideaContext],
    queryFn: async () => {
      const params = new URLSearchParams({
        score: score.toString(),
        ...(ideaContext ? { context: ideaContext } : {})
      });
      const response = await fetch(`/api/external/score-details/${scoreType}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch score details');
      return response.json();
    },
    enabled: open
  });

  const getImpactIcon = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'neutral':
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-score-detail">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {scoreTypeLabels[scoreType]}
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown and analysis
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading score analysis...
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Score Display */}
            <div className="border rounded-lg p-6 text-center bg-muted/30">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(details.score)}`} data-testid="text-score-value">
                {details.score}/10
              </div>
              <div className="text-lg font-semibold" data-testid="text-score-label">{details.label}</div>
            </div>

            {/* Explanation */}
            <div>
              <h3 className="text-lg font-semibold mb-3">What This Score Means</h3>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-score-explanation">
                {details.explanation}
              </p>
            </div>

            {/* Contributing Factors */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contributing Factors</h3>
              <div className="space-y-3">
                {details.factors.map((factor, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    data-testid={`card-factor-${index}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getImpactIcon(factor.impact)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{factor.name}</div>
                        <div className="text-sm text-muted-foreground">{factor.description}</div>
                      </div>
                      <Badge
                        variant={
                          factor.impact === 'positive' ? 'default' :
                          factor.impact === 'negative' ? 'destructive' :
                          'secondary'
                        }
                        data-testid={`badge-impact-${index}`}
                      >
                        {factor.impact}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How It's Calculated */}
            <div>
              <h3 className="text-lg font-semibold mb-3">How This Score Is Calculated</h3>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-calculation">
                {details.calculation}
              </p>
            </div>

            {/* Improvement Tips */}
            {details.improvementTips && details.improvementTips.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Ways to Improve This Score
                </h3>
                <ul className="space-y-2">
                  {details.improvementTips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                      data-testid={`tip-${index}`}
                    >
                      <span className="text-primary mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            No score details available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
