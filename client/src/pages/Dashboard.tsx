/**
 * Dashboard Principal - xFinance
 * 
 * Usa useAuth do contexto centralizado para dados do usuário.
 * A proteção de rota é feita pelo ProtectedRoute no App.tsx.
 */

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { TopBarPremium } from "@/components/dashboard/TopBarPremium";
import { CollapsibleSidebar } from "@/components/dashboard/CollapsibleSidebar";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { NewRecordModal } from "@/components/dashboard/modals/NewRecordModal";
import { UsersModal } from "@/components/dashboard/modals/UsersModal";
import { InvestmentsModal } from "@/components/dashboard/modals/InvestmentsModal";
import { PerformanceModal } from "@/components/dashboard/modals/PerformanceModal";
import { GuyPayModal } from "@/components/dashboard/modals/GuyPayModal";
import { ExpensesModal } from "@/components/dashboard/modals/ExpensesModal";
import { fetchInspections, type InspectionsResponse, type FetchOptions } from "@/services/api/inspections";
import { fetchContrOptions, fetchSegurOptions, type LookupOption } from "@/services/api/lookups";
import { useAuth } from "@/hooks";
import type { FilterState, KPIs, Inspection } from "@shared/schema";

export default function Dashboard() {
  // Autenticação via contexto global
  const { user, logout: authLogout, papel } = useAuth();
  
  const [filters, setFilters] = useState<FilterState>({
    player: false,
    myJob: false,
    dbLimit: true,
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

  // KPIs (mock - será implementado depois com endpoint dedicado)
  const kpis: KPIs = { 
    express: totalRecords, 
    honorarios: 0, 
    guyHonorario: 0, 
    despesas: 0, 
    guyDespesa: 0 
  };

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
        kpis={kpis}
        onSearch={handleSearch}
        onNewRecord={() => handleOpenModal("newRecord")}
        onOpenUsers={() => handleOpenModal("users")}
        onOpenInvestments={() => handleOpenModal("investments")}
        onOpenFinancial={() => handleOpenModal("financial")}
        onOpenGuyPay={() => handleOpenModal("guyPay")}
        onOpenExpenses={() => handleOpenModal("expenses")}
        onLogout={handleLogout}
      />

      {/* Status Bar */}
      <StatusBar messages={statusMessages} onDismiss={dismissStatus} />

      {/* Main Content: Sidebar + Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Colapsável */}
        <CollapsibleSidebar 
          filters={filters} 
          onFiltersChange={setFilters}
          selectedInspection={selectedInspection}
          onClearSelection={handleClearSelection}
          onRefresh={handleSearch}
          userRole={papel}
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
            userRole={papel}
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
    </div>
  );
}
