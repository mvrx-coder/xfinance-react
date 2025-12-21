import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
  Send,
  AlertTriangle,
  MapPin,
  Sparkles,
  Trash2,
  Filter,
  X,
  Briefcase,
  Clock,
  Wallet,
  Receipt,
  CreditCard,
  FileText,
} from "lucide-react";
import type { Inspection, FilterState } from "@shared/schema";

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

function getStatusColor(status: string | null | undefined): string {
  if (!status) return "bg-muted/50 text-muted-foreground border-muted";
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "sim" || lowerStatus === "ok" || lowerStatus === "pago")
    return "bg-success/15 text-success border-success/30";
  if (lowerStatus === "não" || lowerStatus === "nao" || lowerStatus === "pendente")
    return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-warning/15 text-warning border-warning/30";
}

function getStatusGradient(status: string | null | undefined): string {
  if (!status) return "from-muted/20 to-transparent";
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
      <TableCell className="leading-tight">
        <div className="h-4 w-6 shimmer rounded-md" />
      </TableCell>
      {/* Separador */}
      <TableCell className="w-[1px] p-0"><div className="w-[1px] h-full bg-primary/30" /></TableCell>
      {/* Grupo 2: Identificação */}
      <TableCell className="leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
      <TableCell className="leading-tight"><div className="h-3 w-28 shimmer rounded-md" /></TableCell>
      <TableCell className="leading-tight"><div className="h-3 w-6 shimmer rounded-md" /></TableCell>
      <TableCell className="leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
      <TableCell className="leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
      <TableCell className="leading-tight"><div className="h-4 w-10 shimmer rounded-md" /></TableCell>
      {/* Separador */}
      <TableCell className="w-[1px] p-0"><div className="w-[1px] h-full bg-muted-foreground/30" /></TableCell>
      {/* Grupo 3: Workflow */}
      {filters.columnGroups.workflow && (
        <>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-8 shimmer rounded-md" /></TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] p-0"><div className="w-[1px] h-full bg-accent/30" /></TableCell>
        </>
      )}
      {/* Grupo 4 e 5: Recebíveis */}
      {filters.columnGroups.recebiveis && (
        <>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] p-0"><div className="w-[1px] h-full bg-success/30" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] p-0"><div className="w-[1px] h-full bg-emerald-400/30" /></TableCell>
        </>
      )}
      {/* Grupo 6: Pagamentos */}
      {filters.columnGroups.pagamentos && (
        <>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] p-0"><div className="w-[1px] h-full bg-warning/30" /></TableCell>
        </>
      )}
      {/* Grupo 7: Contexto */}
      <TableCell className="leading-tight"><div className="h-3 w-20 shimmer rounded-md" /></TableCell>
      <TableCell className="leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
    </TableRow>
  );
}

