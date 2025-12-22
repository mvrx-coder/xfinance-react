/**
 * Funções de cálculo financeiro.
 * 
 * Migradas do xFinance original (Python/Dash).
 * Centraliza toda lógica de cálculo de:
 * - KPIs
 * - Totais
 * - Percentuais
 */

import type { Inspection, KPIs } from "@shared/schema";

// =============================================================================
// KPIs
// =============================================================================

/**
 * Calcula KPIs a partir de uma lista de inspeções.
 */
export function calculateKPIs(inspections: Inspection[]): KPIs {
  return inspections.reduce(
    (acc, insp) => ({
      express: acc.express + (insp.meta === 1 ? 1 : 0),
      honorarios: acc.honorarios + (insp.honorario ?? 0),
      guyHonorario: acc.guyHonorario + (insp.guyHonorario ?? 0),
      despesas: acc.despesas + (insp.despesa ?? 0),
      guyDespesa: acc.guyDespesa + (insp.guyDespesa ?? 0),
    }),
    {
      express: 0,
      honorarios: 0,
      guyHonorario: 0,
      despesas: 0,
      guyDespesa: 0,
    }
  );
}

/**
 * Calcula resultado operacional (honorários - despesas).
 */
export function calculateResultadoOperacional(kpis: KPIs): number {
  return kpis.honorarios - kpis.despesas;
}

/**
 * Calcula resultado do colaborador (guyHonorario - guyDespesa).
 */
export function calculateResultadoGuy(kpis: KPIs): number {
  return kpis.guyHonorario - kpis.guyDespesa;
}

/**
 * Calcula margem operacional (resultado / honorários).
 */
export function calculateMargemOperacional(kpis: KPIs): number {
  if (kpis.honorarios === 0) return 0;
  return ((kpis.honorarios - kpis.despesas) / kpis.honorarios) * 100;
}

// =============================================================================
// FILTROS
// =============================================================================

/**
 * Filtra inspeções pelo Player (contratante) do usuário logado.
 */
export function filterByPlayer(
  inspections: Inspection[],
  userPlayerId: number
): Inspection[] {
  return inspections.filter((insp) => insp.idContr === userPlayerId);
}

/**
 * Filtra inspeções do "MyJob" (onde o usuário é o Guy).
 */
export function filterByMyJob(
  inspections: Inspection[],
  userId: number
): Inspection[] {
  return inspections.filter((insp) => insp.idUserGuy === userId);
}

/**
 * Aplica limite de registros (DB Limit).
 */
export function applyDbLimit(
  inspections: Inspection[],
  limit: number = 500
): Inspection[] {
  return inspections.slice(0, limit);
}

// =============================================================================
// AGRUPAMENTOS
// =============================================================================

export interface GroupedByPlayer {
  player: string;
  idContr: number;
  count: number;
  honorarios: number;
  despesas: number;
  resultado: number;
}

/**
 * Agrupa inspeções por Player (contratante).
 */
export function groupByPlayer(
  inspections: Inspection[],
  contratantesMap: Map<number, string>
): GroupedByPlayer[] {
  const groups = new Map<number, GroupedByPlayer>();

  for (const insp of inspections) {
    const idContr = insp.idContr ?? 0;
    const existing = groups.get(idContr);

    if (existing) {
      existing.count++;
      existing.honorarios += insp.honorario ?? 0;
      existing.despesas += insp.despesa ?? 0;
      existing.resultado = existing.honorarios - existing.despesas;
    } else {
      groups.set(idContr, {
        player: contratantesMap.get(idContr) ?? "Desconhecido",
        idContr,
        count: 1,
        honorarios: insp.honorario ?? 0,
        despesas: insp.despesa ?? 0,
        resultado: (insp.honorario ?? 0) - (insp.despesa ?? 0),
      });
    }
  }

  return Array.from(groups.values()).sort((a, b) => b.honorarios - a.honorarios);
}

// =============================================================================
// VALIDAÇÕES
// =============================================================================

/**
 * Verifica se uma inspeção está completa (todos os campos obrigatórios).
 */
export function isInspectionComplete(inspection: Inspection): boolean {
  return !!(
    inspection.idContr &&
    inspection.idSegur &&
    inspection.idAtivi &&
    inspection.idUserGuy &&
    inspection.dtInspecao
  );
}

/**
 * Verifica se uma inspeção está paga.
 */
export function isInspectionPaid(inspection: Inspection): boolean {
  return !!inspection.dtPago;
}

/**
 * Verifica se uma inspeção está atrasada (prazo ultrapassado sem entrega).
 */
export function isInspectionOverdue(inspection: Inspection): boolean {
  if (!inspection.prazo || inspection.dtEntregue) return false;
  
  // Lógica simplificada - em produção, comparar com data atual
  return inspection.prazo < 0;
}

