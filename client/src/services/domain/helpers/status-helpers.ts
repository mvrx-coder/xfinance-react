/**
 * Helpers para status e indicadores visuais
 * 
 * Funções utilitárias para determinar cores e gradientes
 * baseados em status de inspeções.
 */

/**
 * Retorna classes CSS para colorir status baseado em valor.
 * 
 * @param status - Status (número ou string)
 * @returns Classes CSS do Tailwind
 */
export function getStatusColor(status: number | string | null | undefined): string {
  if (status === null || status === undefined) {
    return "bg-muted/50 text-muted-foreground border-muted";
  }
  
  if (typeof status === "number") {
    return status === 1
      ? "bg-success/15 text-success border-success/30"
      : "bg-destructive/15 text-destructive border-destructive/30";
  }
  
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "sim" || lowerStatus === "ok" || lowerStatus === "pago") {
    return "bg-success/15 text-success border-success/30";
  }
  if (lowerStatus === "não" || lowerStatus === "nao" || lowerStatus === "pendente") {
    return "bg-destructive/15 text-destructive border-destructive/30";
  }
  return "bg-warning/15 text-warning border-warning/30";
}

/**
 * Retorna classes CSS de gradiente baseado em status.
 * 
 * @param status - Status (número ou string)
 * @returns Classes CSS de gradiente
 */
export function getStatusGradient(status: number | string | null | undefined): string {
  if (status === null || status === undefined) {
    return "from-muted/20 to-transparent";
  }
  
  if (typeof status === "number") {
    return status === 1
      ? "from-success/10 to-transparent"
      : "from-destructive/10 to-transparent";
  }
  
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "sim" || lowerStatus === "ok" || lowerStatus === "pago") {
    return "from-success/10 to-transparent";
  }
  if (lowerStatus === "não" || lowerStatus === "nao" || lowerStatus === "pendente") {
    return "from-destructive/10 to-transparent";
  }
  return "from-warning/10 to-transparent";
}

/**
 * Verifica se um valor de data está preenchido.
 * 
 * @param v - Valor da data
 * @returns true se preenchido
 */
export function isFilled(v: string | null | undefined): boolean {
  const s = (v || "").trim();
  return s !== "" && s !== "-";
}
