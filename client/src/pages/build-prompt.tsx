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
import { ArrowLeft, Sparkles, Copy, CheckCircle2, Wand2, ChevronRight, Star, Megaphone, Rocket, DollarSign, Search, Code, Flame, Download, Users, Loader2, FileText } from "lucide-react";
import { MarketTrendGraph } from "@/components/MarketTrendGraph";
import { useCollaborationPortal } from "@/contexts/CollaborationPortalContext";

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
    },
    {
      id: "distribution-channels",
      name: "Non-Obvious and Obvious Distribution Channels",
      description: "Discover unconventional and standard channels to reach your market.",
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
  const { openPortal } = useCollaborationPortal();
  const [selectedBuildPrompt, setSelectedBuildPrompt] = useState<string | null>(null);
  const [buildPrompts, setBuildPrompts] = useState<any>(null);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [landingPagePrompt, setLandingPagePrompt] = useState<string | null>(null);
  const [isGeneratingLandingPage, setIsGeneratingLandingPage] = useState(false);
  const [brandPackagePrompt, setBrandPackagePrompt] = useState<string | null>(null);
  const [isGeneratingBrandPackage, setIsGeneratingBrandPackage] = useState(false);
  const [adCreativesPrompt, setAdCreativesPrompt] = useState<string | null>(null);
  const [isGeneratingAdCreatives, setIsGeneratingAdCreatives] = useState(false);
  const [contentCalendarPrompt, setContentCalendarPrompt] = useState<string | null>(null);
  const [isGeneratingContentCalendar, setIsGeneratingContentCalendar] = useState(false);
  const [emailFunnelPrompt, setEmailFunnelPrompt] = useState<string | null>(null);
  const [isGeneratingEmailFunnel, setIsGeneratingEmailFunnel] = useState(false);
  const [emailNurturePrompt, setEmailNurturePrompt] = useState<string | null>(null);
  const [isGeneratingEmailNurture, setIsGeneratingEmailNurture] = useState(false);
  const [leadMagnetPrompt, setLeadMagnetPrompt] = useState<string | null>(null);
  const [isGeneratingLeadMagnet, setIsGeneratingLeadMagnet] = useState(false);
  const [userPersonasPrompt, setUserPersonasPrompt] = useState<string | null>(null);
  const [isGeneratingUserPersonas, setIsGeneratingUserPersonas] = useState(false);
  const [salesFunnelPrompt, setSalesFunnelPrompt] = useState<string | null>(null);
  const [isGeneratingSalesFunnel, setIsGeneratingSalesFunnel] = useState(false);
  const [seoContentPrompt, setSeoContentPrompt] = useState<string | null>(null);
  const [isGeneratingSeoContent, setIsGeneratingSeoContent] = useState(false);
  const [tweetLandingPrompt, setTweetLandingPrompt] = useState<string | null>(null);
  const [isGeneratingTweetLanding, setIsGeneratingTweetLanding] = useState(false);
  const [featureSpecsPrompt, setFeatureSpecsPrompt] = useState<string | null>(null);
  const [isGeneratingFeatureSpecs, setIsGeneratingFeatureSpecs] = useState(false);
  const [mvpRoadmapPrompt, setMvpRoadmapPrompt] = useState<string | null>(null);
  const [isGeneratingMvpRoadmap, setIsGeneratingMvpRoadmap] = useState(false);
  const [gtmLaunchCalendarPrompt, setGtmLaunchCalendarPrompt] = useState<string | null>(null);
  const [isGeneratingGtmLaunchCalendar, setIsGeneratingGtmLaunchCalendar] = useState(false);
  const [gtmStrategyPrompt, setGtmStrategyPrompt] = useState<string | null>(null);
  const [isGeneratingGtmStrategy, setIsGeneratingGtmStrategy] = useState(false);
  const [kpiDashboardPrompt, setKpiDashboardPrompt] = useState<string | null>(null);
  const [isGeneratingKpiDashboard, setIsGeneratingKpiDashboard] = useState(false);
  const [pricingStrategyPrompt, setPricingStrategyPrompt] = useState<string | null>(null);
  const [isGeneratingPricingStrategy, setIsGeneratingPricingStrategy] = useState(false);
  const [competitiveAnalysisPrompt, setCompetitiveAnalysisPrompt] = useState<string | null>(null);
  const [isGeneratingCompetitiveAnalysis, setIsGeneratingCompetitiveAnalysis] = useState(false);
  const [customerInterviewGuidePrompt, setCustomerInterviewGuidePrompt] = useState<string | null>(null);
  const [isGeneratingCustomerInterviewGuide, setIsGeneratingCustomerInterviewGuide] = useState(false);
  const [distributionChannelsPrompt, setDistributionChannelsPrompt] = useState<string | null>(null);
  const [isGeneratingDistributionChannels, setIsGeneratingDistributionChannels] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateInstruction, setUpdateInstruction] = useState("");
  const [isGeneratingAppBuilderDoc, setIsGeneratingAppBuilderDoc] = useState(false);

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

  // Generate landing page prompt (force=true skips cache and regenerates)
  const generateLandingPagePrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingLandingPage(true);
    try {
      const response = await fetch('/api/ai/generate-landing-page-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate landing page prompt');
      }

      const data = await response.json();
      setLandingPagePrompt(data.prompt);
      toast({
        title: force ? "Landing page prompt regenerated!" : "Landing page prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate landing page prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLandingPage(false);
    }
  };

  // Auto-generate landing page prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'landing-page' && !landingPagePrompt && idea && !isGeneratingLandingPage) {
      generateLandingPagePrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate brand package prompt (force=true skips cache and regenerates)
  const generateBrandPackagePrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingBrandPackage(true);
    try {
      const response = await fetch('/api/ai/generate-brand-package-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate brand package prompt');
      }

      const data = await response.json();
      setBrandPackagePrompt(data.prompt);
      toast({
        title: force ? "Brand package prompt regenerated!" : "Brand package prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate brand package prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBrandPackage(false);
    }
  };

  // Auto-generate brand package prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'brand-package' && !brandPackagePrompt && idea && !isGeneratingBrandPackage) {
      generateBrandPackagePrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate ad creatives prompt (force=true skips cache and regenerates)
  const generateAdCreativesPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingAdCreatives(true);
    try {
      const response = await fetch('/api/ai/generate-ad-creatives-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ad creatives prompt');
      }

      const data = await response.json();
      setAdCreativesPrompt(data.prompt);
      toast({
        title: force ? "Ad creatives prompt regenerated!" : "Ad creatives prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate ad creatives prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAdCreatives(false);
    }
  };

  // Auto-generate ad creatives prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'ad-creatives' && !adCreativesPrompt && idea && !isGeneratingAdCreatives) {
      generateAdCreativesPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate content calendar prompt (force=true skips cache and regenerates)
  const generateContentCalendarPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingContentCalendar(true);
    try {
      const response = await fetch('/api/ai/generate-content-calendar-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content calendar prompt');
      }

      const data = await response.json();
      setContentCalendarPrompt(data.prompt);
      toast({
        title: force ? "Content calendar prompt regenerated!" : "Content calendar prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content calendar prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingContentCalendar(false);
    }
  };

  // Auto-generate content calendar prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'content-calendar' && !contentCalendarPrompt && idea && !isGeneratingContentCalendar) {
      generateContentCalendarPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate email funnel prompt (force=true skips cache and regenerates)
  const generateEmailFunnelPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingEmailFunnel(true);
    try {
      const response = await fetch('/api/ai/generate-email-funnel-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email funnel prompt');
      }

      const data = await response.json();
      setEmailFunnelPrompt(data.prompt);
      toast({
        title: force ? "Email funnel prompt regenerated!" : "Email funnel prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate email funnel prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingEmailFunnel(false);
    }
  };

  // Auto-generate email funnel prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'email-funnel-system' && !emailFunnelPrompt && idea && !isGeneratingEmailFunnel) {
      generateEmailFunnelPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate email nurture sequence prompt (force=true skips cache and regenerates)
  const generateEmailNurturePrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingEmailNurture(true);
    try {
      const response = await fetch('/api/ai/generate-email-nurture-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email nurture prompt');
      }

      const data = await response.json();
      setEmailNurturePrompt(data.prompt);
      toast({
        title: force ? "Email nurture prompt regenerated!" : "Email nurture prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate email nurture prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingEmailNurture(false);
    }
  };

  // Auto-generate email nurture prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'email-sequence' && !emailNurturePrompt && idea && !isGeneratingEmailNurture) {
      generateEmailNurturePrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate lead magnet prompt (force=true skips cache and regenerates)
  const generateLeadMagnetPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingLeadMagnet(true);
    try {
      const response = await fetch('/api/ai/generate-lead-magnet-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate lead magnet prompt');
      }

      const data = await response.json();
      setLeadMagnetPrompt(data.prompt);
      toast({
        title: force ? "Lead magnet prompt regenerated!" : "Lead magnet prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate lead magnet prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLeadMagnet(false);
    }
  };

  // Auto-generate lead magnet prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'lead-magnet' && !leadMagnetPrompt && idea && !isGeneratingLeadMagnet) {
      generateLeadMagnetPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate user personas prompt (force=true skips cache and regenerates)
  const generateUserPersonasPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingUserPersonas(true);
    try {
      const response = await fetch('/api/ai/generate-user-personas-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate user personas prompt');
      }

      const data = await response.json();
      setUserPersonasPrompt(data.prompt);
      toast({
        title: force ? "User personas prompt regenerated!" : "User personas prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate user personas prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingUserPersonas(false);
    }
  };

  // Auto-generate user personas prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'user-personas' && !userPersonasPrompt && idea && !isGeneratingUserPersonas) {
      generateUserPersonasPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate sales funnel prompt (force=true skips cache and regenerates)
  const generateSalesFunnelPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingSalesFunnel(true);
    try {
      const response = await fetch('/api/ai/generate-sales-funnel-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate sales funnel prompt');
      }

      const data = await response.json();
      setSalesFunnelPrompt(data.prompt);
      toast({
        title: force ? "Sales funnel prompt regenerated!" : "Sales funnel prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate sales funnel prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSalesFunnel(false);
    }
  };

  // Auto-generate sales funnel prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'sales-funnel' && !salesFunnelPrompt && idea && !isGeneratingSalesFunnel) {
      generateSalesFunnelPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate SEO content prompt (force=true skips cache and regenerates)
  const generateSeoContentPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingSeoContent(true);
    try {
      const response = await fetch('/api/ai/generate-seo-content-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SEO content prompt');
      }

      const data = await response.json();
      setSeoContentPrompt(data.prompt);
      toast({
        title: force ? "SEO content prompt regenerated!" : "SEO content prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate SEO content prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSeoContent(false);
    }
  };

  // Auto-generate SEO content prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'seo-content' && !seoContentPrompt && idea && !isGeneratingSeoContent) {
      generateSeoContentPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate tweet-sized landing page prompt (force=true skips cache and regenerates)
  const generateTweetLandingPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingTweetLanding(true);
    try {
      const response = await fetch('/api/ai/generate-tweet-landing-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tweet landing prompt');
      }

      const data = await response.json();
      setTweetLandingPrompt(data.prompt);
      toast({
        title: force ? "Tweet landing prompt regenerated!" : "Tweet landing prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate tweet landing prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTweetLanding(false);
    }
  };

  // Auto-generate tweet landing prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'tweet-sized-landing-page' && !tweetLandingPrompt && idea && !isGeneratingTweetLanding) {
      generateTweetLandingPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate feature specs prompt (force=true skips cache and regenerates)
  const generateFeatureSpecsPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingFeatureSpecs(true);
    try {
      const response = await fetch('/api/ai/generate-feature-specs-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate feature specs prompt');
      }

      const data = await response.json();
      setFeatureSpecsPrompt(data.prompt);
      toast({
        title: force ? "Feature specs prompt regenerated!" : "Feature specs prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate feature specs prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingFeatureSpecs(false);
    }
  };

  // Auto-generate feature specs prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'feature-specs' && !featureSpecsPrompt && idea && !isGeneratingFeatureSpecs) {
      generateFeatureSpecsPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate MVP roadmap prompt (force=true skips cache and regenerates)
  const generateMvpRoadmapPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingMvpRoadmap(true);
    try {
      const response = await fetch('/api/ai/generate-mvp-roadmap-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate MVP roadmap prompt');
      }

      const data = await response.json();
      setMvpRoadmapPrompt(data.prompt);
      toast({
        title: force ? "MVP roadmap prompt regenerated!" : "MVP roadmap prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate MVP roadmap prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMvpRoadmap(false);
    }
  };

  // Auto-generate MVP roadmap prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'mvp-roadmap' && !mvpRoadmapPrompt && idea && !isGeneratingMvpRoadmap) {
      generateMvpRoadmapPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate GTM strategy prompt (force=true skips cache and regenerates)
  const generateGtmStrategyPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingGtmStrategy(true);
    try {
      const response = await fetch('/api/ai/generate-gtm-strategy-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate GTM strategy prompt');
      }

      const data = await response.json();
      setGtmStrategyPrompt(data.prompt);
      toast({
        title: force ? "GTM strategy prompt regenerated!" : "GTM strategy prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate GTM strategy prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingGtmStrategy(false);
    }
  };

  // Auto-generate GTM strategy prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'gtm-strategy' && !gtmStrategyPrompt && idea && !isGeneratingGtmStrategy) {
      generateGtmStrategyPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate GTM launch calendar prompt (force=true skips cache and regenerates)
  const generateGtmLaunchCalendarPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingGtmLaunchCalendar(true);
    try {
      const response = await fetch('/api/ai/generate-gtm-launch-calendar-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate GTM launch calendar prompt');
      }

      const data = await response.json();
      setGtmLaunchCalendarPrompt(data.prompt);
      toast({
        title: force ? "GTM launch calendar prompt regenerated!" : "GTM launch calendar prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate GTM launch calendar prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingGtmLaunchCalendar(false);
    }
  };

  // Auto-generate GTM launch calendar prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'gtm-launch-calendar' && !gtmLaunchCalendarPrompt && idea && !isGeneratingGtmLaunchCalendar) {
      generateGtmLaunchCalendarPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate KPI dashboard prompt (force=true skips cache and regenerates)
  const generateKpiDashboardPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingKpiDashboard(true);
    try {
      const response = await fetch('/api/ai/generate-kpi-dashboard-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate KPI dashboard prompt');
      }

      const data = await response.json();
      setKpiDashboardPrompt(data.prompt);
      toast({
        title: force ? "KPI dashboard prompt regenerated!" : "KPI dashboard prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate KPI dashboard prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingKpiDashboard(false);
    }
  };

  // Auto-generate KPI dashboard prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'kpi-dashboard' && !kpiDashboardPrompt && idea && !isGeneratingKpiDashboard) {
      generateKpiDashboardPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate pricing strategy prompt (force=true skips cache and regenerates)
  const generatePricingStrategyPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingPricingStrategy(true);
    try {
      const response = await fetch('/api/ai/generate-pricing-strategy-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate pricing strategy prompt');
      }

      const data = await response.json();
      setPricingStrategyPrompt(data.prompt);
      toast({
        title: force ? "Pricing strategy prompt regenerated!" : "Pricing strategy prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate pricing strategy prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPricingStrategy(false);
    }
  };

  // Auto-generate pricing strategy prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'pricing-strategy' && !pricingStrategyPrompt && idea && !isGeneratingPricingStrategy) {
      generatePricingStrategyPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate competitive analysis prompt (force=true skips cache and regenerates)
  const generateCompetitiveAnalysisPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingCompetitiveAnalysis(true);
    try {
      const response = await fetch('/api/ai/generate-competitive-analysis-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate competitive analysis prompt');
      }

      const data = await response.json();
      setCompetitiveAnalysisPrompt(data.prompt);
      toast({
        title: force ? "Competitive analysis prompt regenerated!" : "Competitive analysis prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate competitive analysis prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCompetitiveAnalysis(false);
    }
  };

  // Auto-generate competitive analysis prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'competitive-analysis' && !competitiveAnalysisPrompt && idea && !isGeneratingCompetitiveAnalysis) {
      generateCompetitiveAnalysisPrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate customer interview guide prompt (force=true skips cache and regenerates)
  const generateCustomerInterviewGuidePrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingCustomerInterviewGuide(true);
    try {
      const response = await fetch('/api/ai/generate-customer-interview-guide-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate customer interview guide prompt');
      }

      const data = await response.json();
      setCustomerInterviewGuidePrompt(data.prompt);
      toast({
        title: force ? "Customer interview guide prompt regenerated!" : "Customer interview guide prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate customer interview guide prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCustomerInterviewGuide(false);
    }
  };

  // Auto-generate customer interview guide prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'customer-interview-guide' && !customerInterviewGuidePrompt && idea && !isGeneratingCustomerInterviewGuide) {
      generateCustomerInterviewGuidePrompt();
    }
  }, [selectedTemplate, idea]);

  // Generate distribution channels prompt (force=true skips cache and regenerates)
  const generateDistributionChannelsPrompt = async (force = false) => {
    if (!idea) return;

    setIsGeneratingDistributionChannels(true);
    try {
      const response = await fetch('/api/ai/generate-distribution-channels-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ideaId: idea.id, force }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate distribution channels prompt');
      }

      const data = await response.json();
      setDistributionChannelsPrompt(data.prompt);
      toast({
        title: force ? "Distribution channels prompt regenerated!" : "Distribution channels prompt generated!",
        description: "Your prompt is ready to copy.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate distribution channels prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingDistributionChannels(false);
    }
  };

  // Auto-generate distribution channels prompt when template is selected
  useEffect(() => {
    if (selectedTemplate === 'distribution-channels' && !distributionChannelsPrompt && idea && !isGeneratingDistributionChannels) {
      generateDistributionChannelsPrompt();
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
    // Landing Page template
    if (selectedTemplate === 'landing-page') {
      if (isGeneratingLandingPage) return '';
      if (landingPagePrompt) return landingPagePrompt;
      return 'Select this template to generate a landing page prompt tailored to this idea.';
    }

    // Brand Package template
    if (selectedTemplate === 'brand-package') {
      if (isGeneratingBrandPackage) return '';
      if (brandPackagePrompt) return brandPackagePrompt;
      return 'Select this template to generate a brand package prompt tailored to this idea.';
    }

    // Ad Creatives template
    if (selectedTemplate === 'ad-creatives') {
      if (isGeneratingAdCreatives) return '';
      if (adCreativesPrompt) return adCreativesPrompt;
      return 'Select this template to generate an ad creatives prompt tailored to this idea.';
    }

    // Content Calendar template
    if (selectedTemplate === 'content-calendar') {
      if (isGeneratingContentCalendar) return '';
      if (contentCalendarPrompt) return contentCalendarPrompt;
      return 'Select this template to generate a content calendar prompt tailored to this idea.';
    }

    // Email Funnel System template
    if (selectedTemplate === 'email-funnel-system') {
      if (isGeneratingEmailFunnel) return '';
      if (emailFunnelPrompt) return emailFunnelPrompt;
      return 'Select this template to generate an email funnel prompt tailored to this idea.';
    }

    // Email Nurture Sequence template
    if (selectedTemplate === 'email-sequence') {
      if (isGeneratingEmailNurture) return '';
      if (emailNurturePrompt) return emailNurturePrompt;
      return 'Select this template to generate an email nurture sequence prompt tailored to this idea.';
    }

    // Lead Magnet template
    if (selectedTemplate === 'lead-magnet') {
      if (isGeneratingLeadMagnet) return '';
      if (leadMagnetPrompt) return leadMagnetPrompt;
      return 'Select this template to generate a lead magnet blueprint prompt tailored to this idea.';
    }

    // User Personas template
    if (selectedTemplate === 'user-personas') {
      if (isGeneratingUserPersonas) return '';
      if (userPersonasPrompt) return userPersonasPrompt;
      return 'Select this template to generate a user personas system prompt tailored to this idea.';
    }

    // Sales Funnel template
    if (selectedTemplate === 'sales-funnel') {
      if (isGeneratingSalesFunnel) return '';
      if (salesFunnelPrompt) return salesFunnelPrompt;
      return 'Select this template to generate a sales funnel strategy prompt tailored to this idea.';
    }

    // SEO Content template
    if (selectedTemplate === 'seo-content') {
      if (isGeneratingSeoContent) return '';
      if (seoContentPrompt) return seoContentPrompt;
      return 'Select this template to generate an SEO content strategy prompt tailored to this idea.';
    }

    // Tweet-Sized Landing Page template
    if (selectedTemplate === 'tweet-sized-landing-page') {
      if (isGeneratingTweetLanding) return '';
      if (tweetLandingPrompt) return tweetLandingPrompt;
      return 'Select this template to generate a tweet-sized landing page prompt tailored to this idea.';
    }

    // MVP Roadmap template
    if (selectedTemplate === 'mvp-roadmap') {
      if (isGeneratingMvpRoadmap) return '';
      if (mvpRoadmapPrompt) return mvpRoadmapPrompt;
      return 'Select this template to generate an MVP roadmap prompt tailored to this idea.';
    }

    // Customer Interview Guide template
    if (selectedTemplate === 'customer-interview-guide') {
      if (isGeneratingCustomerInterviewGuide) return '';
      if (customerInterviewGuidePrompt) return customerInterviewGuidePrompt;
      return 'Select this template to generate a customer interview guide prompt tailored to this idea.';
    }

    // Distribution Channels template
    if (selectedTemplate === 'distribution-channels') {
      if (isGeneratingDistributionChannels) return '';
      if (distributionChannelsPrompt) return distributionChannelsPrompt;
      return 'Select this template to generate a distribution channels prompt tailored to this idea.';
    }

    // Competitive Analysis template
    if (selectedTemplate === 'competitive-analysis') {
      if (isGeneratingCompetitiveAnalysis) return '';
      if (competitiveAnalysisPrompt) return competitiveAnalysisPrompt;
      return 'Select this template to generate a competitive analysis prompt tailored to this idea.';
    }

    // Pricing Strategy template
    if (selectedTemplate === 'pricing-strategy') {
      if (isGeneratingPricingStrategy) return '';
      if (pricingStrategyPrompt) return pricingStrategyPrompt;
      return 'Select this template to generate a pricing strategy prompt tailored to this idea.';
    }

    // KPI Dashboard template
    if (selectedTemplate === 'kpi-dashboard') {
      if (isGeneratingKpiDashboard) return '';
      if (kpiDashboardPrompt) return kpiDashboardPrompt;
      return 'Select this template to generate a KPI dashboard prompt tailored to this idea.';
    }

    // GTM Strategy template
    if (selectedTemplate === 'gtm-strategy') {
      if (isGeneratingGtmStrategy) return '';
      if (gtmStrategyPrompt) return gtmStrategyPrompt;
      return 'Select this template to generate a GTM strategy prompt tailored to this idea.';
    }

    // GTM Launch Calendar template
    if (selectedTemplate === 'gtm-launch-calendar') {
      if (isGeneratingGtmLaunchCalendar) return '';
      if (gtmLaunchCalendarPrompt) return gtmLaunchCalendarPrompt;
      return 'Select this template to generate a GTM launch calendar prompt tailored to this idea.';
    }

    // Feature Specs template
    if (selectedTemplate === 'feature-specs') {
      if (isGeneratingFeatureSpecs) return '';
      if (featureSpecsPrompt) return featureSpecsPrompt;
      return 'Select this template to generate a feature specs prompt tailored to this idea.';
    }

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
            {/* Action Buttons - Always visible when idea exists */}
            {idea && (
              <div className="mb-8">
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
                    {idea?.id && (
                      <Button 
                        variant="outline" 
                        onClick={() => idea?.id && openPortal(idea.id, idea.title)}
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
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (isGeneratingAppBuilderDoc || !idea) return;

                        setIsGeneratingAppBuilderDoc(true);
                        toast({
                          title: "Generating App Builder Prompts",
                          description: "Gathering context and generating comprehensive prompts... This may take 2-3 minutes.",
                        });

                        try {
                          const response = await fetch('/api/ai/generate-app-builder-docx', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                            body: JSON.stringify({ slug: slug }),
                          });

                          if (!response.ok) {
                            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                            throw new Error(errorData.message || 'Failed to generate document');
                          }

                          // Download the file
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${idea.title.replace(/[^a-zA-Z0-9]/g, '-')}-app-builder-prompts.docx`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);

                          toast({
                            title: "Download Complete",
                            description: "Your App Builder Prompts document has been downloaded!",
                          });
                        } catch (error: any) {
                          console.error('Error generating app builder doc:', error);
                          toast({
                            title: "Error",
                            description: error.message || "Failed to generate App Builder Prompts. Please try again.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsGeneratingAppBuilderDoc(false);
                        }
                      }}
                      disabled={isGeneratingAppBuilderDoc}
                      data-testid="button-app-builder-prompts"
                    >
                      {isGeneratingAppBuilderDoc ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      {isGeneratingAppBuilderDoc ? "Generating..." : "App Builder Prompts"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentTemplate && (
              <div className="space-y-8">
                {/* Template Tag and Idea Title */}
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-sm">
                    {currentTemplate?.name || 'Template'}
                  </Badge>
                  <h2 className="text-2xl font-semibold">{idea?.title || 'Renter documentation platform that prevents unfair deposit deductions'}</h2>
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

                {/* Landing Page Loading State */}
                {selectedTemplate === 'landing-page' && isGeneratingLandingPage && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating landing page prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Analyzing idea data and building your custom prompt</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Brand Package Loading State */}
                {selectedTemplate === 'brand-package' && isGeneratingBrandPackage && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating brand package prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your complete brand identity prompt</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Ad Creatives Loading State */}
                {selectedTemplate === 'ad-creatives' && isGeneratingAdCreatives && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating ad creatives prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your multi-platform campaign brief</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Content Calendar Loading State */}
                {selectedTemplate === 'content-calendar' && isGeneratingContentCalendar && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating content calendar prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your 90-day editorial calendar</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Email Funnel System Loading State */}
                {selectedTemplate === 'email-funnel-system' && isGeneratingEmailFunnel && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating email funnel prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your lifecycle email automation system</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Email Nurture Sequence Loading State */}
                {selectedTemplate === 'email-sequence' && isGeneratingEmailNurture && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating email nurture sequence prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your 5-email conversion sequence</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lead Magnet Loading State */}
                {selectedTemplate === 'lead-magnet' && isGeneratingLeadMagnet && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating lead magnet prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your lead generation blueprint</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* User Personas Loading State */}
                {selectedTemplate === 'user-personas' && isGeneratingUserPersonas && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating user personas prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your customer psychology system</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Sales Funnel Loading State */}
                {selectedTemplate === 'sales-funnel' && isGeneratingSalesFunnel && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating sales funnel prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your conversion optimization strategy</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* SEO Content Loading State */}
                {selectedTemplate === 'seo-content' && isGeneratingSeoContent && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating SEO content prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your search-optimized content strategy</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tweet-Sized Landing Page Loading State */}
                {selectedTemplate === 'tweet-sized-landing-page' && isGeneratingTweetLanding && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating tweet-sized landing page prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Crafting your ultra-minimal conversion page</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* MVP Roadmap Loading State */}
                {selectedTemplate === 'mvp-roadmap' && isGeneratingMvpRoadmap && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating MVP roadmap prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your 90-day development blueprint</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Customer Interview Guide Loading State */}
                {selectedTemplate === 'customer-interview-guide' && isGeneratingCustomerInterviewGuide && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating customer interview guide prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your user research playbook</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Distribution Channels Loading State */}
                {selectedTemplate === 'distribution-channels' && isGeneratingDistributionChannels && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating distribution channels prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Discovering obvious and non-obvious channels</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Competitive Analysis Loading State */}
                {selectedTemplate === 'competitive-analysis' && isGeneratingCompetitiveAnalysis && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating competitive analysis prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Mapping your competitive landscape</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pricing Strategy Loading State */}
                {selectedTemplate === 'pricing-strategy' && isGeneratingPricingStrategy && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating pricing strategy prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your revenue optimization framework</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* KPI Dashboard Loading State */}
                {selectedTemplate === 'kpi-dashboard' && isGeneratingKpiDashboard && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating KPI dashboard prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your metrics tracking system</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* GTM Strategy Loading State */}
                {selectedTemplate === 'gtm-strategy' && isGeneratingGtmStrategy && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating GTM strategy prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your go-to-market strategy</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* GTM Launch Calendar Loading State */}
                {selectedTemplate === 'gtm-launch-calendar' && isGeneratingGtmLaunchCalendar && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating GTM launch calendar prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your 90-day go-to-market plan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Feature Specs Loading State */}
                {selectedTemplate === 'feature-specs' && isGeneratingFeatureSpecs && (
                  <Card>
                    <CardContent className="py-8">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Generating feature specs prompt...</p>
                          <p className="text-xs text-muted-foreground mt-1">Building your developer-ready specification</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Prompt Display Section - hide when a dynamic template is generating */}
                {!(
                  (selectedTemplate === 'landing-page' && isGeneratingLandingPage) ||
                  (selectedTemplate === 'brand-package' && isGeneratingBrandPackage) ||
                  (selectedTemplate === 'ad-creatives' && isGeneratingAdCreatives) ||
                  (selectedTemplate === 'content-calendar' && isGeneratingContentCalendar) ||
                  (selectedTemplate === 'email-funnel-system' && isGeneratingEmailFunnel) ||
                  (selectedTemplate === 'feature-specs' && isGeneratingFeatureSpecs) ||
                  (selectedTemplate === 'mvp-roadmap' && isGeneratingMvpRoadmap) ||
                  (selectedTemplate === 'customer-interview-guide' && isGeneratingCustomerInterviewGuide) ||
                  (selectedTemplate === 'distribution-channels' && isGeneratingDistributionChannels) ||
                  (selectedTemplate === 'competitive-analysis' && isGeneratingCompetitiveAnalysis) ||
                  (selectedTemplate === 'pricing-strategy' && isGeneratingPricingStrategy) ||
                  (selectedTemplate === 'kpi-dashboard' && isGeneratingKpiDashboard) ||
                  (selectedTemplate === 'gtm-strategy' && isGeneratingGtmStrategy) ||
                  (selectedTemplate === 'gtm-launch-calendar' && isGeneratingGtmLaunchCalendar)
                ) && (
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold">
                        {selectedTemplate === 'product-requirements-doc' && selectedBuildPrompt
                          ? `Your ${buildPromptOptions.find(o => o.id === selectedBuildPrompt)?.name || 'Build'} Prompt`
                          : `Your ${currentTemplate?.name || 'Template'} Prompt`}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        {selectedTemplate === 'landing-page' && landingPagePrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateLandingPagePrompt(true)}
                            disabled={isGeneratingLandingPage}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'brand-package' && brandPackagePrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateBrandPackagePrompt(true)}
                            disabled={isGeneratingBrandPackage}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'ad-creatives' && adCreativesPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateAdCreativesPrompt(true)}
                            disabled={isGeneratingAdCreatives}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'content-calendar' && contentCalendarPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateContentCalendarPrompt(true)}
                            disabled={isGeneratingContentCalendar}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'email-funnel-system' && emailFunnelPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateEmailFunnelPrompt(true)}
                            disabled={isGeneratingEmailFunnel}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'email-sequence' && emailNurturePrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateEmailNurturePrompt(true)}
                            disabled={isGeneratingEmailNurture}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'lead-magnet' && leadMagnetPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateLeadMagnetPrompt(true)}
                            disabled={isGeneratingLeadMagnet}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'user-personas' && userPersonasPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateUserPersonasPrompt(true)}
                            disabled={isGeneratingUserPersonas}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'sales-funnel' && salesFunnelPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateSalesFunnelPrompt(true)}
                            disabled={isGeneratingSalesFunnel}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'seo-content' && seoContentPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateSeoContentPrompt(true)}
                            disabled={isGeneratingSeoContent}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'tweet-sized-landing-page' && tweetLandingPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateTweetLandingPrompt(true)}
                            disabled={isGeneratingTweetLanding}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'customer-interview-guide' && customerInterviewGuidePrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateCustomerInterviewGuidePrompt(true)}
                            disabled={isGeneratingCustomerInterviewGuide}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'distribution-channels' && distributionChannelsPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateDistributionChannelsPrompt(true)}
                            disabled={isGeneratingDistributionChannels}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'competitive-analysis' && competitiveAnalysisPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateCompetitiveAnalysisPrompt(true)}
                            disabled={isGeneratingCompetitiveAnalysis}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'pricing-strategy' && pricingStrategyPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generatePricingStrategyPrompt(true)}
                            disabled={isGeneratingPricingStrategy}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'kpi-dashboard' && kpiDashboardPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateKpiDashboardPrompt(true)}
                            disabled={isGeneratingKpiDashboard}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'gtm-strategy' && gtmStrategyPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateGtmStrategyPrompt(true)}
                            disabled={isGeneratingGtmStrategy}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'gtm-launch-calendar' && gtmLaunchCalendarPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateGtmLaunchCalendarPrompt(true)}
                            disabled={isGeneratingGtmLaunchCalendar}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'feature-specs' && featureSpecsPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateFeatureSpecsPrompt(true)}
                            disabled={isGeneratingFeatureSpecs}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
                        {selectedTemplate === 'mvp-roadmap' && mvpRoadmapPrompt && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateMvpRoadmapPrompt(true)}
                            disabled={isGeneratingMvpRoadmap}
                            className="h-8 text-xs gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Regenerate
                          </Button>
                        )}
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
                )}
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
    </div>
  );
}
