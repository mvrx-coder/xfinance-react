import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function FinancialModal({ isOpen, onClose }: FinancialModalProps) {
  return (
    <Modal
      id="financial-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Controle Financeiro"
      maxWidth="xl"
      footer={
        <Button variant="outline" onClick={onClose} data-testid="button-close-financial">
          Fechar
        </Button>
      }
    >
      <div className="space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-success" />
                Receita Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-xl font-bold text-success">
                {formatCurrency(1308894.01)}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                +12.5% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-destructive" />
                Despesas Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-xl font-bold text-destructive">
                {formatCurrency(109497.01)}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                -3.2% vs mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Breakdown por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Honorários</span>
                <span className="font-medium">{formatCurrency(1259027.96)}</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">GHonorários</span>
                <span className="font-medium text-warning">
                  {formatCurrency(44700.00)}
                </span>
              </div>
              <Progress value={35} className="h-2 [&>div]:bg-warning" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Despesas</span>
                <span className="font-medium text-accent">
                  {formatCurrency(14930.41)}
                </span>
              </div>
              <Progress value={12} className="h-2 [&>div]:bg-accent" />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Tendência Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end justify-between gap-2">
              {[65, 45, 78, 52, 90, 75, 85, 60, 95, 70, 80, 88].map(
                (height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-primary to-primary/50 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                )
              )}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
              <span>Jan</span>
              <span>Fev</span>
              <span>Mar</span>
              <span>Abr</span>
              <span>Mai</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Ago</span>
              <span>Set</span>
              <span>Out</span>
              <span>Nov</span>
              <span>Dez</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}
