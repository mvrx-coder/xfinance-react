/**
 * NewRecordModal - Modal de Inserir Novo Registro
 * 
 * Implementação limpa do zero, substituindo versão anterior.
 * 
 * Funcionalidades:
 * - Criar novo registro de inspeção
 * - Dropdowns com busca server-side para Segurado e Atividade
 * - Criação de novas entidades inline
 * - Modo multi-local (vários locais para mesmo registro)
 * - Confirmação antes de criar novas entidades
 * 
 * Campos hardcoded (sistema antigo):
 * - id_user_guilty = 19
 * - dt_acerto = 1º dia do mês corrente
 * - loc = 1
 */

import * as React from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Building2, 
  FileText, 
  Briefcase, 
  DollarSign,
  User, 
  Calendar,
  MapPin,
  Layers,
  Check, 
  X, 
  Loader2,
  ArrowRight,
  CalendarIcon,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Modal, ModalFormField } from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import {
  HeadlessCombobox,
  ServerSearchHeadlessCombobox,
} from "@/components/ui/headless-combobox";

import { useNewRecord } from "@/hooks/use-new-record";
import { useContratantes, useUfs, useCidades, useInspetores } from "@/hooks/use-lookups";

// =============================================================================
// TYPES
// =============================================================================

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

// =============================================================================
// COMPONENT
// =============================================================================

