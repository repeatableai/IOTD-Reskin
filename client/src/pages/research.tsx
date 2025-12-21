import Header from "@/components/Header";
import { Search, FileText, BarChart, Users, CheckCircle2, AlertCircle, Zap, Brain, Clock, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { ResearchRequest } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

// Form schema for AI research
const aiResearchSchema = z.object({
  ideaTitle: z.string().min(5, "Title must be at least 5 characters"),
  ideaDescription: z.string().min(50, "Description must be at least 50 characters"),
  targetMarket: z.string().optional(),
  additionalContext: z.string().optional(),
});

type AIResearchFormData = z.infer<typeof aiResearchSchema>;

// Types for research reports
interface RapidResearchReport {
  summary: string;
  marketOpportunity: string;
  topCompetitors: string[];
  targetCustomer: string;
  revenueModel: string;
  estimatedRevenue: string;
  keyRisks: string[];
  nextSteps: string[];
  overallScore: number;
  recommendation: 'Pursue' | 'Refine' | 'Reconsider';
}

interface DeepResearchReport {
  thinking: string;
  executiveSummary: string;
  marketAnalysis: {
    marketSize: string;
    growthRate: string;
    trends: string[];
    drivers: string[];
    challenges: string[];
  };
  competitorLandscape: {
    directCompetitors: Array<{ name: string; strength: string; weakness: string; marketShare: string }>;
    indirectCompetitors: string[];
    competitiveAdvantages: string[];
  };
  customerAnalysis: {
    primarySegments: Array<{ segment: string; size: string; painPoints: string[]; willingness: string }>;
    buyerPersonas: string[];
    customerJourney: string;
  };
  businessModel: {
    revenueStreams: string[];
    pricingStrategy: string;
    costStructure: string;
    unitEconomics: string;
  };
  goToMarket: {
    launchStrategy: string;
    channelStrategy: string[];
    partnershipOpportunities: string[];
    marketingApproach: string;
  };
  financialProjections: {
    year1: { revenue: string; costs: string; profit: string };
    year2: { revenue: string; costs: string; profit: string };
    year3: { revenue: string; costs: string; profit: string };
    breakEvenTimeline: string;
    fundingRequirements: string;
  };
  riskAnalysis: {
    marketRisks: string[];
    operationalRisks: string[];
    financialRisks: string[];
    mitigationStrategies: string[];
  };
  implementationRoadmap: {
    phase1: { timeline: string; milestones: string[]; resources: string };
    phase2: { timeline: string; milestones: string[]; resources: string };
    phase3: { timeline: string; milestones: string[]; resources: string };
  };
  validationScores: {
    overallScore: number;
    marketOpportunity: number;
    competitivePosition: number;
    executionFeasibility: number;
    financialViability: number;
    timingScore: number;
  };
  keyRecommendations: string[];
  criticalSuccessFactors: string[];
}

type ResearchType = 'deep' | 'rapid' | null;

export default function Research() {
  const [selectedResearchType, setSelectedResearchType] = useState<ResearchType>(null);
  const [rapidReport, setRapidReport] = useState<RapidResearchReport | null>(null);
  const [deepReport, setDeepReport] = useState<DeepResearchReport | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AIResearchFormData>({
    resolver: zodResolver(aiResearchSchema),
  });

  // Query to fetch user's research-created ideas
  const { data: createdIdeas, isLoading: isLoadingIdeas } = useQuery({
    queryKey: ['/api/user/created-ideas'],
    enabled: !!user,
    select: (ideas: any[]) => {
      if (!ideas || !Array.isArray(ideas)) {
        console.log('[Research] No ideas returned from API');
        return [];
      }
      console.log('[Research] Total ideas from API:', ideas.length);
      // Filter ideas created via research (rapid or deep)
      const filtered = ideas.filter(idea => {
        try {
          // Handle cases where sourceData might be a URL string or other non-JSON value
          if (!idea.sourceData) {
            return false;
          }
          
          // Check if it's already a string that starts with http (URL) - skip it
          if (typeof idea.sourceData === 'string' && idea.sourceData.trim().startsWith('http')) {
            return false;
          }
          
          // Try to parse as JSON
          let sourceData;
          try {
            sourceData = typeof idea.sourceData === 'string' ? JSON.parse(idea.sourceData) : idea.sourceData;
          } catch (parseError) {
            // If it's not valid JSON, it's likely a URL or other string - skip it
            return false;
          }
          
          const isResearch = sourceData.researchType === 'rapid' || sourceData.researchType === 'deep';
          if (isResearch) {
            console.log('[Research] Found research idea:', idea.title, 'Type:', sourceData.researchType);
          }
          return isResearch;
        } catch (e) {
          // Silently skip ideas with invalid sourceData
          return false;
        }
      });
      console.log('[Research] Filtered research ideas:', filtered.length);
      return filtered;
    },
  });

  // Mutation for deep research
  const deepResearchMutation = useMutation({
    mutationFn: async (data: AIResearchFormData) => {
      console.log('[Deep Research Mutation] ===== MUTATION CALLED =====');
      console.log('[Deep Research Mutation] Data:', JSON.stringify(data, null, 2));
      console.log('[Deep Research Mutation] Calling apiRequest...');
      
      try {
        const res = await apiRequest('POST', '/api/ai/deep-research', data);
        console.log('[Deep Research Mutation] ✅ Response received');
        console.log('[Deep Research Mutation] Response status:', res.status);
        console.log('[Deep Research Mutation] Response ok:', res.ok);
        
        const json = await res.json();
        console.log('[Deep Research Mutation] ✅ JSON parsed:', json);
        console.log('[Deep Research Mutation] Idea slug:', json?.slug);
        return json;
      } catch (error: any) {
        console.error('[Deep Research Mutation] ❌ ERROR in mutationFn:', error);
        console.error('[Deep Research Mutation] Error message:', error?.message);
        console.error('[Deep Research Mutation] Error stack:', error?.stack);
        throw error;
      }
    },
    onSuccess: (idea) => {
      console.log('[Deep Research Mutation] ✅✅✅ ON SUCCESS CALLED ✅✅✅');
      console.log('[Deep Research Mutation] Idea received:', idea);
      console.log('[Deep Research Mutation] Idea slug:', idea?.slug);
      
      // The API now returns a full idea object, navigate to it
      if (idea && idea.slug) {
        console.log('[Deep Research Mutation] Navigating to idea:', `/idea/${idea.slug}`);
        queryClient.invalidateQueries({ queryKey: ['/api/user/created-ideas'] });
        setLocation(`/idea/${idea.slug}`);
      } else {
        console.warn('[Deep Research Mutation] No slug found, showing report instead');
        // Fallback: if it's still a report format, show it
        setDeepReport(idea as DeepResearchReport);
      }
    },
    onError: (error: any) => {
      console.error('[Deep Research Mutation] ❌❌❌ ON ERROR CALLED ❌❌❌');
      console.error('[Deep Research Mutation] Error:', error);
      console.error('[Deep Research Mutation] Error message:', error?.message);
      console.error('[Deep Research Mutation] Error stack:', error?.stack);
      alert(`Error: ${error?.message || 'Failed to generate deep research'}`);
    },
  });

  // Mutation for rapid research
  const rapidResearchMutation = useMutation({
    mutationFn: async (data: AIResearchFormData) => {
      console.log('[Rapid Research Mutation] ===== MUTATION CALLED =====');
      console.log('[Rapid Research Mutation] Data:', JSON.stringify(data, null, 2));
      console.log('[Rapid Research Mutation] Calling apiRequest...');
      
      try {
        const res = await apiRequest('POST', '/api/ai/rapid-research', data);
        console.log('[Rapid Research Mutation] ✅ Response received');
        console.log('[Rapid Research Mutation] Response status:', res.status);
        console.log('[Rapid Research Mutation] Response ok:', res.ok);
        
        const json = await res.json();
        console.log('[Rapid Research Mutation] ✅ JSON parsed:', json);
        console.log('[Rapid Research Mutation] Idea slug:', json?.slug);
        return json;
      } catch (error: any) {
        console.error('[Rapid Research Mutation] ❌ ERROR in mutationFn:', error);
        console.error('[Rapid Research Mutation] Error message:', error?.message);
        console.error('[Rapid Research Mutation] Error stack:', error?.stack);
        throw error;
      }
    },
    onSuccess: (idea) => {
      console.log('[Rapid Research Mutation] ✅✅✅ ON SUCCESS CALLED ✅✅✅');
      console.log('[Rapid Research Mutation] Idea received:', idea);
      console.log('[Rapid Research Mutation] Idea slug:', idea?.slug);
      
      // The API now returns a full idea object, navigate to it
      if (idea && idea.slug) {
        console.log('[Rapid Research Mutation] Navigating to idea:', `/idea/${idea.slug}`);
        queryClient.invalidateQueries({ queryKey: ['/api/user/created-ideas'] });
        setLocation(`/idea/${idea.slug}`);
      } else {
        console.warn('[Rapid Research Mutation] No slug found, showing report instead');
        // Fallback: if it's still a report format, show it
        setRapidReport(idea as RapidResearchReport);
      }
    },
    onError: (error: any) => {
      console.error('[Rapid Research Mutation] ❌❌❌ ON ERROR CALLED ❌❌❌');
      console.error('[Rapid Research Mutation] Error:', error);
      console.error('[Rapid Research Mutation] Error message:', error?.message);
      console.error('[Rapid Research Mutation] Error stack:', error?.stack);
      alert(`Error: ${error?.message || 'Failed to generate rapid research'}`);
    },
  });

  const onSubmit = (data: AIResearchFormData) => {
    console.log('[Research Form] ===== FORM SUBMITTED =====');
    console.log('[Research Form] Data:', JSON.stringify(data, null, 2));
    console.log('[Research Form] Selected type:', selectedResearchType);
    console.log('[Research Form] Form errors:', errors);
    
    if (!selectedResearchType) {
      console.error('[Research Form] ❌ No research type selected!');
      alert('Please select a research type first');
      return;
    }
    
    if (selectedResearchType === 'deep') {
      console.log('[Research Form] 🚀 Calling deepResearchMutation...');
      deepResearchMutation.mutate(data);
    } else if (selectedResearchType === 'rapid') {
      console.log('[Research Form] 🚀 Calling rapidResearchMutation...');
      rapidResearchMutation.mutate(data);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isLoading = deepResearchMutation.isPending || rapidResearchMutation.isPending;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationColor = (rec: string) => {
    if (rec === 'Pursue') return 'bg-green-100 text-green-800';
    if (rec === 'Refine') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <div className="inline-flex items-center gap-2 mb-4">
            <h1 className="text-4xl font-bold">Research Your Solutions</h1>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">AI-POWERED</span>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant AI-powered research reports to validate your startup ideas
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Research Type Selection Cards */}
          {!selectedResearchType && !rapidReport && !deepReport && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Deep Research Card */}
              <div
                className="border-2 rounded-xl p-6 hover:border-primary cursor-pointer transition-all hover:shadow-lg bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background"
                onClick={() => setSelectedResearchType('deep')}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Deep Research</h3>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">COMPREHENSIVE</span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Comprehensive 20+ page analysis using Claude Sonnet 4.5 with extended thinking for maximum depth.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Full market & competitor analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>3-year financial projections</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Implementation roadmap</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Risk assessment & mitigation</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>~15-20 minutes</span>
                </div>
              </div>

              {/* Rapid Research Card */}
              <div
                className="border-2 rounded-xl p-6 hover:border-primary cursor-pointer transition-all hover:shadow-lg bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background"
                onClick={() => setSelectedResearchType('rapid')}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Rapid Idea Report</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">FAST</span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Quick but valuable assessment using Claude Haiku for fast turnaround when you need answers now.
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Market opportunity summary</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Top 5 competitors</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Revenue estimate</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Go/No-Go recommendation</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>~2-5 minutes</span>
                </div>
              </div>
            </div>
          )}

          {/* Created Ideas List Below Options - ALWAYS VISIBLE (except when showing reports) */}
          {!rapidReport && !deepReport && (
            <div className="mt-12 mb-12">
              <h2 className="text-2xl font-bold mb-6">Your Research Ideas</h2>
              {isLoadingIdeas ? (
                <div className="text-center text-muted-foreground py-8">
                  Loading your research ideas...
                </div>
              ) : createdIdeas && createdIdeas.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {createdIdeas.map((idea: any) => (
                    <Card 
                      key={idea.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setLocation(`/idea/${idea.slug}`)}
                    >
                      <CardContent className="p-4">
                        {idea.imageUrl && (
                          <img 
                            src={idea.imageUrl} 
                            alt={idea.title}
                            className="w-full h-32 object-cover rounded-md mb-3"
                          />
                        )}
                        <h3 className="font-semibold mb-2 line-clamp-1">{idea.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {idea.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{idea.createdAt ? new Date(idea.createdAt).toLocaleDateString() : ''}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(`/idea/${idea.slug}`);
                            }}
                          >
                            View →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8 border rounded-lg">
                  <p className="mb-2">No research ideas yet.</p>
                  <p className="text-sm">Create your first research idea using Deep Research or Rapid Idea Report above.</p>
                </div>
              )}
            </div>
          )}

          {/* Research Form */}
          {selectedResearchType && !rapidReport && !deepReport && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedResearchType(null)}
                  className="mb-4"
                >
                  &larr; Back to options
                </Button>
                <div className="flex items-center gap-3 mb-2">
                  {selectedResearchType === 'deep' ? (
                    <Brain className="w-8 h-8 text-purple-600" />
                  ) : (
                    <Zap className="w-8 h-8 text-blue-600" />
                  )}
                  <h2 className="text-2xl font-bold">
                    {selectedResearchType === 'deep' ? 'Deep Research Report' : 'Rapid Idea Report'}
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  {selectedResearchType === 'deep'
                    ? 'Fill in the details below for a comprehensive analysis'
                    : 'Enter your idea details for a quick assessment'}
                </p>
              </div>

              {!user ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please log in to generate research reports
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-6">
                  <div>
                    <Label htmlFor="ideaTitle">Idea Title *</Label>
                    <Input
                      id="ideaTitle"
                      {...register("ideaTitle")}
                      placeholder="e.g., AI-powered meal planner for busy professionals"
                      className={errors.ideaTitle ? "border-red-500" : ""}
                    />
                    {errors.ideaTitle && (
                      <p className="text-sm text-red-600 mt-1">{errors.ideaTitle.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="ideaDescription">Idea Description *</Label>
                    <Textarea
                      id="ideaDescription"
                      {...register("ideaDescription")}
                      placeholder="Describe your idea in detail - what problem does it solve, how does it work, what makes it unique..."
                      rows={5}
                      className={errors.ideaDescription ? "border-red-500" : ""}
                    />
                    {errors.ideaDescription && (
                      <p className="text-sm text-red-600 mt-1">{errors.ideaDescription.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="targetMarket">Target Market (Optional)</Label>
                    <Input
                      id="targetMarket"
                      {...register("targetMarket")}
                      placeholder="e.g., B2B SaaS, Health & Wellness, E-commerce"
                    />
                  </div>

                  {selectedResearchType === 'deep' && (
                    <div>
                      <Label htmlFor="additionalContext">Additional Context (Optional)</Label>
                      <Textarea
                        id="additionalContext"
                        {...register("additionalContext")}
                        placeholder="Any additional context about your experience, budget, timeline, or specific questions..."
                        rows={3}
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        {selectedResearchType === 'deep' ? 'Generating Deep Analysis...' : 'Generating Report...'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Generate {selectedResearchType === 'deep' ? 'Deep Research' : 'Rapid Report'}
                      </span>
                    )}
                  </Button>

                  {isLoading && (
                    <p className="text-sm text-center text-muted-foreground">
                      {selectedResearchType === 'deep'
                        ? 'This may take 15-20 minutes. Claude is thinking deeply about your idea...'
                        : 'This should take 2-5 minutes...'}
                    </p>
                  )}
                </form>
              )}
            </div>
          )}

          {/* Rapid Report Results */}
          {rapidReport && (
            <div className="max-w-4xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => {
                  setRapidReport(null);
                  setSelectedResearchType(null);
                  reset();
                }}
                className="mb-4"
              >
                &larr; Start New Research
              </Button>

              <div className="border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-blue-600" />
                    <h2 className="text-2xl font-bold">Rapid Idea Report</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(rapidReport.overallScore)}`}>
                        {rapidReport.overallScore}/10
                      </div>
                      <div className="text-xs text-muted-foreground">Overall Score</div>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold ${getRecommendationColor(rapidReport.recommendation)}`}>
                      {rapidReport.recommendation}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-muted-foreground">{rapidReport.summary}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Market Opportunity</h3>
                    <p className="text-muted-foreground">{rapidReport.marketOpportunity}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Top Competitors</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {(rapidReport.topCompetitors || []).map((comp, i) => (
                          <li key={i}>{comp}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Key Risks</h3>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {(rapidReport.keyRisks || []).map((risk, i) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Target Customer</h3>
                    <p className="text-muted-foreground">{rapidReport.targetCustomer}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Revenue Model</h3>
                      <p className="text-muted-foreground">{rapidReport.revenueModel}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Estimated First-Year Revenue</h3>
                      <p className="text-2xl font-bold text-green-600">{rapidReport.estimatedRevenue}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Next Steps</h3>
                    <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                      {(rapidReport.nextSteps || []).map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deep Report Results */}
          {deepReport && (
            <div className="max-w-5xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => {
                  setDeepReport(null);
                  setSelectedResearchType(null);
                  reset();
                }}
                className="mb-4"
              >
                &larr; Start New Research
              </Button>

              <div className="border rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Brain className="w-8 h-8 text-purple-600" />
                    <h2 className="text-2xl font-bold">Deep Research Report</h2>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(deepReport.validationScores.overallScore)}`}>
                      {deepReport.validationScores.overallScore}/10
                    </div>
                    <div className="text-xs text-muted-foreground">Overall Score</div>
                  </div>
                </div>

                {/* Validation Scores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className={`text-xl font-bold ${getScoreColor(deepReport.validationScores.marketOpportunity)}`}>
                      {deepReport.validationScores.marketOpportunity}/10
                    </div>
                    <div className="text-xs text-muted-foreground">Market</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-bold ${getScoreColor(deepReport.validationScores.competitivePosition)}`}>
                      {deepReport.validationScores.competitivePosition}/10
                    </div>
                    <div className="text-xs text-muted-foreground">Competitive</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-bold ${getScoreColor(deepReport.validationScores.executionFeasibility)}`}>
                      {deepReport.validationScores.executionFeasibility}/10
                    </div>
                    <div className="text-xs text-muted-foreground">Feasibility</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-bold ${getScoreColor(deepReport.validationScores.financialViability)}`}>
                      {deepReport.validationScores.financialViability}/10
                    </div>
                    <div className="text-xs text-muted-foreground">Financial</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl font-bold ${getScoreColor(deepReport.validationScores.timingScore)}`}>
                      {deepReport.validationScores.timingScore}/10
                    </div>
                    <div className="text-xs text-muted-foreground">Timing</div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{deepReport.executiveSummary}</p>
                </div>

                {/* Collapsible Sections */}
                <div className="space-y-4">
                  {/* Market Analysis */}
                  <div className="border rounded-lg">
                    <button
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50"
                      onClick={() => toggleSection('market')}
                    >
                      <h3 className="text-lg font-semibold">Market Analysis</h3>
                      {expandedSections.market ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expandedSections.market && (
                      <div className="p-4 pt-0 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <strong>Market Size:</strong>
                            <p className="text-muted-foreground">{deepReport.marketAnalysis.marketSize}</p>
                          </div>
                          <div>
                            <strong>Growth Rate:</strong>
                            <p className="text-muted-foreground">{deepReport.marketAnalysis.growthRate}</p>
                          </div>
                        </div>
                        <div>
                          <strong>Key Trends:</strong>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {(deepReport.marketAnalysis?.trends || []).map((t, i) => <li key={i}>{t}</li>)}
                          </ul>
                        </div>
                        <div>
                          <strong>Market Drivers:</strong>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {(deepReport.marketAnalysis?.drivers || []).map((d, i) => <li key={i}>{d}</li>)}
                          </ul>
                        </div>
                        <div>
                          <strong>Challenges:</strong>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {(deepReport.marketAnalysis?.challenges || []).map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Competitor Landscape */}
                  <div className="border rounded-lg">
                    <button
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50"
                      onClick={() => toggleSection('competitors')}
                    >
                      <h3 className="text-lg font-semibold">Competitor Landscape</h3>
                      {expandedSections.competitors ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expandedSections.competitors && (
                      <div className="p-4 pt-0 space-y-4">
                        <div>
                          <strong>Direct Competitors:</strong>
                          <div className="grid gap-2 mt-2">
                            {(deepReport.competitorLandscape?.directCompetitors || []).map((comp, i) => (
                              <div key={i} className="border rounded p-3">
                                <div className="font-medium">{comp.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  <span className="text-green-600">Strength: {comp.strength}</span> |
                                  <span className="text-red-600"> Weakness: {comp.weakness}</span> |
                                  Market Share: {comp.marketShare}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <strong>Competitive Advantages:</strong>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {(deepReport.competitorLandscape?.competitiveAdvantages || []).map((a, i) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Financial Projections */}
                  <div className="border rounded-lg">
                    <button
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50"
                      onClick={() => toggleSection('financial')}
                    >
                      <h3 className="text-lg font-semibold">Financial Projections</h3>
                      {expandedSections.financial ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expandedSections.financial && (
                      <div className="p-4 pt-0 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="border rounded p-3 text-center">
                            <div className="text-sm text-muted-foreground">Year 1</div>
                            <div className="font-bold text-green-600">{deepReport.financialProjections.year1.revenue}</div>
                            <div className="text-xs text-muted-foreground">Revenue</div>
                          </div>
                          <div className="border rounded p-3 text-center">
                            <div className="text-sm text-muted-foreground">Year 2</div>
                            <div className="font-bold text-green-600">{deepReport.financialProjections.year2.revenue}</div>
                            <div className="text-xs text-muted-foreground">Revenue</div>
                          </div>
                          <div className="border rounded p-3 text-center">
                            <div className="text-sm text-muted-foreground">Year 3</div>
                            <div className="font-bold text-green-600">{deepReport.financialProjections.year3.revenue}</div>
                            <div className="text-xs text-muted-foreground">Revenue</div>
                          </div>
                        </div>
                        <div>
                          <strong>Break-Even Timeline:</strong>
                          <p className="text-muted-foreground">{deepReport.financialProjections.breakEvenTimeline}</p>
                        </div>
                        <div>
                          <strong>Funding Requirements:</strong>
                          <p className="text-muted-foreground">{deepReport.financialProjections.fundingRequirements}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Go-To-Market */}
                  <div className="border rounded-lg">
                    <button
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50"
                      onClick={() => toggleSection('gtm')}
                    >
                      <h3 className="text-lg font-semibold">Go-To-Market Strategy</h3>
                      {expandedSections.gtm ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expandedSections.gtm && (
                      <div className="p-4 pt-0 space-y-4">
                        <div>
                          <strong>Launch Strategy:</strong>
                          <p className="text-muted-foreground">{deepReport.goToMarket.launchStrategy}</p>
                        </div>
                        <div>
                          <strong>Channel Strategy:</strong>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {(deepReport.goToMarket?.channelStrategy || []).map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                        <div>
                          <strong>Partnership Opportunities:</strong>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {(deepReport.goToMarket?.partnershipOpportunities || []).map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Risk Analysis */}
                  <div className="border rounded-lg">
                    <button
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50"
                      onClick={() => toggleSection('risks')}
                    >
                      <h3 className="text-lg font-semibold">Risk Analysis</h3>
                      {expandedSections.risks ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expandedSections.risks && (
                      <div className="p-4 pt-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <strong className="text-red-600">Market Risks:</strong>
                            <ul className="list-disc list-inside text-muted-foreground">
                              {(deepReport.riskAnalysis?.marketRisks || []).map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                          <div>
                            <strong className="text-yellow-600">Operational Risks:</strong>
                            <ul className="list-disc list-inside text-muted-foreground">
                              {(deepReport.riskAnalysis?.operationalRisks || []).map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                          <div>
                            <strong className="text-orange-600">Financial Risks:</strong>
                            <ul className="list-disc list-inside text-muted-foreground">
                              {(deepReport.riskAnalysis?.financialRisks || []).map((r, i) => <li key={i}>{r}</li>)}
                            </ul>
                          </div>
                        </div>
                        <div>
                          <strong className="text-green-600">Mitigation Strategies:</strong>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {(deepReport.riskAnalysis?.mitigationStrategies || []).map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Implementation Roadmap */}
                  <div className="border rounded-lg">
                    <button
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50"
                      onClick={() => toggleSection('roadmap')}
                    >
                      <h3 className="text-lg font-semibold">Implementation Roadmap</h3>
                      {expandedSections.roadmap ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {expandedSections.roadmap && deepReport.implementationRoadmap && (
                      <div className="p-4 pt-0 space-y-4">
                        {[
                          { phase: 'Phase 1', data: deepReport.implementationRoadmap.phase1, color: 'blue' },
                          { phase: 'Phase 2', data: deepReport.implementationRoadmap.phase2, color: 'purple' },
                          { phase: 'Phase 3', data: deepReport.implementationRoadmap.phase3, color: 'green' },
                        ].filter(({ data }) => data).map(({ phase, data, color }) => (
                          <div key={phase} className={`border-l-4 border-${color}-500 pl-4`}>
                            <h4 className="font-semibold">{phase}: {data?.timeline}</h4>
                            <p className="text-sm text-muted-foreground mb-2">Resources: {data?.resources}</p>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                              {(data?.milestones || []).map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Key Recommendations */}
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">Key Recommendations</h3>
                  <ol className="list-decimal list-inside text-muted-foreground space-y-1">
                    {(deepReport.keyRecommendations || []).map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ol>
                </div>

                {/* Critical Success Factors */}
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-200">Critical Success Factors</h3>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {(deepReport.criticalSuccessFactors || []).map((factor, i) => (
                      <li key={i}>{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
