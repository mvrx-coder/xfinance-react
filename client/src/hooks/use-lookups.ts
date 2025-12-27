/**
 * Hook para gerenciar lookups (dropdowns) com cache.
 * 
 * Centraliza busca e cache de dados de referência como:
 * - Contratantes (Players)
 * - Segurados
 * - Atividades
 * - UFs
 * - Cidades
 * - Usuários
 */

import { useQuery } from "@tanstack/react-query";
import { CACHE_CONFIG } from "@/constants";
import {
  fetchContrOptions,
  fetchSegurOptions,
  fetchAtiviOptions,
  fetchUfOptions,
  fetchCidadeOptions,
  fetchUsersOptions,
  fetchInspetoresOptions,
  type LookupOption,
  type UserOption,
} from "@/services/api/lookups";

// =============================================================================
// HOOKS INDIVIDUAIS
// =============================================================================

/**
 * Hook para buscar contratantes (Players)
 */
export function useContratantes() {
  return useQuery<LookupOption[]>({
    queryKey: ["lookups", "contratantes"],
    queryFn: fetchContrOptions,
    staleTime: CACHE_CONFIG.LOOKUPS_STALE_TIME,
  });
}

/**
 * Hook para buscar segurados
 */
export function useSegurados() {
  return useQuery<LookupOption[]>({
    queryKey: ["lookups", "segurados"],
    queryFn: fetchSegurOptions,
    staleTime: CACHE_CONFIG.LOOKUPS_STALE_TIME,
  });
}

/**
 * Hook para buscar atividades
 */
export function useAtividades() {
  return useQuery<LookupOption[]>({
    queryKey: ["lookups", "atividades"],
    queryFn: fetchAtiviOptions,
    staleTime: CACHE_CONFIG.LOOKUPS_STALE_TIME,
  });
}

/**
 * Hook para buscar UFs
 */
export function useUfs() {
  return useQuery<LookupOption[]>({
    queryKey: ["lookups", "ufs"],
    queryFn: fetchUfOptions,
    staleTime: CACHE_CONFIG.LOOKUPS_STALE_TIME,
  });
}

/**
 * Hook para buscar cidades de uma UF
 */
export function useCidades(idUf: number | null | undefined) {
  return useQuery<LookupOption[]>({
    queryKey: ["lookups", "cidades", idUf],
    queryFn: () => fetchCidadeOptions(idUf!),
    enabled: !!idUf && idUf > 0,
    staleTime: CACHE_CONFIG.LOOKUPS_STALE_TIME,
  });
}

/**
 * Hook para buscar usuários
 */
export function useUsers() {
  return useQuery<UserOption[]>({
    queryKey: ["lookups", "users"],
    queryFn: fetchUsersOptions,
    staleTime: CACHE_CONFIG.LOOKUPS_STALE_TIME,
  });
}

/**
 * Hook para buscar inspetores (somente papel Inspetor e ativos)
 */
export function useInspetores() {
  return useQuery<UserOption[]>({
    queryKey: ["lookups", "inspetores"],
    queryFn: fetchInspetoresOptions,
    staleTime: CACHE_CONFIG.LOOKUPS_STALE_TIME,
  });
}

// =============================================================================
// HOOK COMBINADO (todos os lookups principais)
// =============================================================================

export interface AllLookups {
  contratantes: LookupOption[];
  segurados: LookupOption[];
  atividades: LookupOption[];
  ufs: LookupOption[];
  users: UserOption[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook que busca todos os lookups principais de uma vez.
 * Útil para componentes que precisam de múltiplos lookups.
 */
export function useAllLookups(): AllLookups {
  const contratantes = useContratantes();
  const segurados = useSegurados();
  const atividades = useAtividades();
  const ufs = useUfs();
  const users = useUsers();

  return {
    contratantes: contratantes.data ?? [],
    segurados: segurados.data ?? [],
    atividades: atividades.data ?? [],
    ufs: ufs.data ?? [],
    users: users.data ?? [],
    isLoading:
      contratantes.isLoading ||
      segurados.isLoading ||
      atividades.isLoading ||
      ufs.isLoading ||
      users.isLoading,
    isError:
      contratantes.isError ||
      segurados.isError ||
      atividades.isError ||
      ufs.isError ||
      users.isError,
  };
}

