import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { CollaborationPortalProvider } from "@/contexts/CollaborationPortalContext";
import { CollaborationPortalWidget } from "@/components/CollaborationPortalWidget";

// Eagerly loaded pages (critical path)
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";

// Lazy loaded pages (code splitting)
const Landing = lazy(() => import("@/pages/landing"));
const Home = lazy(() => import("@/pages/home"));
const Database = lazy(() => import("@/pages/database"));
const IdeaDetail = lazy(() => import("@/pages/idea-detail"));
const Features = lazy(() => import("@/pages/features"));
const Pricing = lazy(() => import("@/pages/pricing"));
const CreateIdea = lazy(() => import("@/pages/create-idea"));
const FounderFit = lazy(() => import("@/pages/founder-fit"));
const AIChat = lazy(() => import("@/pages/ai-chat"));
const AIChatLanding = lazy(() => import("@/pages/ai-chat-landing"));
const Trends = lazy(() => import("@/pages/trends"));
const MarketInsights = lazy(() => import("@/pages/market-insights"));
const Research = lazy(() => import("@/pages/research"));
const IdeaBuilder = lazy(() => import("@/pages/idea-builder"));
const Tour = lazy(() => import("@/pages/tour"));
const ToolsLibrary = lazy(() => import("@/pages/tools-library"));
const WhatsNew = lazy(() => import("@/pages/whats-new"));
const About = lazy(() => import("@/pages/about"));
const FAQ = lazy(() => import("@/pages/faq"));
const Contact = lazy(() => import("@/pages/contact"));
const PlanDetails = lazy(() => import("@/pages/plan-details"));
const ValueEquation = lazy(() => import("@/pages/value-equation"));
const BuildPrompt = lazy(() => import("@/pages/build-prompt"));
const WhyNow = lazy(() => import("@/pages/why-now"));
const ProofSignals = lazy(() => import("@/pages/proof-signals"));
const MarketGap = lazy(() => import("@/pages/market-gap"));
const ExecutionPlan = lazy(() => import("@/pages/execution-plan"));
const IdeaAgent = lazy(() => import("@/pages/idea-agent"));
const IdeaGenerator = lazy(() => import("@/pages/idea-generator"));
const ACPFramework = lazy(() => import("@/pages/acp-framework"));
const ValueMatrix = lazy(() => import("@/pages/value-matrix"));
const ValueLadder = lazy(() => import("@/pages/value-ladder"));
const Keywords = lazy(() => import("@/pages/keywords"));
const FounderFitIdea = lazy(() => import("@/pages/founder-fit-idea"));
const CommunitySignalsDetail = lazy(() => import("@/pages/community-signals-detail"));
const ScoreAnalysis = lazy(() => import("@/pages/score-analysis"));
const MarketInsightDetail = lazy(() => import("@/pages/market-insight-detail"));
const TrendDetail = lazy(() => import("@/pages/trend-detail"));
const MyIdeas = lazy(() => import("@/pages/my-ideas"));
const BulkImport = lazy(() => import("@/pages/bulk-import"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Settings = lazy(() => import("@/pages/settings"));

// Module 3 - Venture OS
const Module3Landing = lazy(() => import("@/pages/module3/Module3Landing"));
const Sub3C_Revaluation = lazy(() => import("@/pages/module3/Sub3C_Revaluation"));
const Sub3A_BusinessPlan = lazy(() => import("@/pages/module3/Sub3A_BusinessPlan"));
const Sub3B_Transformation = lazy(() => import("@/pages/module3/Sub3B_Transformation"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" component={Landing} />
        <Route path="/database" component={Database} />
        <Route path="/my-ideas" component={MyIdeas} />
        <Route path="/idea-agent" component={IdeaAgent} />
        <Route path="/idea-generator" component={IdeaGenerator} />
        <Route path="/idea/:slug/value-equation" component={ValueEquation} />
        <Route path="/idea/:slug/why-now" component={WhyNow} />
        <Route path="/idea/:slug/proof-signals" component={ProofSignals} />
        <Route path="/idea/:slug/market-gap" component={MarketGap} />
        <Route path="/idea/:slug/execution-plan" component={ExecutionPlan} />
        <Route path="/idea/:slug/acp-framework" component={ACPFramework} />
        <Route path="/idea/:slug/value-matrix" component={ValueMatrix} />
        <Route path="/idea/:slug/value-ladder" component={ValueLadder} />
        <Route path="/idea/:slug/keywords" component={Keywords} />
        <Route path="/idea/:slug/founder-fit" component={FounderFitIdea} />
        <Route path="/idea/:slug/community-signals" component={CommunitySignalsDetail} />
        <Route path="/idea/:slug/build/:builder" component={BuildPrompt} />
        {/* Score Analysis Pages */}
        <Route path="/idea/:slug/opportunity-analysis" component={ScoreAnalysis} />
        <Route path="/idea/:slug/problem-analysis" component={ScoreAnalysis} />
        <Route path="/idea/:slug/feasibility-analysis" component={ScoreAnalysis} />
        <Route path="/idea/:slug/timing-analysis" component={ScoreAnalysis} />
        <Route path="/idea/:slug/execution-analysis" component={ScoreAnalysis} />
        <Route path="/idea/:slug/gtm-strategy" component={ScoreAnalysis} />
        <Route path="/idea/:slug/revenue-analysis" component={ScoreAnalysis} />
        <Route path="/idea/:slug/founder-fit-analysis" component={ScoreAnalysis} />
        <Route path="/idea/:slug/:scoreType-analysis" component={ScoreAnalysis} />
        <Route path="/idea/:slug" component={IdeaDetail} />
        <Route path="/trends" component={Trends} />
        <Route path="/trend/:id" component={TrendDetail} />
        <Route path="/market-insights" component={MarketInsights} />
        <Route path="/market-insight/:slug" component={MarketInsightDetail} />
        <Route path="/research" component={Research} />
        <Route path="/idea-builder" component={IdeaBuilder} />
        <Route path="/features" component={Features} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/founder-fit" component={FounderFit} />
        <Route path="/ai-chat/:slug" component={AIChat} />
        <Route path="/ai-chat" component={AIChatLanding} />
        <Route path="/tour" component={Tour} />
        <Route path="/tools-library" component={ToolsLibrary} />
        <Route path="/tools" component={ToolsLibrary} />
        <Route path="/whats-new" component={WhatsNew} />
        <Route path="/about" component={About} />
        <Route path="/faq" component={FAQ} />
        <Route path="/contact" component={Contact} />
        <Route path="/plan-details" component={PlanDetails} />
        {/* Module 3 - Venture OS Routes */}
        <Route path="/venture-os" component={Module3Landing} />
        <Route path="/venture-os/revaluation" component={Sub3C_Revaluation} />
        <Route path="/venture-os/business-plan" component={Sub3A_BusinessPlan} />
        <Route path="/venture-os/transformation" component={Sub3B_Transformation} />
        {isAuthenticated && (
          <>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/settings" component={Settings} />
            <Route path="/home" component={Home} />
            <Route path="/create-idea" component={CreateIdea} />
            <Route path="/bulk-import" component={BulkImport} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CollaborationPortalProvider>
          <Toaster />
          <Router />
          <CollaborationPortalWidget />
        </CollaborationPortalProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
