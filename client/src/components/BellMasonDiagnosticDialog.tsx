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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Activity, AlertCircle, RefreshCw } from "lucide-react";

import DiagnosticLoadingAnimation from "./bell-mason/DiagnosticLoadingAnimation";
import DiagnosticResults from "./bell-mason/DiagnosticResults";

interface BellMasonDiagnosticDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venture: {
    id: string;
    name: string;
    sector: string;
    description?: string;
    stage?: string;
    scores?: {
      problemScore?: number;
      solutionScore?: number;
      marketScore?: number;
      teamScore?: number;
    };
  };
}

type Phase = 'input' | 'researching' | 'diagnosing' | 'complete' | 'error';

// Stage options
const STAGES = [
  { value: 'Concept', label: 'Concept' },
  { value: 'Seed', label: 'Seed' },
  { value: 'Product Development', label: 'Product Development' },
  { value: 'Market Development', label: 'Market Development' },
  { value: 'Steady State', label: 'Steady State' },
];

// Sector options
const SECTORS = [
  'Technology',
  'Healthcare',
  'Finance/FinTech',
  'Enterprise SaaS',
  'Consumer',
  'E-commerce',
  'Education/EdTech',
  'Real Estate/PropTech',
  'Manufacturing',
  'Energy/CleanTech',
  'Media/Entertainment',
  'Transportation/Logistics',
  'Defense/Security',
  'Other',
];

// Valid Bell-Mason stages
const VALID_STAGES = ['Concept', 'Seed', 'Product Development', 'Market Development', 'Steady State'] as const;
type BellMasonStage = typeof VALID_STAGES[number];

// Ensure a stage value is valid, with fallback to 'Seed'
function ensureValidStage(stage: string): BellMasonStage {
  if (VALID_STAGES.includes(stage as BellMasonStage)) {
    return stage as BellMasonStage;
  }
  return 'Seed';
}

// Map idea type to Bell-Mason stage
function mapTypeToStage(type?: string): BellMasonStage {
  if (!type) return 'Seed';

  // First check if it's already a valid Bell-Mason stage
  if (VALID_STAGES.includes(type as BellMasonStage)) {
    return type as BellMasonStage;
  }

  const typeLower = type.toLowerCase();
  if (typeLower.includes('concept') || typeLower.includes('idea')) return 'Concept';
  if (typeLower.includes('seed') || typeLower.includes('early')) return 'Seed';
  if (typeLower.includes('product') || typeLower.includes('mvp')) return 'Product Development';
  if (typeLower.includes('market') || typeLower.includes('growth')) return 'Market Development';
  if (typeLower.includes('mature') || typeLower.includes('steady')) return 'Steady State';
  // Default: treat most business types (saas, marketplace, etc.) as Seed stage
  return 'Seed';
}

