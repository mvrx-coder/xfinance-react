import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Layers, Loader2 } from "lucide-react";
import { formatCurrency, itemVariants } from "./data";

// Tipo para item do grid de detalhes (vindo da API)
interface DetailsItemGrid {
  id: number;
  contratante: string | null;
  segurado: string | null;
  guy: string | null;
  honorario: number;
  despesa: number;
  guyHonorario: number;
  guyDespesa: number;
  atividade: string | null;
  uf: string | null;
  cidade: string | null;
}

interface DetailsGridProps {
  data: DetailsItemGrid[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function DetailsGrid({ data, total, page, pageSize, onPageChange, isLoading }: DetailsGridProps) {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;

  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Detalhamento Financeiro</span>
      </div>
      
      <div className="rounded-xl border border-white/10 overflow-hidden bg-[rgba(15,15,35,0.6)]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10">
              <TableHead className="text-xs text-muted-foreground font-medium">Contratante</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Segurado</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Guy</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium text-right">Honorário</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium text-right">Despesa</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium text-right">Resultado</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">UF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Carregando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                  Nenhum dado encontrado
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const resultado = row.honorario - row.despesa;
                return (
                  <TableRow 
                    key={row.id} 
                    className="h-[24px] border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="text-xs font-medium text-foreground truncate max-w-[120px]" title={row.contratante ?? '-'}>
                      {row.contratante ?? '-'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]" title={row.segurado ?? '-'}>
                      {row.segurado ?? '-'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[100px]" title={row.guy ?? '-'}>
                      {row.guy ?? '-'}
                    </TableCell>
                    <TableCell className="text-xs text-right text-amber-400">R$ {formatCurrency(row.honorario)}</TableCell>
                    <TableCell className="text-xs text-right text-rose-400">R$ {formatCurrency(row.despesa)}</TableCell>
                    <TableCell className={`text-xs text-right ${resultado >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      R$ {formatCurrency(resultado)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{row.uf ?? '-'}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {total > 0 
            ? `Mostrando ${startIndex + 1}-${Math.min(startIndex + pageSize, total)} de ${total}`
            : 'Sem resultados'
          }
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || isLoading}
            className="h-7 w-7"
            data-testid="button-prev-page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {totalPages > 0 ? `${page} / ${totalPages}` : '0 / 0'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || isLoading}
            className="h-7 w-7"
            data-testid="button-next-page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
