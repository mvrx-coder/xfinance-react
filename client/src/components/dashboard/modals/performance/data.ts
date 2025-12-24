/**
 * Constantes e tipos para Performance Modal.
 * 
 * Este arquivo contém APENAS:
 * - Tipos TypeScript
 * - Constantes visuais (cores, animações)
 * - Funções de formatação
 * 
 * ⚠️ MOCK DATA REMOVIDO - Dados vêm da API via usePerformance hook
 */

import { PieChart, LineChart, BarChart3, Wallet } from "lucide-react";

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
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value == null) return "0";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formata número como moeda (com símbolo R$).
 * Ex: 5851040 → "R$ 5.851.040"
 */
export function formatCurrencyFull(value: number | undefined | null): string {
  if (value == null) return "R$ 0";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formata data DD/MM.
 */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const parts = dateStr.split("-");
    if (parts.length >= 3) {
      return `${parts[2].substring(0, 2)}/${parts[1]}`;
    }
    return dateStr;
  } catch {
    return dateStr || "-";
  }
}
