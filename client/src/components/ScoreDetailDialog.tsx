import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  AlertTriangle, 
  Rocket, 
  Clock, 
  Target,
  DollarSign,
  Users,
  Zap,
  ExternalLink,
  ChevronRight
} from "lucide-react";

// Score type definitions
type ScoreType = 
  | 'opportunity' 
  | 'problem' 
  | 'feasibility' 
  | 'timing' 
  | 'execution' 
  | 'gtm'
  | 'revenue'
  | 'founder-fit';

interface ScoreConfig {
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  detailPagePath: string;
  getLabel: (score: number) => string;
  getDescription: (score: number) => string;
}

// Configuration for each score type
const SCORE_CONFIGS: Record<ScoreType, ScoreConfig> = {
  opportunity: {
    title: 'Opportunity',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'Market size, growth potential, and overall business opportunity assessment.',
    detailPagePath: 'opportunity-analysis',
    getLabel: (score) => {
      if (score >= 9) return 'Exceptional';
      if (score >= 7) return 'Very High';
      if (score >= 5) return 'Moderate';
      return 'Limited';
    },
    getDescription: (score) => {
      if (score >= 9) return 'Massive market opportunity with strong growth indicators and clear demand signals.';
      if (score >= 7) return 'Large addressable market with solid growth potential and proven demand.';
      if (score >= 5) return 'Decent market size with some growth potential.';
      return 'Limited market opportunity that may require niche targeting.';
    }
  },
  problem: {
    title: 'Problem',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/50',
    borderColor: 'border-red-200 dark:border-red-800',
    description: 'How severe is the pain point this solution addresses?',
    detailPagePath: 'problem-analysis',
    getLabel: (score) => {
      if (score >= 9) return 'Severe Pain';
      if (score >= 7) return 'High Pain';
      if (score >= 5) return 'Moderate Pain';
      return 'Low Pain';
    },
    getDescription: (score) => {
      if (score >= 9) return 'Critical problem causing significant frustration. Users actively seeking solutions and willing to pay.';
      if (score >= 7) return 'Notable pain point that disrupts workflows. Clear willingness to adopt better solutions.';
      if (score >= 5) return 'Recognizable problem but not urgent. Users may need education on the impact.';
      return 'Nice-to-have solution rather than must-have. May struggle with activation.';
    }
  },
  feasibility: {
    title: 'Feasibility',
    icon: Rocket,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/50',
    borderColor: 'border-green-200 dark:border-green-800',
    description: 'Technical complexity and resource requirements to build an MVP.',
    detailPagePath: 'feasibility-analysis',
    getLabel: (score) => {
      if (score >= 8) return 'Easy Build';
      if (score >= 6) return 'Moderate';
      if (score >= 4) return 'Challenging';
      return 'Very Complex';
    },
    getDescription: (score) => {
      if (score >= 8) return 'Straightforward build with existing tools and frameworks. MVP achievable in weeks.';
      if (score >= 6) return 'Standard complexity requiring solid technical skills. 2-3 month MVP timeline.';
      if (score >= 4) return 'Complex build requiring specialized expertise or integrations.';
      return 'Highly complex requiring significant R&D, regulatory approval, or advanced technology.';
    }
  },
  timing: {
    title: 'Why Now',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/50',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    description: 'Market timing factors and why this opportunity exists today.',
    detailPagePath: 'timing-analysis',
    getLabel: (score) => {
      if (score >= 9) return 'Perfect Timing';
      if (score >= 7) return 'Good Timing';
      if (score >= 5) return 'Neutral';
      return 'Early/Late';
    },
    getDescription: (score) => {
      if (score >= 9) return 'Converging trends, technology shifts, and market conditions create the perfect moment.';
      if (score >= 7) return 'Strong tailwinds support this idea. Market is ready and receptive.';
      if (score >= 5) return 'Timing is neither particularly favorable nor unfavorable.';
      return 'May be too early (market not ready) or too late (saturated market).';
    }
  },
  execution: {
    title: 'Execution',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/50',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'Execution difficulty and operational complexity to run this business.',
    detailPagePath: 'execution-analysis',
    getLabel: (score) => {
      if (score >= 8) return 'Manageable';
      if (score >= 6) return 'Moderate';
      if (score >= 4) return 'Complex';
      return 'Very Complex';
    },
    getDescription: (score) => {
      if (score >= 8) return 'Lean operations with clear playbook. Can be run with small team initially.';
      if (score >= 6) return 'Standard operational requirements. Some processes to figure out.';
      if (score >= 4) return 'Significant operational complexity requiring careful planning.';
      return 'Heavy operational lift with multiple moving parts and dependencies.';
    }
  },
  gtm: {
    title: 'Go-To-Market',
    icon: Zap,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/50',
    borderColor: 'border-orange-200 dark:border-orange-800',
    description: 'Distribution strategy clarity and customer acquisition potential.',
    detailPagePath: 'gtm-strategy',
    getLabel: (score) => {
      if (score >= 9) return 'Exceptional';
      if (score >= 7) return 'Strong';
      if (score >= 5) return 'Moderate';
      return 'Challenging';
    },
    getDescription: (score) => {
      if (score >= 9) return 'Clear distribution channels with viral potential. Customers are easy to find and reach.';
      if (score >= 7) return 'Solid acquisition strategies with proven channels. Good organic potential.';
      if (score >= 5) return 'Standard GTM approach requiring consistent effort.';
      return 'Unclear distribution or expensive customer acquisition.';
    }
  },
  revenue: {
    title: 'Revenue Potential',
    icon: DollarSign,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    description: 'Revenue model strength and business model viability.',
    detailPagePath: 'revenue-analysis',
    getLabel: (score) => {
      if (score >= 9) return '$10M+ ARR';
      if (score >= 7) return '$1M-$10M ARR';
      if (score >= 5) return '$100K-$1M';
      return '<$100K';
    },
    getDescription: (score) => {
      if (score >= 9) return 'Large market with strong unit economics. Clear path to significant scale.';
      if (score >= 7) return 'Solid revenue potential with proven pricing models in the market.';
      if (score >= 5) return 'Decent revenue opportunity, may require premium positioning.';
      return 'Limited revenue ceiling or challenging monetization.';
    }
  },
  'founder-fit': {
    title: 'Founder Fit',
    icon: Users,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950/50',
    borderColor: 'border-pink-200 dark:border-pink-800',
    description: 'How well this idea matches your skills, interests, and resources.',
    detailPagePath: 'founder-fit-analysis',
    getLabel: (score) => {
      if (score >= 9) return 'Perfect Match';
      if (score >= 7) return 'Good Fit';
      if (score >= 5) return 'Moderate Fit';
      return 'Stretch';
    },
    getDescription: (score) => {
      if (score >= 9) return 'Aligns perfectly with your background, network, and available resources.';
      if (score >= 7) return 'Good alignment with minor gaps that can be addressed.';
      if (score >= 5) return 'Some relevant experience but will require growth in key areas.';
      return 'Significant skill gaps or resource constraints to overcome.';
    }
  }
};

