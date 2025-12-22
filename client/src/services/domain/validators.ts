/**
 * Funções de validação de dados.
 * 
 * Validações de negócio para:
 * - Formulários
 * - Dados de entrada
 * - Regras de negócio
 */

// =============================================================================
// EMAIL
// =============================================================================

/**
 * Valida formato de email.
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// =============================================================================
// SENHA
// =============================================================================

/**
 * Valida requisitos de senha.
 * - Mínimo 8 caracteres
 * - Pelo menos uma letra
 * - Pelo menos um número
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

/**
 * Retorna mensagem de erro para senha inválida.
 */
export function getPasswordError(password: string): string | null {
  if (!password) return "Senha obrigatória";
  if (password.length < 8) return "Mínimo 8 caracteres";
  if (!/[a-zA-Z]/.test(password)) return "Deve conter letras";
  if (!/[0-9]/.test(password)) return "Deve conter números";
  return null;
}

// =============================================================================
// VALORES MONETÁRIOS
// =============================================================================

/**
 * Valida se valor monetário é válido.
 */
export function isValidMoneyValue(value: number | null | undefined): boolean {
  if (value == null) return true; // Opcional
  return value >= 0 && isFinite(value);
}

/**
 * Valida se valor está dentro de um range.
 */
export function isInRange(
  value: number,
  min: number,
  max: number
): boolean {
  return value >= min && value <= max;
}

// =============================================================================
// DATAS
// =============================================================================

/**
 * Valida se data está no formato DD/MM ou DD/MM/YYYY.
 */
export function isValidDateFormat(dateStr: string): boolean {
  const shortFormat = /^\d{2}\/\d{2}$/;
  const fullFormat = /^\d{2}\/\d{2}\/\d{4}$/;
  return shortFormat.test(dateStr) || fullFormat.test(dateStr);
}

/**
 * Valida se data não está no futuro.
 */
export function isNotFutureDate(date: Date): boolean {
  return date <= new Date();
}

// =============================================================================
// FORMULÁRIO DE INSPEÇÃO
// =============================================================================

export interface InspectionFormErrors {
  idContr?: string;
  idSegur?: string;
  idAtivi?: string;
  idUserGuy?: string;
  idUf?: string;
  dtInspecao?: string;
  honorario?: string;
}

/**
 * Valida formulário de nova inspeção.
 */
export function validateNewInspectionForm(data: {
  idContr?: number;
  idSegur?: number;
  idAtivi?: number;
  idUserGuy?: number;
  idUf?: number;
  dtInspecao?: Date;
  honorario?: number;
}): InspectionFormErrors {
  const errors: InspectionFormErrors = {};

  if (!data.idContr || data.idContr <= 0) {
    errors.idContr = "Player obrigatório";
  }

  if (!data.idSegur || data.idSegur <= 0) {
    errors.idSegur = "Segurado obrigatório";
  }

  if (!data.idAtivi || data.idAtivi <= 0) {
    errors.idAtivi = "Atividade obrigatória";
  }

  if (!data.idUserGuy || data.idUserGuy <= 0) {
    errors.idUserGuy = "Inspetor obrigatório";
  }

  if (!data.idUf || data.idUf <= 0) {
    errors.idUf = "UF obrigatória";
  }

  if (data.honorario != null && data.honorario < 0) {
    errors.honorario = "Honorário não pode ser negativo";
  }

  return errors;
}

/**
 * Verifica se formulário tem erros.
 */
export function hasFormErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some((error) => error != null);
}

