import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Save,
  Plus,
  RefreshCw,
  Download,
  Loader2,
  AlertCircle,
  Receipt,
  Filter,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

interface Expense {
  id: number;
  group1: string;
  group2: string;
  group3: string;
  dueDate: string;
  paymentDate: string | null;
  amount: string;
}

const GROUP1_OPTIONS = [
  { value: "Administrative", label: "Administrativo" },
  { value: "Operational", label: "Operacional" },
  { value: "Capital", label: "Capital" },
];

const GROUP2_OPTIONS = [
  { value: "HR", label: "RH" },
  { value: "IT", label: "TI / Infraestrutura" },
  { value: "Sales", label: "Vendas & Marketing" },
  { value: "Finance", label: "Financeiro" },
];

const GROUP3_OPTIONS = [
  { value: "CC-100", label: "CC-100 (Geral)" },
  { value: "CC-200", label: "CC-200 (Folha)" },
  { value: "CC-300", label: "CC-300 (Cloud)" },
  { value: "CC-400", label: "CC-400 (Facilities)" },
];

const generateMockData = (): Expense[] => {
  return Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    group1: GROUP1_OPTIONS[i % 3].value,
    group2: GROUP2_OPTIONS[i % 4].value,
    group3: GROUP3_OPTIONS[i % 4].value,
    dueDate: format(new Date(2024, i % 12, (i * 3) % 28 + 1), "yyyy-MM-dd"),
    paymentDate:
      i % 3 === 0
        ? null
        : format(new Date(2024, i % 12, (i * 3) % 28 + 5), "yyyy-MM-dd"),
    amount: ((Math.random() * 5000 + 500) * 5.2).toFixed(2),
  }));
};

