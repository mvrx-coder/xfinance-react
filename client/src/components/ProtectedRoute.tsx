/**
 * ProtectedRoute - Componente de Proteção de Rotas
 * 
 * Verifica autenticação e redireciona para login se necessário.
 * Exibe loading durante verificação inicial.
 * 
 * @example
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * // Com papel específico
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 */

import { type ReactNode } from "react";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// =============================================================================
// TIPOS
// =============================================================================

interface ProtectedRouteProps {
  children: ReactNode;
  /** Papel requerido para acessar a rota (opcional) */
  requiredRole?: "admin" | "BackOffice" | "Inspetor";
  /** URL de redirecionamento se não autenticado */
  redirectTo?: string;
}

// =============================================================================
// COMPONENTE DE LOADING
// =============================================================================

function AuthLoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-depth-gradient">
      <div className="flex flex-col items-center gap-4">
        {/* Logo */}
        <img 
          src="/logo.png" 
          alt="xFinance" 
          className="h-16 w-auto opacity-80"
        />
        
        {/* Spinner */}
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        
        {/* Texto */}
        <p className="text-sm text-muted-foreground">
          Verificando autenticação...
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENTE DE ACESSO NEGADO
// =============================================================================

interface AccessDeniedProps {
  requiredRole: string;
  userRole: string | null;
}

function AccessDeniedScreen({ requiredRole, userRole }: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-depth-gradient">
      <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
        {/* Ícone */}
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-destructive"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        {/* Título */}
        <h1 className="text-xl font-semibold text-foreground">
          Acesso Negado
        </h1>
        
        {/* Descrição */}
        <p className="text-sm text-muted-foreground">
          Você não tem permissão para acessar esta página.
          <br />
          <span className="text-xs">
            Papel requerido: <strong>{requiredRole}</strong>
            {userRole && (
              <> | Seu papel: <strong>{userRole}</strong></>
            )}
          </span>
        </p>
        
        {/* Botão voltar */}
        <a
          href="/"
          className="mt-4 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
        >
          Voltar ao Dashboard
        </a>
      </div>
    </div>
  );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, papel } = useAuth();

  // Loading: exibe tela de carregamento
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // Não autenticado: redireciona para login
  if (!isAuthenticated) {
    return <Redirect to={redirectTo} />;
  }

  // Verifica papel específico (se requerido)
  if (requiredRole) {
    const hasRequiredRole = 
      requiredRole === "admin" 
        ? papel === "admin"
        : requiredRole === "BackOffice"
          ? papel === "admin" || papel === "BackOffice"
          : papel === requiredRole;

    if (!hasRequiredRole) {
      return <AccessDeniedScreen requiredRole={requiredRole} userRole={papel} />;
    }
  }

  // Autorizado: renderiza conteúdo
  return <>{children}</>;
}

export default ProtectedRoute;

