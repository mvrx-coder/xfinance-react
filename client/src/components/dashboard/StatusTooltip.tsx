/**
 * Sistema de Indicadores de Status - xFinance 3.0
 * 
 * Componente centralizado para:
 * - Lógica de determinação de status por linha
 * - Cores e ícones por nível
 * - Tooltip com legenda no header
 * 
 * FIX: parseDate agora suporta formato ISO YYYY-MM-DD (v3.0.1)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  CircleDot,
  Wallet,
  Send,
  Clock,
  FileText,
  type LucideIcon,
} from "lucide-react";
import type { Inspection } from "@shared/schema";

// =============================================================================
// TIPOS
// =============================================================================

export interface StatusInfo {
  level: 0 | 1 | 2 | 3 | 4 | 5;  // 0 = Pré-Final (novo!)
  name: string;
  title: string;
  description: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  icon: LucideIcon;
  hex: string;
}

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

/** Verifica se uma data está preenchida (não vazia, não "-") */
function isFilled(v: string | null | undefined): boolean {
  const s = (v || "").trim();
  return s !== "" && s !== "-";
}

/** Converte data DD/MM, DD/MM/AA ou YYYY-MM-DD para Date object */
function parseDate(dateStr: string | null | undefined): Date | null {
  if (!isFilled(dateStr)) return null;
  const s = (dateStr || "").trim();
  
  // Formato ISO: YYYY-MM-DD (do backend)
  if (s.includes("-") && s.length >= 10) {
    const [yearStr, monthStr, dayStr] = s.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  
  // Formato brasileiro: DD/MM ou DD/MM/AA
  const parts = s.split("/");
  if (parts.length < 2) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parts.length > 2 
    ? (parseInt(parts[2], 10) < 100 ? 2000 + parseInt(parts[2], 10) : parseInt(parts[2], 10))
    : new Date().getFullYear();
  
  return new Date(year, month, day);
}

/** Verifica se a data é hoje ou já passou */
function isDateTodayOrPast(dateStr: string | null | undefined): boolean {
  const date = parseDate(dateStr);
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return date <= today;
}

// =============================================================================
// DEFINIÇÃO DOS STATUS
// =============================================================================

const STATUS_DEFINITIONS: Record<number, Omit<StatusInfo, "level">> = {
  0: {
    name: "pre_final",
    title: "Pré-Final",
    description: "Falta guy ou despesas",
    colorClass: "text-violet-400",
    borderClass: "border-violet-400",
    bgClass: "bg-violet-400/15",
    icon: CircleDot,
    hex: "#A78BFA",  // Lilás mais claro
  },
  1: {
    name: "concluida",
    title: "Concluído!!",
    description: "Tudo quitado",
    colorClass: "text-primary",
    borderClass: "border-primary",
    bgClass: "bg-primary/15",
    icon: CheckCircle2,
    hex: "#CE62D9",  // Lilás vibrante
  },
  2: {
    name: "aguardando_pagamento",
    title: "Aguardando Pagamento",
    description: "Cobrança enviada",
    colorClass: "text-red-500",
    borderClass: "border-red-500",
    bgClass: "bg-red-500/15",
    icon: Wallet,
    hex: "#EF4444",
  },
  3: {
    name: "aguardando_cobranca",
    title: "Enviar Cobrança",
    description: "Laudo entregue",
    colorClass: "text-success",
    borderClass: "border-success",
    bgClass: "bg-success/15",
    icon: Send,
    hex: "#10B981",
  },
  4: {
    name: "em_andamento",
    title: "Em Confecção",
    description: "Aguardando entrega",
    colorClass: "text-amber-500",
    borderClass: "border-amber-500",
    bgClass: "bg-amber-500/15",
    icon: Clock,
    hex: "#F59E0B",
  },
  5: {
    name: "pendente",
    title: "Apenas Agendado",
    description: "Nada ainda realizado",
    colorClass: "text-foreground",
    borderClass: "border-white/20",
    bgClass: "bg-white/10",
    icon: FileText,
    hex: "#E0E0FF",
  },
};

// =============================================================================
// FUNÇÃO PRINCIPAL - getStatusInfo
// =============================================================================

/**
 * Verifica se um valor numérico é maior que zero
 */
function hasValue(v: number | null | undefined): boolean {
  return typeof v === "number" && v > 0;
}

/**
 * Determina o status de uma inspeção baseado nas datas preenchidas
 * Retorna informações completas incluindo cor, ícone, título e descrição
 * 
 * Hierarquia de status:
 * 1 = Concluído (tudo quitado)
 * 0 = Pré-Final (dt_pago OK, mas falta guy ou despesas)
 * 2 = Aguardando Pagamento (vermelho)
 * 3 = Aguardando Cobrança (verde)
 * 4 = Em Confecção (laranja)
 * 5 = Apenas Agendado (cinza)
 */
export function getStatusInfo(row: Inspection): StatusInfo {
  const pago = isFilled(row.dtPago);
  const envio = isFilled(row.dtEnvio);
  const entregue = isFilled(row.dtEntregue);
  const inspecaoRealizada = isFilled(row.dtInspecao) && isDateTodayOrPast(row.dtInspecao);
  
  // Verificar se está 100% concluída (dt_pago + todas as pendências resolvidas)
  if (pago) {
    // Verificar pendências de despesas e guy
    const despesaPendente = hasValue(row.despesa) && !isFilled(row.dtDpago);
    const guyHonorarioPendente = hasValue(row.guyHonorario) && !isFilled(row.dtGuyPago);
    const guyDespesaPendente = hasValue(row.guyDespesa) && !isFilled(row.dtGuyDpago);
    
    const temPendencias = despesaPendente || guyHonorarioPendente || guyDespesaPendente;
    
    if (temPendencias) {
      // Pré-Final: honorário pago, mas falta guy ou despesas
      return { level: 0, ...STATUS_DEFINITIONS[0] };
    } else {
      // 100% Concluída
      return { level: 1, ...STATUS_DEFINITIONS[1] };
    }
  }
  
  let level: 0 | 1 | 2 | 3 | 4 | 5;
  
  // Regra 2: Cobrado, aguardando pagamento (VERMELHO)
  if (envio && !pago) {
    level = 2;
  }
  // Regra 3: Entregue, aguardando cobrança (VERDE)
  else if (entregue && !envio) {
    level = 3;
  }
  // Regra 4: Em andamento, aguardando entrega (LARANJA)
  else if (inspecaoRealizada && !entregue) {
    level = 4;
  }
  // Regra 5: Ainda não realizada (CINZA)
  else {
    level = 5;
  }
  
  return {
    level,
    ...STATUS_DEFINITIONS[level],
  };
}

/**
 * Retorna apenas a classe de cor do texto (para uso simples)
 */
export function getActionColorClass(row: Inspection): string {
  return getStatusInfo(row).colorClass;
}

/**
 * Retorna classe de cor + classe de borda (para o botão de ação)
 */
export function getActionClasses(row: Inspection): string {
  const status = getStatusInfo(row);
  return `${status.colorClass} ${status.borderClass}`;
}

// =============================================================================
// COMPONENTE - StatusLegendTooltip
// =============================================================================

interface StatusLegendTooltipProps {
  children: React.ReactNode;
}

/**
 * Tooltip que mostra a legenda completa de status ao hover
 * Usado no header da coluna de ações
 */
export function StatusLegendTooltip({ children }: StatusLegendTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Ordem de exibição na legenda: Concluída, Pré-Final, Vermelho, Verde, Laranja, Cinza
  const statusList = [1, 0, 2, 3, 4, 5] as const;
  
  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {children}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50"
          >
            {/* Seta */}
            <div 
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
              style={{
                background: "rgba(10, 10, 31, 0.98)",
                borderTop: "1px solid rgba(206, 98, 217, 0.3)",
                borderLeft: "1px solid rgba(206, 98, 217, 0.3)",
              }}
            />
            
            {/* Container do Tooltip */}
            <div 
              className="min-w-[240px] rounded-xl backdrop-blur-xl shadow-2xl overflow-hidden"
              style={{
                background: "rgba(10, 10, 31, 0.98)",
                border: "1px solid rgba(206, 98, 217, 0.3)",
              }}
            >
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-white/10">
                <span className="text-xs font-bold text-primary tracking-wider uppercase">
                  Legenda de Status
                </span>
              </div>
              
              {/* Lista de Status */}
              <div className="p-3 space-y-2.5">
                {statusList.map((level) => {
                  const status = STATUS_DEFINITIONS[level];
                  const Icon = status.icon;
                  
                  return (
                    <div key={level} className="flex items-start gap-3">
                      <div 
                        className={`p-1.5 rounded-md ${status.bgClass} flex-shrink-0`}
                        style={{ borderLeft: `2px solid ${status.hex}` }}
                      >
                        <Icon className={`w-3.5 h-3.5 ${status.colorClass}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${status.colorClass}`}>
                          {status.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                          {status.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


