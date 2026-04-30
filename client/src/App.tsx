import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

import NotFound from "@/pages/not-found";
import Welcome from "@/pages/home";
import AppShell from "@/pages/explore";
import AuthPage from "@/pages/auth";
import AdminStudio from "@/pages/admin";
import Profile from "@/pages/profile";
import PrivacyPolicy from "@/pages/privacy-policy";
import Terms from "@/pages/terms";
import Blueprint from "@/pages/blueprint";
import FeaturesPage from "@/pages/features";
import Archive from "@/pages/archive";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function HomeGate() {
  const { user, isLoading, isAuthenticated } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white/60">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated || !user) return <Redirect to="/welcome" />;
  return <AppShell />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeGate} />
      <Route path="/welcome">{() => <Welcome />}</Route>
      <Route path="/explore">{() => <Redirect to="/" />}</Route>
      <Route path="/movies">{() => <Redirect to="/" />}</Route>
      <Route path="/features" component={FeaturesPage} />
      <Route path="/archive" component={Archive} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin" component={AdminStudio} />
      <Route path="/profile" component={Profile} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms" component={Terms} />
      <Route path="/blueprint" component={Blueprint} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <PwaInstallPrompt />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
