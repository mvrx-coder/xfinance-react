/**
 * Componente de Célula Editável para o DataGrid
 * 
 * Permite edição inline com suporte a diferentes tipos de dados.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string | number | null | undefined;
  displayValue?: string;
  field: string;
  idPrinc: number;
  type?: "text" | "date" | "currency" | "number";
  className?: string;
  onSave: (idPrinc: number, field: string, value: string) => Promise<boolean>;
}

export function EditableCell({
  value,
  displayValue,
  field,
  idPrinc,
  type = "text",
  className,
  onSave,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Valor exibido (formatado ou original)
  const display = displayValue ?? (value?.toString() || "-");

  // Iniciar edição
  const startEdit = useCallback(() => {
    // Para datas, começar com valor vazio para facilitar digitação
    if (type === "date") {
      setEditValue(display === "-" ? "" : display);
    } else if (type === "currency") {
      // Para moeda, usar valor numérico
      setEditValue(value?.toString() || "");
    } else {
      setEditValue(value?.toString() || "");
    }
    setIsEditing(true);
  }, [display, value, type]);

  // Cancelar edição
  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditValue("");
  }, []);

  // Salvar edição
  const saveEdit = useCallback(async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const success = await onSave(idPrinc, field, editValue);
      if (success) {
        setIsEditing(false);
      }
    } finally {
      setIsSaving(false);
    }
  }, [idPrinc, field, editValue, onSave, isSaving]);

  // Focar input quando entrar em modo edição
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handlers de teclado
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  }, [saveEdit, cancelEdit]);

  if (isEditing) {
    return (
      <div className="relative px-1">
        {/* Botões flutuantes acima do input */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-background/95 backdrop-blur-sm border border-border rounded-md px-1 py-0.5 shadow-lg z-10">
          <button
            onClick={saveEdit}
            disabled={isSaving}
            className="p-0.5 text-success hover:bg-success/20 rounded transition-colors"
            title="Salvar (Enter)"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={cancelEdit}
            disabled={isSaving}
            className="p-0.5 text-destructive hover:bg-destructive/20 rounded transition-colors"
            title="Cancelar (Esc)"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Pequeno delay para permitir clique nos botões
            setTimeout(() => {
              if (!isSaving) cancelEdit();
            }, 150);
          }}
          className={cn(
            "w-full h-6 px-1 text-xs bg-background border border-primary rounded",
            "focus:outline-none focus:ring-1 focus:ring-primary",
            type === "currency" && "text-right font-mono",
            type === "date" && "text-center",
          )}
          placeholder={type === "date" ? "DD/MM" : ""}
          disabled={isSaving}
        />
      </div>
    );
  }

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        startEdit();
      }}
      className={cn(
        "block w-full px-2 py-1 truncate cursor-pointer",
        "hover:bg-primary/10 hover:text-primary transition-colors rounded",
        className
      )}
      title="Clique para editar"
    >
      {display}
    </span>
  );
}

