/**
 * Serviço de Performance - xFinance
 * 
 * Integração com endpoints de performance do backend FastAPI.
 * 
 * 🔒 SIGILO: Apenas admin tem acesso a estes dados.
 */

// =============================================================================
// TIPOS
// =============================================================================

export interface PerformanceFilters {
  baseDate?: "dt_envio" | "dt_pago" | "dt_acerto";
  anoIni?: number;
  anoFim?: number;
  mm12?: boolean;
  /** Métrica: "valor" (honorarios) ou "quantidade" (loc/inspeções) */
  metric?: "valor" | "quantidade";
}

export interface FilterOption {
  label: string;
  value: number;
}

export interface FiltersResponse {
  anos: FilterOption[];
}

export interface KPIsResponse {
  honorarios: number;
  despesas: number;
  resultado_oper: number;
  inspecoes: number;
}

export interface MarketShareItem {
  name: string;
  value: number;
  honorarios: number;
  jobs: number;
  color: string;
}

export interface BusinessSeries {
  year: number;
  color: string;
  data: number[];
}

export interface BusinessResponse {
  months: string[];
  series: BusinessSeries[];
}

export interface OperationalYear {
  year: number;
  value: number;
  percentage: number;
}

export interface OperationalItem {
  name: string;
  years: OperationalYear[];
}

export interface DetailsItem {
  id: number;
  dataBase: string | null;
  dtEnvio: string | null;
  dtPago: string | null;
  dtAcerto: string | null;
  honorario: number;
  despesa: number;
  guyHonorario: number;
  guyDespesa: number;
  meta: number | null;
  prazo: number | null;
  loc: number | null;
  contratante: string | null;
  segurado: string | null;
  guilty: string | null;
  guy: string | null;
  atividade: string | null;
  uf: string | null;
  cidade: string | null;
}

export interface DetailsResponse {
  data: DetailsItem[];
  total: number;
}

// KPIs Extended para visualização premium
export interface KPIsTrends {
  honorarios: number;
  despesas: number;
  resultado_oper: number;
  inspecoes: number;
  ticket_medio: number;
  margem: number;
  eficiencia: number;
  crescimento: number;
}

export interface KPIsPrevious {
  honorarios: string;
  despesas: string;
  resultado_oper: string;
  inspecoes: string;
  ticket_medio: string;
  margem: string;
}

export interface KPIsSparklines {
  honorarios: number[];
  despesas: number[];
  resultado_oper: number[];
  inspecoes: number[];
  ticket_medio: number[];
}

export interface KPIsGoals {
  resultado_oper: number;
  margem: number;
  eficiencia: number;
}

export interface KPIsExtendedResponse {
  // KPIs principais
  honorarios: number;
  despesas: number;
  resultado_oper: number;
  inspecoes: number;
  
  // KPIs calculados
  ticket_medio: number;
  margem: number;
  eficiencia: number;
  crescimento: number;
  
  // Dados extras
  trends: KPIsTrends;
  previous: KPIsPrevious;
  sparklines: KPIsSparklines;
  goals: KPIsGoals;
}

// =============================================================================
// ENDPOINTS
// =============================================================================

const BASE_URL = "/api/performance";

// =============================================================================
// HELPERS
// =============================================================================

function buildQueryString(filters?: PerformanceFilters, extra?: Record<string, string | number>): string {
  const params = new URLSearchParams();
  
  if (filters?.baseDate) params.append("base_date", filters.baseDate);
  if (filters?.anoIni) params.append("ano_ini", filters.anoIni.toString());
  if (filters?.anoFim) params.append("ano_fim", filters.anoFim.toString());
  if (filters?.mm12) params.append("mm12", "true");
  if (filters?.metric) params.append("metric", filters.metric);
  
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      params.append(key, value.toString());
    });
  }
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

async function fetchWithAuth<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Acesso restrito a administradores");
    }
    if (response.status === 401) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(`Erro ao buscar dados: ${response.statusText}`);
  }
  
  return response.json();
}

// =============================================================================
// FUNÇÕES DE FETCH
// =============================================================================

/**
 * Busca opções de filtro (anos disponíveis).
 */
export async function fetchPerformanceFilters(): Promise<FiltersResponse> {
  return fetchWithAuth<FiltersResponse>(`${BASE_URL}/filters`);
}

/**
 * Busca KPIs agregados.
 */
export async function fetchPerformanceKPIs(filters?: PerformanceFilters): Promise<KPIsResponse> {
  const qs = buildQueryString(filters);
  return fetchWithAuth<KPIsResponse>(`${BASE_URL}/kpis${qs}`);
}

/**
 * Busca KPIs estendidos (com sparklines, trends e previous values).
 */
export async function fetchPerformanceKPIsExtended(filters?: PerformanceFilters): Promise<KPIsExtendedResponse> {
  const qs = buildQueryString(filters);
  return fetchWithAuth<KPIsExtendedResponse>(`${BASE_URL}/kpis-extended${qs}`);
}

/**
 * Busca dados de Market Share.
 */
export async function fetchMarketShare(filters?: PerformanceFilters): Promise<MarketShareItem[]> {
  const qs = buildQueryString(filters);
  return fetchWithAuth<MarketShareItem[]>(`${BASE_URL}/market${qs}`);
}

/**
 * Busca dados de Business (honorários por ano/mês).
 */
export async function fetchBusiness(filters?: PerformanceFilters): Promise<BusinessResponse> {
  const qs = buildQueryString(filters);
  return fetchWithAuth<BusinessResponse>(`${BASE_URL}/business${qs}`);
}

/**
 * Busca dados Operational (honorários por operador/ano).
 */
export async function fetchOperational(filters?: PerformanceFilters): Promise<OperationalItem[]> {
  const qs = buildQueryString(filters);
  return fetchWithAuth<OperationalItem[]>(`${BASE_URL}/operational${qs}`);
}

/**
 * Busca dados detalhados para grid.
 */
export async function fetchDetails(
  filters?: PerformanceFilters,
  limit: number = 100,
  offset: number = 0
): Promise<DetailsResponse> {
  const qs = buildQueryString(filters, { limit, offset });
  return fetchWithAuth<DetailsResponse>(`${BASE_URL}/details${qs}`);
}
