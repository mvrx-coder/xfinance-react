/**
 * HeadlessCombobox - Combobox com Headless UI
 * 
 * Input de busca fica no próprio trigger (não separado na lista)
 * Suporta:
 * - Busca local (opções já carregadas)
 * - Busca server-side (fetch ao digitar)
 * - Criação de novos itens
 * 
 * Usado para todos os dropdowns do NewRecordModal
 */

import { useState, useEffect, Fragment } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  Transition,
} from "@headlessui/react";
import { Check, ChevronDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOptionType {
  value: number;
  label: string;
}

interface HeadlessComboboxProps {
  /** Opções disponíveis */
  options: ComboboxOptionType[];
  /** Valor selecionado */
  value: number | null | undefined;
  /** Callback quando valor muda */
  onChange: (value: number) => void;
  /** Placeholder */
  placeholder?: string;
  /** Desabilitado */
  disabled?: boolean;
  /** Carregando */
  loading?: boolean;
  /** Ícone à esquerda */
  icon?: React.ReactNode;
  /** Classes adicionais */
  className?: string;
}

export function HeadlessCombobox({
  options,
  value,
  onChange,
  placeholder = "Selecione...",
  disabled = false,
  loading = false,
  icon,
  className,
}: HeadlessComboboxProps) {
  const [query, setQuery] = useState("");

  // Encontrar opção selecionada
  const selectedOption = options.find((opt) => opt.value === value) || null;

  // Filtrar opções localmente
  const filteredOptions =
    query === ""
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <Combobox
      value={selectedOption}
      onChange={(opt) => opt && onChange(opt.value)}
      disabled={disabled}
    >
      <div className="relative">
        {/* Input que é o próprio trigger */}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              {icon}
            </span>
          )}
          <ComboboxInput
            className={cn(
              "w-full h-10 rounded-lg border transition-colors",
              "bg-[rgba(15,15,35,0.6)] border-white/12",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon ? "pl-10 pr-10" : "pl-3 pr-10",
              className
            )}
            displayValue={(opt: ComboboxOptionType | null) => opt?.label ?? ""}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </ComboboxButton>
        </div>

        {/* Lista de opções */}
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <ComboboxOptions className="glass-dropdown">
            {filteredOptions.length === 0 && query !== "" ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                Nenhum resultado para "{query}"
              </div>
            ) : (
              filteredOptions.map((option) => (
                <ComboboxOption
                  key={option.value}
                  value={option}
                  className={({ active, selected }) =>
                    cn(
                      "relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-sm",
                      active && "bg-primary/20 text-primary",
                      selected && "bg-primary/10",
                      !active && !selected && "text-foreground"
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={cn(
                          "block truncate",
                          selected && "font-medium"
                        )}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </Transition>
      </div>
    </Combobox>
  );
}

// =============================================================================
// VERSÃO COM CRIAÇÃO DE NOVOS ITENS (Para Segurado/Atividade)
// =============================================================================

interface CreatableHeadlessComboboxProps {
  /** Opções disponíveis */
  options: ComboboxOptionType[];
  /** Valor pode ser string (criar novo) */
  value: number | string | null | undefined;
  /** Callback aceita número ou string */
  onChange: (value: number | string) => void;
  /** Placeholder */
  placeholder?: string;
  /** Desabilitado */
  disabled?: boolean;
  /** Carregando */
  loading?: boolean;
  /** Ícone à esquerda */
  icon?: React.ReactNode;
  /** Classes adicionais */
  className?: string;
  /** Permitir criar novo */
  allowCreate?: boolean;
}

export function CreatableHeadlessCombobox({
  options,
  value,
  onChange,
  placeholder = "Digite ou selecione...",
  disabled = false,
  loading = false,
  icon,
  className,
  allowCreate = true,
}: CreatableHeadlessComboboxProps) {
  const [query, setQuery] = useState("");

  // Encontrar opção selecionada (se for número)
  const selectedOption =
    typeof value === "number"
      ? options.find((opt) => opt.value === value) || null
      : null;

  // Display value: se for string (criar novo), mostrar com prefixo
  const displayValue =
    typeof value === "string" && value.trim()
      ? `➕ Criar: ${value.replace("➕ Criar: ", "")}`
      : selectedOption?.label ?? "";

  // Filtrar opções localmente
  const filteredOptions =
    query === ""
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase())
        );

  // Verificar se query já existe nas opções
  const queryMatchesOption = options.some(
    (opt) => opt.label.toLowerCase() === query.toLowerCase().trim()
  );

  // Mostrar opção de criar?
  const showCreateOption =
    allowCreate && query.trim() !== "" && !queryMatchesOption;

  const handleSelect = (opt: ComboboxOptionType | null) => {
    if (opt) {
      onChange(opt.value);
    }
  };

  const handleCreate = () => {
    if (query.trim()) {
      onChange(query.trim());
      setQuery("");
    }
  };

  return (
    <Combobox
      value={selectedOption}
      onChange={handleSelect}
      disabled={disabled}
    >
      <div className="relative">
        {/* Input que é o próprio trigger */}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              {icon}
            </span>
          )}
          <ComboboxInput
            className={cn(
              "w-full h-10 rounded-lg border transition-colors",
              "bg-[rgba(15,15,35,0.6)] border-white/12",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon ? "pl-10 pr-10" : "pl-3 pr-10",
              typeof value === "string" && "text-primary",
              className
            )}
            displayValue={() => displayValue}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </ComboboxButton>
        </div>

        {/* Lista de opções */}
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <ComboboxOptions className="glass-dropdown">
            {/* Opção de criar novo */}
            {showCreateOption && (
              <div
                onClick={handleCreate}
                className="relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-sm text-primary hover:bg-primary/20"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Plus className="h-4 w-4" />
                </span>
                <span>
                  Criar: <strong>{query.trim()}</strong>
                </span>
              </div>
            )}

            {/* Opções existentes */}
            {filteredOptions.length === 0 && !showCreateOption ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                {query ? `Nenhum resultado para "${query}"` : "Nenhuma opção disponível"}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <ComboboxOption
                  key={option.value}
                  value={option}
                  className={({ active, selected }) =>
                    cn(
                      "relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-sm",
                      active && "bg-primary/20 text-primary",
                      selected && "bg-primary/10",
                      !active && !selected && "text-foreground"
                    )
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={cn(
                          "block truncate",
                          selected && "font-medium"
                        )}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </Transition>
      </div>
    </Combobox>
  );
}

// =============================================================================
// VERSÃO COM BUSCA SERVER-SIDE (Para Segurado/Atividade com muitos itens)
// =============================================================================

interface ServerSearchHeadlessComboboxProps {
  /** Endpoint de busca (deve aceitar ?q=) */
  searchEndpoint: string;
  /** Valor selecionado: number = ID, string = criar novo */
  value: number | string | null | undefined;
  /** Callback quando valor muda */
  onChange: (value: number | string) => void;
  /** Placeholder */
  placeholder?: string;
  /** Desabilitado */
  disabled?: boolean;
  /** Ícone à esquerda */
  icon?: React.ReactNode;
  /** Classes adicionais */
  className?: string;
}

export function ServerSearchHeadlessCombobox({
  searchEndpoint,
  value,
  onChange,
  placeholder = "Digite para buscar...",
  disabled = false,
  icon,
  className,
}: ServerSearchHeadlessComboboxProps) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<ComboboxOptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Função para buscar dados
  const fetchOptions = async (searchQuery: string) => {
    setLoading(true);
    try {
      const url = searchQuery.trim()
        ? `${searchEndpoint}?q=${encodeURIComponent(searchQuery.trim())}`
        : searchEndpoint;
      
      console.log("[ServerSearch] Fetching:", url);
      
      const response = await fetch(url, {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("[ServerSearch] Got", data.length, "items");
        setOptions(data);
        setHasFetched(true);
      } else {
        console.error("[ServerSearch] Error:", response.status);
      }
    } catch (error) {
      console.error("[ServerSearch] Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Buscar quando abre pela primeira vez
  useEffect(() => {
    if (isOpen && !hasFetched && !loading) {
      fetchOptions("");
    }
  }, [isOpen, hasFetched, loading]);

  // Buscar quando query muda (com debounce) - só após primeiro fetch
  useEffect(() => {
    if (!hasFetched) return;
    
    const timeoutId = setTimeout(() => {
      fetchOptions(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Encontrar opção selecionada (se for número)
  const selectedOption =
    typeof value === "number"
      ? options.find((opt) => opt.value === value) || null
      : null;

  // Display value
  const displayValue =
    typeof value === "string" && value.trim()
      ? `➕ Criar: ${value.replace("➕ Criar: ", "")}`
      : selectedOption?.label ?? "";

  // Verificar se query já existe nas opções
  const queryMatchesOption = options.some(
    (opt) => opt.label.toLowerCase() === query.toLowerCase().trim()
  );

  // Mostrar opção de criar?
  const showCreateOption = query.trim() !== "" && !queryMatchesOption && !loading;

  const handleSelect = (opt: ComboboxOptionType | null) => {
    if (opt) {
      onChange(opt.value);
    }
  };

  const handleCreate = () => {
    if (query.trim()) {
      onChange(query.trim());
      setQuery("");
    }
  };

  return (
    <Combobox
      value={selectedOption}
      onChange={handleSelect}
      disabled={disabled}
    >
      {({ open }) => {
        // Sincronizar estado open
        if (open !== isOpen) {
          // Usar setTimeout para evitar update durante render
          setTimeout(() => setIsOpen(open), 0);
        }
        
        return (
          <div className="relative">
            {/* Input que é o próprio trigger */}
            <div className="relative">
              {icon && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  {icon}
                </span>
              )}
              <ComboboxInput
                className={cn(
                  "w-full h-10 rounded-lg border transition-colors",
                  "bg-[rgba(15,15,35,0.6)] border-white/12",
                  "text-sm text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  icon ? "pl-10 pr-10" : "pl-3 pr-10",
                  typeof value === "string" && "text-primary",
                  className
                )}
                displayValue={() => displayValue}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
              />
              <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </ComboboxButton>
            </div>

        {/* Lista de opções */}
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery("")}
        >
          <ComboboxOptions className="glass-dropdown">
            {loading ? (
              <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando...
              </div>
            ) : (
              <>
                {/* Opção de criar novo */}
                {showCreateOption && (
                  <div
                    onClick={handleCreate}
                    className="relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-sm text-primary hover:bg-primary/20"
                  >
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Plus className="h-4 w-4" />
                    </span>
                    <span>
                      Criar: <strong>{query.trim()}</strong>
                    </span>
                  </div>
                )}

                {/* Opções existentes */}
                {options.length === 0 && !showCreateOption ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    {query 
                      ? `Nenhum resultado para "${query}"` 
                      : hasFetched 
                        ? "Nenhum item disponível" 
                        : "Clique para carregar..."
                    }
                  </div>
                ) : (
                  options.map((option) => (
                    <ComboboxOption
                      key={option.value}
                      value={option}
                      className={({ active, selected }) =>
                        cn(
                          "relative cursor-pointer select-none py-2.5 pl-10 pr-4 text-sm",
                          active && "bg-primary/20 text-primary",
                          selected && "bg-primary/10",
                          !active && !selected && "text-foreground"
                        )
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span
                            className={cn(
                              "block truncate",
                              selected && "font-medium"
                            )}
                          >
                            {option.label}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </>
                      )}
                    </ComboboxOption>
                  ))
                )}
              </>
            )}
          </ComboboxOptions>
        </Transition>
          </div>
        );
      }}
    </Combobox>
  );
}
