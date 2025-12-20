import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal, ModalFormGrid, ModalFormField } from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Save, X } from "lucide-react";

const newRecordSchema = z.object({
  player: z.string().min(1, "Player é obrigatório"),
  segurado: z.string().min(1, "Segurado é obrigatório"),
  loc: z.number().min(1, "Loc é obrigatório"),
  guilty: z.string().optional(),
  guy: z.string().optional(),
  meta: z.string().optional(),
  inspecao: z.string().optional(),
  atividade: z.string().optional(),
});

type NewRecordFormData = z.infer<typeof newRecordSchema>;

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewRecordModal({ isOpen, onClose, onSuccess }: NewRecordModalProps) {
  const form = useForm<NewRecordFormData>({
    resolver: zodResolver(newRecordSchema),
    defaultValues: {
      player: "",
      segurado: "",
      loc: 1,
      guilty: "",
      guy: "",
      meta: "",
      inspecao: "",
      atividade: "",
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

  return (
    <Modal
      id="new-record-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Registro"
      subtitle="Adicione uma nova inspeção ao sistema"
      maxWidth="xl"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="gap-2"
            data-testid="button-cancel-new-record"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createMutation.isPending}
            className="gap-2 bg-gradient-to-r from-primary to-secondary border-0"
            data-testid="button-confirm-new-record"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {createMutation.isPending ? "Salvando..." : "Criar Registro"}
          </Button>
        </>
      }
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Form {...form}>
          <form className="space-y-4">
            <ModalFormGrid>
              <FormField
                control={form.control}
                name="player"
                render={({ field }) => (
                  <FormItem>
                    <ModalFormField label="Player" required>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="glass border-white/10" data-testid="select-player">
                            <SelectValue placeholder="Selecione o player" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aon">Aon</SelectItem>
                            <SelectItem value="Swiss Re">Swiss Re</SelectItem>
                            <SelectItem value="Howden">Howden</SelectItem>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Free Job">Free Job</SelectItem>
                            <SelectItem value="Marsh">Marsh</SelectItem>
                            <SelectItem value="Lockton">Lockton</SelectItem>
                            <SelectItem value="IRB">IRB</SelectItem>
                            <SelectItem value="Gallagher">Gallagher</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </ModalFormField>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="segurado"
                render={({ field }) => (
                  <FormItem>
                    <ModalFormField label="Segurado" required>
                      <FormControl>
                        <Input
                          placeholder="Nome do segurado"
                          className="glass border-white/10"
                          {...field}
                          data-testid="input-segurado"
                        />
                      </FormControl>
                    </ModalFormField>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loc"
                render={({ field }) => (
                  <FormItem>
                    <ModalFormField label="Loc" required>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          className="glass border-white/10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          data-testid="input-loc"
                        />
                      </FormControl>
                    </ModalFormField>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guilty"
                render={({ field }) => (
                  <FormItem>
                    <ModalFormField label="Guilty">
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="glass border-white/10" data-testid="select-guilty">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AAS">AAS</SelectItem>
                            <SelectItem value="HEA">HEA</SelectItem>
                            <SelectItem value="MVR">MVR</SelectItem>
                            <SelectItem value="ARR">ARR</SelectItem>
                            <SelectItem value="ALS">ALS</SelectItem>
                            <SelectItem value="RES">RES</SelectItem>
                            <SelectItem value="LVS">LVS</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </ModalFormField>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="guy"
                render={({ field }) => (
                  <FormItem>
                    <ModalFormField label="Guy">
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="glass border-white/10" data-testid="select-guy">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MVR">MVR</SelectItem>
                            <SelectItem value="AAS">AAS</SelectItem>
                            <SelectItem value="HEA">HEA</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </ModalFormField>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="meta"
                render={({ field }) => (
                  <FormItem>
                    <ModalFormField label="META">
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="glass border-white/10" data-testid="select-meta">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sim">Sim</SelectItem>
                            <SelectItem value="Não">Não</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </ModalFormField>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inspecao"
                render={({ field }) => (
                  <FormItem>
                    <ModalFormField label="Data Inspeção">
                      <FormControl>
                        <Input
                          type="date"
                          className="glass border-white/10"
                          {...field}
                          data-testid="input-inspecao"
                        />
                      </FormControl>
                    </ModalFormField>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="atividade"
                render={({ field }) => (
                  <FormItem>
                    <ModalFormField label="Atividade">
                      <FormControl>
                        <Input
                          placeholder="Ex: Mineradora, Biodiesel..."
                          className="glass border-white/10"
                          {...field}
                          data-testid="input-atividade"
                        />
                      </FormControl>
                    </ModalFormField>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </ModalFormGrid>
          </form>
        </Form>
      </motion.div>
    </Modal>
  );
}
