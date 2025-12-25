import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { itemVariants, formatCurrency } from "./data";

interface HighlightCardProps {
  title: string;
  name: string;
  value?: number;
  icon: React.ElementType;
  colorClass: string;
  iconColorClass: string;
}

export function HighlightCard({ 
  title, 
  name, 
  value,
  icon: Icon,
  colorClass,
  iconColorClass
}: HighlightCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      className="relative group"
    >
      <Card className="glass border-white/10 bg-[rgba(15,15,35,0.6)]">
        <CardContent className="p-3 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClass} border border-white/10 shrink-0`}>
            <Icon className={`w-4 h-4 ${iconColorClass}`} />
          </div>
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 border-white/20 ${iconColorClass} mb-0.5`}>
              {title}
            </Badge>
            <p className="text-xs font-medium text-foreground leading-tight truncate">
              {name}
            </p>
          </div>
          {value && (
            <p className="text-xs font-bold text-primary shrink-0">
              {formatCurrency(value)}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
