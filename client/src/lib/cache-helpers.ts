/**
 * Cache Helpers - xFinance
 * 
 * Centraliza lógica de invalidação de cache e query keys para evitar duplicação
 * entre hooks e facilitar manutenção.
 * 
 * @module lib/cache-helpers
 */

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { API_ENDPOINTS } from "@/constants";

// =============================================================================
// QUERY KEYS CENTRALIZADAS
// =============================================================================

/**
 * Query keys centralizadas para todo o sistema.
 * Usar estas constantes evita duplicação e facilita refatoração.
 */
export const QUERY_KEYS = {
  /** Key para cache de inspeções */
  INSPECTIONS: [API_ENDPOINTS.INSPECTIONS] as const,
  
  /** Key para cache de KPIs */
  KPIS: [API_ENDPOINTS.KPIS] as const,
  
  /** Keys para cache de lookups */
  LOOKUPS: {
    contratantes: ["lookups", "contratantes"] as const,
    segurados: ["lookups", "segurados"] as const,
    atividades: ["lookups", "atividades"] as const,
    ufs: ["lookups", "ufs"] as const,
    cidades: ["lookups", "cidades"] as const,
    users: ["lookups", "users"] as const,
    inspetores: ["lookups", "inspetores"] as const,
  },
} as const;

// =============================================================================
// HOOK DE INVALIDAÇÃO
// =============================================================================

/**
 * Hook para invalidar múltiplos domínios de cache.
 * 
 * Centraliza a lógica de invalidação para evitar duplicação em mutations.
 * Usar após ações que alteram dados (create, update, delete).
 * 
 * @example
 * ```tsx
 * const { invalidateInspections, invalidateKPIs, invalidateAll } = useInvalidateQueries();
 * 
 * // Após criar inspeção
 * invalidateAll();
 * 
 * // Após atualizar apenas KPIs
 * invalidateKPIs();
 * ```
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return {
    /**
     * Invalida cache de inspeções.
     * Usar após criar/atualizar/deletar inspeções.
     */
    invalidateInspections: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INSPECTIONS });
    }, [queryClient]),
    
    /**
     * Invalida cache de KPIs.
     * Usar após ações que alteram valores financeiros.
     */
    invalidateKPIs: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KPIS });
    }, [queryClient]),
    
    /**
     * Invalida cache de lookups específicos.
     * Usar após criar novas entidades (segurados, atividades, etc).
     */
    invalidateLookups: useCallback((lookupType: keyof typeof QUERY_KEYS.LOOKUPS) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LOOKUPS[lookupType] });
    }, [queryClient]),
    
    /**
     * Invalida todos os lookups.
     * Usar após alterações que podem afetar múltiplos lookups.
     */
    invalidateAllLookups: useCallback(() => {
      Object.values(QUERY_KEYS.LOOKUPS).forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    }, [queryClient]),
    
    /**
     * Invalida cache de inspeções E KPIs simultaneamente.
     * Usar após ações que afetam ambos (criar, deletar inspeções).
     */
    invalidateAll: useCallback(() => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INSPECTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.KPIS });
    }, [queryClient]),
  };
}
