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

const STATUS_LEGEND: StatusInfo[] = [
  {
    level: 1,
    color: "#CE62D9",
    bgColor: "rgba(206, 98, 217, 0.15)",
    borderColor: "rgba(206, 98, 217, 0.4)",
    icon: CheckCircle2,
    title: "Concluída",
    description: "Pagamento e despesas finalizados"
  },
  {
    level: 2,
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "rgba(239, 68, 68, 0.4)",
    icon: Wallet,
    title: "Aguardando Pagamento",
    description: "Fatura enviada"
  },
  {
    level: 3,
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.4)",
    icon: Send,
    title: "Aguardando Cobrança",
    description: "Laudo entregue"
  },
  {
    level: 4,
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    icon: Clock,
    title: "Em Andamento",
    description: "Aguardando entrega"
  },
  {
    level: 5,
    color: "#9CA3AF",
    bgColor: "rgba(156, 163, 175, 0.15)",
    borderColor: "rgba(156, 163, 175, 0.4)",
    icon: FileText,
    title: "Pendente",
    description: "Não realizada"
  }
];

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

  if (pago && (dpagoFilled || despesasZero)) return STATUS_LEGEND[0];
  if (envio && !pago) return STATUS_LEGEND[1];
  if (entregue && !envio) return STATUS_LEGEND[2];
  if (inspecaoFutura && !entregue) return STATUS_LEGEND[3];
  return STATUS_LEGEND[4];
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

interface StatusLegendTooltipProps {
  children: React.ReactNode;
}

export function StatusLegendTooltip({ children }: StatusLegendTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative inline-flex cursor-help"
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
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div 
              className="relative backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl"
              style={{
                background: "rgba(10, 10, 31, 0.98)",
                border: "1px solid rgba(206, 98, 217, 0.3)",
                minWidth: "240px"
              }}
            >
              <div className="px-4 py-3 border-b border-white/10">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Legenda de Status
                </h4>
              </div>
              
              <div className="p-3 space-y-2">
                {STATUS_LEGEND.map((status) => {
                  const Icon = status.icon;
                  return (
                    <div 
                      key={status.level}
                      className="flex items-center gap-3 p-2 rounded-lg transition-colors"
                      style={{ background: status.bgColor }}
                    >
                      <div 
                        className="p-1.5 rounded-md shrink-0"
                        style={{ background: `${status.color}20` }}
                      >
                        <Icon 
                          className="w-3.5 h-3.5" 
                          style={{ color: status.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span 
                          className="text-xs font-semibold block"
                          style={{ color: status.color }}
                        >
                          {status.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {status.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div 
                className="absolute -top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                style={{
                  background: "rgba(10, 10, 31, 0.98)",
                  borderTop: "1px solid rgba(206, 98, 217, 0.3)",
                  borderLeft: "1px solid rgba(206, 98, 217, 0.3)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
