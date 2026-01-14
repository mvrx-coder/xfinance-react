/**
 * Constantes e utilitários para modal de Investimentos.
 * 
 * Tipos são importados de @/hooks.
 * Dados reais vêm da API via hooks.
 */

export interface AllocationItem {
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// Usado apenas para tipagem (os dados reais vêm da API)
export const mockAllocations: AllocationItem[] = [];

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
// FORMATADORES
// =============================================================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyShort(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formata data DD/MM/AA.
 * Re-exporta função centralizada para manter compatibilidade.
 */
export { formatDateWithYear as formatDate } from "@/services/domain/formatters";
