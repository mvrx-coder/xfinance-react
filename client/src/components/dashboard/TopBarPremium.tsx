/**
 * TopBarPremium - Header premium com glassmorphism
 * 
 * Layout de 2 linhas:
 * - Linha 1: Logo + Saudação + Busca + Ações (notificações, logout)
 * - Linha 2: KPIs compactos + Botões de ação
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoMvrx from "@assets/logo_1766218677246.png";
import { 
  Search, 
  Plus, 
  Users, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Receipt, 
  LogOut, 
  Bell, 
  Settings,
  Zap
} from "lucide-react";
import type { KPIs } from "@shared/schema";

interface TopBarPremiumProps {
  userName?: string;
  kpis: KPIs;
  onSearch?: (query?: string) => void;
  onNewRecord: () => void;
  onOpenUsers: () => void;
  onOpenInvestments: () => void;
  onOpenFinancial: () => void;
  onOpenGuyPay: () => void;
  onOpenExpenses: () => void;
  onLogout: () => void;
}

export function TopBarPremium({
  userName = "Usuário",
  kpis,
  onSearch,
  onNewRecord,
  onOpenUsers,
  onOpenInvestments,
  onOpenFinancial,
  onOpenGuyPay,
  onOpenExpenses,
  onLogout,
}: TopBarPremiumProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  return (
    <header 
      className="topbar-premium border-b border-white/10"
      data-testid="topbar-premium"
    >
      <div className="px-6 py-4">
        {/* Linha Superior: Logo + Saudação + Busca + Ações */}
        <div className="flex items-center justify-between gap-6 mb-4">
          {/* Logo + Saudação */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={logoMvrx} 
                alt="xFinance" 
                className="h-8 w-auto"
                data-testid="img-logo"
              />
              <div>
                <h1 className="text-sm font-semibold text-foreground">
                  Olá, {userName}!
                </h1>
                <p className="text-xs text-muted-foreground font-mono">
                  {currentTime.toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })}{" "}
                  •{" "}
                  {currentTime.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Campo de Busca Global */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar inspeções, players, segurados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-10 pr-4 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all backdrop-blur-sm"
                data-testid="input-search-global"
              />
            </div>
          </form>

          {/* Ações do Header */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-white/10"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-white/10"
              data-testid="button-settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <div className="separator-gradient h-6" />
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Linha Inferior: KPIs + Botões de Ação */}
        <div className="flex items-center justify-between gap-6">
          {/* KPIs Compactos */}
          <div className="flex items-center gap-3">
            {/* EXPRESS KPI - Destaque */}
            <div className="kpi-express-glow px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className="bg-primary/20 text-primary border-primary/40 text-xs font-semibold"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  EXPRESS
                </Badge>
                <span className="font-mono text-primary text-lg font-bold tabular-nums">
                  {formatCurrency(kpis.express)}
                </span>
              </div>
            </div>

            <div className="separator-gradient h-10" />

            {/* Recebíveis */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Honorários</p>
                  <p className="font-mono text-success text-sm font-semibold tabular-nums">
                    {formatCurrency(kpis.honorarios)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-success" />
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Despesas</p>
                  <p className="font-mono text-success text-sm font-semibold tabular-nums">
                    {formatCurrency(kpis.despesas)}
                  </p>
                </div>
              </div>

              <div className="separator-gradient h-10" />

              {/* Pagamentos Guy - Amber */}
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-amber-500" />
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Guy Hon.</p>
                  <p className="font-mono text-amber-500 text-sm font-semibold tabular-nums">
                    {formatCurrency(kpis.guyHonorario)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-500" />
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Guy Desp.</p>
                  <p className="font-mono text-amber-500 text-sm font-semibold tabular-nums">
                    {formatCurrency(kpis.guyDespesa)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação - Estilo Central de Ações */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onNewRecord}
              className="gap-2 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border-green-500 text-green-400 shadow-green-500/20 hover:shadow-green-500/40 hover:bg-green-500/10"
              data-testid="button-new-record"
            >
              <Plus className="h-4 w-4" />
              Novo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenUsers}
              className="gap-2 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border-purple-500 text-purple-400 shadow-purple-500/20 hover:shadow-purple-500/40 hover:bg-purple-500/10"
              data-testid="button-users"
            >
              <Users className="h-4 w-4" />
              Usuários
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenInvestments}
              className="gap-2 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border-purple-500 text-purple-400 shadow-purple-500/20 hover:shadow-purple-500/40 hover:bg-purple-500/10"
              data-testid="button-investments"
            >
              <TrendingUp className="h-4 w-4" />
              Aportes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenFinancial}
              className="gap-2 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border-purple-500 text-purple-400 shadow-purple-500/20 hover:shadow-purple-500/40 hover:bg-purple-500/10"
              data-testid="button-financial"
            >
              <Zap className="h-4 w-4" />
              Performance
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenGuyPay}
              className="gap-2 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border-purple-500 text-purple-400 shadow-purple-500/20 hover:shadow-purple-500/40 hover:bg-purple-500/10"
              data-testid="button-guypay"
            >
              <Wallet className="h-4 w-4" />
              Guy Pay
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenExpenses}
              className="gap-2 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl border-purple-500 text-purple-400 shadow-purple-500/20 hover:shadow-purple-500/40 hover:bg-purple-500/10"
              data-testid="button-expenses"
            >
              <Receipt className="h-4 w-4" />
              Despesas
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

