import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { mockAllocations, formatCurrency } from "./data";

interface AllocationLegendProps {
  data: typeof mockAllocations;
  hoveredSegment: string | null;
  onHover: (id: string | null) => void;
}

export function AllocationLegend({ 
  data, 
  hoveredSegment, 
  onHover 
}: AllocationLegendProps) {
  return (
    <div className="space-y-2">
      {data.map((item, index) => {
        const isHovered = hoveredSegment === item.id;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            onMouseEnter={() => onHover(item.id)}
            onMouseLeave={() => onHover(null)}
            className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
              isHovered 
                ? "bg-white/10 scale-[1.02]" 
                : "bg-white/5 hover:bg-white/8"
            }`}
            data-testid={`legend-item-${item.id}`}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: isHovered ? 1.2 : 1 }}
                className="w-3 h-3 rounded-full shadow-lg"
                style={{ 
                  backgroundColor: item.color,
                  boxShadow: isHovered ? `0 0 12px ${item.color}` : 'none'
                }}
              />
              <span className={`text-sm transition-colors ${isHovered ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-mono transition-colors ${isHovered ? "text-foreground" : "text-muted-foreground"}`}>
                {formatCurrency(item.value)}
              </span>
              <Badge 
                variant="outline" 
                className="text-xs border-white/20 min-w-[45px] justify-center"
                style={{ 
                  borderColor: isHovered ? item.color : undefined,
                  color: isHovered ? item.color : undefined
                }}
              >
                {item.percentage}%
              </Badge>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
