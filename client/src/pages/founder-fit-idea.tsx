import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight,
  User,
  Briefcase,
  Clock,
  DollarSign,
  TrendingUp,
  Zap,
  Target,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";

export default function FounderFitIdea() {
  const { slug } = useParams();
  const [, navigate] = useLocation();

  if (!slug) {
    return <NotFound />;
  }

  const { data: idea, isLoading } = useQuery<any>({
    queryKey: ['/api/ideas', slug],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background" data-testid="founder-fit-page">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!idea) {
    return <NotFound />;
  }

  // Extract founder fit data or use placeholder
  const founderFit = idea.frameworkData?.founderFit || {
    overallFitScore: 82,
    skillRequirements: [
      { skill: "Technical/Development", importance: "Critical", proficiency: "Advanced", match: 85 },
      { skill: "Marketing & Sales", importance: "High", proficiency: "Intermediate", match: 70 },
      { skill: "Product Management", importance: "High", proficiency: "Intermediate", match: 75 },
      { skill: "Customer Support", importance: "Medium", proficiency: "Basic", match: 60 },
      { skill: "Financial Management", importance: "Medium", proficiency: "Basic", match: 65 }
    ],
    idealFounderProfile: {
      experience: "2-5 years in tech/SaaS industry",
      background: "Software engineering, product management, or technical background",
      strengths: ["Problem-solving", "User-centric thinking", "Technical implementation"],
      personality: "Detail-oriented, persistent, comfortable with ambiguity"
    },
    successFactors: [
      { factor: "Domain Expertise", weight: "High", description: "Understanding of target market and customer pain points" },
      { factor: "Technical Capability", weight: "Critical", description: "Ability to build or oversee product development" },
      { factor: "Marketing Savvy", weight: "High", description: "Skills to acquire and retain customers" },
      { factor: "Persistence", weight: "High", description: "Determination to overcome obstacles and iterate" },
      { factor: "Network", weight: "Medium", description: "Connections in industry or with potential customers" }
    ],
    timeCommitment: {
      initial: "Full-time (40-60 hrs/week)",
      ongoing: "30-40 hrs/week after launch",
      timeline: "6-12 months to MVP"
    },
    budgetRequirements: {
      minimum: "$5,000-$10,000",
      recommended: "$25,000-$50,000",
      breakdown: ["Development tools & infrastructure", "Marketing & customer acquisition", "Legal & business setup", "Operating buffer"]
    },
    challenges: [
      "Building technical product while learning market needs",
      "Balancing feature development with customer acquisition",
      "Managing cash flow in early stages",
      "Competing with established players"
    ],
    advantages: [
      "Growing market with clear demand",
      "Opportunity for differentiation",
      "Scalable business model",
      "Multiple monetization options"
    ]
  };

  return (
    <div className="min-h-screen bg-background" data-testid="founder-fit-page">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button 
            onClick={() => navigate('/database')} 
            className="hover:text-foreground"
            data-testid="breadcrumb-database"
          >
            Database
          </button>
          <span>/</span>
          <button 
            onClick={() => navigate(`/idea/${slug}`)} 
            className="hover:text-foreground"
            data-testid="breadcrumb-idea"
          >
            {idea.title}
          </button>
          <span>/</span>
          <span className="text-foreground">Founder Fit</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-3">Founder Analysis</Badge>
          <h1 className="text-4xl font-bold mb-3" data-testid="text-page-title">
            Founder Fit Analysis
          </h1>
          <p className="text-xl text-muted-foreground">
            {idea.title}
          </p>
          <p className="text-muted-foreground mt-4">
            Assess how well this solution matches your skills, experience, and resources. 
            Understanding founder fit helps you identify opportunities where you have the highest chance of success.
          </p>
        </div>

        {/* Overall Fit Score */}
        <Card className="mb-8" data-testid="card-overall-fit">
          <CardHeader>
            <CardTitle>Overall Founder Fit Score</CardTitle>
            <CardDescription>
              Based on required skills, experience, and resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-5xl font-bold text-primary">{founderFit.overallFitScore}%</div>
                <Badge variant={founderFit.overallFitScore >= 70 ? "default" : "outline"} className="text-lg">
                  {founderFit.overallFitScore >= 80 ? "Excellent Match" : founderFit.overallFitScore >= 70 ? "Good Match" : "Moderate Match"}
                </Badge>
              </div>
              <Progress value={founderFit.overallFitScore} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {founderFit.overallFitScore >= 80 
                  ? "You have strong alignment with this opportunity. Your skills and resources match well."
                  : founderFit.overallFitScore >= 70
                  ? "Good potential for success. Some skill gaps can be filled through learning or hiring."
                  : "Consider if you can acquire missing skills or find a co-founder to complement your strengths."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Skill Requirements */}
        <Card className="mb-8" data-testid="card-skills">
          <CardHeader>
            <CardTitle>Required Skills & Competencies</CardTitle>
            <CardDescription>
              Key skills needed to successfully execute this idea
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {founderFit.skillRequirements.map((skill: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{skill.skill}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {skill.importance}
                        </Badge>
                        <span>Required: {skill.proficiency}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{skill.match}%</div>
                      <div className="text-xs text-muted-foreground">Match Score</div>
                    </div>
                  </div>
                  <Progress value={skill.match} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ideal Founder Profile */}
        <Card className="mb-8" data-testid="card-ideal-profile">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle>Ideal Founder Profile</CardTitle>
            </div>
            <CardDescription>
              Characteristics of founders who typically succeed with this idea
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Experience
              </h4>
              <p className="text-muted-foreground">{founderFit.idealFounderProfile.experience}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Background</h4>
              <p className="text-muted-foreground">{founderFit.idealFounderProfile.background}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Strengths</h4>
              <div className="flex flex-wrap gap-2">
                {founderFit.idealFounderProfile.strengths.map((strength: string, i: number) => (
                  <Badge key={i} variant="outline">{strength}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Personality Traits</h4>
              <p className="text-muted-foreground">{founderFit.idealFounderProfile.personality}</p>
            </div>
          </CardContent>
        </Card>

        {/* Success Factors */}
        <Card className="mb-8" data-testid="card-success-factors">
          <CardHeader>
            <CardTitle>Critical Success Factors</CardTitle>
            <CardDescription>
              Key factors that determine success for this opportunity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {founderFit.successFactors.map((factor: any, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold">{factor.factor}</div>
                      <Badge variant={factor.weight === "Critical" ? "default" : "outline"}>
                        {factor.weight}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{factor.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time & Budget Requirements */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card data-testid="card-time-commitment">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <CardTitle>Time Commitment</CardTitle>
              </div>
              <CardDescription>Expected time investment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-semibold mb-1">Initial Phase</div>
                <p className="text-sm text-muted-foreground">{founderFit.timeCommitment.initial}</p>
              </div>
              <div>
                <div className="font-semibold mb-1">Ongoing</div>
                <p className="text-sm text-muted-foreground">{founderFit.timeCommitment.ongoing}</p>
              </div>
              <div>
                <div className="font-semibold mb-1">Timeline to MVP</div>
                <p className="text-sm text-muted-foreground">{founderFit.timeCommitment.timeline}</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-budget">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <CardTitle>Budget Requirements</CardTitle>
              </div>
              <CardDescription>Capital needed to launch</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="font-semibold mb-1">Minimum</div>
                <p className="text-sm text-muted-foreground">{founderFit.budgetRequirements.minimum}</p>
              </div>
              <div>
                <div className="font-semibold mb-1">Recommended</div>
                <p className="text-sm text-muted-foreground">{founderFit.budgetRequirements.recommended}</p>
              </div>
              <div>
                <div className="font-semibold mb-1 text-xs">Budget Breakdown</div>
                <ul className="space-y-1">
                  {founderFit.budgetRequirements.breakdown.map((item: string, i: number) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges & Advantages */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card data-testid="card-challenges">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <CardTitle>Key Challenges</CardTitle>
              </div>
              <CardDescription>Obstacles you'll likely face</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {founderFit.challenges.map((challenge: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    {challenge}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card data-testid="card-advantages">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <CardTitle>Competitive Advantages</CardTitle>
              </div>
              <CardDescription>Factors working in your favor</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {founderFit.advantages.map((advantage: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {advantage}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/idea/${slug}`)}
            data-testid="button-back"
          >
            Back to Overview
          </Button>
          <Button 
            onClick={() => navigate(`/idea/${slug}/acp-framework`)}
            data-testid="button-frameworks"
          >
            View Framework Analysis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
