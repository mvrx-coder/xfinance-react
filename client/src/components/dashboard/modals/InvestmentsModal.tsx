import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus } from "lucide-react";

interface InvestmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockInvestments = [
  {
    id: "1",
    name: "Aporte Janeiro",
    date: "15/01/2025",
    value: 50000,
    type: "entrada",
  },
  {
    id: "2",
    name: "Aporte Fevereiro",
    date: "10/02/2025",
    value: 35000,
    type: "entrada",
  },
  {
    id: "3",
    name: "Retirada Março",
    date: "05/03/2025",
    value: -15000,
    type: "saida",
  },
  {
    id: "4",
    name: "Aporte Abril",
    date: "20/04/2025",
    value: 75000,
    type: "entrada",
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Math.abs(value));
}

export function InvestmentsModal({ isOpen, onClose }: InvestmentsModalProps) {
  const totalInvestments = mockInvestments.reduce(
    (acc, inv) => acc + inv.value,
    0
  );

  return (
    <Modal
      id="investments-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Aportes e Investimentos"
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} data-testid="button-close-investments">
            Fechar
          </Button>
          <Button data-testid="button-new-investment">
            <Plus className="w-4 h-4 mr-2" />
            Novo Aporte
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Investido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-success" />
              <span className="text-2xl font-bold text-success">
                {formatCurrency(totalInvestments)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Investments List */}
        <div className="space-y-2">
          {mockInvestments.map((investment) => (
            <div
              key={investment.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
              data-testid={`investment-item-${investment.id}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    investment.type === "entrada"
                      ? "bg-success/20"
                      : "bg-destructive/20"
                  }`}
                >
                  {investment.type === "entrada" ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{investment.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {investment.date}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-mono font-semibold ${
                  investment.type === "entrada"
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {investment.type === "entrada" ? "+" : "-"}
                {formatCurrency(investment.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
