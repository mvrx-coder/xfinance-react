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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  CalendarIcon
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

const newRecordSchema = z.object({
  idContr: z.number().min(1, "Contratante obrigatório"),
  idSegur: z.number().min(1, "Segurado obrigatório"),
  idAtivi: z.number().min(1, "Atividade obrigatória"),
  idUserGuy: z.number().min(1, "Inspetor obrigatório"),
  dtInspecao: z.date().optional(),
  idUf: z.number().min(1, "UF obrigatória"),
  idCidade: z.number().optional(),
  honorario: z.number().min(0).optional(),
  variosLocais: z.boolean().optional(),
});

type NewRecordFormData = z.infer<typeof newRecordSchema>;

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
  const [variosLocais, setVariosLocais] = useState(false);
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
      idSegur: 0,
      idAtivi: 0,
      idUserGuy: 0,
      dtInspecao: undefined,
      idUf: 0,
      idCidade: 0,
      honorario: 0,
      variosLocais: false,
    },
  });

  const selectedUf = form.watch("idUf");

  useEffect(() => {
    if (selectedUf && selectedUf > 0) {
      fetchCidadeOptions(selectedUf).then(setCidadeOptions);
      form.setValue("idCidade", 0);
    } else {
      setCidadeOptions([]);
    }
  }, [selectedUf, form]);

  const createMutation = useMutation({
    mutationFn: async (data: NewRecordFormData) => {
      const payload = {
        idContr: data.idContr,
        idSegur: data.idSegur,
        idAtivi: data.idAtivi,
        idUserGuy: data.idUserGuy,
        idUserGuilty: data.idUserGuy,
        idUf: data.idUf,
        idCidade: data.idCidade || null,
        dtInspecao: data.dtInspecao ? format(data.dtInspecao, "dd/MM") : null,
        honorario: data.honorario || null,
        loc: variosLocais ? 1 : null,
        meta: 0,
        ms: 0,
      };
      return apiRequest("POST", "/api/inspections", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/kpis"] });
      form.reset();
      onSuccess();
    },
  });

  const onSubmit = (data: NewRecordFormData) => {
    createMutation.mutate(data);
  };

  return (
    <Modal
      id="new-record-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Inserir Novo Trabalho"
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="gap-2 border-white/15 bg-transparent hover:bg-white/5"
            data-testid="button-cancel-new-record"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="varios-locais"
                checked={variosLocais}
                onCheckedChange={(checked) => setVariosLocais(checked as boolean)}
                className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                data-testid="checkbox-varios-locais"
              />
              <label 
                htmlFor="varios-locais" 
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Vários locais
              </label>
            </div>
            
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={createMutation.isPending}
              className="gap-2 bg-gradient-to-r from-accent/90 to-accent border border-accent/50 text-accent-foreground font-semibold px-6"
              data-testid="button-confirm-new-record"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Cadastrar
            </Button>
          </div>
        </div>
      }
    >
      <Form {...form}>
        <form className="space-y-6">
          <motion.div
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="form-section"
          >
            <div className="form-section-card">
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="idContr"
                  render={({ field }) => (
                    <FormItem>
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          Player <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <Select 
                            onValueChange={(val) => field.onChange(parseInt(val))} 
                            value={field.value ? field.value.toString() : ""}
                          >
                            <SelectTrigger className="form-select" data-testid="select-player">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {contrOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                    <FormItem className="col-span-1">
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          Segurado <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <Select 
                            onValueChange={(val) => field.onChange(parseInt(val))} 
                            value={field.value ? field.value.toString() : ""}
                          >
                            <SelectTrigger className="form-select" data-testid="select-segurado">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {segurOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                    <FormItem>
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <Briefcase className="w-3.5 h-3.5 text-primary" />
                          Atividade <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <Select 
                            onValueChange={(val) => field.onChange(parseInt(val))} 
                            value={field.value ? field.value.toString() : ""}
                          >
                            <SelectTrigger className="form-select" data-testid="select-atividade">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {ativiOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="form-error" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idUserGuy"
                  render={({ field }) => (
                    <FormItem>
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <User className="w-3.5 h-3.5 text-primary" />
                          Inspetor (Guy) <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <Select 
                            onValueChange={(val) => field.onChange(parseInt(val))} 
                            value={field.value ? field.value.toString() : ""}
                          >
                            <SelectTrigger className="form-select" data-testid="select-guy">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {userOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="form-error" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            custom={1}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="form-section"
          >
            <div className="form-section-card">
              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="dtInspecao"
                  render={({ field }) => (
                    <FormItem>
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          Inspeção <span className="text-destructive">*</span>
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
                    <FormItem>
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          UF <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <Select 
                            onValueChange={(val) => field.onChange(parseInt(val))} 
                            value={field.value ? field.value.toString() : ""}
                          >
                            <SelectTrigger className="form-select" data-testid="select-uf">
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                            <SelectContent>
                              {ufOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                    <FormItem className="col-span-1">
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <Layers className="w-3.5 h-3.5 text-accent" />
                          Cidade
                        </label>
                        <FormControl>
                          <Select 
                            onValueChange={(val) => field.onChange(parseInt(val))} 
                            value={field.value ? field.value.toString() : ""}
                            disabled={!selectedUf || selectedUf === 0}
                          >
                            <SelectTrigger className="form-select" data-testid="select-cidade">
                              <SelectValue placeholder={selectedUf && selectedUf > 0 ? "Selecione..." : "Selecione a UF primeiro..."} />
                            </SelectTrigger>
                            <SelectContent>
                              {cidadeOptions.map(opt => (
                                <SelectItem key={opt.value} value={opt.value.toString()}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                    <FormItem>
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
        </form>
      </Form>
    </Modal>
  );
}
