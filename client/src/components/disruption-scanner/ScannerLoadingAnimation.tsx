import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Shield,
  Target,
  TrendingDown,
  Users,
  AlertTriangle,
  Sparkles,
  Loader2,
  CheckCircle2,
  Zap,
  BarChart3
} from "lucide-react";

// Main phases with sub-activities for detailed feedback
const LOADING_PHASES = [
  {
    message: "Deep analysis — evaluating competitive landscape",
    icon: Search,
    duration: 12000,
    activities: [
      "Evaluating market positioning...",
      "Identifying key competitors...",
      "Analyzing industry dynamics...",
      "Assessing technology landscape...",
      "Mapping competitive forces...",
    ],
  },
  {
    message: "Opus reasoning — AI disruption exposure",
    icon: Sparkles,
    duration: 10000,
    activities: [
      "Processing market data...",
      "Evaluating competitive dynamics...",
      "Analyzing barrier to entry factors...",
      "Mapping value chain vulnerabilities...",
      "Assessing disruption vectors...",
    ],
  },
  {
    message: "Mapping moat structure — Helfert 5-pillar",
    icon: Shield,
    duration: 10000,
    activities: [
      "Evaluating network effects...",
      "Analyzing switching costs...",
      "Assessing brand strength...",
      "Measuring cost advantages...",
      "Reviewing regulatory moats...",
    ],
  },
  {
    message: "Scoring 5 AI disruption vectors",
    icon: Target,
    duration: 12000,
    activities: [
      "Process automation vulnerability...",
      "Knowledge commoditization risk...",
      "Decision intelligence threat...",
      "Customer disintermediation...",
      "Cost structure disruption...",
    ],
  },
  {
    message: "Modeling margin compression scenarios",
    icon: TrendingDown,
    duration: 10000,
    activities: [
      "Conservative scenario modeling...",
      "Base case projection...",
      "Aggressive scenario stress test...",
      "Calculating fade rate trajectories...",
    ],
  },
  {
    message: "Assembling expert panel verdicts",
    icon: Users,
    duration: 15000,
    activities: [
      "Damodaran — valuation framework...",
      "Gurley — market dynamics lens...",
      "Thiel — contrarian perspective...",
      "Kahneman — behavioral analysis...",
      "McGrath — competitive advantage...",
    ],
  },
  {
    message: "Running Torpedo premortem analysis",
    icon: AlertTriangle,
    duration: 10000,
    activities: [
      "Identifying catastrophic failure modes...",
      "Modeling cascade risk scenarios...",
      "Developing mitigation strategies...",
      "Assessing probability distributions...",
    ],
  },
  {
    message: "Opus synthesizing final assessment",
    icon: Sparkles,
    duration: 0,
    activities: [
      "Integrating all analytical dimensions...",
      "Generating strategic recommendations...",
      "Finalizing risk classification...",
      "Preparing institutional-grade report...",
    ],
  },
];

interface ScannerLoadingAnimationProps {
  companyName: string;
}

