import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, XCircle, Shield, AlertTriangle } from "lucide-react";
import { stripMarkdown } from "@/lib/utils";

interface MoatPillar {
  name: string;
  holds: boolean;
  durabilityScore: number;
  evidence: string;
  aiVulnerable: boolean;
}

interface MoatAssessment {
  overallMoatRating: 'strong' | 'moderate' | 'weak' | 'eroding';
  holdingCount: number;
  pillars: MoatPillar[];
}

interface MoatDurabilityTabProps {
  data: MoatAssessment;
}

const RATING_CONFIG = {
  strong: {
    color: "bg-green-100 text-green-700 border-green-300",
    label: "Strong Moat",
    description: "Competitive advantages are durable and AI-resistant",
  },
  moderate: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    label: "Moderate Moat",
    description: "Some competitive advantages, but with vulnerabilities",
  },
  weak: {
    color: "bg-orange-100 text-orange-700 border-orange-300",
    label: "Weak Moat",
    description: "Limited competitive protection against AI disruption",
  },
  eroding: {
    color: "bg-red-100 text-red-700 border-red-300",
    label: "Eroding Moat",
    description: "Competitive advantages actively being undermined by AI",
  },
};

function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

export default function MoatDurabilityTab({ data }: MoatDurabilityTabProps) {
  const ratingConfig = RATING_CONFIG[data.overallMoatRating];

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <Card className="border-[#1B2A4A]/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-[#C5985E]" />
              <div>
                <h3 className="text-lg font-semibold text-[#1B2A4A]">
                  Helfert 5-Pillar Moat Assessment
                </h3>
                <p className="text-sm text-[#1B2A4A]/60">
                  {ratingConfig.description}
                </p>
              </div>
            </div>
            <Badge className={`${ratingConfig.color} border text-sm px-3 py-1`}>
              {ratingConfig.label}
            </Badge>
          </div>

          {/* Holding Count */}
          <div className="flex items-center gap-2 bg-[#F8F9FC] rounded-lg p-3">
            <span className="text-[#1B2A4A]/70">Pillars Holding:</span>
            <span className="font-bold text-[#1B2A4A]">
              {data.holdingCount} of {data.pillars.length}
            </span>
            <div className="flex gap-1 ml-2">
              {data.pillars.map((pillar, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    pillar.holds ? "bg-green-500" : "bg-red-500"
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pillars */}
      <div className="space-y-3">
        {data.pillars.map((pillar, index) => (
          <Card key={index} className="border-[#1B2A4A]/10">
            <CardContent className="pt-4 pb-4">
              <Accordion type="single" collapsible>
                <AccordionItem value={`pillar-${index}`} className="border-none">
                  <AccordionTrigger className="hover:no-underline py-0">
                    <div className="flex items-center gap-4 w-full pr-4">
                      {/* Status Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          pillar.holds
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {pillar.holds ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>

                      {/* Name and Status */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-[#1B2A4A]">
                            {pillar.name}
                          </h4>
                          {pillar.aiVulnerable && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-orange-50 text-orange-600 border-orange-300"
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              AI Vulnerable
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#1B2A4A]/60">
                          {pillar.holds ? "Holding" : "Compromised"}
                        </p>
                      </div>

                      {/* Durability Score */}
                      <div className="text-right">
                        <span className={`text-xl font-bold ${getScoreColor(pillar.durabilityScore)}`}>
                          {pillar.durabilityScore}
                        </span>
                        <p className="text-xs text-[#1B2A4A]/50">Durability</p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-4 pl-14">
                    <div className="bg-[#F8F9FC] border border-[#1B2A4A]/10 rounded-lg p-4">
                      <h5 className="text-sm font-semibold text-[#1B2A4A] mb-2">
                        Evidence
                      </h5>
                      <p className="text-sm text-[#1B2A4A]/70">
                        {stripMarkdown(pillar.evidence)}
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
