import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster as RadixToaster } from "@/components/ui/toaster";
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
        <RadixToaster />
        <SonnerToaster 
          position="top-right"
          theme="dark"
          expand={false}
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: 'sonner-glass',
              title: 'sonner-title',
              description: 'sonner-description',
              success: 'sonner-success',
              error: 'sonner-error',
              warning: 'sonner-warning',
              info: 'sonner-info',
              closeButton: 'sonner-close',
            },
          }}
        />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
