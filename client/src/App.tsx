import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/login" component={Login} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Radix Toaster - mantido para ActionCenter */}
        <Toaster />
        {/* Sonner Toaster - novo sistema premium */}
        <SonnerToaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            className: "sonner-toast",
          }}
        />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
