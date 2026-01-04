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
} from "recharts";
import { BusinessAreaChart } from "./BusinessAreaChart";

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
}

const chartTitles: Record<ChartType, { title: string; subtitle: string }> = {
  marketShare: { title: "Market Share", subtitle: "Participação por contratante" },
  business: { title: "Business Performance", subtitle: "Honorários por mês e ano" },
  operational: { title: "Operational Metrics", subtitle: "Honorários por operador e ano" },
  expenses: { title: "Operational Expenses", subtitle: "Despesas operacionais por mês" },
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

export function HeroChart({ chartType, data, businessRawData, title, subtitle }: HeroChartProps) {
  const info = chartTitles[chartType];

  const renderChart = () => {
    switch (chartType) {
      case "marketShare":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical">
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
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Share">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || "#CE62D9"} />
                ))}
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
        const operationalYears = Object.keys(data[0] || {}).filter((k) => k !== "name" && !isNaN(Number(k)));
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "JetBrains Mono, monospace" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
              {operationalYears.map((year) => (
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

