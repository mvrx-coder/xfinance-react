import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { TopBar } from "@/components/dashboard/TopBar";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { NewRecordModal } from "@/components/dashboard/modals/NewRecordModal";
import { UsersModal } from "@/components/dashboard/modals/UsersModal";
import { InvestmentsModal } from "@/components/dashboard/modals/InvestmentsModal";
import { PerformanceModal } from "@/components/dashboard/modals/PerformanceModal";
import { GuyPayModal } from "@/components/dashboard/modals/GuyPayModal";
import { fetchInspections, type InspectionsResponse, type FetchOptions } from "@/services/api/inspections";
import { logout, getCurrentUser, type UserData } from "@/services/api/auth";
import type { FilterState, KPIs, Inspection } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    player: false,
    myJob: false,
    dbLimit: true,
    columnGroups: {
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
  });

  // Carregar usuário atual
  useEffect(() => {
    // Primeiro tenta do localStorage (cache)
    const cachedUser = localStorage.getItem("xfinance_user");
    if (cachedUser) {
      setCurrentUser(JSON.parse(cachedUser));
    }
    
    // Depois valida com o backend
    getCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
        localStorage.setItem("xfinance_user", JSON.stringify(user));
      } else {
        // Não autenticado - redireciona para login
        localStorage.removeItem("xfinance_user");
        setLocation("/login");
      }
    });
  }, [setLocation]);

  // Montar opções de busca baseadas nos filtros
  const fetchOptions: FetchOptions = {
    order: filters.player ? "player" : "normal",
    limit: filters.dbLimit ? 800 : undefined,
    myJob: filters.myJob,
  };

  // Buscar inspeções da API real
  const { 
    data: inspectionsResponse, 
    isLoading: isLoadingInspections, 
    refetch: refetchInspections,
    error: inspectionsError
  } = useQuery<InspectionsResponse>({
    queryKey: ["inspections", fetchOptions],
    queryFn: () => fetchInspections(fetchOptions),
    enabled: !!currentUser, // Só busca se usuário estiver logado
    retry: false,
  });

  // Extrair dados do response
  const inspections = inspectionsResponse?.data || [];
  const totalRecords = inspectionsResponse?.total || 0;

  // KPIs (ainda mock - será implementado depois)
  const kpis: KPIs = { express: totalRecords, honorarios: 0, guyHonorario: 0, despesas: 0, guyDespesa: 0 };

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (inspectionsError?.message === "Não autenticado") {
      localStorage.removeItem("xfinance_user");
      setLocation("/login");
    }
  }, [inspectionsError, setLocation]);

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
    
    await logout();
    localStorage.removeItem("xfinance_user");
    setLocation("/login");
  }, [setLocation]);

  const handleRowClick = useCallback((inspection: Inspection) => {
    toast.info("Registro selecionado", {
      description: `ID: ${inspection.idPrinc} - ${inspection.segurado || "Sem nome"}`,
    });
  }, []);

  const handleNewRecordSuccess = useCallback(() => {
    handleCloseModal("newRecord");
    refetchInspections();
    toast.success("Sucesso!", {
      description: "Novo registro criado com sucesso",
    });
  }, [handleCloseModal, refetchInspections]);

  return (
    <div className="flex flex-col h-screen bg-depth-gradient" data-testid="dashboard">
      {/* Top Bar */}
      <TopBar
        userName={currentUser?.short_nome || currentUser?.nick || currentUser?.nome || "Usuário"}
        kpis={kpis}
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
        onNewRecord={() => handleOpenModal("newRecord")}
        onOpenUsers={() => handleOpenModal("users")}
        onOpenInvestments={() => handleOpenModal("investments")}
        onOpenFinancial={() => handleOpenModal("financial")}
        onOpenGuyPay={() => handleOpenModal("guyPay")}
        onLogout={handleLogout}
      />

      {/* Status Bar */}
      <StatusBar messages={statusMessages} onDismiss={dismissStatus} />

      {/* Main Grid */}
      <DataGrid
        data={inspections}
        filters={filters}
        isLoading={isLoadingInspections}
        onRowClick={handleRowClick}
        onRefresh={handleSearch}
        userRole={currentUser?.papel}
      />

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
    </div>
  );
}
