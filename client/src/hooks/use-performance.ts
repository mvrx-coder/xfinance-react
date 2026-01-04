/**
 * Hook para dados de Performance - xFinance
 * 
 * Gerencia:
 * - Busca de filtros disponíveis
 * - KPIs agregados
 * - Market Share
 * - Business (honorários por ano/mês)
 * - Operational (honorários por operador)
 * - Details (grid detalhado)
 * 
 * 🔒 SIGILO: Apenas admin tem acesso a estes dados.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchPerformanceFilters,
  fetchPerformanceKPIs,
  fetchPerformanceKPIsExtended,
  fetchMarketShare,
  fetchBusiness,
  fetchOperational,
  fetchDetails,
  type PerformanceFilters,
  type FiltersResponse,
  type KPIsResponse,
  type KPIsExtendedResponse,
  type MarketShareItem,
  type BusinessResponse,
  type OperationalItem,
  type DetailsItem,
  type DetailsResponse,
} from "@/services/api/performance";

// Re-exportar tipos para uso externo
export type {
  PerformanceFilters,
  FiltersResponse,
  KPIsResponse,
  KPIsExtendedResponse,
  MarketShareItem,
  BusinessResponse,
  OperationalItem,
  DetailsItem,
  DetailsResponse,
} from "@/services/api/performance";

// =============================================================================
// CONSTANTES
// =============================================================================

const QUERY_KEYS = {
  FILTERS: ["performance", "filters"],
  KPIS: ["performance", "kpis"],
  KPIS_EXTENDED: ["performance", "kpis-extended"],
  MARKET: ["performance", "market"],
  BUSINESS: ["performance", "business"],
  OPERATIONAL: ["performance", "operational"],
  DETAILS: ["performance", "details"],
} as const;

const STALE_TIME = {
  /** Filtros raramente mudam (5 min) */
  FILTERS: 5 * 60 * 1000,
  /** KPIs mudam com frequência (30s) */
  KPIS: 30 * 1000,
  /** Gráficos (1 min) */
  CHARTS: 60 * 1000,
  /** Detalhes (1 min) */
  DETAILS: 60 * 1000,
} as const;

// =============================================================================
// HOOKS INDIVIDUAIS
// =============================================================================

/**
 * Hook para buscar opções de filtro (anos disponíveis).
 */
export function usePerformanceFilters(enabled: boolean = true) {
  return useQuery<FiltersResponse>({
    queryKey: QUERY_KEYS.FILTERS,
    queryFn: fetchPerformanceFilters,
    staleTime: STALE_TIME.FILTERS,
    enabled,
  });
}

/**
 * Hook para buscar KPIs agregados.
 */
export function usePerformanceKPIs(filters?: PerformanceFilters, enabled: boolean = true) {
  return useQuery<KPIsResponse>({
    queryKey: [...QUERY_KEYS.KPIS, filters],
    queryFn: () => fetchPerformanceKPIs(filters),
    staleTime: STALE_TIME.KPIS,
    enabled,
  });
}

/**
 * Hook para buscar KPIs estendidos (com sparklines, trends, etc).
 */
export function usePerformanceKPIsExtended(filters?: PerformanceFilters, enabled: boolean = true) {
  return useQuery<KPIsExtendedResponse>({
    queryKey: [...QUERY_KEYS.KPIS_EXTENDED, filters],
    queryFn: () => fetchPerformanceKPIsExtended(filters),
    staleTime: STALE_TIME.KPIS,
    enabled,
  });
}

/**
 * Hook para buscar Market Share.
 */
export function useMarketShare(filters?: PerformanceFilters, enabled: boolean = true) {
  return useQuery<MarketShareItem[]>({
    queryKey: [...QUERY_KEYS.MARKET, filters],
    queryFn: () => fetchMarketShare(filters),
    staleTime: STALE_TIME.CHARTS,
    enabled,
  });
}

/**
 * Hook para buscar dados de Business.
 */
export function useBusiness(filters?: PerformanceFilters, enabled: boolean = true) {
  return useQuery<BusinessResponse>({
    queryKey: [...QUERY_KEYS.BUSINESS, filters],
    queryFn: () => fetchBusiness(filters),
    staleTime: STALE_TIME.CHARTS,
    enabled,
  });
}

/**
 * Hook para buscar dados Operational.
 */
