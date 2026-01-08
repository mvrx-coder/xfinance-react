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
  X,
} from "lucide-react";

import {
  usePerformance,
  usePerformanceFilters,
  useLogoSet,
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
  const [metric, setMetric] = useState<"valor" | "quantidade">("valor");
  const [use12Months, setUse12Months] = useState(false);
  const [detailsPage, setDetailsPage] = useState(1);
  const detailsPageSize = 10;
  
  const { logos } = useLogoSet();

  // Buscar opções de filtro (anos disponíveis)
  const { data: filterOptions } = usePerformanceFilters(isOpen);

  // Montar filtros para queries
  const filters: PerformanceFilters = useMemo(() => ({
    baseDate: dateFilter,
    anoIni,
    anoFim,
    mm12: use12Months,
    metric,
  }), [dateFilter, anoIni, anoFim, use12Months, metric]);

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
      hideHeader={true}
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
        {/* Toolbar em duas linhas */}
        <motion.div variants={itemVariants} className="flex items-center gap-4 p-4 rounded-xl shell-toolbar">
          {/* Logo - altura harmonizada com duas linhas */}
          <div className="flex items-center justify-center shrink-0">
            <img 
              src={logos.toolbar} 
              alt="MVRX Logo" 
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Títulos em duas linhas */}
          <div className="flex flex-col justify-center shrink-0">
            <h2 className="text-base font-bold text-foreground leading-tight">Performance</h2>
            <p className="text-sm text-muted-foreground leading-tight">Dinâmica da Empresa - Performance e Desempenho</p>
          </div>

          {/* Separador vertical único */}
          <div className="self-stretch w-px bg-white/20 shrink-0" />

          {/* Mecanismos de busca em duas linhas */}
          <div className="flex flex-col justify-center gap-2 flex-1">
            {/* Linha 1: Base */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Base:</span>
              <RadioGroup 
                value={dateFilter} 
                onValueChange={(v) => setDateFilter(v as typeof dateFilter)}
                className="flex items-center gap-4"
              >
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="dt_envio" id="dt_envio" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary h-3.5 w-3.5" />
                  <Label htmlFor="dt_envio" className="text-sm cursor-pointer">Envio</Label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="dt_pago" id="dt_pago" className="border-white/30 h-3.5 w-3.5" />
                  <Label htmlFor="dt_pago" className="text-sm cursor-pointer">Pago</Label>
                </div>
                <div className="flex items-center space-x-1.5">
                  <RadioGroupItem value="dt_acerto" id="dt_acerto" className="border-white/30 h-3.5 w-3.5" />
                  <Label htmlFor="dt_acerto" className="text-sm cursor-pointer">Acerto</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Linha 2: Período + MM12 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Período:</span>
              <Select 
                value={anoIni?.toString() ?? "todos"} 
                onValueChange={(v) => setAnoIni(v === "todos" ? undefined : parseInt(v))}
              >
                <SelectTrigger className="w-[80px] h-7 text-sm bg-white/5 border-white/20">
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
              <span className="text-sm text-muted-foreground">a</span>
              <Select 
                value={anoFim?.toString() ?? "todos"} 
                onValueChange={(v) => setAnoFim(v === "todos" ? undefined : parseInt(v))}
              >
                <SelectTrigger className="w-[80px] h-7 text-sm bg-white/5 border-white/20">
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
              
              {/* Switch Valor/Quantidade */}
              <div className="flex items-center gap-1 ml-2 px-2 py-1 rounded-md border border-white/20 bg-white/5">
                <span 
                  className={`text-xs cursor-pointer transition-colors px-1.5 py-0.5 rounded ${
                    metric === "valor" 
                      ? "text-primary font-medium bg-primary/20" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setMetric("valor")}
                >
                  Valor
                </span>
                <div 
                  className="w-8 h-4 rounded-full bg-white/10 relative cursor-pointer"
                  onClick={() => setMetric(metric === "valor" ? "quantidade" : "valor")}
                  data-testid="switch-metric"
                >
                  <div 
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-primary shadow-md transition-all duration-200 ${
                      metric === "quantidade" ? "left-4" : "left-0.5"
                    }`}
                  />
                </div>
                <span 
                  className={`text-xs cursor-pointer transition-colors px-1.5 py-0.5 rounded ${
                    metric === "quantidade" 
                      ? "text-primary font-medium bg-primary/20" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setMetric("quantidade")}
                >
                  Qtde
                </span>
              </div>
              
              <div className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-md border border-white/20 bg-white/5">
                <Checkbox 
                  id="12months" 
                  checked={use12Months}
                  onCheckedChange={(checked) => setUse12Months(checked as boolean)}
                  className="border-white/30 data-[state=checked]:bg-accent data-[state=checked]:border-accent h-4 w-4"
                />
                <Label htmlFor="12months" className="text-sm cursor-pointer">MM12</Label>
              </div>
            </div>
          </div>

          {/* Botão Fechar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
            data-testid="button-close-performance-toolbar"
          >
            <X className="w-4 h-4" />
          </Button>
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
                        <MarketShareChart data={marketShare ?? []} metric={metric} />
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
                        <BusinessLineChart data={business ?? { months: [], series: [] }} metric={metric} />
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
                        <OperationalBarChart data={operational ?? []} metric={metric} />
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
