/**
 * Componente de filtro por coluna para o grid.
 * Aparece como um input pequeno no header da coluna.
 */

import { useState, useRef, useEffect } from "react";
import { Column } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColumnFilterProps<TData> {
  column: Column<TData, unknown>;
  placeholder?: string;
}

export function ColumnFilter<TData>({
  column,
  placeholder,
}: ColumnFilterProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(
    (column.getFilterValue() as string) ?? ""
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const hasFilter = column.getFilterValue() != null && column.getFilterValue() !== "";

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleApply = () => {
    column.setFilterValue(value || undefined);
    setIsOpen(false);
  };

  const handleClear = () => {
    setValue("");
    column.setFilterValue(undefined);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApply();
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "p-0.5 rounded transition-all duration-200",
            hasFilter
              ? "text-primary bg-primary/20 hover:bg-primary/30"
              : "text-muted-foreground/50 hover:text-muted-foreground hover:bg-white/5"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <Filter className="w-3 h-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-48 p-2 glass-card border-white/20"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-2">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Filtrar..."}
            className="h-7 text-xs bg-background/50 border-white/10"
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="flex-1 h-6 text-xs"
              onClick={handleClear}
            >
              <X className="w-3 h-3 mr-1" />
              Limpar
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

