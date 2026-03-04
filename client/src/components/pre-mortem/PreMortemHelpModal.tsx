import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Skull,
  Target,
  AlertTriangle,
  Shield,
  HelpCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

interface PreMortemHelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PreMortemHelpModal({ open, onOpenChange }: PreMortemHelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#F8F9FC]">
        <DialogHeader className="border-b border-[#1B2A4A]/10 pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl text-[#1B2A4A]">
            <HelpCircle className="w-6 h-6 text-red-600" />
            Pre-Mortem Analysis Guide
          </DialogTitle>
          <DialogDescription className="text-[#1B2A4A]/60">
            Understanding and using your failure analysis results
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* What is a Pre-Mortem */}
          <Card className="border-[#1B2A4A]/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                  <Skull className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1B2A4A]">
                    What Is a Pre-Mortem?
                  </h3>
                </div>
              </div>
              <p className="text-sm text-[#1B2A4A]/80 leading-relaxed">
                A pre-mortem is a strategic thinking exercise where you imagine your venture has
                already failed and work backwards to identify the causes. Unlike a post-mortem
                (which analyzes actual failures), a pre-mortem helps you anticipate and prevent
                failures before they happen.
              </p>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Key insight:</strong> By accepting failure as a given in the analysis,
                  teams overcome confirmation bias and identify risks they might otherwise dismiss.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="border-[#1B2A4A]/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1B2A4A]">
                    How IVE's Pre-Mortem Engine Works
                  </h3>
                </div>
              </div>
              <ol className="space-y-3 text-sm text-[#1B2A4A]/80">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 font-semibold text-xs">1</span>
                  <span>Analyzes your venture data including market, competitors, revenue model, and risk factors</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 font-semibold text-xs">2</span>
                  <span>Selects 5-7 failure perspectives relevant to your industry (Healthcare, Fintech, SaaS, etc.)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 font-semibold text-xs">3</span>
                  <span>Claude Opus generates detailed past-tense narratives for each failure mode</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 font-semibold text-xs">4</span>
                  <span>Provides specific mitigation actions and risk reduction estimates</span>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Reading Your Results */}
          <Card className="border-[#1B2A4A]/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1B2A4A]">
                    Reading Your Results
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-[#1B2A4A] mb-2">Severity Score (0-100)</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                      <div className="w-3 h-3 rounded-full bg-red-600" />
                      <span><strong>CRITICAL (75-100):</strong> Multiple existential threats</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-amber-50 rounded">
                      <div className="w-3 h-3 rounded-full bg-amber-500" />
                      <span><strong>HIGH (50-74):</strong> Significant risks, needs action</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span><strong>MODERATE (25-49):</strong> Manageable with planning</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span><strong>MANAGEABLE (0-24):</strong> Standard challenges</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#1B2A4A] mb-2">Risk Domains</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Market</Badge>
                    <Badge variant="outline" className="text-xs">Execution</Badge>
                    <Badge variant="outline" className="text-xs">Financial</Badge>
                    <Badge variant="outline" className="text-xs">Regulatory</Badge>
                    <Badge variant="outline" className="text-xs">Competitive</Badge>
                    <Badge variant="outline" className="text-xs">Team</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#1B2A4A] mb-2">Confidence Rating</h4>
                  <p className="text-sm text-[#1B2A4A]/80">
                    Indicates how much venture data was available. HIGH confidence means comprehensive
                    data was analyzed. LOW confidence means the analysis is based on limited information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Using Mitigation Actions */}
          <Card className="border-[#1B2A4A]/10">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#1B2A4A]">
                    Using the Mitigation Actions
                  </h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-[#1B2A4A]/80">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Each action is written as a direct instruction, not a suggestion</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Copy individual actions or all actions at once for your planning documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Track completion using the checkboxes in the Mitigations tab</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Prioritize HIGH risk items first, then work down</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitations */}
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-amber-800">
                    Limitations
                  </h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-amber-800">
                <li>This analysis is AI-generated and based on patterns, not actual knowledge of your team or market</li>
                <li>Risk scores are estimates and should be validated against your own research</li>
                <li>Some failure modes may not apply to your specific situation</li>
                <li>The analysis is a starting point for discussion, not a definitive prediction</li>
              </ul>
            </CardContent>
          </Card>

          {/* FAQ */}
          <div>
            <h3 className="text-lg font-semibold text-[#1B2A4A] mb-3">
              Frequently Asked Questions
            </h3>
            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="q1" className="border rounded-lg bg-white">
                <AccordionTrigger className="px-4 text-sm">
                  Why are narratives written in past tense?
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-[#1B2A4A]/70">
                  Past tense narratives are a core pre-mortem technique. By imagining the failure
                  has already happened, you bypass optimism bias and engage more critically with
                  potential risks.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2" className="border rounded-lg bg-white">
                <AccordionTrigger className="px-4 text-sm">
                  How often should I regenerate the analysis?
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-[#1B2A4A]/70">
                  Regenerate when you've significantly updated your venture data (new competitors,
                  changed revenue model, different market focus) or when major market shifts occur.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3" className="border rounded-lg bg-white">
                <AccordionTrigger className="px-4 text-sm">
                  What makes a HIGH vs MEDIUM vs LOW risk?
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-[#1B2A4A]/70">
                  HIGH risks are existential threats that could kill the venture. MEDIUM risks
                  would cause significant setbacks but are survivable. LOW risks are manageable
                  challenges that come with any business.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4" className="border rounded-lg bg-white">
                <AccordionTrigger className="px-4 text-sm">
                  Can I share this analysis with my team?
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-[#1B2A4A]/70">
                  Yes! Use the Copy or Print buttons to export the full analysis. Pre-mortems
                  are most valuable when discussed as a team to surface diverse perspectives.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
