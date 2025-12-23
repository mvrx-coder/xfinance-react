/**
 * Hook para gerenciar o grid de dados com TanStack Table.
 * Fornece filtros por coluna, ordenação e paginação.
 */

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  FilterFn,
  Row,
} from "@tanstack/react-table";
import type { Inspection } from "@shared/schema";

// Filtro customizado para texto (case-insensitive, contains)
const fuzzyFilter: FilterFn<Inspection> = (
  row: Row<Inspection>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId);
  if (value == null) return false;
  return String(value).toLowerCase().includes(filterValue.toLowerCase());
};

// Filtro para datas (formato yyyy-mm-dd)
const dateFilter: FilterFn<Inspection> = (
  row: Row<Inspection>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as string | null;
  if (!value) return false;
  return value.includes(filterValue);
};

// Filtro para números
const numberFilter: FilterFn<Inspection> = (
  row: Row<Inspection>,
  columnId: string,
  filterValue: string
) => {
  const value = row.getValue(columnId) as number | null;
  if (value == null) return false;
  return String(value).includes(filterValue);
};

export interface UseDataGridOptions {
  data: Inspection[];
  pageSize?: number;
}

export interface UseDataGridReturn {
  table: ReturnType<typeof useReactTable<Inspection>>;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

export function useDataGrid({
  data,
  pageSize = 50,
}: UseDataGridOptions): UseDataGridReturn {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Definição das colunas
  const columns = useMemo<ColumnDef<Inspection>[]>(
    () => [
      // Grupo 1: Ação (não filtrável)
      {
        id: "action",
        header: "#",
        enableColumnFilter: false,
        enableSorting: false,
      },
      // Grupo 2: Identificação
      {
        accessorKey: "player",
        header: "Player",
        filterFn: fuzzyFilter,
      },
      {
        accessorKey: "segurado",
        header: "Segurado",
        filterFn: fuzzyFilter,
      },
      {
        accessorKey: "loc",
        header: "Loc",
        filterFn: fuzzyFilter,
      },
      {
        accessorKey: "guilty",
        header: "Guilty",
        filterFn: fuzzyFilter,
      },
      {
        accessorKey: "guy",
        header: "Guy",
        filterFn: fuzzyFilter,
      },
      {
        accessorKey: "meta",
        header: "Meta",
        filterFn: numberFilter,
      },
      // Grupo 3: Workflow
      {
        accessorKey: "dtInspecao",
        header: "Inspeção",
        filterFn: dateFilter,
      },
      {
        accessorKey: "dtEntregue",
        header: "Entregue",
        filterFn: dateFilter,
      },
      {
        accessorKey: "prazo",
        header: "Prazo",
        filterFn: numberFilter,
      },
      // Grupo 4: Recebíveis - Honorários
      {
        accessorKey: "dtAcerto",
        header: "Acerto",
        filterFn: dateFilter,
      },
      {
        accessorKey: "dtEnvio",
        header: "Envio",
        filterFn: dateFilter,
      },
      {
        accessorKey: "dtPago",
        header: "Pago",
        filterFn: dateFilter,
      },
      {
        accessorKey: "honorario",
        header: "Honorários",
        filterFn: numberFilter,
      },
      // Grupo 5: Recebíveis - Despesas
      {
        accessorKey: "dtDenvio",
        header: "DEnvio",
        filterFn: dateFilter,
      },
      {
        accessorKey: "dtDpago",
        header: "DPago",
        filterFn: dateFilter,
      },
      {
        accessorKey: "despesa",
        header: "Despesas",
        filterFn: numberFilter,
      },
      // Grupo 6: Pagamentos Colaborador
      {
        accessorKey: "dtGuyPago",
        header: "GPago",
        filterFn: dateFilter,
      },
      {
        accessorKey: "guyHonorario",
        header: "GHonorários",
        filterFn: numberFilter,
      },
      {
        accessorKey: "dtGuyDpago",
        header: "GDPago",
        filterFn: dateFilter,
      },
      {
        accessorKey: "guyDespesa",
        header: "GDespesas",
        filterFn: numberFilter,
      },
      // Grupo 7: Contexto
      {
        accessorKey: "atividade",
        header: "Atividade",
        filterFn: fuzzyFilter,
      },
      {
        accessorKey: "obs",
        header: "Observação",
        filterFn: fuzzyFilter,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  const clearAllFilters = () => {
    setColumnFilters([]);
    setGlobalFilter("");
  };

  const hasActiveFilters = columnFilters.length > 0 || globalFilter !== "";

  return {
    table,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    clearAllFilters,
    hasActiveFilters,
  };
}

