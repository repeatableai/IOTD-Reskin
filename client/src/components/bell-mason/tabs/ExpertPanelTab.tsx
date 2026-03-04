import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Quote,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ExpertVerdict {
  name: string;
  credentials: string;
  frameworkLens: string;
  verdict: string;
  rating: 'STRONG_INVEST' | 'INVEST' | 'CONDITIONAL' | 'CAUTIOUS' | 'PASS';
  keyQuestion: string;
}

interface ExpertPanelTabProps {
  experts: ExpertVerdict[];
}

// Rating configuration
const RATING_CONFIG = {
  STRONG_INVEST: {
    color: 'bg-green-600',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    label: 'Strong Invest',
    icon: ThumbsUp,
  },
  INVEST: {
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Invest',
    icon: CheckCircle2,
  },
  CONDITIONAL: {
    color: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    label: 'Conditional',
    icon: AlertTriangle,
  },
  CAUTIOUS: {
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    label: 'Cautious',
    icon: AlertTriangle,
  },
  PASS: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    label: 'Pass',
    icon: XCircle,
  },
};

// Expert avatars/colors based on their name
const EXPERT_COLORS: Record<string, string> = {
  'Heidi Mason': 'bg-purple-500',
  'Gordon Bell': 'bg-blue-500',
  'Joe Milam': 'bg-green-500',
  default: 'bg-gray-500',
};

function getExpertColor(name: string): string {
  return EXPERT_COLORS[name] || EXPERT_COLORS['default'];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ExpertPanelTab({ experts }: ExpertPanelTabProps) {
  // Count ratings
  const ratingCounts = experts.reduce((acc, expert) => {
    const isPositive = ['STRONG_INVEST', 'INVEST'].includes(expert.rating);
    const isNegative = expert.rating === 'PASS';
    return {
      positive: acc.positive + (isPositive ? 1 : 0),
      neutral: acc.neutral + (!isPositive && !isNegative ? 1 : 0),
      negative: acc.negative + (isNegative ? 1 : 0),
    };
  }, { positive: 0, neutral: 0, negative: 0 });

  return (
    <div className="space-y-6">
      {/* Panel Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Expert Panel Consensus</h3>
              <p className="text-sm text-muted-foreground">
                5 experts simulating institutional investment committee review
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-xl font-bold text-green-600">{ratingCounts.positive}</span>
                </div>
                <p className="text-xs text-muted-foreground">Positive</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xl font-bold text-amber-600">{ratingCounts.neutral}</span>
                </div>
                <p className="text-xs text-muted-foreground">Conditional</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1">
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                  <span className="text-xl font-bold text-red-600">{ratingCounts.negative}</span>
                </div>
                <p className="text-xs text-muted-foreground">Pass</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expert Cards */}
      <div className="space-y-4">
        {experts.map((expert, index) => {
          const config = RATING_CONFIG[expert.rating];
          const RatingIcon = config.icon;

          return (
            <Card key={index} className={`${config.bgColor} ${config.borderColor} border`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full ${getExpertColor(expert.name)} flex items-center justify-center text-white font-semibold`}>
                      {getInitials(expert.name)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{expert.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{expert.credentials}</p>
                    </div>
                  </div>
                  <Badge className={`${config.color} text-white`}>
                    <RatingIcon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Framework Lens */}
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-white/50">
                    {expert.frameworkLens}
                  </Badge>
                </div>

                {/* Verdict */}
                <div className="bg-white/60 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Quote className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {expert.verdict}
                    </div>
                  </div>
                </div>

                {/* Key Question */}
                <div className="flex items-start gap-2 p-3 bg-white/40 rounded-lg border border-gray-200">
                  <HelpCircle className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Key Question for Management
                    </p>
                    <p className="text-sm font-medium italic">"{expert.keyQuestion}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
