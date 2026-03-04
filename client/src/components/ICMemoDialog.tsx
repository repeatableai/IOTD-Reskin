import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Loader2,
  Search,
  Brain,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
  Download,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
} from "lucide-react";

interface ICMemoDialogProps {
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

interface ICMemoSection {
  id: string;
  title: string;
  content: string;
  confidenceTags: {
    verified: number;
    estimated: number;
    unverified: number;
  };
}

interface Expert {
  name: string;
  credentials: string;
  framework: string;
  rating: 'STRONG_INVEST' | 'INVEST' | 'CONDITIONAL' | 'CAUTIOUS' | 'PASS';
  analysis: string;
}

interface DiligenceItem {
  category: 'gating' | 'pre_close' | 'supplementary';
  item: string;
  priority: 'high' | 'medium' | 'low';
}

interface ICMemoResult {
  disclaimer?: string; // Executive-level disclaimer about data verification status
  sections: ICMemoSection[];
  recommendation: {
    verdict: 'INVEST' | 'CONDITIONAL' | 'MORE_DATA' | 'PASS';
    confidence: number;
    conditions?: string[];
    summary: string;
  };
  expertPanel: Expert[];
  diligenceItems: DiligenceItem[];
  confidenceStats: {
    verified: number;
    estimated: number;
    unverified: number;
  };
  tier: 1 | 2 | 3;
  tierLabel: string;
  ideaId: string;
  ideaTitle: string;
  completenessScore: number;
  populatedFields: string[];
  missingFields: string[];
  researchQueries: string[];
}

// Loading phase configuration
const LOADING_PHASES = [
  {
    id: 'intelligence',
    name: 'Intelligence Gathering',
    icon: Search,
    duration: 4000,
    messages: [
      'Analyzing venture data completeness...',
      'Building research queries...',
      'Scanning market intelligence...',
      'Gathering competitive data...',
    ],
  },
  {
    id: 'classification',
    name: 'Evidence Classification',
    icon: Brain,
    duration: 3000,
    messages: [
      'Classifying data sources...',
      'Tagging confidence levels...',
      'Identifying verification gaps...',
    ],
  },
  {
    id: 'composition',
    name: 'Memo Composition',
    icon: PenTool,
    duration: 0, // Runs until API returns
    messages: [
      'Drafting Executive Summary...',
      'Analyzing market opportunity...',
      'Assessing competitive dynamics...',
      'Simulating expert perspectives...',
      'Finalizing recommendations...',
    ],
  },
];

// Tier badge colors
const TIER_COLORS = {
  1: 'bg-amber-100 text-amber-800 border-amber-300',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  3: 'bg-green-100 text-green-800 border-green-300',
};

// Verdict badge colors
const VERDICT_COLORS = {
  INVEST: 'bg-green-500 text-white',
  CONDITIONAL: 'bg-amber-500 text-white',
  MORE_DATA: 'bg-blue-500 text-white',
  PASS: 'bg-red-500 text-white',
};

// Expert rating colors
const RATING_COLORS = {
  STRONG_INVEST: 'bg-green-600 text-white',
  INVEST: 'bg-green-500 text-white',
  CONDITIONAL: 'bg-amber-500 text-white',
  CAUTIOUS: 'bg-orange-500 text-white',
  PASS: 'bg-red-500 text-white',
};

// Diligence category colors
const DILIGENCE_COLORS = {
  gating: 'border-l-red-500',
  pre_close: 'border-l-amber-500',
  supplementary: 'border-l-blue-500',
};

export default function ICMemoDialog({ open, onOpenChange, idea }: ICMemoDialogProps) {
  const { toast } = useToast();
  const [memoResult, setMemoResult] = useState<ICMemoResult | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [exportingFormat, setExportingFormat] = useState<'docx' | 'pdf' | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  // Export handler
  const handleExport = async (format: 'docx' | 'pdf') => {
    if (!memoResult) return;

    setExportingFormat(format);

    try {
      const response = await fetch(`/api/ai/ic-memo/export/${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memoResult }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `IC-Memo-${idea.title.replace(/[^a-z0-9]/gi, '-').substring(0, 50)}.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match) filename = match[1];
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `IC Memo exported as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      console.error(`Export ${format} error:`, error);
      toast({
        title: "Export Failed",
        description: error.message || `Failed to export as ${format.toUpperCase()}`,
        variant: "destructive",
      });
    } finally {
      setExportingFormat(null);
    }
  };

  // Streaming fetch for IC Memo
  const handleGenerateMemo = async () => {
    setMemoResult(null);
    setLoadingPhase(0);
    setPhaseProgress(0);
    setIsStreaming(true);
    setStreamingText('');
    setCharCount(0);

    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/ic-memo/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ideaId: idea.id }),
        credentials: 'include',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
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
                setLoadingPhase(0);
                setLoadingMessage('Connected to AI service...');
              } else if (data.event === 'chunk') {
                // Update streaming text with the chunk
                const content = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
                totalChars += content.length;
                setCharCount(totalChars);
                setStreamingText(prev => prev + content);

                // Update loading phase based on progress
                if (totalChars > 500 && loadingPhase < 1) {
                  setLoadingPhase(1);
                  setLoadingMessage('Analyzing market data...');
                } else if (totalChars > 2000 && loadingPhase < 2) {
                  setLoadingPhase(2);
                  setLoadingMessage('Composing memo sections...');
                }
                setPhaseProgress(Math.min(95, Math.floor(totalChars / 100)));
              } else if (data.event === 'complete') {
                setMemoResult(data.result);
                if (data.result.sections && data.result.sections.length > 0) {
                  setActiveSection(data.result.sections[0].id);
                }
                setIsStreaming(false);
              } else if (data.event === 'error') {
                throw new Error(data.message);
              } else if (data.event === 'end') {
                setIsStreaming(false);
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete JSON
              console.debug('SSE parse error (may be incomplete):', parseError);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('IC Memo generation cancelled');
      } else {
        console.error('IC Memo streaming error:', error);
        toast({
          title: "Failed to generate IC Memo",
          description: error.message || "Please try again in a moment.",
          variant: "destructive",
        });
      }
      setIsStreaming(false);
    }
  };

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Loading animation effect (for non-streaming phases)
  useEffect(() => {
    if (!isStreaming || charCount > 0) return;

    let messageIndex = 0;
    const phase = LOADING_PHASES[0];

    const updateMessage = () => {
      setLoadingMessage(phase.messages[messageIndex % phase.messages.length]);
      messageIndex++;
    };

    updateMessage();
    const interval = setInterval(updateMessage, 1500);

    return () => clearInterval(interval);
  }, [isStreaming, charCount]);

  const resetAndClose = () => {
    setMemoResult(null);
    setLoadingPhase(0);
    setPhaseProgress(0);
    setActiveSection(null);
    onOpenChange(false);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Render confidence badge
  const renderConfidenceBadge = (type: 'verified' | 'estimated' | 'unverified', count: number) => {
    const colors = {
      verified: 'bg-green-100 text-green-700',
      estimated: 'bg-amber-100 text-amber-700',
      unverified: 'bg-red-100 text-red-700',
    };
    const icons = {
      verified: CheckCircle2,
      estimated: AlertTriangle,
      unverified: HelpCircle,
    };
    const Icon = icons[type];

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colors[type]}`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{type}</span>
        <span className="font-bold">{count}</span>
      </div>
    );
  };

  // Render confidence tag badge
  const ConfidenceTag = ({ type }: { type: 'VERIFIED' | 'ESTIMATED' | 'UNVERIFIED' }) => {
    const config = {
      VERIFIED: { icon: CheckCircle2, label: 'V', className: 'bg-green-100 text-green-700' },
      ESTIMATED: { icon: AlertTriangle, label: 'E', className: 'bg-amber-100 text-amber-700' },
      UNVERIFIED: { icon: HelpCircle, label: 'U', className: 'bg-red-100 text-red-700' },
    };
    const { icon: Icon, label, className } = config[type];
    return (
      <span className={`inline-flex items-center mx-1 px-1.5 py-0.5 rounded text-xs font-medium ${className}`}>
        <Icon className="w-3 h-3 mr-0.5" />
        {label}
      </span>
    );
  };

  // Process text to replace confidence tags with React components
  const processTextWithTags = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\[VERIFIED\]|\[ESTIMATED\]|\[UNVERIFIED\])/g);
    return parts.map((part, index) => {
      if (part === '[VERIFIED]') return <ConfidenceTag key={index} type="VERIFIED" />;
      if (part === '[ESTIMATED]') return <ConfidenceTag key={index} type="ESTIMATED" />;
      if (part === '[UNVERIFIED]') return <ConfidenceTag key={index} type="UNVERIFIED" />;
      return part;
    });
  };

  // Parse content with Markdown and confidence tags
  const renderContentWithTags = (content: string) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Handle text nodes to inject confidence tags
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed">
              {typeof children === 'string' ? processTextWithTags(children) : children}
            </p>
          ),
          // Style headings
          h3: ({ children }) => (
            <h3 className="text-base font-semibold text-[#1B2A4A] mt-6 mb-3 border-b border-gray-200 pb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold text-[#1B2A4A] mt-4 mb-2">{children}</h4>
          ),
          // Style lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-4 ml-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-4 ml-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700">
              {typeof children === 'string' ? processTextWithTags(children) : children}
            </li>
          ),
          // Style tables
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border border-gray-200 rounded-lg">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
              {typeof children === 'string' ? processTextWithTags(children) : children}
            </td>
          ),
          // Style bold text
          strong: ({ children }) => (
            <strong className="font-semibold text-[#1B2A4A]">{children}</strong>
          ),
          // Style code/metrics
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-[#C5985E]">
              {children}
            </code>
          ),
          // Handle inline text that might contain tags
          text: ({ children }) => {
            if (typeof children === 'string') {
              return <>{processTextWithTags(children)}</>;
            }
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full max-h-[95vh]">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-[#1B2A4A] to-[#2a3d5f]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C5985E]/20 rounded-lg">
                  <FileText className="w-6 h-6 text-[#C5985E]" />
                </div>
                <div>
                  <DialogTitle className="text-xl text-white flex items-center gap-2">
                    IC Memorandum
                    {memoResult && (
                      <Badge className={`${TIER_COLORS[memoResult.tier]} border text-xs`}>
                        Tier {memoResult.tier}: {memoResult.tierLabel}
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-white/70 text-sm mt-1">
                    {idea.title}
                  </DialogDescription>
                </div>
              </div>
              {memoResult && (
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <span>Data Completeness:</span>
                  <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C5985E] transition-all duration-500"
                      style={{ width: `${memoResult.completenessScore}%` }}
                    />
                  </div>
                  <span className="font-semibold text-[#C5985E]">{memoResult.completenessScore}%</span>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Content */}
          {!memoResult && !isStreaming ? (
            // Initial state - Generate button
            <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-6">
              <div className="text-center space-y-4 max-w-lg">
                <div className="w-20 h-20 mx-auto bg-[#1B2A4A]/10 rounded-full flex items-center justify-center">
                  <FileText className="w-10 h-10 text-[#1B2A4A]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1B2A4A]">Generate IC Memorandum</h3>
                <p className="text-muted-foreground">
                  AI-powered institutional-grade investment analysis with tier-based depth.
                  The memo tier is auto-detected based on your venture's data completeness.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
                    <div className="text-2xl font-bold text-amber-700">Tier 1</div>
                    <div className="text-xs text-amber-600 mt-1">Thesis Assessment</div>
                    <div className="text-xs text-muted-foreground mt-2">&lt;30% data</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
                    <div className="text-2xl font-bold text-yellow-700">Tier 2</div>
                    <div className="text-xs text-yellow-600 mt-1">Preliminary Memo</div>
                    <div className="text-xs text-muted-foreground mt-2">30-64% data</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-700">Tier 3</div>
                    <div className="text-xs text-green-600 mt-1">Full IC Memo</div>
                    <div className="text-xs text-muted-foreground mt-2">65%+ data</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGenerateMemo}
                size="lg"
                className="bg-[#1B2A4A] hover:bg-[#2a3d5f] text-white px-8"
              >
                <FileText className="w-5 h-5 mr-2" />
                Generate IC Memo
              </Button>
            </div>
          ) : isStreaming ? (
            // Loading state
            <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-8">
              <div className="w-full max-w-md space-y-6">
                {/* Phase indicators */}
                <div className="flex items-center justify-between">
                  {LOADING_PHASES.map((phase, index) => {
                    const Icon = phase.icon;
                    const isActive = index === loadingPhase;
                    const isComplete = index < loadingPhase;

                    return (
                      <div key={phase.id} className="flex flex-col items-center flex-1">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-[#1B2A4A] text-white scale-110'
                              : isComplete
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {isComplete ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : isActive ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <Icon className="w-6 h-6" />
                          )}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${isActive ? 'text-[#1B2A4A]' : 'text-muted-foreground'}`}>
                          {phase.name}
                        </span>
                        {index < LOADING_PHASES.length - 1 && (
                          <div className="absolute top-6 left-full w-full h-0.5 bg-gray-200">
                            <div
                              className="h-full bg-[#1B2A4A] transition-all duration-500"
                              style={{ width: isComplete ? '100%' : '0%' }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <Progress value={phaseProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground animate-pulse">
                    {loadingMessage}
                  </p>
                  {charCount > 0 && (
                    <p className="text-xs text-center text-[#C5985E]">
                      {charCount.toLocaleString()} characters generated
                    </p>
                  )}
                </div>

                {/* Streaming preview */}
                {streamingText && charCount > 100 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border max-h-40 overflow-hidden">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Live Preview:</p>
                    <p className="text-xs text-gray-600 font-mono whitespace-pre-wrap line-clamp-6">
                      {streamingText.slice(-500)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : memoResult ? (
            // Results state
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-56 border-r bg-[#F8F9FC] flex flex-col">
                <div className="p-4 space-y-4">
                  {/* Section navigation */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Sections
                    </h4>
                    {memoResult.sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                          activeSection === section.id
                            ? 'bg-[#1B2A4A] text-white'
                            : 'hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="truncate">{section.title}</span>
                        <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-50" />
                      </button>
                    ))}
                    <button
                      onClick={() => scrollToSection('expert-panel')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                        activeSection === 'expert-panel'
                          ? 'bg-[#1B2A4A] text-white'
                          : 'hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <span>Expert Panel</span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-50" />
                    </button>
                    <button
                      onClick={() => scrollToSection('recommendation')}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between ${
                        activeSection === 'recommendation'
                          ? 'bg-[#1B2A4A] text-white'
                          : 'hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <span>Recommendation</span>
                      <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-50" />
                    </button>
                  </div>

                  <Separator />

                  {/* Confidence stats */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Confidence
                    </h4>
                    <div className="space-y-1">
                      {renderConfidenceBadge('verified', memoResult.confidenceStats.verified)}
                      {renderConfidenceBadge('estimated', memoResult.confidenceStats.estimated)}
                      {renderConfidenceBadge('unverified', memoResult.confidenceStats.unverified)}
                    </div>
                  </div>

                  <Separator />

                  {/* Export buttons */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Export
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleExport('pdf')}
                      disabled={exportingFormat !== null}
                    >
                      {exportingFormat === 'pdf' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {exportingFormat === 'pdf' ? 'Exporting...' : 'Export PDF'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleExport('docx')}
                      disabled={exportingFormat !== null}
                    >
                      {exportingFormat === 'docx' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      {exportingFormat === 'docx' ? 'Exporting...' : 'Export DOCX'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-6">
                  {/* Disclaimer - immediately below title */}
                  {memoResult?.disclaimer && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
                      <p className="text-sm text-amber-800 leading-relaxed font-medium">
                        {memoResult.disclaimer}
                      </p>
                    </div>
                  )}

                  {/* Sections */}
                  <Accordion type="multiple" defaultValue={memoResult.sections.length > 0 ? [memoResult.sections[0].id] : []}>
                    {memoResult.sections.map((section) => (
                      <AccordionItem
                        key={section.id}
                        value={section.id}
                        ref={(el) => {
                          sectionRefs.current[section.id] = el;
                        }}
                      >
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-semibold text-[#1B2A4A]">{section.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-green-600">{section.confidenceTags.verified}V</span>
                              <span className="text-xs text-amber-600">{section.confidenceTags.estimated}E</span>
                              <span className="text-xs text-red-600">{section.confidenceTags.unverified}U</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed prose-headings:text-[#1B2A4A] prose-strong:text-[#1B2A4A] prose-table:border prose-th:bg-gray-50">
                            {renderContentWithTags(section.content)}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  {/* Expert Panel */}
                  <div
                    ref={(el) => {
                      sectionRefs.current['expert-panel'] = el;
                    }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Expert Panel Assessment
                    </h3>
                    <div className="grid gap-4">
                      {memoResult.expertPanel.map((expert, index) => (
                        <Card key={index} className="border-l-4 border-l-[#C5985E]">
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-base font-bold">{expert.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{expert.credentials}</p>
                                <Badge variant="outline" className="mt-1 text-xs text-[#C5985E] border-[#C5985E]">
                                  {expert.framework}
                                </Badge>
                              </div>
                              <Badge className={RATING_COLORS[expert.rating]}>
                                {expert.rating.replace('_', ' ')}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {expert.analysis}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Outstanding Diligence */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[#1B2A4A] flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Outstanding Diligence
                    </h3>
                    <div className="space-y-3">
                      {['gating', 'pre_close', 'supplementary'].map((category) => {
                        const items = memoResult.diligenceItems.filter(
                          (item) => item.category === category
                        );
                        if (items.length === 0) return null;

                        const categoryLabels = {
                          gating: 'Gating Items',
                          pre_close: 'Pre-Close Items',
                          supplementary: 'Supplementary Items',
                        };

                        return (
                          <div key={category}>
                            <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                              {categoryLabels[category as keyof typeof categoryLabels]}
                            </h4>
                            <div className="space-y-2">
                              {items.map((item, index) => (
                                <div
                                  key={index}
                                  className={`p-3 bg-gray-50 rounded-lg border-l-4 ${
                                    DILIGENCE_COLORS[item.category]
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <span className="text-sm">{item.item}</span>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        item.priority === 'high'
                                          ? 'border-red-300 text-red-700'
                                          : item.priority === 'medium'
                                          ? 'border-amber-300 text-amber-700'
                                          : 'border-blue-300 text-blue-700'
                                      }`}
                                    >
                                      {item.priority}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div
                    ref={(el) => {
                      sectionRefs.current['recommendation'] = el;
                    }}
                    className="mt-6"
                  >
                    <Card className="border-2 border-[#1B2A4A]/20 bg-gradient-to-br from-[#1B2A4A]/5 to-white">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl font-bold text-[#1B2A4A]">
                            Investment Recommendation
                          </CardTitle>
                          <div className="flex items-center gap-3">
                            <Badge className={`text-lg px-4 py-1 ${VERDICT_COLORS[memoResult.recommendation.verdict]}`}>
                              {memoResult.recommendation.verdict.replace('_', ' ')}
                            </Badge>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[#1B2A4A]">
                                {memoResult.recommendation.confidence}%
                              </div>
                              <div className="text-xs text-muted-foreground">Confidence</div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-gray-700 leading-relaxed">
                          {memoResult.recommendation.summary}
                        </p>
                        {memoResult.recommendation.conditions && memoResult.recommendation.conditions.length > 0 && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h4 className="font-semibold text-amber-800 mb-2">Conditions for Investment:</h4>
                            <ul className="space-y-1">
                              {memoResult.recommendation.conditions.map((condition, index) => (
                                <li key={index} className="text-sm text-amber-700 flex items-start gap-2">
                                  <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                  {condition}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Close button */}
                  <div className="flex justify-end pt-4">
                    <Button onClick={resetAndClose} variant="outline">
                      Close
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
