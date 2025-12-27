import { useState, Fragment, useRef } from "react";
import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions, ComboboxOption, Portal } from "@headlessui/react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: number;
  label: string;
}

interface SearchableComboboxProps {
  options: ComboboxOption[];
  value: number | string | null;
  onChange: (value: number | string) => void;
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  allowCreate?: boolean;
  className?: string;
  "data-testid"?: string;
}

const CREATE_PREFIX = "➕ Criar: ";

export function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  emptyMessage = "Nenhum resultado encontrado",
  disabled = false,
  allowCreate = false,
  className,
  "data-testid": testId,
}: SearchableComboboxProps) {
  const [query, setQuery] = useState("");

  const filtered = query === ""
    ? options
    : options.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase())
      );

  const selectedOption = typeof value === "number" 
    ? options.find((opt) => opt.value === value) 
    : null;

  const displayValue = () => {
    if (typeof value === "string" && value.trim()) {
      if (value.startsWith(CREATE_PREFIX)) {
        return value;
      }
      return `${CREATE_PREFIX}${value}`;
    }
    return selectedOption?.label ?? "";
  };

  const showCreateOption = allowCreate && query.trim() !== "" && 
    !options.some((opt) => opt.label.toLowerCase() === query.toLowerCase().trim());

  const handleSelect = (val: number | string | null) => {
    if (val === null) {
      setQuery("");
      return;
    }

    if (typeof val === "number") {
      onChange(val);
    } else if (allowCreate && typeof val === "string") {
      onChange(val);
    }
    setQuery("");
  };

  return (
    <Combobox
      as="div"
      value={typeof value === "number" ? value : null}
      onChange={handleSelect}
      disabled={disabled}
      immediate
    >
      <div className="relative">
        <ComboboxInput
          className={cn(
            "flex h-9 w-full items-center rounded-md border px-3 py-2 text-sm",
            "bg-[rgba(15,15,35,0.6)] border-white/12",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          placeholder={placeholder}
          displayValue={displayValue}
          onChange={(e) => setQuery(e.target.value)}
          data-testid={testId}
        />
        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center px-2">
          <ChevronDown className="h-4 w-4 opacity-50" />
        </ComboboxButton>
      </div>

      <ComboboxOptions
        anchor="bottom start"
        portal={true}
        className={cn(
          "!z-[9999] mt-1 max-h-60 w-[var(--input-width)] overflow-auto rounded-lg p-1",
          "bg-card/95 backdrop-blur-md border border-white/15",
          "shadow-xl shadow-black/20",
          "[--anchor-gap:4px]"
        )}
      >
        {filtered.length === 0 && !showCreateOption && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        )}

        {showCreateOption && (
          <ComboboxOption
            value={query.trim()}
            as={Fragment}
          >
            {({ focus }) => (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer",
                  "text-primary",
                  focus && "bg-primary/20"
                )}
              >
                <Plus className="h-4 w-4" />
                <span>Criar: <strong>{query.trim()}</strong></span>
              </div>
            )}
          </ComboboxOption>
        )}

        {filtered.map((opt) => (
          <ComboboxOption key={opt.value} value={opt.value} as={Fragment}>
            {({ focus, selected }) => (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-md cursor-pointer",
                  focus && "bg-primary/20 text-primary",
                  selected && "bg-primary/30"
                )}
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    selected ? "opacity-100" : "opacity-0"
                  )}
                />
                <span>{opt.label}</span>
              </div>
            )}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  );
}
