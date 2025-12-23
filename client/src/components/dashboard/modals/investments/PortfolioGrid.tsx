import { useState } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Trash2, Wallet, Loader2 } from "lucide-react";
import { formatCurrency, formatDate, itemVariants } from "./data";
import type { InvestmentItem } from "@/hooks";

interface PortfolioGridProps {
  data: InvestmentItem[];
  total: number;
  isLoading?: boolean;
  onDelete?: (id: number) => void;
  isDeleting?: boolean;
}

export function PortfolioGrid({ data, total, isLoading, onDelete, isDeleting }: PortfolioGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const handleDelete = (id: number) => {
    if (onDelete && !isDeleting) {
      onDelete(id);
    }
  };

  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <div className="flex items-center gap-2">
        <Wallet className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Carteira de Investimentos</span>
        <Badge variant="outline" className="text-xs border-white/20 ml-auto">
          {total} ativos
        </Badge>
      </div>
      
      <div className="rounded-xl border border-white/10 overflow-hidden bg-[rgba(15,15,35,0.6)]">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/10">
                <TableHead className="w-[50px] text-center text-xs text-muted-foreground">Del</TableHead>
                <TableHead className="text-xs text-muted-foreground">Investidor</TableHead>
                <TableHead className="text-xs text-muted-foreground">Instituição</TableHead>
                <TableHead className="text-xs text-muted-foreground">Tipo</TableHead>
                <TableHead className="text-xs text-muted-foreground">Detalhe</TableHead>
                <TableHead className="text-xs text-muted-foreground text-right">Aplicado</TableHead>
                <TableHead className="text-xs text-muted-foreground text-right">Bruto</TableHead>
                <TableHead className="text-xs text-muted-foreground text-right">Líquido</TableHead>
                <TableHead className="text-xs text-muted-foreground text-right">G/P</TableHead>
                <TableHead className="text-xs text-muted-foreground text-right">Rentab.</TableHead>
                <TableHead className="text-xs text-muted-foreground text-center">Aplicação</TableHead>
                <TableHead className="text-xs text-muted-foreground text-center">Vencimento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Carregando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-32 text-center text-xs text-muted-foreground">
                    Nenhum investimento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                currentData.map((row) => {
                  const ganhoPerda = row.v_bruto - row.v_aplicado;
                  return (
                    <TableRow 
                      key={row.id_finan} 
                      className="h-[28px] border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      data-testid={`row-portfolio-${row.id_finan}`}
                    >
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive/60 hover:text-destructive" 
                          data-testid={`button-delete-${row.id_finan}`}
                          onClick={() => handleDelete(row.id_finan)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-xs font-medium">{row.investidor}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.instituicao}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.tipo}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate" title={row.detalhe}>{row.detalhe}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(row.v_aplicado)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(row.v_bruto)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCurrency(row.v_liquido)}</TableCell>
                      <TableCell className={`text-xs text-right font-mono ${ganhoPerda >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {ganhoPerda >= 0 ? '+' : ''}{formatCurrency(ganhoPerda)}
                      </TableCell>
                      <TableCell className={`text-xs text-right font-mono ${row.rentabilidade >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {row.rentabilidade >= 0 ? '+' : ''}{row.rentabilidade.toFixed(2)}%
                      </TableCell>
                      <TableCell className="text-xs text-center text-muted-foreground">{formatDate(row.dt_aplicacao)}</TableCell>
                      <TableCell className="text-xs text-center text-muted-foreground">{formatDate(row.dt_vence) || "-"}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {total > 0 
            ? `Mostrando ${startIndex + 1}-${Math.min(startIndex + itemsPerPage, data.length)} de ${total}`
            : 'Sem resultados'
          }
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="h-7 w-7"
            data-testid="button-prev-portfolio"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {totalPages > 0 ? `${currentPage} / ${totalPages}` : '0 / 0'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || isLoading}
            className="h-7 w-7"
            data-testid="button-next-portfolio"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
