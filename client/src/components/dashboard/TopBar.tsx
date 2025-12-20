import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  Users,
  TrendingUp,
  PieChart,
  Wallet,
  Puzzle,
  LogOut,
  Calendar,
  Clock,
  Sparkles,
  Gamepad2,
  Target,
  Database,
  Workflow,
  Receipt,
  CreditCard,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { FilterState, KPIs } from "@shared/schema";

interface TopBarProps {
  userName?: string;
  kpis: KPIs;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSearch: () => void;
  onNewRecord: () => void;
  onOpenUsers: () => void;
  onOpenInvestments: () => void;
  onOpenFinancial: () => void;
  onOpenGuyPay: () => void;
  onLogout: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date());
}

function formatTime(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 },
};

function KPICard({
  label,
  value,
  icon: Icon,
  trend,
  color,
}: {
  label: string;
  value: string;
  icon: typeof Zap;
  trend?: "up" | "down";
  color: "primary" | "accent" | "success" | "warning" | "destructive";
}) {
  const colorClasses = {
    primary: "from-primary/20 to-primary/5 border-primary/30 text-primary",
    accent: "from-accent/20 to-accent/5 border-accent/30 text-accent",
    success: "from-success/20 to-success/5 border-success/30 text-success",
    warning: "from-warning/20 to-warning/5 border-warning/30 text-warning",
    destructive: "from-destructive/20 to-destructive/5 border-destructive/30 text-destructive",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm transition-all duration-300`}
    >
      <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold">{value}</span>
          {trend && (
            <span className={trend === "up" ? "text-success" : "text-destructive"}>
              {trend === "up" ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TopBar({
  userName = "Marcus Vinicius",
  kpis,
  filters,
  onFiltersChange,
  onSearch,
  onNewRecord,
  onOpenUsers,
  onOpenInvestments,
  onOpenFinancial,
  onOpenGuyPay,
  onLogout,
}: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(formatTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleColumnGroupChange = (
    group: keyof FilterState["columnGroups"],
    checked: boolean
  ) => {
    onFiltersChange({
      ...filters,
      columnGroups: { ...filters.columnGroups, [group]: checked },
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-wrap items-center gap-4 p-4 mx-3 mt-3 rounded-2xl glass-card shadow-xl"
      data-testid="topbar"
    >
      {/* Logo + Welcome Section */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        {/* Logo with Glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl blur-lg opacity-50" />
          <div className="relative flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 border border-white/20 backdrop-blur-xl">
            <span className="text-xl font-black gradient-text">xFin</span>
          </div>
        </div>

        {/* Welcome Panel */}
        <div className="flex flex-col gap-1 px-5 py-3 rounded-xl glass border border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Bem-vindo, {userName}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              {formatDate()}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {currentTime}
            </span>
          </div>
        </div>
      </motion.div>

      <Separator orientation="vertical" className="h-14 bg-white/10" />

      {/* Filters Section */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        {/* Toggle Filters */}
        <div className="flex flex-col gap-2 px-4 py-3 rounded-xl glass border border-white/10">
          <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
            <Checkbox
              id="player-toggle"
              checked={filters.player}
              onCheckedChange={(checked) =>
                handleFilterChange("player", checked === true)
              }
              className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              data-testid="checkbox-player"
            />
            <Gamepad2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="font-medium group-hover:text-primary transition-colors">Player</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
            <Checkbox
              id="myjob-toggle"
              checked={filters.myJob}
              onCheckedChange={(checked) =>
                handleFilterChange("myJob", checked === true)
              }
              className="border-warning/50 data-[state=checked]:bg-warning data-[state=checked]:border-warning"
              data-testid="checkbox-myjob"
            />
            <Target className="w-4 h-4 text-warning group-hover:scale-110 transition-transform" />
            <span className="font-medium group-hover:text-warning transition-colors">My Job</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
            <Checkbox
              id="db-limit-toggle"
              checked={filters.dbLimit}
              onCheckedChange={(checked) =>
                handleFilterChange("dbLimit", checked === true)
              }
              className="border-muted-foreground/50"
              data-testid="checkbox-dblimit"
            />
            <Database className="w-4 h-4 text-muted-foreground group-hover:scale-110 transition-transform" />
            <span className="font-medium group-hover:text-foreground transition-colors">DB Limit</span>
          </label>
        </div>

        {/* Column Groups */}
        <div className="flex flex-col gap-2 px-4 py-3 rounded-xl glass border border-white/10">
          <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
            <Checkbox
              id="workflow-toggle"
              checked={filters.columnGroups.workflow}
              onCheckedChange={(checked) =>
                handleColumnGroupChange("workflow", checked === true)
              }
              className="border-accent/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              data-testid="checkbox-workflow"
            />
            <Workflow className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
            <span className="font-medium group-hover:text-accent transition-colors">Work Flow</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
            <Checkbox
              id="recebiveis-toggle"
              checked={filters.columnGroups.recebiveis}
              onCheckedChange={(checked) =>
                handleColumnGroupChange("recebiveis", checked === true)
              }
              className="border-success/50 data-[state=checked]:bg-success data-[state=checked]:border-success"
              data-testid="checkbox-recebiveis"
            />
            <Receipt className="w-4 h-4 text-success group-hover:scale-110 transition-transform" />
            <span className="font-medium group-hover:text-success transition-colors">Recebíveis</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer group">
            <Checkbox
              id="pagamentos-toggle"
              checked={filters.columnGroups.pagamentos}
              onCheckedChange={(checked) =>
                handleColumnGroupChange("pagamentos", checked === true)
              }
              className="border-warning/50 data-[state=checked]:bg-warning data-[state=checked]:border-warning"
              data-testid="checkbox-pagamentos"
            />
            <CreditCard className="w-4 h-4 text-warning group-hover:scale-110 transition-transform" />
            <span className="font-medium group-hover:text-warning transition-colors">Pagamentos</span>
          </label>
        </div>
      </motion.div>

      <Separator orientation="vertical" className="h-14 bg-white/10" />

      {/* Actions Section */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        {/* Primary Actions */}
        <div className="flex flex-col gap-2">
          <Button
            id="btn-search-inspections"
            onClick={onSearch}
            className="gap-2 bg-gradient-to-r from-primary to-secondary border-0 shadow-lg shadow-primary/25"
            data-testid="button-search"
          >
            <Search className="w-4 h-4" />
            Buscar
          </Button>
          <Button
            id="btn-open-new-record"
            onClick={onNewRecord}
            variant="outline"
            className="gap-2 border-accent/50 text-accent"
            data-testid="button-new"
          >
            <Plus className="w-4 h-4" />
            Novo
          </Button>
        </div>

        {/* Admin Actions */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              id="btn-open-users"
              onClick={onOpenUsers}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs glass border border-white/10"
              data-testid="button-users"
            >
              <Users className="w-3.5 h-3.5" />
              Usuários
            </Button>
            <Button
              id="btn-investimentos"
              onClick={onOpenInvestments}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs glass border border-white/10"
              data-testid="button-investments"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Aportes
            </Button>
            <Button
              id="btn-finance-control"
              onClick={onOpenFinancial}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs glass border border-white/10"
              data-testid="button-financial"
            >
              <PieChart className="w-3.5 h-3.5" />
              Financial
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              id="btn-open-guy-pay"
              onClick={onOpenGuyPay}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs glass border border-white/10"
              data-testid="button-guypay"
            >
              <Wallet className="w-3.5 h-3.5" />
              Guy Pay
            </Button>
            <Button
              id="btn-coming-soon"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground"
              disabled
              data-testid="button-coming-soon"
            >
              <Puzzle className="w-3.5 h-3.5" />
              Em breve
            </Button>
            <Button
              id="btn-logout"
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-destructive/80"
              data-testid="button-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </Button>
          </div>
        </div>
      </motion.div>

      <Separator orientation="vertical" className="h-14 bg-white/10" />

      {/* KPIs Express Panel */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3"
        data-testid="panel-kpis"
      >
        <KPICard
          label="Express"
          value={formatCurrency(kpis.express)}
          icon={Zap}
          trend="up"
          color="success"
        />
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <KPICard
              label="Honorários"
              value={formatCurrency(kpis.honorarios)}
              icon={Receipt}
              color="accent"
            />
            <KPICard
              label="GHonorários"
              value={formatCurrency(kpis.gHonorarios)}
              icon={TrendingUp}
              trend="down"
              color="destructive"
            />
          </div>
          <div className="flex gap-2">
            <KPICard
              label="Despesas"
              value={formatCurrency(kpis.despesas)}
              icon={CreditCard}
              color="warning"
            />
            <KPICard
              label="GDespesas"
              value={formatCurrency(kpis.gDespesas)}
              icon={Wallet}
              trend="down"
              color="destructive"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
