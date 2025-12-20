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
      <TableCell className="py-3">
        <div className="h-5 w-10 shimmer rounded-md" />
      </TableCell>
      <TableCell className="py-3">
        <div className="h-4 w-20 shimmer rounded-md" />
      </TableCell>
      <TableCell className="py-3">
        <div className="h-4 w-32 shimmer rounded-md" />
      </TableCell>
      <TableCell className="py-3">
        <div className="h-4 w-8 shimmer rounded-md" />
      </TableCell>
      <TableCell className="py-3">
        <div className="h-4 w-14 shimmer rounded-md" />
      </TableCell>
      <TableCell className="py-3">
        <div className="h-4 w-14 shimmer rounded-md" />
      </TableCell>
      {filters.columnGroups.workflow && (
        <>
          <TableCell className="py-3"><div className="h-5 w-12 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-16 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-16 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-10 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-8 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-16 shimmer rounded-md" /></TableCell>
        </>
      )}
      {filters.columnGroups.recebiveis && (
        <>
          <TableCell className="py-3"><div className="h-4 w-16 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-16 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-20 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-16 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-16 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-20 shimmer rounded-md" /></TableCell>
        </>
      )}
      {filters.columnGroups.pagamentos && (
        <>
          <TableCell className="py-3"><div className="h-4 w-16 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-20 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-16 shimmer rounded-md" /></TableCell>
          <TableCell className="py-3"><div className="h-4 w-20 shimmer rounded-md" /></TableCell>
        </>
      )}
      <TableCell className="py-3">
        <div className="h-4 w-24 shimmer rounded-md" />
      </TableCell>
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-[340px] sm:w-[380px] bg-card/95 backdrop-blur-xl border-l border-white/10 p-0"
      >
        <SheetHeader className="p-5 border-b border-white/10">
          <SheetTitle className="text-base font-bold">Central de ações</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            Escolha a ação para Valid Soluções da {inspection.player} de {inspection.loc?.toString().padStart(2, '0')}/{new Date().getMonth() + 1 < 10 ? '0' : ''}{new Date().getMonth() + 1}.
          </SheetDescription>
        </SheetHeader>
        
        <div className="p-5 flex flex-col gap-3">
          <Button
            className="w-full justify-center gap-2 rounded-full border-2 border-orange-500 bg-transparent text-orange-400 hover:bg-orange-500/10"
            variant="outline"
            data-testid="action-forward-inspection"
          >
            <Send className="w-4 h-4" />
            Encaminhar inspeção
          </Button>
          
          <Button
            className="w-full justify-center gap-2 rounded-full border-2 border-green-500 bg-transparent text-green-400 hover:bg-green-500/10"
            variant="outline"
            data-testid="action-alert-marker"
          >
            <AlertTriangle className="w-4 h-4" />
            Marcador de alerta
          </Button>
          
          <Button
            className="w-full justify-center gap-2 rounded-full border-2 border-violet-500 bg-transparent text-violet-400 hover:bg-violet-500/10"
            variant="outline"
            data-testid="action-view-locations"
          >
            <MapPin className="w-4 h-4" />
            Visualizar demais locais
          </Button>
          
          <Button
            className="w-full justify-center gap-2 rounded-full border-2 border-yellow-500 bg-transparent text-yellow-400 hover:bg-yellow-500/10"
            variant="outline"
            data-testid="action-coming-soon"
          >
            <Sparkles className="w-4 h-4" />
            Em breve
          </Button>
          
          <Button
            className="w-full justify-center gap-2 rounded-full border-2 border-red-500 bg-transparent text-red-400 hover:bg-red-500/10"
            variant="outline"
            data-testid="action-delete-inspection"
          >
            <Trash2 className="w-4 h-4" />
            Excluir inspeção
          </Button>
          
          <div className="border-t border-white/10 pt-3 mt-2">
            <Button
              className="w-full justify-center gap-2 rounded-full border border-white/20 bg-transparent text-muted-foreground hover:bg-white/5"
              variant="outline"
              data-testid="action-clear-filters"
            >
              <Filter className="w-4 h-4" />
              Limpar Filtros (Global)
            </Button>
          </div>
          
          <Button
            className="w-full justify-center gap-2 rounded-full border border-white/20 bg-transparent text-muted-foreground hover:bg-white/5"
            variant="outline"
            onClick={onClose}
            data-testid="action-cancel"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
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
                  <TableHead className="w-[70px] text-xs font-bold text-muted-foreground uppercase tracking-wider bg-card">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-card">
                    Player
                  </TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-card">
                    Segurado
                  </TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider w-[60px] bg-card">
                    Loc
                  </TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-card">
                    Guilty
                  </TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-card">
                    Guy
                  </TableHead>
                  {filters.columnGroups.workflow && (
                    <>
                      <TableHead className="text-xs font-bold text-accent uppercase tracking-wider bg-card">
                        META
                      </TableHead>
                      <TableHead className="text-xs font-bold text-accent uppercase tracking-wider bg-card">
                        Inspeção
                      </TableHead>
                      <TableHead className="text-xs font-bold text-accent uppercase tracking-wider bg-card">
                        Entregue
                      </TableHead>
                      <TableHead className="text-xs font-bold text-accent uppercase tracking-wider w-[60px] bg-card">
                        Prazo
                      </TableHead>
                      <TableHead className="text-xs font-bold text-accent uppercase tracking-wider w-[50px] bg-card">
                        SW
                      </TableHead>
                      <TableHead className="text-xs font-bold text-accent uppercase tracking-wider bg-card">
                        Acerto
                      </TableHead>
                    </>
                  )}
                  {filters.columnGroups.recebiveis && (
                    <>
                      <TableHead className="text-xs font-bold text-success uppercase tracking-wider bg-card">
                        Envio
                      </TableHead>
                      <TableHead className="text-xs font-bold text-success uppercase tracking-wider bg-card">
                        Pago
                      </TableHead>
                      <TableHead className="text-xs font-bold text-success uppercase tracking-wider text-right bg-card">
                        Honorários
                      </TableHead>
                      <TableHead className="text-xs font-bold text-success uppercase tracking-wider bg-card">
                        DÉnvio
                      </TableHead>
                      <TableHead className="text-xs font-bold text-success uppercase tracking-wider bg-card">
                        DPago
                      </TableHead>
                      <TableHead className="text-xs font-bold text-success uppercase tracking-wider text-right bg-card">
                        Despesas
                      </TableHead>
                    </>
                  )}
                  {filters.columnGroups.pagamentos && (
                    <>
                      <TableHead className="text-xs font-bold text-warning uppercase tracking-wider bg-card">
                        GPago
                      </TableHead>
                      <TableHead className="text-xs font-bold text-warning uppercase tracking-wider text-right bg-card">
                        GHonorários
                      </TableHead>
                      <TableHead className="text-xs font-bold text-warning uppercase tracking-wider bg-card">
                        GDPago
                      </TableHead>
                      <TableHead className="text-xs font-bold text-warning uppercase tracking-wider text-right bg-card">
                        GDespesas
                      </TableHead>
                    </>
                  )}
                  <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider bg-card">
                    Atividade
                  </TableHead>
                  <TableHead className="w-[80px] text-xs font-bold text-muted-foreground uppercase tracking-wider text-center bg-card">
                    Ações
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
                        colSpan={20}
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
                          <TableCell className="py-2.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold px-2 py-0.5 cursor-pointer transition-transform hover:scale-105 ${getStatusColor(row.meta)}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInspection(row);
                                setIsActionCenterOpen(true);
                              }}
                              data-testid={`badge-action-${row.id || index}`}
                            >
                              {String(index + 1 + startIndex).padStart(2, '0')}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 text-xs font-semibold text-foreground">
                            {row.player || "-"}
                          </TableCell>
                          <TableCell className="py-2.5 text-xs max-w-[140px] truncate">
                            {row.segurado || "-"}
                          </TableCell>
                          <TableCell className="py-2.5 text-xs text-center font-mono">
                            {row.loc ?? "-"}
                          </TableCell>
                          <TableCell className="py-2.5 text-xs">
                            {row.guilty || "-"}
                          </TableCell>
                          <TableCell className="py-2.5 text-xs">
                            {row.guy || "-"}
                          </TableCell>
                          {filters.columnGroups.workflow && (
                            <>
                              <TableCell className="py-2.5">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-semibold ${getStatusColor(row.meta)}`}
                                >
                                  {row.meta || "-"}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-muted-foreground">
                                {formatDate(row.inspecao)}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-muted-foreground">
                                {formatDate(row.entregue)}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-center font-mono">
                                {row.prazo ?? "-"}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-center font-mono">
                                {row.sw ?? "-"}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-muted-foreground">
                                {formatDate(row.acerto)}
                              </TableCell>
                            </>
                          )}
                          {filters.columnGroups.recebiveis && (
                            <>
                              <TableCell className="py-2.5 text-xs text-muted-foreground">
                                {formatDate(row.envio)}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-muted-foreground">
                                {formatDate(row.pago)}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-right font-mono font-semibold text-success">
                                {formatCurrency(row.honorarios)}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-muted-foreground">
                                {formatDate(row.dEnvio)}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-muted-foreground">
                                {formatDate(row.dPago)}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-right font-mono font-semibold text-warning">
                                {formatCurrency(row.despesas)}
                              </TableCell>
                            </>
                          )}
                          {filters.columnGroups.pagamentos && (
                            <>
                              <TableCell className="py-2.5 text-xs text-muted-foreground">
                                {formatDate(row.gPago)}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-right font-mono font-semibold text-destructive">
                                {formatCurrency(row.gHonorarios)}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-muted-foreground">
                                {formatDate(row.gdPago)}
                              </TableCell>
                              <TableCell className="py-2.5 text-xs text-right font-mono font-semibold text-destructive">
                                {formatCurrency(row.gDespesas)}
                              </TableCell>
                            </>
                          )}
                          <TableCell className="py-2.5 text-xs text-muted-foreground max-w-[100px] truncate">
                            {row.atividade || "-"}
                          </TableCell>
                          <TableCell className="py-2.5">
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
