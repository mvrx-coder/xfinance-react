/**
 * Hook para gerenciar formulário de novo registro.
 * 
 * Encapsula:
 * - Validação com Zod
 * - Mutations para criação de registro
 * - Estado do modo multi-local
 * - Lógica de confirmação de criação de novas entidades
 */

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { format } from "date-fns";

import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "./use-toast";

// =============================================================================
// SCHEMA ZOD
// =============================================================================

export const newRecordSchema = z.object({
  // Contratante (obrigatório)
  idContr: z.number().min(1, "Contratante obrigatório"),
  
  // Segurado: number = ID existente, string = criar novo
  idSegur: z.union([
    z.number().min(1),
    z.string().min(1, "Segurado obrigatório"),
  ]),
  
  // Atividade: number = ID existente, string = criar nova
  idAtivi: z.union([
    z.number().min(1),
    z.string().min(1, "Atividade obrigatória"),
  ]),
  
  // Campos obrigatórios
  idUserGuy: z.number().min(1, "Inspetor obrigatório"),
  dtInspecao: z.date({ required_error: "Data obrigatória" }),
  idUf: z.number().min(1, "UF obrigatória"),
  idCidade: z.number().min(1, "Cidade obrigatória"),
  
  // Opcional
  honorario: z.number().min(0).optional().nullable(),
  
  // Multi-local
  variosLocais: z.boolean().optional(),
});

export type NewRecordFormData = z.infer<typeof newRecordSchema>;

// =============================================================================
// TIPOS
// =============================================================================

export interface NewRecordResponse {
  success: boolean;
  id_princ: number;
  message: string;
  dirs_created: string[];
  loc: number;
}

export interface MultiLocalState {
  active: boolean;
  idPrinc: number | null;
  idContr: number | null;
  idSegur: number | null;
  segurNome: string | null;
}

export interface PendingCreation {
  data: NewRecordFormData;
  newEntities: string[];
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Limpa prefixo "➕ Criar: " do texto
 */
function cleanCreatePrefix(text: string): string {
  if (text.startsWith("➕ Criar: ")) {
    return text.replace("➕ Criar: ", "").trim();
  }
  return text.trim();
}

/**
 * Verifica quais entidades são novas (texto para criar)
 */
function checkNewEntities(data: NewRecordFormData): string[] {
  const entities: string[] = [];
  
  if (typeof data.idSegur === "string") {
    const nome = cleanCreatePrefix(data.idSegur);
    entities.push(`Segurado: "${nome}"`);
  }
  
  if (typeof data.idAtivi === "string") {
    const nome = cleanCreatePrefix(data.idAtivi);
    entities.push(`Atividade: "${nome}"`);
  }
  
  return entities;
}

// =============================================================================
// HOOK
// =============================================================================

export interface UseNewRecordOptions {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function useNewRecord(options: UseNewRecordOptions = {}) {
  const { toast } = useToast();
  
  // Estado multi-local
  const [multiLocal, setMultiLocal] = useState<MultiLocalState>({
    active: false,
    idPrinc: null,
    idContr: null,
    idSegur: null,
    segurNome: null,
  });
  
  // Estado para confirmação de criação
  const [pendingCreation, setPendingCreation] = useState<PendingCreation | null>(null);
  
  // Formulário
  const form = useForm<NewRecordFormData>({
    resolver: zodResolver(newRecordSchema),
    defaultValues: {
      idContr: 0,
      idSegur: undefined,
      idAtivi: undefined,
      idUserGuy: 0,
      dtInspecao: undefined,
      idUf: 0,
      idCidade: 0,
      honorario: null,
      variosLocais: false,
    },
  });
  
