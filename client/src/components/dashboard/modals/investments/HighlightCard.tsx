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
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative group"
    >
      <Card className="glass border-white/10 bg-[rgba(15,15,35,0.6)] h-full">
        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
          <div className={`p-3 rounded-xl ${colorClass} border border-white/10`}>
            <Icon className={`w-5 h-5 ${iconColorClass}`} />
          </div>
          <Badge variant="outline" className={`text-[10px] border-white/20 ${iconColorClass}`}>
            {title}
          </Badge>
          <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">
            {name}
          </p>
          {value && (
            <p className="text-sm font-bold text-primary">
              ({formatCurrency(value)})
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
