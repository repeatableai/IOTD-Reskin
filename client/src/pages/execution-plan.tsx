import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Rocket,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Code,
  Database,
  TestTube,
  Palette,
  Calendar,
  Target,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Zap
} from "lucide-react";
import type { Idea } from "@shared/schema";

// Strip markdown formatting from text
const stripMarkdown = (text: string): string => {
  return text
    .replace(/^#{1,6}\s+/gm, '')           // Remove ## headers
    .replace(/\*\*([^*]+)\*\*/g, '$1')     // Remove **bold**
    .replace(/\*([^*]+)\*/g, '$1')         // Remove *italic*
    .replace(/^-\s*\*\*/gm, '')            // Remove -** at start of lines
    .replace(/^\*\*\s*/gm, '')             // Remove ** at start of lines
    .replace(/\*\*\s*$/gm, '')             // Remove ** at end of lines
    .replace(/^[-*]\s+/gm, '• ')           // Convert - or * bullets to •
    .replace(/`([^`]+)`/g, '$1')           // Remove inline code backticks
    .trim();
};

// Calculate OWVI Score based on idea metrics
const calculateOWVI = (idea: Idea) => {
  const baseScore = Math.round(
    ((idea.feasibilityScore || 7) * 0.3 +
      (idea.executionScore ? (10 - idea.executionScore) : 6) * 0.3 +
      (idea.timingScore || 7) * 0.2 +
      (idea.opportunityScore || 7) * 0.2) * 10
  );
  return Math.min(100, Math.max(50, baseScore));
};

// Get OWVI label (Two-Week Viability Index)
const getOWVILabel = (score: number) => {
  if (score >= 90) return { label: "2-Day Build", color: "text-green-600", bg: "bg-green-100" };
  if (score >= 80) return { label: "1-Week Build", color: "text-blue-600", bg: "bg-blue-100" };
  if (score >= 70) return { label: "2-Week Build", color: "text-yellow-600", bg: "bg-yellow-100" };
  return { label: "Extended Timeline", color: "text-orange-600", bg: "bg-orange-100" };
};

// Phase 1 Steps (No-Code Builder @ $25/hr)
const phase1Steps = [
  {
    step: 0,
    title: "Intake & ROI Hypothesis",
    duration: "1-2 hrs",
    description: "Define scope, success metrics, and expected ROI",
    icon: Target
  },
  {
    step: 1,
    title: "Elaborate with AI",
    duration: "2-4 hrs",
    description: "Expand requirements, user stories, and edge cases",
    icon: Sparkles
  },
  {
    step: 2,
    title: "Generate Fortune-500 UI",
    duration: "2-4 hrs",
    description: "Create polished, enterprise-grade design mockups",
    icon: Palette
  },
  {
    step: 3,
    title: "Refine via Vibe-Coding",
    duration: "4-8 hrs",
    description: "Iterate on design with AI-assisted refinements",
    icon: Zap
  },
  {
    step: 4,
    title: "Export to Claude Code",
    duration: "1-2 hrs",
    description: "Convert designs to functional code scaffolding",
    icon: Code
  },
  {
    step: 5,
    title: "No-Code Build to 80-90%",
    duration: "8-16 hrs",
    description: "Implement core functionality with no-code tools",
    icon: Rocket
  }
];

// Phase 2 Teams
const phase2Teams = [
  { role: "Front-End Team", rate: 30, icon: Palette, tasks: ["UI polish", "Animations", "Responsive design"] },
  { role: "Back-End Team", rate: 35, icon: Code, tasks: ["API endpoints", "Business logic", "Integrations"] },
  { role: "Database Schema Verification", rate: 35, icon: Database, tasks: ["Schema review", "Optimization", "Migrations"] },
  { role: "QA & Debugging", rate: 30, icon: TestTube, tasks: ["Test coverage", "Bug fixes", "Edge cases"] }
];

// Two-Week Schedule
const generateDaySchedule = (owviScore: number) => {
  const isQuickBuild = owviScore >= 90;  // 2-day build
  const isWeekBuild = owviScore >= 80;   // 1-week build

  if (isQuickBuild) {
    return [
      { day: "Day 1", title: "Build & Deploy", tasks: ["Setup", "Core features", "Basic UI", "Deploy MVP"], status: "critical", hours: "8 hrs" },
      { day: "Day 2", title: "Polish & Launch", tasks: ["UI polish", "Testing", "Documentation", "Launch"], status: "important", hours: "8 hrs" }
    ];
  } else if (isWeekBuild) {
    return [
      { day: "Day 1-2", title: "Foundation", tasks: ["Planning", "Architecture", "Environment setup"], status: "critical", hours: "16 hrs" },
      { day: "Day 3-4", title: "Core Build", tasks: ["Backend API", "Database", "Core UI components"], status: "critical", hours: "16 hrs" },
      { day: "Day 5", title: "Features & Integration", tasks: ["Feature completion", "Third-party integrations"], status: "important", hours: "8 hrs" }
    ];
  } else {
    // 2-week build
    return [
      { day: "Week 1: Day 1-2", title: "Planning & Setup", tasks: ["Requirements", "Architecture", "Tech stack decisions"], status: "critical", hours: "16 hrs" },
      { day: "Week 1: Day 3-4", title: "Backend Development", tasks: ["API endpoints", "Database schema", "Auth system"], status: "critical", hours: "16 hrs" },
      { day: "Week 1: Day 5", title: "Backend Complete", tasks: ["Business logic", "Integrations", "API testing"], status: "important", hours: "8 hrs" },
      { day: "Week 2: Day 6-7", title: "Frontend Development", tasks: ["UI components", "Pages", "State management"], status: "important", hours: "16 hrs" },
      { day: "Week 2: Day 8-9", title: "Integration & Features", tasks: ["Connect frontend/backend", "Feature polish", "Edge cases"], status: "normal", hours: "16 hrs" },
      { day: "Week 2: Day 10", title: "QA & Launch", tasks: ["Testing", "Bug fixes", "Deployment", "Documentation"], status: "normal", hours: "8 hrs" }
    ];
  }
};

export default function ExecutionPlan() {
  const { slug } = useParams();

  if (!slug) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p>Solution not found</p>
        </div>
      </div>
    );
  }

  const { data: idea, isLoading } = useQuery<Idea>({
    queryKey: ["/api/ideas", slug],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p>Solution not found</p>
        </div>
      </div>
    );
  }

  const owviScore = calculateOWVI(idea);
  const owviLabel = getOWVILabel(owviScore);
  const daySchedule = generateDaySchedule(owviScore);
  const isGoDecision = owviScore >= 70;

  // Calculate estimated costs
  const phase1Hours = owviScore >= 85 ? 6 : owviScore >= 70 ? 10 : 15;
  const phase2Hours = owviScore >= 85 ? 8 : owviScore >= 70 ? 20 : 40;
  const phase1Cost = phase1Hours * 25;
  const phase2Cost = phase2Hours * 32; // avg of team rates
  const totalCost = phase1Cost + phase2Cost;

  return (
    <div className="min-h-screen bg-background" data-testid="execution-plan-page">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link href={`/idea/${slug}`}>
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {idea.title}
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-4">Repeatable.AI Build Process</Badge>
          <h1 className="text-4xl font-bold mb-4" data-testid="text-title">
            Execution Plan
          </h1>
          <p className="text-xl text-muted-foreground">
            One-Week Build Framework for {idea.title}
          </p>
        </div>

        {/* Visual Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Visual Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2 py-4 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg border-2 border-primary">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-semibold">Phase 1</span>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border-2 border-blue-200">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-700">Phase 2</span>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border-2 border-green-200">
                <Rocket className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-700">Deployment</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase 1: No-Code Builder Work */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Phase 1: No-Code Builder Work
                </CardTitle>
                <CardDescription>$25/hr | Rapid prototyping to 80-90% completion</CardDescription>
              </div>
              <Badge variant="outline" className="text-lg">
                ~{phase1Hours} hrs
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {phase1Steps.map((step, idx) => (
              <div key={step.step} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Step {step.step}: {step.title}</h4>
                    <Badge variant="secondary">{step.duration}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Phase 2: Development Team Handoff */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Phase 2: Development Team Handoff
                </CardTitle>
                <CardDescription>Specialized teams for final 10-20%</CardDescription>
              </div>
              <Badge variant="outline" className="text-lg">
                ~{phase2Hours} hrs
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {phase2Teams.map((team) => (
                <div key={team.role} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <team.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{team.role}</h4>
                      <p className="text-sm text-muted-foreground">${team.rate}/hr</p>
                    </div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {team.tasks.map((task) => (
                      <li key={task} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* OWVI Score & Feasibility */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              One-Week Build Feasibility Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OWVI Score */}
            <div className="text-center p-6 rounded-lg bg-muted/50">
              <div className="text-6xl font-bold mb-2">{owviScore}</div>
              <Badge className={`${owviLabel.bg} ${owviLabel.color} text-lg px-4 py-1`}>
                {owviLabel.label}
              </Badge>
              <p className="text-sm text-muted-foreground mt-3">
                OWVI Score (One-Week Viability Index)
              </p>
            </div>

            {/* Feasibility Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Technical Feasibility</span>
                  <span className="text-sm text-muted-foreground">{idea.feasibilityScore || 7}/10</span>
                </div>
                <Progress value={(idea.feasibilityScore || 7) * 10} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Execution Simplicity</span>
                  <span className="text-sm text-muted-foreground">{10 - (idea.executionScore || 5)}/10</span>
                </div>
                <Progress value={(10 - (idea.executionScore || 5)) * 10} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Market Timing</span>
                  <span className="text-sm text-muted-foreground">{idea.timingScore || 7}/10</span>
                </div>
                <Progress value={(idea.timingScore || 7) * 10} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Opportunity Score</span>
                  <span className="text-sm text-muted-foreground">{idea.opportunityScore || 7}/10</span>
                </div>
                <Progress value={(idea.opportunityScore || 7) * 10} className="h-2" />
              </div>
            </div>

            <Separator />

            {/* GO/NO-GO Decision */}
            <div className={`p-6 rounded-lg text-center ${isGoDecision ? 'bg-green-50' : 'bg-orange-50'}`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {isGoDecision ? (
                  <ThumbsUp className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                )}
                <span className={`text-2xl font-bold ${isGoDecision ? 'text-green-700' : 'text-orange-700'}`}>
                  {isGoDecision ? "GO" : "EVALUATE"}
                </span>
              </div>
              <p className={`text-sm ${isGoDecision ? 'text-green-600' : 'text-orange-600'}`}>
                {isGoDecision
                  ? "This project is a strong candidate for one-week build"
                  : "Consider breaking into phases or extending timeline"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Day-by-Day Schedule */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Day-by-Day Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {daySchedule.map((day) => (
                <div
                  key={day.day}
                  className={`p-4 rounded-lg border ${
                    day.status === 'critical' ? 'border-red-200 bg-red-50' :
                    day.status === 'important' ? 'border-yellow-200 bg-yellow-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg">{day.day}</div>
                    <Badge variant="outline" className="text-xs">{day.hours}</Badge>
                  </div>
                  <div className="font-semibold mb-2">{day.title}</div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {day.tasks.map((task) => (
                      <li key={task} className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-current" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resource Allocation & Cost Breakdown */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Resource Allocation & Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="text-sm text-muted-foreground mb-1">Phase 1 (No-Code)</div>
                <div className="text-2xl font-bold">${phase1Cost}</div>
                <div className="text-sm text-muted-foreground">{phase1Hours} hrs @ $25/hr</div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-sm text-muted-foreground mb-1">Phase 2 (Dev Team)</div>
                <div className="text-2xl font-bold">${phase2Cost}</div>
                <div className="text-sm text-muted-foreground">{phase2Hours} hrs @ ~$32/hr avg</div>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="text-sm text-muted-foreground mb-1">Total Estimated</div>
                <div className="text-2xl font-bold text-green-700">${totalCost}</div>
                <div className="text-sm text-muted-foreground">{phase1Hours + phase2Hours} total hours</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legacy Execution Plan (if exists) */}
        {idea.executionPlan && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-primary" />
                Detailed Implementation Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {stripMarkdown(idea.executionPlan)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Link href={`/idea/${slug}/market-gap`}>
            <Button variant="outline" data-testid="button-previous-section">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Market Gap
            </Button>
          </Link>
          <Link href={`/idea/${slug}/build/replit`}>
            <Button data-testid="button-build">
              Start Building
              <Rocket className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
