/**
 * API de Lookups - xFinance
 * 
 * Busca opções para dropdowns do sistema.
 * Conecta aos endpoints reais do backend FastAPI.
 */

import { apiFetch } from "@/lib/queryClient";

export interface LookupOption {
  value: number;
  label: string;
}

export interface UserOption extends LookupOption {
  papel: string;
  ativo: boolean;
}

// =============================================================================
// UFs
// =============================================================================

export async function fetchUfOptions(): Promise<LookupOption[]> {
  try {
    return await apiFetch<LookupOption[]>("/api/lookups/ufs");
  } catch (error) {
    console.error("Erro ao buscar UFs:", error);
    return [];
  }
}

// =============================================================================
// Cidades (filtradas por UF)
// =============================================================================

export async function fetchCidadeOptions(idUf: number): Promise<LookupOption[]> {
  if (!idUf) return [];
  
  try {
    return await apiFetch<LookupOption[]>(`/api/lookups/cidades?id_uf=${idUf}`);
  } catch (error) {
    console.error(`Erro ao buscar cidades da UF ${idUf}:`, error);
    return [];
  }
}

// =============================================================================
// Contratantes (Players)
// =============================================================================

export async function fetchContrOptions(): Promise<LookupOption[]> {
  try {
    return await apiFetch<LookupOption[]>("/api/lookups/contratantes");
  } catch (error) {
    console.error("Erro ao buscar contratantes:", error);
    return [];
  }
}

// =============================================================================
// Segurados
// =============================================================================

export async function fetchSegurOptions(): Promise<LookupOption[]> {
  try {
    return await apiFetch<LookupOption[]>("/api/lookups/segurados");
  } catch (error) {
    console.error("Erro ao buscar segurados:", error);
    return [];
  }
}

// =============================================================================
// Atividades
// =============================================================================

export async function fetchAtiviOptions(): Promise<LookupOption[]> {
  try {
    return await apiFetch<LookupOption[]>("/api/lookups/atividades");
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    return [];
  }
}

// =============================================================================
// Usuários
// =============================================================================

export async function fetchUsersOptions(): Promise<UserOption[]> {
  try {
    return await apiFetch<UserOption[]>("/api/lookups/users");
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
}

// =============================================================================
// Inspetores (Somente usuários com papel Inspetor e ativos)
// =============================================================================

export async function fetchInspetoresOptions(): Promise<UserOption[]> {
  try {
    return await apiFetch<UserOption[]>("/api/lookups/inspetores");
  } catch (error) {
    console.error("Erro ao buscar inspetores:", error);
    return [];
  }
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Busca o label de uma opção pelo ID.
 */
export function getLabelById(
  options: LookupOption[], 
  id: number | null | undefined
): string {
  if (id === null || id === undefined) return "-";
  const option = options.find(o => o.value === id);
  return option?.label || "-";
}
