/**
 * DataGridHeader Component
 * 
 * Cabeçalho do grid de inspeções com colunas filtráveis
 */

import type { Table } from "@tanstack/react-table";
import type { Inspection, FilterState } from "@shared/schema";
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Briefcase,
  Clock,
  Wallet,
  Receipt,
  CreditCard,
  FileText,
  Sparkles,
} from "lucide-react";
import { FilterableHeader } from "./FilterableHeader";
import { StatusLegendTooltip } from "../StatusTooltip";

interface DataGridHeaderProps {
  table: Table<Inspection>;
  filters: FilterState;
}

export function DataGridHeader({ table, filters }: DataGridHeaderProps) {
  const getColumn = (id: string) => table.getColumn(id);

  return (
    <TableHeader className="sticky top-0 z-50 grid-header-shell">
      <TableRow className="border-b border-white/10">
        {/* Grupo 1: Ação */}
        <TableHead className="w-[50px] min-w-[50px] max-w-[50px] bg-card relative">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-b-sm" />
          <div className="flex items-center justify-center">
            <StatusLegendTooltip>
              <Sparkles className="w-4 h-4 chromatic-sparkle cursor-help" />
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
        <TableHead className="w-[80px] min-w-[80px] max-w-[80px] bg-card">
          <FilterableHeader column={getColumn("guilty")}>
            <span className="text-xs font-bold text-muted-foreground tracking-wider">Guilty</span>
          </FilterableHeader>
        </TableHead>
        <TableHead className="w-[80px] min-w-[80px] max-w-[80px] bg-card">
          <FilterableHeader column={getColumn("guy")}>
            <span className="text-xs font-bold text-muted-foreground tracking-wider">Guy</span>
          </FilterableHeader>
        </TableHead>
        <TableHead className="w-[55px] min-w-[55px] max-w-[55px] bg-card">
          <FilterableHeader column={getColumn("meta")}>
            <span className="text-xs font-bold text-muted-foreground tracking-wider">Meta</span>
          </FilterableHeader>
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
  );
}
