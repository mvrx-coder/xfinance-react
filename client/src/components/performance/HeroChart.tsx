/**
 * HeroChart - Gráfico principal da tela Performance
 * 
 * Suporta diferentes tipos de gráficos:
 * - marketShare: BarChart horizontal
 * - business: BusinessAreaChart com linhas e áreas interativas
 * - operational: BarChart vertical agrupado por ano
 * - expenses: AreaChart
 */

import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  LabelList,
} from "recharts";
import { BusinessAreaChart } from "./BusinessAreaChart";

/** Formata valor com k (milhares) ou M (milhões) */
function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(".", ",")}k`;
  }
  return value.toLocaleString("pt-BR");
}

type ChartType = "marketShare" | "business" | "operational" | "expenses";

interface BusinessRawData {
  months: string[];
  series: Array<{
    year: number;
    color: string;
    data: number[];
  }>;
}

interface HeroChartProps {
  chartType: ChartType;
  data: any[];
  /** Dados brutos do Business para o gráfico de área (formato original) */
  businessRawData?: BusinessRawData;
  title?: string;
  subtitle?: string;
  /** Métrica: "valor" (honorarios) ou "quantidade" (inspeções) */
  metric?: "valor" | "quantidade";
}

// Subtítulos dinâmicos baseados na métrica
const getChartInfo = (chartType: ChartType, metric: "valor" | "quantidade" = "valor") => {
  const subtitles: Record<ChartType, { valor: string; quantidade: string }> = {
    marketShare: { valor: "Honorários por Player", quantidade: "Inspeções por Player" },
    business: { valor: "Honorários por mês e ano", quantidade: "Inspeções por mês e ano" },
    operational: { valor: "Honorários por inspetor e ano (> 10 casos)", quantidade: "Inspeções por inspetor e ano (> 10 casos)" },
    expenses: { valor: "Despesas operacionais por mês", quantidade: "Despesas operacionais por mês" },
  };
  
  const titles: Record<ChartType, string> = {
    marketShare: "Market Share",
    business: "Business Performance",
    operational: "Operational Metrics",
    expenses: "Operational Expenses",
  };
  
  return {
    title: titles[chartType],
    subtitle: subtitles[chartType][metric],
  };
};

const yearColors: Record<number, string> = {
  2021: "#f97316",
  2022: "#06b6d4",
  2023: "#10b981",
  2024: "#f59e0b",
  2025: "#CE62D9",
  2026: "#8B5CF6",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="backdrop-blur-xl bg-slate-900/95 border border-white/10 rounded-lg p-3 shadow-2xl">
        <p className="text-xs font-medium text-slate-300 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs text-slate-400">{entry.name}</span>
            </div>
            <span className="text-sm font-bold font-mono tabular-nums text-white">
              {typeof entry.value === "number" ? entry.value.toLocaleString("pt-BR") : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function HeroChart({ chartType, data, businessRawData, title, subtitle, metric = "valor" }: HeroChartProps) {
  const info = getChartInfo(chartType, metric);

  const renderChart = () => {
    switch (chartType) {
      case "marketShare":
        // Custom label que mostra valor absoluto + percentual
        const MarketShareLabel = (props: any) => {
          const { x, y, width, height, index } = props;
          const item = data[index];
          if (!item) return null;
          const absValue = formatCompact(item.absoluteValue || 0);
          const pctValue = item.value;
          return (
            <text 
              x={x + width + 8} 
              y={y + height / 2} 
              fill="#e2e8f0" 
              fontSize={11} 
              fontFamily="JetBrains Mono, monospace"
              dominantBaseline="middle"
            >
              {`${absValue} - ${pctValue}%`}
            </text>
          );
        };
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ right: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" horizontal={false} />
              <XAxis
                type="number"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                width={90}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Share">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || "#CE62D9"} />
                ))}
                <LabelList content={<MarketShareLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "business":
        // Usar o gráfico de área customizado se tiver dados brutos
        if (businessRawData && businessRawData.series && businessRawData.series.length > 0) {
          return <BusinessAreaChart data={businessRawData} />;
        }
        // Fallback para BarChart se não tiver dados brutos
        const years = Object.keys(data[0] || {}).filter((k) => k !== "name" && !isNaN(Number(k)));
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
              {years.map((year) => (
                <Bar 
                  key={year} 
                  dataKey={year} 
                  fill={yearColors[Number(year)] || "#8b5cf6"} 
                  radius={[4, 4, 0, 0]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "operational":
        const operationalYears = Object.keys(data[0] || {}).filter((k) => k !== "name" && !isNaN(Number(k)) && !k.includes("_pct"));
        
        // Custom label que mostra valor sobre percentual (duas linhas)
        const OperationalLabel = (props: any) => {
          const { x, y, width, value, index } = props;
          const item = data[index];
          if (!item || value === undefined || value === 0) return null;
          
          // Encontrar o ano desta barra baseado no valor
          const year = operationalYears.find(yr => item[yr] === value);
          const pct = year ? item[`${year}_pct`] : null;
          
          const formattedValue = formatCompact(value);
          const centerX = x + width / 2;
          
          return (
            <g>
              {/* Valor (linha superior) */}
              <text 
                x={centerX} 
                y={y - 16} 
                fill="#e2e8f0" 
                fontSize={9} 
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
              >
                {formattedValue}
              </text>
              {/* Percentual (linha inferior) */}
              {pct !== null && pct !== undefined && (
                <text 
                  x={centerX} 
                  y={y - 5} 
                  fill="#94a3b8" 
                  fontSize={9} 
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {`${pct}%`}
                </text>
              )}
            </g>
          );
        };
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 35 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }}
                tickFormatter={formatCompact}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
              {operationalYears.map((year) => (
                <Bar 
                  key={year} 
                  dataKey={year} 
                  fill={yearColors[Number(year)] || "#8b5cf6"} 
                  radius={[4, 4, 0, 0]} 
                >
                  <LabelList content={<OperationalLabel />} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "expenses":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#06b6d4"
                strokeWidth={3}
                fill="url(#colorExpenses)"
                name="Despesas"
                filter="drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={chartType}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Card 
          className="h-full backdrop-blur-xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-white/5 p-6 relative"
          data-testid={`hero-chart-${chartType}`}
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">{title || info.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{subtitle || info.subtitle}</p>
          </div>

          <div className="h-[calc(100%-3.5rem)]">{renderChart()}</div>

          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#CE62D9]/30 to-transparent" />
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

