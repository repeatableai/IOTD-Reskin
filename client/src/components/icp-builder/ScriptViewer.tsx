import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  FileText,
  Clock,
  Target,
  HelpCircle,
  GitBranch,
  Copy,
  Printer,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScriptSection {
  id: string;
  title: string;
  content: string;
  speakerNotes: string;
  duration: string;
  order: number;
}

interface ScriptBranch {
  id: string;
  parentSectionId: string;
  condition: string;
  content: string;
  followUpQuestions: string[];
}

interface ValidationScript {
  id: string;
  ideaId: string;
  icpProfileId: string;
  title: string;
  scriptType: string;
  objective: string;
  totalDuration: string;
  sections: ScriptSection[];
  branches: ScriptBranch[];
  keyQuestions: string[];
  hypothesesToValidate: string[];
  closingTechniques: string[];
  createdAt: string;
}

interface IcpProfile {
  id: string;
  name: string;
}

interface ScriptViewerProps {
  scripts: ValidationScript[];
  icpProfiles: IcpProfile[];
  isLoading: boolean;
  selectedIcpId: string | null;
}

export default function ScriptViewer({
  scripts,
  icpProfiles,
  isLoading,
  selectedIcpId,
}: ScriptViewerProps) {
  const { toast } = useToast();
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(
    scripts.length > 0 ? scripts[0].id : null
  );
  const [activeTab, setActiveTab] = useState('script');

  // Filter scripts by selected ICP
  const filteredScripts = selectedIcpId
    ? scripts.filter(s => s.icpProfileId === selectedIcpId)
    : scripts;

  const selectedScript = filteredScripts.find(s => s.id === selectedScriptId) || filteredScripts[0];

  // Get branches for a section
  const getBranchesForSection = (sectionId: string) => {
    return selectedScript?.branches.filter(b => b.parentSectionId === sectionId) || [];
  };

  // Get script type badge color
  const getScriptTypeBadge = (type: string) => {
    switch (type) {
      case 'discovery': return 'bg-blue-100 text-blue-800';
      case 'validation': return 'bg-green-100 text-green-800';
      case 'follow_up': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Copy script to clipboard
  const handleCopyScript = () => {
    if (!selectedScript) return;

    const scriptText = `
${selectedScript.title}
${'='.repeat(selectedScript.title.length)}

Objective: ${selectedScript.objective}
Duration: ${selectedScript.totalDuration}

${selectedScript.sections.map(section => `
## ${section.title} (${section.duration})

${section.content}

Speaker Notes: ${section.speakerNotes}
`).join('\n')}

KEY QUESTIONS:
${selectedScript.keyQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

HYPOTHESES TO VALIDATE:
${selectedScript.hypothesesToValidate.map((h, i) => `${i + 1}. ${h}`).join('\n')}

CLOSING TECHNIQUES:
${selectedScript.closingTechniques.map((t, i) => `${i + 1}. ${t}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(scriptText);
    toast({
      title: "Copied to Clipboard",
      description: "Script has been copied to your clipboard",
    });
  };

  // Print script
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
        <p className="text-[#1B2A4A]/60">Generating your call script...</p>
      </div>
    );
  }

  if (filteredScripts.length === 0) {
    return (
      <div className="py-12 text-center border-2 border-dashed border-[#1B2A4A]/10 rounded-lg">
        <FileText className="w-12 h-12 mx-auto text-[#1B2A4A]/30 mb-4" />
        <h4 className="text-lg font-medium text-[#1B2A4A] mb-2">No Scripts Generated Yet</h4>
        <p className="text-sm text-[#1B2A4A]/60 max-w-md mx-auto">
          Select an ICP profile and click "Script" to generate a validation call script
          tailored to that customer segment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1B2A4A]">Validation Scripts</h3>
          <p className="text-sm text-[#1B2A4A]/60">
            Call scripts for customer validation interviews
          </p>
        </div>
        <div className="flex items-center gap-2">
          {filteredScripts.length > 1 && (
            <Select value={selectedScriptId || ''} onValueChange={setSelectedScriptId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select script" />
              </SelectTrigger>
              <SelectContent>
                {filteredScripts.map(script => (
                  <SelectItem key={script.id} value={script.id}>
                    {script.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" size="sm" onClick={handleCopyScript}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {selectedScript && (
        <Card className="print:shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-xl">{selectedScript.title}</CardTitle>
                  <Badge className={getScriptTypeBadge(selectedScript.scriptType)}>
                    {selectedScript.scriptType}
                  </Badge>
                </div>
                <p className="text-sm text-[#1B2A4A]/60">{selectedScript.objective}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#1B2A4A]/60">
                <Clock className="w-4 h-4" />
                {selectedScript.totalDuration}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="script" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Script
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Key Questions
                </TabsTrigger>
                <TabsTrigger value="hypotheses" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Hypotheses
                </TabsTrigger>
              </TabsList>

              {/* Script Sections Tab */}
              <TabsContent value="script" className="space-y-4">
                <Accordion type="single" collapsible defaultValue={selectedScript.sections[0]?.id}>
                  {selectedScript.sections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => {
                      const branches = getBranchesForSection(section.id);
                      return (
                        <AccordionItem key={section.id} value={section.id}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                                  {section.order}
                                </div>
                                <span className="font-medium text-[#1B2A4A]">{section.title}</span>
                                {branches.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <GitBranch className="w-3 h-3 mr-1" />
                                    {branches.length} branch{branches.length > 1 ? 'es' : ''}
                                  </Badge>
                                )}
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {section.duration}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pl-11 space-y-4">
                            {/* Main Content */}
                            <div className="bg-white p-4 rounded-lg border">
                              <p className="text-[#1B2A4A] whitespace-pre-wrap leading-relaxed">
                                {section.content}
                              </p>
                            </div>

                            {/* Speaker Notes */}
                            {section.speakerNotes && (
                              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-2 text-sm font-medium text-amber-800 mb-2">
                                  <Lightbulb className="w-4 h-4" />
                                  Speaker Notes
                                </div>
                                <p className="text-sm text-amber-900">{section.speakerNotes}</p>
                              </div>
                            )}

                            {/* Branches */}
                            {branches.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-[#1B2A4A]">
                                  <GitBranch className="w-4 h-4 text-purple-500" />
                                  Conversation Branches
                                </div>
                                {branches.map((branch) => (
                                  <div key={branch.id} className="bg-purple-50 p-4 rounded-lg border border-purple-200 ml-4">
                                    <div className="text-sm font-medium text-purple-800 mb-2">
                                      {branch.condition}
                                    </div>
                                    <p className="text-sm text-purple-900 mb-3">{branch.content}</p>
                                    {branch.followUpQuestions.length > 0 && (
                                      <div className="space-y-1">
                                        <span className="text-xs font-medium text-purple-700">Follow-up questions:</span>
                                        <ul className="text-sm text-purple-800 space-y-1">
                                          {branch.followUpQuestions.map((q, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                              <span className="text-purple-500">•</span>
                                              {q}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                </Accordion>

                {/* Closing Techniques */}
                {selectedScript.closingTechniques.length > 0 && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-800 mb-3">
                      <CheckCircle2 className="w-4 h-4" />
                      Closing Techniques
                    </div>
                    <ul className="space-y-2">
                      {selectedScript.closingTechniques.map((technique, i) => (
                        <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {technique}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              {/* Key Questions Tab */}
              <TabsContent value="questions" className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-blue-800">
                    These questions follow Mom Test principles - focus on past behavior and avoid leading questions
                  </p>
                </div>
                <div className="space-y-3">
                  {selectedScript.keyQuestions.map((question, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs flex-shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-[#1B2A4A]">{question}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Hypotheses Tab */}
              <TabsContent value="hypotheses" className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
                  <p className="text-sm text-amber-800">
                    Track whether each hypothesis is validated, invalidated, or needs more data
                  </p>
                </div>
                <div className="space-y-3">
                  {selectedScript.hypothesesToValidate.map((hypothesis, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[#1B2A4A]">{hypothesis}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