interface ExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpensesModal({ isOpen, onClose }: ExpensesModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [group1, setGroup1] = useState("");
  const [group2, setGroup2] = useState("");
  const [group3, setGroup3] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [paymentDate, setPaymentDate] = useState<Date>();
  const [amount, setAmount] = useState("");

  const [filterGroup1, setFilterGroup1] = useState("__all__");
  const [filterStatus, setFilterStatus] = useState("__all__");

  const [expenses, setExpenses] = useState<Expense[]>(generateMockData());

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      if (filterGroup1 !== "__all__" && exp.group1 !== filterGroup1)
        return false;
      if (filterStatus === "paid" && !exp.paymentDate) return false;
      if (filterStatus === "pending" && exp.paymentDate) return false;
      return true;
    });
  }, [expenses, filterGroup1, filterStatus]);

  const totals = useMemo(() => {
    const total = filteredExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.amount),
      0
    );
    const paid = filteredExpenses
      .filter((e) => e.paymentDate)
      .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const pending = total - paid;
    return { total, paid, pending };
  }, [filteredExpenses]);

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const handleSave = async () => {
    if (!group1 || !group2 || !group3 || !dueDate || !amount) {
      toast.warning("Campos obrigatórios", {
        description: "Preencha todos os campos para salvar.",
      });
      return;
    }

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 500));

    const newExpense: Expense = {
      id: expenses.length + 1,
      group1,
      group2,
      group3,
      dueDate: format(dueDate, "yyyy-MM-dd"),
      paymentDate: paymentDate ? format(paymentDate, "yyyy-MM-dd") : null,
      amount,
    };

    setExpenses([newExpense, ...expenses]);
    setIsSaving(false);
    setAmount("");
    setPaymentDate(undefined);

    toast.success("Despesa registrada", {
      description: "O lançamento foi salvo com sucesso.",
    });
  };

  const handleLoad = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setExpenses(generateMockData());
    setIsLoading(false);
    toast.success("Dados atualizados", {
      description: "Lista de despesas recarregada.",
    });
  };

  const handleClear = () => {
    setGroup1("");
    setGroup2("");
    setGroup3("");
    setDueDate(undefined);
    setPaymentDate(undefined);
    setAmount("");
  };

  return (
    <Modal
      id="expenses-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Controle de Despesas"
      subtitle="Gerencie e acompanhe as despesas operacionais"
      maxWidth="5xl"
      footer={
        <div className="flex items-center justify-between w-full gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterGroup1} onValueChange={setFilterGroup1}>
              <SelectTrigger className="w-[140px] h-8 text-xs border-white/20 bg-white/5">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos os Tipos</SelectItem>
                {GROUP1_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px] h-8 text-xs border-white/20 bg-white/5">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              {filteredExpenses.length} registros
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="gap-2"
              data-testid="button-close-expenses"
            >
              Fechar
            </Button>
          </div>
        </div>
      }
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-4"
        >
          <div className="flex items-center gap-3 p-4 rounded-xl glass border border-white/10">
            <div className="p-2.5 rounded-lg bg-primary/20 border border-primary/30">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Total
              </p>
              <p className="text-lg font-bold text-foreground">
                {formatCurrency(totals.total)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl glass border border-white/10">
            <div className="p-2.5 rounded-lg bg-success/20 border border-success/30">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Pagos
              </p>
              <p className="text-lg font-bold text-success">
                {formatCurrency(totals.paid)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl glass border border-white/10">
            <div className="p-2.5 rounded-lg bg-warning/20 border border-warning/30">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Pendentes
              </p>
              <p className="text-lg font-bold text-warning">
                {formatCurrency(totals.pending)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="p-4 rounded-xl shell-toolbar border border-white/10"
        >
          <div className="grid grid-cols-6 gap-3 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tipo
              </Label>
              <Select value={group1} onValueChange={setGroup1}>
                <SelectTrigger className="h-9 bg-background/50 border-white/20">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP1_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Departamento
              </Label>
              <Select value={group2} onValueChange={setGroup2}>
                <SelectTrigger className="h-9 bg-background/50 border-white/20">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP2_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Centro de Custo
              </Label>
              <Select value={group3} onValueChange={setGroup3}>
                <SelectTrigger className="h-9 bg-background/50 border-white/20">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP3_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-primary uppercase tracking-wider">
                Vencimento
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-9 justify-start text-left font-normal bg-background/50 border-white/20",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {dueDate
                      ? format(dueDate, "dd/MM/yyyy", { locale: ptBR })
                      : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-primary uppercase tracking-wider">
                Pagamento
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-9 justify-start text-left font-normal bg-background/50 border-white/20",
                      !paymentDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {paymentDate
                      ? format(paymentDate, "dd/MM/yyyy", { locale: ptBR })
                      : "Pago em..."}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={paymentDate}
                    onSelect={setPaymentDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-primary uppercase tracking-wider">
                Valor (R$)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                  R$
                </span>
                <Input
                  type="number"
                  placeholder="0,00"
                  className="h-9 pl-8 font-mono bg-background/50 border-white/20"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="input-amount"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoad}
              disabled={isLoading}
              className="gap-1.5"
              data-testid="button-load-expenses"
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", isLoading && "animate-spin")}
              />
              Carregar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="gap-1.5"
              data-testid="button-clear-form"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="gap-1.5 bg-success hover:bg-success/90"
              data-testid="button-save-expense"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Salvar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-dashed"
              data-testid="button-export-expenses"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar
            </Button>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-white/10 overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-16 bg-card/50">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  Sincronizando dados...
                </p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card border-b border-white/10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[60px] text-center bg-card text-xs">
                      ID
                    </TableHead>
                    <TableHead className="bg-card text-xs">Tipo</TableHead>
                    <TableHead className="bg-card text-xs">
                      Departamento
                    </TableHead>
                    <TableHead className="bg-card text-xs">
                      Centro Custo
                    </TableHead>
                    <TableHead className="bg-card text-xs font-mono">
                      Vencimento
                    </TableHead>
                    <TableHead className="bg-card text-xs font-mono">
                      Pagamento
                    </TableHead>
                    <TableHead className="bg-card text-xs text-right font-mono">
                      Valor
                    </TableHead>
                    <TableHead className="w-[90px] text-center bg-card text-xs">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertCircle className="w-6 h-6 opacity-20" />
                          <p>Nenhum registro encontrado.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((item, index) => (
                      <TableRow
                        key={`${item.id}-${index}`}
                        className="group hover:bg-white/5 transition-colors border-white/5"
                        data-testid={`row-expense-${item.id}`}
                      >
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {String(item.id).padStart(4, "0")}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {GROUP1_OPTIONS.find((o) => o.value === item.group1)
                            ?.label || item.group1}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {GROUP2_OPTIONS.find((o) => o.value === item.group2)
                            ?.label || item.group2}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono border-primary/20 bg-primary/5 text-primary"
                          >
                            {item.group3}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {format(new Date(item.dueDate), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.paymentDate ? (
                            format(new Date(item.paymentDate), "dd/MM/yyyy")
                          ) : (
                            <span className="text-warning/70 italic">
                              Pendente
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-medium">
                          {formatCurrency(item.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.paymentDate ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-success/10 text-success border-success/20"
                            >
                              Pago
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-warning/10 text-warning border-warning/20"
                            >
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </motion.div>
      </motion.div>
    </Modal>
  );
}
