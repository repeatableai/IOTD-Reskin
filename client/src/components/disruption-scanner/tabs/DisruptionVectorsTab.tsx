import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { Cpu, Brain, Target, Users, DollarSign, AlertCircle } from "lucide-react";
import { stripMarkdown } from "@/lib/utils";

interface DisruptionVector {
  id: string;
  name: string;
  score: number;
  analysis: string;
  namedThreats: Array<{
    name: string;
    description: string;
    fundingData: string;
    threatLevel: 'critical' | 'high' | 'medium' | 'low';
  }>;
}

interface DisruptionVectorsTabProps {
  data: DisruptionVector[];
}

const VECTOR_ICONS: Record<string, any> = {
  process_automation: Cpu,
  knowledge_commoditization: Brain,
  decision_intelligence: Target,
  customer_disintermediation: Users,
  cost_structure: DollarSign,
};

const THREAT_LEVEL_CONFIG = {
  critical: { color: "bg-red-100 text-red-700 border-red-300", label: "Critical" },
  high: { color: "bg-orange-100 text-orange-700 border-orange-300", label: "High" },
  medium: { color: "bg-yellow-100 text-yellow-700 border-yellow-300", label: "Medium" },
  low: { color: "bg-green-100 text-green-700 border-green-300", label: "Low" },
};

function getScoreColor(score: number): string {
  if (score >= 70) return "text-red-600";
  if (score >= 40) return "text-yellow-600";
  return "text-green-600";
}

function getProgressColor(score: number): string {
  if (score >= 70) return "bg-red-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-green-500";
}

export default function DisruptionVectorsTab({ data }: DisruptionVectorsTabProps) {
  // Sort by score descending (highest threat first)
  const sortedVectors = [...data].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="bg-[#F8F9FC] border border-[#1B2A4A]/10 rounded-lg p-4">
        <p className="text-sm text-[#1B2A4A]/70">
          The 5 AI Disruption Vectors measure vulnerability across key business dimensions.
          Higher scores indicate greater exposure to AI-driven disruption.
        </p>
      </div>

      {/* Vector Cards */}
      <div className="space-y-4">
        {sortedVectors.map((vector, index) => {
          const Icon = VECTOR_ICONS[vector.id] || AlertCircle;

          return (
            <Card key={vector.id} className="border-[#1B2A4A]/10">
              <CardContent className="pt-6">
                <Accordion type="single" collapsible>
                  <AccordionItem value={vector.id} className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0">
                      <div className="flex items-center gap-4 w-full pr-4">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-lg bg-[#1B2A4A]/5 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-[#C5985E]" />
                        </div>

                        {/* Name and Score */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-[#1B2A4A] text-left">
                              {vector.name}
                            </h4>
                            <span className={`text-xl font-bold ${getScoreColor(vector.score)}`}>
                              {vector.score}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(vector.score)}`}
                              style={{ width: `${vector.score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-4">
                      {/* Analysis */}
                      <div className="mb-4 pl-16">
                        <p className="text-sm text-[#1B2A4A]/80">
                          {stripMarkdown(vector.analysis)}
                        </p>
                      </div>

                      {/* Named Threats */}
                      {vector.namedThreats && vector.namedThreats.length > 0 && (
                        <div className="pl-16 space-y-3">
                          <h5 className="text-sm font-semibold text-[#1B2A4A]">
                            Named Threats
                          </h5>
                          {vector.namedThreats.map((threat, threatIndex) => (
                            <div
                              key={threatIndex}
                              className="bg-[#F8F9FC] border border-[#1B2A4A]/10 rounded-lg p-3"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="font-medium text-[#1B2A4A]">
                                  {stripMarkdown(threat.name)}
                                </span>
                                <Badge
                                  className={`${THREAT_LEVEL_CONFIG[threat.threatLevel].color} border text-xs`}
                                >
                                  {THREAT_LEVEL_CONFIG[threat.threatLevel].label}
                                </Badge>
                              </div>
                              <p className="text-sm text-[#1B2A4A]/70 mb-1">
                                {stripMarkdown(threat.description)}
                              </p>
                              {threat.fundingData && (
                                <p className="text-xs text-[#C5985E] font-medium">
                                  {stripMarkdown(threat.fundingData)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
