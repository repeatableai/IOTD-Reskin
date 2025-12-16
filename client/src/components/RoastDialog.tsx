import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Flame, 
  Loader2, 
  User, 
  Code, 
  Swords, 
  Target,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  TrendingUp
} from "lucide-react";

interface RoastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idea: {
    id: string;
    title: string;
    description: string;
    market?: string;
    type?: string;
    targetAudience?: string;
    opportunityScore?: number;
    problemScore?: number;
  };
}

// Intensity levels from gentle to savage
const INTENSITY_LEVELS = [
  { 
    id: 'gentle', 
    name: 'Gentle', 
    icon: '😊',
    color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
    activeColor: 'bg-green-500 text-white border-green-600',
    description: 'Constructive feedback with encouragement'
  },
  { 
    id: 'moderate', 
    name: 'Moderate', 
    icon: '🤔',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
    activeColor: 'bg-yellow-500 text-white border-yellow-600',
    description: 'Balanced critique with honest concerns'
  },
  { 
    id: 'tough', 
    name: 'Tough', 
    icon: '😤',
    color: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200',
    activeColor: 'bg-orange-500 text-white border-orange-600',
    description: 'Hard truths that need to be heard'
  },
  { 
    id: 'savage', 
    name: 'Savage', 
    icon: '🔥',
    color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
    activeColor: 'bg-red-500 text-white border-red-600',
    description: 'No-holds-barred brutal honesty'
  },
];

// Perspective options
const PERSPECTIVES = [
  { 
    id: 'vc', 
    name: 'VC Partner', 
    icon: Target,
    description: 'Evaluating investment potential',
    prompt: 'a seasoned venture capital partner who has seen thousands of pitches and invests in high-growth startups'
  },
  { 
    id: 'technical', 
    name: 'Technical Founder', 
    icon: Code,
    description: 'Assessing technical feasibility',
    prompt: 'an experienced technical founder who has built and scaled multiple successful products'
  },
  { 
    id: 'competitor', 
    name: 'Competitor', 
    icon: Swords,
    description: 'Finding weaknesses to exploit',
    prompt: 'a direct competitor already established in this market looking for weaknesses'
  },
  { 
    id: 'customer', 
    name: 'Target Customer', 
    icon: User,
    description: 'Would I actually pay for this?',
    prompt: 'the exact target customer this product is trying to serve, evaluating if it solves a real problem'
  },
];

interface RoastResult {
  perspective: string;
  intensity: string;
  harshTruth: {
    title: string;
    points: string[];
    verdict: string;
  };
  theHype: {
    title: string;
    points: string[];
    verdict: string;
  };
  finalVerdict: {
    score: number;
    summary: string;
    recommendation: string;
  };
}

export default function RoastDialog({ open, onOpenChange, idea }: RoastDialogProps) {
  const { toast } = useToast();
  const [selectedIntensity, setSelectedIntensity] = useState<string>('moderate');
  const [selectedPerspective, setSelectedPerspective] = useState<string>('vc');
  const [roastResult, setRoastResult] = useState<RoastResult | null>(null);

  const roastMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/roast-idea', {
        ideaId: idea.id,
        ideaTitle: idea.title,
        ideaDescription: idea.description,
        market: idea.market,
        type: idea.type,
        targetAudience: idea.targetAudience,
        intensity: selectedIntensity,
        perspective: selectedPerspective,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setRoastResult(data);
    },
    onError: (error) => {
      console.error('Roast error:', error);
      toast({
        title: "Failed to roast idea",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    },
  });

  const handleRoast = () => {
    setRoastResult(null);
    roastMutation.mutate();
  };

  const resetAndClose = () => {
    setRoastResult(null);
    setSelectedIntensity('moderate');
    setSelectedPerspective('vc');
    onOpenChange(false);
  };

  const selectedIntensityData = INTENSITY_LEVELS.find(i => i.id === selectedIntensity);
  const selectedPerspectiveData = PERSPECTIVES.find(p => p.id === selectedPerspective);

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Flame className="w-6 h-6 text-orange-500" />
            Roast This Idea
          </DialogTitle>
          <DialogDescription>
            Get brutally honest feedback from different perspectives. Choose your intensity and viewpoint.
          </DialogDescription>
        </DialogHeader>

        {!roastResult ? (
          <div className="space-y-6 py-4">
            {/* Intensity Selection */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Criticism Intensity
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {INTENSITY_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedIntensity(level.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      selectedIntensity === level.id 
                        ? level.activeColor 
                        : level.color
                    }`}
                  >
                    <span className="text-2xl block mb-1">{level.icon}</span>
                    <span className="text-sm font-medium block">{level.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {selectedIntensityData?.description}
              </p>
            </div>

            <Separator />

            {/* Perspective Selection */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Feedback Perspective
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {PERSPECTIVES.map((perspective) => {
                  const Icon = perspective.icon;
                  const isSelected = selectedPerspective === perspective.id;
                  return (
                    <button
                      key={perspective.id}
                      onClick={() => setSelectedPerspective(perspective.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-muted/50 hover:bg-muted border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-5 h-5" />
                        <span className="font-semibold">{perspective.name}</span>
                      </div>
                      <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {perspective.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Idea Being Roasted */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">Idea Being Roasted</h3>
              <p className="font-medium">{idea.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {idea.description}
              </p>
            </div>

            {/* Roast Button */}
            <Button 
              onClick={handleRoast} 
              disabled={roastMutation.isPending}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              size="lg"
            >
              {roastMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Roasting...
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5 mr-2" />
                  Roast This Idea
                </>
              )}
            </Button>
          </div>
        ) : (
          /* Roast Results */
          <div className="space-y-6 py-4">
            {/* Result Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={selectedIntensityData?.color}>
                  {selectedIntensityData?.icon} {selectedIntensityData?.name}
                </Badge>
                <Badge variant="secondary">
                  {selectedPerspectiveData?.name}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setRoastResult(null)}>
                Roast Again
              </Button>
            </div>

            {/* The Harsh Truth */}
            <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsDown className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-lg text-red-700 dark:text-red-400">
                    {roastResult.harshTruth.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {roastResult.harshTruth.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {roastResult.harshTruth.verdict}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* The Hype */}
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsUp className="w-5 h-5 text-green-500" />
                  <h3 className="font-bold text-lg text-green-700 dark:text-green-400">
                    {roastResult.theHype.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {roastResult.theHype.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    {roastResult.theHype.verdict}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Final Verdict */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-lg">Final Verdict</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Score:</span>
                    <Badge 
                      variant="default" 
                      className={`text-lg px-3 py-1 ${
                        roastResult.finalVerdict.score >= 7 
                          ? 'bg-green-500' 
                          : roastResult.finalVerdict.score >= 5 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                      }`}
                    >
                      {roastResult.finalVerdict.score}/10
                    </Badge>
                  </div>
                </div>
                <p className="text-sm mb-4">{roastResult.finalVerdict.summary}</p>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium">
                    <strong>Recommendation:</strong> {roastResult.finalVerdict.recommendation}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Close Button */}
            <Button onClick={resetAndClose} className="w-full" variant="outline">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

