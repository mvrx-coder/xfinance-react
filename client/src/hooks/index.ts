/**
 * Re-exports de todos os hooks customizados.
 * 
 * Uso:
 * import { useInspections, useKPIs, useLookups, useAuth } from "@/hooks";
 */

// Autenticação
export { useAuth, type AuthContextValue, type AuthState } from "./use-auth";

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

// Performance (Financial Dashboard)
export {
  usePerformance,
  usePerformanceFilters,
  usePerformanceKPIs,
  useMarketShare,
  useBusiness,
  useOperational,
  usePerformanceDetails,
  type PerformanceFilters,
  type KPIsResponse,
  type MarketShareItem,
  type BusinessResponse,
  type OperationalItem,
  type DetailsItem,
  type DetailsResponse,
  type UsePerformanceOptions,
  type UsePerformanceReturn,
} from "./use-performance";

// Investments (Aportes)
export {
  useInvestments,
  useInvestmentFilters,
  useInvestmentKPIs,
  useInvestmentHighlights,
  useInvestmentAllocation,
  useInvestmentList,
  useDeleteInvestment,
  type InvestmentFilters,
  type FiltersResponse as InvestmentFiltersResponse,
  type KPIsResponse as InvestmentKPIsResponse,
  type HighlightsResponse,
  type AllocationItem,
  type InvestmentsResponse,
  type InvestmentItem,
  type UseInvestmentsOptions,
  type UseInvestmentsReturn,
} from "./use-investments";

// Novo Registro
export {
  useNewRecord,
  newRecordSchema,
  type NewRecordFormData,
  type NewRecordResponse,
  type MultiLocalState,
  type PendingCreation,
} from "./use-new-record";

// Debounce
export {
  useDebouncedValue,
  useDebouncedCallback,
} from "./use-debounce";