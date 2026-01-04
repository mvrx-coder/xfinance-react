/**
 * ChartThumbnail - Miniatura de gráfico clicável
 * 
 * Card com preview de gráfico que pode ser clicado para trocar
 * o gráfico principal (Hero Chart).
 * 
 * Visualizações personalizadas por tipo:
 * - marketShare: barras horizontais (treemap-style)
 * - business: linhas múltiplas por ano
 * - operational: barras agrupadas
 * - expenses: área com gradiente
 */

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

type ThumbnailType = "marketShare" | "business" | "operational" | "expenses";

interface ChartThumbnailProps {
  title: string;
  chartType: "area" | "bar" | "line";
  type?: ThumbnailType;
  data: { value: number; name?: string; color?: string }[];
  /** Dados brutos do Business para visualização de linhas */
  businessData?: {
    months: string[];
    series: Array<{ year: number; color: string; data: number[] }>;
  };
  color: string;
  isActive: boolean;
  onClick: () => void;
}

// Cores dos anos para Business e Operational
const yearColors: Record<number, string> = {
  2021: "#f59e0b",
  2022: "#06b6d4",
  2023: "#22c55e",
  2024: "#f59e0b",
  2025: "#CE62D9",
  2026: "#a855f7",
};

export function ChartThumbnail({ 
  title, 
  chartType, 
  type,
  data, 
  businessData,
  color, 
  isActive, 
  onClick 
}: ChartThumbnailProps) {
  
  // Detectar tipo pelo título se não fornecido
  const chartTypeId = type || (
    title.toLowerCase().includes("market") ? "marketShare" :
    title.toLowerCase().includes("business") ? "business" :
    title.toLowerCase().includes("operational") ? "operational" :
    "expenses"
  ) as ThumbnailType;

  const renderSparkline = () => {
    // Dimensões maiores para preencher o container
    const width = 160;
    const height = 90;
    const padding = { top: 4, right: 4, bottom: 4, left: 4 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    switch (chartTypeId) {
      case "marketShare":
        // Barras horizontais estilo treemap
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice">
            {data.slice(0, 5).map((item, idx) => {
              const maxValue = Math.max(...data.map(d => d.value), 1);
              const barWidth = (item.value / maxValue) * chartWidth;
              const barHeight = (chartHeight - 8) / 5;
              const y = padding.top + idx * (barHeight + 2);
              const barColor = item.color || (idx === 0 ? "#CE62D9" : idx === 1 ? "#06b6d4" : `hsl(${260 + idx * 30}, 70%, 60%)`);
              
              return (
                <motion.g key={idx}>
                  <motion.rect
                    x={padding.left}
                    y={y}
                    width={barWidth}
                    height={barHeight - 1}
                    rx={2}
                    fill={barColor}
                    initial={{ width: 0 }}
                    animate={{ width: barWidth }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    opacity={0.8}
                  />
                </motion.g>
              );
            })}
          </svg>
        );

      case "business":
        // Linhas múltiplas representando anos
        if (businessData && businessData.series.length > 0) {
          const allValues = businessData.series.flatMap(s => s.data);
          const maxValue = Math.max(...allValues, 1);
          const minValue = Math.min(...allValues, 0);
          const range = maxValue - minValue || 1;
          const points = businessData.months.length || 12;
          
          return (
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice">
              <defs>
                {businessData.series.map((series) => (
                  <linearGradient key={`grad-${series.year}`} id={`thumb-grad-${series.year}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={series.color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={series.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              {businessData.series.slice(-3).map((series, seriesIdx) => {
                const xScale = (i: number) => padding.left + (i / (points - 1)) * chartWidth;
                const yScale = (v: number) => padding.top + chartHeight - ((v - minValue) / range) * chartHeight;
                
                const pathD = series.data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${yScale(v)}`).join(' ');
                const areaPath = `${pathD} L ${xScale(series.data.length - 1)},${height - padding.bottom} L ${padding.left},${height - padding.bottom} Z`;
                
                return (
                  <motion.g key={series.year}>
                    <motion.path
                      d={areaPath}
                      fill={`url(#thumb-grad-${series.year})`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ delay: seriesIdx * 0.1 }}
                    />
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke={series.color}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: seriesIdx * 0.1, duration: 0.5 }}
                    />
                  </motion.g>
                );
              })}
            </svg>
          );
        }
        // Fallback se não tiver dados brutos
        return renderSimpleArea();

      case "operational":
        // Barras verticais agrupadas
        const opMaxValue = Math.max(...data.map(d => d.value), 1);
        const barCount = Math.min(data.length, 6);
        const barWidth = (chartWidth - 8) / barCount;
        
        return (
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice">
            {data.slice(0, barCount).map((item, idx) => {
              const barHeight = (item.value / opMaxValue) * chartHeight;
              const x = padding.left + idx * barWidth + 2;
              const y = height - padding.bottom - barHeight;
              const barColor = yearColors[2024 + idx] || `hsl(${280 + idx * 25}, 70%, 55%)`;
              
              return (
                <motion.rect
                  key={idx}
                  x={x}
                  y={y}
                  width={barWidth - 4}
                  height={barHeight}
                  rx={2}
                  fill={barColor}
                  initial={{ height: 0, y: height - padding.bottom }}
                  animate={{ height: barHeight, y }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  opacity={0.85}
                />
              );
            })}
          </svg>
        );

      case "expenses":
      default:
        return renderSimpleArea();
    }
  };

  const renderSimpleArea = () => {
    // Dimensões maiores para preencher o container
    const width = 160;
    const height = 90;
    const padding = { top: 4, right: 4, bottom: 4, left: 4 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    if (data.length === 0) return null;
    
    const values = data.map(d => d.value);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);
    const range = maxValue - minValue || 1;
    
    const xScale = (i: number) => padding.left + (i / (data.length - 1)) * chartWidth;
    const yScale = (v: number) => padding.top + chartHeight - ((v - minValue) / range) * chartHeight;
    
    const pathD = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)},${yScale(v)}`).join(' ');
    const areaPath = `${pathD} L ${xScale(values.length - 1)},${height - padding.bottom} L ${padding.left},${height - padding.bottom} Z`;
    
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`thumb-area-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <motion.path
          d={areaPath}
          fill={`url(#thumb-area-${title.replace(/\s/g, '')})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5 }}
        />
      </svg>
    );
  };

  return (
    <motion.div
      animate={{
        scale: isActive ? 1 : 0.98,
        opacity: isActive ? 1 : 0.85,
      }}
      whileHover={{ scale: isActive ? 1.02 : 1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer h-full"
      transition={{ duration: 0.3 }}
      data-testid={`chart-thumbnail-${title.toLowerCase().replace(/\s/g, "-")}`}
    >
      <Card
        className={`
          relative overflow-hidden backdrop-blur-xl h-full flex flex-col
          bg-gradient-to-br from-slate-900/90 to-slate-900/50
          border transition-all duration-300
          ${
            isActive
              ? "border-[#CE62D9] shadow-[0_0_20px_rgba(206,98,217,0.4)] ring-2 ring-[#CE62D9]/30"
              : "border-white/5 hover:border-[#CE62D9]/30"
          }
        `}
      >
        {isActive && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CE62D9] to-transparent shadow-[0_0_8px_rgba(206,98,217,0.6)]" />
        )}

        <div className="px-3 pt-2 pb-0">
          <span
            className={`
            text-xs font-semibold transition-colors duration-300
            ${isActive ? "text-white" : "text-slate-300"}
          `}
          >
            {title}
          </span>
        </div>

        <div className="flex-1 px-1 pb-1 min-h-[120px]">{renderSparkline()}</div>

        <div
          className={`
          absolute inset-0 bg-gradient-to-br from-[#CE62D9]/5 to-transparent 
          opacity-0 hover:opacity-100 transition-opacity duration-500
          ${isActive ? "opacity-10" : ""}
        `}
        />
      </Card>
    </motion.div>
  );
}
