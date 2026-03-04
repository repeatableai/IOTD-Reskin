import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { User, MessageSquare } from "lucide-react";
import { stripMarkdown } from "@/lib/utils";

interface Expert {
  name: string;
  title: string;
  verdict: string;
  vote: 'INVESTABLE' | 'MANAGEABLE' | 'WATCH' | 'MODERATE_RISK' | 'HIGH_RISK' | 'AVOID';
  keyQuestion: string;
}

interface ExpertPanelTabProps {
  data: Expert[];
}

const VOTE_CONFIG = {
  INVESTABLE: {
    color: "bg-green-100 text-green-700 border-green-300",
    label: "Investable",
  },
  MANAGEABLE: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
    label: "Manageable",
  },
  WATCH: {
    color: "bg-blue-100 text-blue-700 border-blue-300",
    label: "Watch",
  },
  MODERATE_RISK: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    label: "Moderate Risk",
  },
  HIGH_RISK: {
    color: "bg-orange-100 text-orange-700 border-orange-300",
    label: "High Risk",
  },
  AVOID: {
    color: "bg-red-100 text-red-700 border-red-300",
    label: "Avoid",
  },
};

const EXPERT_BACKGROUNDS: Record<string, string> = {
  "Aswath Damodaran": "NYU Stern Professor, Valuation Expert",
  "Bill Gurley": "Benchmark Partner, Market Dynamics",
  "Peter Thiel": "Founders Fund, Contrarian Investor",
  "Daniel Kahneman": "Nobel Laureate, Behavioral Economics",
  "Rita McGrath": "Columbia Professor, Competitive Advantage",
};

function getExpertInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function ExpertPanelTab({ data }: ExpertPanelTabProps) {
  // Count votes by category
  const voteCount = data.reduce((acc, expert) => {
    const isPositive = ['INVESTABLE', 'MANAGEABLE'].includes(expert.vote);
    const isNegative = ['HIGH_RISK', 'AVOID'].includes(expert.vote);
    return {
      positive: acc.positive + (isPositive ? 1 : 0),
      neutral: acc.neutral + (!isPositive && !isNegative ? 1 : 0),
      negative: acc.negative + (isNegative ? 1 : 0),
    };
  }, { positive: 0, neutral: 0, negative: 0 });

  return (
    <div className="space-y-6">
      {/* Panel Overview */}
      <Card className="border-[#1B2A4A]/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-[#C5985E]" />
              <div>
                <h3 className="text-lg font-semibold text-[#1B2A4A]">
                  Expert Panel Assessment
                </h3>
                <p className="text-sm text-[#1B2A4A]/60">
                  5 domain experts with distinct analytical frameworks
                </p>
              </div>
            </div>
          </div>

          {/* Vote Summary */}
          <div className="flex items-center gap-4 bg-[#F8F9FC] rounded-lg p-3">
            <span className="text-sm text-[#1B2A4A]/70">Panel Consensus:</span>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700 border-green-300 border">
                {voteCount.positive} Positive
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-300 border">
                {voteCount.neutral} Neutral
              </Badge>
              <Badge className="bg-red-100 text-red-700 border-red-300 border">
                {voteCount.negative} Negative
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expert Cards */}
      <div className="space-y-4">
        {data.map((expert, index) => {
          const voteConfig = VOTE_CONFIG[expert.vote] || VOTE_CONFIG.WATCH;
          const background = EXPERT_BACKGROUNDS[expert.name] || expert.title;

          return (
            <Card key={index} className="border-[#1B2A4A]/10">
              <CardContent className="pt-6">
                <Accordion type="single" collapsible>
                  <AccordionItem value={`expert-${index}`} className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0">
                      <div className="flex items-center gap-4 w-full pr-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-[#1B2A4A] flex items-center justify-center text-white font-bold flex-shrink-0">
                          {getExpertInitials(expert.name)}
                        </div>

                        {/* Name and Title */}
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-semibold text-[#1B2A4A]">
                            {expert.name}
                          </h4>
                          <p className="text-sm text-[#1B2A4A]/60 truncate">
                            {background}
                          </p>
                        </div>

                        {/* Vote Badge */}
                        <Badge className={`${voteConfig.color} border flex-shrink-0`}>
                          {voteConfig.label}
                        </Badge>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-4">
                      {/* Verdict */}
                      <div className="pl-16 space-y-4">
                        <div className="prose prose-sm max-w-none">
                          {stripMarkdown(expert.verdict).split('\n').map((paragraph, pIndex) => (
                            <p key={pIndex} className="text-sm text-[#1B2A4A]/80 mb-3 last:mb-0">
                              {paragraph}
                            </p>
                          ))}
                        </div>

                        {/* Key Question */}
                        <div className="bg-[#C5985E]/10 border border-[#C5985E]/30 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-[#C5985E] flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-[#C5985E] font-semibold uppercase tracking-wide mb-1">
                                Key Question
                              </p>
                              <p className="text-sm text-[#1B2A4A] font-medium">
                                {stripMarkdown(expert.keyQuestion)}
                              </p>
                            </div>
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
    </div>
  );
}