function ActionCenter({ 
  inspection, 
  isOpen, 
  onClose 
}: { 
  inspection: Inspection | null; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!inspection) return null;

  const actionButtons = [
    { icon: Trash2, label: "Excluir inspeção", color: "red", testId: "action-delete-inspection" },
    { icon: Send, label: "Encaminhar inspeção", color: "orange", testId: "action-forward-inspection" },
    { icon: AlertTriangle, label: "Marcador de alerta", color: "yellow", testId: "action-alert-marker" },
    { icon: MapPin, label: "Visualizar demais locais", color: "green", testId: "action-view-locations" },
    { icon: Filter, label: "Limpar Filtros (Global)", color: "blue", testId: "action-clear-filters" },
    { icon: Sparkles, label: "Em breve", color: "purple", testId: "action-coming-soon" },
  ];

  const colorClasses: Record<string, string> = {
    red: "border-red-500 text-red-400 shadow-red-500/20 hover:shadow-red-500/40 hover:bg-red-500/10",
    orange: "border-orange-500 text-orange-400 shadow-orange-500/20 hover:shadow-orange-500/40 hover:bg-orange-500/10",
    yellow: "border-yellow-500 text-yellow-400 shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:bg-yellow-500/10",
    green: "border-green-500 text-green-400 shadow-green-500/20 hover:shadow-green-500/40 hover:bg-green-500/10",
    blue: "border-blue-500 text-blue-400 shadow-blue-500/20 hover:shadow-blue-500/40 hover:bg-blue-500/10",
    purple: "border-purple-500 text-purple-400 shadow-purple-500/20 hover:shadow-purple-500/40 hover:bg-purple-500/10",
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-[360px] sm:w-[400px] bg-[rgba(10,10,31,0.95)] backdrop-blur-2xl border-l border-primary/20 p-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        
        <SheetHeader className="relative p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Central de Ações
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                {inspection.player} - Loc {inspection.loc?.toString().padStart(2, '0')}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        <div className="relative p-6 flex flex-col gap-3">
          {actionButtons.map((action, index) => (
            <motion.div
              key={action.testId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Button
                className={`w-full justify-start gap-3 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl ${colorClasses[action.color]}`}
                variant="outline"
                data-testid={action.testId}
              >
                <action.icon className="w-4 h-4" />
                <span className="font-medium">{action.label}</span>
              </Button>
            </motion.div>
          ))}
          
          <div className="border-t border-white/10 pt-4 mt-3">
            <Button
              className="w-full justify-center gap-2 rounded-xl border border-white/20 bg-white/5 text-muted-foreground hover:bg-white/10 transition-all duration-300"
              variant="outline"
              onClick={onClose}
              data-testid="action-cancel"
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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
  const rowsPerPage = 50;

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
            <Table>
              <TableHeader className="sticky top-0 z-50 bg-card backdrop-blur-xl">
                <TableRow className="border-b border-white/10">
                  {/* Grupo 1: Ação */}
                  <TableHead className="w-[50px] bg-card relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-b-sm" />
                    <span className="text-xs font-bold text-primary tracking-wider">#</span>
                  </TableHead>
                  
                  {/* Separador */}
                  <TableHead className="w-[1px] p-0 bg-card">
                    <div className="w-[1px] h-full bg-primary/40" />
                  </TableHead>
                  
                  {/* Grupo 2: Identificação */}
                  <TableHead className="bg-card relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-muted-foreground/50 rounded-b-sm" />
                    <span className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      Player
                    </span>
                  </TableHead>
                  <TableHead className="bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Segurado</span>
                  </TableHead>
                  <TableHead className="w-[60px] bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Loc</span>
                  </TableHead>
                  <TableHead className="bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Guilty</span>
                  </TableHead>
                  <TableHead className="bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Guy</span>
                  </TableHead>
                  <TableHead className="bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Meta</span>
                  </TableHead>
                  
                  {/* Separador */}
                  <TableHead className="w-[1px] p-0 bg-card">
                    <div className="w-[1px] h-full bg-muted-foreground/40" />
                  </TableHead>
                  
                  {/* Grupo 3: Workflow Principal */}
                  {filters.columnGroups.workflow && (
                    <>
                      <TableHead className="bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent rounded-b-sm" />
                        <span className="text-xs font-bold text-accent tracking-wider flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          Inspeção
                        </span>
                      </TableHead>
                      <TableHead className="bg-card text-center">
                        <span className="text-xs font-bold text-accent tracking-wider">Entregue</span>
                      </TableHead>
                      <TableHead className="w-[60px] bg-card">
                        <span className="text-xs font-bold text-accent tracking-wider">Prazo</span>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-accent/40" />
                      </TableHead>
                    </>
                  )}
                  
                  {/* Grupo 4: Recebíveis - Honorários */}
                  {filters.columnGroups.recebiveis && (
                    <>
                      <TableHead className="bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-success rounded-b-sm" />
                        <span className="text-xs font-bold text-success tracking-wider flex items-center justify-center gap-1">
                          <Wallet className="w-3 h-3" />
                          Acerto
                        </span>
                      </TableHead>
                      <TableHead className="bg-card text-center">
                        <span className="text-xs font-bold text-success tracking-wider">Envio</span>
                      </TableHead>
                      <TableHead className="bg-card text-center">
                        <span className="text-xs font-bold text-success tracking-wider">Pago</span>
                      </TableHead>
                      <TableHead className="bg-card text-right">
                        <span className="text-xs font-bold text-success tracking-wider">Honorários</span>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-success/40" />
                      </TableHead>
                      
                      {/* Grupo 5: Recebíveis - Despesas */}
                      <TableHead className="bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-400 rounded-b-sm" />
                        <span className="text-xs font-bold text-emerald-400 tracking-wider flex items-center justify-center gap-1">
                          <Receipt className="w-3 h-3" />
                          DEnvio
                        </span>
                      </TableHead>
                      <TableHead className="bg-card text-center">
                        <span className="text-xs font-bold text-emerald-400 tracking-wider">DPago</span>
                      </TableHead>
                      <TableHead className="bg-card text-right">
                        <span className="text-xs font-bold text-emerald-400 tracking-wider">Despesas</span>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-emerald-400/40" />
                      </TableHead>
                    </>
                  )}
                  
                  {/* Grupo 6: Pagamentos Colaborador */}
                  {filters.columnGroups.pagamentos && (
                    <>
                      <TableHead className="bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-warning rounded-b-sm" />
                        <span className="text-xs font-bold text-warning tracking-wider flex items-center justify-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          GPago
                        </span>
                      </TableHead>
                      <TableHead className="bg-card text-right">
                        <span className="text-xs font-bold text-warning tracking-wider">GHonorários</span>
                      </TableHead>
                      <TableHead className="bg-card text-center">
                        <span className="text-xs font-bold text-warning tracking-wider">GDPago</span>
                      </TableHead>
                      <TableHead className="bg-card text-right">
                        <span className="text-xs font-bold text-warning tracking-wider">GDespesas</span>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-warning/40" />
                      </TableHead>
                    </>
                  )}
                  
                  {/* Grupo 7: Contexto */}
                  <TableHead className="bg-card relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-muted-foreground/30 rounded-b-sm" />
                    <span className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Atividade
                    </span>
                  </TableHead>
                  <TableHead className="w-[80px] bg-card text-center">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Observação</span>
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
                        key={row.id || index}
                        className={`border-b border-white/5 cursor-pointer transition-all duration-200 group
                          ${hoveredRow === index ? `bg-gradient-to-r ${getStatusGradient(row.meta)}` : "hover:bg-white/[0.02]"}
                        `}
                        onClick={() => onRowClick?.(row)}
                        onMouseEnter={() => setHoveredRow(index)}
                        onMouseLeave={() => setHoveredRow(null)}
                        data-testid={`row-inspection-${row.id || index}`}
                      >
                          {/* Grupo 1: Ação */}
                          <TableCell className="leading-tight">
                            <button
                              className={`p-1 rounded-md cursor-pointer transition-all duration-200 hover:scale-110 border ${getStatusColor(row.meta)} bg-transparent hover:shadow-lg hover:shadow-primary/20`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInspection(row);
                                setIsActionCenterOpen(true);
                              }}
                              data-testid={`badge-action-${row.id || index}`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          </TableCell>
                          
                          {/* Separador */}
                          <TableCell className="w-[1px] p-0">
                            <div className="w-[1px] h-full bg-primary/30" />
                          </TableCell>
                          
                          {/* Grupo 2: Identificação */}
                          <TableCell className=" text-xs font-semibold text-foreground">
                            {row.player || "-"}
                          </TableCell>
                          <TableCell className=" text-xs max-w-[140px] truncate">
                            {row.segurado || "-"}
                          </TableCell>
                          <TableCell className=" text-xs text-center font-mono">
                            {row.loc ?? "-"}
                          </TableCell>
                          <TableCell className=" text-xs">
                            {row.guilty || "-"}
                          </TableCell>
                          <TableCell className=" text-xs">
                            {row.guy || "-"}
                          </TableCell>
                          <TableCell className="leading-tight">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${getStatusColor(row.meta)}`}
                            >
                              {row.meta || "-"}
                            </Badge>
                          </TableCell>
                          
                          {/* Separador */}
                          <TableCell className="w-[1px] p-0">
                            <div className="w-[1px] h-full bg-muted-foreground/30" />
                          </TableCell>
                          
                          {/* Grupo 3: Workflow Principal */}
                          {filters.columnGroups.workflow && (
                            <>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.inspecao)}
                              </TableCell>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.entregue)}
                              </TableCell>
                              <TableCell className=" text-xs text-center font-mono">
                                {row.prazo ?? "-"}
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] p-0">
                                <div className="w-[1px] h-full bg-accent/30" />
                              </TableCell>
                            </>
                          )}
                          
                          {/* Grupo 4: Recebíveis - Honorários */}
                          {filters.columnGroups.recebiveis && (
                            <>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.acerto)}
                              </TableCell>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.envio)}
                              </TableCell>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.pago)}
                              </TableCell>
                              <TableCell className=" text-xs text-right font-mono font-semibold text-success">
                                {formatCurrency(row.honorarios)}
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] p-0">
                                <div className="w-[1px] h-full bg-success/30" />
                              </TableCell>
                              
                              {/* Grupo 5: Recebíveis - Despesas */}
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.dEnvio)}
                              </TableCell>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.dPago)}
                              </TableCell>
                              <TableCell className=" text-xs text-right font-mono font-semibold text-emerald-400">
                                {formatCurrency(row.despesas)}
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] p-0">
                                <div className="w-[1px] h-full bg-emerald-400/30" />
                              </TableCell>
                            </>
                          )}
                          
                          {/* Grupo 6: Pagamentos Colaborador */}
                          {filters.columnGroups.pagamentos && (
                            <>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.gPago)}
                              </TableCell>
                              <TableCell className=" text-xs text-right font-mono font-semibold text-warning">
                                {formatCurrency(row.gHonorarios)}
                              </TableCell>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.gdPago)}
                              </TableCell>
                              <TableCell className=" text-xs text-right font-mono font-semibold text-warning">
                                {formatCurrency(row.gDespesas)}
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] p-0">
                                <div className="w-[1px] h-full bg-warning/30" />
                              </TableCell>
                            </>
                          )}
                          
                          {/* Grupo 7: Contexto */}
                          <TableCell className=" text-xs text-muted-foreground max-w-[100px] truncate">
                            {row.atividade || "-"}
                          </TableCell>
                          <TableCell className="leading-tight">
                            <div className={`flex items-center justify-center gap-1 transition-opacity duration-200 ${hoveredRow === index ? "opacity-100" : "opacity-0"}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="glass border border-white/10"
                                onClick={(e) => { e.stopPropagation(); }}
                                data-testid={`button-view-${row.id || index}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="glass border border-white/10"
                                onClick={(e) => { e.stopPropagation(); }}
                                data-testid={`button-edit-${row.id || index}`}
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
      />
    </motion.div>
  );
}
