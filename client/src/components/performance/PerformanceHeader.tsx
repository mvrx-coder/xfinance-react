/**
 * PerformanceHeader - Cabeçalho fixo da tela Performance
 * 
 * Contém logo, título, filtros de data e botão de fechar.
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PerformanceHeaderProps {
  onClose: () => void;
  dateFilter: "dt_envio" | "dt_pago" | "dt_acerto";
  onDateFilterChange: (value: "dt_envio" | "dt_pago" | "dt_acerto") => void;
  anoIni?: number;
  anoFim?: number;
  onAnoIniChange: (value: number | undefined) => void;
  onAnoFimChange: (value: number | undefined) => void;
  metric: "valor" | "quantidade";
  onMetricChange: (value: "valor" | "quantidade") => void;
  use12Months: boolean;
  onUse12MonthsChange: (value: boolean) => void;
  anosDisponiveis: { value: number; label: string }[];
}

function SwitchPillGlow({ checked, onChange, testId }: { 
  checked: boolean; 
  onChange: () => void; 
  testId: string;
}) {
  return (
    <div
      className="switch-pill-glow"
      data-checked={checked}
      data-color="violet"
      onClick={onChange}
      data-testid={testId}
      role="switch"
      aria-checked={checked}
    />
  );
}

export function PerformanceHeader({ 
  onClose, 
  dateFilter, 
  onDateFilterChange,
  anoIni,
  anoFim,
  onAnoIniChange,
  onAnoFimChange,
  metric,
  onMetricChange,
  use12Months,
  onUse12MonthsChange,
  anosDisponiveis,
}: PerformanceHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#CE62D9]/50 to-transparent" />

      <div className="absolute top-0 left-20 w-96 h-32 bg-[#CE62D9]/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-20 w-96 h-32 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#CE62D9] to-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-[#CE62D9]/30">
              X
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Performance</h1>
              <p className="text-xs text-slate-400">Dinâmica da Empresa - Performance e Desempenho</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-900/50 border border-white/5">
              <span className="text-xs text-slate-400">Base:</span>
              <RadioGroup 
                value={dateFilter} 
                onValueChange={(v) => onDateFilterChange(v as typeof dateFilter)}
                className="flex items-center gap-3"
              >
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="dt_envio" id="perf_dt_envio" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3.5 w-3.5" />
                  <Label htmlFor="perf_dt_envio" className="text-xs cursor-pointer text-slate-300">Envio</Label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="dt_pago" id="perf_dt_pago" className="border-white/30 h-3.5 w-3.5" />
                  <Label htmlFor="perf_dt_pago" className="text-xs cursor-pointer text-slate-300">Pago</Label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="dt_acerto" id="perf_dt_acerto" className="border-white/30 h-3.5 w-3.5" />
                  <Label htmlFor="perf_dt_acerto" className="text-xs cursor-pointer text-slate-300">Acerto</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 border border-white/5">
              <span className="text-xs text-slate-400">Período:</span>
              
              <Select 
                value={anoIni?.toString() || ""} 
                onValueChange={(v) => onAnoIniChange(v ? parseInt(v) : undefined)}
              >
                <SelectTrigger className="w-[80px] h-7 text-xs bg-transparent border-white/10 text-white">
                  <SelectValue placeholder="De" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {anosDisponiveis.map((ano) => (
                    <SelectItem key={ano.value} value={ano.value.toString()} className="text-xs">
                      {ano.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-slate-500 text-xs">a</span>

              <Select 
                value={anoFim?.toString() || ""} 
                onValueChange={(v) => onAnoFimChange(v ? parseInt(v) : undefined)}
              >
                <SelectTrigger className="w-[80px] h-7 text-xs bg-transparent border-white/10 text-white">
                  <SelectValue placeholder="Até" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10">
                  {anosDisponiveis.map((ano) => (
                    <SelectItem key={ano.value} value={ano.value.toString()} className="text-xs">
                      {ano.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Switch Valor/Quantidade */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900/50 border border-white/5">
              <span 
                className={`text-xs cursor-pointer transition-all px-2 py-0.5 rounded ${
                  metric === "valor" 
                    ? "text-[#CE62D9] font-medium bg-[#CE62D9]/20" 
                    : "text-slate-400 hover:text-slate-300"
                }`}
                onClick={() => onMetricChange("valor")}
              >
                Valor
              </span>
              <div 
                className="w-9 h-5 rounded-full bg-slate-800 relative cursor-pointer border border-white/10"
                onClick={() => onMetricChange(metric === "valor" ? "quantidade" : "valor")}
                data-testid="switch-metric"
              >
                <div 
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#CE62D9] shadow-lg shadow-[#CE62D9]/30 transition-all duration-200 ${
                    metric === "quantidade" ? "left-[18px]" : "left-0.5"
                  }`}
                />
              </div>
              <span 
                className={`text-xs cursor-pointer transition-all px-2 py-0.5 rounded ${
                  metric === "quantidade" 
                    ? "text-[#CE62D9] font-medium bg-[#CE62D9]/20" 
                    : "text-slate-400 hover:text-slate-300"
                }`}
                onClick={() => onMetricChange("quantidade")}
              >
                Qtde
              </span>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 border border-white/5">
              <Label htmlFor="mm12-toggle" className="text-xs text-slate-300 cursor-pointer">MM12</Label>
              <SwitchPillGlow
                checked={use12Months}
                onChange={() => onUse12MonthsChange(!use12Months)}
                testId="switch-mm12"
              />
            </div>

            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="w-9 h-9 hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors"
              data-testid="button-close-performance"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

