/**
 * CollapsibleSidebar - Sidebar colapsável com filtros
 * 
 * Contém:
 * - Filtros de ordenação (Player, MyJob, DB Limit)
 * - Toggles de grupos de colunas (People, Workflow, Recebíveis, Pagamentos)
 * - Switch Pill Glow com glassmorphism
 */

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Filter,
  User,
  Briefcase,
  Database,
  Workflow,
  DollarSign,
  CreditCard,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterState } from "@shared/schema";

// Switch Pill Glow com suporte a cores
function SwitchPillGlow({ checked, onChange, testId, color }: { 
  checked: boolean; 
  onChange: () => void; 
  testId: string;
  color?: "violet" | "cyan" | "green" | "amber";
}) {
  return (
    <div
      className="switch-pill-glow"
      data-checked={checked}
      data-color={color}
      onClick={onChange}
      data-testid={testId}
      role="switch"
      aria-checked={checked}
    />
  );
}


interface CollapsibleSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function CollapsibleSidebar({ filters, onFiltersChange }: CollapsibleSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleFilter = (key: keyof Omit<FilterState, "columnGroups">) => {
    onFiltersChange({ ...filters, [key]: !filters[key] });
  };

  const toggleColumnGroup = (group: keyof FilterState["columnGroups"]) => {
    onFiltersChange({
      ...filters,
      columnGroups: {
        ...filters.columnGroups,
        [group]: !filters.columnGroups[group],
      },
    });
  };

  return (
    <aside
      className={cn(
        "sidebar-premium h-full flex flex-col relative transition-all duration-300 ease-in-out border-r border-white/10",
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
        <div className="p-4 space-y-6">
          {/* Seção: Filtros */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Filter className="h-3.5 w-3.5" />
              Filtros
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  <User className="h-3.5 w-3.5" />
                  <span>Ordenar por Player</span>
                </div>
                <SwitchPillGlow
                  checked={filters.player}
                  onChange={() => toggleFilter("player")}
                  testId="switch-filter-player"
                />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Meus Trabalhos</span>
                </div>
                <SwitchPillGlow
                  checked={filters.myJob}
                  onChange={() => toggleFilter("myJob")}
                  testId="switch-filter-myjob"
                />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  <Database className="h-3.5 w-3.5" />
                  <span>Limitar 800 registros</span>
                </div>
                <SwitchPillGlow
                  checked={filters.dbLimit}
                  onChange={() => toggleFilter("dbLimit")}
                  testId="switch-filter-dblimit"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-white/10" />

          {/* Seção: Colunas Visíveis */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Workflow className="h-3.5 w-3.5" />
              Colunas Visíveis
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-sm text-violet-400 group-hover:text-violet-300 transition-colors">
                  <Users className="h-3.5 w-3.5" />
                  <span>People</span>
                </div>
                <SwitchPillGlow
                  checked={filters.columnGroups.people}
                  onChange={() => toggleColumnGroup("people")}
                  testId="switch-column-people"
                  color="violet"
                />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-sm text-accent group-hover:text-accent/80 transition-colors">
                  <Workflow className="h-3.5 w-3.5" />
                  <span>Workflow</span>
                </div>
                <SwitchPillGlow
                  checked={filters.columnGroups.workflow}
                  onChange={() => toggleColumnGroup("workflow")}
                  testId="switch-column-workflow"
                  color="cyan"
                />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-sm text-success group-hover:text-success/80 transition-colors">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>Recebíveis</span>
                </div>
                <SwitchPillGlow
                  checked={filters.columnGroups.recebiveis}
                  onChange={() => toggleColumnGroup("recebiveis")}
                  testId="switch-column-recebiveis"
                  color="green"
                />
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-2 text-sm text-warning group-hover:text-warning/80 transition-colors">
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Pagamentos</span>
                </div>
                <SwitchPillGlow
                  checked={filters.columnGroups.pagamentos}
                  onChange={() => toggleColumnGroup("pagamentos")}
                  testId="switch-column-pagamentos"
                  color="amber"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estado Colapsado - Ícone */}
      {isCollapsed && (
        <div className="flex items-center justify-center py-6">
          <Filter className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </aside>
  );
}

