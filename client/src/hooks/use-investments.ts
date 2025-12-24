/**
 * Hook para dados de Investimentos/Aportes - xFinance
 * 
 * Gerencia:
 * - Busca de filtros disponíveis
 * - KPIs agregados
 * - Highlights (Winner, Loser, Maior)
 * - Alocação (para gráfico)
 * - Lista de investimentos
 * - Exclusão de investimentos
 * 
 * 🔒 SIGILO: Apenas admin tem acesso a estes dados.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchInvestmentFilters,
  fetchInvestmentKPIs,
  fetchInvestmentHighlights,
  fetchInvestmentAllocation,
  fetchInvestments,
  deleteInvestment,
  type InvestmentFilters,
  type FiltersResponse,
  type KPIsResponse,
  type HighlightsResponse,
  type AllocationItem,
  type InvestmentsResponse,
  type InvestmentItem,
} from "@/services/api/investments";

// Re-exportar tipos para uso externo
export type {
  InvestmentFilters,
  FiltersResponse,
  KPIsResponse,
  HighlightsResponse,
  AllocationItem,
  InvestmentsResponse,
  InvestmentItem,
} from "@/services/api/investments";

// =============================================================================
// CONSTANTES
// =============================================================================

const QUERY_KEYS = {
  FILTERS: ["investments", "filters"],
  KPIS: ["investments", "kpis"],
  HIGHLIGHTS: ["investments", "highlights"],
  ALLOCATION: ["investments", "allocation"],
  LIST: ["investments", "list"],
} as const;

const STALE_TIME = {
  /** Filtros raramente mudam (5 min) */
  FILTERS: 5 * 60 * 1000,
  /** KPIs e dados (30s) */
  DATA: 30 * 1000,
} as const;

// =============================================================================
// HOOKS INDIVIDUAIS
// =============================================================================

/**
 * Hook para buscar opções de filtro.
 */
export function useInvestmentFilters(enabled: boolean = true) {
  return useQuery<FiltersResponse>({
    queryKey: QUERY_KEYS.FILTERS,
    queryFn: fetchInvestmentFilters,
    staleTime: STALE_TIME.FILTERS,
    enabled,
  });
}

/**
 * Hook para buscar KPIs.
 */
export function useInvestmentKPIs(filters?: InvestmentFilters, enabled: boolean = true) {
  return useQuery<KPIsResponse>({
    queryKey: [...QUERY_KEYS.KPIS, filters],
    queryFn: () => fetchInvestmentKPIs(filters),
    staleTime: STALE_TIME.DATA,
    enabled,
  });
}

/**
 * Hook para buscar highlights.
 */
export function useInvestmentHighlights(filters?: InvestmentFilters, enabled: boolean = true) {
  return useQuery<HighlightsResponse>({
    queryKey: [...QUERY_KEYS.HIGHLIGHTS, filters],
    queryFn: () => fetchInvestmentHighlights(filters),
    staleTime: STALE_TIME.DATA,
    enabled,
  });
}

/**
 * Hook para buscar alocação (gráfico).
 */
export function useInvestmentAllocation(
  groupBy: "tipo" | "investidor" | "instituicao" = "tipo",
  filters?: InvestmentFilters,
  enabled: boolean = true
) {
  return useQuery<AllocationItem[]>({
    queryKey: [...QUERY_KEYS.ALLOCATION, groupBy, filters],
    queryFn: () => fetchInvestmentAllocation(groupBy, filters),
    staleTime: STALE_TIME.DATA,
    enabled,
  });
}

/**
 * Hook para buscar lista de investimentos.
 */
export function useInvestmentList(filters?: InvestmentFilters, enabled: boolean = true) {
  return useQuery<InvestmentsResponse>({
    queryKey: [...QUERY_KEYS.LIST, filters],
    queryFn: () => fetchInvestments(filters),
    staleTime: STALE_TIME.DATA,
    enabled,
  });
}

/**
 * Hook mutation para deletar investimento.
 */
export function useDeleteInvestment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteInvestment,
    onSuccess: () => {
      // Invalidar todas as queries de investments para refetch
      queryClient.invalidateQueries({ queryKey: ["investments"] });
    },
  });
}

// =============================================================================
// HOOK COMBINADO
// =============================================================================

export interface UseInvestmentsOptions {
  filters?: InvestmentFilters;
  groupBy?: "tipo" | "investidor" | "instituicao";
  enabled?: boolean;
}

export interface UseInvestmentsReturn {
  // Data
  kpis: KPIsResponse | undefined;
  highlights: HighlightsResponse | undefined;
  allocation: AllocationItem[] | undefined;
  investments: InvestmentsResponse | undefined;
  
  // Loading states
  isLoadingKPIs: boolean;
  isLoadingHighlights: boolean;
  isLoadingAllocation: boolean;
  isLoadingInvestments: boolean;
  
  // Error state
  hasError: boolean;
  kpisError: Error | null;
  
  // Refetch
  refetchAll: () => void;
}

/**
 * Hook combinado para todos os dados de investimentos.
 */
export function useInvestments({
  filters,
  groupBy = "tipo",
  enabled = true,
}: UseInvestmentsOptions = {}): UseInvestmentsReturn {
  const queryClient = useQueryClient();
  
  const kpisQuery = useInvestmentKPIs(filters, enabled);
  const highlightsQuery = useInvestmentHighlights(filters, enabled);
  const allocationQuery = useInvestmentAllocation(groupBy, filters, enabled);
  const investmentsQuery = useInvestmentList(filters, enabled);
  
  const refetchAll = () => {
    queryClient.invalidateQueries({ queryKey: ["investments"] });
  };
  
  return {
    kpis: kpisQuery.data,
    highlights: highlightsQuery.data,
    allocation: allocationQuery.data,
    investments: investmentsQuery.data,
    
    isLoadingKPIs: kpisQuery.isLoading,
    isLoadingHighlights: highlightsQuery.isLoading,
    isLoadingAllocation: allocationQuery.isLoading,
    isLoadingInvestments: investmentsQuery.isLoading,
    
    hasError: kpisQuery.isError || highlightsQuery.isError || allocationQuery.isError || investmentsQuery.isError,
    kpisError: kpisQuery.error,
    
    refetchAll,
  };
}
