import { motion } from "framer-motion";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, ArrowUpRight, Sparkles } from "lucide-react";

interface InvestmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockInvestments = [
  { id: "1", name: "Aporte Janeiro", date: "15/01/2025", value: 50000, type: "entrada" },
  { id: "2", name: "Aporte Fevereiro", date: "10/02/2025", value: 35000, type: "entrada" },
  { id: "3", name: "Retirada Março", date: "05/03/2025", value: -15000, type: "saida" },
  { id: "4", name: "Aporte Abril", date: "20/04/2025", value: 75000, type: "entrada" },
  { id: "5", name: "Aporte Maio", date: "12/05/2025", value: 42000, type: "entrada" },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function InvestmentsModal({ isOpen, onClose }: InvestmentsModalProps) {
  const totalInvestments = mockInvestments.reduce((acc, inv) => acc + inv.value, 0);
  const totalEntrada = mockInvestments.filter(i => i.type === "entrada").reduce((acc, i) => acc + i.value, 0);

  return (
    <Modal
      id="investments-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Aportes e Investimentos"
      subtitle="Acompanhe seus aportes e movimentações financeiras"
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="gap-2" data-testid="button-close-investments">
            Fechar
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-success to-accent border-0" data-testid="button-new-investment">
            <Plus className="w-4 h-4" />
            Novo Aporte
          </Button>
        </>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Summary Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          <Card className="glass border-success/30 bg-gradient-to-br from-success/15 to-success/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-success" />
                Total Investido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-success">
                  {formatCurrency(totalInvestments)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-success" />
                +18.5% vs ano anterior
              </p>
            </CardContent>
          </Card>

          <Card className="glass border-accent/30 bg-gradient-to-br from-accent/15 to-accent/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-accent" />
                Entradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold text-accent">
                {formatCurrency(totalEntrada)}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {mockInvestments.filter(i => i.type === "entrada").length} aportes realizados
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Investments List */}
        <ScrollArea className="max-h-[280px] custom-scrollbar">
          <div className="space-y-3">
            {mockInvestments.map((investment, index) => (
              <motion.div
                key={investment.id}
                variants={itemVariants}
                className={`flex items-center justify-between p-4 rounded-xl glass border ${
                  investment.type === "entrada" ? "border-success/30" : "border-destructive/30"
                } bg-gradient-to-r ${
                  investment.type === "entrada" ? "from-success/10 to-success/5" : "from-destructive/10 to-destructive/5"
                }`}
                data-testid={`investment-item-${investment.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    investment.type === "entrada" 
                      ? "bg-gradient-to-br from-success/20 to-success/10" 
                      : "bg-gradient-to-br from-destructive/20 to-destructive/10"
                  } border border-white/10`}>
                    {investment.type === "entrada" ? (
                      <TrendingUp className="w-5 h-5 text-success" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{investment.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {investment.date}
                    </p>
                  </div>
                </div>
                <span className={`text-base font-mono font-bold ${
                  investment.type === "entrada" ? "text-success" : "text-destructive"
                }`}>
                  {investment.type === "entrada" ? "+" : "-"}
                  {formatCurrency(investment.value)}
                </span>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </motion.div>
    </Modal>
  );
}
