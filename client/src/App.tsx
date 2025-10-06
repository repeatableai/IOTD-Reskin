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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/database" component={Database} />
          <Route path="/idea/:slug" component={IdeaDetail} />
          <Route path="/top-ideas" component={TopIdeas} />
          <Route path="/features" component={Features} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/founder-fit" component={FounderFit} />
          <Route path="/ai-chat/:slug" component={AIChat} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/database" component={Database} />
          <Route path="/idea/:slug" component={IdeaDetail} />
          <Route path="/top-ideas" component={TopIdeas} />
          <Route path="/features" component={Features} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/create-idea" component={CreateIdea} />
          <Route path="/founder-fit" component={FounderFit} />
          <Route path="/ai-chat/:slug" component={AIChat} />
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
