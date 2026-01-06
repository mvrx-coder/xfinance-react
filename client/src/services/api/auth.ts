/**
 * Serviço de Autenticação - xFinance
 * 
 * Integração com backend FastAPI
 */

import { apiFetch } from "@/lib/queryClient";

// =============================================================================
// TIPOS
// =============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: UserData | null;
}

export interface UserData {
  email: string;
  papel: string;
  nome: string | null;
  nick: string | null;
  short_nome: string | null;
}

// =============================================================================
// API BASE URL
// =============================================================================

// Usar URL relativa - o Vite proxy redireciona para o backend
const API_BASE = "";

// =============================================================================
// FUNÇÕES DE AUTENTICAÇÃO
// =============================================================================

/**
 * Realiza login no sistema.
 * 
 * @param credentials Email e senha
 * @returns Dados do usuário logado
 * @throws Error se credenciais inválidas
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiFetch<LoginResponse>(`${API_BASE}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
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

