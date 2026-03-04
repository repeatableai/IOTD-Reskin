import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TrendingDown, ArrowRight, Minus, ArrowDown } from "lucide-react";
import { stripMarkdown } from "@/lib/utils";

interface MarginScenario {
  margin: string;
  timeline: string;
  assumptions: string;
}

interface MarginCompression {
  currentEstimatedMargin: string;
  scenarios: {
    conservative: MarginScenario;
    baseCase: MarginScenario;
    aggressive: MarginScenario;
  };
}

interface MarginCompressionTabProps {
  data: MarginCompression;
}

const SCENARIO_CONFIG = {
  conservative: {
    label: "Conservative",
    description: "Slow AI adoption, regulatory protection",
    color: "bg-green-100 text-green-700 border-green-300",
    icon: Minus,
  },
  baseCase: {
    label: "Base Case",
    description: "Standard AI adoption curve",
    color: "bg-yellow-100 text-yellow-700 border-yellow-300",
    icon: ArrowRight,
  },
  aggressive: {
    label: "Aggressive",
    description: "Rapid AI disruption, new entrants",
    color: "bg-red-100 text-red-700 border-red-300",
    icon: ArrowDown,
  },
};

export default function MarginCompressionTab({ data }: MarginCompressionTabProps) {
  const scenarios = [
    { key: 'conservative' as const, ...data.scenarios.conservative },
    { key: 'baseCase' as const, ...data.scenarios.baseCase },
    { key: 'aggressive' as const, ...data.scenarios.aggressive },
  ];

  return (
    <div className="space-y-6">
      {/* Current Margin */}
      <Card className="border-[#1B2A4A]/10 bg-[#1B2A4A]">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingDown className="w-8 h-8 text-[#C5985E] flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Current Estimated Margin
              </h3>
              <p className="text-sm text-white/60">
                Baseline for compression analysis
              </p>
            </div>
          </div>
          <p className="text-sm text-[#C5985E] leading-relaxed">
            {stripMarkdown(data.currentEstimatedMargin)}
          </p>
        </CardContent>
      </Card>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((scenario) => {
          const config = SCENARIO_CONFIG[scenario.key];
          const Icon = config.icon;

          return (
            <Card key={scenario.key} className="border-[#1B2A4A]/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-full ${config.color.split(' ')[0]} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${config.color.split(' ')[1]}`} />
                  </div>
                  <Badge className={`${config.color} border`}>
                    {config.label}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-[#1B2A4A]/50 uppercase tracking-wide">
                      Projected Margin
                    </p>
                    <p className="text-2xl font-bold text-[#1B2A4A]">
                      {stripMarkdown(scenario.margin)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[#1B2A4A]/50 uppercase tracking-wide">
                      Timeline
                    </p>
                    <p className="text-sm font-medium text-[#1B2A4A]">
                      {stripMarkdown(scenario.timeline)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Assumptions */}
      <Card className="border-[#1B2A4A]/10">
        <CardContent className="pt-6">
          <Accordion type="single" collapsible defaultValue="assumptions">
            <AccordionItem value="assumptions" className="border-none">
              <AccordionTrigger className="hover:no-underline py-0">
                <h3 className="text-lg font-semibold text-[#1B2A4A]">
                  Scenario Assumptions
                </h3>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-4">
                  {scenarios.map((scenario) => {
                    const config = SCENARIO_CONFIG[scenario.key];

                    return (
                      <div
                        key={scenario.key}
                        className="bg-[#F8F9FC] border border-[#1B2A4A]/10 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${config.color} border text-xs`}>
                            {config.label}
                          </Badge>
                          <span className="text-xs text-[#1B2A4A]/50">
                            {config.description}
                          </span>
                        </div>
                        <p className="text-sm text-[#1B2A4A]/80">
                          {stripMarkdown(scenario.assumptions)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Info Box */}
      <div className="bg-[#F8F9FC] border border-[#1B2A4A]/10 rounded-lg p-4">
        <p className="text-sm text-[#1B2A4A]/70">
          <strong>Methodology:</strong> Three-scenario margin model projects potential compression
          based on AI adoption rates, competitive dynamics, and industry-specific factors. Conservative
          assumes regulatory protection and slow adoption. Base case follows standard disruption curves.
          Aggressive models rapid AI penetration with new market entrants.
        </p>
      </div>
    </div>
  );
}
