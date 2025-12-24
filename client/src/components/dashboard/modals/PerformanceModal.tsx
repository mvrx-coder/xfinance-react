import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Receipt,
  Target,
  Activity,
  Wallet,
  FileText,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

import {
  usePerformance,
  usePerformanceFilters,
  type PerformanceFilters,
} from "@/hooks";

import {
  containerVariants,
  itemVariants,
  formatCurrency,
  TabType,
} from "./performance";

import { KPICard } from "./performance/KPICard";
import { PremiumTabs } from "./performance/PremiumTabs";
import { MarketShareChart } from "./performance/MarketShareChart";
import { BusinessLineChart } from "./performance/BusinessLineChart";
import { OperationalBarChart } from "./performance/OperationalBarChart";
import { DetailsGrid } from "./performance/DetailsGrid";

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PerformanceModal({ isOpen, onClose }: PerformanceModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("market");
  const [dateFilter, setDateFilter] = useState<"dt_envio" | "dt_pago" | "dt_acerto">("dt_envio");
  const [anoIni, setAnoIni] = useState<number | undefined>(undefined);
  const [anoFim, setAnoFim] = useState<number | undefined>(undefined);
  const [use12Months, setUse12Months] = useState(false);
  const [detailsPage, setDetailsPage] = useState(1);
  const detailsPageSize = 10;

  // Buscar opções de filtro (anos disponíveis)
  const { data: filterOptions } = usePerformanceFilters(isOpen);

  // Montar filtros para queries
  const filters: PerformanceFilters = useMemo(() => ({
    baseDate: dateFilter,
    anoIni,
    anoFim,
    mm12: use12Months,
  }), [dateFilter, anoIni, anoFim, use12Months]);

  // Buscar dados de performance
  const {
    kpis,
    marketShare,
    business,
    operational,
    details,
    isLoadingKPIs,
    isLoadingMarket,
    isLoadingBusiness,
    isLoadingOperational,
    isLoadingDetails,
    hasError,
    kpisError,
  } = usePerformance({ filters, enabled: isOpen });

  // Lista de anos para os selects
  const anosDisponiveis = filterOptions?.anos ?? [];

  // Erro de acesso (403)
  const isAccessDenied = kpisError?.message?.includes("administradores");

  // Se não tem acesso, mostrar mensagem
  if (isAccessDenied) {
    return (
      <Modal
        id="performance-modal"
        isOpen={isOpen}
        onClose={onClose}
        title="Performance"
        subtitle="Acesso Restrito"
        maxWidth="md"
      >
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="p-4 rounded-2xl bg-destructive/20 border border-destructive/30">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <p className="text-foreground font-medium">Acesso Restrito</p>
          <p className="text-sm text-muted-foreground text-center">
            Apenas administradores podem acessar os dados de Performance.
          </p>
          <Button variant="outline" onClick={onClose} className="mt-4">
            Fechar
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      id="performance-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Performance"
      subtitle="Dinâmica da Empresa - Performance e Desempenho"
      maxWidth="5xl"
      footer={
        <div className="flex items-center justify-between w-full gap-4 flex-wrap">
          <Button 
            variant="ghost"
            className="gap-2 text-muted-foreground"
            data-testid="button-details"
          >
            <FileText className="w-4 h-4" />
            Detalhes
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={onClose} className="gap-2" data-testid="button-close-performance">
            Fechar
          </Button>
        </div>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[rgba(15,15,35,0.6)] border border-white/10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10">
              <span className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-wider">
                MVRX
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Dinâmica da Empresa</p>
              <p className="text-xs text-muted-foreground">Performance e Desempenho</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <RadioGroup 
              value={dateFilter} 
              onValueChange={(v) => setDateFilter(v as typeof dateFilter)}
              className="flex items-center gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dt_envio" id="dt_envio" className="border-destructive text-destructive" />
                <Label htmlFor="dt_envio" className="text-xs text-muted-foreground cursor-pointer">Envio</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dt_pago" id="dt_pago" className="border-white/30" />
                <Label htmlFor="dt_pago" className="text-xs text-muted-foreground cursor-pointer">Pago</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dt_acerto" id="dt_acerto" className="border-white/30" />
                <Label htmlFor="dt_acerto" className="text-xs text-muted-foreground cursor-pointer">Acerto</Label>
              </div>
            </RadioGroup>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Período:</span>
              <Select 
                value={anoIni?.toString() ?? "todos"} 
                onValueChange={(v) => setAnoIni(v === "todos" ? undefined : parseInt(v))}
              >
                <SelectTrigger className="w-24 h-8 text-xs bg-transparent border-white/20">
                  <SelectValue placeholder="Início" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {anosDisponiveis.map((ano) => (
                    <SelectItem key={ano.value} value={ano.value.toString()}>
                      {ano.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={anoFim?.toString() ?? "todos"} 
                onValueChange={(v) => setAnoFim(v === "todos" ? undefined : parseInt(v))}
              >
                <SelectTrigger className="w-24 h-8 text-xs bg-transparent border-white/20">
                  <SelectValue placeholder="Fim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {anosDisponiveis.map((ano) => (
                    <SelectItem key={ano.value} value={ano.value.toString()}>
                      {ano.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="12months" 
                checked={use12Months}
                onCheckedChange={(checked) => setUse12Months(checked as boolean)}
                className="border-white/30"
              />
              <Label htmlFor="12months" className="text-xs text-muted-foreground cursor-pointer">MM12</Label>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
          <motion.div variants={itemVariants} className="space-y-3">
            {isLoadingKPIs ? (
              <>
                <Skeleton className="h-[72px] w-full rounded-xl" />
                <Skeleton className="h-[72px] w-full rounded-xl" />
                <Skeleton className="h-[72px] w-full rounded-xl" />
                <Skeleton className="h-[72px] w-full rounded-xl" />
              </>
            ) : (
              <>
                <KPICard
                  icon={DollarSign}
                  label="Honorários"
                  value={`R$ ${formatCurrency(kpis?.honorarios)}`}
                  colorClass="bg-gradient-to-br from-amber-500/20 to-amber-600/10"
                  iconColorClass="text-amber-400"
                  delay={0}
                />
                <KPICard
                  icon={Receipt}
                  label="Despesas"
                  value={`R$ ${formatCurrency(kpis?.despesas)}`}
                  colorClass="bg-gradient-to-br from-rose-500/20 to-rose-600/10"
                  iconColorClass="text-rose-400"
                  delay={0.1}
                />
                <KPICard
                  icon={Target}
                  label="Resultado Operacional"
                  value={`R$ ${formatCurrency(kpis?.resultado_oper)}`}
                  colorClass="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10"
                  iconColorClass="text-emerald-400"
                  delay={0.2}
                />
                <KPICard
                  icon={Activity}
                  label="Inspeções"
                  value={kpis?.inspecoes?.toString() ?? "0"}
                  colorClass="bg-gradient-to-br from-blue-500/20 to-blue-600/10"
                  iconColorClass="text-blue-400"
                  delay={0.3}
                />
              </>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <PremiumTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <Card className="glass border-white/10 bg-[rgba(15,15,35,0.6)] min-h-[380px]">
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {activeTab === "market" && (
                    <motion.div
                      key="market"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isLoadingMarket ? (
                        <div className="space-y-3">
                          {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-7 w-full rounded-lg" />
                          ))}
                        </div>
                      ) : (
                        <MarketShareChart data={marketShare ?? []} />
                      )}
                    </motion.div>
                  )}
                  
                  {activeTab === "business" && (
                    <motion.div
                      key="business"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isLoadingBusiness ? (
                        <Skeleton className="h-[280px] w-full rounded-lg" />
                      ) : (
                        <BusinessLineChart data={business ?? { months: [], series: [] }} />
                      )}
                    </motion.div>
                  )}
                  
                  {activeTab === "operational" && (
                    <motion.div
                      key="operational"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {isLoadingOperational ? (
                        <Skeleton className="h-[280px] w-full rounded-lg" />
                      ) : (
                        <OperationalBarChart data={operational ?? []} />
                      )}
                    </motion.div>
                  )}
                  
                  {activeTab === "expenses" && (
                    <motion.div
                      key="expenses"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center h-64"
                    >
                      <div className="text-center space-y-3">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 inline-block">
                          <Wallet className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-muted-foreground">Despesas Operacionais</p>
                        <p className="text-xs text-muted-foreground/60">Em desenvolvimento...</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <DetailsGrid 
          data={details?.data ?? []} 
          total={details?.total ?? 0}
          page={detailsPage}
          pageSize={detailsPageSize}
          onPageChange={setDetailsPage}
          isLoading={isLoadingDetails}
        />
      </motion.div>
    </Modal>
  );
}

export { PerformanceModal as FinancialModal };
