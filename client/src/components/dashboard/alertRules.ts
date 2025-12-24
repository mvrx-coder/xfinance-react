/**
 * Regras de Alerta para Células do Grid
 */

export type AlertLevel = "none" | "warning" | "danger" | "success";

function isDateFilled(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed !== "" && trimmed !== "-";
}

function calcularAtraso(dateStr: string | null | undefined): number {
  if (!isDateFilled(dateStr)) return 0;
  
  try {
    let dateObj: Date;
    
    if (dateStr!.includes("/") && dateStr!.length <= 5) {
      const [dia, mes] = dateStr!.split("/").map(Number);
      const hoje = new Date();
      const ano = hoje.getFullYear();
      dateObj = new Date(ano, mes - 1, dia);
      if (dateObj > hoje && mes > hoje.getMonth() + 1) {
        dateObj = new Date(ano - 1, mes - 1, dia);
      }
    } else {
      dateObj = new Date(dateStr!);
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

/** Inspeção: verde se entregue, laranja 1-14 dias, vermelho >14 dias */
export function getInspecaoAlert(
  dtInspecao: string | null | undefined,
  dtEntregue: string | null | undefined
): AlertLevel {
  if (isDateFilled(dtEntregue)) return "success";
  if (!isDateFilled(dtInspecao)) return "none";
  
  const atraso = calcularAtraso(dtInspecao);
  if (atraso <= 0) return "none";
  if (atraso >= 1 && atraso <= 14) return "warning";
  return "danger";
}

/** Acerto: verde se pago, vermelho se envio sem pago */
export function getAcertoAlert(
  dtEnvio: string | null | undefined,
  dtPago: string | null | undefined,
  honorario: number | null | undefined
): AlertLevel {
  if (honorario == null || honorario <= 1) return "none";
  if (isDateFilled(dtPago)) return "success";
  if (isDateFilled(dtEnvio)) return "danger";
  return "none";
}

/** DEnvio: verde se dpago, vermelho se denvio sem dpago */
export function getDEnvioAlert(
  dtDenvio: string | null | undefined,
  dtDpago: string | null | undefined,
  despesa: number | null | undefined
): AlertLevel {
  if (despesa == null || despesa <= 1) return "none";
  if (isDateFilled(dtDpago)) return "success";
  if (isDateFilled(dtDenvio)) return "danger";
  return "none";
}

/** GPago: verde se guy_pago, vermelho se entregue sem guy_pago */
export function getGPagoAlert(
  dtEntregue: string | null | undefined,
  dtGuyPago: string | null | undefined,
  guyHonorario: number | null | undefined
): AlertLevel {
  if (guyHonorario == null || guyHonorario <= 1) return "none";
  if (isDateFilled(dtGuyPago)) return "success";
  if (isDateFilled(dtEntregue)) return "danger";
  return "none";
}

/** GDPago: verde se guy_dpago, vermelho se entregue sem guy_dpago */
export function getGDPagoAlert(
  dtEntregue: string | null | undefined,
  dtGuyDpago: string | null | undefined,
  guyDespesa: number | null | undefined
): AlertLevel {
  if (guyDespesa == null || guyDespesa <= 1) return "none";
  if (isDateFilled(dtGuyDpago)) return "success";
  if (isDateFilled(dtEntregue)) return "danger";
  return "none";
}