export function NewRecordModal({ isOpen, onClose, onSuccess }: NewRecordModalProps) {
  // State para controlar DatePicker
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  
  // Hook do formulário
  const {
    form,
    multiLocal,
    pendingCreation,
    isPending,
    selectedUf,
    variosLocais,
    onSubmit,
    onSubmitAndFinalize,
    confirmCreate,
    cancelCreate,
    handleVariosLocaisChange,
    resetForm,
  } = useNewRecord({
    onSuccess: () => {
      onSuccess?.();
      handleClose();
    },
  });
  
  // Lookups
  const { data: contratantes = [], isLoading: loadingContratantes } = useContratantes();
  const { data: ufs = [], isLoading: loadingUfs } = useUfs();
  const { data: cidades = [], isLoading: loadingCidades } = useCidades(selectedUf);
  const { data: inspetores = [], isLoading: loadingInspetores } = useInspetores();
  
  // Reset cidade quando UF muda
  useEffect(() => {
    if (selectedUf) {
      form.setValue("idCidade", 0);
    }
  }, [selectedUf, form]);
  
  // Handler para fechar modal
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  return (
    <Modal
      id="new-record-modal"
      isOpen={isOpen}
      onClose={handleClose}
      title={
        multiLocal.active
          ? `Adicionar Local - ${multiLocal.segurNome || "Registro"}`
          : "Inserir Novo Trabalho"
      }
      subtitle={
        multiLocal.active
          ? `Registro #${multiLocal.idPrinc} | Próximo local`
          : "Preencha os dados do novo registro"
      }
      maxWidth="6xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="gap-2 border-white/15 bg-transparent hover:bg-white/5"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          
          <div className="flex items-center gap-6">
            {/* Checkbox Meta */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="meta"
                defaultChecked
                className="border-white/20 data-[state=checked]:bg-success"
              />
              <label
                htmlFor="meta"
                className="text-sm cursor-pointer select-none text-muted-foreground"
              >
                Meta
              </label>
            </div>
            
            {/* Checkbox Vários Locais */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="varios-locais"
                checked={variosLocais || false}
                onCheckedChange={handleVariosLocaisChange}
                disabled={multiLocal.active}
                className="border-white/20 data-[state=checked]:bg-primary"
              />
              <label
                htmlFor="varios-locais"
                className={cn(
                  "text-sm cursor-pointer select-none",
                  multiLocal.active
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                Vários locais
              </label>
            </div>
            
            {/* Botão Último local - Finalizar (apenas no modo multi-local) */}
            {multiLocal.active && (
              <Button
                type="button"
                variant="outline"
                onClick={onSubmitAndFinalize}
                disabled={isPending}
                className="gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Último local - Finalizar
              </Button>
            )}
            
            {/* Botão Submit */}
            <Button
              onClick={onSubmit}
              disabled={isPending}
              className={cn(
                "gap-2 font-semibold px-6 min-w-[140px]",
                multiLocal.active
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  : "bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
              )}
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
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SEÇÃO 1: CAMPOS GLOBAIS (desabilitados no modo multi-local) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <motion.div
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            {/* LINHA 1: Player, Segurado, Unidade, Atividade */}
            <div 
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
            >
              {/* Player (Contratante) - 2 colunas */}
              <FormField
                control={form.control}
                name="idContr"
                render={({ field }) => (
                  <FormItem style={{ gridColumn: "span 2" }}>
                    <ModalFormField label="Player" required>
                      <FormControl>
                        <HeadlessCombobox
                          options={contratantes}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Buscar..."
                          disabled={multiLocal.active}
                          loading={loadingContratantes}
                          icon={<Building2 className="w-4 h-4 text-primary" />}
                        />
                      </FormControl>
                      <FormMessage />
                    </ModalFormField>
                  </FormItem>
                )}
              />
              
              {/* Segurado (Server Search) - 4 colunas */}
              <FormField
                control={form.control}
                name="idSegur"
                render={({ field }) => (
                  <FormItem style={{ gridColumn: "span 4" }}>
                    <ModalFormField label="Segurado" required>
                      <FormControl>
                        <ServerSearchHeadlessCombobox
                          searchEndpoint="/api/new-record/segurados"
                          value={field.value || null}
                          onChange={field.onChange}
                          placeholder="Digite para buscar..."
                          disabled={multiLocal.active}
                          icon={<FileText className="w-4 h-4 text-primary" />}
                        />
                      </FormControl>
                      <FormMessage />
                    </ModalFormField>
                  </FormItem>
                )}
              />
              
              {/* Unidade (texto) - 4 colunas (mesma largura do Segurado) */}
              {/* Permanece habilitado no modo multi-local - pode variar por local */}
              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem style={{ gridColumn: "span 4" }}>
                    <ModalFormField label="Unidade">
                      <FormControl>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                          <Input
                            type="text"
                            placeholder="Digite a unidade..."
                            className="pl-10"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value || null)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </ModalFormField>
                  </FormItem>
                )}
              />
              
              {/* Atividade (Server Search) - 4 colunas */}
              {/* Permanece habilitado no modo multi-local - pode variar por local */}
              <FormField
                control={form.control}
                name="idAtivi"
                render={({ field }) => (
                  <FormItem style={{ gridColumn: "span 4" }}>
                    <ModalFormField label="Atividade" required>
                      <FormControl>
                        <ServerSearchHeadlessCombobox
                          searchEndpoint="/api/new-record/atividades"
                          value={field.value || null}
                          onChange={field.onChange}
                          placeholder="Digite para buscar..."
                          icon={<Briefcase className="w-4 h-4 text-primary" />}
                        />
                      </FormControl>
                      <FormMessage />
                    </ModalFormField>
                  </FormItem>
                )}
              />
            </div>
          </motion.div>
          
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SEÇÃO 2: CAMPOS LOCAIS (sempre habilitados) */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <motion.div
            custom={1}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Banner multi-local */}
            {multiLocal.active && (
              <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-sm text-blue-300">
                  <strong>Adicionando local adicional</strong> — Preencha os dados 
                  do novo local e clique em "Próximo Local" ou desmarque 
                  "Vários locais" para finalizar.
                </p>
              </div>
            )}
            
            {/* LINHA 2: Guy, Data, Honorários, UF, Cidade */}
            <div 
              className="grid gap-4"
              style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}
            >
              {/* Inspetor (Guy) - 2 colunas */}
              <FormField
                control={form.control}
                name="idUserGuy"
                render={({ field }) => (
                  <FormItem style={{ gridColumn: "span 2" }}>
                    <ModalFormField label="Guy" required>
                      <FormControl>
                        <HeadlessCombobox
                          options={inspetores}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Buscar..."
                          loading={loadingInspetores}
                          icon={<User className="w-4 h-4 text-primary" />}
                        />
                      </FormControl>
                      <FormMessage />
                    </ModalFormField>
                  </FormItem>
                )}
              />
              
              {/* Data Inspeção - 2 colunas */}
              <FormField
                control={form.control}
                name="dtInspecao"
                render={({ field }) => (
                  <FormItem style={{ gridColumn: "span 2" }}>
                    <ModalFormField label="Data" required>
                      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-center text-center font-normal form-select",
                                !field.value && "text-muted-foreground"
                              )}
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
                            onSelect={(date) => {
                              field.onChange(date);
                              setDatePickerOpen(false);
                            }}
                            locale={ptBR}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </ModalFormField>
                  </FormItem>
                )}
              />
              
              {/* Honorários - 2 colunas */}
              <FormField
                control={form.control}
                name="honorario"
                render={({ field }) => (
                  <FormItem style={{ gridColumn: "span 2" }}>
                    <ModalFormField label="Honorários">
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                          <span className="absolute left-8 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            R$
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            className="pl-14 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            disabled={multiLocal.active}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || null)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </ModalFormField>
                  </FormItem>
                )}
              />
              
              {/* UF - 2 colunas */}
              <FormField
                control={form.control}
                name="idUf"
                render={({ field }) => (
                  <FormItem style={{ gridColumn: "span 2" }}>
                    <ModalFormField label="UF" required>
                      <FormControl>
                        <HeadlessCombobox
                          options={ufs}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Digite UF..."
                          loading={loadingUfs}
                          icon={<MapPin className="w-4 h-4 text-accent" />}
                        />
                      </FormControl>
                      <FormMessage />
                    </ModalFormField>
                  </FormItem>
                )}
              />
              
              {/* Cidade - 6 colunas */}
              <FormField
                control={form.control}
                name="idCidade"
                render={({ field }) => (
                  <FormItem style={{ gridColumn: "span 6" }}>
                    <ModalFormField label="Cidade" required>
                      <FormControl>
                        <HeadlessCombobox
                          options={cidades}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={
                            selectedUf && selectedUf > 0 
                              ? "Digite cidade..." 
                              : "Selecione UF primeiro"
                          }
                          disabled={!selectedUf || selectedUf === 0}
                          loading={loadingCidades}
                          icon={<Layers className="w-4 h-4 text-accent" />}
                        />
                      </FormControl>
                      <FormMessage />
                    </ModalFormField>
                  </FormItem>
                )}
              />
            </div>
          </motion.div>
        </form>
      </Form>
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DIALOG DE CONFIRMAÇÃO DE CRIAÇÃO DE NOVAS ENTIDADES */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={pendingCreation !== null} onOpenChange={(open) => !open && cancelCreate()}>
        <AlertDialogContent className="bg-card border-white/15">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold">
              Confirmar criação de novos registros
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              <p>Você está prestes a criar registros que não existem no sistema:</p>
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
              onClick={cancelCreate}
              className="border-white/15 bg-transparent hover:bg-white/5"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCreate}
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
