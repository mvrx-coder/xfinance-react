/**
 * API de Lookups - xFinance
 * 
 * Busca opções para dropdowns do sistema.
 * Conecta aos endpoints reais do backend FastAPI.
 */

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
    const response = await fetch("/api/lookups/ufs", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Erro ao buscar UFs");
    return await response.json();
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
    const response = await fetch(`/api/lookups/cidades?id_uf=${idUf}`, {
      credentials: "include",
    });
    if (!response.ok) throw new Error(`Erro ao buscar cidades`);
    return await response.json();
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
    const response = await fetch("/api/lookups/contratantes", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Erro ao buscar contratantes");
    return await response.json();
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
    const response = await fetch("/api/lookups/segurados", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Erro ao buscar segurados");
    return await response.json();
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
    const response = await fetch("/api/lookups/atividades", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Erro ao buscar atividades");
    return await response.json();
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
    const response = await fetch("/api/lookups/users", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Erro ao buscar usuários");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
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
