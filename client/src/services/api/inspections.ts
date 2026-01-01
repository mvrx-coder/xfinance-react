/**
 * Serviço de Inspeções - xFinance
 * 
 * Integração com backend FastAPI
 * 
 * FIX v3.0.1: Datas mantidas em ISO para cálculos corretos de status
 */

import type { Inspection } from "@shared/schema";
import { formatDateShort } from "@/services/domain/formatters";

// =============================================================================
// TIPOS
// =============================================================================

// Tipo do backend (snake_case)
interface InspectionRaw {
  id_princ: number;
  id_contr?: string;      // Player (texto do JOIN)
  id_segur?: string;      // Segurado (texto do JOIN)
  loc?: number;
  id_user_guilty?: string; // Guilty (texto do JOIN)
  id_user_guy?: string;    // Guy (texto do JOIN)
  meta?: number;
  dt_inspecao?: string;
  dt_entregue?: string;
  prazo?: number;
  dt_acerto?: string;
  dt_envio?: string;
  dt_pago?: string;
  honorario?: number;
  dt_denvio?: string;
  dt_dpago?: string;
  despesa?: number;
  dt_guy_pago?: string;
  guy_honorario?: number;
  dt_guy_dpago?: string;
  guy_despesa?: number;
  id_ativi?: string;        // Atividade (texto do JOIN)
  obs?: string;
  // Marcadores de alerta (do tempstate)
  state_loc?: number;       // 0-3
  state_dt_envio?: number;  // 0-3
  state_dt_denvio?: number; // 0-3
  state_dt_pago?: number;   // 0-3
  // Status calculados (para cores condicionais)
  dt_guy_pago__status?: string;   // "past", "today", ""
  dt_guy_dpago__status?: string;  // "past", "today", ""
  dt_dpago__status?: string;      // "past", "today", ""
  delivery_status?: string;       // "highlight", ""
}

interface InspectionsResponseRaw {
  data: InspectionRaw[];
  total: number;
  columns: string[];
  papel: string;
}

export interface InspectionsResponse {
  data: Inspection[];
  total: number;
  columns: string[];
  papel: string;
}

// =============================================================================
// FORMATAÇÃO DE DADOS
// =============================================================================

/**
 * Formata data para DD/MM (padrão do grid xFinance)
 * Fonte: x_main/utils.py linha 100
 * 
 * @deprecated Use formatDateShort from @/services/domain/formatters
 */
function formatDateDDMM(dateStr: string | null | undefined): string {
  return formatDateShort(dateStr);
}

/**
 * Converte dados do backend (snake_case) para frontend (camelCase)
 * 
 * IMPORTANTE: Os campos id_contr, id_segur, id_user_guilty, id_user_guy
 * já vêm como TEXTO do JOIN (player, segurado, nick), não são IDs numéricos!
 * 
 * NOTA: Datas mantidas em formato ISO (YYYY-MM-DD) para cálculos corretos.
 * A formatação DD/MM é feita apenas na exibição (DataGrid.tsx).
 */
function convertToFrontend(raw: InspectionRaw): Inspection {
  return {
    idPrinc: raw.id_princ,
    idContr: null, // ID numérico não usado no grid
    idSegur: null, // ID numérico não usado no grid
    loc: raw.loc,
    idUserGuilty: null,
    idUserGuy: null,
    meta: raw.meta,
    // Datas mantidas em formato ISO (YYYY-MM-DD) para cálculos de status
    // A formatação DD/MM é feita no DataGrid.tsx via formatDate()
    dtInspecao: raw.dt_inspecao || "",
    dtEntregue: raw.dt_entregue || "",
    prazo: raw.prazo,
    dtAcerto: raw.dt_acerto || "",
    dtEnvio: raw.dt_envio || "",
    dtPago: raw.dt_pago || "",
    honorario: raw.honorario,
    dtDenvio: raw.dt_denvio || "",
    dtDpago: raw.dt_dpago || "",
    despesa: raw.despesa,
    dtGuyPago: raw.dt_guy_pago || "",
    guyHonorario: raw.guy_honorario,
    dtGuyDpago: raw.dt_guy_dpago || "",
    guyDespesa: raw.guy_despesa,
    atividade: raw.id_ativi || "",
    obs: raw.obs || "",
    // Campos de exibição (do JOIN - já são texto!)
    player: raw.id_contr || "",
    segurado: raw.id_segur || "",
    guilty: raw.id_user_guilty || "",
    guy: raw.id_user_guy || "",
    // Marcadores de alerta (do tempstate) - valores 0-3
    stateLoc: raw.state_loc ?? 0,
    stateDtEnvio: raw.state_dt_envio ?? 0,
    stateDtDenvio: raw.state_dt_denvio ?? 0,
    stateDtPago: raw.state_dt_pago ?? 0,
    // Status calculados (para cores condicionais)
    dtGuyPagoStatus: raw.dt_guy_pago__status ?? "",
    dtGuyDpagoStatus: raw.dt_guy_dpago__status ?? "",
    dtDpagoStatus: raw.dt_dpago__status ?? "",
    deliveryStatus: raw.delivery_status ?? "",
  } as Inspection;
}

export type OrderMode = "normal" | "player" | "prazo";

// Opções de filtro para a query
export interface FetchOptions {
  order?: OrderMode;
  limit?: number;
  myJob?: boolean;  // Filtrar apenas registros do usuário logado
}

// =============================================================================
// API BASE URL
// =============================================================================

// Usar URL relativa - o Vite proxy redireciona para o backend
const API_BASE = "";

// =============================================================================
// FUNÇÕES
// =============================================================================

/**
 * Busca inspeções do backend.
 * 
 * @param options Opções de filtro e ordenação
 * @returns Lista de inspeções com metadados
 */
export async function fetchInspections(
  options: FetchOptions = {}
): Promise<InspectionsResponse> {
  const { order = "normal", limit, myJob } = options;
  
  const params = new URLSearchParams();
  params.set("order", order);
  
  if (limit) {
    params.set("limit", limit.toString());
  }
  
  if (myJob) {
    params.set("my_job", "true");
  }
  
  const response = await fetch(
    `${API_BASE}/api/inspections?${params.toString()}`,
    { credentials: "include" }
  );
  
  if (response.status === 401) {
    throw new Error("Não autenticado");
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Erro ao buscar inspeções");
  }
  
  const raw: InspectionsResponseRaw = await response.json();
  
  // Converter dados para formato do frontend
  return {
    data: raw.data.map(convertToFrontend),
    total: raw.total,
    columns: raw.columns,
    papel: raw.papel,
  };
}

/**
 * Busca uma inspeção específica.
 */
export async function fetchInspection(idPrinc: number): Promise<Inspection> {
  const response = await fetch(
    `${API_BASE}/api/inspections/${idPrinc}`,
    { credentials: "include" }
  );
  
  if (!response.ok) {
    throw new Error("Erro ao buscar inspeção");
  }
  
  return response.json();
}

/**
 * Atualiza um campo de uma inspeção (edição inline).
 */
export interface UpdateFieldResult {
  success: boolean;
  message: string;
  id_princ: number;
  field: string;
  new_value: unknown;
}

export async function updateInspectionField(
  idPrinc: number,
  field: string,
  value: unknown
): Promise<UpdateFieldResult> {
  const response = await fetch(
    `${API_BASE}/api/inspections/${idPrinc}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ field, value }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Erro ao atualizar campo");
  }
  
  return response.json();
}

