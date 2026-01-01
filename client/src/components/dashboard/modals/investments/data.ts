/**
 * Constantes e utilitários para modal de Investimentos.
 * 
 * Tipos são importados de @/hooks.
 * Dados reais vêm da API via hooks.
 * 
 * ⚠️ FORMATTERS MOVIDOS - Usar @/services/domain/formatters
 */

import {
  formatCurrency as formatCurrencyBase,
  formatNumber,
  formatDateShort,
} from "@/services/domain/formatters";

// =============================================================================
// ANIMATION VARIANTS (Framer Motion)
// =============================================================================

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// =============================================================================
// FORMATADORES (Wrappers para compatibilidade)
// =============================================================================

/**
 * @deprecated Use formatNumber from @/services/domain/formatters
 */
export function formatCurrency(value: number): string {
  return formatNumber(value, 2);
}

/**
 * @deprecated Use formatCurrency from @/services/domain/formatters
 */
export function formatCurrencyShort(value: number): string {
  return formatCurrencyBase(value);
}

/**
 * @deprecated Use formatDateShort from @/services/domain/formatters
 */
export function formatDate(dateStr: string | null | undefined): string {
  return formatDateShort(dateStr);
}
