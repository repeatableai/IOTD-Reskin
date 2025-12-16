import { useState } from "react";
import { useLocation } from "wouter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ExternalLink,
  ChevronRight,
  Users,
  MessageSquare,
  TrendingUp,
  Eye
} from "lucide-react";

type PlatformType = 'reddit' | 'facebook' | 'youtube' | 'other';

interface PlatformConfig {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  metrics: string[];
}

const PLATFORM_CONFIGS: Record<PlatformType, PlatformConfig> = {
  reddit: {
    name: 'Reddit',
    icon: 'R',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/50',
    borderColor: 'border-orange-200 dark:border-orange-800',
    description: 'Active discussions and community engagement around this problem space.',
    metrics: ['Subreddits', 'Total Members', 'Daily Active Posts', 'Engagement Rate']
  },
  facebook: {
    name: 'Facebook',
    icon: 'f',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'Facebook groups and pages with engaged communities discussing related topics.',
    metrics: ['Groups', 'Total Members', 'Weekly Posts', 'Comment Rate']
  },
  youtube: {
    name: 'YouTube',
    icon: '▶',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/50',
    borderColor: 'border-red-200 dark:border-red-800',
    description: 'Video content and creator channels covering this market segment.',
    metrics: ['Channels', 'Total Views', 'Avg. Video Views', 'Subscriber Growth']
  },
  other: {
    name: 'Other Communities',
    icon: '+',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/50',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'Additional platforms including Discord, Slack, forums, and niche communities.',
    metrics: ['Platforms', 'Segments', 'Priority Topics', 'Growth Indicators']
  }
};

interface CommunitySignalData {
  subreddits?: string;
  groups?: string;
  channels?: string;
  segments?: string;
  members?: string;
  views?: string;
  priorities?: string;
  score: number;
}

interface CommunitySignalDialogProps {
  platform: PlatformType;
  data: CommunitySignalData;
  ideaSlug: string;
  children: React.ReactNode;
}

export default function CommunitySignalDialog({ 
  platform, 
  data, 
  ideaSlug,
  children 
}: CommunitySignalDialogProps) {
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  
  const config = PLATFORM_CONFIGS[platform];
  const scorePercentage = (data.score / 10) * 100;

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Exceptional';
    if (score >= 7) return 'Strong';
    if (score >= 5) return 'Moderate';
    return 'Limited';
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  // Get the primary metric based on platform
  const getPrimaryMetric = () => {
    switch (platform) {
      case 'reddit':
        return { label: 'Subreddits', value: data.subreddits || '5' };
      case 'facebook':
        return { label: 'Groups', value: data.groups || '5' };
      case 'youtube':
        return { label: 'Channels', value: data.channels || '14' };
      case 'other':
        return { label: 'Segments', value: data.segments || '5' };
    }
  };

  const getSecondaryMetric = () => {
    switch (platform) {
      case 'reddit':
      case 'facebook':
        return { label: 'Members', value: data.members || '2.5M+' };
      case 'youtube':
        return { label: 'Views', value: data.views || '10M+' };
      case 'other':
        return { label: 'Priority Topics', value: data.priorities || '3' };
    }
  };

  const primaryMetric = getPrimaryMetric();
  const secondaryMetric = getSecondaryMetric();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="cursor-pointer hover:shadow-md transition-all">
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${getScoreColor(data.score)} flex items-center justify-center text-white font-bold`}>
                {config.icon}
              </div>
              <div>
                <h4 className="font-semibold">{config.name}</h4>
                <p className="text-sm text-muted-foreground">{getScoreLabel(data.score)} signal</p>
              </div>
            </div>
            <Badge className={`text-lg px-3 py-1 text-white ${getScoreColor(data.score)}`}>
              {data.score}/10
            </Badge>
          </div>

          {/* Score Progress Bar */}
          <div>
            <Progress value={scorePercentage} className="h-2" />
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">
            {config.description}
          </p>

          {/* Key Metrics */}
          <div className={`p-3 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
            <p className="text-xs text-muted-foreground mb-2">Key Metrics:</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{primaryMetric.label}</p>
                <p className="font-semibold">{primaryMetric.value}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{secondaryMetric.label}</p>
                <p className="font-semibold">{secondaryMetric.value}</p>
              </div>
            </div>
          </div>

          {/* What this means */}
          <div className="text-sm">
            <p className="font-medium mb-1">What this signal tells us:</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li className="flex items-start gap-2">
                <Users className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Active community discussing this problem</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Regular engagement and discussions</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Growing interest over time</span>
              </li>
            </ul>
          </div>

          {/* View Detailed Analysis Button */}
          <Button 
            className="w-full"
            onClick={() => {
              setOpen(false);
              setLocation(`/idea/${ideaSlug}/community-signals`);
            }}
          >
            View detailed breakdown
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export type { PlatformType, CommunitySignalData };

