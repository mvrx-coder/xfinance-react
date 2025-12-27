/**
 * AuthContext - Contexto de Autenticação do xFinance
 * 
 * Gerencia estado global de autenticação.
 * 
 * Padrão: Context + Provider + Hook
 * - Estado centralizado do usuário
 * - Verificação de token no startup
 * - Login/Logout com sincronização localStorage
 * 
 * @example
 * // No App.tsx
 * <AuthProvider>
 *   <Router />
 * </AuthProvider>
 * 
 * // Em qualquer componente
 * const { user, isLoading, login, logout } = useAuth();
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  type LoginRequest,
  type UserData,
} from "@/services/api/auth";

// =============================================================================
// TIPOS
// =============================================================================

export interface AuthState {
  /** Usuário atual ou null se não autenticado */
  user: UserData | null;
  /** True durante verificação inicial ou operações de auth */
  isLoading: boolean;
  /** True se usuário está autenticado */
  isAuthenticated: boolean;
  /** Erro da última operação de auth */
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  /** 
   * Realiza login com email e senha.
   * @returns true se sucesso, false se falha
   */
  login: (credentials: LoginRequest) => Promise<boolean>;
  /** Realiza logout e limpa estado */
  logout: () => Promise<void>;
  /** Limpa erro atual */
  clearError: () => void;
  /** Papel do usuário (shortcut) */
  papel: string | null;
  /** Verifica se usuário é admin */
  isAdmin: boolean;
  /** Verifica se usuário é BackOffice ou admin */
  isBackofficeOrAdmin: boolean;
}

// =============================================================================
// CONTEXTO
// =============================================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// Chave do localStorage
const STORAGE_KEY = "xfinance_user";

// =============================================================================
// PROVIDER
// =============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Verificação inicial do token
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      try {
        // 1. Carregar cache do localStorage para UI imediata
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached && isMounted) {
          try {
            const cachedUser = JSON.parse(cached) as UserData;
            setUser(cachedUser);
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }

        // 2. Validar com o backend (cookie httponly)
        const backendUser = await getCurrentUser();
        
        if (!isMounted) return;

        if (backendUser) {
          // Token válido - atualizar estado e cache
          setUser(backendUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(backendUser));
        } else {
          // Token inválido/expirado - limpar tudo
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------
  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiLogin(credentials);

      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
        return true;
      }

      setError("Credenciais inválidas");
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao fazer login";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await apiLogout();
    } catch {
      // Ignorar erro - limpar estado local de qualquer forma
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      setIsLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ---------------------------------------------------------------------------
  // Valores derivados
  // ---------------------------------------------------------------------------
  const isAuthenticated = user !== null;
  const papel = user?.papel ?? null;
  const isAdmin = papel === "admin";
  const isBackofficeOrAdmin = papel === "admin" || papel === "BackOffice";

  // ---------------------------------------------------------------------------
  // Valor do contexto (memoizado)
  // ---------------------------------------------------------------------------
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      error,
      login,
      logout,
      clearError,
      papel,
      isAdmin,
      isBackofficeOrAdmin,
    }),
    [user, isLoading, isAuthenticated, error, login, logout, clearError, papel, isAdmin, isBackofficeOrAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook para acessar o contexto de autenticação.
 * 
 * @throws Error se usado fora do AuthProvider
 * 
 * @example
 * function MyComponent() {
 *   const { user, isLoading, login, logout } = useAuth();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (!user) return <Navigate to="/login" />;
 *   
 *   return <div>Olá, {user.nome}!</div>;
 * }
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  
  return context;
}

// =============================================================================
// EXPORTS
// =============================================================================

export { AuthContext };
export type { UserData };