export default function ScannerLoadingAnimation({ companyName }: ScannerLoadingAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [heartbeat, setHeartbeat] = useState(true);

  // Heartbeat indicator - blinks every 500ms to show active processing
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

  // Progress and phase management
  useEffect(() => {
    const totalDuration = LOADING_PHASES.slice(0, -1).reduce((sum, phase) => sum + phase.duration, 0);
    let elapsed = 0;

    const progressInterval = setInterval(() => {
      elapsed += 100;
      const maxProgress = 92;
      const calculatedProgress = Math.min((elapsed / totalDuration) * maxProgress, maxProgress);
      setProgress(calculatedProgress);
    }, 100);

    let phaseTimeout: NodeJS.Timeout;
    const scheduleNextPhase = (phaseIndex: number) => {
      if (phaseIndex >= LOADING_PHASES.length - 1) {
        setCurrentPhase(LOADING_PHASES.length - 1);
        return;
      }

      phaseTimeout = setTimeout(() => {
        setCurrentPhase(phaseIndex + 1);
        setCurrentActivity(0);
        scheduleNextPhase(phaseIndex + 1);
      }, LOADING_PHASES[phaseIndex].duration);
    };

    scheduleNextPhase(0);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(phaseTimeout);
    };
  }, []);

  // Cycle through activities within current phase
  useEffect(() => {
    const phase = LOADING_PHASES[currentPhase];
    if (!phase.activities.length) return;

    const activityInterval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % phase.activities.length);
    }, 2500);

    return () => clearInterval(activityInterval);
  }, [currentPhase]);

  const phase = LOADING_PHASES[currentPhase];
  const PhaseIcon = phase.icon;
  const currentActivityText = phase.activities[currentActivity] || phase.activities[0];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="py-8 px-6 space-y-6">
      {/* Header with company name */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">
          Deep Analysis: {companyName}
        </h3>
        <p className="text-sm text-[#1B2A4A]/60">
          Powered by Claude Opus — Maximum Depth Analysis
        </p>
      </div>

      {/* Live Stats Bar */}
      <div className="flex justify-center gap-3 flex-wrap">
        {/* LIVE Indicator */}
        <Badge className={`${heartbeat ? 'bg-red-500' : 'bg-red-600'} text-white border-none px-3 py-1 animate-pulse`}>
          <span className={`w-2 h-2 rounded-full ${heartbeat ? 'bg-white' : 'bg-red-200'} mr-2 inline-block`} />
          <span className="text-xs font-bold">LIVE</span>
        </Badge>
        <Badge variant="outline" className="bg-[#1B2A4A]/5 border-[#1B2A4A]/20 px-3 py-1">
          <Zap className="w-3 h-3 mr-1 text-[#C5985E]" />
          <span className="text-xs font-mono">{formatTime(elapsedTime)}</span>
        </Badge>
      </div>

      {/* Main Phase Display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-[#C5985E]/20 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-[#C5985E]/10 animate-pulse" />

          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#1B2A4A] to-[#1B2A4A]/80 flex items-center justify-center shadow-lg">
            <PhaseIcon className="w-12 h-12 text-[#C5985E]" />
          </div>

          {/* Spinning indicator */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#C5985E] flex items-center justify-center shadow-md">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        </div>

        {/* Current phase message */}
        <div className="text-center max-w-lg">
          <p className="text-lg font-semibold text-[#1B2A4A] mb-2">
            {phase.message}
          </p>
          {/* Animated current activity */}
          <div className="h-6 overflow-hidden">
            <p
              key={currentActivityText}
              className="text-sm text-[#C5985E] animate-fade-in"
            >
              {currentActivityText}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="max-w-lg mx-auto space-y-3">
        <div className="relative">
          <Progress value={progress} className="h-3 bg-[#1B2A4A]/10" />
          {/* Animated shine effect on progress bar */}
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
            Phase {currentPhase + 1} of {LOADING_PHASES.length}
          </span>
          <span className="font-mono">{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Phase Checklist */}
      <div className="max-w-lg mx-auto bg-[#F8F9FC] rounded-xl p-4 border border-[#1B2A4A]/10">
        <div className="space-y-2">
          {LOADING_PHASES.map((p, index) => {
            const Icon = p.icon;
            const isComplete = index < currentPhase;
            const isCurrent = index === currentPhase;

            return (
              <div
                key={index}
                className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all duration-300 ${
                  isCurrent
                    ? "bg-white border border-[#C5985E]/40 shadow-sm"
                    : isComplete
                    ? "bg-green-50/50"
                    : "opacity-50"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="relative flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#C5985E]" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C5985E] rounded-full animate-pulse" />
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
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5985E] flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reassurance Message */}
      <div className="text-center">
        <p className="text-xs text-[#1B2A4A]/50">
          Claude is actively reasoning — please don't refresh.
        </p>
      </div>

      {/* Add CSS for custom animations */}
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