export default function BellMasonDiagnosticDialog({
  open,
  onOpenChange,
  venture,
}: BellMasonDiagnosticDialogProps) {
  const { toast } = useToast();

  // Phase state
  const [phase, setPhase] = useState<Phase>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [ventureName, setVentureName] = useState(venture.name || '');
  const [sector, setSector] = useState(venture.sector || 'Technology');
  const [customSector, setCustomSector] = useState('');
  const [stage, setStage] = useState(mapTypeToStage(venture.stage));
  const [description, setDescription] = useState(venture.description || '');

  // Get the effective sector value (custom if "Other" is selected)
  const effectiveSector = sector === 'Other' ? customSector : sector;

  // Result state
  const [researchResult, setResearchResult] = useState<any>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);

  // Track if dialog was previously open to detect open/close transitions
  const [wasOpen, setWasOpen] = useState(false);

  // Reset form only when dialog OPENS (not on every venture change)
  useEffect(() => {
    // Dialog just opened (was closed, now open)
    if (open && !wasOpen) {
      setVentureName(venture.name || '');
      setSector(venture.sector || 'Technology');
      setCustomSector('');
      setStage(mapTypeToStage(venture.stage));
      setDescription(venture.description || '');
    }
    // Dialog just closed
    if (!open && wasOpen) {
      // Reset everything when dialog closes
      setPhase('input');
      setResearchResult(null);
      setDiagnosticResult(null);
      setErrorMessage(null);
    }
    setWasOpen(open);
  }, [open, venture.name, venture.sector, venture.stage, venture.description]);

  // SSE-based diagnostic function for streaming long operations
  const runStreamingDiagnostic = async (research: any) => {
    if (!research) {
      throw new Error('Research data not available');
    }

    try {
      const response = await fetch('/api/ai/bell-mason-diagnostic-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ventureName,
          sector: effectiveSector,
          stage: ensureValidStage(stage),
          description,
          existingScores: venture.scores,
          research,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Diagnostic request failed');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[BellMason SSE] Stream ended');
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';  // Keep incomplete line in buffer

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);

              switch (eventType) {
                case 'status':
                  console.log('[BellMason SSE] Status:', parsed.message);
                  break;
                case 'progress':
                  console.log('[BellMason SSE] Progress:', parsed.chunks, 'chunks');
                  break;
                case 'heartbeat':
                  console.log('[BellMason SSE] Heartbeat at', new Date(parsed.timestamp).toISOString());
                  break;
                case 'complete':
                  console.log('[BellMason SSE] Complete!');
                  setDiagnosticResult(parsed.result);
                  setPhase('complete');
                  toast({
                    title: "Diagnostic Complete",
                    description: "Bell-Mason assessment has been generated successfully.",
                  });
                  return;
                case 'error':
                  throw new Error(parsed.message || 'Diagnostic failed');
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete chunks
              if (eventType === 'error' || eventType === 'complete') {
                console.error('[BellMason SSE] Parse error:', parseError);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Diagnostic error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Diagnostic failed');
      setPhase('error');
    }
  };

  // Research mutation
  const researchMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/bell-mason-research', {
        ventureName,
        sector: effectiveSector,
        description,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setResearchResult(data);
      setPhase('diagnosing');
      // Start streaming diagnostic (keeps connection alive with SSE)
      runStreamingDiagnostic(data);
    },
    onError: (error) => {
      console.error('Research error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Research failed');
      setPhase('error');
    },
  });

  // Start diagnostic process
  const handleStartDiagnostic = () => {
    if (!ventureName.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a venture name.",
        variant: "destructive",
      });
      return;
    }
    if (sector === 'Other' && !customSector.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a sector name.",
        variant: "destructive",
      });
      return;
    }
    setPhase('researching');
    researchMutation.mutate();
  };

  // Retry from error
  const handleRetry = () => {
    setErrorMessage(null);
    setResearchResult(null);
    setDiagnosticResult(null);
    setPhase('input');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-600" />
            Bell-Mason Diagnostic
            {phase === 'complete' && (
              <Badge className="ml-2 bg-green-500 text-white">Complete</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {phase === 'input' && 'Configure venture parameters for institutional-grade diagnostic assessment'}
            {phase === 'researching' && 'Conducting deep web research...'}
            {phase === 'diagnosing' && 'Analyzing venture across 12 dimensions...'}
            {phase === 'complete' && `Assessment for ${ventureName}`}
            {phase === 'error' && 'An error occurred during the diagnostic'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Input Phase */}
          {phase === 'input' && (
            <div className="space-y-6 py-4">
              {/* Disclaimer */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                <strong>DISCLAIMER:</strong> Below is a partially contemplated implementation of the Bell-Mason architecture based on publicly available information about the framework. This is not a licensed use of the Bell-Mason architecture. What this will give you is an initial assessment with cited data sources where they are available. Given the lack of public data or most pre-seed start-ups or early-state ventures, most sources will be empty. This will give you an initial view of the potential of a full Bell-Mason evaluation, requiring licensing from Bell-Mason for their platform directly.
              </div>

              {/* Venture Name */}
              <div className="space-y-2">
                <Label htmlFor="ventureName">Venture Name *</Label>
                <Input
                  id="ventureName"
                  value={ventureName}
                  onChange={(e) => setVentureName(e.target.value)}
                  placeholder="Enter venture or company name"
                />
              </div>

              {/* Sector */}
              <div className="space-y-2">
                <Label htmlFor="sector">Sector</Label>
                <Select value={sector} onValueChange={setSector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {sector === 'Other' && (
                  <Input
                    id="customSector"
                    value={customSector}
                    onChange={(e) => setCustomSector(e.target.value)}
                    placeholder="Enter your sector"
                    className="mt-2"
                  />
                )}
              </div>

              {/* Stage */}
              <div className="space-y-2">
                <Label htmlFor="stage">Venture Stage</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Stage determines the benchmark ideals for each dimension
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the venture, product, or business model"
                  rows={3}
                />
              </div>

              {/* Info Box */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                <h4 className="font-semibold text-amber-800 mb-2">What This Analysis Includes:</h4>
                <ul className="space-y-1 text-amber-700">
                  <li>• Deep web research for funding, team, product, market data</li>
                  <li>• 12-dimension Bell-Mason scoring with stage-appropriate benchmarks</li>
                  <li>• Red flag identification and dysfunction pattern detection</li>
                  <li>• 5-expert panel simulation (Heidi Mason, Gordon Bell, etc.)</li>
                  <li>• Cross-framework fusion (Bessemer, Sequoia, a16z)</li>
                </ul>
                <p className="mt-3 text-amber-600">
                  <strong>Note:</strong> This analysis takes 2-3 minutes to complete using Claude Opus with extended thinking.
                </p>
              </div>
            </div>
          )}

          {/* Loading Phases */}
          {(phase === 'researching' || phase === 'diagnosing') && (
            <DiagnosticLoadingAnimation
              ventureName={ventureName}
              phase={phase === 'researching' ? 'research' : 'diagnostic'}
            />
          )}

          {/* Error Phase */}
          {phase === 'error' && (
            <div className="py-8 space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-700">Diagnostic Failed</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {errorMessage || 'An unexpected error occurred'}
                </p>
              </div>
              <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}

          {/* Results Phase */}
          {phase === 'complete' && diagnosticResult && researchResult && (
            <DiagnosticResults
              diagnostic={diagnosticResult}
              research={researchResult}
              ventureName={ventureName}
              stage={stage}
            />
          )}

          {/* Start Button - only in input phase */}
          {phase === 'input' && (
            <div className="pt-6">
              <Button
                onClick={handleStartDiagnostic}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                size="lg"
              >
                <Activity className="w-4 h-4 mr-2" />
                Start Bell-Mason Diagnostic
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
