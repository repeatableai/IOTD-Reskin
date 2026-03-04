import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FailurePointRemoval {
  currentRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  mitigatedRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedRiskReduction: number;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface Perspective {
  perspectiveId: string;
  perspectiveName: string;
  criticLens: string;
  riskDomain: string;
  failureNarrative: string;
  rootCause: string;
  mitigationActions: string[];
  failurePointRemoval: FailurePointRemoval;
}

interface MitigationActionsTabProps {
  perspectives: Perspective[];
}

const RISK_LEVEL_PRIORITY = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

const RISK_LEVEL_CONFIG = {
  HIGH: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
    iconColor: 'text-red-500',
  },
  MEDIUM: {
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
    iconColor: 'text-amber-500',
  },
  LOW: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
    iconColor: 'text-green-500',
  },
};

export default function MitigationActionsTab({ perspectives }: MitigationActionsTabProps) {
  const { toast } = useToast();
  const [copiedAction, setCopiedAction] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());

  // Sort perspectives by risk level (HIGH first)
  const sortedPerspectives = [...perspectives].sort((a, b) => {
    return RISK_LEVEL_PRIORITY[a.failurePointRemoval.currentRiskLevel] -
           RISK_LEVEL_PRIORITY[b.failurePointRemoval.currentRiskLevel];
  });

  // Flatten all actions with metadata
  const allActions = sortedPerspectives.flatMap((perspective, pIndex) =>
    perspective.mitigationActions.map((action, aIndex) => ({
      id: `${perspective.perspectiveId}-${aIndex}`,
      action,
      perspectiveName: perspective.perspectiveName,
      riskLevel: perspective.failurePointRemoval.currentRiskLevel,
      riskReduction: perspective.failurePointRemoval.estimatedRiskReduction,
      riskDomain: perspective.riskDomain,
      priority: pIndex * 10 + aIndex,
    }))
  );

  const copyToClipboard = async (text: string, actionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAction(actionId);
      toast({
        title: "Copied to clipboard",
        description: "Mitigation action copied successfully",
      });
      setTimeout(() => setCopiedAction(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const copyAllActions = async () => {
    const allText = sortedPerspectives.map(p =>
      `## ${p.perspectiveName}\n` +
      p.mitigationActions.map((a, i) => `${i + 1}. ${a}`).join('\n')
    ).join('\n\n');

    try {
      await navigator.clipboard.writeText(allText);
      toast({
        title: "All actions copied",
        description: `${allActions.length} mitigation actions copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const toggleCompleted = (actionId: string) => {
    setCompletedActions(prev => {
      const next = new Set(prev);
      if (next.has(actionId)) {
        next.delete(actionId);
      } else {
        next.add(actionId);
      }
      return next;
    });
  };

  const completedCount = completedActions.size;
  const totalCount = allActions.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#1B2A4A]/10 bg-gradient-to-br from-emerald-50 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-emerald-600" />
              <div>
                <h3 className="text-lg font-semibold text-[#1B2A4A]">
                  Mitigation Actions
                </h3>
                <p className="text-sm text-[#1B2A4A]/60">
                  {totalCount} actionable steps across {perspectives.length} failure modes
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAllActions}
              className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="text-sm text-[#1B2A4A]/60 font-medium">
              {completedCount}/{totalCount} completed
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Action Blocks by Perspective */}
      {sortedPerspectives.map((perspective) => {
        const riskConfig = RISK_LEVEL_CONFIG[perspective.failurePointRemoval.currentRiskLevel];

        return (
          <Card key={perspective.perspectiveId} className="border-[#1B2A4A]/10">
            <CardContent className="pt-6">
              {/* Perspective Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${riskConfig.iconColor}`} />
                  <div>
                    <h4 className="font-semibold text-[#1B2A4A] text-sm">
                      {perspective.perspectiveName}
                    </h4>
                    <p className="text-xs text-[#1B2A4A]/60">
                      {perspective.criticLens}
                    </p>
                  </div>
                </div>
                <Badge className={`${riskConfig.bgColor} ${riskConfig.textColor} ${riskConfig.borderColor} border text-xs`}>
                  {perspective.failurePointRemoval.currentRiskLevel} RISK
                </Badge>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {perspective.mitigationActions.map((action, actionIndex) => {
                  const actionId = `${perspective.perspectiveId}-${actionIndex}`;
                  const isCompleted = completedActions.has(actionId);

                  return (
                    <div
                      key={actionIndex}
                      className={`flex items-start gap-3 rounded-lg p-4 transition-all ${
                        isCompleted
                          ? 'bg-emerald-50 border border-emerald-200'
                          : 'bg-gray-50 border border-transparent hover:border-gray-200'
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleCompleted(actionId)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-gray-300 hover:border-emerald-400'
                        }`}
                      >
                        {isCompleted && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </button>

                      {/* Action Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-mono leading-relaxed ${
                          isCompleted ? 'text-[#1B2A4A]/50 line-through' : 'text-[#1B2A4A]/80'
                        }`}>
                          {action}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {perspective.riskDomain}
                          </Badge>
                          <span className="text-xs text-green-600">
                            -{perspective.failurePointRemoval.estimatedRiskReduction}% risk
                          </span>
                        </div>
                      </div>

                      {/* Copy Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 flex-shrink-0"
                        onClick={() => copyToClipboard(action, actionId)}
                      >
                        {copiedAction === actionId ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-[#1B2A4A]/40" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Summary Stats */}
      <Card className="border-[#1B2A4A]/10 bg-[#F8F9FC]">
        <CardContent className="py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-red-600">
                {perspectives.filter(p => p.failurePointRemoval.currentRiskLevel === 'HIGH').length}
              </p>
              <p className="text-xs text-[#1B2A4A]/60">High Risk Areas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[#1B2A4A]">
                {totalCount}
              </p>
              <p className="text-xs text-[#1B2A4A]/60">Total Actions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">
                {completionPercentage}%
              </p>
              <p className="text-xs text-[#1B2A4A]/60">Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
