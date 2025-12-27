/**
 * Re-exports de todos os contextos React.
 * 
 * Uso:
 * import { AuthProvider, useAuth } from "@/contexts";
 */

export { 
  AuthProvider, 
  AuthContext, 
  useAuth,
  type AuthState,
  type AuthContextValue,
  type UserData,
} from "./AuthContext";

