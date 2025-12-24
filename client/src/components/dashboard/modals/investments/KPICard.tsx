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
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${gradient} bg-opacity-20 border border-white/10`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{label}</p>
              {isLoading ? (
                <div className="flex items-center gap-2 mt-1.5">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {value}
                  {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
