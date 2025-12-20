import { motion } from "framer-motion";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Wallet,
  Receipt,
  CreditCard,
} from "lucide-react";

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

export function FinancialModal({ isOpen, onClose }: FinancialModalProps) {
  return (
    <Modal
      id="financial-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Controle Financeiro"
      subtitle="Visualize receitas, despesas e tendências financeiras"
      maxWidth="xl"
      footer={
        <Button variant="outline" onClick={onClose} className="gap-2" data-testid="button-close-financial">
          Fechar
        </Button>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* KPI Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <Card className="glass border-success/30 bg-gradient-to-br from-success/15 to-success/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-success" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-success">
                {formatCurrency(1308894)}
              </span>
              <p className="text-xs text-success/80 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12.5% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-destructive/30 bg-gradient-to-br from-destructive/15 to-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
                Despesas Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-destructive">
                {formatCurrency(109497)}
              </span>
              <p className="text-xs text-success/80 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                -3.2% vs mês anterior
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Breakdown */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                Breakdown por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Receipt className="w-4 h-4 text-success" />
                    Honorários
                  </span>
                  <span className="font-semibold text-success">{formatCurrency(1259028)}</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-success to-success/70 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="w-4 h-4 text-warning" />
                    GHonorários
                  </span>
                  <span className="font-semibold text-warning">{formatCurrency(44700)}</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-warning to-warning/70 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "35%" }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="w-4 h-4 text-accent" />
                    Despesas
                  </span>
                  <span className="font-semibold text-accent">{formatCurrency(14930)}</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-accent/70 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "12%" }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div variants={itemVariants}>
          <Card className="glass border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                Tendência Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-36 flex items-end justify-between gap-2">
                {[65, 45, 78, 52, 90, 75, 85, 60, 95, 70, 80, 88].map((height, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-primary to-primary/40 rounded-t-md"
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-3 text-[10px] text-muted-foreground font-medium">
                {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </Modal>
  );
}
