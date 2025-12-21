import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import IdeaActionButtons from "@/components/IdeaActionButtons";
import ClaimButton from "@/components/ClaimButton";
import ExportDialog from "@/components/ExportDialog";
import RoastDialog from "@/components/RoastDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Sparkles, Copy, CheckCircle2, Wand2, ChevronRight, Star, Megaphone, Rocket, DollarSign, Search, Code, Flame, Download, Users } from "lucide-react";
import { MarketTrendGraph } from "@/components/MarketTrendGraph";
import { CollaborationPortal } from "@/components/CollaborationPortal";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
}

const TEMPLATES_BY_CATEGORY = {
  "Popular": [
    {
      id: "reinvention-resume-job-posting",
      name: "Reinvention of the resume/Job Posting",
      description: "Job Seeker & Job Keepers - Modern resume and job posting platform.",
      category: "Popular"
    },
    {
      id: "professional-services-marketplace",
      name: "Professional Services Marketplace",
      description: "Exeleris - Connect professionals with clients.",
      category: "Popular"
    },
    {
      id: "ai-voice-partner-builder",
      name: "AI voice partner builder platform",
      description: "Build AI voice assistants and partners.",
      category: "Popular"
    },
    {
      id: "upsell-app-generator",
      name: "Upsell app generator",
      description: "Any industry, HVAC example - Generate upsell applications.",
      category: "Popular"
    },
    {
      id: "ai-voice-professional-negotiator",
      name: "AI Voice Professional negotiator",
      description: "AI-powered negotiation assistant for professionals.",
      category: "Popular"
    },
    {
      id: "sales-battle-card-ai-voice",
      name: "Sales Battle card AI Voice Upskilling",
      description: "AI voice training for sales battle cards.",
      category: "Popular"
    },
    {
      id: "conversion-equation-app",
      name: "Conversion equation app",
      description: "Optimize conversions with data-driven insights.",
      category: "Popular"
    },
    {
      id: "meta-deliverable-engine",
      name: "Meta deliverable engine",
      description: "Generate and manage project deliverables.",
      category: "Popular"
    },
    {
      id: "aiva",
      name: "Aiva",
      description: "AI-powered platform for business automation.",
      category: "Popular"
    },
    {
      id: "self-serve-ai-role-certification",
      name: "Self Serve AI Enabled Role Certification Program",
      description: "AI-powered role certification and upskilling platform.",
      category: "Popular"
    },
    {
      id: "trade-association-platform",
      name: "Trade Association Platform",
      description: "Platform for trade associations and professional networks.",
      category: "Popular"
    }
  ],
  "Marketing": [
    {
      id: "ad-creatives",
      name: "Ad Creatives",
      description: "High-converting ad copy and creative concepts.",
      category: "Marketing"
    },
    {
      id: "brand-package",
      name: "Brand Package",
      description: "Complete brand identity with logo, colors, and voice.",
      category: "Marketing"
    },
    {
      id: "landing-page",
      name: "Landing Page",
      description: "Copy + wireframe blocks.",
      category: "Marketing"
    },
    {
      id: "content-calendar",
      name: "Content Calendar",
      description: "90-day content marketing plan.",
      category: "Marketing"
    },
    {
      id: "email-funnel-system",
      name: "Email Funnel System",
      description: "Complete email marketing funnel with sequences, triggers &...",
      category: "Marketing"
    },
    {
      id: "email-sequence",
      name: "Email Sequence",
      description: "5-email nurture sequence.",
      category: "Marketing"
    },
    {
      id: "lead-magnet",
      name: "Lead Magnet",
      description: "Irresistible lead generation offers.",
      category: "Marketing"
    },
    {
      id: "sales-funnel",
      name: "Sales Funnel",
      description: "Customer journey optimization strategy.",
      category: "Marketing"
    },
    {
      id: "seo-content",
      name: "SEO Content",
      description: "Search-optimized content strategy.",
      category: "Marketing"
    },
    {
      id: "tweet-sized-landing-page",
      name: "Tweet-Sized Landing Page",
      description: "Ultra-minimal 280-character landing page.",
      category: "Marketing"
    },
    {
      id: "user-personas",
      name: "User Personas",
      description: "Detailed customer persona cards with motivations.",
      category: "Marketing"
    }
  ],
  "Product": [
    {
      id: "feature-specs",
      name: "Feature Specs",
      description: "Detailed feature specifications and user stories.",
      category: "Product"
    },
    {
      id: "mvp-roadmap",
      name: "MVP Roadmap",
      description: "90-day development plan with feature prioritization.",
      category: "Product"
    },
    {
      id: "product-requirements-doc",
      name: "Product Requirements Doc",
      description: "Complete PRD with technical specifications.",
      category: "Product"
    }
  ],
  "Business": [
    {
      id: "gtm-launch-calendar",
      name: "GTM Launch Calendar",
      description: "90-day launch timeline with team coordination.",
      category: "Business"
    },
    {
      id: "gtm-strategy",
      name: "GTM Strategy",
      description: "Go-to-market strategy and launch plan.",
      category: "Business"
    },
    {
      id: "kpi-dashboard",
      name: "KPI Dashboard",
      description: "Pre-built metrics tracker with formulas.",
      category: "Business"
    },
    {
      id: "pricing-strategy",
      name: "Pricing Strategy",
      description: "Strategic pricing framework and psychology.",
      category: "Business"
    }
  ],
  "Research": [
    {
      id: "competitive-analysis",
      name: "Competitive Analysis",
      description: "Deep dive into competitors and market gaps.",
      category: "Research"
    },
    {
      id: "customer-interview-guide",
      name: "Customer Interview Guide",
      description: "Structured interviews for validation and insights.",
      category: "Research"
    }
  ]
};

