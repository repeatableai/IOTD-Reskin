import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Shield, Skull } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SeveritySummaryTabProps {
  compositeSeverityScore: number;
  severityTier: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MANAGEABLE';
  executiveSummary: string;
  perspectivesConfidenceRating: 'HIGH' | 'MEDIUM' | 'LOW';
  perspectiveCount: number;
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    color: '#E11D48',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    badgeClass: 'bg-red-600 text-white',
    description: 'Multiple existential threats requiring immediate action',
  },
  HIGH: {
    color: '#D97706',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    badgeClass: 'bg-amber-500 text-white',
    description: 'Significant risks that need to be addressed soon',
  },
  MODERATE: {
    color: '#6D5AE6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    badgeClass: 'bg-purple-500 text-white',
    description: 'Manageable risks with proper planning',
  },
  MANAGEABLE: {
    color: '#059669',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    badgeClass: 'bg-emerald-500 text-white',
    description: 'Standard business challenges, low concern',
  },
};

const CONFIDENCE_CONFIG = {
  HIGH: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'High confidence - comprehensive venture data available',
  },
  MEDIUM: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Medium confidence - some data gaps in analysis',
  },
  LOW: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Low confidence - limited venture data available',
  },
};

export default function SeveritySummaryTab({
  compositeSeverityScore,
  severityTier,
  executiveSummary,
  perspectivesConfidenceRating,
  perspectiveCount,
}: SeveritySummaryTabProps) {
  const severityConfig = SEVERITY_CONFIG[severityTier];
  const confidenceConfig = CONFIDENCE_CONFIG[perspectivesConfidenceRating];

  // Calculate circumference for circular progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (compositeSeverityScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Score Display */}
      <Card className={`${severityConfig.borderColor} border-2 ${severityConfig.bgColor}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-8">
            {/* Circular Score */}
            <div className="relative flex-shrink-0">
              <svg className="w-40 h-40 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-gray-200"
                />
                {/* Progress circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={severityConfig.color}
                  strokeWidth="10"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Score text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-4xl font-bold"
                  style={{ color: severityConfig.color }}
                >
                  {compositeSeverityScore}
                </span>
                <span className="text-sm text-[#1B2A4A]/60">/ 100</span>
              </div>
            </div>

            {/* Severity Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`${severityConfig.badgeClass} text-lg px-4 py-1`}>
                  {severityTier}
                </Badge>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge className={`${confidenceConfig.bgColor} ${confidenceConfig.color} border-none`}>
                        {perspectivesConfidenceRating} Confidence
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">{confidenceConfig.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <p className={`text-sm ${severityConfig.textColor} mb-4`}>
                {severityConfig.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-[#1B2A4A]/60">
                <div className="flex items-center gap-1">
                  <Skull className="w-4 h-4" />
                  <span>{perspectiveCount} failure modes analyzed</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card className="border-[#1B2A4A]/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#1B2A4A] flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1B2A4A]">
                Executive Summary
              </h3>
              <p className="text-sm text-[#1B2A4A]/60">
                Key findings from pre-mortem analysis
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            {executiveSummary.split('. ').map((sentence, idx) => (
              <p key={idx} className="text-[#1B2A4A]/80 mb-2 last:mb-0">
                {sentence.trim()}{sentence.trim().endsWith('.') ? '' : '.'}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Severity Scale Legend */}
      <Card className="border-[#1B2A4A]/10">
        <CardContent className="pt-6">
          <h4 className="text-sm font-semibold text-[#1B2A4A] mb-4">Severity Scale</h4>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(SEVERITY_CONFIG).map(([tier, config]) => (
              <div
                key={tier}
                className={`p-3 rounded-lg ${config.bgColor} ${config.borderColor} border ${
                  tier === severityTier ? 'ring-2 ring-offset-2' : 'opacity-70'
                }`}
                style={tier === severityTier ? { '--tw-ring-color': config.color } as React.CSSProperties : undefined}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className={`text-xs font-semibold ${config.textColor}`}>
                    {tier}
                  </span>
                </div>
                <p className="text-xs text-[#1B2A4A]/60">
                  {tier === 'CRITICAL' && '75-100'}
                  {tier === 'HIGH' && '50-74'}
                  {tier === 'MODERATE' && '25-49'}
                  {tier === 'MANAGEABLE' && '0-24'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-xs text-[#1B2A4A]/50 px-2">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          This analysis is AI-generated based on available venture data. Actual outcomes may vary.
          Use as one input among many in your decision-making process.
        </p>
      </div>
    </div>
  );
}
