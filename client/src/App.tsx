import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import PlanSelection from "@/pages/PlanSelection";
import Upgrade from "@/pages/Upgrade";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, needsPlanSelection } = useAuth();

  const handlePlanSelection = (plan: 'free' | 'premium') => {
    localStorage.setItem('selectedPlan', plan);
    window.location.reload(); // Refresh to update auth state
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show plan selection if needed
  if (needsPlanSelection) {
    return <PlanSelection onPlanSelected={handlePlanSelection} />;
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          {/* Always use desktop version - force Home component */}
          <Route path="/" component={Home} />
          <Route path="/upgrade" component={Upgrade} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
