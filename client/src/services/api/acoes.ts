import { apiFetch } from "@/lib/queryClient";
import type { 
  EncaminharInput, 
  MarcadorInput, 
  ExcluirInput, 
  AcaoResult,
  UserOption,
  MarkerOption,
  MarkerLevelOption,
} from "@/types/acoes";

// Usar URL relativa - o Vite proxy redireciona para o backend
const BASE_URL = "";

export async function encaminhar(input: EncaminharInput): Promise<AcaoResult> {
  try {
    return await apiFetch<AcaoResult>(`${BASE_URL}/api/acoes/encaminhar`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao encaminhar inspeções" 
    };
  }
}

export async function marcar(input: MarcadorInput): Promise<AcaoResult> {
  try {
    return await apiFetch<AcaoResult>(`${BASE_URL}/api/acoes/marcar`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao aplicar marcador" 
    };
  }
}

export async function excluir(input: ExcluirInput): Promise<AcaoResult> {
  try {
    return await apiFetch<AcaoResult>(`${BASE_URL}/api/acoes/excluir`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Erro ao excluir inspeções" 
    };
  }
}

export async function limparFiltros(): Promise<{ success: boolean }> {
  // Limpar filtros é feito localmente no frontend por enquanto
  return { success: true };
}

export async function fetchUsersOptions(): Promise<UserOption[]> {
  return apiFetch<UserOption[]>(`${BASE_URL}/api/lookups/users`);
}

export function getMarkerTypes(): MarkerOption[] {
  return [
    { type: "state_loc", label: "LOC", field: "Localização" },
    { type: "state_dt_envio", label: "Envio", field: "Data de Envio" },
    { type: "state_dt_denvio", label: "D.Envio", field: "Data D.Envio" },
    { type: "state_dt_pago", label: "Pago", field: "Data Pago" },
  ];
}

export function getMarkerLevels(): MarkerLevelOption[] {
  return [
    { level: 0, label: "Sem marcador", color: "gray" },
    { level: 1, label: "Azul", color: "blue" },
    { level: 2, label: "Amarelo", color: "yellow" },
    { level: 3, label: "Vermelho", color: "red" },
  ];
}
