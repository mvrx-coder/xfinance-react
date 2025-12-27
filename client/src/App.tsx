/**
 * App Principal - xFinance
 * 
 * Estrutura:
 * - AuthProvider: Contexto de autenticação global
 * - QueryClientProvider: Cache e fetching
 * - TooltipProvider: Tooltips
 * - Toasters: Sistema de notificações
 * - Router: Rotas com ProtectedRoute
 */

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Rota protegida - Dashboard */}
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Rota pública - Login */}
      <Route path="/login" component={Login} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
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
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
