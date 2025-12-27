/**
 * Regras de Alerta para Células do Grid
 * Dots pulsantes: warning (amber), danger (red), success (green)
 */

export type AlertLevel = "none" | "warning" | "danger" | "success";

function isDateFilled(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed !== "" && trimmed !== "-";
}

/**
 * Calcula quantos dias se passaram desde a data informada até hoje
 * Retorna número positivo se a data já passou, 0 ou negativo se ainda não chegou
 * Suporta formatos: YYYY-MM-DD (ISO), DD/MM, DD/MM/AA
 */
function calcularDiasDesde(dateStr: string | null | undefined): number {
  if (!isDateFilled(dateStr)) return 0;
  
  try {
    let dateObj: Date;
    const s = dateStr!.trim();
    
    // Formato ISO: YYYY-MM-DD (do backend)
    if (s.includes("-") && s.length >= 10) {
      const [yearStr, monthStr, dayStr] = s.split("-");
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const day = parseInt(dayStr, 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        dateObj = new Date(year, month, day);
      } else {
        return 0;
      }
    }
    // Formato DD/MM ou DD/MM/AA
    else if (s.includes("/")) {
      const parts = s.split("/").map(Number);
      const dia = parts[0];
      const mes = parts[1] - 1; // JS months são 0-indexed
      const hoje = new Date();
      
      let ano: number;
      if (parts.length > 2) {
        ano = parts[2] < 100 ? 2000 + parts[2] : parts[2];
      } else {
        ano = hoje.getFullYear();
        // Se a data parece ser do futuro (mais de 6 meses), assume ano anterior
        const testDate = new Date(ano, mes, dia);
        if (testDate > hoje && (testDate.getTime() - hoje.getTime()) > 180 * 24 * 60 * 60 * 1000) {
          ano = ano - 1;
        }
      }
      
      dateObj = new Date(ano, mes, dia);
    } else {
      // Tentar parse direto como fallback
      dateObj = new Date(s);
    }
    
    if (isNaN(dateObj.getTime())) return 0;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    
    const diffMs = hoje.getTime() - dateObj.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * 1. Inspeção: 
 * - Se entregue → none
 * - Se não tem data inspeção → none
 * - Atraso 1-14 dias → warning (laranja)
 * - Atraso > 14 dias → danger (vermelho)
 */
export function getInspecaoAlert(
  dtInspecao: string | null | undefined,
  dtEntregue: string | null | undefined
): AlertLevel {
  // Se já entregue, não precisa de alerta
  if (isDateFilled(dtEntregue)) return "none";
  
  // Se não tem data de inspeção, não há o que alertar
  if (!isDateFilled(dtInspecao)) return "none";
  
  const diasAtraso = calcularDiasDesde(dtInspecao);
  
  // Ainda não passou ou é hoje
  if (diasAtraso <= 0) return "none";
  
  // 1-14 dias de atraso
  if (diasAtraso >= 1 && diasAtraso <= 14) return "warning";
  
  // > 14 dias de atraso
  return "danger";
}

/**
 * 2. Acerto:
 * - honorário ≤ 1 ou null → none
 * - dtPago preenchido → none (sem indicação)
 * - dtEnvio preenchido E dtPago ❌:
 *   - < 15 dias → none
 *   - 15-29 dias → warning (laranja)
 *   - ≥ 30 dias → danger (vermelho)
 */
export function getAcertoAlert(
  dtEnvio: string | null | undefined,
  dtPago: string | null | undefined,
  honorario: number | null | undefined
): AlertLevel {
  // Sem honorário relevante
  if (honorario == null || honorario <= 1) return "none";
  
  // Já foi pago, sem indicação
  if (isDateFilled(dtPago)) return "none";
  
  // Não foi enviado ainda
  if (!isDateFilled(dtEnvio)) return "none";
  
  // Enviado mas não pago - calcular dias desde envio
  const diasDesdeEnvio = calcularDiasDesde(dtEnvio);
  
  if (diasDesdeEnvio < 15) return "none";
  if (diasDesdeEnvio >= 15 && diasDesdeEnvio <= 29) return "warning";
  return "danger"; // ≥ 30 dias
}

/**
 * 3. DEnvio:
 * - despesa ≤ 1 ou null → none
 * - dtDpago preenchido → none (sem indicação)
 * - dtDenvio preenchido E dtDpago ❌:
 *   - < 15 dias → none
 *   - 15-29 dias → warning (laranja)
 *   - ≥ 30 dias → danger (vermelho)
 */
export function getDEnvioAlert(
  dtDenvio: string | null | undefined,
  dtDpago: string | null | undefined,
  despesa: number | null | undefined
): AlertLevel {
  // Sem despesa relevante
  if (despesa == null || despesa <= 1) return "none";
  
  // Já foi pago, sem indicação
  if (isDateFilled(dtDpago)) return "none";
  
  // Não foi enviado ainda
  if (!isDateFilled(dtDenvio)) return "none";
  
  // Enviado mas não pago - calcular dias desde envio
  const diasDesdeEnvio = calcularDiasDesde(dtDenvio);
  
  if (diasDesdeEnvio < 15) return "none";
  if (diasDesdeEnvio >= 15 && diasDesdeEnvio <= 29) return "warning";
  return "danger"; // ≥ 30 dias
}

/**
 * 4. GPago:
 * - guyHonorario ≤ 1 ou null → none
 * - dtGuyPago preenchido → success (dot verde pulsante)
 * - dtEntregue preenchido E dtGuyPago ❌:
 *   - < 15 dias → none
 *   - 15-29 dias → warning (laranja)
 *   - ≥ 30 dias → danger (vermelho)
 */
export function getGPagoAlert(
  dtEntregue: string | null | undefined,
  dtGuyPago: string | null | undefined,
  guyHonorario: number | null | undefined
): AlertLevel {
  // Sem honorário do Guy relevante
  if (guyHonorario == null || guyHonorario <= 1) return "none";
  
  // Guy foi pago - mostrar dot verde
  if (isDateFilled(dtGuyPago)) return "success";
  
  // Não foi entregue ainda
  if (!isDateFilled(dtEntregue)) return "none";
  
  // Entregue mas Guy não pago - calcular dias desde entrega
  const diasDesdeEntrega = calcularDiasDesde(dtEntregue);
  
  if (diasDesdeEntrega < 15) return "none";
  if (diasDesdeEntrega >= 15 && diasDesdeEntrega <= 29) return "warning";
  return "danger"; // ≥ 30 dias
}

/**
 * 5. GDPago:
 * - guyDespesa ≤ 1 ou null → none
 * - dtGuyDpago preenchido → success (dot verde pulsante)
 * - dtEntregue preenchido E dtGuyDpago ❌:
 *   - < 15 dias → none
 *   - 15-29 dias → warning (laranja)
 *   - ≥ 30 dias → danger (vermelho)
 */
export function getGDPagoAlert(
  dtEntregue: string | null | undefined,
  dtGuyDpago: string | null | undefined,
  guyDespesa: number | null | undefined
): AlertLevel {
  // Sem despesa do Guy relevante
  if (guyDespesa == null || guyDespesa <= 1) return "none";
  
  // Despesa do Guy foi paga - mostrar dot verde
  if (isDateFilled(dtGuyDpago)) return "success";
  
  // Não foi entregue ainda
  if (!isDateFilled(dtEntregue)) return "none";
  
  // Entregue mas despesa Guy não paga - calcular dias desde entrega
  const diasDesdeEntrega = calcularDiasDesde(dtEntregue);
  
  if (diasDesdeEntrega < 15) return "none";
  if (diasDesdeEntrega >= 15 && diasDesdeEntrega <= 29) return "warning";
  return "danger"; // ≥ 30 dias
}
