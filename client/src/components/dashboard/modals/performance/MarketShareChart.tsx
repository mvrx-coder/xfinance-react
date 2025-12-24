import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { MarketShareItem } from "@/hooks";

interface MarketShareChartProps {
  data: MarketShareItem[];
}

export function MarketShareChart({ data }: MarketShareChartProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Nenhum dado disponível
      </div>
    );
  }
  
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const isHovered = hoveredBar === item.name;
        const widthPercent = (item.value / maxValue) * 100;
        
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 group cursor-pointer"
            onMouseEnter={() => setHoveredBar(item.name)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <div className="w-20 text-right">
              <span className={`text-xs font-medium transition-colors ${isHovered ? "text-foreground" : "text-muted-foreground"}`}>
                {item.name}
              </span>
            </div>
            <div className="flex-1 relative">
              <div className="h-7 rounded-lg bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-lg relative overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                  style={{ 
                    background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}99 100%)`,
                    boxShadow: isHovered ? `0 0 20px ${item.color}40` : 'none'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0" />
                </motion.div>
              </div>
            </div>
            <div className="w-14 text-right">
              <Badge 
                variant="outline" 
                className={`text-xs border-white/20 transition-all ${isHovered ? "border-primary/50 text-primary" : ""}`}
              >
                {item.value}%
              </Badge>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
