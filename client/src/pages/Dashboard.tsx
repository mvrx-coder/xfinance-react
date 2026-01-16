/**
 * Dashboard Principal - xFinance
 * 
 * Usa useAuth do contexto centralizado para dados do usuário.
 * A proteção de rota é feita pelo ProtectedRoute no App.tsx.
 */

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { TopBarPremium, type TaskStats } from "@/components/dashboard/TopBarPremium";
import { CollapsibleSidebar } from "@/components/dashboard/CollapsibleSidebar";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { NewRecordModal } from "@/components/dashboard/modals/NewRecordModal";
import { UsersModal } from "@/components/dashboard/modals/UsersModal";
import { InvestmentsModal } from "@/components/dashboard/modals/InvestmentsModal";
import { PerformanceModalNew as PerformanceModal } from "@/components/dashboard/modals/PerformanceModalNew";
import { GuyPayModal } from "@/components/dashboard/modals/GuyPayModal";
import { ExpensesModal } from "@/components/dashboard/modals/ExpensesModal";
import { SettingsModal } from "@/components/dashboard/modals/SettingsModal";
import { fetchInspections, type InspectionsResponse, type FetchOptions } from "@/services/api/inspections";
import { fetchContrOptions, fetchSegurOptions, type LookupOption } from "@/services/api/lookups";
import { useAuth, useKPIs } from "@/hooks";
import type { FilterState, Inspection } from "@shared/schema";

