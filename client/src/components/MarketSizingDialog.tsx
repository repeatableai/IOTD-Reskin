import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Building,
  Globe,
  Search,
  Database,
  Users,
  TrendingUp,
  FileText,
  Loader2,
  Download,
  X,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

interface MarketSizingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: {
    id: string;
    title: string;
    description: string;
    content?: string;
    market?: string;
    type?: string;
    targetAudience?: string;
    mainCompetitor?: string;
    opportunityScore?: number;
    problemScore?: number;
    feasibilityScore?: number;
    timingScore?: number;
    executionScore?: number;
    gtmScore?: number;
    whyNowAnalysis?: string;
    proofSignals?: string;
    marketGap?: string;
    revenuePotential?: string;
    frameworkData?: any;
    communitySignals?: any;
  };
}

// 7-Phase Loading Animation
const MARKET_SIZING_PHASES = [
  { id: 'venture_context', name: 'Venture Context', icon: Building, duration: 6000 },
  { id: 'tam_research', name: 'TAM Research', icon: Globe, duration: 15000 },
  { id: 'competitive_search', name: 'Competitive Search', icon: Search, duration: 12000 },
  { id: 'firmographic', name: 'Firmographic Analysis', icon: Database, duration: 10000 },
  { id: 'expert_panel', name: 'Expert Panel', icon: Users, duration: 12000 },
  { id: 'sensitivity', name: 'Sensitivity Model', icon: TrendingUp, duration: 8000 },
  { id: 'composition', name: 'Document Composition', icon: FileText, duration: 0 },
];

