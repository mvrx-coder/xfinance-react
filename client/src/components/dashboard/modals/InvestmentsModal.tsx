import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Modal } from "../Modal";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Trophy,
  Target,
  PieChart,
  Layers,
  Wallet,
  Loader2,
  Filter
} from "lucide-react";

import {
  useInvestments,
  useInvestmentFilters,
  useDeleteInvestment,
} from "@/hooks";
import {
  containerVariants,
  itemVariants,
  formatCurrency,
} from "./investments/data";
import { KPICard } from "./investments/KPICard";
import { HighlightCard } from "./investments/HighlightCard";
import { AllocationLegend } from "./investments/AllocationLegend";
import { PremiumDonutChart } from "./investments/PremiumDonutChart";
import { PortfolioGrid } from "./investments/PortfolioGrid";

interface InvestmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvestmentsModal({ isOpen, onClose }: InvestmentsModalProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"tipo" | "investidor" | "instituicao">("tipo");
  
  // Filter states
  const [filterInvestidor, setFilterInvestidor] = useState<string>("__all__");
  const [filterInstituicao, setFilterInstituicao] = useState<string>("__all__");
  const [filterTipo, setFilterTipo] = useState<string>("__all__");
  
  // Build API filters
  const apiFilters = useMemo(() => ({
    investidor: filterInvestidor === "__all__" ? undefined : filterInvestidor,
    instituicao: filterInstituicao === "__all__" ? undefined : filterInstituicao,
    tipo: filterTipo === "__all__" ? undefined : filterTipo,
  }), [filterInvestidor, filterInstituicao, filterTipo]);
  
  // Fetch data
  const { data: filterOptions, isLoading: isLoadingFilters } = useInvestmentFilters();
  const { 
    kpis: kpisData,
    highlights: highlightsData, 
    allocation: allocationData,
    investments: investmentsData,
    isLoadingKPIs,
    isLoadingAllocation,
    isLoadingInvestments,
    hasError
  } = useInvestments({ filters: apiFilters, groupBy: viewMode });
  const deleteMutation = useDeleteInvestment();
  
  const isLoading = isLoadingKPIs || isLoadingAllocation || isLoadingInvestments;
  
  // Safe defaults
  const kpis = kpisData ?? { patrimonio_total: 0, valor_aplicado: 0, resultado: 0, rentabilidade_pct: 0 };
  const highlights = highlightsData ?? { 
    winner: { nome: "-", valor: 0 }, 
    loser: { nome: "-", valor: 0 }, 
    maior_posicao: { nome: "-", valor: 0 } 
  };
  const allocations = allocationData ?? [];
  const investments = investmentsData?.data ?? [];
  const totalInvestments = investmentsData?.total ?? 0;
  
  // Transform allocations for chart (add id for hover)
  const chartData = useMemo(() => 
    allocations.map((item, idx) => ({
      id: `alloc-${idx}`,
      name: item.name,
      value: item.value,
      percentage: item.percentage,
      color: item.color,
    })),
    [allocations]
  );
  
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  return (
    <Modal
      id="investments-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Gestão de Aportes"
      subtitle="Acompanhe seus investimentos e alocação de carteira"
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full gap-4 flex-wrap">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterInvestidor} onValueChange={setFilterInvestidor} disabled={isLoadingFilters}>
              <SelectTrigger className="w-[140px] h-8 text-xs border-white/20 bg-white/5">
                <SelectValue placeholder="Investidor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos Investidores</SelectItem>
                {filterOptions?.investidores.map((inv) => (
                  <SelectItem key={inv.value} value={inv.value}>{inv.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterInstituicao} onValueChange={setFilterInstituicao} disabled={isLoadingFilters}>
              <SelectTrigger className="w-[140px] h-8 text-xs border-white/20 bg-white/5">
                <SelectValue placeholder="Instituição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todas Instituições</SelectItem>
                {filterOptions?.instituicoes.map((inst) => (
                  <SelectItem key={inst.value} value={inst.value}>{inst.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterTipo} onValueChange={setFilterTipo} disabled={isLoadingFilters}>
              <SelectTrigger className="w-[120px] h-8 text-xs border-white/20 bg-white/5">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos Tipos</SelectItem>
                {filterOptions?.tipos.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Group by mode */}
          <div className="flex items-center gap-3">
            <RadioGroup 
              value={viewMode} 
              onValueChange={(v) => setViewMode(v as typeof viewMode)}
              className="flex items-center gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tipo" id="tipo" className="border-white/30" />
                <Label htmlFor="tipo" className="text-sm text-muted-foreground cursor-pointer">Por Tipo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="investidor" id="investidor" className="border-white/30" />
                <Label htmlFor="investidor" className="text-sm text-muted-foreground cursor-pointer">Por Investidor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instituicao" id="instituicao" className="border-white/30" />
                <Label htmlFor="instituicao" className="text-sm text-muted-foreground cursor-pointer">Por Instituição</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      }
    >
      {hasError ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <span className="text-sm">Erro ao carregar dados. Tente novamente.</span>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <KPICard
                  icon={Wallet}
                  label="Patrimônio Total"
                  value={formatCurrency(kpis.patrimonio_total)}
                  gradient="bg-gradient-to-br from-primary to-primary/50"
                  delay={0}
                  isLoading={isLoading}
                />
                <KPICard
                  icon={DollarSign}
                  label="Valor Aplicado"
                  value={formatCurrency(kpis.valor_aplicado)}
                  gradient="bg-gradient-to-br from-accent to-accent/50"
                  delay={0.1}
                  isLoading={isLoading}
                />
                <KPICard
                  icon={TrendingUp}
                  label="Resultado"
                  value={formatCurrency(kpis.resultado)}
                  gradient="bg-gradient-to-br from-success to-success/50"
                  delay={0.2}
                  isLoading={isLoading}
                />
                <KPICard
                  icon={Target}
                  label="Rentabilidade"
                  value={(kpis.rentabilidade_pct ?? 0).toFixed(2)}
                  suffix="%"
                  gradient="bg-gradient-to-br from-amber-500 to-amber-500/50"
                  delay={0.3}
                  isLoading={isLoading}
                />
              </div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-foreground">Destaques</h3>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    <HighlightCard
                      title="Top Winner"
                      name={highlights.winner?.nome ?? "-"}
                      icon={Trophy}
                      colorClass="bg-gradient-to-br from-amber-500/20 to-amber-600/10"
                      iconColorClass="text-amber-400"
                    />
                    <HighlightCard
                      title="Top Loser"
                      name={highlights.loser?.nome ?? "-"}
                      icon={TrendingDown}
                      colorClass="bg-gradient-to-br from-red-500/20 to-red-600/10"
                      iconColorClass="text-red-400"
                    />
                    <HighlightCard
                      title="Maior Posição"
                      name={highlights.maior_posicao?.nome ?? "-"}
                      value={highlights.maior_posicao?.valor ? formatCurrency(highlights.maior_posicao.valor) : undefined}
                      icon={Target}
                      colorClass="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10"
                      iconColorClass="text-emerald-400"
                    />
                  </div>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-semibold text-foreground">Detalhes da Alocação</h3>
                </div>
                <Card className="glass border-white/10 bg-[rgba(15,15,35,0.6)]">
                  <CardContent className="p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : chartData.length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                        Nenhuma alocação encontrada
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div className="font-medium text-muted-foreground border-b border-white/10 pb-2">Grupo</div>
                        <div className="font-medium text-muted-foreground border-b border-white/10 pb-2 text-right">Valores (R$)</div>
                        {chartData.map((item) => (
                          <motion.div
                            key={item.id}
                            className="contents"
                            onMouseEnter={() => setHoveredSegment(item.id)}
                            onMouseLeave={() => setHoveredSegment(null)}
                          >
                            <div 
                              className={`py-1.5 transition-colors cursor-pointer flex items-center gap-2 ${
                                hoveredSegment === item.id ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}
                            </div>
                            <div 
                              className={`py-1.5 text-right font-mono transition-colors cursor-pointer ${
                                hoveredSegment === item.id ? "text-foreground font-medium" : "text-muted-foreground"
                              }`}
                            >
                              {formatCurrency(item.value)}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col"
            >
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Alocação</h3>
              </div>
              <Card className="glass border-white/10 bg-[rgba(15,15,35,0.6)] flex-1">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                      Sem dados para exibir gráfico
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-full blur-3xl scale-150" />
                        <PremiumDonutChart
                          data={chartData}
                          size={280}
                          strokeWidth={42}
                          hoveredSegment={hoveredSegment}
                          onHover={setHoveredSegment}
                        />
                      </div>
                      
                      <motion.div 
                        className="w-full mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <AllocationLegend
                          data={chartData}
                          hoveredSegment={hoveredSegment}
                          onHover={setHoveredSegment}
                        />
                      </motion.div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <PortfolioGrid 
            data={investments}
            total={totalInvestments}
            isLoading={isLoading}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        </motion.div>
      )}
    </Modal>
  );
}
