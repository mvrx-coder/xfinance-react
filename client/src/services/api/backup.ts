/**
 * API de Backup - xFinance
 * 
 * Serviço para gerenciamento de backups do banco de dados.
 */

// =============================================================================
// TIPOS
// =============================================================================

export interface BackupInfo {
  filename: string;
  datetime: string;
  size_mb: number;
  timestamp: number;
}

export interface BackupListResponse {
  backups: BackupInfo[];
  total: number;
  nas_accessible: boolean;
  backup_path: string;
}

export interface BackupCreateResponse {
  success: boolean;
  message: string;
  filename?: string;
}

export interface BackupStatusResponse {
  nas_accessible: boolean;
  backup_path: string;
  total_backups: number;
  max_backups: number;
  last_backup?: BackupInfo;
  scheduler_running: boolean;
  next_scheduled_backup?: string;
}

export interface RestoreRequest {
  filename: string;
  confirmation: string;
}

export interface RestoreResponse {
  success: boolean;
  message: string;
  restored_from?: string;
  damage_file?: string;
}

// =============================================================================
// API BASE URL
// =============================================================================

// Usar URL relativa - o Vite proxy redireciona para o backend
const API_BASE = "";

// =============================================================================
// FUNÇÕES
// =============================================================================

/**
 * Lista todos os backups disponíveis no NAS.
 * Requer papel: admin
 */
export async function fetchBackups(): Promise<BackupListResponse> {
  const response = await fetch(`${API_BASE}/api/backup`, {
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
    throw new Error(error.detail || "Erro ao listar backups");
  }

  return response.json();
}

/**
 * Cria um backup manual do banco de dados.
 * Requer papel: admin
 */
export async function createBackup(): Promise<BackupCreateResponse> {
  const response = await fetch(`${API_BASE}/api/backup`, {
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
    throw new Error(error.detail || "Erro ao criar backup");
  }

  return response.json();
}

/**
 * Retorna status completo do sistema de backup.
 * Requer papel: admin
 */
export async function fetchBackupStatus(): Promise<BackupStatusResponse> {
  const response = await fetch(`${API_BASE}/api/backup/status`, {
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
    throw new Error(error.detail || "Erro ao obter status do backup");
  }

  return response.json();
}

/**
 * Restaura um backup específico.
 * ATENÇÃO: Esta operação substitui o banco de dados atual!
 * Requer papel: admin
 */
export async function restoreBackup(
  filename: string,
  confirmation: string
): Promise<RestoreResponse> {
  const response = await fetch(`${API_BASE}/api/backup/restore`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ filename, confirmation }),
  });

  if (response.status === 401) {
    throw new Error("Não autenticado");
  }

  if (response.status === 403) {
    throw new Error("Acesso restrito a administradores");
  }

  if (response.status === 400) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Confirmação inválida");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Erro ao restaurar backup");
  }

  return response.json();
}
