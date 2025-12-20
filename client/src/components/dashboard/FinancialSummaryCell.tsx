import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FinancialSummaryProps {
  honorarios: number | null | undefined;
  despesas: number | null | undefined;
  gHonorarios: number | null | undefined;
  gDespesas: number | null | undefined;
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function FinancialSummaryCell({
  honorarios,
  despesas,
  gHonorarios,
  gDespesas,
}: FinancialSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const h = honorarios ?? 0;
  const d = despesas ?? 0;
  const gh = gHonorarios ?? 0;
  const gd = gDespesas ?? 0;
  
  const express = h + d - gh - gd;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="group flex items-center gap-2 px-3 py-1.5 rounded-md glass border border-white/10 hover:border-primary/30 transition-all duration-300 cursor-pointer"
          data-testid="button-financial-summary"
        >
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-warning group-hover:text-primary transition-colors" />
            <span className="text-xs font-bold text-foreground">EXPRESS</span>
          </div>
          <span className={`text-sm font-mono font-bold ${express >= 0 ? "text-success" : "text-destructive"}`}>
            {formatCurrency(express)}
          </span>
        </button>
      </PopoverTrigger>
      
      <AnimatePresence>
        {isOpen && (
          <PopoverContent
            className="w-80 p-0 border-0 bg-transparent"
            sideOffset={8}
            align="start"
            asChild
          >
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="glass-strong rounded-lg border border-white/20 overflow-hidden"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
                
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20">
                        <Sparkles className="w-4 h-4 text-warning" />
                      </div>
                      <span className="text-sm font-bold tracking-wide text-foreground">EXPRESS</span>
                    </div>
                    <motion.span 
                      className={`text-lg font-mono font-bold ${express >= 0 ? "text-success" : "text-destructive"}`}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                    >
                      {formatCurrency(express)}
                    </motion.span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-success to-success/30" />
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Honorarios:</span>
                          <p className="text-sm font-mono font-semibold text-success">{formatCurrency(h)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-destructive to-destructive/30" />
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">GHonorarios:</span>
                        <p className="text-sm font-mono font-semibold text-destructive">{formatCurrency(gh)}</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-warning to-warning/30" />
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Despesas:</span>
                          <p className="text-sm font-mono font-semibold text-warning">{formatCurrency(d)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-destructive to-destructive/30" />
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">GDespesas:</span>
                        <p className="text-sm font-mono font-semibold text-destructive">{formatCurrency(gd)}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  className="px-4 py-3 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-success" />
                      Receitas: {formatCurrency(h + d)}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-destructive" />
                      Gastos: {formatCurrency(gh + gd)}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  );
}

export function FinancialSummaryBadge({
  honorarios,
  despesas,
  gHonorarios,
  gDespesas,
}: FinancialSummaryProps) {
  const h = honorarios ?? 0;
  const d = despesas ?? 0;
  const gh = gHonorarios ?? 0;
  const gd = gDespesas ?? 0;
  
  const express = h + d - gh - gd;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg glass border border-white/10 hover:border-primary/30 cursor-pointer transition-all duration-300 group"
          data-testid="badge-financial-summary"
        >
          <div className="p-1 rounded-md bg-gradient-to-br from-warning/30 to-warning/10">
            <Sparkles className="w-4 h-4 text-warning" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
              EXPRESS
            </span>
            <span className={`text-base font-mono font-bold ${express >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(express)}
            </span>
          </div>
        </div>
      </PopoverTrigger>
      
      <PopoverContent
        className="w-80 p-0 border-0 glass-strong rounded-lg border border-white/20 overflow-hidden"
        sideOffset={8}
        align="start"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-warning/5 via-transparent to-warning/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-warning/20 to-warning/5 border border-warning/20">
                  <Sparkles className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <span className="text-sm font-bold tracking-wide text-foreground">EXPRESS</span>
                  <p className="text-[10px] text-muted-foreground">Saldo Financeiro</p>
                </div>
              </div>
              <span className={`text-xl font-mono font-bold ${express >= 0 ? "text-success" : "text-destructive"}`}>
                {formatCurrency(express)}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-full min-h-[40px] rounded-full bg-gradient-to-b from-success to-success/20" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Honorarios</span>
                    <span className="text-sm font-mono font-bold text-success">{formatCurrency(h)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-full min-h-[40px] rounded-full bg-gradient-to-b from-warning to-warning/20" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Despesas</span>
                    <span className="text-sm font-mono font-bold text-warning">{formatCurrency(d)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-full min-h-[40px] rounded-full bg-gradient-to-b from-destructive to-destructive/20" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">GHonorarios</span>
                    <span className="text-sm font-mono font-bold text-destructive">{formatCurrency(gh)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-full min-h-[40px] rounded-full bg-gradient-to-b from-destructive to-destructive/20" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">GDespesas</span>
                    <span className="text-sm font-mono font-bold text-destructive">{formatCurrency(gd)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-success" />
                <span>Entradas:</span>
                <span className="font-mono font-semibold text-success">{formatCurrency(h + d)}</span>
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                <span>Saidas:</span>
                <span className="font-mono font-semibold text-destructive">{formatCurrency(gh + gd)}</span>
              </span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
