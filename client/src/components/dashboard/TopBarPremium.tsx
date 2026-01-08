/**
 * TopBarPremium - Header premium com glassmorphism
 * 
 * Layout horizontal único:
 * Logo | Saudação Dinâmica | Clima | Badges Tarefas | KPIs | Botões (2x3) | Ações
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogoSet, useWeather, type WeatherCondition } from "@/hooks";
import { 
  Plus, 
  Users, 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  Receipt, 
  LogOut, 
  Bell, 
  Settings,
  Zap,
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import type { KPIs } from "@shared/schema";

// ============================================
// CONSTANTES DE CLIMA
// ============================================

const weatherIcons = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  "partly-cloudy": CloudSun,
  night: Moon,
  "night-cloudy": Cloud,
};

const weatherGradients = {
  sunny: "from-amber-500/20 via-orange-500/10 to-yellow-500/5",
  cloudy: "from-slate-400/20 via-slate-500/10 to-slate-600/5",
  rainy: "from-blue-500/20 via-cyan-500/10 to-slate-500/5",
  "partly-cloudy": "from-amber-500/15 via-slate-400/10 to-blue-500/5",
  night: "from-indigo-500/20 via-purple-500/10 to-slate-800/5",
  "night-cloudy": "from-slate-600/20 via-indigo-500/10 to-slate-800/5",
};

const conditionLabels = {
  sunny: "Ensolarado",
  cloudy: "Nublado",
  rainy: "Chuvoso",
  "partly-cloudy": "Parc. nublado",
  night: "Noite clara",
  "night-cloudy": "Noite nublada",
};

// ============================================
// INTERFACE
// ============================================

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

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function TopBarPremium({
  userName = "Usuário",
  kpis,
  onNewRecord,
  onOpenUsers,
  onOpenInvestments,
  onOpenFinancial,
  onOpenGuyPay,
  onOpenExpenses,
  onLogout,
}: TopBarPremiumProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sessionStart] = useState(() => new Date()); // Momento do login (reseta a cada montagem)
  const { logos, cycleLogo } = useLogoSet();

  // Atualiza a cada minuto (para tempo logado e relógio)
  useEffect(() => {
    // Atualiza imediatamente
    setCurrentTime(new Date());
    // Depois atualiza a cada minuto
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ============================================
  // HELPERS
  // ============================================

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return { text: "Bom dia", icon: Sun, color: "text-amber-400" };
    if (hour >= 12 && hour < 18) return { text: "Boa tarde", icon: CloudSun, color: "text-orange-400" };
    return { text: "Boa noite", icon: Moon, color: "text-indigo-400" };
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  // Usa o userName completo (short_nome do usuário logado)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
    }).replace(/^\w/, (c) => c.toUpperCase());
  };

  const getSessionDuration = () => {
    const diffMs = currentTime.getTime() - sessionStart.getTime();
    const totalMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  // ============================================
  // CLIMA (API real ou fallback mockado)
  // ============================================

  const { weather: weatherData, isLoading: isWeatherLoading } = useWeather();
  
  // Fallback para quando não há dados
  const weather = weatherData ?? {
    temperature: 24,
    feelsLike: 26,
    condition: "partly-cloudy" as WeatherCondition,
    humidity: 65,
    windSpeed: 12,
    conditionText: "Parcialmente nublado",
    location: "São Paulo",
    updatedAt: new Date(),
  };

  const WeatherIcon = weatherIcons[weather.condition];

  // TODO: Integrar com dados reais do backend
  const stats = {
    todayInspections: 5,
    pendingTasks: 8,
    urgentItems: 2,
  };

  // Estilo base dos botões (largura fixa para uniformidade - baseada em "Performance")
  const btnBaseClass = "w-[118px] gap-1.5 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl";
  const btnPurpleClass = `${btnBaseClass} border-purple-500 text-purple-400 shadow-purple-500/20 hover:shadow-purple-500/40 hover:bg-purple-500/10`;
  const btnGreenClass = `${btnBaseClass} border-green-500 text-green-400 shadow-green-500/20 hover:shadow-green-500/40 hover:bg-green-500/10`;

  return (
    <TooltipProvider>
      <header 
        className="topbar-premium"
        data-testid="topbar-premium"
      >
        {/* Camada 1: Gradiente Horizontal */}
        <div className="topbar-premium-gradient" aria-hidden="true" />
        
        {/* Camada 2: Grid Pattern */}
        <div className="topbar-premium-grid" aria-hidden="true" />
        
        {/* Camada 3: Conteúdo */}
        <div className="topbar-premium-content px-4 py-3">
          <div className="flex items-center gap-4">
            
            {/* ====== 1. LOGO (maior) ====== */}
            <div className="flex-shrink-0">
              <img 
                src={logos.toolbar} 
                alt="xFinance" 
                className="h-16 w-auto cursor-pointer select-none"
                data-testid="img-logo"
                title="Duplo clique para alternar tema do logo"
                onDoubleClick={cycleLogo}
              />
            </div>

            <div className="separator-gradient h-14" />

            {/* ====== 2. SAUDAÇÃO DINÂMICA ====== */}
            <div className="flex flex-col min-w-[180px]">
              {/* Greeting */}
              <div className="flex items-center gap-2">
                <GreetingIcon className={`h-5 w-5 ${greeting.color} flex-shrink-0`} />
                <h1 className="text-xl font-semibold text-white whitespace-nowrap">
                  {greeting.text},{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {userName}
                  </span>
                  !
                </h1>
              </div>
              {/* Data */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-slate-500" />
                <p className="text-sm text-slate-400 whitespace-nowrap">
                  {formatDate()}
                </p>
              </div>
              {/* Hora + Tempo Logado */}
              <div className="flex items-center gap-3 mt-0.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-mono text-sm text-slate-300 tabular-nums">
                    {currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-500">Logado:</span>
                  <span className="font-mono text-xs text-primary/80 tabular-nums">
                    {getSessionDuration()}
                  </span>
                </div>
              </div>
            </div>

            <div className="separator-gradient h-14" />

            {/* ====== 3. CARD DE CLIMA ====== */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`hidden lg:flex p-3 rounded-xl bg-gradient-to-br ${weatherGradients[weather.condition]} bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm hover:bg-white/[0.05] transition-colors cursor-pointer`}
                >
                  <div className="flex items-center gap-3">
                    {/* Weather Icon */}
                    <WeatherIcon
                      className={`h-10 w-10 ${
                        weather.condition === "sunny"
                          ? "text-amber-400"
                          : weather.condition === "rainy"
                            ? "text-blue-400"
                            : weather.condition === "night"
                              ? "text-indigo-300"
                              : "text-slate-300"
                      }`}
                    />

                    {/* Temperature */}
                    <div>
                      <div className="flex items-start">
                        <span className="text-2xl font-bold text-white tabular-nums font-mono">{weather.temperature}</span>
                        <span className="text-sm text-slate-400 ml-0.5">°C</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{weather.conditionText || conditionLabels[weather.condition]}</p>
                      <p className="text-[9px] text-slate-500">{weather.location}</p>
                    </div>

                    {/* Additional Weather Info (XL screens) */}
                    <div className="hidden xl:flex flex-col gap-1 pl-3 border-l border-white/[0.06]">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className="h-3 w-3 text-orange-400" />
                        <span className="text-[10px] text-slate-400">
                          Sens: <span className="text-slate-300 font-mono">{weather.feelsLike}°</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Droplets className="h-3 w-3 text-blue-400" />
                        <span className="text-[10px] text-slate-400">
                          <span className="text-slate-300 font-mono">{weather.humidity}%</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wind className="h-3 w-3 text-cyan-400" />
                        <span className="text-[10px] text-slate-400">
                          <span className="text-slate-300 font-mono">{weather.windSpeed} km/h</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-slate-800 border-slate-700">
                <p>Previsão para {weather.location}</p>
              </TooltipContent>
            </Tooltip>

            <div className="separator-gradient h-14 hidden lg:block" />

            {/* ====== 4. BADGES DE TAREFAS ====== */}
            <div className="hidden md:flex flex-col gap-1">
              {/* Inspeções Hoje */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors cursor-pointer">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm text-slate-300 tabular-nums font-semibold">{stats.todayInspections}</span>
                    <span className="text-xs text-slate-400">hoje</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-800 border-slate-700">
                  <p>Inspeções agendadas para hoje</p>
                </TooltipContent>
              </Tooltip>

              {/* Pendentes */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors cursor-pointer">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-slate-300 tabular-nums font-semibold">{stats.pendingTasks}</span>
                    <span className="text-xs text-slate-400">pendentes</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-slate-800 border-slate-700">
                  <p>Tarefas pendentes de conclusão</p>
                </TooltipContent>
              </Tooltip>

              {/* Urgentes (só aparece se > 0) */}
              {stats.urgentItems > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-destructive/10 border border-destructive/30 cursor-pointer animate-pulse">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-destructive tabular-nums font-semibold">{stats.urgentItems}</span>
                      <span className="text-xs text-destructive/80">urgentes</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="bg-slate-800 border-slate-700">
                    <p>Itens que requerem atenção imediata</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            <div className="separator-gradient h-14 hidden md:block" />

            {/* ====== 5. KPIs - Layout Vertical 3 Linhas (compacto) ====== */}
            <div className="hidden lg:flex flex-col gap-1.5 px-3 py-2 rounded-xl bg-slate-900/40 border border-white/[0.06]">
              {/* Linha 1: EXPRESS */}
              <div className="flex items-center gap-2 pb-1.5 border-b border-white/10">
                <Badge 
                  variant="outline" 
                  className="bg-primary/20 text-primary border-primary/40 text-[10px] font-semibold px-1.5"
                >
                  <Zap className="w-3 h-3 mr-0.5" />
                  EXPRESS
                </Badge>
                <span className="font-mono text-primary text-xl font-bold tabular-nums">
                  {formatCurrency(kpis.express)}
                </span>
              </div>

              {/* Linha 2: Honorários + Despesas (verde) - só ícone + valor */}
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="font-mono text-success text-sm font-semibold tabular-nums">
                    {formatCurrency(kpis.honorarios)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Receipt className="h-4 w-4 text-success" />
                  <span className="font-mono text-success text-sm font-semibold tabular-nums">
                    {formatCurrency(kpis.despesas)}
                  </span>
                </div>
              </div>

              {/* Linha 3: Guy Hon + Guy Desp (âmbar) - só ícone + valor */}
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-1.5">
                  <Wallet className="h-4 w-4 text-amber-500" />
                  <span className="font-mono text-amber-500 text-sm font-semibold tabular-nums">
                    {formatCurrency(kpis.guyHonorario)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-amber-500" />
                  <span className="font-mono text-amber-500 text-sm font-semibold tabular-nums">
                    {formatCurrency(kpis.guyDespesa)}
                  </span>
                </div>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* ====== 6. BOTÕES (2 linhas x 3 colunas) ====== */}
            <div className="flex flex-col gap-1.5">
              {/* Linha 1: Novo, Usuários, Aportes */}
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onNewRecord}
                  className={btnGreenClass}
                  data-testid="button-new-record"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Novo
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenUsers}
                  className={btnPurpleClass}
                  data-testid="button-users"
                >
                  <Users className="h-3.5 w-3.5" />
                  Usuários
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenInvestments}
                  className={btnPurpleClass}
                  data-testid="button-investments"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Aportes
                </Button>
              </div>
              {/* Linha 2: Performance, Guy Pay, Despesas */}
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenFinancial}
                  className={btnPurpleClass}
                  data-testid="button-financial"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Performance
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenGuyPay}
                  className={btnPurpleClass}
                  data-testid="button-guypay"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  Guy Pay
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenExpenses}
                  className={btnPurpleClass}
                  data-testid="button-expenses"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  Despesas
                </Button>
              </div>
            </div>

            <div className="separator-gradient h-12" />

            {/* ====== 7. AÇÕES (sino, engrenagem, sair) ====== */}
            <div className="flex items-center gap-1.5">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
                data-testid="button-notifications"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={onLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
