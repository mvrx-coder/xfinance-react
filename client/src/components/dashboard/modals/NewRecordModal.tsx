import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Check, 
  X, 
  Building2, 
  User, 
  Briefcase, 
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Layers,
  CalendarIcon,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchContrOptions,
  fetchSegurOptions,
  fetchAtiviOptions,
  fetchUfOptions,
  fetchCidadeOptions,
  fetchUsersOptions,
  type LookupOption,
  type UserOption,
} from "@/services/api/lookups";

// Schema com data obrigatória e cidade obrigatória
// Segurado e Atividade podem ser number (ID existente) ou string (criar novo)
const newRecordSchema = z.object({
  idContr: z.number().min(1, "Contratante obrigatório"),
  // Segurado: number = ID existente, string = criar novo
  idSegur: z.union([
    z.number().min(1),
    z.string().min(1, "Segurado obrigatório")
  ]),
  // Atividade: number = ID existente, string = criar nova
  idAtivi: z.union([
    z.number().min(1),
    z.string().min(1, "Atividade obrigatória")
  ]),
  idUserGuy: z.number().min(1, "Inspetor obrigatório"),
  dtInspecao: z.date({ required_error: "Data obrigatória" }),
  idUf: z.number().min(1, "UF obrigatória"),
  idCidade: z.number().min(1, "Cidade obrigatória"),
  honorario: z.number().min(0).optional(),
  meta: z.boolean().optional(),
  variosLocais: z.boolean().optional(),
});

type NewRecordFormData = z.infer<typeof newRecordSchema>;

// Estado para confirmação de criação de novas entidades
interface PendingCreation {
  data: NewRecordFormData;
  newEntities: string[];
}

// Tipos para resposta da API
interface CreateInspectionResponse {
  success: boolean;
  id_princ: number;
  message: string;
  dirs_created: string[];
  loc: number;
}

// Estado do modo multi-local
interface MultiLocalState {
  active: boolean;
  idPrinc: number | null;
  idContr: number | null;
  idSegur: number | null;
  segurNome: string | null;
}

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.3 }
  })
};

