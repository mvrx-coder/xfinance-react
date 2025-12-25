import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Send, 
  Wallet,
  LucideIcon
} from "lucide-react";
import type { Inspection } from "@shared/schema";

interface StatusInfo {
  level: 1 | 2 | 3 | 4 | 5;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

function isFilled(v: string | null | undefined): boolean {
  const s = (v || "").trim();
  return s !== "" && s !== "-";
}

function isDateValid(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const s = dateStr.trim();
  if (s === "" || s === "-") return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

export function getStatusInfo(row: Inspection): StatusInfo {
  const pago = isFilled(row.dtPago);
  const dpagoFilled = isFilled(row.dtDpago);
  const despesasZero = typeof row.despesa === "number" && row.despesa === 0;
  const envio = isFilled(row.dtEnvio);
  const entregue = isFilled(row.dtEntregue);
  const inspecaoValid = isDateValid(row.dtInspecao);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let inspecaoFutura = false;
  if (inspecaoValid && row.dtInspecao) {
    const dtInsp = new Date(row.dtInspecao);
    dtInsp.setHours(0, 0, 0, 0);
    inspecaoFutura = dtInsp >= today;
  }

  if (pago && (dpagoFilled || despesasZero)) {
    return {
      level: 1,
      color: "#CE62D9",
      bgColor: "rgba(206, 98, 217, 0.15)",
      borderColor: "rgba(206, 98, 217, 0.4)",
      icon: CheckCircle2,
      title: "Concluída",
      description: "Pagamento e despesas finalizados"
    };
  }

  if (envio && !pago) {
    return {
      level: 2,
      color: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.15)",
      borderColor: "rgba(239, 68, 68, 0.4)",
      icon: Wallet,
      title: "Aguardando Pagamento",
      description: "Fatura enviada, pendente recebimento"
    };
  }

  if (entregue && !envio) {
    return {
      level: 3,
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.15)",
      borderColor: "rgba(16, 185, 129, 0.4)",
      icon: Send,
      title: "Aguardando Cobrança",
      description: "Laudo entregue, pendente faturamento"
    };
  }

  if (inspecaoFutura && !entregue) {
    return {
      level: 4,
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.15)",
      borderColor: "rgba(245, 158, 11, 0.4)",
      icon: Clock,
      title: "Em Andamento",
      description: "Inspeção agendada, aguardando entrega"
    };
  }

  return {
    level: 5,
    color: "hsl(var(--foreground))",
    bgColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    icon: FileText,
    title: "Pendente",
    description: "Inspeção ainda não realizada"
  };
}

export function getActionColorClass(row: Inspection): string {
  const info = getStatusInfo(row);
  switch (info.level) {
    case 1: return "text-primary";
    case 2: return "text-red-500";
    case 3: return "text-emerald-500";
    case 4: return "text-amber-500";
    default: return "text-foreground";
  }
}

interface StatusTooltipProps {
  row: Inspection;
  children: React.ReactNode;
}

export function StatusTooltip({ row, children }: StatusTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const info = getStatusInfo(row);
  const Icon = info.icon;

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
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-[100] pointer-events-none"
          >
            <div 
              className="relative backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl"
              style={{
                background: "rgba(10, 10, 31, 0.95)",
                border: `1px solid ${info.borderColor}`,
                minWidth: "200px"
              }}
            >
              <div 
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ background: info.color }}
              />
              
              <div className="p-3 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="p-1.5 rounded-md"
                    style={{ background: info.bgColor }}
                  >
                    <Icon 
                      className="w-3.5 h-3.5" 
                      style={{ color: info.color }}
                    />
                  </div>
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: info.color }}
                  >
                    {info.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {info.description}
                </p>
              </div>

              <div 
                className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45"
                style={{
                  background: "rgba(10, 10, 31, 0.95)",
                  borderLeft: `1px solid ${info.borderColor}`,
                  borderBottom: `1px solid ${info.borderColor}`,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
