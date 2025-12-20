import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TopBar } from "@/components/dashboard/TopBar";
import { DataGrid } from "@/components/dashboard/DataGrid";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { ToastContainer, type Toast } from "@/components/dashboard/ToastContainer";
import { NewRecordModal } from "@/components/dashboard/modals/NewRecordModal";
import { UsersModal } from "@/components/dashboard/modals/UsersModal";
import { InvestmentsModal } from "@/components/dashboard/modals/InvestmentsModal";
import { FinancialModal } from "@/components/dashboard/modals/FinancialModal";
import { GuyPayModal } from "@/components/dashboard/modals/GuyPayModal";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Inspection, FilterState, KPIs } from "@shared/schema";

export default function Dashboard() {
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

  const { data: inspections = [], isLoading: isLoadingInspections, refetch: refetchInspections } = useQuery<Inspection[]>({
    queryKey: ["/api/inspections"],
  });

  const { data: kpis = { express: 0, honorarios: 0, gHonorarios: 0, despesas: 0, gDespesas: 0 } } = useQuery<KPIs>({
    queryKey: ["/api/kpis"],
  });

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

  const handleLogout = useCallback(() => {
    addToast({
      type: "warning",
      title: "Logout",
      message: "Você será desconectado em breve",
      duration: 3000,
    });
  }, [addToast]);

  const handleRowClick = useCallback((inspection: Inspection) => {
    addToast({
      type: "info",
      title: "Registro selecionado",
      message: `ID: ${inspection.id} - ${inspection.segurado || "Sem nome"}`,
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
        userName="Marcus Vinicius"
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

      <FinancialModal
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
