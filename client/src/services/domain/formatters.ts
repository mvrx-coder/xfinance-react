/**
 * Funções de formatação de valores.
 * 
 * Centraliza toda formatação de:
 * - Moeda (R$)
 * - Datas
 * - Números
 * - Percentuais
 */

import { FORMAT_CONFIG } from "@/constants";

// =============================================================================
// MOEDA
// =============================================================================

/**
 * Formata valor como moeda brasileira.
 * 
 * @param value - Valor numérico
 * @param options - Opções de formatação
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export function formatCurrency(
  value: number | null | undefined,
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  if (value == null) return "-";

  const {
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
  } = options ?? {};

  const formatted = new Intl.NumberFormat(FORMAT_CONFIG.LOCALE, {
    style: showSymbol ? "currency" : "decimal",
    currency: FORMAT_CONFIG.CURRENCY,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);

  return formatted;
}

/**
 * Formata valor de forma compacta (ex: "1.2M", "500K").
 */
export function formatCurrencyCompact(value: number | null | undefined): string {
  if (value == null) return "-";

  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(0)}K`;
  }
  return formatCurrency(value);
}

// =============================================================================
// NÚMEROS
// =============================================================================

/**
 * Formata número com separadores de milhar.
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value == null) return "-";

  return new Intl.NumberFormat(FORMAT_CONFIG.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formata percentual.
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value == null) return "-";

  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

// =============================================================================
// DATAS
// =============================================================================

/**
 * Formata data no padrão DD/MM.
 * @deprecated Use formatDateWithYear para evitar ambiguidade de ano
 */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  
  // Se já está no formato DD/MM, retorna como está
  if (/^\d{2}\/\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Se está no formato ISO ou outro, converte
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${day}/${month}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formata data no padrão DD/MM/AA (ano com 2 dígitos).
 * Formato preferido para evitar ambiguidade de ano durante edição.
 */
export function formatDateWithYear(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  
  // Se já está no formato DD/MM/AA ou DD/MM/AAAA, converte para DD/MM/AA
  const matchShortYear = /^(\d{2})\/(\d{2})\/(\d{2})$/.exec(dateStr);
  if (matchShortYear) {
    return dateStr;
  }
  
  const matchFullYear = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateStr);
  if (matchFullYear) {
    const [, day, month, year] = matchFullYear;
    return `${day}/${month}/${year.slice(-2)}`;
  }

  // Se está no formato ISO (YYYY-MM-DD), converte
  try {
    // Parse manual para evitar problemas de timezone
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parts[0].slice(-2); // Últimos 2 dígitos
      const month = parts[1];
      const day = parts[2].substring(0, 2); // Ignora hora se houver
      return `${day}/${month}/${year}`;
    }
    
    // Fallback para Date()
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formata data no padrão DD/MM/YYYY.
 */
export function formatDateFull(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

// =============================================================================
// STATUS / LABELS
// =============================================================================

/**
 * Retorna label para campo meta (Sim/Não).
 */
export function formatMeta(meta: number | null | undefined): string {
  if (meta === 1) return "Sim";
  if (meta === 0) return "Não";
  return "-";
}

/**
 * Formata número de local com padding.
 */
export function formatLoc(loc: number | null | undefined): string {
  if (loc == null) return "-";
  return loc.toString().padStart(2, "0");
}

