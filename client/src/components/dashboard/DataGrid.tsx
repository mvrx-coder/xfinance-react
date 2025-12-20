import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  LayoutGrid,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSpreadsheet,
  Filter,
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
  }).format(value);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return dateStr;
}

function getStatusColor(status: string | null | undefined): string {
  if (!status) return "bg-muted text-muted-foreground";
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "sim" || lowerStatus === "ok" || lowerStatus === "pago")
    return "bg-success/20 text-success border-success/30";
  if (lowerStatus === "não" || lowerStatus === "nao" || lowerStatus === "pendente")
    return "bg-destructive/20 text-destructive border-destructive/30";
  return "bg-warning/20 text-warning border-warning/30";
}

export function DataGrid({
  data,
  filters,
  isLoading = false,
  onRowClick,
  onRefresh,
}: DataGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const lastUpdated = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <Card className="flex-1 mx-2 mb-2 border-card-border shadow-lg overflow-hidden">
      {/* Grid Header */}
      <CardHeader className="flex flex-row items-center justify-between gap-4 py-3 px-4 border-b border-border/50 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold" data-testid="text-grid-title">
              Operações / Inspeções
            </h2>
          </div>
          <Badge variant="outline" className="text-xs">
            <FileSpreadsheet className="w-3 h-3 mr-1" />
            {data.length} registros
          </Badge>
          <span className="text-xs text-muted-foreground">
            Atualizado: {lastUpdated}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className={isLoading ? "animate-spin" : ""}
            data-testid="button-refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" data-testid="button-filter">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Grid Content */}
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="w-[60px] text-xs font-semibold text-muted-foreground">
                  Ações
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Player
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Segurado
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground w-[50px]">
                  Loc
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Guilty
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Guy
                </TableHead>
                {filters.columnGroups.workflow && (
                  <>
                    <TableHead className="text-xs font-semibold text-accent">
                      META
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-accent">
                      Inspeção
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-accent">
                      Entregue
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-accent w-[50px]">
                      Prazo
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-accent w-[40px]">
                      SW
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-accent">
                      Acerto
                    </TableHead>
                  </>
                )}
                {filters.columnGroups.recebiveis && (
                  <>
                    <TableHead className="text-xs font-semibold text-success">
                      Envio
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-success">
                      Pago
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-success text-right">
                      Honorários
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-success">
                      DÉnvio
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-success">
                      DPago
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-success text-right">
                      Despesas
                    </TableHead>
                  </>
                )}
                {filters.columnGroups.pagamentos && (
                  <>
                    <TableHead className="text-xs font-semibold text-warning">
                      GPago
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-warning text-right">
                      GHonorários
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-warning">
                      GDPago
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-warning text-right">
                      GDespesas
                    </TableHead>
                  </>
                )}
                <TableHead className="text-xs font-semibold text-muted-foreground">
                  Atividade
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="border-b border-border/30">
                    <TableCell className="py-2">
                      <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="h-4 w-6 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="h-4 w-12 bg-muted animate-pulse rounded" />
                    </TableCell>
                    {filters.columnGroups.workflow && (
                      <>
                        <TableCell className="py-2"><div className="h-4 w-10 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-14 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-14 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-8 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-8 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-14 bg-muted animate-pulse rounded" /></TableCell>
                      </>
                    )}
                    {filters.columnGroups.recebiveis && (
                      <>
                        <TableCell className="py-2"><div className="h-4 w-14 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-14 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-14 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-14 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                      </>
                    )}
                    {filters.columnGroups.pagamentos && (
                      <>
                        <TableCell className="py-2"><div className="h-4 w-14 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-14 bg-muted animate-pulse rounded" /></TableCell>
                        <TableCell className="py-2"><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                      </>
                    )}
                    <TableCell className="py-2">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ))
              ) : currentData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={20}
                    className="h-32 text-center text-muted-foreground"
                  >
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((row, index) => (
                  <TableRow
                    key={row.id || index}
                    className="border-b border-border/30 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onRowClick?.(row)}
                    data-testid={`row-inspection-${row.id || index}`}
                  >
                    <TableCell className="py-1.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0.5 ${getStatusColor(row.meta)}`}
                      >
                        {index + 1 + startIndex}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-1.5 text-xs font-medium">
                      {row.player || "-"}
                    </TableCell>
                    <TableCell className="py-1.5 text-xs max-w-[120px] truncate">
                      {row.segurado || "-"}
                    </TableCell>
                    <TableCell className="py-1.5 text-xs text-center">
                      {row.loc ?? "-"}
                    </TableCell>
                    <TableCell className="py-1.5 text-xs">
                      {row.guilty || "-"}
                    </TableCell>
                    <TableCell className="py-1.5 text-xs">
                      {row.guy || "-"}
                    </TableCell>
                    {filters.columnGroups.workflow && (
                      <>
                        <TableCell className="py-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${getStatusColor(row.meta)}`}
                          >
                            {row.meta || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1.5 text-xs">
                          {formatDate(row.inspecao)}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs">
                          {formatDate(row.entregue)}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs text-center">
                          {row.prazo ?? "-"}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs text-center">
                          {row.sw ?? "-"}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs">
                          {formatDate(row.acerto)}
                        </TableCell>
                      </>
                    )}
                    {filters.columnGroups.recebiveis && (
                      <>
                        <TableCell className="py-1.5 text-xs">
                          {formatDate(row.envio)}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs">
                          {formatDate(row.pago)}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs text-right font-mono text-success">
                          {formatCurrency(row.honorarios)}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs">
                          {formatDate(row.dEnvio)}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs">
                          {formatDate(row.dPago)}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs text-right font-mono text-warning">
                          {formatCurrency(row.despesas)}
                        </TableCell>
                      </>
                    )}
                    {filters.columnGroups.pagamentos && (
                      <>
                        <TableCell className="py-1.5 text-xs">
                          {formatDate(row.gPago)}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs text-right font-mono text-destructive">
                          {formatCurrency(row.gHonorarios)}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs">
                          {formatDate(row.gdPago)}
                        </TableCell>
                        <TableCell className="py-1.5 text-xs text-right font-mono text-destructive">
                          {formatCurrency(row.gDespesas)}
                        </TableCell>
                      </>
                    )}
                    <TableCell className="py-1.5 text-xs text-muted-foreground max-w-[100px] truncate">
                      {row.atividade || "-"}
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
      <div className="flex items-center justify-between px-4 py-2 border-t border-border/50 bg-muted/30">
        <span className="text-xs text-muted-foreground">
          Mostrando {startIndex + 1} - {Math.min(endIndex, data.length)} de{" "}
          {data.length}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            data-testid="button-first-page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            data-testid="button-prev-page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-3 text-sm font-medium">
            {currentPage} / {totalPages || 1}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            data-testid="button-next-page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
            data-testid="button-last-page"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
