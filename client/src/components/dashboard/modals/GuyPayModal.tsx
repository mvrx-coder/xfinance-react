import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wallet, Clock, CheckCircle, AlertCircle, DollarSign } from "lucide-react";

interface GuyPayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockPayments = [
  {
    id: "1",
    guy: "Marcus Vinicius",
    initials: "MV",
    amount: 15450.0,
    status: "pago",
    date: "15/12/2025",
  },
  {
    id: "2",
    guy: "Ana Santos",
    initials: "AS",
    amount: 8320.0,
    status: "pendente",
    date: "20/12/2025",
  },
  {
    id: "3",
    guy: "Carlos Rodrigues",
    initials: "CR",
    amount: 12750.0,
    status: "pago",
    date: "10/12/2025",
  },
  {
    id: "4",
    guy: "Helena Lima",
    initials: "HL",
    amount: 6890.0,
    status: "atrasado",
    date: "01/12/2025",
  },
  {
    id: "5",
    guy: "Rafael Costa",
    initials: "RC",
    amount: 9200.0,
    status: "pendente",
    date: "25/12/2025",
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getStatusConfig(status: string) {
  switch (status) {
    case "pago":
      return {
        label: "Pago",
        icon: CheckCircle,
        className: "bg-success/20 text-success border-success/30",
      };
    case "pendente":
      return {
        label: "Pendente",
        icon: Clock,
        className: "bg-warning/20 text-warning border-warning/30",
      };
    case "atrasado":
      return {
        label: "Atrasado",
        icon: AlertCircle,
        className: "bg-destructive/20 text-destructive border-destructive/30",
      };
    default:
      return {
        label: status,
        icon: Clock,
        className: "bg-muted text-muted-foreground",
      };
  }
}

export function GuyPayModal({ isOpen, onClose }: GuyPayModalProps) {
  const totalPending = mockPayments
    .filter((p) => p.status !== "pago")
    .reduce((acc, p) => acc + p.amount, 0);

  return (
    <Modal
      id="guy-pay-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Guy Pay - Pagamentos"
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} data-testid="button-close-guypay">
            Fechar
          </Button>
          <Button data-testid="button-process-payments">
            <DollarSign className="w-4 h-4 mr-2" />
            Processar Pagamentos
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Summary */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-warning" />
            <div>
              <p className="text-sm font-medium">Pendente de Pagamento</p>
              <p className="text-xs text-muted-foreground">
                {mockPayments.filter((p) => p.status !== "pago").length}{" "}
                pagamentos aguardando
              </p>
            </div>
          </div>
          <span className="text-xl font-bold text-warning">
            {formatCurrency(totalPending)}
          </span>
        </div>

        {/* Payments List */}
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2">
            {mockPayments.map((payment) => {
              const statusConfig = getStatusConfig(payment.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                  data-testid={`payment-item-${payment.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-secondary/20 text-secondary-foreground text-sm font-semibold">
                        {payment.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{payment.guy}</p>
                      <p className="text-xs text-muted-foreground">
                        Vencimento: {payment.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-semibold">
                      {formatCurrency(payment.amount)}
                    </span>
                    <Badge variant="outline" className={statusConfig.className}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </Modal>
  );
}
