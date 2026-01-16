/**
 * Serviço de Autenticação - xFinance
 * 
 * Integração com backend FastAPI
 */

// =============================================================================
// TIPOS
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CheckEmailResponse {
  status: string;
  message: string | null;
  requires_password_setup: boolean;
}

export interface SetPasswordRequest {
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  status?: string;
  user: UserData | null;
}

export interface UserData {
  email: string;
  papel: string;
  nome: string | null;
  nick: string | null;
  short_nome: string | null;
}

/** Status possíveis retornados pelo backend */
export const LoginStatus = {
  SUCCESS: "success",
  EMAIL_NOT_FOUND: "email_not_found",
  WRONG_PASSWORD: "wrong_password",
  MISSING_PASSWORD: "missing_password",
  USER_INACTIVE: "user_inactive",
  USER_LOCKED: "user_locked",
} as const;

export type LoginStatusType = typeof LoginStatus[keyof typeof LoginStatus];

// =============================================================================
// API BASE URL
// =============================================================================

// Usar URL relativa - o Vite proxy redireciona para o backend
const API_BASE = "";

// =============================================================================
// FUNÇÕES DE AUTENTICAÇÃO
// =============================================================================

/**
 * Verifica status do email antes do login.
 * 
 * Detecta primeiro acesso (usuário sem senha definida).
 * 
 * @param email Email a verificar
 * @returns Status do email
 */
export async function checkEmail(email: string): Promise<CheckEmailResponse> {
  const response = await fetch(`${API_BASE}/api/auth/check-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    credentials: "include",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Erro ao verificar email");
  }
  
  return response.json();
}

/**
 * Define senha no primeiro acesso.
 * 
 * @param request Email e senhas
 * @returns Dados do usuário após definir senha
 * @throws Error se falhar
 */
export async function setFirstPassword(request: SetPasswordRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/api/auth/set-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    credentials: "include",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Erro ao definir senha");
  }
  
  return response.json();
}

/**
 * Realiza login no sistema.
 * 
 * @param credentials Email e senha
 * @returns Dados do usuário logado (ou status de primeiro acesso)
 * @throws Error se credenciais inválidas
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include", // Importante: envia e recebe cookies
  });
  
  // Para primeiro acesso, o backend retorna 200 com success=false
  // Então precisamos verificar o status ao invés de response.ok
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Erro ao fazer login");
  }
  
  return response.json();
}

/**
 * Realiza logout.
 */
export async function logout(): Promise<void> {
  await fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

/**
 * Obtém dados do usuário atual.
 * 
 * @returns Dados do usuário ou null se não autenticado
 */
export async function getCurrentUser(): Promise<UserData | null> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: "include",
    });
    
    if (response.status === 401) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error("Erro ao obter usuário");
    }
    
    return response.json();
  } catch {
    return null;
  }
}

/**
 * Verifica se usuário está autenticado.
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

