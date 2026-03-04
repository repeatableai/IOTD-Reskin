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
import { Shield } from "lucide-react";

import ScannerInputForm from "./disruption-scanner/ScannerInputForm";
import ScannerLoadingAnimation from "./disruption-scanner/ScannerLoadingAnimation";
import ScannerResults from "./disruption-scanner/ScannerResults";

interface DisruptionScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: {
    id: string;
    title: string;
    description?: string;
    market?: string;
    type?: string;
    targetAudience?: string;
  };
}

// Type for the scan result
interface DisruptionScanResult {
  executiveSummary: {
    overallScore: number;
    classification: 'HIGH_RISK' | 'MODERATE' | 'RESILIENT';
    executiveNarrative: string;
    archetypeClassification: 'CREATOR' | 'DISRUPTOR' | 'ENABLER' | 'ADAPTOR' | 'DISRUPTED';
  };
  disruptionVectors: Array<{
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
  }>;
  moatAssessment: {
    overallMoatRating: 'strong' | 'moderate' | 'weak' | 'eroding';
    holdingCount: number;
    pillars: Array<{
      name: string;
      holds: boolean;
      durabilityScore: number;
      evidence: string;
      aiVulnerable: boolean;
    }>;
  };
  marginCompression: {
    currentEstimatedMargin: string;
    scenarios: {
      conservative: { margin: string; timeline: string; assumptions: string };
      baseCase: { margin: string; timeline: string; assumptions: string };
      aggressive: { margin: string; timeline: string; assumptions: string };
    };
  };
  expertPanel: Array<{
    name: string;
    title: string;
    verdict: string;
    vote: 'INVESTABLE' | 'MANAGEABLE' | 'WATCH' | 'MODERATE_RISK' | 'HIGH_RISK' | 'AVOID';
    keyQuestion: string;
  }>;
  torpedoAnalysis: {
    torpedoes: Array<{
      title: string;
      narrative: string;
      probability: 'high' | 'medium' | 'low';
      severity: 'catastrophic' | 'severe' | 'moderate';
      mitigant: string;
    }>;
    cascadeWarning: string;
  };
  strategicActions: Array<{
    priority: number;
    action: string;
    rationale: string;
    impact: 'high' | 'medium' | 'low';
    timeline: string;
  }>;
}

// Map market to sector
function mapMarketToSector(market?: string): string {
  if (!market) return "";

  const marketLower = market.toLowerCase();

  if (marketLower.includes("tech") || marketLower.includes("software") || marketLower.includes("saas")) {
    return "technology";
  }
  if (marketLower.includes("health") || marketLower.includes("medical") || marketLower.includes("pharma")) {
    return "healthcare";
  }
  if (marketLower.includes("finance") || marketLower.includes("fintech") || marketLower.includes("banking")) {
    return "finance";
  }
  if (marketLower.includes("retail") || marketLower.includes("ecommerce") || marketLower.includes("consumer")) {
    return "retail";
  }
  if (marketLower.includes("manufact") || marketLower.includes("industrial")) {
    return "manufacturing";
  }
  if (marketLower.includes("energy") || marketLower.includes("oil") || marketLower.includes("renewable")) {
    return "energy";
  }
  if (marketLower.includes("media") || marketLower.includes("entertainment") || marketLower.includes("content")) {
    return "media";
  }
  if (marketLower.includes("edu") || marketLower.includes("learning") || marketLower.includes("training")) {
    return "education";
  }
  if (marketLower.includes("real estate") || marketLower.includes("property")) {
    return "real estate";
  }
  if (marketLower.includes("transport") || marketLower.includes("logistics") || marketLower.includes("shipping")) {
    return "transportation";
  }
  if (marketLower.includes("defense") || marketLower.includes("military") || marketLower.includes("security")) {
    return "defense";
  }

  return "other";
}

export default function DisruptionScannerDialog({
  open,
  onOpenChange,
  idea,
}: DisruptionScannerDialogProps) {
  const { toast } = useToast();

  // Phase management: input -> loading -> results (or error)
  const [phase, setPhase] = useState<'input' | 'loading' | 'results' | 'error'>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [companyName, setCompanyName] = useState(idea.title || "");
  const [sector, setSector] = useState(mapMarketToSector(idea.market));
  const [customSector, setCustomSector] = useState("");
  const [description, setDescription] = useState(idea.description || "");

  // Get the effective sector value (custom if "other" is selected)
  const effectiveSector = sector === 'other' ? customSector : sector;

  // Result state
  const [scanResult, setScanResult] = useState<DisruptionScanResult | null>(null);

  // Reset form ONLY when dialog first opens (not on every idea change)
  useEffect(() => {
    if (open) {
      // Only reset if we're not already in a loading/results/error state
      setCompanyName(idea.title || "");
      setSector(mapMarketToSector(idea.market));
      setCustomSector("");
      setDescription(idea.description || "");
      // Don't reset phase here - let it persist during analysis
    }
    if (!open) {
      // Reset everything when dialog closes
      setPhase('input');
      setScanResult(null);
      setErrorMessage(null);
      setCustomSector("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // Only depend on open, not idea

  // Mutation for API call
  const scanMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/disruption-scan', {
        companyName,
        sector: effectiveSector,
        description,
        ideaId: idea.id,
        market: idea.market,
        type: idea.type,
        targetAudience: idea.targetAudience,
      });
      return res.json() as Promise<DisruptionScanResult>;
    },
    onSuccess: (data) => {
      setScanResult(data);
      setPhase('results');
    },
    onError: (error) => {
      console.error('Disruption scan error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      setPhase('error');
    },
  });

  // Handle form submit
  const handleSubmit = () => {
    setErrorMessage(null);
    setPhase('loading');
    scanMutation.mutate();
  };

  // Handle rescan
  const handleRescan = () => {
    setPhase('input');
    setScanResult(null);
    setErrorMessage(null);
  };

  // Handle dialog close
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setPhase('input');
      setScanResult(null);
      setErrorMessage(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-[#F8F9FC]">
        <DialogHeader className="border-b border-[#1B2A4A]/10 pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl text-[#1B2A4A]">
            <Shield className="w-6 h-6 text-[#C5985E]" />
            AI Disruption Scanner
          </DialogTitle>
          <DialogDescription className="text-[#1B2A4A]/60">
            Institutional-grade AI disruption risk assessment powered by Claude
          </DialogDescription>
        </DialogHeader>

        {phase === 'input' && (
          <ScannerInputForm
            companyName={companyName}
            setCompanyName={setCompanyName}
            sector={sector}
            setSector={setSector}
            customSector={customSector}
            setCustomSector={setCustomSector}
            description={description}
            setDescription={setDescription}
            onSubmit={handleSubmit}
            isLoading={scanMutation.isPending}
          />
        )}

        {phase === 'loading' && (
          <ScannerLoadingAnimation companyName={companyName} />
        )}

        {phase === 'results' && scanResult && (
          <ScannerResults
            data={scanResult}
            companyName={companyName}
            onRescan={handleRescan}
          />
        )}

        {phase === 'error' && (
          <div className="py-12 px-6 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">Analysis Failed</h3>
              <p className="text-sm text-[#1B2A4A]/60 max-w-md mx-auto">
                {errorMessage || 'An error occurred during the analysis. This may be due to high demand or a temporary issue.'}
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-[#1B2A4A] text-white rounded-lg hover:bg-[#1B2A4A]/90 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleRescan}
                className="px-6 py-2 border border-[#1B2A4A]/20 text-[#1B2A4A] rounded-lg hover:bg-[#1B2A4A]/5 transition-colors"
              >
                Edit Inputs
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
