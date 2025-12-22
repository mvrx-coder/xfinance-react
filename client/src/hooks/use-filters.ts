/**
 * Hook para gerenciar estado global de filtros do grid.
 * 
 * Centraliza:
 * - Estado dos filtros (Player, MyJob, DB Limit)
 * - Grupos de colunas visíveis
 * - Persistência em localStorage (opcional)
 */

import { useState, useCallback, useMemo } from "react";
import type { FilterState } from "@shared/schema";

// =============================================================================
// TIPOS
// =============================================================================

export interface UseFiltersReturn {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  
  // Ações individuais
  togglePlayer: () => void;
  toggleMyJob: () => void;
  toggleDbLimit: () => void;
  toggleColumnGroup: (group: keyof FilterState["columnGroups"]) => void;
  
  // Reset
  resetFilters: () => void;
  
  // Derivados
  hasActiveFilters: boolean;
  activeFilterCount: number;
}

// =============================================================================
// DEFAULTS
// =============================================================================

export const DEFAULT_FILTERS: FilterState = {
  player: false,
  myJob: false,
  dbLimit: true,
  columnGroups: {
    workflow: true,
    recebiveis: true,
    pagamentos: true,
  },
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook para gerenciar filtros do grid.
 * 
 * @param initialFilters - Filtros iniciais (opcional)
 * @returns Objeto com estado e ações de filtros
 */
export function useFilters(initialFilters?: Partial<FilterState>): UseFiltersReturn {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // Toggles individuais
  const togglePlayer = useCallback(() => {
    setFilters((prev) => ({ ...prev, player: !prev.player }));
  }, []);

  const toggleMyJob = useCallback(() => {
    setFilters((prev) => ({ ...prev, myJob: !prev.myJob }));
  }, []);

  const toggleDbLimit = useCallback(() => {
    setFilters((prev) => ({ ...prev, dbLimit: !prev.dbLimit }));
  }, []);

  const toggleColumnGroup = useCallback(
    (group: keyof FilterState["columnGroups"]) => {
      setFilters((prev) => ({
        ...prev,
        columnGroups: {
          ...prev.columnGroups,
          [group]: !prev.columnGroups[group],
        },
      }));
    },
    []
  );

  // Reset
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Derivados
  const hasActiveFilters = useMemo(() => {
    return filters.player || filters.myJob || !filters.dbLimit;
  }, [filters.player, filters.myJob, filters.dbLimit]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.player) count++;
    if (filters.myJob) count++;
    if (!filters.dbLimit) count++;
    return count;
  }, [filters.player, filters.myJob, filters.dbLimit]);

  return {
    filters,
    setFilters,
    togglePlayer,
    toggleMyJob,
    toggleDbLimit,
    toggleColumnGroup,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}

