import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { itemVariants } from "./data";

interface KPICardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  suffix?: string;
  gradient: string;
  delay: number;
  isLoading?: boolean;
}

export function KPICard({ 
  icon: Icon, 
  label, 
  value, 
  suffix,
  gradient,
  delay,
  isLoading 
}: KPICardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative group"
    >
      <div className={`absolute inset-0 ${gradient} opacity-20 rounded-xl blur-xl group-hover:opacity-30 transition-opacity duration-300`} />
      <Card className="relative glass border-white/10 bg-[rgba(15,15,35,0.8)] overflow-visible">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${gradient} bg-opacity-20 border border-white/10 shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground truncate leading-tight">{label}</p>
              {isLoading ? (
                <div className="flex items-center mt-0.5">
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <p className="text-base font-bold text-foreground leading-tight">
                  {value}
                  {suffix && <span className="text-xs font-normal text-muted-foreground ml-0.5">{suffix}</span>}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
