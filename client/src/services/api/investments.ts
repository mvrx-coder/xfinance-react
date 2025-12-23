/**
 * Serviço de Investimentos/Aportes - xFinance
 * 
 * Integração com endpoints de investments do backend FastAPI.
 * 
 * 🔒 SIGILO: Apenas admin tem acesso a estes dados.
 */

// =============================================================================
// TIPOS
// =============================================================================

export interface InvestmentFilters {
  investidor?: string;
  instituicao?: string;
  tipo?: string;
  dtIni?: string;
  dtFim?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FiltersResponse {
  investidores: FilterOption[];
  instituicoes: FilterOption[];
  tipos: FilterOption[];
}

export interface KPIsResponse {
  patrimonio_total: number;
  valor_aplicado: number;
  resultado: number;
  rentabilidade_pct: number;
}

export interface HighlightItem {
  nome: string;
  valor: number;
}

export interface HighlightsResponse {
  winner: HighlightItem;
  loser: HighlightItem;
  maior_posicao: HighlightItem;
}

export interface AllocationItem {
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface InvestmentItem {
  id_finan: number;
  investidor: string;
  instituicao: string;
  tipo: string;
  detalhe: string;
  v_aplicado: number;
  v_bruto: number;
  v_liquido: number;
  ganho_perda: number;
  resgate_bruto: number;
  rentabilidade: number;
  dt_aplicacao: string;
  dt_vence: string;
  ir_iof: number;
}

export interface InvestmentsResponse {
  data: InvestmentItem[];
  total: number;
}

// =============================================================================
// ENDPOINTS
// =============================================================================

const BASE_URL = "/api/investments";

// =============================================================================
// HELPERS
// =============================================================================

function buildQueryString(filters?: InvestmentFilters, extra?: Record<string, string>): string {
  const params = new URLSearchParams();
  
  if (filters?.investidor) params.append("investidor", filters.investidor);
  if (filters?.instituicao) params.append("instituicao", filters.instituicao);
  if (filters?.tipo) params.append("tipo", filters.tipo);
  if (filters?.dtIni) params.append("dt_ini", filters.dtIni);
  if (filters?.dtFim) params.append("dt_fim", filters.dtFim);
  
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      params.append(key, value);
    });
  }
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

async function fetchWithAuth<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
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
 * Busca opções de filtros disponíveis.
 */
export async function fetchInvestmentFilters(): Promise<FiltersResponse> {
  return fetchWithAuth<FiltersResponse>(`${BASE_URL}/filters`);
}

/**
 * Busca KPIs agregados da carteira.
 */
export async function fetchInvestmentKPIs(filters?: InvestmentFilters): Promise<KPIsResponse> {
  const qs = buildQueryString(filters);
  return fetchWithAuth<KPIsResponse>(`${BASE_URL}/kpis${qs}`);
}

/**
 * Busca destaques da carteira.
 */
export async function fetchInvestmentHighlights(filters?: InvestmentFilters): Promise<HighlightsResponse> {
  const qs = buildQueryString(filters);
  return fetchWithAuth<HighlightsResponse>(`${BASE_URL}/highlights${qs}`);
}

/**
 * Busca dados de alocação para gráfico.
 */
export async function fetchInvestmentAllocation(
  groupBy: "tipo" | "investidor" | "instituicao" = "tipo",
  filters?: InvestmentFilters
): Promise<AllocationItem[]> {
  const qs = buildQueryString(filters, { group_by: groupBy });
  return fetchWithAuth<AllocationItem[]>(`${BASE_URL}/allocation${qs}`);
}

/**
 * Busca lista completa de investimentos.
 */
export async function fetchInvestments(filters?: InvestmentFilters): Promise<InvestmentsResponse> {
  const qs = buildQueryString(filters);
  return fetchWithAuth<InvestmentsResponse>(`${BASE_URL}${qs}`);
}

/**
 * Remove um investimento.
 */
export async function deleteInvestment(idFinan: number): Promise<{ success: boolean; message: string }> {
  return fetchWithAuth(`${BASE_URL}/${idFinan}`, {
    method: "DELETE",
  });
}
