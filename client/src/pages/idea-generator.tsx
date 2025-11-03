import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  DollarSign,
  Clock,
  Target,
  Loader2,
  ArrowRight
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GeneratedIdea {
  title: string;
  subtitle: string;
  description: string;
  market: string;
  targetAudience: string;
  opportunityScore: number;
  problemScore: number;
  feasibilityScore: number;
  whyThisIdea: string;
  nextSteps: string;
  estimatedRevenue: string;
  timeToLaunch: string;
}

export default function IdeaGenerator() {
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [industryInterests, setIndustryInterests] = useState("");
  const [experience, setExperience] = useState("");
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: {
      skills: string;
      budget: string;
      timeCommitment: string;
      industryInterests: string;
      experience: string;
    }) => {
      const response = await apiRequest("POST", "/api/generate-ideas", data);
      return await response.json();
    },
    onSuccess: (data) => {
      setIdeas(data.ideas || []);
      toast({
        title: "Solutions Generated!",
        description: `We've created ${data.ideas?.length || 3} personalized startup solutions for you.`,
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate ideas. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skills.trim()) {
      toast({
        title: "Skills Required",
        description: "Please describe your skills and experience.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate({
      skills,
      budget,
      timeCommitment,
      industryInterests,
      experience,
    });
  };

  const handleNewGeneration = () => {
    setIdeas([]);
    setSkills("");
    setBudget("");
    setTimeCommitment("");
    setIndustryInterests("");
    setExperience("");
  };

  return (
    <div className="min-h-screen bg-background" data-testid="idea-generator-page">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered Generation
          </Badge>
          <h1 className="text-5xl font-bold mb-4" data-testid="text-page-title">
            AI Solution Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get personalized startup solutions tailored to your unique skills, budget, and interests. 
            Our AI analyzes your profile and generates opportunities perfectly matched to your situation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Lightbulb className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Personalized Solutions</CardTitle>
              <CardDescription>
                Solutions matched to your skills, budget, time, and industry interests
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Target className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Validated Opportunities</CardTitle>
              <CardDescription>
                Each solution comes with opportunity scores and market validation data
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Actionable Plans</CardTitle>
              <CardDescription>
                Revenue estimates, timeline, and next steps included with every solution
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Generator Form */}
        {ideas.length === 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Tell Us About Yourself</CardTitle>
              <CardDescription>
                The more details you provide, the better matched your solutions will be
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="skills">
                    Your Skills & Expertise *
                  </Label>
                  <Textarea
                    id="skills"
                    data-testid="input-skills"
                    placeholder="e.g., Software development, digital marketing, data analysis, project management, sales..."
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Available Budget</Label>
                    <Select value={budget} onValueChange={setBudget}>
                      <SelectTrigger id="budget" data-testid="select-budget">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bootstrap">Bootstrapped ($0-$5k)</SelectItem>
                        <SelectItem value="small">Small Budget ($5k-$25k)</SelectItem>
                        <SelectItem value="medium">Medium Budget ($25k-$100k)</SelectItem>
                        <SelectItem value="large">Large Budget ($100k+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time Commitment</Label>
                    <Select value={timeCommitment} onValueChange={setTimeCommitment}>
                      <SelectTrigger id="time" data-testid="select-time">
                        <SelectValue placeholder="Select time commitment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="side">Side Project (5-10 hrs/week)</SelectItem>
                        <SelectItem value="part">Part-Time (20-30 hrs/week)</SelectItem>
                        <SelectItem value="full">Full-Time (40+ hrs/week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industries">Industry Interests (Optional)</Label>
                  <Input
                    id="industries"
                    data-testid="input-industries"
                    placeholder="e.g., SaaS, E-commerce, Healthcare, Education, Finance"
                    value={industryInterests}
                    onChange={(e) => setIndustryInterests(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger id="experience" data-testid="select-experience">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (First startup)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (1-2 startups)</SelectItem>
                      <SelectItem value="experienced">Experienced (3+ startups)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={generateMutation.isPending}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Your Solutions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Solutions
                    </>
                  )}
                </Button>

                {generateMutation.isPending && (
                  <Alert>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <AlertDescription>
                      Creating personalized solutions based on your profile... This may take 30-60 seconds.
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Generated Ideas */}
        {ideas.length > 0 && (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Your Personalized Solutions</h2>
              <Button onClick={handleNewGeneration} data-testid="button-new-generation">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate New Solutions
              </Button>
            </div>

            <div className="grid gap-6">
              {ideas.map((idea, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={`card-idea-${index}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className="mb-2">{idea.market}</Badge>
                        <CardTitle className="text-2xl mb-2">{idea.title}</CardTitle>
                        <CardDescription className="text-base">{idea.subtitle}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="text-lg">
                          {idea.opportunityScore}/10
                        </Badge>
                        <span className="text-xs text-muted-foreground">Opportunity</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {idea.description}
                    </p>

                    {/* Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-primary">{idea.opportunityScore}/10</div>
                        <div className="text-sm text-muted-foreground">Opportunity</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{idea.problemScore}/10</div>
                        <div className="text-sm text-muted-foreground">Problem Fit</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{idea.feasibilityScore}/10</div>
                        <div className="text-sm text-muted-foreground">Feasibility</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{idea.estimatedRevenue}</div>
                        <div className="text-sm text-muted-foreground">Est. Revenue (Y1)</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold">Target Audience</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{idea.targetAudience}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold">Why This Solution Matches You</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{idea.whyThisIdea}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <ArrowRight className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold">Next Steps</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{idea.nextSteps}</p>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-muted-foreground">{idea.timeToLaunch} to launch</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-muted-foreground">{idea.estimatedRevenue} Year 1</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full" data-testid={`button-research-${index}`}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Research This Solution
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
