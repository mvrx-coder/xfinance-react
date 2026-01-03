/**
 * CollapsibleSidebar - Sidebar colapsável com filtros e ações
 * 
 * Layout:
 * - Filtros e toggles de colunas (sempre visíveis)
 * - Ações de inspeção (aparecem quando linha selecionada)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Filter, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterState, Inspection } from "@shared/schema";
import type { LookupOption } from "@/services/api/lookups";
import { SidebarFilters, SidebarActions } from "./sidebar";

interface CollapsibleSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  selectedInspection?: Inspection | null;
  onClearSelection?: () => void;
  onRefresh?: () => void;
  userRole?: string;
  contrLookup?: LookupOption[];
  segurLookup?: LookupOption[];
}

export function CollapsibleSidebar({ 
  filters, 
  onFiltersChange,
  selectedInspection,
  onClearSelection,
  onRefresh,
  userRole,
  contrLookup = [],
  segurLookup = [],
}: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sidebar-premium h-full flex flex-col relative transition-all duration-300 ease-in-out border-r border-white/10 overflow-y-auto",
        isCollapsed ? "w-14" : "w-64"
      )}
      data-testid="collapsible-sidebar"
    >
      {/* Botão de Colapsar - Fixo na borda */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="sidebar-toggle-btn cursor-pointer"
        data-testid="button-toggle-sidebar"
      >
        <ChevronLeft 
          className={cn(
            "h-3 w-3 text-primary transition-transform duration-300 ease-in-out",
            isCollapsed && "rotate-180"
          )} 
        />
      </button>

      {/* Conteúdo Expandido */}
      <div className={cn(
        "flex-1 overflow-hidden transition-opacity duration-200",
        isCollapsed && "opacity-0 pointer-events-none"
      )}>
        {/* Filtros - Sempre visíveis */}
        <SidebarFilters filters={filters} onFiltersChange={onFiltersChange} />

        {/* Ações - Aparecem quando linha selecionada */}
        <AnimatePresence>
          {selectedInspection && onClearSelection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="px-4 pb-4"
            >
              {/* Separador animado */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ duration: 0.2 }}
                className="origin-left"
              >
                <Separator className="bg-primary/30 mb-4" />
              </motion.div>

              {/* Header da seção */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wide mb-3"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ações
              </motion.div>

              {/* Botões de ação */}
              <SidebarActions
                inspection={selectedInspection}
                onClearSelection={onClearSelection}
                onRefresh={onRefresh}
                userRole={userRole}
                contrLookup={contrLookup}
                segurLookup={segurLookup}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Estado Colapsado - Ícones */}
      {isCollapsed && (
        <div className="flex flex-col items-center py-6 gap-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          {selectedInspection && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
          )}
        </div>
      )}
    </aside>
  );
}
