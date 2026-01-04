import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSpreadsheet,
  Eye,
  Edit3,
  Briefcase,
  Clock,
  Wallet,
  Receipt,
  CreditCard,
  FileText,
  FilterX,
  Check,
  X,
} from "lucide-react";
import type { Inspection, FilterState } from "@shared/schema";
import {
  fetchAtiviOptions,
  fetchUfOptions,
  fetchUsersOptions as fetchUsersLookup,
  type LookupOption,
} from "@/services/api/lookups";
import { updateInspectionField } from "@/services/api/inspections";
import { EditableCell } from "./EditableCell";
import { AlertCell } from "./AlertCell";
import { ColumnFilter } from "./ColumnFilter";
import { 
  getActionColorClass, 
  getActionClasses as getStatusActionClasses,
  StatusLegendTooltip 
} from "./StatusTooltip";
import {
  getInspecaoAlert,
  getAcertoAlert,
  getDEnvioAlert,
  getGPagoAlert,
  getGDPagoAlert,
} from "./alertRules";
import { toast } from "sonner";
import { useDataGrid } from "@/hooks/useDataGrid";
import { flexRender, Column } from "@tanstack/react-table";

interface DataGridProps {
  data: Inspection[];
  filters: FilterState;
  isLoading?: boolean;
  onRowClick?: (inspection: Inspection) => void;
  onRefresh?: () => void;
  userRole?: string | null;
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  // Formatar de yyyy-mm-dd para dd/mm (visual apenas - ordenação usa valor original)
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`;
  }
  return dateStr;
}

// Ícone de Meta: check verde (1) ou X vermelho (0)
function MetaIcon({ meta }: { meta: number | null | undefined }) {
  if (meta === 1) {
    return <Check className="w-4 h-4 text-green-500" strokeWidth={3} />;
  }
  // Qualquer valor diferente de 1 é 0
  return <X className="w-4 h-4 text-red-500" strokeWidth={3} />;
}

function getStatusColor(status: number | string | null | undefined): string {
  if (status === null || status === undefined) return "bg-muted/50 text-muted-foreground border-muted";
  if (typeof status === "number") {
    return status === 1
      ? "bg-success/15 text-success border-success/30"
      : "bg-destructive/15 text-destructive border-destructive/30";
  }
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "sim" || lowerStatus === "ok" || lowerStatus === "pago")
    return "bg-success/15 text-success border-success/30";
  if (lowerStatus === "não" || lowerStatus === "nao" || lowerStatus === "pendente")
    return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-warning/15 text-warning border-warning/30";
}

function getStatusGradient(status: number | string | null | undefined): string {
  if (status === null || status === undefined) return "from-muted/20 to-transparent";
  if (typeof status === "number") {
    return status === 1
      ? "from-success/10 to-transparent"
      : "from-destructive/10 to-transparent";
  }
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "sim" || lowerStatus === "ok" || lowerStatus === "pago")
    return "from-success/10 to-transparent";
  if (lowerStatus === "não" || lowerStatus === "nao" || lowerStatus === "pendente")
    return "from-destructive/10 to-transparent";
  return "from-warning/10 to-transparent";
}

// Pílula visual de marcador (para exibir tooltips, etc.)
function markerPill(level: number | null | undefined, label?: string) {
  const lvl = typeof level === "number" ? level : 0;
  if (!lvl) return null;
  const base = "px-1.5 py-0.5 rounded-full text-[10px] font-semibold border shadow-sm";
  const color =
    lvl === 1
      ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
      : lvl === 2
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-red-500/15 text-red-400 border-red-500/30";
  return <span className={`${base} ${color}`}>{label || ""}</span>;
}

// Classe de cápsula envolvente baseada no nível do marcador
function markerWrapClass(level: number | null | undefined) {
  const lvl = typeof level === "number" ? level : 0;
  if (!lvl) return "";
  return (
    "inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full border " +
    (lvl === 1
      ? "bg-cyan-500/12 border-cyan-500/30"
      : lvl === 2
      ? "bg-amber-500/12 border-amber-500/30"
      : "bg-red-500/12 border-red-500/30")
  );
}

// Verifica se uma data está preenchida (não vazia, não "-")
function isFilled(v: string | null | undefined): boolean {
  const s = (v || "").trim();
  return s !== "" && s !== "-";
}

// Funções de status agora centralizadas em StatusTooltip.tsx
// getActionColorClass, getActionClasses, StatusLegendTooltip são importados de lá

function SkeletonRow({ filters }: { filters: FilterState }) {
  return (
    <TableRow className="border-b border-white/5">
      {/* Grupo 1: Ação */}
      <TableCell className="w-[50px] min-w-[50px] max-w-[50px] leading-tight">
        <div className="h-4 w-6 shimmer rounded-md" />
      </TableCell>
      {/* Separador */}
      <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0"><div className="w-[1px] h-full bg-primary/30" /></TableCell>
      {/* Grupo 2: Identificação */}
      <TableCell className="w-[100px] min-w-[100px] max-w-[100px] leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
      <TableCell className="w-[150px] min-w-[150px] max-w-[150px] leading-tight"><div className="h-3 w-28 shimmer rounded-md" /></TableCell>
      <TableCell className="w-[50px] min-w-[50px] max-w-[50px] leading-tight"><div className="h-3 w-6 shimmer rounded-md" /></TableCell>
      <TableCell className="w-[80px] min-w-[80px] max-w-[80px] leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
      <TableCell className="w-[80px] min-w-[80px] max-w-[80px] leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
      <TableCell className="w-[55px] min-w-[55px] max-w-[55px] leading-tight"><div className="h-4 w-10 shimmer rounded-md" /></TableCell>
      {/* Separador */}
      <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0"><div className="w-[1px] h-full bg-muted-foreground/30" /></TableCell>
      {/* Grupo 3: Workflow */}
      {filters.columnGroups.workflow && (
        <>
          <TableCell className="w-[80px] min-w-[80px] max-w-[80px] leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="w-[70px] min-w-[70px] max-w-[70px] leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="w-[50px] min-w-[50px] max-w-[50px] leading-tight"><div className="h-3 w-8 shimmer rounded-md" /></TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0"><div className="w-[1px] h-full bg-accent/30" /></TableCell>
        </>
      )}
      {/* Grupo 4 e 5: Recebíveis */}
      {filters.columnGroups.recebiveis && (
        <>
          <TableCell className="w-[70px] min-w-[70px] max-w-[70px] leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="w-[60px] min-w-[60px] max-w-[60px] leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
          <TableCell className="w-[60px] min-w-[60px] max-w-[60px] leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
          <TableCell className="w-[90px] min-w-[90px] max-w-[90px] leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0"><div className="w-[1px] h-full bg-success/30" /></TableCell>
          <TableCell className="w-[65px] min-w-[65px] max-w-[65px] leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
          <TableCell className="w-[60px] min-w-[60px] max-w-[60px] leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
          <TableCell className="w-[85px] min-w-[85px] max-w-[85px] leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0"><div className="w-[1px] h-full bg-emerald-400/30" /></TableCell>
        </>
      )}
      {/* Grupo 6: Pagamentos */}
      {filters.columnGroups.pagamentos && (
        <>
          <TableCell className="w-[65px] min-w-[65px] max-w-[65px] leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
          <TableCell className="w-[95px] min-w-[95px] max-w-[95px] leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
          <TableCell className="w-[60px] min-w-[60px] max-w-[60px] leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
          <TableCell className="w-[85px] min-w-[85px] max-w-[85px] leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0"><div className="w-[1px] h-full bg-warning/30" /></TableCell>
        </>
      )}
      {/* Grupo 7: Contexto */}
      <TableCell className="w-[150px] min-w-[150px] max-w-[150px] leading-tight"><div className="h-3 w-28 shimmer rounded-md" /></TableCell>
      <TableCell className="w-[160px] min-w-[160px] max-w-[160px] leading-tight"><div className="h-3 w-24 shimmer rounded-md" /></TableCell>
      <TableCell className="w-[80px] min-w-[80px] max-w-[80px] leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
    </TableRow>
  );
}

// Componente para header com filtro e ordenação (via popover)
interface FilterableHeaderProps {
  column: Column<Inspection, unknown> | undefined;
  children: React.ReactNode;
  className?: string;
}

function FilterableHeader({ column, children, className }: FilterableHeaderProps) {
  if (!column) return <>{children}</>;
  
  return (
    <ColumnFilter column={column} className={className}>
      {children}
    </ColumnFilter>
  );
}

export function DataGrid({
  data,
  filters,
  isLoading = false,
  onRowClick,
  onRefresh,
  userRole,
}: DataGridProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [usersLookup, setUsersLookup] = useState<LookupOption[]>([]);
  const [ufLookup, setUfLookup] = useState<LookupOption[]>([]);
  const [ativiLookup, setAtiviLookup] = useState<LookupOption[]>([]);

  // TanStack Table
  const {
    table,
    clearAllFilters,
    hasActiveFilters,
  } = useDataGrid({ data, pageSize: 50 });

  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const paginatedRows = table.getRowModel().rows;

  useEffect(() => {
    fetchUsersLookup().then((users) => setUsersLookup(users.map(u => ({ value: u.value, label: u.label }))));
    fetchUfOptions().then(setUfLookup);
    fetchAtiviOptions().then(setAtiviLookup);
  }, []);

  // Callback para edição inline
  const handleCellEdit = useCallback(async (
    idPrinc: number,
    field: string,
    value: string
  ): Promise<boolean> => {
    try {
      const result = await updateInspectionField(idPrinc, field, value);
      if (result.success) {
        toast.success("Campo atualizado", {
          description: result.message,
        });
        onRefresh?.();
        return true;
      }
      return false;
    } catch (error) {
      toast.error("Erro ao atualizar", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
      return false;
    }
  }, [onRefresh]);

  // Helper para obter coluna
  const getColumn = (id: string) => table.getColumn(id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex-1 mx-3 mb-3 mt-2.5"
    >
      <Card className="h-full shell-grid border-white/10 shadow-2xl overflow-hidden">
        {/* Grid Content - Headers stick on scroll */}
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <Table className="w-auto min-w-max">
              <TableHeader className="sticky top-0 z-50 grid-header-shell">
                <TableRow className="border-b border-white/10">
                  {/* Grupo 1: Status */}
                  <TableHead className="w-[50px] min-w-[50px] max-w-[50px] bg-card relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-b-sm" />
                    <div className="flex items-center justify-center">
                      <StatusLegendTooltip>
                        <span className="text-[10px] font-medium text-muted-foreground cursor-help">Status</span>
                      </StatusLegendTooltip>
                    </div>
                  </TableHead>
                  
                  {/* Separador */}
                  <TableHead className="w-[1px] min-w-[1px] max-w-[1px] p-0 bg-card">
                    <div className="w-[1px] h-full bg-primary/40" />
                  </TableHead>
                  
                  {/* Grupo 2: Identificação */}
                  <TableHead className="w-[100px] min-w-[100px] max-w-[100px] bg-card relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-muted-foreground/50 rounded-b-sm" />
                    <FilterableHeader column={getColumn("player")}>
                      <span className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        Player
                      </span>
                    </FilterableHeader>
                  </TableHead>
                  <TableHead className="w-[150px] min-w-[150px] max-w-[150px] bg-card">
                    <FilterableHeader column={getColumn("segurado")}>
                      <span className="text-xs font-bold text-muted-foreground tracking-wider">Segurado</span>
                    </FilterableHeader>
                  </TableHead>
                  <TableHead className="w-[50px] min-w-[50px] max-w-[50px] bg-card">
                    <FilterableHeader column={getColumn("loc")}>
                      <span className="text-xs font-bold text-muted-foreground tracking-wider">Loc</span>
                    </FilterableHeader>
                  </TableHead>
                  
                  {/* Grupo People: Guilty, Guy, Meta - Violet */}
                  {filters.columnGroups.people && (
                    <>
                      <TableHead className="w-[80px] min-w-[80px] max-w-[80px] bg-card relative">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-violet-500 rounded-b-sm" />
                        <FilterableHeader column={getColumn("guilty")}>
                          <span className="text-xs font-bold text-violet-400 tracking-wider">Guilty</span>
                        </FilterableHeader>
                      </TableHead>
                      <TableHead className="w-[80px] min-w-[80px] max-w-[80px] bg-card">
                        <FilterableHeader column={getColumn("guy")}>
                          <span className="text-xs font-bold text-violet-400 tracking-wider">Guy</span>
                        </FilterableHeader>
                      </TableHead>
                      <TableHead className="w-[55px] min-w-[55px] max-w-[55px] bg-card">
                        <FilterableHeader column={getColumn("meta")}>
                          <span className="text-xs font-bold text-violet-400 tracking-wider">Meta</span>
                        </FilterableHeader>
                      </TableHead>
                      
                      {/* Separador People */}
                      <TableHead className="w-[1px] min-w-[1px] max-w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-violet-500/40" />
                      </TableHead>
                    </>
                  )}
                  
                  {/* Grupo 3: Workflow Principal */}
                  {filters.columnGroups.workflow && (
                    <>
                      <TableHead className="w-[80px] min-w-[80px] max-w-[80px] bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent rounded-b-sm" />
                        <FilterableHeader column={getColumn("dtInspecao")} className="justify-center">
                          <span className="text-xs font-bold text-accent tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Inspeção
                          </span>
                        </FilterableHeader>
                      </TableHead>
                      <TableHead className="w-[70px] min-w-[70px] max-w-[70px] bg-card text-center">
                        <FilterableHeader column={getColumn("dtEntregue")} className="justify-center">
                          <span className="text-xs font-bold text-accent tracking-wider">Entregue</span>
                        </FilterableHeader>
                      </TableHead>
                      <TableHead className="w-[50px] min-w-[50px] max-w-[50px] bg-card">
                        <FilterableHeader column={getColumn("prazo")} className="justify-center">
                          <span className="text-xs font-bold text-accent tracking-wider">Prazo</span>
                        </FilterableHeader>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] min-w-[1px] max-w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-accent/40" />
                      </TableHead>
                    </>
                  )}
                  
                  {/* Grupo 4: Recebíveis - Honorários */}
                  {filters.columnGroups.recebiveis && (
                    <>
                      <TableHead className="w-[70px] min-w-[70px] max-w-[70px] bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-success rounded-b-sm" />
                        <FilterableHeader column={getColumn("dtAcerto")} className="justify-center">
                          <span className="text-xs font-bold text-success tracking-wider flex items-center gap-1">
                            <Wallet className="w-3 h-3" />
                            Acerto
                          </span>
                        </FilterableHeader>
                      </TableHead>
                      <TableHead className="w-[60px] min-w-[60px] max-w-[60px] bg-card text-center">
                        <FilterableHeader column={getColumn("dtEnvio")} className="justify-center">
                          <span className="text-xs font-bold text-success tracking-wider">Envio</span>
                        </FilterableHeader>
                      </TableHead>
                      <TableHead className="w-[60px] min-w-[60px] max-w-[60px] bg-card text-center">
                        <FilterableHeader column={getColumn("dtPago")} className="justify-center">
                          <span className="text-xs font-bold text-success tracking-wider">Pago</span>
                        </FilterableHeader>
                      </TableHead>
                      <TableHead className="w-[90px] min-w-[90px] max-w-[90px] bg-card text-right">
                        <FilterableHeader column={getColumn("honorario")} className="justify-end">
                          <span className="text-xs font-bold text-success tracking-wider">Honorários</span>
                        </FilterableHeader>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] min-w-[1px] max-w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-success/40" />
                      </TableHead>
                      
                      {/* Grupo 5: Recebíveis - Despesas */}
                      <TableHead className="w-[65px] min-w-[65px] max-w-[65px] bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-400 rounded-b-sm" />
                        <FilterableHeader column={getColumn("dtDenvio")} className="justify-center">
                          <span className="text-xs font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                            <Receipt className="w-3 h-3" />
                            DEnvio
                          </span>
                        </FilterableHeader>
                      </TableHead>
                      <TableHead className="w-[60px] min-w-[60px] max-w-[60px] bg-card text-center">
                        <FilterableHeader column={getColumn("dtDpago")} className="justify-center">
                          <span className="text-xs font-bold text-emerald-400 tracking-wider">DPago</span>
                        </FilterableHeader>
                      </TableHead>
                      <TableHead className="w-[85px] min-w-[85px] max-w-[85px] bg-card text-right">
                        <FilterableHeader column={getColumn("despesa")} className="justify-end">
                          <span className="text-xs font-bold text-emerald-400 tracking-wider">Despesas</span>
                        </FilterableHeader>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] min-w-[1px] max-w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-emerald-400/40" />
                      </TableHead>
                    </>
                  )}
                  
                  {/* Grupo 6: Pagamentos Colaborador */}
                  {filters.columnGroups.pagamentos && (
                    <>
                      <TableHead className="w-[65px] min-w-[65px] max-w-[65px] bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-warning rounded-b-sm" />
                        <FilterableHeader column={getColumn("dtGuyPago")} className="justify-center">
                          <span className="text-xs font-bold text-warning tracking-wider flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            GPago
                          </span>
                        </FilterableHeader>
                      </TableHead>
                      <TableHead className="w-[95px] min-w-[95px] max-w-[95px] bg-card text-right">
                        <FilterableHeader column={getColumn("guyHonorario")} className="justify-end">
                          <span className="text-xs font-bold text-warning tracking-wider">GHonorários</span>
                        </FilterableHeader>
                      </TableHead>
                      <TableHead className="w-[60px] min-w-[60px] max-w-[60px] bg-card text-center">
                        <FilterableHeader column={getColumn("dtGuyDpago")} className="justify-center">
                          <span className="text-xs font-bold text-warning tracking-wider">GDPago</span>
                        </FilterableHeader>
                      </TableHead>
                      <TableHead className="w-[85px] min-w-[85px] max-w-[85px] bg-card text-right">
                        <FilterableHeader column={getColumn("guyDespesa")} className="justify-end">
                          <span className="text-xs font-bold text-warning tracking-wider">GDespesas</span>
                        </FilterableHeader>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] min-w-[1px] max-w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-warning/40" />
                      </TableHead>
                    </>
                  )}
                  
                  {/* Grupo 7: Contexto */}
                  <TableHead className="w-[150px] min-w-[150px] max-w-[150px] bg-card relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-muted-foreground/30 rounded-b-sm" />
                    <FilterableHeader column={getColumn("atividade")}>
                      <span className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Atividade
                      </span>
                    </FilterableHeader>
                  </TableHead>
                  <TableHead className="w-[160px] min-w-[160px] max-w-[160px] bg-card text-center">
                    <FilterableHeader column={getColumn("obs")} className="justify-center">
                      <span className="text-xs font-bold text-muted-foreground tracking-wider">Observação</span>
                    </FilterableHeader>
                  </TableHead>
                  <TableHead className="w-[80px] min-w-[80px] max-w-[80px] bg-card text-center">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {isLoading ? (
                    Array.from({ length: 12 }).map((_, i) => (
                      <SkeletonRow key={`skeleton-${i}`} filters={filters} />
                    ))
                  ) : paginatedRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={30}
                        className="h-48 text-center"
                      >
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <div className="p-4 rounded-full bg-muted/30">
                            <FileSpreadsheet className="w-8 h-8" />
                          </div>
                          <p className="text-sm font-medium">Nenhum registro encontrado</p>
                          <p className="text-xs">Tente ajustar os filtros ou adicionar novos registros</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRows.map((tableRow, index) => {
                      const row = tableRow.original;
                      const isHovered = hoveredRow === index;
                      const isSelected = selectedRowIndex === index;
                      const showPulse = isHovered || isSelected;
                      const isOddRow = index % 2 === 1;
                      const isCadenceRow = (index + 1) % 4 === 0;
                      
                      return (
                      <TableRow
                        key={row.idPrinc || index}
                        className={`cursor-pointer transition-all duration-200 group
                          ${isSelected 
                            ? `bg-gradient-to-r ${getStatusGradient(row.meta)} border-primary/40 selected-row-glow` 
                            : `${isOddRow ? 'grid-row-odd' : 'grid-row-even'} ${isCadenceRow ? 'grid-row-cadence' : 'border-b border-white/5'}`
                          }
                        `}
                        onClick={() => {
                          setSelectedRowIndex(index);
                          onRowClick?.(row);
                        }}
                        onMouseEnter={() => setHoveredRow(index)}
                        onMouseLeave={() => setHoveredRow(null)}
                        data-testid={`row-inspection-${row.idPrinc || index}`}
                      >
                          {/* Grupo 1: Ação */}
                          <TableCell className="w-[50px] min-w-[50px] max-w-[50px] leading-tight">
                            <button
                              className={`p-2 rounded-md cursor-pointer transition-all duration-200 hover:scale-125 bg-transparent hover:shadow-lg hover:shadow-primary/20 ${getStatusActionClasses(row)} ${showPulse ? "action-center-trigger" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRowIndex(index);
                                onRowClick?.(row);
                              }}
                              data-testid={`badge-action-${row.idPrinc || index}`}
                            >
                              <span className="w-2 h-2 rounded-full bg-current block shadow-[0_0_4px_currentColor]" />
                            </button>
                          </TableCell>
                          
                          {/* Separador */}
                          <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
                            <div className="w-[1px] h-full bg-primary/30" />
                          </TableCell>
                          
                          {/* Grupo 2: Identificação - cores de status aplicadas apenas em Player e Segurado */}
                          {(() => {
                            const statusColor = getActionColorClass(row);
                            return (
                              <>
                                <TableCell className={`w-[100px] min-w-[100px] max-w-[100px] text-xs font-semibold p-0 ${statusColor}`}>
                                  <span className="block w-full px-2 py-1 truncate">
                                    {row.player || "-"}
                                  </span>
                                </TableCell>
                                <TableCell className={`w-[150px] min-w-[150px] max-w-[150px] text-xs p-0 ${statusColor}`}>
                                  <span className="block w-full px-2 py-1 truncate">
                                    {row.segurado || "-"}
                                  </span>
                                </TableCell>
                                <TableCell className="w-[50px] min-w-[50px] max-w-[50px] text-xs text-center tabular-nums">
                                  <span className={`${markerWrapClass(row.stateLoc)}`}>
                                    {row.loc ?? "-"}
                                  </span>
                                </TableCell>
                              </>
                            );
                          })()}
                          
                          {/* Grupo People: Guilty, Guy, Meta - Violet */}
                          {filters.columnGroups.people && (
                            <>
                              <TableCell className="w-[80px] min-w-[80px] max-w-[80px] text-xs p-0">
                                <span className="block w-full px-2 py-1 truncate">
                                  {row.guilty || "-"}
                                </span>
                              </TableCell>
                              <TableCell className="w-[80px] min-w-[80px] max-w-[80px] text-xs p-0">
                                <span className="block w-full px-2 py-1 truncate">
                                  {row.guy || "-"}
                                </span>
                              </TableCell>
                              <TableCell className="w-[55px] min-w-[55px] max-w-[55px] leading-tight text-center">
                                <MetaIcon meta={row.meta} />
                              </TableCell>
                              
                              {/* Separador People */}
                              <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
                                <div className="w-[1px] h-full bg-violet-500/30" />
                              </TableCell>
                            </>
                          )}
                          
                          {/* Grupo 3: Workflow Principal */}
                          {filters.columnGroups.workflow && (
                            <>
                              <TableCell className="w-[80px] min-w-[80px] max-w-[80px] text-xs text-muted-foreground text-center p-0">
                                <AlertCell
                                  value={row.dtInspecao}
                                  displayValue={formatDate(row.dtInspecao)}
                                  alertLevel={getInspecaoAlert(row.dtInspecao, row.dtEntregue)}
                                  field="dt_inspecao"
                                  idPrinc={row.idPrinc}
                                  type="date"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[70px] min-w-[70px] max-w-[70px] text-xs text-muted-foreground text-center p-0">
                                <EditableCell
                                  value={row.dtEntregue}
                                  displayValue={formatDate(row.dtEntregue)}
                                  field="dt_entregue"
                                  idPrinc={row.idPrinc}
                                  type="date"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[50px] min-w-[50px] max-w-[50px] text-xs text-center tabular-nums">
                                {row.prazo ?? "-"}
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
                                <div className="w-[1px] h-full bg-accent/30" />
                              </TableCell>
                            </>
                          )}
                          
                          {/* Grupo 4: Recebíveis - Honorários */}
                          {filters.columnGroups.recebiveis && (
                            <>
                              <TableCell className="w-[70px] min-w-[70px] max-w-[70px] text-xs text-muted-foreground text-center p-0">
                                <AlertCell
                                  value={row.dtAcerto}
                                  displayValue={formatDate(row.dtAcerto)}
                                  alertLevel={getAcertoAlert(row.dtEnvio, row.dtPago, row.honorario)}
                                  field="dt_acerto"
                                  idPrinc={row.idPrinc}
                                  type="date"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[60px] min-w-[60px] max-w-[60px] text-xs text-muted-foreground text-center p-0">
                                <div className={`${markerWrapClass(row.stateDtEnvio)} mx-auto`}>
                                  <EditableCell
                                    value={row.dtEnvio}
                                    displayValue={formatDate(row.dtEnvio)}
                                    field="dt_envio"
                                    idPrinc={row.idPrinc}
                                    type="date"
                                    onSave={handleCellEdit}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="w-[60px] min-w-[60px] max-w-[60px] text-xs text-muted-foreground text-center p-0">
                                <div className={`${markerWrapClass(row.stateDtPago)} mx-auto`}>
                                  <EditableCell
                                    value={row.dtPago}
                                    displayValue={formatDate(row.dtPago)}
                                    field="dt_pago"
                                    idPrinc={row.idPrinc}
                                    type="date"
                                    onSave={handleCellEdit}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="w-[90px] min-w-[90px] max-w-[90px] text-xs p-0">
                                <EditableCell
                                  value={row.honorario}
                                  displayValue={formatCurrency(row.honorario)}
                                  field="honorario"
                                  idPrinc={row.idPrinc}
                                  type="currency"
                                  className="text-right text-success currency-value"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
                                <div className="w-[1px] h-full bg-success/30" />
                              </TableCell>
                              
                              {/* Grupo 5: Recebíveis - Despesas */}
                              <TableCell className="w-[65px] min-w-[65px] max-w-[65px] text-xs text-muted-foreground text-center p-0">
                                <div className={`${markerWrapClass(row.stateDtDenvio)} mx-auto`}>
                                  <AlertCell
                                    value={row.dtDenvio}
                                    displayValue={formatDate(row.dtDenvio)}
                                    alertLevel={getDEnvioAlert(row.dtDenvio, row.dtDpago, row.despesa)}
                                    field="dt_denvio"
                                    idPrinc={row.idPrinc}
                                    type="date"
                                    onSave={handleCellEdit}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="w-[60px] min-w-[60px] max-w-[60px] text-xs text-muted-foreground text-center p-0">
                                <EditableCell
                                  value={row.dtDpago}
                                  displayValue={formatDate(row.dtDpago)}
                                  field="dt_dpago"
                                  idPrinc={row.idPrinc}
                                  type="date"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[85px] min-w-[85px] max-w-[85px] text-xs p-0">
                                <EditableCell
                                  value={row.despesa}
                                  displayValue={formatCurrency(row.despesa)}
                                  field="despesa"
                                  idPrinc={row.idPrinc}
                                  type="currency"
                                  className="text-right text-emerald-400 currency-value"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
                                <div className="w-[1px] h-full bg-emerald-400/30" />
                              </TableCell>
                            </>
                          )}
                          
                          {/* Grupo 6: Pagamentos Colaborador */}
                          {filters.columnGroups.pagamentos && (
                            <>
                              <TableCell className="w-[65px] min-w-[65px] max-w-[65px] text-xs text-muted-foreground text-center p-0">
                                <AlertCell
                                  value={row.dtGuyPago}
                                  displayValue={formatDate(row.dtGuyPago)}
                                  alertLevel={getGPagoAlert(row.dtEntregue, row.dtGuyPago, row.guyHonorario)}
                                  field="dt_guy_pago"
                                  idPrinc={row.idPrinc}
                                  type="date"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[95px] min-w-[95px] max-w-[95px] text-xs p-0">
                                <EditableCell
                                  value={row.guyHonorario}
                                  displayValue={formatCurrency(row.guyHonorario)}
                                  field="guy_honorario"
                                  idPrinc={row.idPrinc}
                                  type="currency"
                                  className="text-right text-warning currency-value"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[60px] min-w-[60px] max-w-[60px] text-xs text-muted-foreground text-center p-0">
                                <AlertCell
                                  value={row.dtGuyDpago}
                                  displayValue={formatDate(row.dtGuyDpago)}
                                  alertLevel={getGDPagoAlert(row.dtEntregue, row.dtGuyDpago, row.guyDespesa)}
                                  field="dt_guy_dpago"
                                  idPrinc={row.idPrinc}
                                  type="date"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[85px] min-w-[85px] max-w-[85px] text-xs p-0">
                                <EditableCell
                                  value={row.guyDespesa}
                                  displayValue={formatCurrency(row.guyDespesa)}
                                  field="guy_despesa"
                                  idPrinc={row.idPrinc}
                                  type="currency"
                                  className="text-right text-warning currency-value"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
                                <div className="w-[1px] h-full bg-warning/30" />
                              </TableCell>
                            </>
                          )}
                          
                          {/* Grupo 7: Contexto */}
                          <TableCell className="w-[150px] min-w-[150px] max-w-[150px] text-xs text-muted-foreground p-0">
                            <span className="block w-full px-2 py-1 truncate">
                              {row.atividade || "-"}
                            </span>
                          </TableCell>
                          <TableCell className="w-[160px] min-w-[160px] max-w-[160px] text-xs text-muted-foreground p-0">
                            <EditableCell
                              value={row.obs}
                              displayValue={row.obs || "-"}
                              field="obs"
                              idPrinc={row.idPrinc}
                              type="text"
                              onSave={handleCellEdit}
                            />
                          </TableCell>
                          <TableCell className="w-[80px] min-w-[80px] max-w-[80px] leading-tight">
                            <div className={`flex items-center justify-center gap-1 transition-opacity duration-200 ${hoveredRow === index ? "opacity-100" : "opacity-0"}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="glass border border-white/10"
                                onClick={(e) => { e.stopPropagation(); }}
                                data-testid={`button-view-${row.idPrinc || index}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="glass border border-white/10"
                                onClick={(e) => { e.stopPropagation(); }}
                                data-testid={`button-edit-${row.idPrinc || index}`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                      </TableRow>
                    );})
                  )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-gradient-to-r from-muted/20 via-transparent to-muted/20">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Mostrando{" "}
              <span className="font-semibold text-foreground">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>
              {" - "}
              <span className="font-semibold text-foreground">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}
              </span>
              {" de "}
              <span className="font-semibold text-accent">{table.getFilteredRowModel().rows.length}</span>
              {hasActiveFilters && (
                <span className="text-muted-foreground/70"> (filtrado de {data.length})</span>
              )}
            </span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-destructive hover:text-destructive"
                onClick={clearAllFilters}
              >
                <FilterX className="w-3 h-3 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="glass border border-white/10 disabled:opacity-30"
              data-testid="button-first-page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="glass border border-white/10 disabled:opacity-30"
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 px-3">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => table.setPageIndex(pageNum - 1)}
                    className={`min-w-[32px] ${pageNum === currentPage ? "bg-primary/80 text-primary-foreground" : "glass border border-white/10"}`}
                    data-testid={`button-page-${pageNum}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="glass border border-white/10 disabled:opacity-30"
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => table.setPageIndex(totalPages - 1)}
              disabled={!table.getCanNextPage()}
              className="glass border border-white/10 disabled:opacity-30"
              data-testid="button-last-page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
