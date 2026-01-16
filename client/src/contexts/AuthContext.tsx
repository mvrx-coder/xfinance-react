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
  checkEmail as apiCheckEmail,
  setFirstPassword as apiSetFirstPassword,
  LoginStatus,
  type LoginRequest,
  type UserData,
  type SetPasswordRequest,
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
  /** True se é primeiro acesso (senha não definida) */
  isFirstAccess: boolean;
  /** Email sendo usado para primeiro acesso */
  firstAccessEmail: string | null;
}

export interface AuthContextValue extends AuthState {
  /** 
   * Realiza login com email e senha.
   * @returns true se sucesso, false se falha, "first_access" se primeiro acesso
   */
  login: (credentials: LoginRequest) => Promise<boolean | "first_access">;
  /** Realiza logout e limpa estado */
  logout: () => Promise<void>;
  /** Limpa erro atual */
  clearError: () => void;
  /**
   * Verifica status do email (detecta primeiro acesso).
   * @returns "ok" | "first_access" | string (mensagem de erro)
   */
  checkEmail: (email: string) => Promise<"ok" | "first_access" | string>;
  /**
   * Define senha no primeiro acesso.
   * @returns true se sucesso
   */
  setFirstPassword: (password: string, confirmPassword: string) => Promise<boolean>;
  /** Cancela fluxo de primeiro acesso */
  cancelFirstAccess: () => void;
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
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [firstAccessEmail, setFirstAccessEmail] = useState<string | null>(null);

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
  // Check Email (detecta primeiro acesso)
  // ---------------------------------------------------------------------------
  const checkEmail = useCallback(async (email: string): Promise<"ok" | "first_access" | string> => {
    setError(null);

    try {
      const response = await apiCheckEmail(email);
      
      if (response.requires_password_setup) {
        setIsFirstAccess(true);
        setFirstAccessEmail(email);
        return "first_access";
      }
      
      if (response.status === LoginStatus.EMAIL_NOT_FOUND) {
        return response.message || "Email não cadastrado no sistema";
      }
      
      if (response.status === LoginStatus.USER_INACTIVE) {
        return response.message || "Usuário desativado";
      }
      
      if (response.status === LoginStatus.USER_LOCKED) {
        return response.message || "Usuário bloqueado";
      }
      
      return "ok";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao verificar email";
      return message;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Login
  // ---------------------------------------------------------------------------
  const login = useCallback(async (credentials: LoginRequest): Promise<boolean | "first_access"> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiLogin(credentials);

      // Detectar primeiro acesso
      if (response.status === LoginStatus.MISSING_PASSWORD) {
        setIsFirstAccess(true);
        setFirstAccessEmail(credentials.email);
        setError(response.message || "Primeiro acesso detectado. Defina sua senha.");
        return "first_access";
      }

      if (response.success && response.user) {
        setUser(response.user);
        setIsFirstAccess(false);
        setFirstAccessEmail(null);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
        return true;
      }

      setError(response.message || "Credenciais inválidas");
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
  // Set First Password
  // ---------------------------------------------------------------------------
  const setFirstPassword = useCallback(async (password: string, confirmPassword: string): Promise<boolean> => {
    if (!firstAccessEmail) {
      setError("Email não informado. Tente novamente.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiSetFirstPassword({
        email: firstAccessEmail,
        password,
        confirm_password: confirmPassword,
      });

      if (response.success && response.user) {
        setUser(response.user);
        setIsFirstAccess(false);
        setFirstAccessEmail(null);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
        return true;
      }

      setError(response.message || "Erro ao definir senha");
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao definir senha";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [firstAccessEmail]);

  // ---------------------------------------------------------------------------
  // Cancel First Access
  // ---------------------------------------------------------------------------
  const cancelFirstAccess = useCallback(() => {
    setIsFirstAccess(false);
    setFirstAccessEmail(null);
    setError(null);
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
      isFirstAccess,
      firstAccessEmail,
      login,
      logout,
      clearError,
      checkEmail,
      setFirstPassword,
      cancelFirstAccess,
      papel,
      isAdmin,
      isBackofficeOrAdmin,
    }),
    [user, isLoading, isAuthenticated, error, isFirstAccess, firstAccessEmail, login, logout, clearError, checkEmail, setFirstPassword, cancelFirstAccess, papel, isAdmin, isBackofficeOrAdmin]
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

