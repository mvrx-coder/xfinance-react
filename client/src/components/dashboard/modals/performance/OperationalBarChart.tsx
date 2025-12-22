import { useState } from "react";
import { motion } from "framer-motion";
import { mockOperationalData, yearColors } from "./data";

interface OperationalBarChartProps {
  data: typeof mockOperationalData;
}

export function OperationalBarChart({ data }: OperationalBarChartProps) {
  const [hoveredPerson, setHoveredPerson] = useState<string | null>(null);
  const allYears = [2021, 2022, 2023, 2024, 2025];
  const maxValue = 500000;
  const barWidth = 16;

  return (
    <div className="relative">
      <div className="flex items-center justify-end gap-4 mb-4">
        {allYears.map((year) => (
          <div key={year} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: yearColors[year] }}
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
                        background: `linear-gradient(180deg, ${yearColors[year]} 0%, ${yearColors[year]}80 100%)`,
                        boxShadow: isHovered ? `0 0 15px ${yearColors[year]}40` : 'none',
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
          <span className="text-[10px] text-muted-foreground">500,000</span>
        </div>
      </div>
    </div>
  );
}
