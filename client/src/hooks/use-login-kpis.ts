/**
 * Hook para buscar KPIs dinâmicos da tela de login
 * 
 * Endpoint público (sem autenticação).
 */

import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface LoginKPIs {
  // Volume 12 meses
  total_inspecoes_12m: number;
  total_loc_12m: number;
  
  // Mês recorde
  mes_recorde: string;
  recorde_qtd: number;
  
  // Mês atual
  mes_atual: string;
  inspecoes_mes_atual: number;
  loc_mes_atual: number;
  
  // Prazos (em dias)
  prazo_medio_12m: number | null;
  prazo_medio_mes_atual: number | null;
}

async function fetchLoginKpis(): Promise<LoginKPIs> {
  const response = await fetch(`${API_BASE}/api/public/login-kpis`);
  
  if (!response.ok) {
    throw new Error("Erro ao buscar KPIs");
  }
  
  return response.json();
}

export function useLoginKpis() {
  return useQuery({
    queryKey: ["login-kpis"],
    queryFn: fetchLoginKpis,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
