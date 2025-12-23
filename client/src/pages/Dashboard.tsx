import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { TopBar } from "@/components/dashboard/TopBar";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { ToastContainer, type Toast } from "@/components/dashboard/ToastContainer";
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

  const [toasts, setToasts] = useState<Toast[]>([]);

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

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissStatus = useCallback((id: string) => {
    setStatusMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleSearch = useCallback(() => {
    refetchInspections();
    addToast({
      type: "info",
      title: "Buscando...",
      message: "Atualizando dados do grid",
      duration: 3000,
    });
  }, [refetchInspections, addToast]);

  const handleOpenModal = useCallback((modal: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modal]: true }));
  }, []);

  const handleCloseModal = useCallback((modal: keyof typeof modals) => {
    setModals((prev) => ({ ...prev, [modal]: false }));
  }, []);

  const handleLogout = useCallback(async () => {
    addToast({
      type: "warning",
      title: "Logout",
      message: "Você será desconectado...",
      duration: 2000,
    });
    
    await logout();
    localStorage.removeItem("xfinance_user");
    setLocation("/login");
  }, [addToast, setLocation]);

  const handleRowClick = useCallback((inspection: Inspection) => {
    addToast({
      type: "info",
      title: "Registro selecionado",
      message: `ID: ${inspection.idPrinc} - ${inspection.segurado || "Sem nome"}`,
      duration: 3000,
    });
  }, [addToast]);

  const handleNewRecordSuccess = useCallback(() => {
    handleCloseModal("newRecord");
    refetchInspections();
    addToast({
      type: "success",
      title: "Sucesso!",
      message: "Novo registro criado com sucesso",
      duration: 4000,
    });
  }, [handleCloseModal, refetchInspections, addToast]);

  return (
    <div className="flex flex-col h-screen bg-background" data-testid="dashboard">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

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
