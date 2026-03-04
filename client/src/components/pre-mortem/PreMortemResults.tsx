import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  AlertTriangle,
  FileText,
  Shield,
  RefreshCw,
  Download,
  Printer,
  HelpCircle,
} from "lucide-react";

import SeveritySummaryTab from "./tabs/SeveritySummaryTab";
import FailureModesTab from "./tabs/FailureModesTab";
import NarrativeAccordionTab from "./tabs/NarrativeAccordionTab";
import MitigationActionsTab from "./tabs/MitigationActionsTab";
import PreMortemHelpModal from "./PreMortemHelpModal";

interface FailurePointRemoval {
  currentRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  mitigatedRiskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedRiskReduction: number;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface Perspective {
  perspectiveId: string;
  perspectiveName: string;
  criticLens: string;
  riskDomain: string;
  failureNarrative: string;
  rootCause: string;
  mitigationActions: string[];
  failurePointRemoval: FailurePointRemoval;
}

interface PreMortemResult {
  perspectives: Perspective[];
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

interface PreMortemResultsProps {
  data: PreMortemResult;
  ventureName: string;
  onRegenerate: () => void;
}

const TABS = [
  { id: "summary", label: "Summary", icon: BarChart3 },
  { id: "modes", label: "Failure Modes", icon: AlertTriangle },
  { id: "narratives", label: "Narratives", icon: FileText },
  { id: "actions", label: "Mitigations", icon: Shield },
];

export default function PreMortemResults({ data, ventureName, onRegenerate }: PreMortemResultsProps) {
  const [activeTab, setActiveTab] = useState("summary");
  const [selectedPerspectiveId, setSelectedPerspectiveId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // When a failure mode card is clicked, switch to narratives tab with that perspective expanded
  const handleSelectPerspective = (perspectiveId: string) => {
    setSelectedPerspectiveId(perspectiveId);
    setActiveTab("narratives");
  };

  // Export as text
  const exportAsText = () => {
    const text = `
PRE-MORTEM ANALYSIS: ${ventureName}
Generated: ${new Date(data.metadata.generatedAt).toLocaleString()}
Severity Score: ${data.compositeSeverityScore}/100 (${data.severityTier})

EXECUTIVE SUMMARY
${data.executiveSummary}

${data.perspectives.map((p, i) => `
---
FAILURE MODE ${i + 1}: ${p.perspectiveName}
Critic: ${p.criticLens}
Risk Domain: ${p.riskDomain}
Current Risk: ${p.failurePointRemoval.currentRiskLevel}

HOW WE FAILED:
${p.failureNarrative}

ROOT CAUSE:
${p.rootCause}

MITIGATION ACTIONS:
${p.mitigationActions.map((a, j) => `${j + 1}. ${a}`).join('\n')}

Risk Reduction Potential: ${p.failurePointRemoval.estimatedRiskReduction}%
`).join('\n')}

---
DISCLAIMER: This analysis is AI-generated based on available venture data.
Use as one input among many in your decision-making process.
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      alert('Analysis copied to clipboard');
    });
  };

  // Print / PDF export
  const exportAsPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h3 className="text-xl font-bold text-[#1B2A4A]">
            Pre-Mortem Analysis
          </h3>
          <p className="text-sm text-[#1B2A4A]/60">
            {ventureName} - Generated {new Date(data.metadata.generatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="text-[#1B2A4A]/60 hover:text-[#1B2A4A]"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Help
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAsText}
            className="border-[#1B2A4A]/20 text-[#1B2A4A] hover:bg-[#1B2A4A]/5"
          >
            <Download className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportAsPDF}
            className="border-[#1B2A4A]/20 text-[#1B2A4A] hover:bg-[#1B2A4A]/5"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start bg-[#F8F9FC] border border-[#1B2A4A]/10 p-1 h-auto flex-wrap gap-1 print:hidden">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-[#1B2A4A]/70 px-3 py-2"
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="summary" className="m-0">
            <SeveritySummaryTab
              compositeSeverityScore={data.compositeSeverityScore}
              severityTier={data.severityTier}
              executiveSummary={data.executiveSummary}
              perspectivesConfidenceRating={data.perspectivesConfidenceRating}
              perspectiveCount={data.perspectives.length}
            />
          </TabsContent>

          <TabsContent value="modes" className="m-0">
            <FailureModesTab
              perspectives={data.perspectives}
              onSelectPerspective={handleSelectPerspective}
            />
          </TabsContent>

          <TabsContent value="narratives" className="m-0">
            <NarrativeAccordionTab
              perspectives={data.perspectives}
              defaultOpenId={selectedPerspectiveId || undefined}
            />
          </TabsContent>

          <TabsContent value="actions" className="m-0">
            <MitigationActionsTab
              perspectives={data.perspectives}
            />
          </TabsContent>
        </div>
      </Tabs>

      {/* Help Modal */}
      <PreMortemHelpModal
        open={showHelp}
        onOpenChange={setShowHelp}
      />

      {/* Print-specific styles */}
      <style>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
