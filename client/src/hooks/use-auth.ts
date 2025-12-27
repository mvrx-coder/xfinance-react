/**
 * Hook de Autenticação - xFinance
 * 
 * Re-exporta useAuth do AuthContext para manter padrão de hooks.
 * 
 * @example
 * import { useAuth } from "@/hooks";
 * 
 * function MyComponent() {
 *   const { user, isLoading, login, logout, papel, isAdmin } = useAuth();
 *   // ...
 * }
 */

export { useAuth, type AuthContextValue, type AuthState } from "@/contexts/AuthContext";

