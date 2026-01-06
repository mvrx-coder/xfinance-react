/**
 * Hook para gerenciar inspeções (dados do grid principal).
 * 
 * Centraliza:
 * - Busca de inspeções com filtros
 * - Mutações (criar, atualizar, excluir)
 * - Invalidação de cache
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CACHE_CONFIG } from "@/constants";
import { QUERY_KEYS, useInvalidateQueries } from "@/lib/cache-helpers";
import { apiRequest } from "@/lib/queryClient";
import type { Inspection, FilterState } from "@shared/schema";

// =============================================================================
// TIPOS
// =============================================================================

export interface InspectionsFilters {
  player?: boolean;
  myJob?: boolean;
  dbLimit?: boolean;
  search?: string;
}

export interface CreateInspectionData {
  idContr: number;
  idSegur: number;
  idAtivi: number;
  idUserGuy: number;
  idUserGuilty?: number;
  idUf: number;
  idCidade?: number | null;
  dtInspecao?: string | null;
  honorario?: number | null;
  loc?: number | null;
  meta?: number;
  ms?: number;
}

export interface UpdateInspectionData extends Partial<CreateInspectionData> {
  idPrinc: number;
}

// =============================================================================
// FETCH FUNCTIONS
// =============================================================================

async function fetchInspections(filters?: InspectionsFilters): Promise<Inspection[]> {
  const params = new URLSearchParams();
  
  if (filters?.player) params.append("player", "true");
  if (filters?.myJob) params.append("myJob", "true");
  if (filters?.dbLimit) params.append("limit", "500");
  if (filters?.search) params.append("search", filters.search);

  const url = params.toString()
    ? `${QUERY_KEYS.INSPECTIONS[0]}?${params}`
    : QUERY_KEYS.INSPECTIONS[0];

  const response = await fetch(url, { credentials: "include" });
  if (!response.ok) throw new Error("Falha ao buscar inspeções");
  return response.json();
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook para buscar inspeções com filtros opcionais.
 */
export function useInspections(filters?: InspectionsFilters) {
  return useQuery<Inspection[]>({
    queryKey: [...QUERY_KEYS.INSPECTIONS, filters],
    queryFn: () => fetchInspections(filters),
    staleTime: CACHE_CONFIG.INSPECTIONS_STALE_TIME,
  });
}

/**
 * Hook para criar uma nova inspeção.
 */
export function useCreateInspection() {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateQueries();

  return useMutation({
    mutationFn: async (data: CreateInspectionData) => {
      const response = await apiRequest("POST", QUERY_KEYS.INSPECTIONS[0], data);
      return response.json();
    },
    onSuccess: () => {
      // Invalida cache de inspeções e KPIs
      invalidateAll();
    },
  });
}

/**
 * Hook para atualizar uma inspeção existente.
 */
export function useUpdateInspection() {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateQueries();

  return useMutation({
    mutationFn: async (data: UpdateInspectionData) => {
      const { idPrinc, ...updateData } = data;
      const response = await apiRequest(
        "PATCH",
        `${QUERY_KEYS.INSPECTIONS[0]}/${idPrinc}`,
        updateData
      );
      return response.json();
    },
    onSuccess: () => {
      invalidateAll();
    },
  });
}

/**
 * Hook para excluir inspeções.
 */
export function useDeleteInspection() {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateQueries();

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await apiRequest("DELETE", QUERY_KEYS.INSPECTIONS[0], {
        ids_princ: ids,
      });
      return response.json();
    },
    onSuccess: () => {
      invalidateAll();
    },
  });
}

/**
 * Hook combinado com todas as operações de inspeção.
 */
export function useInspectionOperations(filters?: InspectionsFilters) {
  const query = useInspections(filters);
  const createMutation = useCreateInspection();
  const updateMutation = useUpdateInspection();
  const deleteMutation = useDeleteInspection();

  return {
    // Query
    inspections: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    // Mutations
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

