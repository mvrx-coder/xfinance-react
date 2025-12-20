import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import logoMvrx from "@assets/logo_1766218677246.png";
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
  Coins,
  CloudSun,
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

function ExpressKPIPanel({ kpis }: { kpis: KPIs }) {
  return (
    <div
      className="flex flex-col justify-center h-[88px] px-4 py-2 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-white/10 backdrop-blur-sm"
      data-testid="panel-express-kpis"
    >
      {/* EXPRESS - Main Value */}
      <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-white/10">
        <Coins className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-semibold text-white/90 uppercase tracking-wide">EXPRESS</span>
        <span className="text-base font-bold text-amber-400 ml-1">
          {formatCurrency(kpis.express)}
        </span>
      </div>

      {/* Secondary Values Grid */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-white/60">Honorários:</span>
          <span className="text-sm font-medium text-violet-400">{formatCurrency(kpis.honorarios)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-white/60">GHonorários:</span>
          <span className="text-sm font-medium text-cyan-400">{formatCurrency(kpis.gHonorarios)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-white/60">Despesas:</span>
          <span className="text-sm font-medium text-rose-400">{formatCurrency(kpis.despesas)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-white/60">GDespesas:</span>
          <span className="text-sm font-medium text-rose-400">{formatCurrency(kpis.gDespesas)}</span>
        </div>
      </div>
    </div>
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
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        {/* Logo MVRX - Clean, no frame */}
        <div className="flex items-center justify-center h-[88px] px-2">
          <img 
            src={logoMvrx} 
            alt="MVRX Logo" 
            className="h-12 w-auto object-contain"
            data-testid="img-logo"
          />
        </div>

        {/* Welcome Panel */}
        <div className="flex flex-col justify-center gap-1 h-[88px] px-4 py-2 rounded-xl glass border border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-base font-semibold">Bora, {userName}!!! Vascoooo!</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              {formatDate()}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {currentTime}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CloudSun className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-400 font-medium">22°C</span>
            <span>Nublado</span>
          </div>
        </div>
      </motion.div>

      <Separator orientation="vertical" className="h-[88px] bg-white/10" />

      {/* Filters Section */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        {/* Toggle Filters */}
        <div className="flex flex-col justify-center gap-1.5 h-[88px] px-4 py-2 rounded-xl glass border border-white/10">
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <Checkbox
              id="player-toggle"
              checked={filters.player}
              onCheckedChange={(checked) =>
                handleFilterChange("player", checked === true)
              }
              className="border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              data-testid="checkbox-player"
            />
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="font-medium group-hover:text-primary transition-colors">Player</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <Checkbox
              id="myjob-toggle"
              checked={filters.myJob}
              onCheckedChange={(checked) =>
                handleFilterChange("myJob", checked === true)
              }
              className="border-warning/50 data-[state=checked]:bg-warning data-[state=checked]:border-warning"
              data-testid="checkbox-myjob"
            />
            <Target className="w-4 h-4 text-warning" />
            <span className="font-medium group-hover:text-warning transition-colors">My Job</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <Checkbox
              id="db-limit-toggle"
              checked={filters.dbLimit}
              onCheckedChange={(checked) =>
                handleFilterChange("dbLimit", checked === true)
              }
              className="border-muted-foreground/50"
              data-testid="checkbox-dblimit"
            />
            <Database className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium group-hover:text-foreground transition-colors">DB Limit</span>
          </label>
        </div>

        {/* Column Groups */}
        <div className="flex flex-col justify-center gap-1.5 h-[88px] px-4 py-2 rounded-xl glass border border-white/10">
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <Checkbox
              id="workflow-toggle"
              checked={filters.columnGroups.workflow}
              onCheckedChange={(checked) =>
                handleColumnGroupChange("workflow", checked === true)
              }
              className="border-accent/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              data-testid="checkbox-workflow"
            />
            <Workflow className="w-4 h-4 text-accent" />
            <span className="font-medium group-hover:text-accent transition-colors">Work Flow</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <Checkbox
              id="recebiveis-toggle"
              checked={filters.columnGroups.recebiveis}
              onCheckedChange={(checked) =>
                handleColumnGroupChange("recebiveis", checked === true)
              }
              className="border-success/50 data-[state=checked]:bg-success data-[state=checked]:border-success"
              data-testid="checkbox-recebiveis"
            />
            <Receipt className="w-4 h-4 text-success" />
            <span className="font-medium group-hover:text-success transition-colors">Recebíveis</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer group">
            <Checkbox
              id="pagamentos-toggle"
              checked={filters.columnGroups.pagamentos}
              onCheckedChange={(checked) =>
                handleColumnGroupChange("pagamentos", checked === true)
              }
              className="border-warning/50 data-[state=checked]:bg-warning data-[state=checked]:border-warning"
              data-testid="checkbox-pagamentos"
            />
            <CreditCard className="w-4 h-4 text-warning" />
            <span className="font-medium group-hover:text-warning transition-colors">Pagamentos</span>
          </label>
        </div>
      </motion.div>

      <Separator orientation="vertical" className="h-[88px] bg-white/10" />

      {/* Actions Section - Styled buttons matching reference */}
      <motion.div variants={itemVariants} className="flex items-center">
        <div className="flex flex-col justify-center gap-2 h-[88px] px-2">
          {/* Row 1: Buscar, Usuários, Aportes, Financial */}
          <div className="flex items-center gap-2">
            <Button
              id="btn-search-inspections"
              onClick={onSearch}
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm rounded-full border-primary/50 bg-slate-900/80 text-primary backdrop-blur-sm px-4"
              data-testid="button-search"
            >
              <Search className="w-4 h-4" />
              Buscar
            </Button>
            <Button
              id="btn-open-users"
              onClick={onOpenUsers}
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm rounded-full border-white/20 bg-slate-900/80 text-foreground backdrop-blur-sm px-4"
              data-testid="button-users"
            >
              <Users className="w-4 h-4 text-primary" />
              Usuários
            </Button>
            <Button
              id="btn-investimentos"
              onClick={onOpenInvestments}
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm rounded-full border-white/20 bg-slate-900/80 text-foreground backdrop-blur-sm px-4"
              data-testid="button-investments"
            >
              <TrendingUp className="w-4 h-4 text-success" />
              Aportes
            </Button>
            <Button
              id="btn-finance-control"
              onClick={onOpenFinancial}
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm rounded-full border-white/20 bg-slate-900/80 text-foreground backdrop-blur-sm px-4"
              data-testid="button-financial"
            >
              <PieChart className="w-4 h-4 text-violet-400" />
              Financial
            </Button>
          </div>
          {/* Row 2: Novo, Guy Pay, Em breve, Logout */}
          <div className="flex items-center gap-2">
            <Button
              id="btn-open-new-record"
              onClick={onNewRecord}
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm rounded-full border-accent bg-slate-900/80 text-accent backdrop-blur-sm px-4"
              data-testid="button-new"
            >
              <Plus className="w-4 h-4" />
              Novo
            </Button>
            <Button
              id="btn-open-guy-pay"
              onClick={onOpenGuyPay}
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm rounded-full border-white/20 bg-slate-900/80 text-foreground backdrop-blur-sm px-4"
              data-testid="button-guypay"
            >
              <Wallet className="w-4 h-4 text-warning" />
              Guy Pay
            </Button>
            <Button
              id="btn-coming-soon"
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm rounded-full border-white/20 bg-slate-900/80 text-muted-foreground backdrop-blur-sm px-4"
              disabled
              data-testid="button-coming-soon"
            >
              <Puzzle className="w-4 h-4" />
              Em breve
            </Button>
            <Button
              id="btn-logout"
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="gap-1.5 text-sm rounded-full border-orange-500/70 bg-slate-900/80 text-orange-400 backdrop-blur-sm px-4"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      <Separator orientation="vertical" className="h-[88px] bg-white/10" />

      {/* KPIs Express Panel - Consolidated */}
      <motion.div variants={itemVariants} data-testid="panel-kpis">
        <ExpressKPIPanel kpis={kpis} />
      </motion.div>
    </motion.div>
  );
}
