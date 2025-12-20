import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Cloud,
  Gamepad2,
  Target,
  Database,
  Workflow,
  Receipt,
  CreditCard,
  DollarSign,
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
  }).format(value);
}

function formatDate(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());
}

function formatTime(): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
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
    <div
      className="flex flex-wrap items-center gap-3 p-3 mx-2 mt-2 rounded-xl bg-card border border-card-border shadow-lg"
      data-testid="topbar"
    >
      {/* Logo + Welcome Section */}
      <div className="flex items-center gap-3 min-w-[280px]">
        {/* Logo */}
        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MVR
          </span>
        </div>

        {/* Welcome Panel */}
        <div className="flex flex-col gap-1 px-4 py-2.5 rounded-lg bg-muted/50 border border-border/50">
          <span className="text-sm font-semibold text-foreground">
            Fala, {userName}!!!
          </span>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {currentTime}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Cloud className="w-3 h-3 text-accent" />
            <span className="text-accent font-medium">23°C</span>
            <span className="text-muted-foreground">Nublado</span>
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className="h-16 mx-1 bg-border/50" />

      {/* Filters Section */}
      <div className="flex items-center gap-3">
        {/* Toggle Filters */}
        <div className="flex flex-col gap-2 px-4 py-2.5 rounded-lg bg-muted/50 border border-border/50">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              id="player-toggle"
              checked={filters.player}
              onCheckedChange={(checked) =>
                handleFilterChange("player", checked === true)
              }
              data-testid="checkbox-player"
            />
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="font-medium">Player</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              id="myjob-toggle"
              checked={filters.myJob}
              onCheckedChange={(checked) =>
                handleFilterChange("myJob", checked === true)
              }
              data-testid="checkbox-myjob"
            />
            <Target className="w-4 h-4 text-warning" />
            <span className="font-medium">My Job</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              id="db-limit-toggle"
              checked={filters.dbLimit}
              onCheckedChange={(checked) =>
                handleFilterChange("dbLimit", checked === true)
              }
              data-testid="checkbox-dblimit"
            />
            <Database className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">DB Limit</span>
          </label>
        </div>

        {/* Column Groups */}
        <div className="flex flex-col gap-2 px-4 py-2.5 rounded-lg bg-muted/50 border border-border/50">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              id="workflow-toggle"
              checked={filters.columnGroups.workflow}
              onCheckedChange={(checked) =>
                handleColumnGroupChange("workflow", checked === true)
              }
              data-testid="checkbox-workflow"
            />
            <Workflow className="w-4 h-4 text-accent" />
            <span className="font-medium">Work Flow</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              id="recebiveis-toggle"
              checked={filters.columnGroups.recebiveis}
              onCheckedChange={(checked) =>
                handleColumnGroupChange("recebiveis", checked === true)
              }
              data-testid="checkbox-recebiveis"
            />
            <Receipt className="w-4 h-4 text-success" />
            <span className="font-medium">Recebíveis</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              id="pagamentos-toggle"
              checked={filters.columnGroups.pagamentos}
              onCheckedChange={(checked) =>
                handleColumnGroupChange("pagamentos", checked === true)
              }
              data-testid="checkbox-pagamentos"
            />
            <CreditCard className="w-4 h-4 text-warning" />
            <span className="font-medium">Pagamentos</span>
          </label>
        </div>
      </div>

      <Separator orientation="vertical" className="h-16 mx-1 bg-border/50" />

      {/* Actions Section */}
      <div className="flex items-center gap-3">
        {/* Primary Actions */}
        <div className="flex flex-col gap-2">
          <Button
            id="btn-search-inspections"
            onClick={onSearch}
            className="gap-2"
            data-testid="button-search"
          >
            <Search className="w-4 h-4" />
            Buscar
          </Button>
          <Button
            id="btn-open-new-record"
            onClick={onNewRecord}
            variant="secondary"
            className="gap-2"
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
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              data-testid="button-users"
            >
              <Users className="w-3.5 h-3.5" />
              Usuários
            </Button>
            <Button
              id="btn-investimentos"
              onClick={onOpenInvestments}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              data-testid="button-investments"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Aportes
            </Button>
            <Button
              id="btn-finance-control"
              onClick={onOpenFinancial}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
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
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
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
              className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              data-testid="button-logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <Separator orientation="vertical" className="h-16 mx-1 bg-border/50" />

      {/* KPIs Express Panel */}
      <div
        className="flex flex-col gap-1.5 px-4 py-2.5 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 min-w-[320px]"
        data-testid="panel-kpis"
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs font-semibold">
            <DollarSign className="w-3 h-3" />
            EXPRESS
          </Badge>
          <span className="text-lg font-bold text-success">
            {formatCurrency(kpis.express)}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Honorários:</span>
            <span className="font-semibold text-accent">
              {formatCurrency(kpis.honorarios)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">GHonorários:</span>
            <span className="font-semibold text-destructive">
              {formatCurrency(kpis.gHonorarios)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Despesas:</span>
            <span className="font-semibold text-warning">
              {formatCurrency(kpis.despesas)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">GDespesas:</span>
            <span className="font-semibold text-destructive">
              {formatCurrency(kpis.gDespesas)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