export function useOperational(filters?: PerformanceFilters, enabled: boolean = true) {
  return useQuery<OperationalItem[]>({
    queryKey: [...QUERY_KEYS.OPERATIONAL, filters],
    queryFn: () => fetchOperational(filters),
    staleTime: STALE_TIME.CHARTS,
    enabled,
  });
}

/**
 * Hook para buscar dados detalhados.
 */
export function usePerformanceDetails(
  filters?: PerformanceFilters,
  limit: number = 100,
  offset: number = 0,
  enabled: boolean = true
) {
  return useQuery<DetailsResponse>({
    queryKey: [...QUERY_KEYS.DETAILS, filters, limit, offset],
    queryFn: () => fetchDetails(filters, limit, offset),
    staleTime: STALE_TIME.DETAILS,
    enabled,
  });
}

// =============================================================================
// HOOK COMBINADO
// =============================================================================

export interface UsePerformanceOptions {
  /** Filtros aplicados */
  filters?: PerformanceFilters;
  /** Se deve buscar dados (default: true) */
  enabled?: boolean;
  /** Limite para paginação de detalhes */
  detailsLimit?: number;
  /** Offset para paginação de detalhes */
  detailsOffset?: number;
}

export interface UsePerformanceReturn {
  // Dados
  filterOptions: FiltersResponse | undefined;
  kpis: KPIsResponse | undefined;
  marketShare: MarketShareItem[] | undefined;
  business: BusinessResponse | undefined;
  operational: OperationalItem[] | undefined;
  details: DetailsResponse | undefined;
  
  // Loading states
  isLoadingFilters: boolean;
  isLoadingKPIs: boolean;
  isLoadingMarket: boolean;
  isLoadingBusiness: boolean;
  isLoadingOperational: boolean;
  isLoadingDetails: boolean;
  isLoading: boolean;
  
  // Error states
  filtersError: Error | null;
  kpisError: Error | null;
  marketError: Error | null;
  businessError: Error | null;
  operationalError: Error | null;
  detailsError: Error | null;
  hasError: boolean;
}

/**
 * Hook combinado que busca todos os dados de Performance.
 * 
 * Uso:
 * ```tsx
 * const { kpis, marketShare, isLoading } = usePerformance({
 *   filters: { baseDate: "dt_envio", anoIni: 2023, anoFim: 2025 }
 * });
 * ```
 */
export function usePerformance(options: UsePerformanceOptions = {}): UsePerformanceReturn {
  const {
    filters,
    enabled = true,
    detailsLimit = 100,
    detailsOffset = 0,
  } = options;

  // Buscar todos os dados em paralelo
  const filtersQuery = usePerformanceFilters(enabled);
  const kpisQuery = usePerformanceKPIs(filters, enabled);
  const marketQuery = useMarketShare(filters, enabled);
  const businessQuery = useBusiness(filters, enabled);
  const operationalQuery = useOperational(filters, enabled);
  const detailsQuery = usePerformanceDetails(filters, detailsLimit, detailsOffset, enabled);

  return {
    // Dados
    filterOptions: filtersQuery.data,
    kpis: kpisQuery.data,
    marketShare: marketQuery.data,
    business: businessQuery.data,
    operational: operationalQuery.data,
    details: detailsQuery.data,
    
    // Loading states
    isLoadingFilters: filtersQuery.isLoading,
    isLoadingKPIs: kpisQuery.isLoading,
    isLoadingMarket: marketQuery.isLoading,
    isLoadingBusiness: businessQuery.isLoading,
    isLoadingOperational: operationalQuery.isLoading,
    isLoadingDetails: detailsQuery.isLoading,
    isLoading: 
      filtersQuery.isLoading ||
      kpisQuery.isLoading ||
      marketQuery.isLoading ||
      businessQuery.isLoading ||
      operationalQuery.isLoading ||
      detailsQuery.isLoading,
    
    // Error states
    filtersError: filtersQuery.error,
    kpisError: kpisQuery.error,
    marketError: marketQuery.error,
    businessError: businessQuery.error,
    operationalError: operationalQuery.error,
    detailsError: detailsQuery.error,
    hasError: 
      !!filtersQuery.error ||
      !!kpisQuery.error ||
      !!marketQuery.error ||
      !!businessQuery.error ||
      !!operationalQuery.error ||
      !!detailsQuery.error,
  };
}
