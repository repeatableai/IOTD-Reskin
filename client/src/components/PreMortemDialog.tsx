import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skull } from "lucide-react";

import PreMortemInputForm from "./pre-mortem/PreMortemInputForm";
import PreMortemLoadingAnimation from "./pre-mortem/PreMortemLoadingAnimation";
import PreMortemResults from "./pre-mortem/PreMortemResults";

interface PreMortemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: {
    id: string;
    title: string;
    slug?: string;
    description?: string;
    content?: string;
    market?: string;
    type?: string;
    targetAudience?: string;
    mainCompetitor?: string;
    revenueModel?: string;
    competitors?: string[];
    riskFactors?: string[];
    tamSamSom?: { tam?: string; sam?: string; som?: string };
    regulatoryMentions?: string[];
    executionComplexity?: 'simple' | 'moderate' | 'complex';
    financialProjections?: string;
    marketGap?: string;
    whyNowAnalysis?: string;
    frameworkData?: any;
  };
}

interface CompletenessResult {
  score: number;
  level: 'blocked' | 'partial' | 'none';
  missingFields: string[];
  warnings: string[];
}

interface PreMortemResult {
  perspectives: Array<{
    perspectiveId: string;
    perspectiveName: string;
    criticLens: string;
    riskDomain: string;
    failureNarrative: string;
    rootCause: string;
    mitigationActions: string[];
    failurePointRemoval: {
      currentRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
      mitigatedRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
      estimatedRiskReduction: number;
      confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    };
  }>;
  compositeSeverityScore: number;
  severityTier: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'MANAGEABLE';
  executiveSummary: string;
  perspectivesConfidenceRating: 'HIGH' | 'MEDIUM' | 'LOW';
  metadata: {
    generatedAt: string;
    ventureSlug: string;
    completenessScore: number;
  };
}

// Local storage key for caching
function getCacheKey(slug: string): string {
  return `preMortem_${slug}`;
}

export default function PreMortemDialog({
  open,
  onOpenChange,
  idea,
}: PreMortemDialogProps) {
  const { toast } = useToast();
  const slug = idea.slug || idea.id;

  // Phase management
  const [phase, setPhase] = useState<'input' | 'loading' | 'results' | 'error'>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result and completeness state
  const [result, setResult] = useState<PreMortemResult | null>(null);
  const [completeness, setCompleteness] = useState<CompletenessResult | null>(null);
  const [cachedAt, setCachedAt] = useState<string | null>(null);

  // Check for cached result on dialog open
  useEffect(() => {
    if (open) {
      const cacheKey = getCacheKey(slug);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.result && parsed.cachedAt) {
            setResult(parsed.result);
            setCachedAt(parsed.cachedAt);
            setPhase('results');
          }
        } catch (e) {
          // Invalid cache, ignore
          localStorage.removeItem(cacheKey);
        }
      }

      // Also check completeness
      checkCompleteness();
    }
  }, [open, slug]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      // Don't reset result - keep it for when dialog reopens
      setPhase('input');
      setErrorMessage(null);
    }
  }, [open]);

  // Check data completeness
  const checkCompleteness = async () => {
    try {
      const response = await apiRequest('POST', '/api/ai/pre-mortem/check', {
        ideaId: idea.id,
        ventureName: idea.title,
        ventureSlug: slug,
        description: idea.description,
        content: idea.content,
        market: idea.market,
        type: idea.type,
        targetAudience: idea.targetAudience,
        mainCompetitor: idea.mainCompetitor,
        revenueModel: idea.revenueModel,
        competitors: idea.competitors,
        riskFactors: idea.riskFactors,
        tamSamSom: idea.tamSamSom,
        regulatoryMentions: idea.regulatoryMentions,
        executionComplexity: idea.executionComplexity,
        financialProjections: idea.financialProjections,
        marketGap: idea.marketGap,
        whyNowAnalysis: idea.whyNowAnalysis,
        frameworkData: idea.frameworkData,
      });
      const data = await response.json();
      setCompleteness(data);
    } catch (error) {
      console.error('Error checking completeness:', error);
      // Set a default completeness that allows generation
      setCompleteness({
        score: 60,
        level: 'partial',
        missingFields: [],
        warnings: ['Could not verify data completeness'],
      });
    }
  };

  // Mutation for generating pre-mortem
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/pre-mortem', {
        ideaId: idea.id,
        ventureName: idea.title,
        ventureSlug: slug,
        description: idea.description,
        content: idea.content,
        market: idea.market,
        type: idea.type,
        targetAudience: idea.targetAudience,
        mainCompetitor: idea.mainCompetitor,
        revenueModel: idea.revenueModel,
        competitors: idea.competitors,
        riskFactors: idea.riskFactors,
        tamSamSom: idea.tamSamSom,
        regulatoryMentions: idea.regulatoryMentions,
        executionComplexity: idea.executionComplexity,
        financialProjections: idea.financialProjections,
        marketGap: idea.marketGap,
        whyNowAnalysis: idea.whyNowAnalysis,
        frameworkData: idea.frameworkData,
      });
      return res.json() as Promise<PreMortemResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      setPhase('results');
      setCachedAt(new Date().toISOString());

      // Cache the result
      const cacheKey = getCacheKey(slug);
      localStorage.setItem(cacheKey, JSON.stringify({
        result: data,
        cachedAt: new Date().toISOString(),
      }));

      toast({
        title: "Pre-Mortem Analysis Complete",
        description: `Severity: ${data.severityTier} (${data.compositeSeverityScore}/100)`,
      });
    },
    onError: (error) => {
      console.error('Pre-mortem generation error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      setPhase('error');
    },
  });

  // Handle generate
  const handleGenerate = () => {
    setErrorMessage(null);
    setPhase('loading');
    generateMutation.mutate();
  };

  // Handle regenerate (clear cache and generate fresh)
  const handleRegenerate = () => {
    const cacheKey = getCacheKey(slug);
    localStorage.removeItem(cacheKey);
    setCachedAt(null);
    setResult(null);
    handleGenerate();
  };

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && phase === 'loading') {
      // Don't allow closing during loading
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#F8F9FC]">
        <DialogHeader className="border-b border-[#1B2A4A]/10 pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl text-[#1B2A4A]">
            <Skull className="w-6 h-6 text-red-600" />
            Deep Pre-Mortem Engine
          </DialogTitle>
          <DialogDescription className="text-[#1B2A4A]/60">
            AI-powered venture failure analysis — identify how this venture could fail before it happens
          </DialogDescription>
        </DialogHeader>

        {phase === 'input' && (
          <PreMortemInputForm
            ventureName={idea.title}
            completeness={completeness}
            isLoading={generateMutation.isPending}
            onGenerate={handleGenerate}
            cachedAt={result ? cachedAt : null}
            onRegenerate={result ? handleRegenerate : undefined}
          />
        )}

        {phase === 'loading' && (
          <PreMortemLoadingAnimation ventureName={idea.title} />
        )}

        {phase === 'results' && result && (
          <PreMortemResults
            data={result}
            ventureName={idea.title}
            onRegenerate={handleRegenerate}
          />
        )}

        {phase === 'error' && (
          <div className="py-12 px-6 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <Skull className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">Analysis Failed</h3>
              <p className="text-sm text-[#1B2A4A]/60 max-w-md mx-auto">
                {errorMessage || 'An error occurred during the analysis. This may be due to high demand or a temporary issue.'}
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleGenerate}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => setPhase('input')}
                className="px-6 py-2 border border-[#1B2A4A]/20 text-[#1B2A4A] rounded-lg hover:bg-[#1B2A4A]/5 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
