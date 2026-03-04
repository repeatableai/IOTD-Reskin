import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Building2,
  MapPin,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  ShoppingCart,
  Loader2,
} from "lucide-react";

interface IcpProfile {
  id: string;
  name: string;
  description: string;
  demographics: {
    companySize: string;
    industry: string[];
    geography: string[];
    revenue: string;
  };
  psychographics: {
    painPoints: string[];
    goals: string[];
    objections: string[];
  };
  buyingBehavior: {
    decisionMakers: string[];
    budget: string;
    buyingCycle: string;
    channels: string[];
  };
  validationPriority: 'high' | 'medium' | 'low';
  confidence: number;
}

interface IcpProfileCardProps {
  profile: IcpProfile;
  isSelected: boolean;
  onSelect: () => void;
  onGenerateScript: (scriptType: 'discovery' | 'validation' | 'follow_up') => void;
  isGeneratingScript: boolean;
}

export default function IcpProfileCard({
  profile,
  isSelected,
  onSelect,
  onGenerateScript,
  isGeneratingScript,
}: IcpProfileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'bg-green-100 text-green-800';
    if (confidence >= 40) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
  };

  // Priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card
      className={`transition-all cursor-pointer ${
        isSelected
          ? 'ring-2 ring-blue-500 shadow-lg'
          : 'hover:shadow-md hover:border-blue-200'
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg text-[#1B2A4A]">{profile.name}</CardTitle>
              <Badge className={getPriorityColor(profile.validationPriority)}>
                {profile.validationPriority} priority
              </Badge>
            </div>
            <p className="text-sm text-[#1B2A4A]/60">{profile.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Confidence Badge */}
            <Badge className={getConfidenceColor(profile.confidence)}>
              {profile.confidence}% confidence
            </Badge>

            {/* Generate Script Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button size="sm" variant="outline" disabled={isGeneratingScript}>
                  {isGeneratingScript ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-1" />
                      Script
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onGenerateScript('discovery'); }}>
                  Discovery Call Script
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onGenerateScript('validation'); }}>
                  Validation Call Script
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onGenerateScript('follow_up'); }}>
                  Follow-up Call Script
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-[#1B2A4A]/40" />
            <span className="text-[#1B2A4A]/70">{profile.demographics.companySize}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-[#1B2A4A]/40" />
            <span className="text-[#1B2A4A]/70">{profile.demographics.geography.join(', ')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-[#1B2A4A]/40" />
            <span className="text-[#1B2A4A]/70">{profile.demographics.revenue}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-[#1B2A4A]/40" />
            <span className="text-[#1B2A4A]/70">{profile.buyingBehavior.decisionMakers[0]}</span>
          </div>
        </div>

        {/* Industries */}
        <div className="flex flex-wrap gap-1 mb-4">
          {profile.demographics.industry.map((ind, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {ind}
            </Badge>
          ))}
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="w-full">
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show Details
                </>
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4 space-y-4" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            {/* Pain Points */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Pain Points
              </h4>
              <ul className="space-y-1">
                {profile.psychographics.painPoints.map((point, i) => (
                  <li key={i} className="text-sm text-[#1B2A4A]/70 flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Goals */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-2">
                <Target className="w-4 h-4 text-green-500" />
                Goals & Desired Outcomes
              </h4>
              <ul className="space-y-1">
                {profile.psychographics.goals.map((goal, i) => (
                  <li key={i} className="text-sm text-[#1B2A4A]/70 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>

            {/* Objections */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Likely Objections
              </h4>
              <ul className="space-y-1">
                {profile.psychographics.objections.map((obj, i) => (
                  <li key={i} className="text-sm text-[#1B2A4A]/70 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    {obj}
                  </li>
                ))}
              </ul>
            </div>

            {/* Buying Behavior */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1B2A4A] mb-2">
                <ShoppingCart className="w-4 h-4 text-blue-500" />
                Buying Behavior
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#1B2A4A]/50">Budget:</span>
                  <span className="ml-2 text-[#1B2A4A]/70">{profile.buyingBehavior.budget}</span>
                </div>
                <div>
                  <span className="text-[#1B2A4A]/50">Cycle:</span>
                  <span className="ml-2 text-[#1B2A4A]/70">{profile.buyingBehavior.buyingCycle}</span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-[#1B2A4A]/50">Decision Makers:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.buyingBehavior.decisionMakers.map((dm, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {dm}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-[#1B2A4A]/50">Discovery Channels:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.buyingBehavior.channels.map((ch, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {ch}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
