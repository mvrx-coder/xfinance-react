/**
 * API de Auditoria - xFinance
 * 
 * Serviço para consulta do histórico de operações (audit log).
 * Todas as rotas requerem papel: admin
 */

// =============================================================================
// TIPOS
// =============================================================================

export interface AuditEntry {
  id_log: number;
  id_user: number;
  user_email: string;
  operacao: "CREATE" | "UPDATE" | "DELETE" | "ENCAMINHAR";
  campo: string | null;
  valor_anterior: string | null;
  valor_novo: string | null;
  dt_operacao: string;
}

export interface AuditHistoryResponse {
  id_princ: number;
  total: number;
  entries: AuditEntry[];
}

export interface AuditStatsResponse {
  total_registros: number;
  registro_mais_antigo: string | null;
  registros_expirados: number;
}

export interface CleanupResponse {
  success: boolean;
  message: string;
  deleted: number;
}

// =============================================================================
// API BASE URL
// =============================================================================

const API_BASE = "";

// =============================================================================
// FUNÇÕES
// =============================================================================

/**
 * Busca histórico de operações de um registro específico.
 * Requer papel: admin
 */
export async function fetchAuditHistory(
  idPrinc: number,
  limit: number = 100
): Promise<AuditHistoryResponse> {
  const response = await fetch(
    `${API_BASE}/api/audit/${idPrinc}?limit=${limit}`,
    { credentials: "include" }
  );

  if (response.status === 401) {
    throw new Error("Não autenticado");
  }

  if (response.status === 403) {
    throw new Error("Acesso restrito a administradores");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Erro ao buscar histórico");
  }

  return response.json();
}

/**
 * Retorna estatísticas do log de auditoria.
 * Requer papel: admin
 */
export async function fetchAuditStats(): Promise<AuditStatsResponse> {
  const response = await fetch(`${API_BASE}/api/audit/stats`, {
    credentials: "include",
  });

  if (response.status === 401) {
    throw new Error("Não autenticado");
  }

  if (response.status === 403) {
    throw new Error("Acesso restrito a administradores");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Erro ao buscar estatísticas");
  }

  return response.json();
}

/**
 * Remove registros de auditoria expirados (mais de 14 meses).
 * Requer papel: admin
 */
export async function cleanupAudit(): Promise<CleanupResponse> {
  const response = await fetch(`${API_BASE}/api/audit/cleanup`, {
    method: "POST",
    credentials: "include",
  });

  if (response.status === 401) {
    throw new Error("Não autenticado");
  }

  if (response.status === 403) {
    throw new Error("Acesso restrito a administradores");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Erro ao limpar registros");
  }

  return response.json();
}
