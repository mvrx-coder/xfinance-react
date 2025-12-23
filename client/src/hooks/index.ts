/**
 * Re-exports de todos os hooks customizados.
 * 
 * Uso:
 * import { useInspections, useKPIs, useLookups } from "@/hooks";
 */

// Hooks existentes
export { useToast } from "./use-toast";
export { useIsMobile } from "./use-mobile";

// Hooks de dados
export {
  useInspections,
  useCreateInspection,
  useUpdateInspection,
  useDeleteInspection,
  useInspectionOperations,
  type InspectionsFilters,
  type CreateInspectionData,
  type UpdateInspectionData,
} from "./use-inspections";

export {
  useKPIs,
  useKPIsExtended,
  useCalculatedKPIs,
  type KPIsExtended,
} from "./use-kpis";

export {
  useContratantes,
  useSegurados,
  useAtividades,
  useUfs,
  useCidades,
  useUsers,
  useAllLookups,
  type AllLookups,
} from "./use-lookups";

export {
  useFilters,
  DEFAULT_FILTERS,
  type UseFiltersReturn,
} from "./use-filters";

export {
  useDataGrid,
  type UseDataGridOptions,
  type UseDataGridReturn,
} from "./useDataGrid";

