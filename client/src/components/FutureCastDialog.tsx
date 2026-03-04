import { useState, useEffect, useRef } from "react";
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
  Sparkles,
  Loader2,
  Search,
  Compass,
  GitBranch,
  Users,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Target,
  TrendingUp,
  Shield,
  Lightbulb,
  Map,
  BookOpen,
  ClipboardList,
  FileCheck,
  Download,
} from "lucide-react";

// ── Type Definitions ────────────────────────────────────────────────────────

interface FutureCastDialogProps {
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
    revenuePotential?: string;
  };
}

type PhaseStatus = 'pending' | 'loading' | 'complete' | 'error';

interface PhaseData {
  status: PhaseStatus;
  data?: any;
  error?: string;
}

interface PhaseState {
  research: PhaseData;
  horizons: PhaseData;
  scenarios: PhaseData;
  panel: PhaseData;
  synthesis: PhaseData;
}

// ── Phase Configuration ─────────────────────────────────────────────────────

const PHASE_CONFIG = [
  {
    id: 'research',
    name: 'Strategic Research',
    icon: Search,
    description: 'Market intelligence & competitive analysis',
    activities: [
      'Querying market intelligence databases...',
      'Analyzing competitive landscape...',
      'Gathering technology trend data...',
      'Processing regulatory environment...',
      'Synthesizing research foundation...',
    ],
  },
  {
    id: 'horizons',
    name: 'Future Horizons',
    icon: Compass,
    description: 'Three Horizons Framework analysis',
    activities: [
      'Mapping 0-2 year developments...',
      'Projecting 2-5 year trajectories...',
      'Modeling 5-10 year possibilities...',
      'Identifying driving forces...',
      'Analyzing critical uncertainties...',
    ],
  },
  {
    id: 'scenarios',
    name: 'Scenario Planning',
    icon: GitBranch,
    description: 'Shell/GBN methodology scenarios',
    activities: [
      'Constructing scenario matrix...',
      'Developing alternative futures...',
      'Assessing probability distributions...',
      'Identifying robust strategies...',
      'Mapping contingent responses...',
    ],
  },
  {
    id: 'panel',
    name: 'Expert Panel',
    icon: Users,
    description: 'Virtual expert advisory panel',
    activities: [
      'Assembling virtual expert panel...',
      'Gathering strategic perspectives...',
      'Analyzing framework applications...',
      'Synthesizing consensus views...',
      'Documenting dissenting positions...',
    ],
  },
  {
    id: 'synthesis',
    name: 'Final Synthesis',
    icon: Sparkles,
    description: 'Integrated strategic intelligence',
    activities: [
      'Integrating all strategic intelligence...',
      'Formulating strategic imperatives...',
      'Assessing future readiness...',
      'Building implementation roadmap...',
      'Finalizing institutional report...',
    ],
  },
];

// ── Loading Animation Component ─────────────────────────────────────────────

