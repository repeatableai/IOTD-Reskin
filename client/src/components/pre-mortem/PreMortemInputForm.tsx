import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Skull, Info } from "lucide-react";

interface CompletenessResult {
  score: number;
  level: 'blocked' | 'partial' | 'none';
  missingFields: string[];
  warnings: string[];
}

interface PreMortemInputFormProps {
  ventureName: string;
  completeness: CompletenessResult | null;
  isLoading: boolean;
  onGenerate: () => void;
  cachedAt?: string | null;
  onRegenerate?: () => void;
}

export default function PreMortemInputForm({
  ventureName,
  completeness,
  isLoading,
  onGenerate,
  cachedAt,
  onRegenerate,
}: PreMortemInputFormProps) {
  // Note: We no longer block generation - show warning but allow proceeding
  const isLowData = completeness?.level === 'blocked';
  const hasWarnings = completeness?.level === 'partial' || isLowData;

  return (
    <div className="space-y-6 py-4">
      {/* Venture Info */}
      <Card className="border-[#1B2A4A]/10 bg-gradient-to-br from-[#1B2A4A]/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
              <Skull className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1B2A4A]">
                Pre-Mortem Analysis
              </h3>
              <p className="text-sm text-[#1B2A4A]/60">
                {ventureName}
              </p>
            </div>
          </div>
          <p className="text-sm text-[#1B2A4A]/70 leading-relaxed">
            Generate a deep failure analysis that identifies 5-7 specific ways this venture could fail,
            written from the perspective of investors who watched it happen. Each failure mode includes
            root causes and direct mitigation actions.
          </p>
        </CardContent>
      </Card>

      {/* Data Completeness Check */}
      {completeness && (
        <Card className={`border-2 ${
          isLowData ? 'border-yellow-300 bg-yellow-50/50' :
          hasWarnings ? 'border-yellow-300 bg-yellow-50/50' :
          'border-green-300 bg-green-50/50'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {isLowData ? (
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              ) : hasWarnings ? (
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-semibold ${
                    isLowData ? 'text-yellow-700' :
                    hasWarnings ? 'text-yellow-700' :
                    'text-green-700'
                  }`}>
                    {isLowData ? 'Limited Data Available' :
                     hasWarnings ? 'Partial Data Available' :
                     'Ready for Analysis'}
                  </h4>
                  <Badge variant="outline" className={`${
                    isLowData ? 'border-yellow-300 text-yellow-600' :
                    hasWarnings ? 'border-yellow-300 text-yellow-600' :
                    'border-green-300 text-green-600'
                  }`}>
                    {completeness.score}/100
                  </Badge>
                </div>

                {isLowData && completeness.missingFields.length > 0 && (
                  <div className="text-sm text-yellow-700">
                    <p className="mb-1">Analysis will proceed with available data. Some fields not found:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-yellow-600">
                      {completeness.missingFields.map((field, idx) => (
                        <li key={idx}>{field}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!isLowData && hasWarnings && completeness.warnings.length > 0 && (
                  <div className="text-sm text-yellow-700">
                    <ul className="space-y-0.5">
                      {completeness.warnings.map((warning, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!isLowData && !hasWarnings && (
                  <p className="text-sm text-green-600">
                    All required data fields are available for comprehensive analysis.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cached Result Notice */}
      {cachedAt && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Info className="w-4 h-4" />
                <span>
                  Generated {new Date(cachedAt).toLocaleString()}
                </span>
              </div>
              {onRegenerate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRegenerate}
                  className="border-blue-300 text-blue-600 hover:bg-blue-100"
                >
                  Regenerate for fresh analysis
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={onGenerate}
          disabled={isLoading}
          className="px-8 py-6 text-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
        >
          <Skull className="w-5 h-5 mr-2" />
          {isLoading ? 'Analyzing...' : 'Generate Pre-Mortem Analysis'}
        </Button>
      </div>

      {/* What to Expect */}
      <Card className="border-[#1B2A4A]/10">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-[#1B2A4A] mb-3">What You'll Get</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-semibold text-xs">1</span>
              </div>
              <div>
                <p className="font-medium text-[#1B2A4A]">5-7 Failure Modes</p>
                <p className="text-[#1B2A4A]/60">Industry-specific and universal</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-semibold text-xs">2</span>
              </div>
              <div>
                <p className="font-medium text-[#1B2A4A]">Past-Tense Narratives</p>
                <p className="text-[#1B2A4A]/60">Visceral failure stories</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-semibold text-xs">3</span>
              </div>
              <div>
                <p className="font-medium text-[#1B2A4A]">Root Causes</p>
                <p className="text-[#1B2A4A]/60">Specific, actionable insights</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-semibold text-xs">4</span>
              </div>
              <div>
                <p className="font-medium text-[#1B2A4A]">Mitigation Actions</p>
                <p className="text-[#1B2A4A]/60">Direct prevention steps</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
