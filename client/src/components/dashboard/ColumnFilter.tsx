/**
 * Componente de filtro e ordenação por coluna para o grid.
 * Abre como popover ao clicar no título da coluna.
 */

import { useState, useRef, useEffect } from "react";
import { Column } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColumnFilterProps<TData> {
  column: Column<TData, unknown>;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

export function ColumnFilter<TData>({
  column,
  placeholder,
  children,
  className,
}: ColumnFilterProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(
    (column.getFilterValue() as string) ?? ""
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const hasFilter = column.getFilterValue() != null && column.getFilterValue() !== "";
  const isSorted = column.getIsSorted();
  const canSort = column.getCanSort();
  const canFilter = column.getCanFilter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleApply = () => {
    column.setFilterValue(value || undefined);
    setIsOpen(false);
  };

  const handleClearFilter = () => {
    setValue("");
    column.setFilterValue(undefined);
  };

  const handleClearAll = () => {
    setValue("");
    column.setFilterValue(undefined);
    column.clearSorting();
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApply();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSort = (desc: boolean) => {
    column.toggleSorting(desc);
  };

  // Indicador visual de filtro/ordenação ativos
  const hasActiveState = hasFilter || isSorted;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 cursor-pointer transition-all duration-200 hover:opacity-80",
            hasActiveState && "text-primary",
            className
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          {children}
          {hasActiveState && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-52 p-3 glass-card border-white/20"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-3">
          {/* Ordenação */}
          {canSort && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Ordenar
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={isSorted === "asc" ? "default" : "outline"}
                  className={cn(
                    "flex-1 h-7 text-xs",
                    isSorted === "asc" && "bg-primary/80"
                  )}
                  onClick={() => handleSort(false)}
                >
                  <ArrowUp className="w-3 h-3 mr-1" />
                  A-Z
                </Button>
                <Button
                  size="sm"
                  variant={isSorted === "desc" ? "default" : "outline"}
                  className={cn(
                    "flex-1 h-7 text-xs",
                    isSorted === "desc" && "bg-primary/80"
                  )}
                  onClick={() => handleSort(true)}
                >
                  <ArrowDown className="w-3 h-3 mr-1" />
                  Z-A
                </Button>
              </div>
            </div>
          )}

          {/* Filtro */}
          {canFilter && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Filtrar
              </span>
              <div className="flex gap-1">
                <Input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder || "Digite..."}
                  className="h-7 text-xs bg-background/50 border-white/10 flex-1"
                />
                {hasFilter && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={handleClearFilter}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-1 pt-1 border-t border-white/10">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-6 text-xs text-muted-foreground"
              onClick={handleClearAll}
            >
              Limpar tudo
            </Button>
            <Button
              size="sm"
              className="flex-1 h-6 text-xs"
              onClick={handleApply}
            >
              Aplicar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

