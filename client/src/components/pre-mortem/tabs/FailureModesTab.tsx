import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, AlertTriangle, Shield, Target } from "lucide-react";

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

interface FailureModesTabProps {
  perspectives: Perspective[];
  onSelectPerspective: (perspectiveId: string) => void;
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

const DOMAIN_ICONS: Record<string, typeof AlertTriangle> = {
  market: Target,
  execution: AlertTriangle,
  financial: AlertTriangle,
  regulatory: Shield,
  competitive: Target,
  team: AlertTriangle,
};

const DOMAIN_COLORS: Record<string, string> = {
  market: 'bg-blue-500',
  execution: 'bg-purple-500',
  financial: 'bg-emerald-500',
  regulatory: 'bg-amber-500',
  competitive: 'bg-red-500',
  team: 'bg-pink-500',
};

export default function FailureModesTab({ perspectives, onSelectPerspective }: FailureModesTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#1B2A4A]/10 bg-[#1B2A4A]">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Failure Modes Overview
              </h3>
              <p className="text-sm text-white/60">
                {perspectives.length} critical failure perspectives identified
              </p>
            </div>
          </div>
          <p className="text-sm text-white/70">
            Click any card to view the full narrative and mitigation strategies.
          </p>
        </CardContent>
      </Card>

      {/* Failure Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {perspectives.map((perspective) => {
          const currentRiskConfig = RISK_LEVEL_CONFIG[perspective.failurePointRemoval.currentRiskLevel];
          const mitigatedRiskConfig = RISK_LEVEL_CONFIG[perspective.failurePointRemoval.mitigatedRiskLevel];
          const DomainIcon = DOMAIN_ICONS[perspective.riskDomain] || AlertTriangle;
          const domainColor = DOMAIN_COLORS[perspective.riskDomain] || 'bg-gray-500';

          // Truncate first mitigation to 80 chars
          const firstMitigation = perspective.mitigationActions[0] || '';
          const truncatedMitigation = firstMitigation.length > 80
            ? `${firstMitigation.substring(0, 77)}...`
            : firstMitigation;

          return (
            <Card
              key={perspective.perspectiveId}
              className="border-[#1B2A4A]/10 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onSelectPerspective(perspective.perspectiveId)}
            >
              <CardContent className="pt-6">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${domainColor} flex items-center justify-center flex-shrink-0`}>
                    <DomainIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#1B2A4A] text-sm mb-1 line-clamp-2">
                      {perspective.perspectiveName}
                    </h4>
                    <p className="text-xs text-[#1B2A4A]/60">
                      {perspective.criticLens}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#1B2A4A]/30 group-hover:text-red-500 flex-shrink-0 transition-colors" />
                </div>

                {/* Risk Domain Badge */}
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs capitalize">
                    {perspective.riskDomain} Risk
                  </Badge>
                </div>

                {/* Risk Level Before/After */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`${currentRiskConfig.bgColor} ${currentRiskConfig.textColor} ${currentRiskConfig.borderColor} border text-xs`}>
                    {perspective.failurePointRemoval.currentRiskLevel}
                  </Badge>
                  <span className="text-xs text-[#1B2A4A]/40">→</span>
                  <Badge className={`${mitigatedRiskConfig.bgColor} ${mitigatedRiskConfig.textColor} ${mitigatedRiskConfig.borderColor} border text-xs`}>
                    {perspective.failurePointRemoval.mitigatedRiskLevel}
                  </Badge>
                </div>

                {/* Risk Reduction Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-[#1B2A4A]/60 mb-1">
                    <span>Risk Reduction Potential</span>
                    <span className="font-medium text-green-600">
                      -{perspective.failurePointRemoval.estimatedRiskReduction}%
                    </span>
                  </div>
                  <Progress
                    value={perspective.failurePointRemoval.estimatedRiskReduction}
                    className="h-2 bg-red-100"
                  />
                </div>

                {/* First Mitigation Teaser */}
                <div className="bg-[#F8F9FC] rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-[#1B2A4A]/70">
                      {truncatedMitigation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Domain Legend */}
      <Card className="border-[#1B2A4A]/10">
        <CardContent className="py-4">
          <h4 className="text-sm font-semibold text-[#1B2A4A] mb-3">Risk Domains</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(DOMAIN_COLORS).map(([domain, color]) => (
              <div key={domain} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-xs text-[#1B2A4A]/70 capitalize">{domain}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
