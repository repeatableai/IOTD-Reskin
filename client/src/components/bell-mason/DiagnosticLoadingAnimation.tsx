import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Brain,
  Database,
  FileText,
  Users,
  TrendingUp,
  Shield,
  Target,
  Sparkles,
  Loader2,
  CheckCircle2,
  Zap,
  BarChart3,
  Globe,
  Building,
  Scale,
} from "lucide-react";

// Research phase (blue) - 8 steps
const RESEARCH_PHASES = [
  {
    message: "Searching Crunchbase for funding history",
    icon: Database,
    duration: 8000,
    activities: [
      "Querying funding rounds...",
      "Analyzing investor profiles...",
      "Mapping valuation history...",
    ],
  },
  {
    message: "Analyzing LinkedIn for team composition",
    icon: Users,
    duration: 7000,
    activities: [
      "Identifying key executives...",
      "Mapping team backgrounds...",
      "Assessing skill coverage...",
    ],
  },
  {
    message: "Searching USPTO patent database",
    icon: Shield,
    duration: 6000,
    activities: [
      "Querying patent filings...",
      "Analyzing IP protection...",
      "Mapping technology claims...",
    ],
  },
  {
    message: "Retrieving Gartner market data",
    icon: TrendingUp,
    duration: 7000,
    activities: [
      "Analyzing market size...",
      "Mapping growth trends...",
      "Identifying key drivers...",
    ],
  },
  {
    message: "Pulling PitchBook deal flow analysis",
    icon: Building,
    duration: 6000,
    activities: [
      "Analyzing deal comparables...",
      "Mapping sector activity...",
      "Benchmarking valuations...",
    ],
  },
  {
    message: "Checking G2/Capterra product reviews",
    icon: FileText,
    duration: 5000,
    activities: [
      "Aggregating user reviews...",
      "Analyzing sentiment...",
      "Mapping feature feedback...",
    ],
  },
  {
    message: "Searching SEC EDGAR filings",
    icon: Scale,
    duration: 5000,
    activities: [
      "Querying regulatory filings...",
      "Analyzing compliance status...",
      "Mapping disclosure data...",
    ],
  },
  {
    message: "Retrieving press coverage",
    icon: Globe,
    duration: 0,
    activities: [
      "Searching news archives...",
      "Analyzing media sentiment...",
      "Mapping coverage timeline...",
    ],
  },
];

// Diagnostic phase (gold) - 6 steps
const DIAGNOSTIC_PHASES = [
  {
    message: "Scoring 12 dimensions against benchmarks",
    icon: Target,
    duration: 12000,
    activities: [
      "Evaluating technology dimension...",
      "Assessing product maturity...",
      "Scoring team composition...",
      "Analyzing financial health...",
    ],
  },
  {
    message: "Applying 700+ Bell-Mason cross-dimensional rules",
    icon: Brain,
    duration: 10000,
    activities: [
      "Checking dysfunction patterns...",
      "Mapping dimensional correlations...",
      "Identifying imbalances...",
    ],
  },
  {
    message: "Identifying red flags and dysfunction patterns",
    icon: Shield,
    duration: 8000,
    activities: [
      "Detecting critical gaps...",
      "Mapping risk vectors...",
      "Prioritizing concerns...",
    ],
  },
  {
    message: "Convening 5-expert adversarial panel",
    icon: Users,
    duration: 15000,
    activities: [
      "Heidi Mason — dimensional balance...",
      "Gordon Bell — technical depth...",
      "Joe Milam — fundability lens...",
      "Sector Expert 1 — domain analysis...",
      "Sector Expert 2 — contrarian view...",
    ],
  },
  {
    message: "Fusing with Bessemer, Sequoia, and a16z frameworks",
    icon: Sparkles,
    duration: 10000,
    activities: [
      "Applying Bessemer 10 Laws...",
      "Evaluating Sequoia Arc...",
      "Scoring a16z PMF signals...",
      "Identifying divergences...",
    ],
  },
  {
    message: "Generating diagnostic report",
    icon: FileText,
    duration: 0,
    activities: [
      "Synthesizing findings...",
      "Drafting recommendations...",
      "Finalizing assessment...",
    ],
  },
];

