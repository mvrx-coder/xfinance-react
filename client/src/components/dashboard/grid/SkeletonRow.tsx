/**
 * SkeletonRow Component
 * 
 * Linha de skeleton para loading state no DataGrid
 */

import { TableRow, TableCell } from "@/components/ui/table";
import type { FilterState } from "@shared/schema";

interface SkeletonRowProps {
  filters: FilterState;
}

export function SkeletonRow({ filters }: SkeletonRowProps) {
  return (
    <TableRow className="border-b border-white/5">
      {/* Grupo 1: Ação */}
      <TableCell className="w-[50px] min-w-[50px] max-w-[50px] leading-tight">
        <div className="h-4 w-6 shimmer rounded-md" />
      </TableCell>
      {/* Separador */}
      <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
        <div className="w-[1px] h-full bg-primary/30" />
      </TableCell>
      {/* Grupo 2: Identificação */}
      <TableCell className="w-[100px] min-w-[100px] max-w-[100px] leading-tight">
        <div className="h-3 w-16 shimmer rounded-md" />
      </TableCell>
      <TableCell className="w-[150px] min-w-[150px] max-w-[150px] leading-tight">
        <div className="h-3 w-28 shimmer rounded-md" />
      </TableCell>
      <TableCell className="w-[50px] min-w-[50px] max-w-[50px] leading-tight">
        <div className="h-3 w-6 shimmer rounded-md" />
      </TableCell>
      <TableCell className="w-[80px] min-w-[80px] max-w-[80px] leading-tight">
        <div className="h-3 w-12 shimmer rounded-md" />
      </TableCell>
      <TableCell className="w-[80px] min-w-[80px] max-w-[80px] leading-tight">
        <div className="h-3 w-12 shimmer rounded-md" />
      </TableCell>
      <TableCell className="w-[55px] min-w-[55px] max-w-[55px] leading-tight">
        <div className="h-4 w-10 shimmer rounded-md" />
      </TableCell>
      {/* Separador */}
      <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
        <div className="w-[1px] h-full bg-muted-foreground/30" />
      </TableCell>
      {/* Grupo 3: Workflow */}
      {filters.columnGroups.workflow && (
        <>
          <TableCell className="w-[80px] min-w-[80px] max-w-[80px] leading-tight">
            <div className="h-3 w-14 shimmer rounded-md" />
          </TableCell>
          <TableCell className="w-[70px] min-w-[70px] max-w-[70px] leading-tight">
            <div className="h-3 w-14 shimmer rounded-md" />
          </TableCell>
          <TableCell className="w-[50px] min-w-[50px] max-w-[50px] leading-tight">
            <div className="h-3 w-8 shimmer rounded-md" />
          </TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
            <div className="w-[1px] h-full bg-accent/30" />
          </TableCell>
        </>
      )}
      {/* Grupo 4 e 5: Recebíveis */}
      {filters.columnGroups.recebiveis && (
        <>
          <TableCell className="w-[70px] min-w-[70px] max-w-[70px] leading-tight">
            <div className="h-3 w-14 shimmer rounded-md" />
          </TableCell>
          <TableCell className="w-[60px] min-w-[60px] max-w-[60px] leading-tight">
            <div className="h-3 w-12 shimmer rounded-md" />
          </TableCell>
          <TableCell className="w-[60px] min-w-[60px] max-w-[60px] leading-tight">
            <div className="h-3 w-12 shimmer rounded-md" />
          </TableCell>
          <TableCell className="w-[90px] min-w-[90px] max-w-[90px] leading-tight">
            <div className="h-3 w-16 shimmer rounded-md" />
          </TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
            <div className="w-[1px] h-full bg-success/30" />
          </TableCell>
          <TableCell className="w-[65px] min-w-[65px] max-w-[65px] leading-tight">
            <div className="h-3 w-12 shimmer rounded-md" />
          </TableCell>
          <TableCell className="w-[60px] min-w-[60px] max-w-[60px] leading-tight">
            <div className="h-3 w-12 shimmer rounded-md" />
          </TableCell>
          <TableCell className="w-[85px] min-w-[85px] max-w-[85px] leading-tight">
            <div className="h-3 w-16 shimmer rounded-md" />
          </TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
            <div className="w-[1px] h-full bg-emerald-400/30" />
          </TableCell>
        </>
      )}
      {/* Grupo 6: Pagamentos */}
      {filters.columnGroups.pagamentos && (
        <>
          <TableCell className="w-[65px] min-w-[65px] max-w-[65px] leading-tight">
            <div className="h-3 w-12 shimmer rounded-md" />
          </TableCell>
          <TableCell className="w-[95px] min-w-[95px] max-w-[95px] leading-tight">
            <div className="h-3 w-16 shimmer rounded-md" />
          </TableCell>
          <TableCell className="w-[60px] min-w-[60px] max-w-[60px] leading-tight">
            <div className="h-3 w-12 shimmer rounded-md" />
          </TableCell>
          <TableCell className="w-[85px] min-w-[85px] max-w-[85px] leading-tight">
            <div className="h-3 w-16 shimmer rounded-md" />
          </TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] min-w-[1px] max-w-[1px] p-0">
            <div className="w-[1px] h-full bg-warning/30" />
          </TableCell>
        </>
      )}
      {/* Grupo 7: Contexto */}
      <TableCell className="w-[150px] min-w-[150px] max-w-[150px] leading-tight">
        <div className="h-3 w-28 shimmer rounded-md" />
      </TableCell>
      <TableCell className="w-[160px] min-w-[160px] max-w-[160px] leading-tight">
        <div className="h-3 w-24 shimmer rounded-md" />
      </TableCell>
      <TableCell className="w-[80px] min-w-[80px] max-w-[80px] leading-tight">
        <div className="h-3 w-12 shimmer rounded-md" />
      </TableCell>
    </TableRow>
  );
}