export default function Dashboard() {
  // Autenticação via contexto global
  const { user, logout: authLogout, papel } = useAuth();
  
  const [filters, setFilters] = useState<FilterState>({
    player: false,
    myJob: false,
    dbLimit: false,
    columnGroups: {
      people: true,
      workflow: true,
      recebiveis: true,
      pagamentos: true,
    },
  });

  const [statusMessages, setStatusMessages] = useState<
    Array<{ id: string; type: "success" | "error" | "warning" | "info"; message: string }>
  >([]);

  const [modals, setModals] = useState({
    newRecord: false,
    users: false,
    investments: false,
    financial: false,
    guyPay: false,
    expenses: false,
    backup: false,
  });

  // Inspeção selecionada para ações na sidebar
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  // Montar opções de busca baseadas nos filtros
  const fetchOptions: FetchOptions = {
    order: filters.player ? "player" : "normal",
    limit: filters.dbLimit ? 800 : undefined,
    myJob: filters.myJob,
  };

  // Buscar inspeções da API
  const { 
    data: inspectionsResponse, 
    isLoading: isLoadingInspections, 
    refetch: refetchInspections,
  } = useQuery<InspectionsResponse>({
    queryKey: ["inspections", fetchOptions],
    queryFn: () => fetchInspections(fetchOptions),
    retry: false,
  });

  // Extrair dados do response
  const inspections = inspectionsResponse?.data || [];
  const totalRecords = inspectionsResponse?.total || 0;

  // Buscar lookups para ações (só quando há seleção)
  const { data: contrLookup = [] } = useQuery<LookupOption[]>({
    queryKey: ["lookups", "contratantes"],
    queryFn: fetchContrOptions,
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedInspection,
  });
  const { data: segurLookup = [] } = useQuery<LookupOption[]>({
    queryKey: ["lookups", "segurados"],
    queryFn: fetchSegurOptions,
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedInspection,
  });

  // KPIs Express (totais financeiros pendentes)
  const { data: kpis = { 
    express: 0, 
    honorarios: 0, 
    guyHonorario: 0, 
    despesas: 0, 
    guyDespesa: 0 
  }} = useKPIs();

  // Calcular stats de tarefas do usuário (grupos 1 e 2 filtrados por guilty)
  const taskStats = useMemo<TaskStats>(() => {
    const userNick = user?.nick;
    if (!userNick || !inspections.length) {
      return { totalCases: 0, startedCases: 0, urgentCases: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Função auxiliar para verificar se data é válida e preenchida
    const isFilled = (v: string | null | undefined): boolean => {
      const s = (v || "").trim();
      return s !== "" && s !== "-";
    };

    // Função auxiliar para verificar se inspeção <= hoje
    const isInspectionDone = (dtInspecao: string | null | undefined): boolean => {
      if (!isFilled(dtInspecao)) return false;
      const s = (dtInspecao || "").trim();
      // Formato ISO: YYYY-MM-DD
      if (s.includes("-") && s.length >= 10) {
        const dt = new Date(s.slice(0, 10));
        return dt <= today;
      }
      return false;
    };

    let totalCases = 0;
    let startedCases = 0;
    let urgentCases = 0;

    for (const insp of inspections) {
      // Filtrar apenas casos do usuário (por guilty)
      if (insp.guilty !== userNick) continue;

      const hasEnvio = isFilled(insp.dtEnvio);
      const hasPago = isFilled(insp.dtPago);
      const hasDenvio = isFilled(insp.dtDenvio);

      // Grupos 1 e 2 (em andamento - ainda não pago)
      // Grupo 1: dt_envio IS NULL AND dt_pago IS NULL
      // Grupo 2: dt_envio IS NOT NULL AND dt_pago IS NULL
      const isGroup1or2 = !hasPago;

      if (!isGroup1or2) continue;

      totalCases++;

      // Casos iniciados: inspeção <= hoje E (envio ou denvio preenchidos)
      const inspDone = isInspectionDone(insp.dtInspecao);
      if (inspDone && (hasEnvio || hasDenvio)) {
        startedCases++;
      }

      // Urgentes: dot vermelho = grupo 2 (envio preenchido, pago vazio)
      if (hasEnvio && !hasPago) {
        urgentCases++;
      }
    }

    return { totalCases, startedCases, urgentCases };
  }, [inspections, user?.nick]);

  // Handlers
  const dismissStatus = useCallback((id: string) => {
    setStatusMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleSearch = useCallback(() => {
    refetchInspections();
    toast.info("Buscando...", {
      description: "Atualizando dados do grid",
    });
  }, [refetchInspections]);

  const handleOpenModal = useCallback((modal: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modal]: true }));
  }, []);

  const handleCloseModal = useCallback((modal: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modal]: false }));
  }, []);

  const handleLogout = useCallback(async () => {
    toast.warning("Logout", {
      description: "Você será desconectado...",
    });
    
    await authLogout();
    // Redirecionamento é automático via ProtectedRoute quando isAuthenticated muda
  }, [authLogout]);

  const handleRowClick = useCallback((inspection: Inspection) => {
    // Toggle seleção: se clicar na mesma, desmarca
    if (selectedInspection?.idPrinc === inspection.idPrinc) {
      setSelectedInspection(null);
    } else {
      setSelectedInspection(inspection);
      toast.info("Registro selecionado", {
        description: `ID: ${inspection.idPrinc} - ${inspection.segurado || "Sem nome"}`,
      });
    }
  }, [selectedInspection]);

  const handleClearSelection = useCallback(() => {
    setSelectedInspection(null);
  }, []);

  const handleNewRecordSuccess = useCallback(() => {
    handleCloseModal("newRecord");
    refetchInspections();
    toast.success("Sucesso!", {
      description: "Novo registro criado com sucesso",
    });
  }, [handleCloseModal, refetchInspections]);

  // Nome de exibição do usuário
  const displayName = user?.short_nome || user?.nick || user?.nome || "Usuário";

  return (
    <div className="flex flex-col h-screen bg-depth-gradient" data-testid="dashboard">
      {/* Top Bar Premium */}
      <TopBarPremium
        userName={displayName}
        userRole={papel ?? undefined}
        kpis={kpis}
        taskStats={taskStats}
        onSearch={handleSearch}
        onNewRecord={() => handleOpenModal("newRecord")}
        onOpenUsers={() => handleOpenModal("users")}
        onOpenInvestments={() => handleOpenModal("investments")}
        onOpenFinancial={() => handleOpenModal("financial")}
        onOpenGuyPay={() => handleOpenModal("guyPay")}
        onOpenExpenses={() => handleOpenModal("expenses")}
        onOpenBackup={() => handleOpenModal("backup")}
        onLogout={handleLogout}
      />

      {/* Status Bar */}
      <StatusBar messages={statusMessages} onDismiss={dismissStatus} />

      {/* Main Content: Sidebar + Grid */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar Colapsável */}
        <CollapsibleSidebar 
          filters={filters} 
          onFiltersChange={setFilters}
          selectedInspection={selectedInspection}
          onClearSelection={handleClearSelection}
          onRefresh={handleSearch}
          userRole={papel ?? undefined}
          contrLookup={contrLookup}
          segurLookup={segurLookup}
        />

        {/* Main Grid */}
        <main className="flex-1 overflow-hidden">
          <DataGrid
            data={inspections}
            filters={filters}
            isLoading={isLoadingInspections}
            onRowClick={handleRowClick}
            onRefresh={handleSearch}
            userRole={papel ?? undefined}
          />
        </main>
      </div>

      {/* Modals */}
      <NewRecordModal
        isOpen={modals.newRecord}
        onClose={() => handleCloseModal("newRecord")}
        onSuccess={handleNewRecordSuccess}
      />

      <UsersModal
        isOpen={modals.users}
        onClose={() => handleCloseModal("users")}
      />

      <InvestmentsModal
        isOpen={modals.investments}
        onClose={() => handleCloseModal("investments")}
      />

      <PerformanceModal
        isOpen={modals.financial}
        onClose={() => handleCloseModal("financial")}
      />

      <GuyPayModal
        isOpen={modals.guyPay}
        onClose={() => handleCloseModal("guyPay")}
      />

      <ExpensesModal
        isOpen={modals.expenses}
        onClose={() => handleCloseModal("expenses")}
      />

      <SettingsModal
        isOpen={modals.backup}
        onClose={() => handleCloseModal("backup")}
        selectedIdPrinc={selectedInspection?.idPrinc}
        selectedSegurado={selectedInspection?.segurado}
      />
    </div>
  );
}
