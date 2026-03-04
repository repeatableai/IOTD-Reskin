import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Skull,
  Search,
  Brain,
  AlertTriangle,
  Target,
  Shield,
  Loader2,
  CheckCircle2,
  Zap,
  BarChart3,
} from "lucide-react";

const LOADING_PHASES = [
  {
    message: "Reading venture data...",
    icon: Search,
    duration: 3000,
    activities: [
      "Extracting venture context...",
      "Analyzing market positioning...",
      "Identifying key competitors...",
    ],
  },
  {
    message: "Selecting critical failure perspectives...",
    icon: Target,
    duration: 3000,
    activities: [
      "Mapping industry-specific risks...",
      "Selecting domain experts...",
      "Calibrating failure lenses...",
    ],
  },
  {
    message: "Generating failure narratives...",
    icon: Skull,
    duration: 15000,
    activities: [
      "Writing past-tense failure stories...",
      "Incorporating venture-specific data...",
      "Crafting visceral narratives...",
      "Identifying root causes...",
      "Developing mitigation strategies...",
    ],
  },
  {
    message: "Calculating risk scores...",
    icon: BarChart3,
    duration: 5000,
    activities: [
      "Assessing severity levels...",
      "Computing risk reduction potential...",
      "Determining confidence ratings...",
    ],
  },
  {
    message: "Finalizing pre-mortem analysis...",
    icon: Brain,
    duration: 0,
    activities: [
      "Synthesizing executive summary...",
      "Validating output quality...",
      "Preparing final report...",
    ],
  },
];

interface PreMortemLoadingAnimationProps {
  ventureName: string;
}

export default function PreMortemLoadingAnimation({ ventureName }: PreMortemLoadingAnimationProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [heartbeat, setHeartbeat] = useState(true);

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

  // Cycle through activities
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
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#1B2A4A] mb-2">
          Pre-Mortem Analysis: {ventureName}
        </h3>
        <p className="text-sm text-[#1B2A4A]/60">
          Powered by Claude Opus — Deep Failure Analysis
        </p>
      </div>

      {/* Live Stats Bar */}
      <div className="flex justify-center gap-3 flex-wrap">
        <Badge className={`${heartbeat ? 'bg-red-500' : 'bg-red-600'} text-white border-none px-3 py-1 animate-pulse`}>
          <span className={`w-2 h-2 rounded-full ${heartbeat ? 'bg-white' : 'bg-red-200'} mr-2 inline-block`} />
          <span className="text-xs font-bold">ANALYZING</span>
        </Badge>
        <Badge variant="outline" className="bg-[#1B2A4A]/5 border-[#1B2A4A]/20 px-3 py-1">
          <Zap className="w-3 h-3 mr-1 text-red-500" />
          <span className="text-xs font-mono">{formatTime(elapsedTime)}</span>
        </Badge>
      </div>

      {/* Main Phase Display */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {/* Pulsing ring animation */}
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-red-500/10 animate-pulse" />

          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg">
            <PhaseIcon className="w-12 h-12 text-white" />
          </div>

          {/* Spinning indicator */}
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-md">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        </div>

        {/* Current phase message */}
        <div className="text-center max-w-lg">
          <p className="text-lg font-semibold text-[#1B2A4A] mb-2">
            {phase.message}
          </p>
          <div className="h-6 overflow-hidden">
            <p
              key={currentActivityText}
              className="text-sm text-red-600 animate-fade-in"
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

      {/* Skeleton Cards */}
      <div className="max-w-2xl mx-auto space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className={`border-[#1B2A4A]/10 ${i <= currentPhase + 1 ? 'opacity-100' : 'opacity-30'}`}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg ${
                  i <= currentPhase ? 'bg-red-100' : 'bg-[#1B2A4A]/10'
                } animate-pulse`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-4 ${
                    i <= currentPhase ? 'bg-red-100' : 'bg-[#1B2A4A]/10'
                  } rounded w-1/3 animate-pulse`} />
                  <div className={`h-3 ${
                    i <= currentPhase ? 'bg-red-50' : 'bg-[#1B2A4A]/5'
                  } rounded w-2/3 animate-pulse`} />
                </div>
                {i <= currentPhase && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
                    ? "bg-white border border-red-300/40 shadow-sm"
                    : isComplete
                    ? "bg-green-50/50"
                    : "opacity-50"
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="relative flex-shrink-0">
                    <Icon className="w-5 h-5 text-red-600" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
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
                  <Loader2 className="w-4 h-4 animate-spin text-red-600 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reassurance Message */}
      <div className="text-center">
        <p className="text-xs text-[#1B2A4A]/50">
          Claude is generating failure narratives — please don't refresh.
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
