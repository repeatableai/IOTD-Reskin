import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Zap,
} from "lucide-react";

interface FrameworkScore {
  framework: string;
  score: number;
  methodology: string;
  keyFindings: string[];
}

interface FrameworkFusionData {
  bellMason: FrameworkScore;
  bessemer: FrameworkScore;
  sequoia: FrameworkScore;
  a16z: FrameworkScore;
  agreements: string[];
  divergences: string[];
}

interface FrameworkFusionTabProps {
  fusion: FrameworkFusionData;
}

// Framework colors
const FRAMEWORK_COLORS = {
  bellMason: { bg: 'bg-purple-50', border: 'border-purple-300', accent: 'bg-purple-500', text: 'text-purple-700' },
  bessemer: { bg: 'bg-blue-50', border: 'border-blue-300', accent: 'bg-blue-500', text: 'text-blue-700' },
  sequoia: { bg: 'bg-green-50', border: 'border-green-300', accent: 'bg-green-500', text: 'text-green-700' },
  a16z: { bg: 'bg-orange-50', border: 'border-orange-300', accent: 'bg-orange-500', text: 'text-orange-700' },
};

// Framework display names
const FRAMEWORK_NAMES = {
  bellMason: 'Bell-Mason',
  bessemer: 'Bessemer',
  sequoia: 'Sequoia',
  a16z: 'a16z',
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-full ${color} rounded-full transition-all duration-500`}
        style={{ width: `${score}%` }}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium">
        {score}
      </span>
    </div>
  );
}

// Default framework score for missing data
const DEFAULT_FRAMEWORK: FrameworkScore = {
  framework: 'Unknown',
  score: 50,
  methodology: 'Standard assessment',
  keyFindings: [],
};

export default function FrameworkFusionTab({ fusion }: FrameworkFusionTabProps) {
  // Defensive: ensure fusion and all framework objects exist
  const safeFusion = fusion || {
    bellMason: { ...DEFAULT_FRAMEWORK, framework: 'Bell-Mason Diagnostic' },
    bessemer: { ...DEFAULT_FRAMEWORK, framework: 'Bessemer 10 Laws' },
    sequoia: { ...DEFAULT_FRAMEWORK, framework: 'Sequoia Arc' },
    a16z: { ...DEFAULT_FRAMEWORK, framework: 'a16z PMF Framework' },
    agreements: [],
    divergences: [],
  };

  const frameworks = [
    { key: 'bellMason' as const, data: safeFusion.bellMason || { ...DEFAULT_FRAMEWORK, framework: 'Bell-Mason Diagnostic' } },
    { key: 'bessemer' as const, data: safeFusion.bessemer || { ...DEFAULT_FRAMEWORK, framework: 'Bessemer 10 Laws' } },
    { key: 'sequoia' as const, data: safeFusion.sequoia || { ...DEFAULT_FRAMEWORK, framework: 'Sequoia Arc' } },
    { key: 'a16z' as const, data: safeFusion.a16z || { ...DEFAULT_FRAMEWORK, framework: 'a16z PMF Framework' } },
  ];

  const agreements = safeFusion.agreements || [];
  const divergences = safeFusion.divergences || [];

  // Calculate average score
  const avgScore = Math.round(
    frameworks.reduce((sum, f) => sum + (f.data?.score ?? 50), 0) / frameworks.length
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Cross-Framework Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Evaluating venture through 4 institutional investment frameworks
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{avgScore}</p>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Framework Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {frameworks.map(({ key, data }) => {
          const colors = FRAMEWORK_COLORS[key];
          return (
            <Card key={key} className={`${colors.bg} ${colors.border} border`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${colors.text}`}>
                    {data.framework}
                  </CardTitle>
                  <Badge className={`${colors.accent} text-white text-lg px-3`}>
                    {data.score}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Score Bar */}
                <ScoreBar score={data.score} color={colors.accent} />

                {/* Methodology */}
                <p className="text-xs text-muted-foreground">{data.methodology}</p>

                {/* Key Findings */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide">Key Findings</p>
                  {(data.keyFindings || []).map((finding, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-3 h-3 mt-0.5 text-gray-400 flex-shrink-0" />
                      <p className="text-sm">{finding}</p>
                    </div>
                  ))}
                  {(!data.keyFindings || data.keyFindings.length === 0) && (
                    <p className="text-sm text-muted-foreground">No key findings available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Agreements */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            Framework Agreements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {agreements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No strong agreements identified</p>
            ) : (
              agreements.map((agreement, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-white/60 rounded">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{agreement}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Divergences */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            Framework Divergences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {divergences.length === 0 ? (
              <p className="text-sm text-muted-foreground">No significant divergences identified</p>
            ) : (
              divergences.map((divergence, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-white/60 rounded">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{divergence}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Framework Comparison Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Score Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {frameworks.map(({ key, data }) => {
              const colors = FRAMEWORK_COLORS[key];
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className={`font-medium ${colors.text}`}>
                      {FRAMEWORK_NAMES[key]}
                    </span>
                    <span className="font-bold">{data.score}</span>
                  </div>
                  <Progress value={data.score} className="h-3" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
