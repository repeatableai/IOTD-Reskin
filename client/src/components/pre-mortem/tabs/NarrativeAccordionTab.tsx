import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Copy, Check, Shield, Skull, ArrowRight } from "lucide-react";
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

interface NarrativeAccordionTabProps {
  perspectives: Perspective[];
  defaultOpenId?: string;
}

const RISK_LEVEL_CONFIG = {
  HIGH: {
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
  },
  MEDIUM: {
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-300',
  },
  LOW: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
  },
};

export default function NarrativeAccordionTab({ perspectives, defaultOpenId }: NarrativeAccordionTabProps) {
  const { toast } = useToast();
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#1B2A4A]/10 bg-gradient-to-br from-red-50 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <Skull className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-[#1B2A4A]">
                Failure Narratives
              </h3>
              <p className="text-sm text-[#1B2A4A]/60">
                Detailed past-tense failure stories from investor perspectives
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Narratives Accordion */}
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpenId || perspectives[0]?.perspectiveId}
        className="space-y-4"
      >
        {perspectives.map((perspective, index) => {
          const currentRiskConfig = RISK_LEVEL_CONFIG[perspective.failurePointRemoval.currentRiskLevel];
          const mitigatedRiskConfig = RISK_LEVEL_CONFIG[perspective.failurePointRemoval.mitigatedRiskLevel];

          return (
            <AccordionItem
              key={perspective.perspectiveId}
              value={perspective.perspectiveId}
              className="border rounded-lg bg-white shadow-sm"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-4 w-full pr-4 text-left">
                  <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#1B2A4A] mb-1">
                      {perspective.perspectiveName}
                    </h4>
                    <p className="text-sm text-[#1B2A4A]/60">
                      {perspective.criticLens}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`${currentRiskConfig.bgColor} ${currentRiskConfig.textColor} text-xs`}>
                      {perspective.failurePointRemoval.currentRiskLevel}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-6 pb-6">
                <div className="space-y-6">
                  {/* Block 1: How We Failed (Red) */}
                  <div className="border-l-4 border-red-500 pl-4">
                    <h5 className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-3">
                      How We Failed
                    </h5>
                    <div className="prose prose-sm max-w-none">
                      {perspective.failureNarrative.split('\n').map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-[#1B2A4A]/80 mb-3 last:mb-0 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Block 2: Root Cause (Amber) */}
                  <div className="border-l-4 border-amber-500 pl-4 bg-amber-50/50 py-3 pr-4 rounded-r-lg">
                    <h5 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-2">
                      Root Cause
                    </h5>
                    <p className="text-sm text-[#1B2A4A]/80">
                      {perspective.rootCause}
                    </p>
                  </div>

                  {/* Block 3: Mitigation Actions (Emerald) */}
                  <div className="border-l-4 border-emerald-500 pl-4">
                    <h5 className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-3">
                      Mitigation Actions
                    </h5>
                    <div className="space-y-2">
                      {perspective.mitigationActions.map((action, actionIndex) => {
                        const actionId = `${perspective.perspectiveId}-${actionIndex}`;
                        return (
                          <div
                            key={actionIndex}
                            className="flex items-start gap-3 bg-gray-50 rounded-lg p-3 group"
                          >
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <Shield className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <p className="flex-1 text-sm font-mono text-[#1B2A4A]/80 leading-relaxed">
                              {action}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(action, actionId)}
                            >
                              {copiedAction === actionId ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-[#1B2A4A]/40" />
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Block 4: Before/After Risk */}
                  <div className="bg-[#F8F9FC] rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-[#1B2A4A] mb-4">
                      Risk Reduction Impact
                    </h5>
                    <div className="flex items-center gap-4">
                      {/* Before */}
                      <div className="flex-1">
                        <p className="text-xs text-[#1B2A4A]/60 mb-2">Before Mitigation</p>
                        <Badge className={`${currentRiskConfig.bgColor} ${currentRiskConfig.textColor} ${currentRiskConfig.borderColor} border text-sm px-3 py-1`}>
                          {perspective.failurePointRemoval.currentRiskLevel} RISK
                        </Badge>
                      </div>

                      {/* Arrow */}
                      <div className="flex flex-col items-center">
                        <ArrowRight className="w-6 h-6 text-green-500" />
                        <span className="text-xs text-green-600 font-medium mt-1">
                          -{perspective.failurePointRemoval.estimatedRiskReduction}%
                        </span>
                      </div>

                      {/* After */}
                      <div className="flex-1 text-right">
                        <p className="text-xs text-[#1B2A4A]/60 mb-2">After Mitigation</p>
                        <Badge className={`${mitigatedRiskConfig.bgColor} ${mitigatedRiskConfig.textColor} ${mitigatedRiskConfig.borderColor} border text-sm px-3 py-1`}>
                          {perspective.failurePointRemoval.mitigatedRiskLevel} RISK
                        </Badge>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-[#1B2A4A]/60 mb-1">
                        <span>Estimated Risk Reduction</span>
                        <span className="text-green-600 font-medium">
                          {perspective.failurePointRemoval.estimatedRiskReduction}%
                        </span>
                      </div>
                      <Progress
                        value={perspective.failurePointRemoval.estimatedRiskReduction}
                        className="h-2 bg-red-100"
                      />
                    </div>

                    {/* Confidence */}
                    <div className="mt-3 text-xs text-[#1B2A4A]/50">
                      Analysis confidence: {perspective.failurePointRemoval.confidenceLevel}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
