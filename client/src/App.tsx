import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Database from "@/pages/database";
import IdeaDetail from "@/pages/idea-detail";
import TopIdeas from "@/pages/top-ideas";
import Features from "@/pages/features";
import Pricing from "@/pages/pricing";
import CreateIdea from "@/pages/create-idea";
import FounderFit from "@/pages/founder-fit";
import AIChat from "@/pages/ai-chat";
import AIChatLanding from "@/pages/ai-chat-landing";
import Trends from "@/pages/trends";
import MarketInsights from "@/pages/market-insights";
import Research from "@/pages/research";
import IdeaBuilder from "@/pages/idea-builder";
import Tour from "@/pages/tour";
import ToolsLibrary from "@/pages/tools-library";
import WhatsNew from "@/pages/whats-new";
import About from "@/pages/about";
import FAQ from "@/pages/faq";
import Contact from "@/pages/contact";
import PlanDetails from "@/pages/plan-details";
import IdeaOfTheDay from "@/pages/idea-of-the-day";
import ValueEquation from "@/pages/value-equation";
import BuildPrompt from "@/pages/build-prompt";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={TopIdeas} />
      <Route path="/database" component={Database} />
      <Route path="/idea-of-the-day" component={IdeaOfTheDay} />
      <Route path="/idea/:slug/value-equation" component={ValueEquation} />
      <Route path="/idea/:slug/build/:builder" component={BuildPrompt} />
      <Route path="/idea/:slug" component={IdeaDetail} />
      <Route path="/top-ideas" component={TopIdeas} />
      <Route path="/trends" component={Trends} />
      <Route path="/market-insights" component={MarketInsights} />
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
      {isAuthenticated && (
        <>
          <Route path="/home" component={Home} />
          <Route path="/create-idea" component={CreateIdea} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
