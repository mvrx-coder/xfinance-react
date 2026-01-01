/**
 * Constantes e tipos para Performance Modal.
 * 
 * Este arquivo contém APENAS:
 * - Tipos TypeScript
 * - Constantes visuais (cores, animações)
 * 
 * ⚠️ MOCK DATA REMOVIDO - Dados vêm da API via usePerformance hook
 * ⚠️ FORMATTERS MOVIDOS - Usar @/services/domain/formatters
 */

import { PieChart, LineChart, BarChart3, Wallet } from "lucide-react";
import {
  formatCurrency as formatCurrencyBase,
  formatNumber,
  formatDateShort as formatDateShortBase,
} from "@/services/domain/formatters";

// =============================================================================
// TIPOS
// =============================================================================

export type TabType = "market" | "business" | "operational" | "expenses";

export interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ElementType;
}

// =============================================================================
// CONSTANTES VISUAIS
// =============================================================================

export const tabs: TabConfig[] = [
  { id: "market", label: "Market Share", icon: PieChart },
  { id: "business", label: "Business", icon: LineChart },
  { id: "operational", label: "Operational", icon: BarChart3 },
  { id: "expenses", label: "Operational Expenses", icon: Wallet },
];

/** Cores por ano para gráficos (consistência visual) */
export const yearColors: Record<number, string> = {
  2020: "#94A3B8",
  2021: "#F97316",
  2022: "#00BCD4", 
  2023: "#22C55E",
  2024: "#EAB308",
  2025: "#CE62D9",
  2026: "#8B5CF6",
};

// =============================================================================
// ANIMAÇÕES (Framer Motion)
// =============================================================================

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// =============================================================================
// FORMATADORES
// =============================================================================

/**
 * Formata número como moeda (sem símbolo R$).
 * Ex: 5851040 → "5.851.040"
 * 
 * @deprecated Use formatNumber from @/services/domain/formatters
 */
export function formatCurrency(value: number | undefined | null): string {
  return formatNumber(value ?? 0, 0);
}

/**
 * Formata número como moeda (com símbolo R$).
 * Ex: 5851040 → "R$ 5.851.040"
 * 
 * @deprecated Use formatCurrency from @/services/domain/formatters
 */
export function formatCurrencyFull(value: number | undefined | null): string {
  return formatCurrencyBase(value);
}

/**
 * Formata data DD/MM.
 * 
 * @deprecated Use formatDateShort from @/services/domain/formatters
 */
export function formatDateShort(dateStr: string | null | undefined): string {
  return formatDateShortBase(dateStr);
}