  // Mutation: criar registro
  const createMutation = useMutation({
    mutationFn: async (data: NewRecordFormData): Promise<NewRecordResponse> => {
      const payload: Record<string, unknown> = {
        id_contr: data.idContr,
        id_user_guy: data.idUserGuy,
        dt_inspecao: format(data.dtInspecao, "yyyy-MM-dd"),
        id_uf: data.idUf,
        id_cidade: data.idCidade,
        honorario: data.honorario || null,
      };
      
      // Segurado
      if (typeof data.idSegur === "number") {
        payload.id_segur = data.idSegur;
      } else {
        payload.segur_nome = cleanCreatePrefix(data.idSegur);
      }
      
      // Atividade
      if (typeof data.idAtivi === "number") {
        payload.id_ativi = data.idAtivi;
      } else {
        payload.atividade = cleanCreatePrefix(data.idAtivi);
      }
      
      const response = await apiRequest("POST", "/api/new-record", payload);
      return response.json();
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      
      const dirsMsg = response.dirs_created.length > 0
        ? `📁 ${response.dirs_created.join(" | ")}`
        : "";
      
      const variosLocais = form.getValues("variosLocais");
      
      if (variosLocais) {
        // Modo multi-local: guardar id_princ e manter modal aberto
        setMultiLocal({
          active: true,
          idPrinc: response.id_princ,
          idContr: variables.idContr,
          idSegur: typeof variables.idSegur === "number" ? variables.idSegur : null,
          segurNome: typeof variables.idSegur === "string" 
            ? cleanCreatePrefix(variables.idSegur) 
            : null,
        });
        
        // Limpar apenas campos locais
        form.setValue("idUserGuy", 0);
        form.setValue("dtInspecao", undefined as unknown as Date);
        form.setValue("idUf", 0);
        form.setValue("idCidade", 0);
        
        toast({
          title: "✅ Primeiro local cadastrado!",
          description: `${dirsMsg} Insira o próximo local.`,
        });
      } else {
        // Modo normal
        toast({
          title: "✅ Registro criado com sucesso!",
          description: dirsMsg || response.message,
        });
        form.reset();
        options.onSuccess?.();
      }
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erro ao criar registro",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });
  
  // Mutation: adicionar local
  const addLocalMutation = useMutation({
    mutationFn: async (data: NewRecordFormData): Promise<NewRecordResponse> => {
      const payload = {
        id_princ: multiLocal.idPrinc,
        id_user_guy: data.idUserGuy,
        dt_inspecao: format(data.dtInspecao, "yyyy-MM-dd"),
        id_uf: data.idUf,
        id_cidade: data.idCidade,
      };
      
      const response = await apiRequest("POST", "/api/new-record/local", payload);
      return response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      
      const dirsMsg = response.dirs_created.length > 0
        ? `📁 ${response.dirs_created.join(" | ")}`
        : "";
      
      // Limpar campos locais
      form.setValue("idUserGuy", 0);
      form.setValue("dtInspecao", undefined as unknown as Date);
      form.setValue("idUf", 0);
      form.setValue("idCidade", 0);
      
      toast({
        title: `✅ Local #${response.loc} adicionado!`,
        description: `${dirsMsg} Insira o próximo local.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Erro ao adicionar local",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });
  
  // Executar criação
  const executeCreate = useCallback((data: NewRecordFormData) => {
    if (multiLocal.active && multiLocal.idPrinc) {
      addLocalMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }, [multiLocal, createMutation, addLocalMutation]);
  
  // Handler de submit
  const onSubmit = useCallback((data: NewRecordFormData) => {
    const newEntities = checkNewEntities(data);
    
    if (newEntities.length > 0 && !multiLocal.active) {
      // Há novas entidades - pedir confirmação
      setPendingCreation({ data, newEntities });
    } else {
      // Sem novas entidades ou em modo multi-local - executar diretamente
      executeCreate(data);
    }
  }, [executeCreate, multiLocal.active]);
  
  // Confirmar criação
  const confirmCreate = useCallback(() => {
    if (pendingCreation) {
      executeCreate(pendingCreation.data);
      setPendingCreation(null);
    }
  }, [pendingCreation, executeCreate]);
  
  // Cancelar criação
  const cancelCreate = useCallback(() => {
    setPendingCreation(null);
  }, []);
  
  // Toggle checkbox vários locais
  const handleVariosLocaisChange = useCallback((checked: boolean) => {
    form.setValue("variosLocais", checked);
    
    if (!checked && multiLocal.active) {
      // Desmarcou enquanto estava no modo multi-local
      setMultiLocal({
        active: false,
        idPrinc: null,
        idContr: null,
        idSegur: null,
        segurNome: null,
      });
      setPendingCreation(null);
      form.reset();
      toast({ title: "ℹ️ Inserção de múltiplos locais encerrada" });
    }
  }, [multiLocal.active, form, toast]);
  
  // Reset completo
  const resetForm = useCallback(() => {
    setMultiLocal({
      active: false,
      idPrinc: null,
      idContr: null,
      idSegur: null,
      segurNome: null,
    });
    setPendingCreation(null);
    form.reset();
  }, [form]);
  
  // Estado de loading
  const isPending = createMutation.isPending || addLocalMutation.isPending;
  
  // Watch de campos para cascata
  const selectedUf = form.watch("idUf");
  const variosLocais = form.watch("variosLocais");
  
  // Handler de erro de validação - mostra toast com campos inválidos
  const handleValidationError = useCallback(
    (errors: Record<string, unknown>) => {
      console.error("[NewRecord] Validação falhou:", errors);
      
      // Extrair nomes dos campos com erro
      const errorFields = Object.keys(errors);
      const fieldLabels: Record<string, string> = {
        idContr: "Player",
        idSegur: "Segurado",
        idAtivi: "Atividade",
        idUserGuy: "Inspetor",
        dtInspecao: "Data Inspeção",
        idUf: "UF",
        idCidade: "Cidade",
        honorario: "Honorário",
      };
      
      const errorLabels = errorFields
        .map((field) => fieldLabels[field] || field)
        .join(", ");
      
      toast({
        title: "⚠️ Campos obrigatórios",
        description: `Preencha: ${errorLabels}`,
        variant: "destructive",
      });
    },
    [toast]
  );
  
  // Wrapper para handleSubmit com tratamento de erro de validação
  const handleFormSubmit = useCallback(
    (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault?.();
      console.log("[NewRecord] Submit iniciado, validando...");
      
      return form.handleSubmit(
        // onValid - dados válidos
        (data) => {
          console.log("[NewRecord] Validação OK, dados:", data);
          onSubmit(data);
        },
        // onInvalid - erros de validação
        (errors) => {
          handleValidationError(errors);
        }
      )(e);
    },
    [form, onSubmit, handleValidationError]
  );
  
  return {
    form,
    multiLocal,
    pendingCreation,
    isPending,
    selectedUf,
    variosLocais,
    onSubmit: handleFormSubmit,
    confirmCreate,
    cancelCreate,
    handleVariosLocaisChange,
    resetForm,
  };
}
