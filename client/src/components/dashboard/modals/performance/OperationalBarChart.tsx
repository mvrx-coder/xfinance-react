import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { yearColors } from "./data";
import type { OperationalItem } from "@/hooks";

interface OperationalBarChartProps {
  data: OperationalItem[];
  metric?: "valor" | "quantidade";
}

export function OperationalBarChart({ data, metric = "valor" }: OperationalBarChartProps) {
  const [hoveredPerson, setHoveredPerson] = useState<string | null>(null);
  
  // Subtítulo dinâmico baseado na métrica
  const subtitle = metric === "quantidade" ? "Inspeções por inspetor e ano" : "Honorários por inspetor e ano";
  
  // Extrair anos únicos dos dados
  const allYears = useMemo(() => {
    const yearsSet = new Set<number>();
    data.forEach(person => person.years.forEach(y => yearsSet.add(y.year)));
    return Array.from(yearsSet).sort();
  }, [data]);
  
  // Calcular maxValue dinamicamente
  const maxValue = useMemo(() => {
    const values = data.flatMap(p => p.years.map(y => y.value));
    return values.length > 0 ? Math.max(...values) * 1.1 : 500000;
  }, [data]);
  
  const barWidth = 16;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum dado operacional disponível
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="text-center mb-2">
        <span className="text-xs text-muted-foreground font-medium">{subtitle}</span>
      </div>
      <div className="flex items-center justify-end gap-4 mb-4">
        {allYears.map((year) => (
          <div key={year} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: yearColors[year] || '#888' }}
            />
            <span className="text-xs text-muted-foreground">{year}</span>
          </div>
        ))}
      </div>

      <div className="flex items-end justify-between gap-6 h-64 px-4">
        {data.map((person, personIndex) => (
          <div
            key={person.name}
            className="flex flex-col items-center gap-2 flex-1"
            onMouseEnter={() => setHoveredPerson(person.name)}
            onMouseLeave={() => setHoveredPerson(null)}
          >
            <div className="flex items-end gap-1 h-52">
              {allYears.map((year) => {
                const yearData = person.years.find(y => y.year === year);
                const heightPercent = yearData ? (yearData.value / maxValue) * 100 : 0;
                const isHovered = hoveredPerson === person.name;
                
                return (
                  <motion.div
                    key={year}
                    className="relative group cursor-pointer"
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.6, delay: personIndex * 0.1 + allYears.indexOf(year) * 0.05 }}
                    style={{ 
                      width: barWidth,
                      minHeight: yearData ? 8 : 0,
                    }}
                  >
                    <div 
                      className="absolute inset-0 rounded-t-md transition-all duration-300"
                      style={{ 
                        background: `linear-gradient(180deg, ${yearColors[year] || '#888'} 0%, ${yearColors[year] || '#888'}80 100%)`,
                        boxShadow: isHovered ? `0 0 15px ${yearColors[year] || '#888'}40` : 'none',
                        transform: isHovered ? 'scaleX(1.1)' : 'scaleX(1)',
                      }}
                    />
                    {yearData && heightPercent > 15 && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-foreground font-medium whitespace-nowrap"
                      >
                        {yearData.percentage}%
                      </motion.span>
                    )}
                  </motion.div>
                );
              })}
            </div>
            <span className={`text-[10px] text-center transition-colors ${
              hoveredPerson === person.name ? "text-foreground font-medium" : "text-muted-foreground"
            }`}>
              {person.name}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-2 px-4">
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-muted-foreground">0</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-muted-foreground">
            {metric === "quantidade" 
              ? Math.round(maxValue).toLocaleString("pt-BR")
              : Math.round(maxValue).toLocaleString("pt-BR")}
          </span>
        </div>
      </div>
    </div>
  );
}
