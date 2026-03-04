import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertTriangle, CheckCircle, TrendingUp, Building2 } from "lucide-react";
import { stripMarkdown } from "@/lib/utils";

interface ExecutiveSummaryTabProps {
  data: {
    overallScore: number;
    classification: 'HIGH_RISK' | 'MODERATE' | 'RESILIENT';
    executiveNarrative: string;
    archetypeClassification: 'CREATOR' | 'DISRUPTOR' | 'ENABLER' | 'ADAPTOR' | 'DISRUPTED';
  };
}

const CLASSIFICATION_CONFIG = {
  HIGH_RISK: {
    color: "bg-red-100 text-red-700 border-red-300",
    icon: AlertTriangle,
    label: "High Risk",
  },
  MODERATE: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: TrendingUp,
    label: "Moderate",
  },
  RESILIENT: {
    color: "bg-green-100 text-green-700 border-green-300",
    icon: CheckCircle,
    label: "Resilient",
  },
};

const ARCHETYPE_CONFIG = {
  CREATOR: { label: "Creator", description: "Building AI-native solutions" },
  DISRUPTOR: { label: "Disruptor", description: "Using AI to disrupt existing markets" },
  ENABLER: { label: "Enabler", description: "Providing AI infrastructure/tools" },
  ADAPTOR: { label: "Adaptor", description: "Successfully integrating AI into existing model" },
  DISRUPTED: { label: "Disrupted", description: "Business model fundamentally threatened by AI" },
};

function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
}

function getScoreRingColor(score: number): string {
  if (score >= 70) return "stroke-green-500";
  if (score >= 40) return "stroke-yellow-500";
  return "stroke-red-500";
}

export default function ExecutiveSummaryTab({ data }: ExecutiveSummaryTabProps) {
  const classConfig = CLASSIFICATION_CONFIG[data.classification];
  const ClassIcon = classConfig.icon;
  const archetypeConfig = ARCHETYPE_CONFIG[data.archetypeClassification];

  // SVG circle parameters for score ring
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.overallScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Ring */}
        <Card className="border-[#1B2A4A]/10">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  className={getScoreRingColor(data.overallScore)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(data.overallScore)}`}>
                  {data.overallScore}
                </span>
                <span className="text-xs text-[#1B2A4A]/60">/ 100</span>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-[#1B2A4A]">AI Resilience Score</p>
          </CardContent>
        </Card>

        {/* Classification */}
        <Card className="border-[#1B2A4A]/10">
          <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
            <div className={`w-16 h-16 rounded-full ${classConfig.color.split(' ')[0]} flex items-center justify-center mb-3`}>
              <ClassIcon className={`w-8 h-8 ${classConfig.color.split(' ')[1]}`} />
            </div>
            <Badge className={`${classConfig.color} border text-sm px-3 py-1`}>
              {classConfig.label}
            </Badge>
            <p className="mt-2 text-sm text-[#1B2A4A]/60 text-center">
              Risk Classification
            </p>
          </CardContent>
        </Card>

        {/* Archetype */}
        <Card className="border-[#1B2A4A]/10">
          <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full bg-[#1B2A4A]/5 flex items-center justify-center mb-3">
              <Building2 className="w-8 h-8 text-[#C5985E]" />
            </div>
            <Badge className="bg-[#1B2A4A] text-white border-[#1B2A4A] text-sm px-3 py-1">
              {archetypeConfig.label}
            </Badge>
            <p className="mt-2 text-sm text-[#1B2A4A]/60 text-center">
              {archetypeConfig.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Executive Narrative */}
      <Card className="border-[#1B2A4A]/10">
        <CardContent className="pt-6">
          <Accordion type="single" collapsible defaultValue="narrative">
            <AccordionItem value="narrative" className="border-none">
              <AccordionTrigger className="hover:no-underline py-0">
                <h3 className="text-lg font-semibold text-[#1B2A4A]">
                  Executive Summary
                </h3>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="prose prose-sm max-w-none text-[#1B2A4A]/80">
                  {stripMarkdown(data.executiveNarrative).split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