export default function MarketSizingDialog({ open, onOpenChange, idea }: MarketSizingDialogProps) {
  const { toast } = useToast();
  const [phase, setPhase] = useState<'idle' | 'loading' | 'complete' | 'error'>('idle');
  const [document, setDocument] = useState<string>('');
  const [streamingText, setStreamingText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Phase progression during loading
  useEffect(() => {
    if (phase !== 'loading') return;

    const advancePhase = () => {
      setCurrentPhaseIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex < MARKET_SIZING_PHASES.length - 1) {
          setPhaseProgress(0);
          return nextIndex;
        }
        return prev;
      });
    };

    // Progress within current phase
    const progressInterval = setInterval(() => {
      setPhaseProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 100);

    // Move to next phase based on duration
    const currentPhase = MARKET_SIZING_PHASES[currentPhaseIndex];
    if (currentPhase.duration > 0) {
      phaseTimerRef.current = setTimeout(advancePhase, currentPhase.duration);
    }

    return () => {
      clearInterval(progressInterval);
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
    };
  }, [phase, currentPhaseIndex]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setPhase('idle');
      setDocument('');
      setStreamingText('');
      setCharCount(0);
      setCurrentPhaseIndex(0);
      setPhaseProgress(0);
      setErrorMessage('');
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleGenerate = async () => {
    setPhase('loading');
    setDocument('');
    setStreamingText('');
    setCharCount(0);
    setCurrentPhaseIndex(0);
    setPhaseProgress(0);
    setErrorMessage('');

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/market-sizing/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ideaId: idea.id }),
        credentials: 'include',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        if (response.status === 529) {
          throw new Error('AI service is currently overloaded. Please try again in 30 seconds.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let fullDocument = '';
      let totalChars = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.event === 'connected') {
                // Connection established
              } else if (data.event === 'chunk') {
                const content = typeof data.content === 'string' ? data.content : '';
                fullDocument += content;
                totalChars += content.length;
                setCharCount(totalChars);
                setStreamingText(fullDocument);

                // Update phase based on content progress
                if (totalChars > 500 && currentPhaseIndex < 1) {
                  setCurrentPhaseIndex(1);
                } else if (totalChars > 2000 && currentPhaseIndex < 2) {
                  setCurrentPhaseIndex(2);
                } else if (totalChars > 4000 && currentPhaseIndex < 3) {
                  setCurrentPhaseIndex(3);
                } else if (totalChars > 6000 && currentPhaseIndex < 4) {
                  setCurrentPhaseIndex(4);
                } else if (totalChars > 8000 && currentPhaseIndex < 5) {
                  setCurrentPhaseIndex(5);
                } else if (totalChars > 10000 && currentPhaseIndex < 6) {
                  setCurrentPhaseIndex(6);
                }
              } else if (data.event === 'complete') {
                setDocument(fullDocument);
                setPhase('complete');
              } else if (data.event === 'error') {
                throw new Error(data.message);
              } else if (data.event === 'end') {
                if (fullDocument.length > 0) {
                  setDocument(fullDocument);
                  setPhase('complete');
                }
              }
            } catch (parseError) {
              console.debug('SSE parse error (may be incomplete):', parseError);
            }
          }
        }
      }

      // Final check - if we have content but didn't get complete event
      if (fullDocument.length > 2000 && phase === 'loading') {
        setDocument(fullDocument);
        setPhase('complete');
      } else if (fullDocument.length < 2000 && fullDocument.length > 0) {
        setErrorMessage('Report appears incomplete. Please try again.');
        setPhase('error');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Market sizing generation cancelled');
        return;
      }

      console.error('Market sizing streaming error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
      setPhase('error');

      toast({
        title: "Failed to generate market sizing report",
        description: error.message || "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const blob = new Blob([document], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `market-sizing-${idea.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Market sizing report downloaded as markdown file.",
    });
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    onOpenChange(false);
  };

  const renderPhaseIndicator = () => {
    const currentPhase = MARKET_SIZING_PHASES[currentPhaseIndex];
    const PhaseIcon = currentPhase.icon;

    return (
      <div className="space-y-6">
        {/* Current Phase */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <PhaseIcon className="w-6 h-6 text-emerald-600 animate-pulse" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-slate-800">{currentPhase.name}</p>
            <Progress value={phaseProgress} className="h-2 mt-2" />
          </div>
        </div>

        {/* Phase List */}
        <div className="grid grid-cols-7 gap-2">
          {MARKET_SIZING_PHASES.map((p, idx) => {
            const Icon = p.icon;
            const isComplete = idx < currentPhaseIndex;
            const isCurrent = idx === currentPhaseIndex;

            return (
              <div
                key={p.id}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                  isComplete
                    ? 'bg-emerald-100'
                    : isCurrent
                    ? 'bg-emerald-50 ring-2 ring-emerald-300'
                    : 'bg-slate-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isComplete
                      ? 'text-emerald-600'
                      : isCurrent
                      ? 'text-emerald-500 animate-pulse'
                      : 'text-slate-400'
                  }`}
                />
                <span className="text-[10px] text-center text-slate-600 leading-tight">
                  {p.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating...</span>
          </div>
          <div>
            {charCount.toLocaleString()} characters
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-800">
                Market Sizing Analysis V2
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-1">
                {idea.title} — Live web search-powered market analysis
              </DialogDescription>
            </div>
            {phase === 'complete' && (
              <Button
                onClick={handleExport}
                variant="outline"
                className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export .md
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Idle State - Show Generate Button */}
          {phase === 'idle' && (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  Generate Institutional-Grade Market Analysis
                </h3>
                <p className="text-slate-500 mb-6 leading-relaxed">
                  This will produce a comprehensive 10-15 page market sizing document with TAM/SAM/SOM analysis,
                  competitive landscape, expert perspectives, and full source citations using live web research.
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={handleGenerate}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Generate Market Sizing Report
                  </Button>
                  <p className="text-xs text-slate-400">
                    Estimated time: 60-90 seconds • Uses live web search
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {phase === 'loading' && (
            <div className="h-full flex flex-col p-8">
              <div className="flex-1 flex flex-col items-center justify-center">
                {renderPhaseIndicator()}
              </div>

              {/* Live Preview */}
              {streamingText.length > 100 && (
                <div className="mt-6 border-t pt-4">
                  <p className="text-xs text-slate-500 mb-2">Live preview:</p>
                  <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="prose prose-sm prose-slate max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {streamingText.slice(-1500)}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 text-center">
                <Button variant="ghost" onClick={handleCancel} className="text-slate-500">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {phase === 'error' && (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  Generation Failed
                </h3>
                <p className="text-slate-500 mb-6">
                  {errorMessage}
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={handleGenerate}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    className="w-full text-slate-500"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Complete State - Show Document */}
          {phase === 'complete' && (
            <ScrollArea className="h-full">
              <article className="prose prose-slate max-w-none p-8
                prose-headings:text-[#1B2A4A]
                prose-h1:text-3xl prose-h1:font-bold prose-h1:border-b prose-h1:pb-4 prose-h1:mb-6
                prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:font-medium prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-slate-700 prose-p:leading-relaxed
                prose-strong:text-slate-900
                prose-table:border prose-table:border-slate-200 prose-table:rounded-lg prose-table:overflow-hidden
                prose-th:bg-slate-100 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:text-slate-700
                prose-td:p-3 prose-td:border-t prose-td:border-slate-200
                prose-ul:space-y-1 prose-li:text-slate-700
                prose-blockquote:border-l-emerald-500 prose-blockquote:bg-emerald-50 prose-blockquote:rounded-r-lg prose-blockquote:py-2
                prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline
              ">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {document}
                </ReactMarkdown>
              </article>
            </ScrollArea>
          )}
        </div>

        {/* Footer Stats - Only show when complete */}
        {phase === 'complete' && (
          <div className="border-t p-4 flex items-center justify-between text-sm text-slate-500 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Report complete</span>
              </div>
              <div>
                {document.length.toLocaleString()} characters
              </div>
              <div>
                ~{Math.ceil(document.split(/\s+/).length / 250)} pages
              </div>
            </div>
            <Button
              onClick={handleExport}
              size="sm"
              variant="ghost"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
