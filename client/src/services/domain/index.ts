/**
 * Re-exports da camada de domínio.
 * 
 * Uso:
 * import { formatCurrency, calculateKPIs } from "@/services/domain";
 */

// Formatadores
export {
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatPercent,
  formatDateShort,
  formatDateFull,
  formatMeta,
  formatLoc,
} from "./formatters";

// Cálculos
export {
  calculateKPIs,
  calculateResultadoOperacional,
  calculateResultadoGuy,
  calculateMargemOperacional,
  filterByPlayer,
  filterByMyJob,
  applyDbLimit,
  groupByPlayer,
  isInspectionComplete,
  isInspectionPaid,
  isInspectionOverdue,
  type GroupedByPlayer,
} from "./calculations";

// Validadores
export {
  isValidEmail,
  isValidPassword,
  getPasswordError,
  isValidMoneyValue,
  isInRange,
  isValidDateFormat,
  isNotFutureDate,
  validateNewInspectionForm,
  hasFormErrors,
  type InspectionFormErrors,
} from "./validators";

