/**
 * PerformanceModalNew - Nova versão da tela Performance
 * 
 * Layout premium com:
 * - Grid 12 colunas (KPIs 3 + Hero 7 + Thumbnails 2)
 * - 8 KPIs com sparklines, trends e goal progress
 * - Hero Chart maior (656px)
 * - Thumbnails clicáveis para trocar gráfico principal
 * - Background com mesh gradients
 * 
 * ⚠️ MIGRAÇÃO: Substituir PerformanceModal.tsx por este arquivo após testes
 */

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

import {
  usePerformance,
  usePerformanceFilters,
  usePerformanceKPIsExtended,
  type PerformanceFilters,
  type KPIsExtendedResponse,
} from "@/hooks";

import { formatCurrency } from "./performance";
import { KPICardPremium } from "@/components/performance/KPICardPremium";
import { HeroChart } from "@/components/performance/HeroChart";
import { ChartThumbnail } from "@/components/performance/ChartThumbnail";
import { PerformanceDataGrid } from "@/components/performance/PerformanceDataGrid";
import { PerformanceHeader } from "@/components/performance/PerformanceHeader";

interface PerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChartType = "marketShare" | "business" | "operational" | "expenses";

const chartConfigs: Record<ChartType, { title: string; chartType: "bar" | "area" | "line"; color: string }> = {
  marketShare: { title: "Market Share", chartType: "bar", color: "#CE62D9" },
  business: { title: "Business", chartType: "area", color: "#f59e0b" },
  operational: { title: "Operational", chartType: "bar", color: "#CE62D9" },
  expenses: { title: "Expenses", chartType: "area", color: "#06b6d4" },
};

