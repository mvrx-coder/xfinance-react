import type { 
  EncaminharInput, 
  MarcadorInput, 
  ExcluirInput, 
  AcaoResult,
  UserOption,
  MarkerOption,
  MarkerLevelOption,
  LocaisResponse,
} from "@/types/acoes";

// Usar URL relativa - o Vite proxy redireciona para o backend
const BASE_URL = "";

export async function encaminhar(input: EncaminharInput): Promise<AcaoResult> {
  const response = await fetch(`${BASE_URL}/api/acoes/encaminhar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return { success: false, message: error.detail || "Erro ao encaminhar inspeções" };
  }
  
  return await response.json();
}

export async function marcar(input: MarcadorInput): Promise<AcaoResult> {
  const response = await fetch(`${BASE_URL}/api/acoes/marcar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return { success: false, message: error.detail || "Erro ao aplicar marcador" };
  }
  
  return await response.json();
}

export async function excluir(input: ExcluirInput): Promise<AcaoResult> {
  const response = await fetch(`${BASE_URL}/api/acoes/excluir`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return { success: false, message: error.detail || "Erro ao excluir inspeções" };
  }
  
  return await response.json();
}

export async function limparFiltros(): Promise<{ success: boolean }> {
  // Limpar filtros é feito localmente no frontend por enquanto
  return { success: true };
}

export async function fetchUsersOptions(): Promise<UserOption[]> {
  const response = await fetch(`${BASE_URL}/api/lookups/users`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  
  return await response.json();
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

export async function fetchLocaisInspecao(idPrinc: number): Promise<LocaisResponse> {
  const response = await fetch(`${BASE_URL}/api/inspections/${idPrinc}/locais`, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Falha ao buscar locais da inspeção");
  }
  
  return await response.json();
}
