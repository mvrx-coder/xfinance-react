import { motion } from "framer-motion";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Wallet, Clock, CheckCircle, AlertCircle, DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "@/services/domain/formatters";

interface GuyPayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockPayments = [
  { id: "1", guy: "Marcus Vinicius", initials: "MV", amount: 15450, status: "pago", date: "15/12/2025" },
  { id: "2", guy: "Ana Santos", initials: "AS", amount: 8320, status: "pendente", date: "20/12/2025" },
  { id: "3", guy: "Carlos Rodrigues", initials: "CR", amount: 12750, status: "pago", date: "10/12/2025" },
  { id: "4", guy: "Helena Lima", initials: "HL", amount: 6890, status: "atrasado", date: "01/12/2025" },
  { id: "5", guy: "Rafael Costa", initials: "RC", amount: 9200, status: "pendente", date: "25/12/2025" },
];

const statusConfig = {
  pago: {
    label: "Pago",
    icon: CheckCircle,
    gradient: "from-success/20 to-success/5",
    border: "border-success/30",
    text: "text-success",
    badge: "bg-success/15 text-success border-success/30",
  },
  pendente: {
    label: "Pendente",
    icon: Clock,
    gradient: "from-warning/20 to-warning/5",
    border: "border-warning/30",
    text: "text-warning",
    badge: "bg-warning/15 text-warning border-warning/30",
  },
  atrasado: {
    label: "Atrasado",
    icon: AlertCircle,
    gradient: "from-destructive/20 to-destructive/5",
    border: "border-destructive/30",
    text: "text-destructive",
    badge: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function GuyPayModal({ isOpen, onClose }: GuyPayModalProps) {
  const totalPending = mockPayments
    .filter((p) => p.status !== "pago")
    .reduce((acc, p) => acc + p.amount, 0);

  const pendingCount = mockPayments.filter((p) => p.status !== "pago").length;

  return (
    <Modal
      id="guy-pay-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Guy Pay - Pagamentos"
      subtitle="Gerencie os pagamentos dos colaboradores"
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="gap-2" data-testid="button-close-guypay">
            Fechar
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-primary to-secondary border-0" data-testid="button-process-payments">
            <DollarSign className="w-4 h-4" />
            Processar Pagamentos
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
        {/* Summary */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between p-5 rounded-xl glass border border-warning/30 bg-gradient-to-r from-warning/15 to-warning/5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10 border border-white/10">
              <Wallet className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Pendente de Pagamento</p>
              <p className="text-xs text-muted-foreground">
                {pendingCount} pagamentos aguardando processamento
              </p>
            </div>
          </div>
          <span className="text-2xl font-bold text-warning">
            {formatCurrency(totalPending)}
          </span>
        </motion.div>

        {/* Payments List */}
        <ScrollArea className="max-h-[320px] custom-scrollbar">
          <div className="space-y-3">
            {mockPayments.map((payment) => {
              const config = statusConfig[payment.status as keyof typeof statusConfig];
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={payment.id}
                  variants={itemVariants}
                  className={`flex items-center justify-between p-4 rounded-xl glass border ${config.border} bg-gradient-to-r ${config.gradient} group`}
                  data-testid={`payment-item-${payment.id}`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="border-2 border-white/20">
                      <AvatarFallback className={`bg-gradient-to-br ${config.gradient} ${config.text} text-sm font-bold`}>
                        {payment.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{payment.guy}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        Vencimento: {payment.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-mono font-bold text-foreground">
                      {formatCurrency(payment.amount)}
                    </span>
                    <Badge variant="outline" className={`gap-1.5 ${config.badge}`}>
                      <StatusIcon className="w-3 h-3" />
                      {config.label}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </motion.div>
    </Modal>
  );
}
