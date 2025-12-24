/**
 * CreatableCombobox - Combobox com suporte a criação de novos itens
 * 
 * Baseado no padrão do sistema antigo (Dash) que permite:
 * - Selecionar opções existentes
 * - Digitar texto livre para criar novos registros
 * - Exibe "➕ Criar: texto" quando não há correspondência
 */

import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: number;
  label: string;
}

interface CreatableComboboxProps {
  options: ComboboxOption[];
  value: number | string | null;
  onChange: (value: number | string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
}

export function CreatableCombobox({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Nenhum resultado.",
  disabled = false,
  className,
  "data-testid": testId,
}: CreatableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Encontrar label do valor atual
  const selectedLabel = React.useMemo(() => {
    if (value === null || value === undefined) return null;
    
    // Se for número, buscar nas opções
    if (typeof value === "number") {
      const option = options.find((opt) => opt.value === value);
      return option?.label || null;
    }
    
    // Se for string (criação), mostrar com prefixo
    if (typeof value === "string" && value.trim()) {
      // Se começa com prefixo, limpar para exibição
      if (value.startsWith("➕ Criar: ")) {
        return value;
      }
      return `➕ Criar: ${value}`;
    }
    
    return null;
  }, [value, options]);

  // Verificar se o texto digitado já existe nas opções
  const searchMatchesOption = React.useMemo(() => {
    if (!search.trim()) return true;
    return options.some(
      (opt) => opt.label.toLowerCase() === search.toLowerCase().trim()
    );
  }, [search, options]);

  // Handler para selecionar opção existente
  const handleSelect = (selectedValue: string) => {
    const numValue = parseInt(selectedValue, 10);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
    setSearch("");
    setOpen(false);
  };

  // Handler para criar nova opção
  const handleCreate = () => {
    const trimmed = search.trim();
    if (trimmed) {
      // Enviar como string (indica criação)
      onChange(trimmed);
      setSearch("");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            "bg-[rgba(15,15,35,0.6)] border-white/12 hover:bg-[rgba(15,15,35,0.8)]",
            !selectedLabel && "text-muted-foreground",
            className
          )}
          data-testid={testId}
        >
          <span className="truncate">
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[--radix-popover-trigger-width] p-0 bg-card border-white/15"
        align="start"
      >
        <Command shouldFilter={true}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              {search.trim() ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full px-2 py-3 text-left text-sm hover:bg-accent cursor-pointer flex items-center gap-2 text-primary"
                >
                  <Plus className="h-4 w-4" />
                  <span>Criar: <strong>{search.trim()}</strong></span>
                </button>
              ) : (
                emptyMessage
              )}
            </CommandEmpty>
            <CommandGroup>
              {/* Opção de criar se texto não existe */}
              {search.trim() && !searchMatchesOption && (
                <CommandItem
                  value={`create-${search}`}
                  onSelect={handleCreate}
                  className="text-primary"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Criar: <strong>{search.trim()}</strong></span>
                </CommandItem>
              )}
              
              {/* Opções existentes */}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value.toString())}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

