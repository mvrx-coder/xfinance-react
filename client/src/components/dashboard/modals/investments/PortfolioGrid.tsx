import { useState } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Trash2, Wallet } from "lucide-react";
import { mockPortfolio, formatCurrency, itemVariants } from "./data";

export function PortfolioGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(mockPortfolio.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = mockPortfolio.slice(startIndex, startIndex + itemsPerPage);

  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <div className="flex items-center gap-2">
        <Wallet className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Carteira de Investimentos</span>
        <Badge variant="outline" className="text-xs border-white/20 ml-auto">
          {mockPortfolio.length} ativos
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
              {currentData.map((row) => (
                <TableRow 
                  key={row.id} 
                  className="h-[28px] border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  data-testid={`row-portfolio-${row.id}`}
                >
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive" data-testid={`button-delete-${row.id}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{row.investidor}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.instituicao}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.tipo}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{row.detalhe}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{formatCurrency(row.aplicado)}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{formatCurrency(row.bruto)}</TableCell>
                  <TableCell className="text-xs text-right font-mono">{formatCurrency(row.liquido)}</TableCell>
                  <TableCell className={`text-xs text-right font-mono ${row.ganhoPerda >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {row.ganhoPerda >= 0 ? '+' : ''}{formatCurrency(row.ganhoPerda)}
                  </TableCell>
                  <TableCell className={`text-xs text-right font-mono ${row.rentabilidade >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {row.rentabilidade >= 0 ? '+' : ''}{row.rentabilidade.toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-xs text-center text-muted-foreground">{row.dtAplicacao}</TableCell>
                  <TableCell className="text-xs text-center text-muted-foreground">{row.dtVencimento}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, mockPortfolio.length)} de {mockPortfolio.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-7 w-7"
            data-testid="button-prev-portfolio"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">{currentPage} / {totalPages}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
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
