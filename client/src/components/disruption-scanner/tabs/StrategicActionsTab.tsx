import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Rocket, Clock, Target, Zap } from "lucide-react";
import { stripMarkdown } from "@/lib/utils";

interface StrategicAction {
  priority: number;
  action: string;
  rationale: string;
  impact: 'high' | 'medium' | 'low';
  timeline: string;
}

interface StrategicActionsTabProps {
  data: StrategicAction[];
}

const IMPACT_CONFIG = {
  high: { color: "bg-green-100 text-green-700 border-green-300", label: "High Impact" },
  medium: { color: "bg-yellow-100 text-yellow-700 border-yellow-300", label: "Medium Impact" },
  low: { color: "bg-gray-100 text-gray-700 border-gray-300", label: "Low Impact" },
};

const PRIORITY_COLORS = [
  "bg-[#C5985E] text-white", // Priority 1
  "bg-[#1B2A4A] text-white", // Priority 2
  "bg-[#1B2A4A]/80 text-white", // Priority 3
  "bg-[#1B2A4A]/60 text-white", // Priority 4
  "bg-[#1B2A4A]/40 text-white", // Priority 5
];

export default function StrategicActionsTab({ data }: StrategicActionsTabProps) {
  // Sort by priority
  const sortedActions = [...data].sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#1B2A4A]/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <Rocket className="w-8 h-8 text-[#C5985E]" />
            <div>
              <h3 className="text-lg font-semibold text-[#1B2A4A]">
                Strategic Action Plan
              </h3>
              <p className="text-sm text-[#1B2A4A]/60">
                Priority-weighted recommendations for AI disruption defense
              </p>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="flex items-center gap-4 bg-[#F8F9FC] rounded-lg p-3">
            <span className="text-sm text-[#1B2A4A]/70">{data.length} actions identified</span>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700 border-green-300 border">
                {data.filter(a => a.impact === 'high').length} High Impact
              </Badge>
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300 border">
                {data.filter(a => a.impact === 'medium').length} Medium
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Cards */}
      <div className="space-y-4">
        {sortedActions.map((action, index) => {
          const impactConfig = IMPACT_CONFIG[action.impact];
          const priorityColor = PRIORITY_COLORS[Math.min(action.priority - 1, PRIORITY_COLORS.length - 1)];

          return (
            <Card key={index} className="border-[#1B2A4A]/10">
              <CardContent className="pt-6">
                <Accordion type="single" collapsible defaultValue={index === 0 ? `action-${index}` : undefined}>
                  <AccordionItem value={`action-${index}`} className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0">
                      <div className="flex items-center gap-4 w-full pr-4">
                        {/* Priority Badge */}
                        <div className={`w-10 h-10 rounded-full ${priorityColor} flex items-center justify-center font-bold flex-shrink-0`}>
                          {action.priority}
                        </div>

                        {/* Action Title */}
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-semibold text-[#1B2A4A]">
                            {stripMarkdown(action.action)}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${impactConfig.color} border text-xs`}>
                              {impactConfig.label}
                            </Badge>
                            <span className="text-xs text-[#1B2A4A]/50 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {action.timeline}
                            </span>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-4">
                      <div className="pl-14 space-y-4">
                        {/* Rationale */}
                        <div className="bg-[#F8F9FC] border border-[#1B2A4A]/10 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-[#C5985E] flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-[#1B2A4A]/50 font-semibold uppercase tracking-wide mb-1">
                                Rationale
                              </p>
                              <p className="text-sm text-[#1B2A4A]/80">
                                {stripMarkdown(action.rationale)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Quick Info Row */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Zap className={`w-4 h-4 ${action.impact === 'high' ? 'text-green-600' : action.impact === 'medium' ? 'text-yellow-600' : 'text-gray-500'}`} />
                            <span className="text-[#1B2A4A]/70">Impact: {action.impact}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#1B2A4A]/50" />
                            <span className="text-[#1B2A4A]/70">{action.timeline}</span>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Implementation Note */}
      <div className="bg-[#F8F9FC] border border-[#1B2A4A]/10 rounded-lg p-4">
        <p className="text-sm text-[#1B2A4A]/70">
          <strong>Implementation Priority:</strong> Actions are ranked by urgency and expected impact.
          High-impact actions with shorter timelines should be prioritized. Consider resource
          constraints and dependencies when sequencing execution.
        </p>
      </div>
    </div>
  );
}
