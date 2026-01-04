/**
 * PerformanceDataGrid - Grid de detalhamento financeiro
 * 
 * Tabela com dados detalhados de contratante, segurado, guy,
 * honorários, despesas e resultado.
 */

import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataRow {
  contratante: string;
  segurado: string;
  guy: string;
  honorario: number;
  despesa: number;
  resultado: number;
  uf: string;
}

interface PerformanceDataGridProps {
  title: string;
  data: DataRow[];
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

export function PerformanceDataGrid({ 
  title, 
  data, 
  total = data.length, 
  page = 1, 
  pageSize = 10,
  onPageChange,
  isLoading 
}: PerformanceDataGridProps) {
  const totalPages = Math.ceil(total / pageSize);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return (
    <Card 
      className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-white/5 overflow-hidden"
      data-testid="performance-data-grid"
    >
      <div className="px-6 py-4 border-b border-slate-800/50 bg-gradient-to-r from-slate-900/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-[#CE62D9] to-purple-600 rounded-full" />
            <h3 className="text-base font-semibold text-white">Detalhamento Financeiro</h3>
            <span className="text-xs text-slate-500">• {title}</span>
          </div>
          {total > 0 && (
            <span className="text-xs text-slate-500 font-mono">
              {total.toLocaleString("pt-BR")} registros
            </span>
          )}
        </div>
      </div>

      <ScrollArea className="h-[350px]">
        <Table>
          <TableHeader className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/95 [&_tr]:border-b-0">
            <TableRow className="border-b border-slate-800/50 hover:bg-transparent relative">
              <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider relative after:absolute after:top-0 after:left-0 after:right-0 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-[#CE62D9]/30 after:to-transparent">
                Contratante
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Segurado
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                Guy
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                Honorário
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                Despesa
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                Resultado
              </TableHead>
              <TableHead className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                UF
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i} className="border-b border-slate-800/50">
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 bg-slate-800/50 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <TableCell className="text-sm text-white">{row.contratante}</TableCell>
                  <TableCell className="text-sm text-slate-300">{row.segurado}</TableCell>
                  <TableCell className="text-sm text-slate-400 font-mono text-center">{row.guy}</TableCell>
                  <TableCell className="text-sm font-semibold text-emerald-400 font-mono tabular-nums text-right">
                    R$ {row.honorario.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-red-400 font-mono tabular-nums text-right">
                    R$ {row.despesa.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-cyan-400 font-mono tabular-nums text-right">
                    R$ {row.resultado.toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-sm text-slate-400 font-mono text-center">{row.uf}</TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && onPageChange && (
        <div className="px-6 py-3 border-t border-slate-800/50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Página {page} de {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPrev}
              className="h-7 w-7 p-0"
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNext}
              className="h-7 w-7 p-0"
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

