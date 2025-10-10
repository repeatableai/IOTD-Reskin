import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Target, 
  DollarSign,
  CheckCircle2,
  Loader2,
  Download,
  Copy
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ResearchResult {
  idea: string;
  analysis: {
    marketOpportunity: string;
    competitorAnalysis: string;
    communityInsights: string;
    businessStrategy: string;
    financialProjections: string;
    actionableRecommendations: string;
    validationScore: number;
    problemSeverity: number;
    feasibilityScore: number;
    timingScore: number;
  };
}

export default function IdeaAgent() {
  const [ideaDescription, setIdeaDescription] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [userSkills, setUserSkills] = useState("");
  const [availableBudget, setAvailableBudget] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const { toast } = useToast();

  const researchMutation = useMutation({
    mutationFn: async (data: {
      idea: string;
      targetMarket?: string;
      skills?: string;
      budget?: string;
    }) => {
      const response = await apiRequest("POST", "/api/ai-research", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setResult(data as ResearchResult);
      toast({
        title: "Research Complete!",
        description: "Your comprehensive analysis is ready.",
      });
    },
    onError: () => {
      toast({
        title: "Research Failed",
        description: "Unable to complete the analysis. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaDescription.trim()) {
      toast({
        title: "Idea Required",
        description: "Please describe your startup idea.",
        variant: "destructive",
      });
      return;
    }
    researchMutation.mutate({
      idea: ideaDescription,
      targetMarket,
      skills: userSkills,
      budget: availableBudget,
    });
  };

  const generateReportText = () => {
    if (!result) return '';
    return `
AI Research Agent Report
========================

Idea: ${result.idea}

Market Opportunity
------------------
${result.analysis.marketOpportunity}

Competitor Analysis
-------------------
${result.analysis.competitorAnalysis}

Community Insights
------------------
${result.analysis.communityInsights}

Business Strategy
-----------------
${result.analysis.businessStrategy}

Financial Projections
---------------------
${result.analysis.financialProjections}

Actionable Recommendations
---------------------------
${result.analysis.actionableRecommendations}

Validation Scores
-----------------
Overall Validation: ${result.analysis.validationScore}/10
Problem Severity: ${result.analysis.problemSeverity}/10
Feasibility: ${result.analysis.feasibilityScore}/10
Timing: ${result.analysis.timingScore}/10
    `.trim();
  };

  const handleCopyReport = () => {
    const reportText = generateReportText();
    navigator.clipboard.writeText(reportText);
    toast({
      title: "Report Copied",
      description: "Research report copied to clipboard.",
    });
  };

  const handleDownloadReport = () => {
    const reportText = generateReportText();
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-research-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Report Downloaded",
      description: "Research report downloaded successfully.",
    });
  };

  const handleNewResearch = () => {
    setResult(null);
    setIdeaDescription("");
    setTargetMarket("");
    setUserSkills("");
    setAvailableBudget("");
  };

  return (
    <div className="min-h-screen bg-background" data-testid="idea-agent-page">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Research
          </Badge>
          <h1 className="text-5xl font-bold mb-4" data-testid="text-page-title">
            AI Research Agent
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get a comprehensive 40-step analysis of any startup idea in minutes. 
            Our AI research agent validates your idea with market data, competitor insights, 
            and actionable recommendations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Brain className="w-8 h-8 text-primary mb-2" />
              <CardTitle>40-Step Analysis</CardTitle>
              <CardDescription>
                Comprehensive research across market trends, competition, community signals, and financial projections
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Market Validation</CardTitle>
              <CardDescription>
                Cross-referenced data from Reddit, YouTube, search trends, and industry reports
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Target className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Actionable Insights</CardTitle>
              <CardDescription>
                Step-by-step execution plan with go-to-market strategy and MVP recommendations
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Research Form */}
        {!result && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Submit Your Idea for Research</CardTitle>
              <CardDescription>
                Provide as much detail as possible for the most accurate analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="idea-description">
                    Idea Description *
                  </Label>
                  <Textarea
                    id="idea-description"
                    data-testid="input-idea-description"
                    placeholder="Describe your startup idea in detail. What problem does it solve? Who is it for? How does it work?"
                    value={ideaDescription}
                    onChange={(e) => setIdeaDescription(e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target-market">Target Market (Optional)</Label>
                    <Input
                      id="target-market"
                      data-testid="input-target-market"
                      placeholder="e.g., Small business owners, SaaS companies"
                      value={targetMarket}
                      onChange={(e) => setTargetMarket(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Your Skills (Optional)</Label>
                    <Input
                      id="skills"
                      data-testid="input-skills"
                      placeholder="e.g., Software development, Marketing, Design"
                      value={userSkills}
                      onChange={(e) => setUserSkills(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Available Budget (Optional)</Label>
                    <Input
                      id="budget"
                      data-testid="input-budget"
                      placeholder="e.g., $10k, $50k, Bootstrapped"
                      value={availableBudget}
                      onChange={(e) => setAvailableBudget(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={researchMutation.isPending}
                  data-testid="button-submit-research"
                >
                  {researchMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Your Idea...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Start Research
                    </>
                  )}
                </Button>

                {researchMutation.isPending && (
                  <Alert>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <AlertDescription>
                      Running 40-step analysis... This may take 30-60 seconds.
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Research Results */}
        {result && (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Research Results</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCopyReport} data-testid="button-copy-report">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Report
                </Button>
                <Button variant="outline" onClick={handleDownloadReport} data-testid="button-download-report">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button onClick={handleNewResearch} data-testid="button-new-research">
                  <Sparkles className="w-4 h-4 mr-2" />
                  New Research
                </Button>
              </div>
            </div>

            {/* Validation Scores */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-primary">
                    {result.analysis.validationScore}/10
                  </CardTitle>
                  <CardDescription>Overall Validation</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-bold">
                    {result.analysis.problemSeverity}/10
                  </CardTitle>
                  <CardDescription>Problem Severity</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-bold">
                    {result.analysis.feasibilityScore}/10
                  </CardTitle>
                  <CardDescription>Technical Feasibility</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-bold">
                    {result.analysis.timingScore}/10
                  </CardTitle>
                  <CardDescription>Market Timing</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Analysis Sections */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle>Market Opportunity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {result.analysis.marketOpportunity}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <CardTitle>Competitor Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {result.analysis.competitorAnalysis}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <CardTitle>Community Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {result.analysis.communityInsights}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle>Business Strategy</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {result.analysis.businessStrategy}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <CardTitle>Financial Projections</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {result.analysis.financialProjections}
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <CardTitle>Actionable Recommendations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {result.analysis.actionableRecommendations}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
