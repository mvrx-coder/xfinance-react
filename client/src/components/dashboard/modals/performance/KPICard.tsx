import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { itemVariants } from "./data";

interface KPICardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  colorClass: string;
  iconColorClass: string;
  delay: number;
}

export function KPICard({ 
  icon: Icon, 
  label, 
  value, 
  colorClass,
  iconColorClass,
  delay 
}: KPICardProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, x: 3 }}
      className="relative group cursor-pointer"
    >
      <div className={`absolute inset-0 ${colorClass} opacity-0 group-hover:opacity-20 rounded-xl blur-xl transition-opacity duration-300`} />
      <Card className="relative glass border-white/10 bg-[rgba(15,15,35,0.8)] overflow-visible">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${colorClass} border border-white/10`}>
              <Icon className={`w-4 h-4 ${iconColorClass}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{label}</p>
              <p className={`text-lg font-bold ${iconColorClass}`}>
                {value}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
