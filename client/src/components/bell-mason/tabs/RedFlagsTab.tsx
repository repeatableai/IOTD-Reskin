import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Clock,
  DollarSign,
  ArrowRight,
} from "lucide-react";

interface RedFlag {
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  affectedDimensions: string[];
  recommendation: string;
  timeline: string;
  estimatedBudget?: string;
}

interface RedFlagsTabProps {
  redFlags: RedFlag[];
}

// Severity configuration
const SEVERITY_CONFIG = {
  CRITICAL: {
    icon: AlertOctagon,
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    label: 'Critical',
  },
  HIGH: {
    icon: AlertTriangle,
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    label: 'High',
  },
  MEDIUM: {
    icon: AlertCircle,
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    label: 'Medium',
  },
};

// Dimension display names
const DIMENSION_LABELS: Record<string, string> = {
  technology: 'Technology',
  product: 'Product',
  manufacturing: 'Manufacturing',
  businessPlan: 'Business Plan',
  marketing: 'Marketing',
  sales: 'Sales',
  ceo: 'CEO',
  team: 'Team',
  board: 'Board',
  cash: 'Cash',
  fundability: 'Fundability',
  control: 'Control',
};

export default function RedFlagsTab({ redFlags }: RedFlagsTabProps) {
  // Sort by severity (CRITICAL first, then HIGH, then MEDIUM)
  const sortedFlags = [...redFlags].sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
    return order[a.severity] - order[b.severity];
  });

  // Count by severity
  const counts = {
    CRITICAL: redFlags.filter(f => f.severity === 'CRITICAL').length,
    HIGH: redFlags.filter(f => f.severity === 'HIGH').length,
    MEDIUM: redFlags.filter(f => f.severity === 'MEDIUM').length,
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(counts).map(([severity, count]) => {
          const config = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
          const Icon = config.icon;
          return (
            <Card key={severity} className={`${config.bgColor} ${config.borderColor} border`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className={`text-sm ${config.textColor}`}>{config.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Red Flag Cards */}
      {sortedFlags.length === 0 ? (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 mx-auto mb-3 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-green-700 font-medium">No red flags identified</p>
            <p className="text-green-600 text-sm mt-1">
              The venture appears well-balanced for its current stage
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedFlags.map((flag, index) => {
            const config = SEVERITY_CONFIG[flag.severity];
            const Icon = config.icon;

            return (
              <Card key={index} className={`${config.bgColor} ${config.borderColor} border`}>
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{flag.title}</h3>
                        <Badge className={`${config.color} text-white`}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {flag.description}
                      </p>
                    </div>
                  </div>

                  {/* Affected Dimensions */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Affected Dimensions</p>
                    <div className="flex flex-wrap gap-2">
                      {flag.affectedDimensions.map((dim) => (
                        <Badge key={dim} variant="outline" className="text-xs">
                          {DIMENSION_LABELS[dim] || dim}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="bg-white/60 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Recommendation</p>
                        <p className="text-sm text-muted-foreground">{flag.recommendation}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{flag.timeline}</span>
                      </div>
                      {flag.estimatedBudget && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{flag.estimatedBudget}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