interface ScoreDetailDialogProps {
  score: number;
  scoreType: ScoreType;
  ideaSlug: string;
  sublabel?: string;
  children: React.ReactNode;
  usePopover?: boolean;
}

export default function ScoreDetailDialog({ 
  score, 
  scoreType, 
  ideaSlug, 
  sublabel,
  children,
  usePopover = true 
}: ScoreDetailDialogProps) {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  
  const config = SCORE_CONFIGS[scoreType];
  const Icon = config.icon;
  const label = sublabel || config.getLabel(score);
  const description = config.getDescription(score);

  const getScoreColorClass = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const content = (
    <div className="space-y-4">
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h4 className="font-semibold">{config.title}</h4>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
        <Badge 
          className={`text-xl px-3 py-1 text-white ${getScoreColorClass(score)}`}
        >
          {score}/10
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* What this means */}
      <div className={`p-3 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
        <p className="text-xs text-muted-foreground mb-1">What this score means:</p>
        <p className="text-sm font-medium">{config.description}</p>
      </div>

      {/* View Detailed Analysis Button */}
      <Button 
        className="w-full"
        onClick={() => {
          setOpen(false);
          setLocation(`/idea/${ideaSlug}/${config.detailPagePath}`);
        }}
      >
        View detailed analysis
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  if (usePopover) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="cursor-pointer hover:opacity-80 transition-opacity">
            {children}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setOpen(true)}
      >
        {children}
      </div>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${config.color}`} />
            {config.title} Score
          </DialogTitle>
          <DialogDescription>
            Understanding this metric
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}

// Export the score types for use elsewhere
export type { ScoreType };
export { SCORE_CONFIGS };
