import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { mockBusinessData, formatCurrency } from "./data";

interface BusinessLineChartProps {
  data: typeof mockBusinessData;
}

export function BusinessLineChart({ data }: BusinessLineChartProps) {
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const width = 600;
  const height = 280;
  const padding = { top: 40, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const allValues = data.series.flatMap(s => s.data);
  const maxValue = Math.max(...allValues);
  const minValue = 0;
  
  const xScale = (index: number) => padding.left + (index / (data.months.length - 1)) * chartWidth;
  const yScale = (value: number) => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

  const gridLines = [0, 100, 200, 300];

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center justify-end gap-4 mb-4">
        {data.series.map((series, idx) => (
          <motion.div
            key={series.year}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center gap-2 cursor-pointer transition-all duration-300 ${
              hoveredYear && hoveredYear !== series.year ? "opacity-40 scale-95" : "opacity-100 scale-100"
            }`}
            onMouseEnter={() => setHoveredYear(series.year)}
            onMouseLeave={() => setHoveredYear(null)}
            whileHover={{ scale: 1.05 }}
          >
            <div 
              className="w-3 h-3 rounded-full shadow-lg"
              style={{ 
                backgroundColor: series.color,
                boxShadow: hoveredYear === series.year ? `0 0 10px ${series.color}` : 'none'
              }}
            />
            <span className="text-xs text-muted-foreground font-medium">{series.year}</span>
          </motion.div>
        ))}
      </div>
      
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        <defs>
          {data.series.map((series) => (
            <linearGradient key={`gradient-${series.year}`} id={`line-gradient-${series.year}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={series.color} stopOpacity="0" />
            </linearGradient>
          ))}
          <filter id="glow-business">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

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
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="4,4"
            />
            <text
              x={padding.left - 10}
              y={yScale(value)}
              textAnchor="end"
              alignmentBaseline="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {formatCurrency(value)}
            </text>
          </motion.g>
        ))}

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
              y2={height - padding.bottom}
              stroke="rgba(255,255,255,0.05)"
            />
            <text
              x={xScale(i)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className="text-[11px] fill-muted-foreground"
            >
              {month}
            </text>
          </motion.g>
        ))}

        {data.series.map((series, seriesIdx) => {
          const isHighlighted = hoveredYear === series.year;
          const isFaded = hoveredYear !== null && hoveredYear !== series.year;
          const pathD = `M ${series.data.map((value, i) => `${xScale(i)},${yScale(value)}`).join(" L ")}`;
          
          const areaPath = `
            M ${xScale(0)},${yScale(series.data[0])}
            ${series.data.map((value, i) => `L ${xScale(i)},${yScale(value)}`).join(" ")}
            L ${xScale(series.data.length - 1)},${height - padding.bottom}
            L ${xScale(0)},${height - padding.bottom}
            Z
          `;

          return (
            <motion.g
              key={series.year}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isFaded ? 0.5 : 1,
                scale: isHighlighted ? 1.02 : 1
              }}
              transition={{ duration: 0.25 }}
              style={{ transformOrigin: 'center' }}
            >
              <motion.path
                d={areaPath}
                fill={`url(#line-gradient-${series.year})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? (isHighlighted ? 0.8 : isFaded ? 0.1 : 0.6) : 0 }}
                transition={{ delay: seriesIdx * 0.15, duration: 0.5 }}
              />
              <motion.path
                d={pathD}
                fill="none"
                stroke={series.color}
                strokeWidth={isHighlighted ? 2 : isFaded ? 1 : 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={isHighlighted ? "url(#glow-business)" : undefined}
                initial={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
                animate={{ strokeDashoffset: isVisible ? 0 : 1000 }}
                transition={{ delay: seriesIdx * 0.15, duration: 1.2, ease: "easeOut" }}
                style={{ transition: 'stroke-width 0.25s ease, filter 0.25s ease' }}
              />
              {series.data.map((value, i) => (
                <motion.circle
                  key={i}
                  cx={xScale(i)}
                  cy={yScale(value)}
                  r={isHighlighted ? 6 : isFaded ? 2 : 3}
                  fill={series.color}
                  stroke="rgba(10,10,31,0.9)"
                  strokeWidth={isHighlighted ? 2.5 : 2}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isVisible ? 1 : 0, 
                    opacity: isVisible ? (isFaded ? 0.3 : 1) : 0 
                  }}
                  transition={{ delay: seriesIdx * 0.15 + i * 0.03, duration: 0.3 }}
                  style={{ 
                    filter: isHighlighted ? `drop-shadow(0 0 8px ${series.color})` : 'none',
                    transition: 'r 0.25s ease, filter 0.25s ease'
                  }}
                />
              ))}
            </motion.g>
          );
        })}
      </svg>
      
      <motion.div 
        className="absolute top-0 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-xs text-muted-foreground font-medium">Honorários por Mês (R$ mil)</span>
      </motion.div>
    </div>
  );
}
