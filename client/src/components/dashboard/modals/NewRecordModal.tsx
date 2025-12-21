import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Layers
} from "lucide-react";

const newRecordSchema = z.object({
  player: z.string().min(1, "Player obrigatório"),
  segurado: z.string().min(1, "Segurado obrigatório"),
  atividade: z.string().min(1, "Atividade obrigatória"),
  guy: z.string().min(1, "Inspetor obrigatório"),
  inspecao: z.string().optional(),
  uf: z.string().min(1, "UF obrigatória"),
  cidade: z.string().optional(),
  honorario: z.number().min(0).optional(),
  variosLocais: z.boolean().optional(),
});

type NewRecordFormData = z.infer<typeof newRecordSchema>;

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const players = [
  "Aon", "Swiss Re", "Howden", "Inter", "Free Job", "Marsh", "Lockton", "IRB", "Gallagher"
];

const inspetores = [
  { value: "MVR", label: "MVR" },
  { value: "AAS", label: "AAS" },
  { value: "HEA", label: "HEA" },
  { value: "RES", label: "RES" },
  { value: "ALS", label: "ALS" },
  { value: "LVS", label: "LVS" },
];

const atividades = [
  "Mineradora", "Biodiesel", "Usina", "Armazém", "Porto", "Terminal", "Indústria", "Comercial"
];

const ufs = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", 
  "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"
];

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

  const form = useForm<NewRecordFormData>({
    resolver: zodResolver(newRecordSchema),
    defaultValues: {
      player: "",
      segurado: "",
      atividade: "",
      guy: "",
      inspecao: "",
      uf: "",
      cidade: "",
      honorario: 0,
      variosLocais: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: NewRecordFormData) => {
      return apiRequest("POST", "/api/inspections", data);
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

  const selectedUf = form.watch("uf");

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
                  name="player"
                  render={({ field }) => (
                    <FormItem>
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          Player <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="form-select" data-testid="select-player">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {players.map(p => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
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
                  name="segurado"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          Segurado <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <Input
                            placeholder="Digite ou selecione..."
                            className="form-input"
                            {...field}
                            data-testid="input-segurado"
                          />
                        </FormControl>
                        <FormMessage className="form-error" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="atividade"
                  render={({ field }) => (
                    <FormItem>
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <Briefcase className="w-3.5 h-3.5 text-primary" />
                          Atividade <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="form-select" data-testid="select-atividade">
                              <SelectValue placeholder="Digite ou selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {atividades.map(a => (
                                <SelectItem key={a} value={a}>{a}</SelectItem>
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
                  name="guy"
                  render={({ field }) => (
                    <FormItem>
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <User className="w-3.5 h-3.5 text-primary" />
                          Inspetor (Guy) <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="form-select" data-testid="select-guy">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              {inspetores.map(i => (
                                <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
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
                  name="inspecao"
                  render={({ field }) => (
                    <FormItem>
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          Inspeção <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="form-select" data-testid="select-inspecao">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prev">Prévia</SelectItem>
                              <SelectItem value="risk">Risk</SelectItem>
                              <SelectItem value="loss">Loss</SelectItem>
                              <SelectItem value="rec">Recuperação</SelectItem>
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
                  name="uf"
                  render={({ field }) => (
                    <FormItem>
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          UF <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="form-select" data-testid="select-uf">
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                            <SelectContent>
                              {ufs.map(uf => (
                                <SelectItem key={uf} value={uf}>{uf}</SelectItem>
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
                  name="cidade"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <div className="form-field-wrapper">
                        <label className="form-label">
                          <Layers className="w-3.5 h-3.5 text-accent" />
                          Cidade <span className="text-destructive">*</span>
                        </label>
                        <FormControl>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            disabled={!selectedUf}
                          >
                            <SelectTrigger className="form-select" data-testid="select-cidade">
                              <SelectValue placeholder={selectedUf ? "Selecione..." : "Selecione a UF primeiro..."} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cidade1">Cidade 1</SelectItem>
                              <SelectItem value="cidade2">Cidade 2</SelectItem>
                              <SelectItem value="cidade3">Cidade 3</SelectItem>
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