// Category icon mapping
const CATEGORY_ICONS = {
  "Popular": Star,
  "Marketing": Megaphone,
  "Product": Rocket,
  "Business": DollarSign,
  "Research": Search,
};

export default function BuildPrompt() {
  const { slug, builder } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("ad-creatives");
  const [showBuilderDialog, setShowBuilderDialog] = useState(false);
  const [showRoastDialog, setShowRoastDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showCollaborationPortal, setShowCollaborationPortal] = useState(false);
  const [selectedBuildPrompt, setSelectedBuildPrompt] = useState<string | null>(null);
  const [buildPrompts, setBuildPrompts] = useState<any>(null);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateInstruction, setUpdateInstruction] = useState("");

  // Campaign Angle 1: Problem-Focused
  const [angle1PrimaryText, setAngle1PrimaryText] = useState("");
  const [angle1Headline, setAngle1Headline] = useState("");
  const [angle1Description, setAngle1Description] = useState("");
  const [angle1CTA, setAngle1CTA] = useState("");
  const [angle1ImagePrompt, setAngle1ImagePrompt] = useState("");

  // Campaign Angle 2: Benefit-Focused
  const [angle2PrimaryText, setAngle2PrimaryText] = useState("");
  const [angle2Headline, setAngle2Headline] = useState("");
  const [angle2Description, setAngle2Description] = useState("");
  const [angle2CTA, setAngle2CTA] = useState("");
  const [angle2ImagePrompt, setAngle2ImagePrompt] = useState("");

  // Main prompt
  const [mainPrompt, setMainPrompt] = useState(`Create a comprehensive ad campaign package with multiple ad variations, targeting angles, and detailed creative briefs. This should provide everything needed to launch effective paid advertising across major platforms.`);

  const { data: idea, isLoading } = useQuery({
    queryKey: ["/api/ideas", slug],
    queryFn: async () => {
      const response = await fetch(`/api/ideas/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch idea');
      }
      return response.json();
    },
  });

  // Generate build prompts when Product Requirements Doc is selected
  const generateBuildPrompts = async () => {
    if (!idea) return;
    
    setIsGeneratingPrompts(true);
    try {
      const response = await fetch('/api/ai/generate-build-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ideaTitle: idea.title,
          ideaDescription: idea.description,
          type: idea.type,
          market: idea.market,
          targetAudience: idea.targetAudience,
          ideaId: idea.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate build prompts');
      }

      const prompts = await response.json();
      setBuildPrompts(prompts);
      toast({
        title: "Build prompts generated!",
        description: "Select a prompt type to view it.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate build prompts",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  // Auto-generate prompts when Product Requirements Doc is selected
  useEffect(() => {
    if (selectedTemplate === 'product-requirements-doc' && !buildPrompts && idea) {
      generateBuildPrompts();
    }
    // Reset selection when template changes
    if (selectedTemplate !== 'product-requirements-doc') {
      setSelectedBuildPrompt(null);
    }
  }, [selectedTemplate, idea]);

  const copyPromptToClipboard = async () => {
    try {
      const textToCopy = getPromptContent();
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Your prompt is ready to paste."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or manually copy the text.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateWithAI = () => {
    setIsUpdateDialogOpen(true);
  };

  const handleUpdatePrompt = () => {
    if (!updateInstruction.trim()) {
      toast({
        title: "Instruction required",
        description: "Please tell the AI how you'd like to modify your prompt.",
        variant: "destructive"
      });
      return;
    }

    // Placeholder for future AI functionality
    toast({
      title: "Coming soon",
      description: "AI update functionality will be available soon."
    });
    
    setIsUpdateDialogOpen(false);
    setUpdateInstruction("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Not Found</h1>
            <Button onClick={() => setLocation(`/idea/${slug}`)}>
              Back to Solution
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const allTemplates = Object.values(TEMPLATES_BY_CATEGORY).flat();
  const currentTemplate = allTemplates.find(t => t.id === selectedTemplate);

  // Build prompt options for Product Requirements Doc
  const buildPromptOptions = [
    { id: 'comprehensive', name: 'Comprehensive Build Prompt', description: 'Complete full-stack build prompt' },
    { id: 'backendFunctionality', name: 'Backend/API', description: 'Database schema, API endpoints, authentication' },
    { id: 'uiFrontend', name: 'UI/Frontend', description: 'Component library, design system, UI components' },
    { id: 'mathCalculations', name: 'Business Math/Logic', description: 'Business algorithms, calculations, analytics' },
    { id: 'landingPage', name: 'Landing Page', description: 'Hero, features, pricing, FAQ sections' },
    { id: 'adminFeatures', name: 'Admin Features', description: 'Dashboard, user management, analytics' },
  ];

  // Get current prompt content based on template and selection
  const getPromptContent = (): string => {
    // If Product Requirements Doc is selected and build prompts are available
    if (selectedTemplate === 'product-requirements-doc' && buildPrompts) {
      if (selectedBuildPrompt) {
        // Return the selected build prompt section
        if (selectedBuildPrompt === 'comprehensive') {
          return buildPrompts.comprehensive || buildPrompts.sections?.comprehensive || '';
        }
        if (selectedBuildPrompt && buildPrompts.sections) {
          return buildPrompts.sections[selectedBuildPrompt as keyof typeof buildPrompts.sections] || '';
        }
        return '';
      }
      // Return PRD placeholder if no section selected yet
      return `# Product Requirements Document

## Overview
${idea?.title || 'Your Solution'}

${idea?.description || 'Description of your solution'}

## Technical Specifications
[Select a build prompt type from the options below to generate detailed specifications]

## Features
[To be generated based on selected prompt type]`;
    }

    // Default ad creatives prompt (existing logic)
    return `## AD CREATIVE PACKAGE

### 1. FACEBOOK/INSTAGRAM ADS

**Campaign Angle 1: Problem-Focused**

- **Primary Text**: ${angle1PrimaryText || '[Hook that highlights the main pain point]'}
- **Headline**: ${angle1Headline || '[Benefit-driven headline]'}
- **Description**: ${angle1Description || '[Supporting detail about solution]'}
- **CTA Button**: ${angle1CTA || '[Action text - "Learn More", "Get Started", etc.]'}
- **Image Prompt**: "${angle1ImagePrompt || '[Detailed description for AI image generation showing the problem or frustration]'}"

**Campaign Angle 2: Benefit-Focused**

- **Primary Text**: ${angle2PrimaryText || '[Hook that emphasizes the transformation/outcome]'}
- **Headline**: ${angle2Headline || '[Result-oriented headline]'}
- **Description**: ${angle2Description || '[Specific benefit or value]'}
- **CTA Button**: ${angle2CTA || '[Action text]'}
- **Image Prompt**: "${angle2ImagePrompt || '[Detailed description showing success state or positive outcome]'}"`;
  };

  const promptContent = getPromptContent();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex h-[calc(100vh-64px)] justify-center">
        <div className="flex w-full max-w-[1600px] mx-auto px-8 gap-8 h-full">
          {/* Left Sidebar - Template Selection */}
          <div className="w-80 flex flex-col flex-shrink-0 h-full">
          <div className="h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="p-6 space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => setLocation(`/idea/${slug}`)}
                className="w-full justify-start -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Templates
              </Button>

              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">
                  {(builder === 'bolt' || builder === 'cursor') ? 'Business Builder' : 'Idea Builder'}
                </h1>
                <p className="text-sm text-muted-foreground mb-3">Choose a template to get started building</p>
                <a href="#" className="text-sm text-primary hover:underline flex items-center gap-1">
                  <ChevronRight className="w-4 h-4" />
                  Learn how templates work
                </a>
              </div>

              {/* Template Categories - Each in its own Card */}
              <Accordion type="multiple" defaultValue={["Popular"]} className="w-full space-y-3">
                {Object.entries(TEMPLATES_BY_CATEGORY).map(([category, templates]) => {
                  const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Wand2;
                  
                  return (
                    <AccordionItem 
                      key={category} 
                      value={category} 
                      className="border rounded-lg bg-card shadow-sm mb-3"
                    >
                      <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {category === "Popular" 
                            ? `High Value: (AdminGenerated List) (${templates.length})`
                            : `${category} (${templates.length})`}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 pt-0">
                        <div className="space-y-2">
                          {templates.map((template) => (
                            <div
                              key={template.id}
                              onClick={() => setSelectedTemplate(template.id)}
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                selectedTemplate === template.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-sm font-medium ${
                                      selectedTemplate === template.id ? 'text-primary-foreground' : ''
                                    }`}>
                                      {template.name}
                                    </span>
                                    {selectedTemplate === template.id && (
                                      <Badge variant="secondary" className="text-xs bg-primary-foreground/20 text-primary-foreground ml-auto">
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                  <p className={`text-xs ${
                                    selectedTemplate === template.id 
                                      ? 'text-primary-foreground/80' 
                                      : 'text-muted-foreground'
                                  }`}>
                                    {template.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>

              {/* Custom Prompt */}
              <Card className="border-dashed border-2 mt-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Wand2 className="w-4 h-4 text-muted-foreground" />
                    <span>Custom Prompt</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Create your own prompt</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto min-w-0">
            <div className="max-w-4xl mx-auto p-8">
            {currentTemplate && (
              <div className="space-y-8">
                {/* Template Tag and Idea Title */}
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-sm">
                    {currentTemplate?.name || 'Template'}
                  </Badge>
                  <h2 className="text-2xl font-semibold">{idea?.title || 'Renter documentation platform that prevents unfair deposit deductions'}</h2>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 items-center">
                  {isAuthenticated && idea?.id && (
                    <IdeaActionButtons ideaId={idea.id} />
                  )}
                  
                  <Separator orientation="vertical" className="h-8 mx-2" />
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBuilderDialog(true)}
                    data-testid="button-build-idea"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Build This Solution
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={() => setShowRoastDialog(true)}
                    className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950"
                    data-testid="button-roast-idea"
                  >
                    <Flame className="w-4 h-4 mr-2" />
                    Torpedo
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowExportDialog(true)}
                    data-testid="button-export-data"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  
                  <Separator orientation="vertical" className="h-8 mx-2" />
                  
                  <div className="flex gap-3">
                    {isAuthenticated && idea?.id && (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCollaborationPortal(true)}
                        data-testid="button-collaboration-portal"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Collaboration Portal
                      </Button>
                    )}
                    <ClaimButton 
                      ideaId={idea?.id || ''} 
                      ideaTitle={idea?.title || ''}
                    />
                  </div>
                </div>

                {/* Market Trend Graph */}
                {idea && (idea.keyword || idea.keywordData?.primaryKeyword?.term) && (
                  <MarketTrendGraph 
                    keyword={idea.keyword || idea.keywordData?.primaryKeyword?.term || idea.title.split(' ')[0]} 
                    ideaTitle={idea.title}
                  />
                )}

                {/* Build Prompt Selection for Product Requirements Doc */}
                {selectedTemplate === 'product-requirements-doc' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Build Prompt Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isGeneratingPrompts ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Generating build prompts...</p>
                          </div>
                        </div>
                      ) : buildPrompts ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {buildPromptOptions.map((option) => (
                            <Button
                              key={option.id}
                              variant={selectedBuildPrompt === option.id ? "default" : "outline"}
                              className="h-auto py-4 px-4 flex flex-col items-start text-left"
                              onClick={() => setSelectedBuildPrompt(option.id)}
                            >
                              <span className="font-semibold mb-1">{option.name}</span>
                              <span className="text-xs text-muted-foreground">{option.description}</span>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-4">
                            Click the button below to generate build prompts
                          </p>
                          <Button onClick={generateBuildPrompts} disabled={isGeneratingPrompts}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Build Prompts
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Prompt Display Section */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold">
                        {selectedTemplate === 'product-requirements-doc' && selectedBuildPrompt
                          ? `Your ${buildPromptOptions.find(o => o.id === selectedBuildPrompt)?.name || 'Build'} Prompt`
                          : `Your ${currentTemplate?.name || 'Template'} Prompt`}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyPromptToClipboard}
                        className="h-8 w-8"
                      >
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedTemplate === 'product-requirements-doc' && !selectedBuildPrompt && (
                      <p className="text-sm text-muted-foreground">
                        Select a build prompt type above to view the generated prompt.
                      </p>
                    )}
                    
                    {selectedTemplate === 'product-requirements-doc' && selectedBuildPrompt && selectedBuildPrompt !== null && selectedBuildPrompt !== 'comprehensive' && buildPrompts?.sections && !buildPrompts.sections[selectedBuildPrompt as keyof typeof buildPrompts.sections] && !buildPrompts?.comprehensive && (
                      <p className="text-sm text-muted-foreground">
                        Generating prompt...
                      </p>
                    )}
                    
                    <div className="bg-muted/50 rounded-lg p-6 border">
                      <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                        {getPromptContent() || 'No prompt content available. Please select a build prompt type.'}
                      </pre>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <a href="#" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <ChevronRight className="w-4 h-4" />
                        Instructions
                      </a>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleUpdateWithAI}
                        className="gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        Update with AI
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
             )}
            </div>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        ideaId={idea?.id || ''}
        ideaSlug={idea?.slug || ''}
        ideaTitle={idea?.title || ''}
      />

      {/* Roast Dialog */}
      {idea && (
        <RoastDialog
          open={showRoastDialog}
          onOpenChange={setShowRoastDialog}
          idea={{
            id: idea.id,
            title: idea.title,
            description: idea.description || '',
            market: idea.market,
            type: idea.type,
            targetAudience: idea.targetAudience,
          }}
        />
      )}

      {/* Builder Options Dialog */}
      <Dialog open={showBuilderDialog} onOpenChange={setShowBuilderDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Choose Your Build Method</DialogTitle>
            <DialogDescription>
              Select how you want to build this solution
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* No Code Option */}
            <Card 
              className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
              onClick={() => {
                setLocation(`/idea/${slug}/build/bolt`);
                setShowBuilderDialog(false);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">No Code</h3>
                    <p className="text-sm text-muted-foreground">
                      Build with visual tools like Lovable, v0, and ChatGPT
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>

            {/* CLI Option */}
            <Card 
              className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
              onClick={() => {
                setLocation(`/idea/${slug}/build/cursor`);
                setShowBuilderDialog(false);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Code className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">CLI</h3>
                    <p className="text-sm text-muted-foreground">
                      Build with Cursor IDE and command-line tools
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Prompt Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Update Prompt with AI</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Tell the AI how you'd like to modify your prompt:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={updateInstruction}
              onChange={(e) => setUpdateInstruction(e.target.value)}
              placeholder="e.g., 'Make it more technical', 'Focus on conversion', 'Add more context about pricing'..."
              className="min-h-[120px] text-base"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsUpdateDialogOpen(false);
                  setUpdateInstruction("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePrompt}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Update Prompt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Collaboration Portal */}
      {idea?.id && (
        <CollaborationPortal
          ideaId={idea.id}
          ideaTitle={idea.title}
          open={showCollaborationPortal}
          onOpenChange={setShowCollaborationPortal}
        />
      )}
    </div>
  );
}
