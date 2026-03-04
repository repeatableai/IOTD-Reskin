import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Target,
  Shield,
  TrendingDown,
  Users,
  Bomb,
  Rocket,
  RefreshCw,
} from "lucide-react";

import ExecutiveSummaryTab from "./tabs/ExecutiveSummaryTab";
import DisruptionVectorsTab from "./tabs/DisruptionVectorsTab";
import MoatDurabilityTab from "./tabs/MoatDurabilityTab";
import MarginCompressionTab from "./tabs/MarginCompressionTab";
import ExpertPanelTab from "./tabs/ExpertPanelTab";
import TorpedoAnalysisTab from "./tabs/TorpedoAnalysisTab";
import StrategicActionsTab from "./tabs/StrategicActionsTab";

// Type imports
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

interface ScannerResultsProps {
  data: DisruptionScanResult;
  companyName: string;
  onRescan: () => void;
}

const TABS = [
  { id: "summary", label: "Summary", icon: BarChart3 },
  { id: "vectors", label: "Disruption Vectors", icon: Target },
  { id: "moat", label: "Moat Analysis", icon: Shield },
  { id: "margin", label: "Margin Compression", icon: TrendingDown },
  { id: "experts", label: "Expert Panel", icon: Users },
  { id: "torpedo", label: "Torpedo Analysis", icon: Bomb },
  { id: "actions", label: "Strategic Actions", icon: Rocket },
];

export default function ScannerResults({ data, companyName, onRescan }: ScannerResultsProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-[#1B2A4A]">
            AI Disruption Assessment
          </h3>
          <p className="text-sm text-[#1B2A4A]/60">
            Analysis for {companyName}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRescan}
          className="border-[#1B2A4A]/20 text-[#1B2A4A] hover:bg-[#1B2A4A]/5"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          New Scan
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full justify-start bg-[#F8F9FC] border border-[#1B2A4A]/10 p-1 h-auto flex-wrap gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-[#1B2A4A] data-[state=active]:text-white text-[#1B2A4A]/70 px-3 py-2"
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="summary" className="m-0">
            <ExecutiveSummaryTab data={data.executiveSummary} />
          </TabsContent>

          <TabsContent value="vectors" className="m-0">
            <DisruptionVectorsTab data={data.disruptionVectors} />
          </TabsContent>

          <TabsContent value="moat" className="m-0">
            <MoatDurabilityTab data={data.moatAssessment} />
          </TabsContent>

          <TabsContent value="margin" className="m-0">
            <MarginCompressionTab data={data.marginCompression} />
          </TabsContent>

          <TabsContent value="experts" className="m-0">
            <ExpertPanelTab data={data.expertPanel} />
          </TabsContent>

          <TabsContent value="torpedo" className="m-0">
            <TorpedoAnalysisTab data={data.torpedoAnalysis} />
          </TabsContent>

          <TabsContent value="actions" className="m-0">
            <StrategicActionsTab data={data.strategicActions} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