interface DiagnosticLoadingAnimationProps {
  ventureName: string;
  phase: 'research' | 'diagnostic';
}

export default function DiagnosticLoadingAnimation({
  ventureName,
  phase
}: DiagnosticLoadingAnimationProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [heartbeat, setHeartbeat] = useState(true);

  const phases = phase === 'research' ? RESEARCH_PHASES : DIAGNOSTIC_PHASES;
  const phaseColor = phase === 'research' ? 'blue' : 'amber';

  // Heartbeat indicator
  useEffect(() => {
    const heartbeatTimer = setInterval(() => {
      setHeartbeat((prev) => !prev);
    }, 500);
    return () => clearInterval(heartbeatTimer);
  }, []);

  // Elapsed time counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset state when phase changes
  useEffect(() => {
    setCurrentPhaseIndex(0);
    setCurrentActivity(0);
    setProgress(0);
  }, [phase]);

  // Progress and phase management
  useEffect(() => {
    const totalDuration = phases.slice(0, -1).reduce((sum, p) => sum + p.duration, 0);
    let elapsed = 0;

    const progressInterval = setInterval(() => {
      elapsed += 100;
      const maxProgress = 92;
      const calculatedProgress = Math.min((elapsed / totalDuration) * maxProgress, maxProgress);
      setProgress(calculatedProgress);
    }, 100);

    let phaseTimeout: NodeJS.Timeout;
    const scheduleNextPhase = (phaseIndex: number) => {
      if (phaseIndex >= phases.length - 1) {
        setCurrentPhaseIndex(phases.length - 1);
        return;
      }

      phaseTimeout = setTimeout(() => {
        setCurrentPhaseIndex(phaseIndex + 1);
        setCurrentActivity(0);
        scheduleNextPhase(phaseIndex + 1);
      }, phases[phaseIndex].duration);
    };

    scheduleNextPhase(0);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(phaseTimeout);
    };
  }, [phase]);

  // Cycle through activities
  useEffect(() => {
    const safeIndex = Math.min(currentPhaseIndex, phases.length - 1);
    const currentPhase = phases[safeIndex];
    if (!currentPhase || !currentPhase.activities.length) return;

    const activityInterval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % currentPhase.activities.length);
    }, 2500);

    return () => clearInterval(activityInterval);
  }, [currentPhaseIndex, phase, phases]);

  // Safety check: clamp index to valid range and ensure phase exists
  const safePhaseIndex = Math.min(Math.max(0, currentPhaseIndex), phases.length - 1);
  const currentPhase = phases[safePhaseIndex] || phases[0];
  const PhaseIcon = currentPhase?.icon || Search;
  const currentActivityText = currentPhase?.activities?.[currentActivity] || currentPhase?.activities?.[0] || "Processing...";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const bgGradient = phase === 'research'
    ? 'from-blue-600 to-blue-800'
    : 'from-amber-500 to-amber-700';

  const accentColor = phase === 'research' ? 'text-blue-500' : 'text-amber-500';
  const bgAccent = phase === 'research' ? 'bg-blue-500' : 'bg-amber-500';

  return (
    <div className="py-8 px-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">
          {phase === 'research' ? 'Deep Research' : 'Bell-Mason Diagnostic'}: {ventureName}
        </h3>
        <p className="text-sm text-[#1B2A4A]/60">
          {phase === 'research'
            ? 'Powered by Claude Opus — Web Research Phase'
            : 'Powered by Claude Opus — Extended Thinking Analysis'}
        </p>
      </div>

      {/* Phase Badge */}
      <div className="flex justify-center">
        <Badge
          className={`${phase === 'research' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-amber-100 text-amber-700 border-amber-300'} px-4 py-1.5 text-sm font-medium`}
        >
          {phase === 'research' ? 'Phase 1: Research' : 'Phase 2: Diagnostic'}
        </Badge>
      </div>

      {/* Live Stats Bar */}
      <div className="flex justify-center gap-3 flex-wrap">
        <Badge className={`${heartbeat ? 'bg-red-500' : 'bg-red-600'} text-white border-none px-3 py-1 animate-pulse`}>
          <span className={`w-2 h-2 rounded-full ${heartbeat ? 'bg-white' : 'bg-red-200'} mr-2 inline-block`} />
          <span className="text-xs font-bold">LIVE</span>
        </Badge>
        <Badge variant="outline" className="bg-[#1B2A4A]/5 border-[#1B2A4A]/20 px-3 py-1">
          <Zap className={`w-3 h-3 mr-1 ${accentColor}`} />
          <span className="text-xs font-mono">{formatTime(elapsedTime)}</span>
        </Badge>
      </div>

      {/* Main Phase Display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {/* Pulsing ring animation */}
          <div className={`absolute inset-0 w-24 h-24 rounded-full ${bgAccent}/20 animate-ping`} style={{ animationDuration: "2s" }} />
          <div className={`absolute inset-0 w-24 h-24 rounded-full ${bgAccent}/10 animate-pulse`} />

          <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${bgGradient} flex items-center justify-center shadow-lg`}>
            <PhaseIcon className="w-12 h-12 text-white" />
          </div>

          {/* Spinning indicator */}
          <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${bgAccent} flex items-center justify-center shadow-md`}>
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        </div>

        {/* Current phase message */}
        <div className="text-center max-w-lg">
          <p className="text-lg font-semibold text-[#1B2A4A] mb-2">
            {currentPhase.message}
          </p>
          <div className="h-6 overflow-hidden">
            <p
              key={currentActivityText}
              className={`text-sm ${accentColor} animate-fade-in`}
            >
              {currentActivityText}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="max-w-lg mx-auto space-y-3">
        <div className="relative">
          <Progress value={progress} className={`h-3 bg-[#1B2A4A]/10`} />
          <div
            className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{
              left: `${Math.min(progress - 10, 80)}%`,
              animationDuration: "2s",
              animationIterationCount: "infinite"
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-[#1B2A4A]/60">
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Step {currentPhaseIndex + 1} of {phases.length}
          </span>
          <span className="font-mono">{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Phase Checklist */}
      <div className={`max-w-lg mx-auto ${phase === 'research' ? 'bg-blue-50' : 'bg-amber-50'} rounded-xl p-4 border ${phase === 'research' ? 'border-blue-200' : 'border-amber-200'}`}>
        <div className="space-y-2">
          {phases.map((p, index) => {
            const Icon = p.icon;
            const isComplete = index < currentPhaseIndex;
            const isCurrent = index === currentPhaseIndex;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300 ${
                  isCurrent
                    ? `bg-white border ${phase === 'research' ? 'border-blue-300' : 'border-amber-300'} shadow-sm`
                    : isComplete
                    ? "bg-green-50/50"
                    : "opacity-50"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="relative flex-shrink-0">
                    <Icon className={`w-5 h-5 ${accentColor}`} />
                    <span className={`absolute -top-1 -right-1 w-2 h-2 ${bgAccent} rounded-full animate-pulse`} />
                  </div>
                ) : (
                  <Icon className="w-5 h-5 text-[#1B2A4A]/30 flex-shrink-0" />
                )}

                <span
                  className={`text-sm flex-1 ${
                    isCurrent
                      ? "text-[#1B2A4A] font-medium"
                      : isComplete
                      ? "text-green-700"
                      : "text-[#1B2A4A]/40"
                  }`}
                >
                  {p.message}
                </span>

                {isComplete && (
                  <span className="text-xs text-green-600 font-medium">Done</span>
                )}
                {isCurrent && (
                  <Loader2 className={`w-4 h-4 animate-spin ${accentColor} flex-shrink-0`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reassurance Message */}
      <div className="text-center">
        <p className="text-xs text-[#1B2A4A]/50">
          {phase === 'research'
            ? 'Claude is conducting deep web research — please don\'t refresh.'
            : 'Claude is using extended thinking for maximum analytical depth — please don\'t refresh.'}
        </p>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
