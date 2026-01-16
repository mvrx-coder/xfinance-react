/**
 * Hook para gerenciar KPIs do sistema.
 * 
 * Centraliza:
 * - Busca de KPIs do Express
 * - Cálculos derivados
 * - Cache otimizado
 * - Invalidação após ações (delete, forward, marker, new record, edit)
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { API_ENDPOINTS, CACHE_CONFIG } from "@/constants";
import type { KPIs, Inspection } from "@shared/schema";

// =============================================================================
// QUERY KEY - Exportada para invalidação em outros componentes
// =============================================================================

export const KPIS_QUERY_KEY = [API_ENDPOINTS.KPIS];

// =============================================================================
// TIPOS
// =============================================================================

export interface KPIsExtended extends KPIs {
  /** Resultado operacional (honorários - despesas) */
  resultadoOperacional: number;
  /** Resultado Guy (guyHonorario - guyDespesa) */
  resultadoGuy: number;
  /** Total de inspeções */
  totalInspecoes: number;
}

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

async function fetchKPIs(): Promise<KPIs> {
  const response = await fetch(API_ENDPOINTS.KPIS, { credentials: "include" });
  if (!response.ok) throw new Error("Falha ao buscar KPIs");
  return response.json();
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook para buscar KPIs do backend.
 * 
 * 🔒 SIGILO: Apenas admin deve ter enabled=true.
 * Para não-admin, retorna valores zerados sem chamar API.
 */
export function useKPIs(enabled: boolean = true) {
  return useQuery<KPIs>({
    queryKey: KPIS_QUERY_KEY,
    queryFn: fetchKPIs,
    staleTime: CACHE_CONFIG.KPIS_STALE_TIME,
    enabled, // 🔒 Não buscar se não for admin
    // KPIs começam com valores zerados enquanto carrega
    placeholderData: {
      express: 0,
      honorarios: 0,
      guyHonorario: 0,
      despesas: 0,
      guyDespesa: 0,
    },
  });
}

/**
 * Hook para invalidar cache de KPIs.
 * Usar após ações que alteram valores financeiros:
 * - Delete, Forward, Marker, New Record, Edit inline
 */
export function useInvalidateKPIs() {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: KPIS_QUERY_KEY });
  }, [queryClient]);
}

/**
 * Hook para calcular KPIs a partir de uma lista de inspeções.
 * Útil quando você já tem os dados e quer calcular KPIs localmente.
 */
export function useCalculatedKPIs(inspections: Inspection[]): KPIsExtended {
  return useMemo(() => {
    const kpis = inspections.reduce(
      (acc, insp) => ({
        express: acc.express + (insp.meta === 1 ? 1 : 0),
        honorarios: acc.honorarios + (insp.honorario ?? 0),
        guyHonorario: acc.guyHonorario + (insp.guyHonorario ?? 0),
        despesas: acc.despesas + (insp.despesa ?? 0),
        guyDespesa: acc.guyDespesa + (insp.guyDespesa ?? 0),
      }),
      {
        express: 0,
        honorarios: 0,
        guyHonorario: 0,
        despesas: 0,
        guyDespesa: 0,
      }
    );

    return {
      ...kpis,
      resultadoOperacional: kpis.honorarios - kpis.despesas,
      resultadoGuy: kpis.guyHonorario - kpis.guyDespesa,
      totalInspecoes: inspections.length,
    };
  }, [inspections]);
}

/**
 * Hook combinado que busca KPIs e adiciona cálculos derivados.
 */
export function useKPIsExtended() {
  const query = useKPIs();

  const extended = useMemo<KPIsExtended>(() => {
    const base = query.data ?? {
      express: 0,
      honorarios: 0,
      guyHonorario: 0,
      despesas: 0,
      guyDespesa: 0,
    };

    return {
      ...base,
      resultadoOperacional: base.honorarios - base.despesas,
      resultadoGuy: base.guyHonorario - base.guyDespesa,
      totalInspecoes: 0, // Precisa vir do backend ou ser calculado separadamente
    };
  }, [query.data]);

  return {
    kpis: extended,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

