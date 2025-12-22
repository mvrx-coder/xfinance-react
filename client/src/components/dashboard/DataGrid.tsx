import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Sparkles,
} from "lucide-react";
import type { Inspection, FilterState } from "@shared/schema";
import {
  fetchContrOptions,
  fetchSegurOptions,
  fetchAtiviOptions,
  fetchUfOptions,
  fetchUsersOptions as fetchUsersLookup,
  getLabelById,
  type LookupOption,
} from "@/services/api/lookups";
import { updateInspectionField } from "@/services/api/inspections";
import { ActionCenter } from "./ActionCenter";
import { EditableCell } from "./EditableCell";
import { useToast } from "@/hooks/use-toast";

interface DataGridProps {
  data: Inspection[];
  filters: FilterState;
  isLoading?: boolean;
  onRowClick?: (inspection: Inspection) => void;
  onRefresh?: () => void;
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
  return dateStr;
}

function getMetaLabel(meta: number | null | undefined): string {
  if (meta === 1) return "Sim";
  if (meta === 0) return "Não";
  return "-";
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

export function DataGrid({
  data,
  filters,
  isLoading = false,
  onRowClick,
  onRefresh,
}: DataGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
  const [contrLookup, setContrLookup] = useState<LookupOption[]>([]);
  const [segurLookup, setSegurLookup] = useState<LookupOption[]>([]);
  const [usersLookup, setUsersLookup] = useState<LookupOption[]>([]);
  const [ufLookup, setUfLookup] = useState<LookupOption[]>([]);
  const [ativiLookup, setAtiviLookup] = useState<LookupOption[]>([]);
  const rowsPerPage = 50;
  const { toast } = useToast();

  useEffect(() => {
    fetchContrOptions().then(setContrLookup);
    fetchSegurOptions().then(setSegurLookup);
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
        toast({
          title: "Campo atualizado",
          description: result.message,
        });
        onRefresh?.(); // Recarregar dados
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, onRefresh]);

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex-1 mx-3 mb-3"
    >
      <Card className="h-full glass-card border-white/10 shadow-2xl overflow-hidden">
        {/* Grid Content - Headers stick on scroll */}
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <Table className="w-auto min-w-max">
              <TableHeader className="sticky top-0 z-50 bg-card backdrop-blur-xl">
                <TableRow className="border-b border-white/10">
                  {/* Grupo 1: Ação */}
                  <TableHead className="w-[50px] min-w-[50px] max-w-[50px] bg-card relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-b-sm" />
                    <span className="text-xs font-bold text-primary tracking-wider">#</span>
                  </TableHead>
                  
                  {/* Separador */}
                  <TableHead className="w-[1px] min-w-[1px] max-w-[1px] p-0 bg-card">
                    <div className="w-[1px] h-full bg-primary/40" />
                  </TableHead>
                  
                  {/* Grupo 2: Identificação */}
                  <TableHead className="w-[100px] min-w-[100px] max-w-[100px] bg-card relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-muted-foreground/50 rounded-b-sm" />
                    <span className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      Player
                    </span>
                  </TableHead>
                  <TableHead className="w-[150px] min-w-[150px] max-w-[150px] bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Segurado</span>
                  </TableHead>
                  <TableHead className="w-[50px] min-w-[50px] max-w-[50px] bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Loc</span>
                  </TableHead>
                  <TableHead className="w-[80px] min-w-[80px] max-w-[80px] bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Guilty</span>
                  </TableHead>
                  <TableHead className="w-[80px] min-w-[80px] max-w-[80px] bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Guy</span>
                  </TableHead>
                  <TableHead className="w-[55px] min-w-[55px] max-w-[55px] bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Meta</span>
                  </TableHead>
                  
                  {/* Separador */}
                  <TableHead className="w-[1px] min-w-[1px] max-w-[1px] p-0 bg-card">
                    <div className="w-[1px] h-full bg-muted-foreground/40" />
                  </TableHead>
                  
                  {/* Grupo 3: Workflow Principal */}
                  {filters.columnGroups.workflow && (
                    <>
                      <TableHead className="w-[80px] min-w-[80px] max-w-[80px] bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent rounded-b-sm" />
                        <span className="text-xs font-bold text-accent tracking-wider flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          Inspeção
                        </span>
                      </TableHead>
                      <TableHead className="w-[70px] min-w-[70px] max-w-[70px] bg-card text-center">
                        <span className="text-xs font-bold text-accent tracking-wider">Entregue</span>
                      </TableHead>
                      <TableHead className="w-[50px] min-w-[50px] max-w-[50px] bg-card">
                        <span className="text-xs font-bold text-accent tracking-wider">Prazo</span>
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
                        <span className="text-xs font-bold text-success tracking-wider flex items-center justify-center gap-1">
                          <Wallet className="w-3 h-3" />
                          Acerto
                        </span>
                      </TableHead>
                      <TableHead className="w-[60px] min-w-[60px] max-w-[60px] bg-card text-center">
                        <span className="text-xs font-bold text-success tracking-wider">Envio</span>
                      </TableHead>
                      <TableHead className="w-[60px] min-w-[60px] max-w-[60px] bg-card text-center">
                        <span className="text-xs font-bold text-success tracking-wider">Pago</span>
                      </TableHead>
                      <TableHead className="w-[90px] min-w-[90px] max-w-[90px] bg-card text-right">
                        <span className="text-xs font-bold text-success tracking-wider">Honorários</span>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] min-w-[1px] max-w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-success/40" />
                      </TableHead>
                      
                      {/* Grupo 5: Recebíveis - Despesas */}
                      <TableHead className="w-[65px] min-w-[65px] max-w-[65px] bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-400 rounded-b-sm" />
                        <span className="text-xs font-bold text-emerald-400 tracking-wider flex items-center justify-center gap-1">
                          <Receipt className="w-3 h-3" />
                          DEnvio
                        </span>
                      </TableHead>
                      <TableHead className="w-[60px] min-w-[60px] max-w-[60px] bg-card text-center">
                        <span className="text-xs font-bold text-emerald-400 tracking-wider">DPago</span>
                      </TableHead>
                      <TableHead className="w-[85px] min-w-[85px] max-w-[85px] bg-card text-right">
                        <span className="text-xs font-bold text-emerald-400 tracking-wider">Despesas</span>
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
                        <span className="text-xs font-bold text-warning tracking-wider flex items-center justify-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          GPago
                        </span>
                      </TableHead>
                      <TableHead className="w-[95px] min-w-[95px] max-w-[95px] bg-card text-right">
                        <span className="text-xs font-bold text-warning tracking-wider">GHonorários</span>
                      </TableHead>
                      <TableHead className="w-[60px] min-w-[60px] max-w-[60px] bg-card text-center">
                        <span className="text-xs font-bold text-warning tracking-wider">GDPago</span>
                      </TableHead>
                      <TableHead className="w-[85px] min-w-[85px] max-w-[85px] bg-card text-right">
                        <span className="text-xs font-bold text-warning tracking-wider">GDespesas</span>
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
                    <span className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Atividade
                    </span>
                  </TableHead>
                  <TableHead className="w-[160px] min-w-[160px] max-w-[160px] bg-card text-center">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Observação</span>
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
                  ) : currentData.length === 0 ? (
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
                    currentData.map((row, index) => (
                      <TableRow
                        key={row.idPrinc || index}
                        className={`border-b border-white/5 cursor-pointer transition-all duration-200 group
                          ${hoveredRow === index ? `bg-gradient-to-r ${getStatusGradient(row.meta)}` : "hover:bg-white/[0.02]"}
                        `}
                        onClick={() => onRowClick?.(row)}
                        onMouseEnter={() => setHoveredRow(index)}
                        onMouseLeave={() => setHoveredRow(null)}
                        data-testid={`row-inspection-${row.idPrinc || index}`}
                      >
                          {/* Grupo 1: Ação */}
                          <TableCell className="w-[50px] min-w-[50px] max-w-[50px] leading-tight">
                            <button
                              className={`p-1 rounded-md cursor-pointer transition-all duration-200 hover:scale-110 border ${getStatusColor(row.meta)} bg-transparent hover:shadow-lg hover:shadow-primary/20`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInspection(row);
                                setIsActionCenterOpen(true);
                              }}
                              data-testid={`badge-action-${row.idPrinc || index}`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          </TableCell>
                          
                          {/* Separador */}
                          <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
                            <div className="w-[1px] h-full bg-primary/30" />
                          </TableCell>
                          
                          {/* Grupo 2: Identificação */}
                          <TableCell className="w-[100px] min-w-[100px] max-w-[100px] text-xs font-semibold text-foreground p-0">
                            <span className="block w-full px-2 py-1 truncate">
                              {row.player || "-"}
                            </span>
                          </TableCell>
                          <TableCell className="w-[150px] min-w-[150px] max-w-[150px] text-xs p-0">
                            <span className="block w-full px-2 py-1 truncate">
                              {row.segurado || "-"}
                            </span>
                          </TableCell>
                          <TableCell className="w-[50px] min-w-[50px] max-w-[50px] text-xs text-center font-mono">
                            {row.loc ?? "-"}
                          </TableCell>
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
                          <TableCell className="w-[55px] min-w-[55px] max-w-[55px] leading-tight">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${getStatusColor(row.meta)}`}
                            >
                              {getMetaLabel(row.meta)}
                            </Badge>
                          </TableCell>
                          
                          {/* Separador */}
                          <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
                            <div className="w-[1px] h-full bg-muted-foreground/30" />
                          </TableCell>
                          
                          {/* Grupo 3: Workflow Principal */}
                          {filters.columnGroups.workflow && (
                            <>
                              <TableCell className="w-[80px] min-w-[80px] max-w-[80px] text-xs text-muted-foreground text-center p-0">
                                <EditableCell
                                  value={row.dtInspecao}
                                  displayValue={formatDate(row.dtInspecao)}
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
                              <TableCell className="w-[50px] min-w-[50px] max-w-[50px] text-xs text-center font-mono">
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
                                <EditableCell
                                  value={row.dtAcerto}
                                  displayValue={formatDate(row.dtAcerto)}
                                  field="dt_acerto"
                                  idPrinc={row.idPrinc}
                                  type="date"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[60px] min-w-[60px] max-w-[60px] text-xs text-muted-foreground text-center p-0">
                                <EditableCell
                                  value={row.dtEnvio}
                                  displayValue={formatDate(row.dtEnvio)}
                                  field="dt_envio"
                                  idPrinc={row.idPrinc}
                                  type="date"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[60px] min-w-[60px] max-w-[60px] text-xs text-muted-foreground text-center p-0">
                                <EditableCell
                                  value={row.dtPago}
                                  displayValue={formatDate(row.dtPago)}
                                  field="dt_pago"
                                  idPrinc={row.idPrinc}
                                  type="date"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[90px] min-w-[90px] max-w-[90px] text-xs text-right font-mono font-semibold text-success p-0">
                                <EditableCell
                                  value={row.honorario}
                                  displayValue={formatCurrency(row.honorario)}
                                  field="honorario"
                                  idPrinc={row.idPrinc}
                                  type="currency"
                                  className="text-right text-success"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
                                <div className="w-[1px] h-full bg-success/30" />
                              </TableCell>
                              
                              {/* Grupo 5: Recebíveis - Despesas */}
                              <TableCell className="w-[65px] min-w-[65px] max-w-[65px] text-xs text-muted-foreground text-center p-0">
                                <EditableCell
                                  value={row.dtDenvio}
                                  displayValue={formatDate(row.dtDenvio)}
                                  field="dt_denvio"
                                  idPrinc={row.idPrinc}
                                  type="date"
                                  onSave={handleCellEdit}
                                />
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
                              <TableCell className="w-[85px] min-w-[85px] max-w-[85px] text-xs text-right font-mono font-semibold text-emerald-400 p-0">
                                <EditableCell
                                  value={row.despesa}
                                  displayValue={formatCurrency(row.despesa)}
                                  field="despesa"
                                  idPrinc={row.idPrinc}
                                  type="currency"
                                  className="text-right text-emerald-400"
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
                                <EditableCell
                                  value={row.dtGuyPago}
                                  displayValue={formatDate(row.dtGuyPago)}
                                  field="dt_guy_pago"
                                  idPrinc={row.idPrinc}
                                  type="date"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[95px] min-w-[95px] max-w-[95px] text-xs text-right font-mono font-semibold text-warning p-0">
                                <EditableCell
                                  value={row.guyHonorario}
                                  displayValue={formatCurrency(row.guyHonorario)}
                                  field="guy_honorario"
                                  idPrinc={row.idPrinc}
                                  type="currency"
                                  className="text-right text-warning"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[60px] min-w-[60px] max-w-[60px] text-xs text-muted-foreground text-center p-0">
                                <EditableCell
                                  value={row.dtGuyDpago}
                                  displayValue={formatDate(row.dtGuyDpago)}
                                  field="dt_guy_dpago"
                                  idPrinc={row.idPrinc}
                                  type="date"
                                  onSave={handleCellEdit}
                                />
                              </TableCell>
                              <TableCell className="w-[85px] min-w-[85px] max-w-[85px] text-xs text-right font-mono font-semibold text-warning p-0">
                                <EditableCell
                                  value={row.guyDespesa}
                                  displayValue={formatCurrency(row.guyDespesa)}
                                  field="guy_despesa"
                                  idPrinc={row.idPrinc}
                                  type="currency"
                                  className="text-right text-warning"
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
                    ))
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
              <span className="font-semibold text-foreground">{startIndex + 1}</span>
              {" - "}
              <span className="font-semibold text-foreground">{Math.min(endIndex, data.length)}</span>
              {" de "}
              <span className="font-semibold text-accent">{data.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="glass border border-white/10 disabled:opacity-30"
              data-testid="button-first-page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
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
                    onClick={() => setCurrentPage(pageNum)}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="glass border border-white/10 disabled:opacity-30"
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="glass border border-white/10 disabled:opacity-30"
              data-testid="button-last-page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
      
      <ActionCenter
        inspection={selectedInspection}
        isOpen={isActionCenterOpen}
        onClose={() => setIsActionCenterOpen(false)}
        onRefresh={onRefresh}
        contrLookup={contrLookup}
        segurLookup={segurLookup}
      />
    </motion.div>
  );
}
