/**
 * Constantes globais do xFinance
 * 
 * Centraliza magic numbers e configurações reutilizáveis.
 */

// =============================================================================
// GRID / PAGINAÇÃO
// =============================================================================

export const GRID_CONFIG = {
  /** Linhas por página no grid principal */
  ROWS_PER_PAGE: 50,
  /** Itens por página no grid de portfolio (Investments) */
  PORTFOLIO_ITEMS_PER_PAGE: 8,
  /** Itens por página no grid de detalhes (Performance) */
  DETAILS_ITEMS_PER_PAGE: 5,
  /** Altura mínima do grid */
  MIN_HEIGHT: 400,
} as const;

// =============================================================================
// API
// =============================================================================

export const API_ENDPOINTS = {
  INSPECTIONS: "/api/inspections",
  USERS: "/api/users",
  KPIS: "/api/kpis",
  LOOKUPS: {
    CONTRATANTES: "/api/lookups/contratantes",
    SEGURADOS: "/api/lookups/segurados",
    ATIVIDADES: "/api/lookups/atividades",
    UFS: "/api/lookups/ufs",
    CIDADES: "/api/lookups/cidades",
    USERS: "/api/lookups/users",
  },
} as const;

// =============================================================================
// CACHE / STALE TIME
// =============================================================================

export const CACHE_CONFIG = {
  /** Tempo em ms que lookups ficam válidos (5 minutos) */
  LOOKUPS_STALE_TIME: 5 * 60 * 1000,
  /** Tempo em ms que KPIs ficam válidos (30 segundos) */
  KPIS_STALE_TIME: 30 * 1000,
  /** Tempo em ms que inspeções ficam válidas (1 minuto) */
  INSPECTIONS_STALE_TIME: 60 * 1000,
} as const;

// =============================================================================
// FORMATAÇÃO
// =============================================================================

export const FORMAT_CONFIG = {
  /** Locale para formatação de números/moeda */
  LOCALE: "pt-BR",
  /** Moeda padrão */
  CURRENCY: "BRL",
  /** Formato de data curto */
  DATE_SHORT: "dd/MM",
  /** Formato de data completo */
  DATE_FULL: "dd/MM/yyyy",
} as const;

// =============================================================================
// LIMITES
// =============================================================================

export const LIMITS = {
  /** Limite máximo de registros do DB Limit */
  DB_LIMIT_MAX: 500,
  /** Máximo de linhas por arquivo (boas práticas) */
  MAX_LINES_PER_FILE: 400,
} as const;

