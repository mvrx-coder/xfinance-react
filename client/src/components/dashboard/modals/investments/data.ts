/**
 * Constantes e utilitários para modal de Investimentos.
 * 
 * Tipos são importados de @/hooks.
 * Dados reais vêm da API via hooks.
 */

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

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  
  // Se já está no formato DD/MM/YY ou DD/MM/YYYY
  if (dateStr.includes("/")) return dateStr;
  
  // Se está no formato YYYY-MM-DD
  try {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year.slice(-2)}`;
  } catch {
    return dateStr;
  }
}
