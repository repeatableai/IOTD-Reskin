import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertTriangle, Target, Shield, Bomb } from "lucide-react";
import { stripMarkdown } from "@/lib/utils";

interface Torpedo {
  title: string;
  narrative: string;
  probability: 'high' | 'medium' | 'low';
  severity: 'catastrophic' | 'severe' | 'moderate';
  mitigant: string;
}

interface TorpedoAnalysis {
  torpedoes: Torpedo[];
  cascadeWarning: string;
}

interface TorpedoAnalysisTabProps {
  data: TorpedoAnalysis;
}

const PROBABILITY_CONFIG = {
  high: { color: "bg-red-100 text-red-700 border-red-300", label: "High Probability" },
  medium: { color: "bg-yellow-100 text-yellow-700 border-yellow-300", label: "Medium Probability" },
  low: { color: "bg-green-100 text-green-700 border-green-300", label: "Low Probability" },
};

const SEVERITY_CONFIG = {
  catastrophic: { color: "bg-red-600 text-white", label: "Catastrophic" },
  severe: { color: "bg-orange-500 text-white", label: "Severe" },
  moderate: { color: "bg-yellow-500 text-white", label: "Moderate" },
};

function getTorpedoIcon(severity: string) {
  switch (severity) {
    case 'catastrophic':
      return Bomb;
    case 'severe':
      return AlertTriangle;
    default:
      return Target;
  }
}

export default function TorpedoAnalysisTab({ data }: TorpedoAnalysisTabProps) {
  // Sort by severity (catastrophic first) then probability (high first)
  const severityOrder = { catastrophic: 0, severe: 1, moderate: 2 };
  const probabilityOrder = { high: 0, medium: 1, low: 2 };

  const sortedTorpedoes = [...data.torpedoes].sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return probabilityOrder[a.probability] - probabilityOrder[b.probability];
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#1B2A4A]/10 bg-[#1B2A4A]">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <Bomb className="w-8 h-8 text-[#C5985E]" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Torpedo Analysis
              </h3>
              <p className="text-sm text-white/60">
                Premortem failure modes and mitigants
              </p>
            </div>
          </div>
          <p className="text-sm text-white/70">
            {data.torpedoes.length} potential failure scenarios identified through premortem analysis.
          </p>
        </CardContent>
      </Card>

      {/* Torpedo Cards */}
      <div className="space-y-4">
        {sortedTorpedoes.map((torpedo, index) => {
          const probabilityConfig = PROBABILITY_CONFIG[torpedo.probability];
          const severityConfig = SEVERITY_CONFIG[torpedo.severity];
          const TorpedoIcon = getTorpedoIcon(torpedo.severity);

          return (
            <Card key={index} className="border-[#1B2A4A]/10">
              <CardContent className="pt-6">
                <Accordion type="single" collapsible>
                  <AccordionItem value={`torpedo-${index}`} className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0">
                      <div className="flex items-center gap-4 w-full pr-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-lg ${severityConfig.color.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                          <TorpedoIcon className="w-6 h-6 text-white" />
                        </div>

                        {/* Title and Badges */}
                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="font-semibold text-[#1B2A4A] mb-1">
                            {torpedo.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge className={`${severityConfig.color} text-xs`}>
                              {severityConfig.label}
                            </Badge>
                            <Badge className={`${probabilityConfig.color} border text-xs`}>
                              {probabilityConfig.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-4">
                      <div className="pl-16 space-y-4">
                        {/* Narrative */}
                        <div className="prose prose-sm max-w-none">
                          {stripMarkdown(torpedo.narrative).split('\n').map((paragraph, pIndex) => (
                            <p key={pIndex} className="text-sm text-[#1B2A4A]/80 mb-3 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                        </div>

                        {/* Mitigant */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">
                                Mitigant Strategy
                              </p>
                              <p className="text-sm text-green-800">
                                {stripMarkdown(torpedo.mitigant)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cascade Warning */}
      {data.cascadeWarning && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">
                  Cascade Risk Warning
                </h4>
                <p className="text-sm text-orange-700">
                  {stripMarkdown(data.cascadeWarning)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
