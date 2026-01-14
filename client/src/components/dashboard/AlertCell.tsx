/**
 * Célula com Indicadores Visuais de Alerta (dot + border-bottom)
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AlertLevel } from "./alertRules";

interface AlertCellProps {
  value: string | null | undefined;
  displayValue: string;
  alertLevel: AlertLevel;
  field: string;
  idPrinc: number;
  type?: "text" | "date" | "currency";
  className?: string;
  onSave?: (idPrinc: number, field: string, newValue: string) => Promise<boolean>;
}

// Converte data de YYYY-MM-DD para DD/MM/AA
function toEditFormat(dateStr: string | null | undefined): string {
  const raw = dateStr?.toString() || "";
  if (raw && raw.includes("-")) {
    const parts = raw.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const shortYear = year.slice(-2);
      return `${day}/${month}/${shortYear}`;
    }
  }
  return "";
}

export function AlertCell({
  value,
  displayValue,
  alertLevel,
  field,
  idPrinc,
  type = "text",
  className = "",
  onSave,
}: AlertCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      // Para datas, converter para formato DD/MM/AA
      setInputValue(type === "date" ? toEditFormat(value) : (value || ""));
    }
  }, [value, isEditing, type]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(async () => {
    if (!onSave || inputValue === (value || "")) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(idPrinc, field, inputValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, idPrinc, field, inputValue, value]);

  const handleCancel = useCallback(() => {
    // Para datas, converter para formato DD/MM/AA
    setInputValue(type === "date" ? toEditFormat(value) : (value || ""));
    setIsEditing(false);
  }, [value, type]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") { e.preventDefault(); handleSave(); }
      else if (e.key === "Escape") { e.preventDefault(); handleCancel(); }
    },
    [handleSave, handleCancel]
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (isEditing && !isSaving) handleCancel();
    }, 150);
  }, [isEditing, isSaving, handleCancel]);

  // Somente dots pulsantes, sem bordas
  const showDot = alertLevel !== "none";
  
  const dotClass = {
    none: "",
    warning: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse",
    danger: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse",
    success: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse",
  }[alertLevel];

  if (isEditing) {
    return (
      <div className="relative flex items-center justify-center h-full w-full">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={isSaving}
          placeholder={type === "date" ? "DD/MM/AA" : ""}
          className={cn(
            "w-full h-full bg-transparent focus:outline-none px-2 py-1 text-xs",
            type === "date" && "text-center min-w-[80px]",
            className
          )}
          autoFocus
        />
        <div className="absolute -top-8 right-0 flex gap-1 bg-slate-800/80 backdrop-blur-sm p-1 rounded-md border border-white/10 shadow-lg z-10">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-success hover:bg-success/20" onClick={handleSave} disabled={isSaving}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/20" onClick={handleCancel} disabled={isSaving}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center justify-between gap-1.5 w-full h-full px-2 py-1 cursor-pointer hover:bg-white/[0.05]")}
      onDoubleClick={() => setIsEditing(true)}
      title="Duplo clique para editar"
    >
      <span className={cn("truncate text-xs", className)}>{displayValue}</span>
      {showDot && <span className={cn("w-2 h-2 rounded-full flex-shrink-0", dotClass)} />}
    </div>
  );
}