function PhaseLoadingAnimation({
  phaseConfig,
  currentActivity,
}: {
  phaseConfig: typeof PHASE_CONFIG[0];
  currentActivity: number;
}) {
  const Icon = phaseConfig.icon;

  return (
    <Card className="border-indigo-200 bg-indigo-50/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center animate-pulse">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-indigo-900">{phaseConfig.name}</h3>
            <p className="text-sm text-indigo-600">{phaseConfig.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          {phaseConfig.activities.map((activity, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 text-sm transition-opacity duration-300 ${
                idx < currentActivity
                  ? 'text-indigo-600'
                  : idx === currentActivity
                  ? 'text-indigo-800 font-medium'
                  : 'text-indigo-400'
              }`}
            >
              {idx < currentActivity ? (
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              ) : idx === currentActivity ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-indigo-300" />
              )}
              {activity}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Phase Progress Tracker ──────────────────────────────────────────────────

function PhaseProgressTracker({
  phases,
  currentPhaseId,
}: {
  phases: PhaseState;
  currentPhaseId: string | null;
}) {
  const phaseOrder = ['research', 'horizons', 'scenarios', 'panel', 'synthesis'];

  return (
    <div className="flex items-center justify-between mb-6 px-2">
      {PHASE_CONFIG.map((config, idx) => {
        const phaseKey = config.id as keyof PhaseState;
        const status = phases[phaseKey].status;
        const Icon = config.icon;
        const isActive = currentPhaseId === config.id;

        return (
          <div key={config.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  status === 'complete'
                    ? 'bg-green-500 text-white'
                    : status === 'error'
                    ? 'bg-red-500 text-white'
                    : status === 'loading'
                    ? 'bg-indigo-500 text-white animate-pulse'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {status === 'complete' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : status === 'error' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs mt-1 text-center max-w-[80px] ${
                  status === 'complete'
                    ? 'text-green-600 font-medium'
                    : status === 'loading'
                    ? 'text-indigo-600 font-medium'
                    : 'text-gray-500'
                }`}
              >
                {config.name}
              </span>
            </div>
            {idx < PHASE_CONFIG.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-1 ${
                  phases[phaseOrder[idx + 1] as keyof PhaseState].status !== 'pending'
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Results Display Components ──────────────────────────────────────────────

function ResearchResults({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {data.serpResults && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <Search className="w-4 h-4" />
            Live market data integrated from{' '}
            {data.serpResults.marketTrends.length + data.serpResults.competitorIntel.length + data.serpResults.emergingTech.length}{' '}
            web sources
          </p>
        </div>
      )}

      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          Market Landscape
        </h4>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.research.marketLandscape}</p>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          Competitive Intelligence
        </h4>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.research.competitiveIntelligence}</p>
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-indigo-500" />
          Technology Trends
        </h4>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.research.technologyTrends}</p>
      </div>

      <Separator />

      {/* Market Demand Metrics (OA Framework §2) */}
      {data.marketDemand && data.marketDemand.metricCards && data.marketDemand.metricCards.length > 0 && (
        <>
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Market Demand Metrics
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {data.marketDemand.metricCards.map((card: any, i: number) => (
                <Card key={i} className="border-green-200">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">{card.metric}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          card.confidence === 'high' ? 'border-green-300 text-green-600' :
                          card.confidence === 'medium' ? 'border-amber-300 text-amber-600' :
                          'border-gray-300 text-gray-600'
                        }`}
                      >
                        {card.confidence}
                      </Badge>
                    </div>
                    <div className="text-lg font-bold text-gray-800">{card.value}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs ${
                        card.trend === 'increasing' ? 'text-green-600' :
                        card.trend === 'decreasing' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {card.trend === 'increasing' ? '↑' : card.trend === 'decreasing' ? '↓' : '→'} {card.trend}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{card.source}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {data.marketDemand.convergenceTrends && data.marketDemand.convergenceTrends.length > 0 && (
            <div>
              <h5 className="font-medium text-sm mb-2">Convergence Trends</h5>
              <div className="space-y-2">
                {data.marketDemand.convergenceTrends.slice(0, 4).map((trend: any, i: number) => (
                  <div key={i} className="p-2 bg-green-50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{trend.trend}</span>
                      <Badge variant="outline" className="text-xs">{trend.impact} impact</Badge>
                      <span className="text-xs text-gray-500">{trend.timeline}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{trend.source}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2 text-sm">Key Uncertainties</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {data.research.keyUncertainties?.map((u: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 mt-1 text-amber-500 flex-shrink-0" />
                {u}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-sm">Critical Assumptions</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {data.research.criticalAssumptions?.map((a: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 mt-1 text-green-500 flex-shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-xs text-gray-400 mt-4">
        ~{data.wordCount} words | Generated {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

function HorizonsResults({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {['horizon1', 'horizon2', 'horizon3'].map((h) => (
        <Card key={h} className="border-l-4 border-l-indigo-500">
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{data.horizons[h].title}</span>
              <Badge variant="outline">{data.horizons[h].timeframe}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{data.horizons[h].narrative}</p>
            <div className="text-xs text-gray-500">
              <strong>Impact:</strong> {data.horizons[h].impactOnVenture}
            </div>
          </CardContent>
        </Card>
      ))}

      <Separator />

      <div>
        <h4 className="font-semibold mb-2">Driving Forces</h4>
        <div className="grid gap-2">
          {data.drivingForces?.slice(0, 4).map((f: any, i: number) => (
            <div key={i} className="p-2 bg-gray-50 rounded text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{f.force}</span>
                <Badge variant="outline" className="text-xs">
                  {f.certainty} certainty
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {f.impact} impact
                </Badge>
              </div>
              <p className="text-gray-600 text-xs">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-gray-400 mt-4">
        ~{data.wordCount} words | Generated {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

function ScenariosResults({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {data.scenarios?.map((s: any, i: number) => (
          <Card key={i} className="border-indigo-200">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{s.name}</span>
                <Badge className="bg-indigo-100 text-indigo-700">{s.probability}%</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
              <p className="text-xs text-gray-600 line-clamp-4">{s.narrative}</p>
              <div className="mt-2">
                <span className="text-xs font-medium">Strategic moves:</span>
                <ul className="text-xs text-gray-500 mt-1">
                  {s.strategicMoves?.slice(0, 3).map((m: string, j: number) => (
                    <li key={j}>• {m}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-500" />
          Robust Strategies (work across all scenarios)
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          {data.robustStrategies?.map((s: string, i: number) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-xs text-gray-400 mt-4">
        ~{data.wordCount} words | Generated {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

function PanelResults({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      {data.panelists?.map((p: any, i: number) => (
        <Card key={i} className="border-l-4 border-l-indigo-400">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div>
                <span className="font-semibold">{p.name}</span>
                <span className="text-gray-500 ml-2 text-xs">{p.credentials}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {p.confidence}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <p className="text-xs text-indigo-600 mb-2">Framework: {p.framework}</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">{p.perspectiveAnalysis}</p>
            {p.dissent && (
              <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-amber-800">
                <strong>Dissent:</strong> {p.dissent}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2 text-sm text-green-600">Consensus Points</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {data.consensusPoints?.slice(0, 5).map((p: string, i: number) => (
              <li key={i}>✓ {p}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-sm text-amber-600">Synthesized Recommendations</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {data.synthesizedRecommendations?.slice(0, 5).map((r: string, i: number) => (
              <li key={i}>→ {r}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-xs text-gray-400 mt-4">
        ~{data.wordCount} words | Generated {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

function SynthesisResults({ data }: { data: any }) {
  const outlookColors = {
    highly_favorable: 'bg-green-500 text-white',
    favorable: 'bg-green-400 text-white',
    mixed: 'bg-amber-500 text-white',
    challenging: 'bg-orange-500 text-white',
    highly_challenging: 'bg-red-500 text-white',
  };

  return (
    <div className="space-y-4">
      {/* Disclaimer - immediately at top */}
      {data.disclaimer && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
          <p className="text-sm text-amber-800 leading-relaxed font-medium">
            {data.disclaimer}
          </p>
        </div>
      )}

      {/* Executive Summary */}
      <Card className="border-indigo-300 bg-indigo-50/30">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Executive Summary</span>
            <div className="flex items-center gap-2">
              <Badge className={outlookColors[data.executiveSummary.ventureOutlook as keyof typeof outlookColors] || 'bg-gray-500'}>
                {data.executiveSummary.ventureOutlook?.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline">{data.executiveSummary.confidenceLevel}% confidence</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.executiveSummary.summaryNarrative}</p>
        </CardContent>
      </Card>

      {/* Strategic Imperatives */}
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          Strategic Imperatives
        </h4>
        <div className="space-y-2">
          {data.strategicImperatives?.slice(0, 5).map((imp: any, i: number) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg border-l-4 border-l-indigo-500">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-indigo-600 text-white">#{imp.priority}</Badge>
                <span className="font-medium text-sm">{imp.imperative}</span>
              </div>
              <p className="text-xs text-gray-600">{imp.rationale}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span><Clock className="w-3 h-3 inline mr-1" />{imp.timeframe}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Future Readiness */}
      <div>
        <h4 className="font-semibold mb-2">Future Readiness: {data.futureReadinessAssessment?.overallScore}/100</h4>
        <Progress value={data.futureReadinessAssessment?.overallScore || 0} className="h-2 mb-3" />
        <div className="grid grid-cols-2 gap-2">
          {data.futureReadinessAssessment?.dimensions?.slice(0, 4).map((d: any, i: number) => (
            <div key={i} className="p-2 bg-gray-50 rounded text-xs">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{d.dimension}</span>
                <span className="text-indigo-600">{d.score}/100</span>
              </div>
              <Progress value={d.score} className="h-1" />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Implementation Roadmap */}
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Map className="w-4 h-4 text-indigo-500" />
          Implementation Roadmap
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(data.implementationRoadmap || {}).map(([key, value]: [string, any]) => (
            <div key={key} className="p-2 bg-gray-50 rounded">
              <div className="font-medium text-sm mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1')} ({value.timeframe})
              </div>
              <ul className="text-xs text-gray-600">
                {value.actions?.slice(0, 3).map((a: string, i: number) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Research Checklist (OA Framework §13) */}
      {data.researchChecklist && data.researchChecklist.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-amber-500" />
            Research Verification Checklist
          </h4>
          <p className="text-xs text-gray-500 mb-3">
            Claims requiring verification before final decision-making
          </p>
          <div className="space-y-2">
            {data.researchChecklist.map((item: any, i: number) => (
              <div key={i} className="p-2 bg-amber-50 rounded border-l-2 border-l-amber-400">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.claimSummary}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          item.priority === 'high' ? 'border-red-300 text-red-600' :
                          item.priority === 'medium' ? 'border-amber-300 text-amber-600' :
                          'border-gray-300 text-gray-600'
                        }`}
                      >
                        {item.priority} priority
                      </Badge>
                      <Badge variant="outline" className="text-xs">{item.verificationMethod?.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                  <FileCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                </div>
                {item.responsibleParty && (
                  <p className="text-xs text-gray-500 mt-1">
                    Assigned to: {item.responsibleParty} | Deadline: {item.deadlineRecommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Appendix - Sources */}
      {data.appendix && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Appendix: Sources & Methodology
          </h4>

          {data.appendix.sourcesConsulted && data.appendix.sourcesConsulted.length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Sources Consulted</h5>
              <ul className="text-xs text-gray-600 space-y-1">
                {data.appendix.sourcesConsulted.map((source: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400">•</span>
                    {source}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.appendix.methodologyNotes && (
            <div className="mb-3">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Methodology Notes</h5>
              <p className="text-xs text-gray-600">{data.appendix.methodologyNotes}</p>
            </div>
          )}

          {data.appendix.confidenceIntervals && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Confidence & Limitations</h5>
              <p className="text-xs text-gray-600">{data.appendix.confidenceIntervals}</p>
            </div>
          )}

          {/* OA Framework Badge */}
          {data.oaFramework && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Badge variant="outline" className="text-xs bg-white">
                  OA Framework v{data.oaFramework.version}
                </Badge>
                <span>|</span>
                <span>Data as of: {data.oaFramework.dataFreshness}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-400 mt-4">
        ~{data.wordCount} words | Generated {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

// ── Main Dialog Component ───────────────────────────────────────────────────

export default function FutureCastDialog({ open, onOpenChange, idea }: FutureCastDialogProps) {
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const activityIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [phases, setPhases] = useState<PhaseState>({
    research: { status: 'pending' },
    horizons: { status: 'pending' },
    scenarios: { status: 'pending' },
    panel: { status: 'pending' },
    synthesis: { status: 'pending' },
  });

  const [currentPhaseId, setCurrentPhaseId] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [expandedPhases, setExpandedPhases] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Get current loading phase config
  const currentPhaseConfig = PHASE_CONFIG.find(p => p.id === currentPhaseId);

  // Export to PDF handler
  const handleExportPdf = async () => {
    if (!phases.synthesis.data && !phases.research.data) {
      toast({
        title: "Nothing to export",
        description: "Please wait for the analysis to complete before exporting.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const exportData = {
        ideaId: idea.id,
        ideaTitle: idea.title,
        ideaDescription: idea.description,
        phases: {
          research: phases.research.data || null,
          horizons: phases.horizons.data || null,
          scenarios: phases.scenarios.data || null,
          panel: phases.panel.data || null,
          synthesis: phases.synthesis.data || null,
        },
        exportTimestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/ai/future-cast/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportData),
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
      let filename = `FutureCast-${idea.title.replace(/[^a-z0-9]/gi, '-').substring(0, 40)}.pdf`;
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
        description: "Future Cast report exported as PDF",
      });
    } catch (error: any) {
      console.error('FutureCast PDF export error:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export as PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setPhases({
        research: { status: 'pending' },
        horizons: { status: 'pending' },
        scenarios: { status: 'pending' },
        panel: { status: 'pending' },
        synthesis: { status: 'pending' },
      });
      setCurrentPhaseId(null);
      setCurrentActivity(0);
      setExpandedPhases([]);

      // Auto-start Phase 1
      runPhase1();
    } else {
      // Cleanup on close
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Activity animation
  useEffect(() => {
    if (currentPhaseConfig && currentPhaseId) {
      setCurrentActivity(0);
      activityIntervalRef.current = setInterval(() => {
        setCurrentActivity(prev => {
          if (prev < currentPhaseConfig.activities.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 3000);

      return () => {
        if (activityIntervalRef.current) {
          clearInterval(activityIntervalRef.current);
        }
      };
    }
  }, [currentPhaseId, currentPhaseConfig]);

  // Phase chaining effect
  useEffect(() => {
    if (phases.research.status === 'complete' && phases.horizons.status === 'pending') {
      runPhase2();
    }
  }, [phases.research.status]);

  useEffect(() => {
    if (phases.horizons.status === 'complete' && phases.scenarios.status === 'pending') {
      runPhase3();
    }
  }, [phases.horizons.status]);

  useEffect(() => {
    if (phases.scenarios.status === 'complete' && phases.panel.status === 'pending') {
      runPhase4();
    }
  }, [phases.scenarios.status]);

  useEffect(() => {
    if (phases.panel.status === 'complete' && phases.synthesis.status === 'pending') {
      runPhase5();
    }
  }, [phases.panel.status]);

  // Phase execution functions
  const runPhase1 = async () => {
    setCurrentPhaseId('research');
    setPhases(prev => ({ ...prev, research: { status: 'loading' } }));

    try {
      abortControllerRef.current = new AbortController();
      const response = await fetch('/api/ai/future-cast/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: idea.id }),
        credentials: 'include',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setPhases(prev => ({ ...prev, research: { status: 'complete', data } }));
      setExpandedPhases(prev => [...prev, 'research']);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      setPhases(prev => ({ ...prev, research: { status: 'error', error: error.message } }));
      toast({ title: 'Phase 1 Failed', description: error.message, variant: 'destructive' });
    }
  };

  const runPhase2 = async () => {
    setCurrentPhaseId('horizons');
    setPhases(prev => ({ ...prev, horizons: { status: 'loading' } }));

    try {
      const response = await fetch('/api/ai/future-cast/horizons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          research: phases.research.data,
        }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setPhases(prev => ({ ...prev, horizons: { status: 'complete', data } }));
      setExpandedPhases(prev => [...prev, 'horizons']);
    } catch (error: any) {
      setPhases(prev => ({ ...prev, horizons: { status: 'error', error: error.message } }));
      toast({ title: 'Phase 2 Failed', description: error.message, variant: 'destructive' });
    }
  };

  const runPhase3 = async () => {
    setCurrentPhaseId('scenarios');
    setPhases(prev => ({ ...prev, scenarios: { status: 'loading' } }));

    try {
      const response = await fetch('/api/ai/future-cast/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          research: phases.research.data,
          horizons: phases.horizons.data,
        }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setPhases(prev => ({ ...prev, scenarios: { status: 'complete', data } }));
      setExpandedPhases(prev => [...prev, 'scenarios']);
    } catch (error: any) {
      setPhases(prev => ({ ...prev, scenarios: { status: 'error', error: error.message } }));
      toast({ title: 'Phase 3 Failed', description: error.message, variant: 'destructive' });
    }
  };

  const runPhase4 = async () => {
    setCurrentPhaseId('panel');
    setPhases(prev => ({ ...prev, panel: { status: 'loading' } }));

    try {
      const response = await fetch('/api/ai/future-cast/panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          research: phases.research.data,
          horizons: phases.horizons.data,
          scenarios: phases.scenarios.data,
        }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setPhases(prev => ({ ...prev, panel: { status: 'complete', data } }));
      setExpandedPhases(prev => [...prev, 'panel']);
    } catch (error: any) {
      setPhases(prev => ({ ...prev, panel: { status: 'error', error: error.message } }));
      toast({ title: 'Phase 4 Failed', description: error.message, variant: 'destructive' });
    }
  };

  const runPhase5 = async () => {
    setCurrentPhaseId('synthesis');
    setPhases(prev => ({ ...prev, synthesis: { status: 'loading' } }));

    try {
      const response = await fetch('/api/ai/future-cast/synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId: idea.id,
          research: phases.research.data,
          horizons: phases.horizons.data,
          scenarios: phases.scenarios.data,
          panel: phases.panel.data,
        }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setPhases(prev => ({ ...prev, synthesis: { status: 'complete', data } }));
      setExpandedPhases(prev => [...prev, 'synthesis']);
      setCurrentPhaseId(null);

      toast({
        title: 'Future Cast Complete',
        description: 'All 5 phases of strategic intelligence have been generated.',
      });
    } catch (error: any) {
      setPhases(prev => ({ ...prev, synthesis: { status: 'error', error: error.message } }));
      toast({ title: 'Phase 5 Failed', description: error.message, variant: 'destructive' });
    }
  };

  // Retry handler
  const retryPhase = (phaseId: string) => {
    switch (phaseId) {
      case 'research':
        runPhase1();
        break;
      case 'horizons':
        runPhase2();
        break;
      case 'scenarios':
        runPhase3();
        break;
      case 'panel':
        runPhase4();
        break;
      case 'synthesis':
        runPhase5();
        break;
    }
  };

  // Calculate total word count
  const totalWords = Object.values(phases).reduce((sum, p) => {
    return sum + (p.data?.wordCount || 0);
  }, 0);

  const completedPhases = Object.values(phases).filter(p => p.status === 'complete').length;
  const isComplete = completedPhases === 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader className="border-b pb-4 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-500" />
                Future Cast
                {isComplete && (
                  <Badge className="bg-green-500 text-white ml-2">Complete</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Strategic Intelligence for: <span className="font-medium text-indigo-600">{idea.title}</span>
                {totalWords > 0 && (
                  <span className="ml-2 text-indigo-500">• ~{totalWords.toLocaleString()} words</span>
                )}
              </DialogDescription>
            </div>
            {/* Export PDF Button - visible when at least research is complete */}
            {(phases.research.status === 'complete' || isComplete) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={isExporting}
                className="flex items-center gap-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Progress Tracker */}
          <div className="py-4 border-b bg-gray-50/50 flex-shrink-0">
            <PhaseProgressTracker phases={phases} currentPhaseId={currentPhaseId} />
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4">
              {/* Loading Animation */}
              {currentPhaseConfig && currentPhaseId && (
                <div className="mb-6">
                  <PhaseLoadingAnimation
                    phaseConfig={currentPhaseConfig}
                    currentActivity={currentActivity}
                  />
                </div>
              )}

              {/* Results Accordion */}
              <Accordion
                type="multiple"
                value={expandedPhases}
                onValueChange={setExpandedPhases}
                className="space-y-3"
              >
              {PHASE_CONFIG.map((config) => {
                const phaseKey = config.id as keyof PhaseState;
                const phase = phases[phaseKey];
                const Icon = config.icon;

                if (phase.status === 'pending' && !phase.data) return null;

                return (
                  <AccordionItem key={config.id} value={config.id} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            phase.status === 'complete'
                              ? 'bg-green-100 text-green-600'
                              : phase.status === 'error'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-indigo-100 text-indigo-600'
                          }`}
                        >
                          {phase.status === 'complete' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : phase.status === 'error' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">
                            Phase {PHASE_CONFIG.findIndex(p => p.id === config.id) + 1}: {config.name}
                          </div>
                          <div className="text-xs text-gray-500">{config.description}</div>
                        </div>
                        {phase.data?.wordCount && (
                          <Badge variant="outline" className="ml-auto mr-2">
                            ~{phase.data.wordCount} words
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {phase.status === 'error' ? (
                        <div className="p-4 bg-red-50 rounded-lg">
                          <p className="text-red-700 mb-3">{phase.error}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => retryPhase(config.id)}
                            className="border-red-300 text-red-600"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry Phase
                          </Button>
                        </div>
                      ) : phase.data ? (
                        <>
                          {config.id === 'research' && <ResearchResults data={phase.data} />}
                          {config.id === 'horizons' && <HorizonsResults data={phase.data} />}
                          {config.id === 'scenarios' && <ScenariosResults data={phase.data} />}
                          {config.id === 'panel' && <PanelResults data={phase.data} />}
                          {config.id === 'synthesis' && <SynthesisResults data={phase.data} />}
                        </>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
