import { useState } from "react";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { mockDetailsData, formatCurrency, itemVariants } from "./data";

export function DetailsGrid() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(mockDetailsData.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = mockDetailsData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <motion.div variants={itemVariants} className="space-y-3">
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Detalhes por Player</span>
      </div>
      
      <div className="rounded-xl border border-white/10 overflow-hidden bg-[rgba(15,15,35,0.6)]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10">
              <TableHead className="text-xs text-muted-foreground font-medium">Player</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Segur</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Guy</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium text-right">Honorário</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium text-right">Despesa</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium text-right">Resultado</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium text-right">Insp.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, index) => (
              <TableRow 
                key={row.id} 
                className="h-[24px] border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <TableCell className="text-xs font-medium text-foreground">{row.player}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.segur}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{row.guy}</TableCell>
                <TableCell className="text-xs text-right text-amber-400">R$ {formatCurrency(row.honorario)}</TableCell>
                <TableCell className="text-xs text-right text-rose-400">R$ {formatCurrency(row.despesa)}</TableCell>
                <TableCell className="text-xs text-right text-emerald-400">R$ {formatCurrency(row.resultado)}</TableCell>
                <TableCell className="text-xs text-right text-cyan-400">{row.inspecoes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, mockDetailsData.length)} de {mockDetailsData.length}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-7 w-7"
            data-testid="button-prev-page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
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
