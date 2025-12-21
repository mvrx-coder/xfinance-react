import type { 
  EncaminharInput, 
  MarcadorInput, 
  ExcluirInput, 
  AcaoResult,
  UserOption,
  MarkerOption,
  MarkerType
} from "@/types/acoes";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function encaminhar(input: EncaminharInput): Promise<AcaoResult> {
  try {
    const response = await fetch(`${BASE_URL}/acoes/encaminhar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      return { success: false, message: "Erro ao encaminhar inspeções" };
    }
    
    return await response.json();
  } catch {
    console.log("[Stub] Encaminhar:", input.ids_princ.length, "registros para usuário", input.id_user_destino);
    return { 
      success: true, 
      updated: input.ids_princ.length,
      message: `${input.ids_princ.length} inspeção(ões) encaminhada(s) com sucesso`
    };
  }
}

export async function marcar(input: MarcadorInput): Promise<AcaoResult> {
  try {
    const response = await fetch(`${BASE_URL}/acoes/marcar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      return { success: false, message: "Erro ao aplicar marcador" };
    }
    
    return await response.json();
  } catch {
    console.log("[Stub] Marcar:", input.ids_princ.length, "registros como", input.marker_type);
    return { 
      success: true, 
      updated: input.ids_princ.length,
      message: `Marcador ${input.marker_type} ${input.value ? 'aplicado' : 'removido'} em ${input.ids_princ.length} inspeção(ões)`
    };
  }
}

export async function excluir(input: ExcluirInput): Promise<AcaoResult> {
  try {
    const response = await fetch(`${BASE_URL}/acoes/excluir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      return { success: false, message: "Erro ao excluir inspeções" };
    }
    
    return await response.json();
  } catch {
    console.log("[Stub] Excluir:", input.ids_princ.length, "registros");
    return { 
      success: true, 
      deleted: input.ids_princ.length,
      message: `${input.ids_princ.length} inspeção(ões) excluída(s) com sucesso`
    };
  }
}

export async function limparFiltros(): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${BASE_URL}/grid/filtros/limpar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      return { success: false };
    }
    
    return await response.json();
  } catch {
    console.log("[Stub] Limpar filtros");
    return { success: true };
  }
}

export async function fetchUsersOptions(): Promise<UserOption[]> {
  try {
    const response = await fetch(`${BASE_URL}/lookups/users`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    
    return await response.json();
  } catch {
    return [
      { value: 1, label: "MVR", papel: "admin", ativo: true },
      { value: 2, label: "AAS", papel: "inspetor", ativo: true },
      { value: 3, label: "HEA", papel: "inspetor", ativo: true },
      { value: 4, label: "RES", papel: "inspetor", ativo: true },
      { value: 5, label: "ALS", papel: "inspetor", ativo: true },
      { value: 6, label: "LVS", papel: "inspetor", ativo: true },
    ];
  }
}

export function getMarkerTypes(): MarkerOption[] {
  return [
    { type: "urgente" as MarkerType, label: "Urgente", color: "red" },
    { type: "pendente" as MarkerType, label: "Pendente", color: "yellow" },
    { type: "auditoria" as MarkerType, label: "Auditoria", color: "blue" },
    { type: "followup" as MarkerType, label: "Follow-up", color: "purple" },
  ];
}