export function NewRecordModal({ isOpen, onClose, onSuccess }: NewRecordModalProps) {
  const { toast } = useToast();
  
  // Estado multi-local
  const [multiLocal, setMultiLocal] = useState<MultiLocalState>({
    active: false,
    idPrinc: null,
    idContr: null,
    idSegur: null,
    segurNome: null,
  });
  
  // Estado para confirmação de criação de novas entidades
  const [pendingCreation, setPendingCreation] = useState<PendingCreation | null>(null);
  
  // Lookups
  const [contrOptions, setContrOptions] = useState<LookupOption[]>([]);
  const [segurOptions, setSegurOptions] = useState<LookupOption[]>([]);
  const [ativiOptions, setAtiviOptions] = useState<LookupOption[]>([]);
  const [ufOptions, setUfOptions] = useState<LookupOption[]>([]);
  const [cidadeOptions, setCidadeOptions] = useState<LookupOption[]>([]);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchContrOptions().then(setContrOptions);
      fetchSegurOptions().then(setSegurOptions);
      fetchAtiviOptions().then(setAtiviOptions);
      fetchUfOptions().then(setUfOptions);
      fetchUsersOptions().then(setUserOptions);
    }
  }, [isOpen]);

  const form = useForm<NewRecordFormData>({
    resolver: zodResolver(newRecordSchema),
    defaultValues: {
      idContr: 0,
      idSegur: "" as unknown as number | string, // Inicia vazio, aceita number ou string
      idAtivi: "" as unknown as number | string, // Inicia vazio, aceita number ou string
      idUserGuy: 0,
      dtInspecao: undefined,
      idUf: 0,
      idCidade: 0,
      honorario: 0,
      meta: true,
      variosLocais: false,
    },
  });

  const selectedUf = form.watch("idUf");
  const variosLocais = form.watch("variosLocais");

  // Cascata UF -> Cidade
  useEffect(() => {
    if (selectedUf && selectedUf > 0) {
      fetchCidadeOptions(selectedUf).then(setCidadeOptions);
      form.setValue("idCidade", 0);
    } else {
      setCidadeOptions([]);
    }
  }, [selectedUf, form]);

  // Mutation para criar inspeção
  const createMutation = useMutation({
    mutationFn: async (data: NewRecordFormData): Promise<CreateInspectionResponse> => {
      // Construir payload diferenciando ID existente de texto para criar
      const payload: Record<string, unknown> = {
        id_contr: data.idContr,
        id_user_guy: data.idUserGuy,
        dt_inspecao: format(data.dtInspecao, "yyyy-MM-dd"),
        id_uf: data.idUf,
        id_cidade: data.idCidade,
        honorario: data.honorario || null,
      };
      
      // Segurado: number = ID existente, string = criar novo
      if (typeof data.idSegur === "number") {
        payload.id_segur = data.idSegur;
      } else {
        // Limpar prefixo "➕ Criar: " se presente
        let segurNome = data.idSegur;
        if (segurNome.startsWith("➕ Criar: ")) {
          segurNome = segurNome.replace("➕ Criar: ", "").trim();
        }
        payload.segur_nome = segurNome;
      }
      
      // Atividade: number = ID existente, string = criar nova
      if (typeof data.idAtivi === "number") {
        payload.id_ativi = data.idAtivi;
      } else {
        // Limpar prefixo "➕ Criar: " se presente
        let atividade = data.idAtivi;
        if (atividade.startsWith("➕ Criar: ")) {
          atividade = atividade.replace("➕ Criar: ", "").trim();
        }
        payload.atividade = atividade;
      }
      
      return apiRequest("POST", "/api/inspections", payload);
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      
      // Mostrar toast com diretórios criados
      const dirsMsg = response.dirs_created.length > 0 
        ? `📁 ${response.dirs_created.join(" | ")}` 
        : "";
      
      if (variosLocais) {
        // Modo multi-local: guardar id_princ e manter modal aberto
        setMultiLocal({
          active: true,
          idPrinc: response.id_princ,
          idContr: variables.idContr,
          idSegur: variables.idSegur,
          segurNome: segurOptions.find(s => s.value === variables.idSegur)?.label || null,
        });
        
        // Limpar apenas campos locais
        form.setValue("idUserGuy", 0);
        form.setValue("dtInspecao", undefined as any);
        form.setValue("idUf", 0);
        form.setValue("idCidade", 0);
        
        toast({
          title: "✅ Primeiro local cadastrado!",
          description: `${dirsMsg} Insira o próximo local.`,
        });
      } else {
        // Modo normal: fechar modal
        toast({
          title: "✅ Registro criado com sucesso!",
          description: dirsMsg || response.message,
        });
        form.reset();
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro ao criar registro",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  // Mutation para adicionar local adicional
  const addLocalMutation = useMutation({
    mutationFn: async (data: NewRecordFormData): Promise<CreateInspectionResponse> => {
      const payload = {
        id_princ: multiLocal.idPrinc,
        id_user_guy: data.idUserGuy,
        dt_inspecao: format(data.dtInspecao, "yyyy-MM-dd"),
        id_uf: data.idUf,
        id_cidade: data.idCidade,
      };
      return apiRequest("POST", "/api/inspections/local-adicional", payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      
      const dirsMsg = response.dirs_created.length > 0 
        ? `📁 ${response.dirs_created.join(" | ")}` 
        : "";
      
      // Limpar campos locais para próximo
      form.setValue("idUserGuy", 0);
      form.setValue("dtInspecao", undefined as any);
      form.setValue("idUf", 0);
      form.setValue("idCidade", 0);
      
      toast({
        title: `✅ Local adicional cadastrado! (Total: ${response.loc} locais)`,
        description: `${dirsMsg} Insira o próximo local.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro ao adicionar local",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    },
  });

  // Verificar se há novas entidades a serem criadas
  const checkNewEntities = (data: NewRecordFormData): string[] => {
    const newEntities: string[] = [];
    
    if (typeof data.idSegur === "string") {
      let nome = data.idSegur;
      if (nome.startsWith("➕ Criar: ")) {
        nome = nome.replace("➕ Criar: ", "").trim();
      }
      newEntities.push(`Segurado: "${nome}"`);
    }
    
    if (typeof data.idAtivi === "string") {
      let nome = data.idAtivi;
      if (nome.startsWith("➕ Criar: ")) {
        nome = nome.replace("➕ Criar: ", "").trim();
      }
      newEntities.push(`Atividade: "${nome}"`);
    }
    
    return newEntities;
  };

  // Executar criação (após confirmação ou se não há novas entidades)
  const executeCreate = (data: NewRecordFormData) => {
    if (multiLocal.active && multiLocal.idPrinc) {
      // Modo multi-local ativo: adicionar local adicional
      addLocalMutation.mutate(data);
    } else {
      // Modo normal ou primeiro local
      createMutation.mutate(data);
    }
  };

  const onSubmit = (data: NewRecordFormData) => {
    const newEntities = checkNewEntities(data);
    
    if (newEntities.length > 0) {
      // Há novas entidades - pedir confirmação
      setPendingCreation({ data, newEntities });
    } else {
      // Sem novas entidades - executar diretamente
      executeCreate(data);
    }
  };
  
  // Handler para confirmação de criação
  const handleConfirmCreate = () => {
    if (pendingCreation) {
      executeCreate(pendingCreation.data);
      setPendingCreation(null);
    }
  };
  
  // Handler para cancelar criação
  const handleCancelCreate = () => {
    setPendingCreation(null);
  };

  // Handler para checkbox vários locais
  const handleVariosLocaisChange = (checked: boolean) => {
    form.setValue("variosLocais", checked);
    
    if (!checked && multiLocal.active) {
      // Usuário desmarcou enquanto estava no modo multi-local
      // Resetar estado
      setMultiLocal({
        active: false,
        idPrinc: null,
        idContr: null,
        idSegur: null,
        segurNome: null,
      });
      setPendingCreation(null);
      form.reset();
      toast({
        title: "ℹ️ Inserção de múltiplos locais encerrada",
      });
    }
  };

  // Handler para fechar modal
  const handleClose = () => {
    setMultiLocal({
      active: false,
      idPrinc: null,
      idContr: null,
      idSegur: null,
      segurNome: null,
    });
    setPendingCreation(null);
    form.reset();
    onClose();
  };

  const isPending = createMutation.isPending || addLocalMutation.isPending;

  return (
    <Modal
      id="new-record-modal"
      isOpen={isOpen}
      onClose={handleClose}
      title={multiLocal.active 
        ? `Adicionar Local - ${multiLocal.segurNome || "Registro"}` 
        : "Inserir Novo Trabalho"
      }
      maxWidth="5xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="gap-2 border-white/15 bg-transparent hover:bg-white/5"
            data-testid="button-cancel-new-record"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="meta"
                checked={form.watch("meta") || false}
                onCheckedChange={(checked) => form.setValue("meta", !!checked)}
                className="border-white/20 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                data-testid="checkbox-meta"
              />
              <label 
                htmlFor="meta" 
                className="text-sm cursor-pointer text-muted-foreground"
              >
                Meta
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="varios-locais"
                checked={variosLocais || false}
                onCheckedChange={handleVariosLocaisChange}
                disabled={multiLocal.active}
                className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                data-testid="checkbox-varios-locais"
              />
              <label 
                htmlFor="varios-locais" 
                className={cn(
                  "text-sm cursor-pointer",
                  multiLocal.active ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                Vários locais
              </label>
            </div>
            
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isPending}
              className={cn(
                "gap-2 font-semibold px-6",
                multiLocal.active 
                  ? "bg-gradient-to-r from-blue-500/90 to-blue-600 border border-blue-500/50 text-white"
                  : "bg-gradient-to-r from-accent/90 to-accent border border-accent/50 text-accent-foreground"
              )}
              data-testid="button-confirm-new-record"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : multiLocal.active ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {multiLocal.active ? "Próximo Local" : "Cadastrar"}
            </Button>
          </div>
        </div>
      }
    >
      <Form {...form}>
        <form className="space-y-6">
          {/* Seção 1: Campos Globais (desabilitados no modo multi-local após primeiro registro) */}
          <motion.div
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="form-section"
          >
            <div className="form-section-card">
              <div className="grid grid-cols-12 gap-4">
                <FormField
                  control={form.control}
                  name="idContr"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          Player <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <SearchableCombobox
                            options={contrOptions}
                            value={field.value || null}
                            onChange={(val) => field.onChange(typeof val === 'number' ? val : parseInt(val as string))}
                            placeholder="Buscar..."
                            disabled={multiLocal.active}
                            data-testid="select-player"
                          />
                        </FormControl>
                        <FormMessage className="form-error" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idSegur"
                  render={({ field }) => (
                    <FormItem className="col-span-4">
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          Segurado <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <SearchableCombobox
                            options={segurOptions}
                            value={field.value || null}
                            onChange={field.onChange}
                            placeholder="Buscar..."
                            emptyMessage="Nenhum segurado encontrado"
                            allowCreate={true}
                            disabled={multiLocal.active}
                            data-testid="select-segurado"
                          />
                        </FormControl>
                        <FormMessage className="form-error" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idAtivi"
                  render={({ field }) => (
                    <FormItem className="col-span-4">
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <Briefcase className="w-3.5 h-3.5 text-primary" />
                          Atividade <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <SearchableCombobox
                            options={ativiOptions}
                            value={field.value || null}
                            onChange={field.onChange}
                            placeholder="Buscar..."
                            emptyMessage="Nenhuma atividade encontrada"
                            allowCreate={true}
                            disabled={multiLocal.active}
                            data-testid="select-atividade"
                          />
                        </FormControl>
                        <FormMessage className="form-error" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="honorario"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <DollarSign className="w-3.5 h-3.5 text-success" />
                          Honorários
                        </label>
                        <FormControl>
                          <div className="form-currency-wrapper">
                            <span className="form-currency-prefix">R$</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              className="form-input form-input-currency"
                              disabled={multiLocal.active}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-honorario"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="form-error" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </motion.div>

          {/* Seção 2: Campos Locais (habilitados sempre - repetidos por local) */}
          <motion.div
            custom={1}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="form-section"
          >
            <div className="form-section-card">
              {multiLocal.active && (
                <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-blue-300">
                    <strong>Adicionando local #{multiLocal.idPrinc ? "2+" : "1"}</strong> — 
                    Preencha os dados do novo local e clique em "Próximo Local" ou desmarque "Vários locais" para finalizar.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-12 gap-4">
                <FormField
                  control={form.control}
                  name="idUserGuy"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <User className="w-3.5 h-3.5 text-primary" />
                          Guy <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <SearchableCombobox
                            options={userOptions}
                            value={field.value || null}
                            onChange={(val) => field.onChange(typeof val === 'number' ? val : parseInt(val as string))}
                            placeholder="Buscar..."
                            data-testid="select-guy"
                          />
                        </FormControl>
                        <FormMessage className="form-error" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dtInspecao"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          Data <span className="text-destructive">*</span>
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "form-input w-full justify-start text-left font-normal bg-[rgba(15,15,35,0.6)] border-white/12 hover:bg-[rgba(15,15,35,0.8)]",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-inspecao-date"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-accent" />
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione...</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-card border-white/15" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              locale={ptBR}
                              initialFocus
                              className="rounded-md"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="form-error" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idUf"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          UF <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <SearchableCombobox
                            options={ufOptions}
                            value={field.value || null}
                            onChange={(val) => field.onChange(typeof val === 'number' ? val : parseInt(val as string))}
                            placeholder="Buscar..."
                            data-testid="select-uf"
                          />
                        </FormControl>
                        <FormMessage className="form-error" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idCidade"
                  render={({ field }) => (
                    <FormItem className="col-span-6">
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <Layers className="w-3.5 h-3.5 text-accent" />
                          Cidade <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <SearchableCombobox
                            options={cidadeOptions}
                            value={field.value || null}
                            onChange={(val) => field.onChange(typeof val === 'number' ? val : parseInt(val as string))}
                            placeholder={selectedUf && selectedUf > 0 ? "Buscar cidade..." : "Selecione UF primeiro..."}
                            disabled={!selectedUf || selectedUf === 0}
                            data-testid="select-cidade"
                          />
                        </FormControl>
                        <FormMessage className="form-error" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </motion.div>
        </form>
      </Form>
      
      {/* Dialog de confirmação para criar novas entidades */}
      <AlertDialog open={pendingCreation !== null} onOpenChange={(open) => !open && handleCancelCreate()}>
        <AlertDialogContent className="bg-card border-white/15">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Confirmar criação de novos registros
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Você está prestes a criar os seguintes registros que não existem no sistema:
              <ul className="mt-3 space-y-1">
                {pendingCreation?.newEntities.map((entity, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-foreground font-medium">
                    <span className="text-primary">➕</span> {entity}
                  </li>
                ))}
              </ul>
              <p className="mt-4">Deseja continuar?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleCancelCreate}
              className="border-white/15 bg-transparent hover:bg-white/5"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCreate}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sim, criar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Modal>
  );
}
