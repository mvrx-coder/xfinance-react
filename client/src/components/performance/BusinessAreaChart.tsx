/**
 * BusinessAreaChart - Gráfico de Linhas com Área para Business
 * 
 * Gráfico customizado em SVG que exibe honorários por mês/ano com:
 * - Linhas com área gradiente
 * - Hover interativo por ano (realça a área correspondente)
 * - Animações de desenho e transição
 * - Pontos com efeito glow no hover
 * 
 * Migrado de: BusinessLineChart.tsx (versão original)
 */

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

interface SeriesData {
  year: number;
  color: string;
  data: number[];
}

interface BusinessAreaChartProps {
  /** Dados no formato { months: string[], series: SeriesData[] } */
  data: {
    months: string[];
    series: SeriesData[];
  };
}

/** Formata valor para exibição (em milhares) */
function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toFixed(0);
}

export function BusinessAreaChart({ data }: BusinessAreaChartProps) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Dimensões do viewBox - proporção larga para preencher o container (~2.5:1)
  // Similar ao ResponsiveContainer do recharts
  const width = 1000;
  const svgHeight = 380;
  const padding = { top: 10, right: 20, bottom: 30, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  
  // Calcular valores seguros para escala
  const { maxValue, gridLines } = useMemo(() => {
    const values = data.series?.flatMap(s => s.data) ?? [];
    const max = values.length > 0 ? Math.max(...values) : 100;
    // Grid lines dinâmico baseado no max
    const step = Math.ceil(max / 4);
    const lines = [0, step, step * 2, step * 3, step * 4].filter(v => v <= max * 1.1);
    return { maxValue: max || 100, gridLines: lines };
  }, [data.series]);
  
  const minValue = 0;
  const monthsCount = data.months?.length || 12;
  
  // Funções de escala
  const xScale = (index: number) => padding.left + (index / (monthsCount - 1)) * chartWidth;
  const yScale = (value: number) => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

  // Animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Estado vazio
  if (!data.series || data.series.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Título e Legenda */}
      <div className="flex-shrink-0 pb-2">
        <div className="text-center mb-1">
          <span className="text-xs text-slate-400 font-medium">Honorários por Mês (R$ mil)</span>
        </div>
        
        {/* Legenda interativa */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {data.series.map((series, idx) => (
            <motion.div
              key={series.year}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-1.5 cursor-pointer transition-all duration-300 ${
                hoveredYear && hoveredYear !== series.year ? "opacity-40 scale-95" : "opacity-100 scale-100"
              }`}
              onMouseEnter={() => setHoveredYear(series.year)}
              onMouseLeave={() => setHoveredYear(null)}
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className="w-2.5 h-2.5 rounded-full shadow-lg"
                style={{ 
                  backgroundColor: series.color,
                  boxShadow: hoveredYear === series.year ? `0 0 12px ${series.color}` : 'none'
                }}
              />
              <span className="text-[11px] text-slate-400 font-medium font-mono">{series.year}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Gráfico SVG - ocupa todo o espaço restante */}
      <div className="flex-1 min-h-0 w-full">
        <svg 
          width="100%" 
          height="100%"
          viewBox={`0 0 ${width} ${svgHeight}`} 
          preserveAspectRatio="none"
          className="overflow-visible"
        >
        {/* Definições de gradientes e filtros */}
        <defs>
          {data.series.map((series) => (
            <linearGradient 
              key={`gradient-${series.year}`} 
              id={`area-gradient-${series.year}`} 
              x1="0" y1="0" x2="0" y2="1"
            >
              <stop offset="0%" stopColor={series.color} stopOpacity="0.4" />
              <stop offset="50%" stopColor={series.color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={series.color} stopOpacity="0" />
            </linearGradient>
          ))}
          <filter id="glow-business-area">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid horizontal */}
        {gridLines.map((value, idx) => (
          <motion.g 
            key={value}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <line
              x1={padding.left}
              y1={yScale(value)}
              x2={width - padding.right}
              y2={yScale(value)}
              stroke="rgba(148, 163, 184, 0.1)"
              strokeDasharray="4,4"
            />
            <text
              x={padding.left - 12}
              y={yScale(value)}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-[11px] fill-slate-500 font-mono"
            >
              {formatCurrency(value)}
            </text>
          </motion.g>
        ))}

        {/* Grid vertical e labels de meses */}
        {data.months.map((month, i) => (
          <motion.g 
            key={month}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <line
              x1={xScale(i)}
              y1={padding.top}
              x2={xScale(i)}
              y2={svgHeight - padding.bottom}
              stroke="rgba(148, 163, 184, 0.05)"
            />
            <text
              x={xScale(i)}
              y={svgHeight - padding.bottom + 20}
              textAnchor="middle"
              className="text-[10px] fill-slate-500 font-medium uppercase"
            >
              {month}
            </text>
          </motion.g>
        ))}

        {/* Séries de dados (áreas + linhas + pontos) */}
        {data.series.map((series, seriesIdx) => {
          const isHighlighted = hoveredYear === series.year;
          const isFaded = hoveredYear !== null && hoveredYear !== series.year;
          
          // Path da linha
          const pathD = `M ${series.data.map((value, i) => `${xScale(i)},${yScale(value)}`).join(" L ")}`;
          
          // Path da área (fecha o polígono)
          const areaPath = `
            M ${xScale(0)},${yScale(series.data[0])}
            ${series.data.map((value, i) => `L ${xScale(i)},${yScale(value)}`).join(" ")}
            L ${xScale(series.data.length - 1)},${svgHeight - padding.bottom}
            L ${xScale(0)},${svgHeight - padding.bottom}
            Z
          `;

          return (
            <motion.g
              key={series.year}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isFaded ? 0.4 : 1,
                scale: isHighlighted ? 1.01 : 1
              }}
              transition={{ duration: 0.25 }}
              style={{ transformOrigin: 'center' }}
            >
              {/* Área com gradiente */}
              <motion.path
                d={areaPath}
                fill={`url(#area-gradient-${series.year})`}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: isVisible ? (isHighlighted ? 0.9 : isFaded ? 0.15 : 0.6) : 0 
                }}
                transition={{ delay: seriesIdx * 0.15, duration: 0.5 }}
              />
              
              {/* Linha principal */}
              <motion.path
                d={pathD}
                fill="none"
                stroke={series.color}
                strokeWidth={isHighlighted ? 3 : isFaded ? 1.5 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={isHighlighted ? "url(#glow-business-area)" : undefined}
                initial={{ strokeDasharray: 1500, strokeDashoffset: 1500 }}
                animate={{ strokeDashoffset: isVisible ? 0 : 1500 }}
                transition={{ delay: seriesIdx * 0.15, duration: 1.5, ease: "easeOut" }}
                style={{ 
                  transition: 'stroke-width 0.25s ease, filter 0.25s ease',
                }}
              />
              
              {/* Pontos nos dados */}
              {series.data.map((value, i) => (
                <motion.circle
                  key={i}
                  cx={xScale(i)}
                  cy={yScale(value)}
                  r={isHighlighted ? 7 : isFaded ? 2.5 : 4}
                  fill={series.color}
                  stroke="rgba(15, 23, 42, 0.9)"
                  strokeWidth={isHighlighted ? 3 : 2}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isVisible ? 1 : 0, 
                    opacity: isVisible ? (isFaded ? 0.3 : 1) : 0 
                  }}
                  transition={{ delay: seriesIdx * 0.15 + i * 0.03, duration: 0.3 }}
                  style={{ 
                    filter: isHighlighted ? `drop-shadow(0 0 10px ${series.color})` : 'none',
                    transition: 'r 0.25s ease, filter 0.25s ease'
                  }}
                />
              ))}
            </motion.g>
          );
        })}
        </svg>
      </div>
    </div>
  );
}