export function PerformanceModalNew({ isOpen, onClose }: PerformanceModalProps) {
  const [dateFilter, setDateFilter] = useState<"dt_envio" | "dt_pago" | "dt_acerto">("dt_envio");
  const [anoIni, setAnoIni] = useState<number | undefined>(undefined);
  const [anoFim, setAnoFim] = useState<number | undefined>(undefined);
  const [use12Months, setUse12Months] = useState(false);
  const [detailsPage, setDetailsPage] = useState(1);
  const detailsPageSize = 10;

  const [chartPositions, setChartPositions] = useState<ChartType[]>([
    "marketShare",
    "business",
    "operational",
    "expenses",
  ]);

  const { data: filterOptions } = usePerformanceFilters(isOpen);

  // Definir anos padrão (ano anterior e atual) quando os dados carregam
  useEffect(() => {
    if (filterOptions?.anos && filterOptions.anos.length > 0) {
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      
      // Verificar se os anos estão disponíveis no banco
      const anosValues = filterOptions.anos.map(a => a.value);
      const hasCurrentYear = anosValues.includes(currentYear);
      const hasPreviousYear = anosValues.includes(previousYear);
      
      // Se ainda não definido, usar padrões
      if (anoIni === undefined && anoFim === undefined) {
        // Ano inicial: ano anterior (ou o mais antigo disponível)
        if (hasPreviousYear) {
          setAnoIni(previousYear);
        } else if (anosValues.length > 0) {
          // Usar o segundo mais recente ou o mais antigo
          const sortedYears = [...anosValues].sort((a, b) => a - b);
          setAnoIni(sortedYears[0]);
        }
        
        // Ano final: ano atual (ou o mais recente disponível)
        if (hasCurrentYear) {
          setAnoFim(currentYear);
        } else if (anosValues.length > 0) {
          const maxYear = Math.max(...anosValues);
          setAnoFim(maxYear);
        }
      }
    }
  }, [filterOptions, anoIni, anoFim]);

  const filters: PerformanceFilters = useMemo(() => ({
    baseDate: dateFilter,
    anoIni,
    anoFim,
    mm12: use12Months,
  }), [dateFilter, anoIni, anoFim, use12Months]);

  const detailsOffset = (detailsPage - 1) * detailsPageSize;

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
    kpisError,
  } = usePerformance({ 
    filters, 
    enabled: isOpen,
    detailsLimit: detailsPageSize,
    detailsOffset,
  });

  // KPIs estendidos (com sparklines, trends, etc)
  const { data: kpisExtended, isLoading: isLoadingKPIsExtended } = usePerformanceKPIsExtended(filters, isOpen);

  const anosDisponiveis = filterOptions?.anos ?? [];
  const isAccessDenied = kpisError?.message?.includes("administradores");

  const handleChartSwap = (clickedChartId: ChartType) => {
    const clickedIndex = chartPositions.indexOf(clickedChartId);
    if (clickedIndex === 0) return;

    const newPositions = [...chartPositions];
    [newPositions[0], newPositions[clickedIndex]] = [newPositions[clickedIndex], newPositions[0]];
    setChartPositions(newPositions);
  };

  const heroChartId = chartPositions[0];
  const thumbnailChartIds = chartPositions.slice(1);

  // Transformações de dados para os gráficos
  const transformedMarketShare = useMemo(() => {
    if (!marketShare) return [];
    return marketShare.map((item) => ({
      name: item.name,
      value: item.value,
      color: item.color,
    }));
  }, [marketShare]);

  const transformedBusiness = useMemo(() => {
    if (!business?.series) return [];
    const months = business.months || [];
    return months.map((month, idx) => {
      const obj: Record<string, any> = { name: month };
      business.series.forEach((s) => {
        obj[s.year] = s.data[idx] || 0;
      });
      return obj;
    });
  }, [business]);

  const transformedOperational = useMemo(() => {
    if (!operational || operational.length === 0) return [];
    return operational.map((person) => {
      const obj: Record<string, any> = { name: person.name };
      person.years.forEach((y) => {
        obj[y.year] = y.value;
      });
      return obj;
    });
  }, [operational]);

  const transformedExpenses = useMemo(() => {
    if (!kpis) return [];
    const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const monthlyExpense = (kpis.despesas || 0) / 12;
    return monthNames.map((month) => ({
      month,
      value: Math.round(monthlyExpense),
    }));
  }, [kpis]);

  const getChartData = (chartId: ChartType) => {
    switch (chartId) {
      case "marketShare": return transformedMarketShare;
      case "business": return transformedBusiness;
      case "operational": return transformedOperational;
      case "expenses": return transformedExpenses;
      default: return [];
    }
  };

  const getThumbnailData = (chartId: ChartType): { value: number; name?: string; color?: string }[] => {
    switch (chartId) {
      case "marketShare":
        // Incluir cores para visualização horizontal
        return (marketShare || []).slice(0, 6).map((d) => ({ 
          value: d.value, 
          name: d.name,
          color: d.color 
        }));
      case "business":
        // Para Business, dados resumidos por mês (soma de todos os anos)
        return transformedBusiness.slice(0, 12).map((d) => {
          const values = Object.values(d).filter((v): v is number => typeof v === "number");
          return { value: values.reduce((a, b) => a + b, 0) };
        });
      case "operational":
        // Para Operational, soma por operador
        return transformedOperational.slice(0, 6).map((d) => {
          const values = Object.values(d).filter((v): v is number => typeof v === "number");
          return { value: values.reduce((a, b) => a + b, 0), name: d.name as string };
        });
      case "expenses":
        return transformedExpenses.slice(0, 12).map((d) => ({ value: d.value }));
      default:
        return [];
    }
  };

  const isLoading = (chartId: ChartType) => {
    switch (chartId) {
      case "marketShare": return isLoadingMarket;
      case "business": return isLoadingBusiness;
      case "operational": return isLoadingOperational;
      default: return false;
    }
  };

  const detailsData = useMemo(() => {
    if (!details?.data) return [];
    return details.data.map((item) => ({
      contratante: item.contratante || "-",
      segurado: item.segurado || "-",
      guy: item.guy || "-",
      honorario: item.honorario || 0,
      despesa: item.despesa || 0,
      resultado: (item.honorario || 0) - (item.despesa || 0),
      uf: item.uf || "-",
    }));
  }, [details]);

  // Acesso negado
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
      maxWidth="full"
      hideHeader={true}
      fullscreen={true}
    >
      <div className="h-full relative overflow-y-auto bg-gradient-to-br from-[#0f172a] via-[#0a0f1a] to-[#020617]">
        {/* Mesh gradient effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(206,98,217,0.08)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,188,212,0.05)_0%,transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.4)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#CE62D9]/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-500/3 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#CE62D9]/2 blur-[200px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <PerformanceHeader
          onClose={onClose}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          anoIni={anoIni}
          anoFim={anoFim}
          onAnoIniChange={setAnoIni}
          onAnoFimChange={setAnoFim}
          use12Months={use12Months}
          onUse12MonthsChange={setUse12Months}
          anosDisponiveis={anosDisponiveis}
        />

        {/* Content */}
        <div className="pt-20 px-8 pb-8">
          <div className="w-full">
            <div className="grid grid-cols-12 gap-4">
              {/* KPIs - 3 colunas */}
              <div className="col-span-12 lg:col-span-3 xl:col-span-3">
                <div className="grid grid-cols-2 gap-2">
                  {(isLoadingKPIs || isLoadingKPIsExtended) ? (
                    <>
                      {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-[158px] w-full rounded-xl bg-slate-800/50" />
                      ))}
                    </>
                  ) : (
                    <>
                      <div className="h-[158px]">
                        <KPICardPremium
                          title="Honorários"
                          value={`R$ ${formatCurrency(kpis?.honorarios)}`}
                          icon="dollar"
                          compact
                          trend={kpisExtended?.trends.honorarios}
                          sparklineData={kpisExtended?.sparklines.honorarios}
                          previousValue={kpisExtended?.previous.honorarios}
                        />
                      </div>
                      <div className="h-[158px]">
                        <KPICardPremium
                          title="Despesas"
                          value={`R$ ${formatCurrency(kpis?.despesas)}`}
                          icon="file"
                          compact
                          trend={kpisExtended?.trends.despesas}
                          sparklineData={kpisExtended?.sparklines.despesas}
                          previousValue={kpisExtended?.previous.despesas}
                        />
                      </div>
                      <div className="h-[158px]">
                        <KPICardPremium
                          title="Resultado Oper."
                          value={`R$ ${formatCurrency(kpis?.resultado_oper)}`}
                          icon="target"
                          compact
                          trend={kpisExtended?.trends.resultado_oper}
                          sparklineData={kpisExtended?.sparklines.resultado_oper}
                          goalProgress={kpisExtended?.goals.resultado_oper}
                        />
                      </div>
                      <div className="h-[158px]">
                        <KPICardPremium
                          title="Inspeções"
                          value={kpis?.inspecoes?.toString() ?? "0"}
                          icon="activity"
                          compact
                          trend={kpisExtended?.trends.inspecoes}
                          sparklineData={kpisExtended?.sparklines.inspecoes}
                          previousValue={kpisExtended?.previous.inspecoes}
                        />
                      </div>
                      <div className="h-[158px]">
                        <KPICardPremium
                          title="Ticket Médio"
                          value={`R$ ${formatCurrency(kpisExtended?.ticket_medio)}`}
                          icon="dollar"
                          compact
                          trend={kpisExtended?.trends.ticket_medio}
                          sparklineData={kpisExtended?.sparklines.ticket_medio}
                          previousValue={kpisExtended?.previous.ticket_medio}
                        />
                      </div>
                      <div className="h-[158px]">
                        <KPICardPremium
                          title="Margem"
                          value={`${kpisExtended?.margem?.toFixed(1) ?? "0"}%`}
                          icon="target"
                          compact
                          trend={kpisExtended?.trends.margem}
                          goalProgress={kpisExtended?.goals.margem}
                        />
                      </div>
                      <div className="h-[158px]">
                        <KPICardPremium
                          title="Eficiência"
                          value={`${kpisExtended?.eficiencia?.toFixed(1) ?? "0"}%`}
                          icon="activity"
                          compact
                          trend={kpisExtended?.trends.eficiencia}
                          goalProgress={kpisExtended?.goals.eficiencia}
                        />
                      </div>
                      <div className="h-[158px]">
                        <KPICardPremium
                          title="Crescimento"
                          value={`${kpisExtended?.crescimento?.toFixed(1) ?? "0"}%`}
                          icon="trending"
                          compact
                          trend={kpisExtended?.crescimento}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Hero Chart - 7 colunas */}
              <div className="col-span-12 lg:col-span-7 xl:col-span-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={heroChartId}
                    layoutId={`chart-${heroChartId}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="h-[656px]"
                  >
                    {isLoading(heroChartId) ? (
                      <Skeleton className="h-full w-full rounded-xl bg-slate-800/50" />
                    ) : (
                      <HeroChart 
                        chartType={heroChartId} 
                        data={getChartData(heroChartId)} 
                        businessRawData={heroChartId === "business" ? business : undefined}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Thumbnails - 2 colunas */}
              <div className="col-span-12 lg:col-span-2 xl:col-span-2 flex flex-col gap-3">
                {thumbnailChartIds.map((chartId) => {
                  const config = chartConfigs[chartId];
                  return (
                    <motion.div
                      key={chartId}
                      layoutId={`chart-${chartId}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="h-[210px]"
                    >
                      <ChartThumbnail
                        title={config.title}
                        chartType={config.chartType}
                        type={chartId}
                        data={getThumbnailData(chartId)}
                        businessData={chartId === "business" ? business : undefined}
                        color={config.color}
                        isActive={false}
                        onClick={() => handleChartSwap(chartId)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Data Grid */}
            <div className="mt-6">
              <PerformanceDataGrid
                title={chartConfigs[heroChartId].title}
                data={detailsData}
                total={details?.total ?? 0}
                page={detailsPage}
                pageSize={detailsPageSize}
                onPageChange={setDetailsPage}
                isLoading={isLoadingDetails}
              />
            </div>
          </div>
        </div>

        {/* Grid pattern overlay */}
        <div className="fixed inset-0 opacity-[0.015] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0" />
      </div>
    </Modal>
  );
}

