import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  AlertTriangle,
  Users,
  GitMerge,
  FileText,
} from "lucide-react";

import RadarDimensionsTab from "./tabs/RadarDimensionsTab";
import RedFlagsTab from "./tabs/RedFlagsTab";
import ExpertPanelTab from "./tabs/ExpertPanelTab";
import FrameworkFusionTab from "./tabs/FrameworkFusionTab";
import SourcesTab from "./tabs/SourcesTab";

// Types from bellMasonService
interface DiagnosticQuestion {
  question: string;
  answer: 'YES' | 'NO' | 'UNKNOWN' | 'PARTIALLY';
  evidence: string;
  sourceIds: string[];
  dataGap: boolean;
}

interface DimensionScore {
  dimension: string;
  category: 'operational' | 'market' | 'managerial' | 'financial';
  score: number;
  ideal: number;
  status: 'AHEAD' | 'ON_TRACK' | 'SLIGHT_GAP' | 'GAP' | 'CRITICAL_GAP';
  narrative: string;
  diagnosticQuestions: DiagnosticQuestion[];
}

interface RedFlag {
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  affectedDimensions: string[];
  recommendation: string;
  timeline: string;
  estimatedBudget?: string;
}

interface ExpertVerdict {
  name: string;
  credentials: string;
  frameworkLens: string;
  verdict: string;
  rating: 'STRONG_INVEST' | 'INVEST' | 'CONDITIONAL' | 'CAUTIOUS' | 'PASS';
  keyQuestion: string;
}

interface FrameworkScore {
  framework: string;
  score: number;
  methodology: string;
  keyFindings: string[];
}

interface ResearchSource {
  id: string;
  title: string;
  url: string;
  type: 'funding' | 'team' | 'product' | 'ip' | 'market' | 'traction' | 'news' | 'financials';
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'N/A';
  findings: string;
}

interface BellMasonDiagnosticResult {
  dimensions: DimensionScore[];
  overallScore: number;
  stageAssessment: {
    currentStage: string;
    readinessForNext: number;
    blockers: string[];
  };
  redFlags: RedFlag[];
  expertPanel: ExpertVerdict[];
  frameworkFusion: {
    bellMason: FrameworkScore;
    bessemer: FrameworkScore;
    sequoia: FrameworkScore;
    a16z: FrameworkScore;
    agreements: string[];
    divergences: string[];
  };
  recommendations: string[];
  diagnosticTimestamp: string;
}

interface BellMasonResearchResult {
  sources: ResearchSource[];
  summary: {
    funding: string;
    team: string;
    product: string;
    ip: string;
    market: string;
    traction: string;
    news: string;
    financials: string;
  };
  dataGapAreas: string[];
  researchTimestamp: string;
}

interface DiagnosticResultsProps {
  diagnostic: BellMasonDiagnosticResult;
  research: BellMasonResearchResult;
  ventureName: string;
  stage: string;
}

export default function DiagnosticResults({
  diagnostic,
  research,
  ventureName,
  stage,
}: DiagnosticResultsProps) {
  const [activeTab, setActiveTab] = useState('radar');

  // Defensive: ensure arrays exist before filtering
  const redFlags = diagnostic?.redFlags || [];
  const dimensions = diagnostic?.dimensions || [];
  const expertPanel = diagnostic?.expertPanel || [];
  const recommendations = diagnostic?.recommendations || [];
  const sources = research?.sources || [];
  const dataGapAreas = research?.dataGapAreas || [];

  // Count red flags by severity
  const criticalCount = redFlags.filter(f => f.severity === 'CRITICAL').length;
  const highCount = redFlags.filter(f => f.severity === 'HIGH').length;

  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
        <strong>DISCLAIMER:</strong> Below is a partially contemplated implementation of the Bell-Mason architecture based on publicly available information about the framework. This is not a licensed use of the Bell-Mason architecture. What this will give you is an initial assessment with cited data sources where they are available. Given the lack of public data or most pre-seed start-ups or early-state ventures, most sources will be empty. This will give you an initial view of the potential of a full Bell-Mason evaluation, requiring licensing from Bell-Mason for their platform directly.
      </div>

      {/* Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gradient-to-r from-amber-50 to-purple-50 rounded-lg border border-amber-200">
        <div>
          <h2 className="text-xl font-bold">{ventureName}</h2>
          <p className="text-sm text-muted-foreground">
            Stage: {stage} | Overall Score: {diagnostic?.overallScore ?? 50}/100
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Stage Readiness</p>
            <p className="text-lg font-bold">{diagnostic?.stageAssessment?.readinessForNext ?? 50}%</p>
          </div>
          {criticalCount > 0 && (
            <Badge className="bg-red-500 text-white">
              {criticalCount} Critical
            </Badge>
          )}
          {highCount > 0 && (
            <Badge className="bg-orange-500 text-white">
              {highCount} High Risk
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="radar" className="flex items-center gap-1 text-xs sm:text-sm">
            <Target className="w-4 h-4 hidden sm:inline" />
            <span>Radar</span>
          </TabsTrigger>
          <TabsTrigger value="redflags" className="flex items-center gap-1 text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 hidden sm:inline" />
            <span>Red Flags</span>
            {redFlags.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {redFlags.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="experts" className="flex items-center gap-1 text-xs sm:text-sm">
            <Users className="w-4 h-4 hidden sm:inline" />
            <span>Experts</span>
          </TabsTrigger>
          <TabsTrigger value="fusion" className="flex items-center gap-1 text-xs sm:text-sm">
            <GitMerge className="w-4 h-4 hidden sm:inline" />
            <span>Fusion</span>
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-1 text-xs sm:text-sm">
            <FileText className="w-4 h-4 hidden sm:inline" />
            <span>Sources</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {sources.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="radar" className="mt-0">
            <RadarDimensionsTab
              dimensions={dimensions}
              overallScore={diagnostic?.overallScore ?? 50}
            />
          </TabsContent>

          <TabsContent value="redflags" className="mt-0">
            <RedFlagsTab redFlags={redFlags} />
          </TabsContent>

          <TabsContent value="experts" className="mt-0">
            <ExpertPanelTab experts={expertPanel} />
          </TabsContent>

          <TabsContent value="fusion" className="mt-0">
            <FrameworkFusionTab fusion={diagnostic?.frameworkFusion} />
          </TabsContent>

          <TabsContent value="sources" className="mt-0">
            <SourcesTab
              sources={sources}
              dataGapAreas={dataGapAreas}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-700 mb-2">Key Recommendations</h3>
          <ul className="space-y-1">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-blue-500 font-bold">{i + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
