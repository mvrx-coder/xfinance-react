/**
 * BackupModal - Modal de Gerenciamento de Backups
 * 
 * Exibe lista de backups disponíveis no NAS e permite backup manual.
 * Também permite restaurar o último backup (com confirmação).
 * Acesso restrito a usuários admin.
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  RefreshCw, 
  Download,
  Clock,
  HardDrive,
  Server,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Calendar,
  FileArchive,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { 
  fetchBackups, 
  createBackup, 
  restoreBackup,
  type BackupListResponse,
} from "@/services/api/backup";

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 },
};

export function BackupModal({ isOpen, onClose }: BackupModalProps) {
  const queryClient = useQueryClient();
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  // Query para listar backups
  const { 
    data: backupData, 
    isLoading, 
    refetch,
    isRefetching,
  } = useQuery<BackupListResponse>({
    queryKey: ["backups"],
    queryFn: fetchBackups,
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  // Mutation para criar backup manual
  const createBackupMutation = useMutation({
    mutationFn: createBackup,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Backup criado com sucesso!", {
          description: data.filename || data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["backups"] });
      } else {
        toast.error("Falha ao criar backup", {
          description: data.message,
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao criar backup", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    },
  });

  // Mutation para restaurar backup
  const restoreBackupMutation = useMutation({
    mutationFn: ({ filename, confirmation }: { filename: string; confirmation: string }) =>
      restoreBackup(filename, confirmation),
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Backup restaurado com sucesso!", {
          description: data.message,
          duration: 10000,
        });
        setShowRestoreConfirm(false);
        setConfirmationText("");
        queryClient.invalidateQueries({ queryKey: ["backups"] });
      } else {
        toast.error("Falha ao restaurar backup", {
          description: data.message,
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao restaurar backup", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    },
  });

  const handleCreateBackup = () => {
    createBackupMutation.mutate();
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleOpenRestoreConfirm = () => {
    setShowRestoreConfirm(true);
    setConfirmationText("");
  };

  const handleCancelRestore = () => {
    setShowRestoreConfirm(false);
    setConfirmationText("");
  };

  const handleConfirmRestore = () => {
    const latestBackup = backups[0];
    if (!latestBackup) {
      toast.error("Nenhum backup disponível para restaurar");
      return;
    }

    if (confirmationText !== "CONFIRMAR") {
      toast.error("Confirmação inválida", {
        description: "Digite 'CONFIRMAR' para prosseguir",
      });
      return;
    }

    restoreBackupMutation.mutate({
      filename: latestBackup.filename,
      confirmation: confirmationText,
    });
  };

  const backups = backupData?.backups || [];
  const nasAccessible = backupData?.nas_accessible ?? false;
  const backupPath = backupData?.backup_path || "";
  const latestBackup = backups[0];
  const canRestore = nasAccessible && latestBackup && confirmationText === "CONFIRMAR";

  return (
    <Modal
      id="backup-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Backup do Banco de Dados"
      maxWidth="lg"
      footer={
        <Button variant="outline" onClick={onClose} data-testid="button-close-backup">
          <X className="w-4 h-4 mr-2" />
          Fechar
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Status do NAS */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Status do NAS</p>
              <p className="text-xs text-muted-foreground truncate max-w-[300px]" title={backupPath}>
                {backupPath || "Carregando..."}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={nasAccessible 
              ? "bg-success/20 text-success border-success/40" 
              : "bg-destructive/20 text-destructive border-destructive/40"
            }
          >
            {nasAccessible ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Conectado
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Inacessível
              </>
            )}
          </Badge>
        </motion.div>

        {/* Ações */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleCreateBackup}
            disabled={!nasAccessible || createBackupMutation.isPending}
            className="gap-2 bg-gradient-to-r from-[#8C1888] to-[#6A0DAD] border-0 text-white font-semibold"
            data-testid="button-create-backup"
          >
            {createBackupMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Criar Backup Agora
          </Button>

          <Button
            variant="outline"
            onClick={handleOpenRestoreConfirm}
            disabled={!nasAccessible || !latestBackup || showRestoreConfirm}
            className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
            data-testid="button-restore-backup"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar Último
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
            className="gap-2"
            data-testid="button-refresh-backups"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Painel de confirmação de restauração */}
        {showRestoreConfirm && latestBackup && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/40"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
              <div>
                <p className="font-semibold text-destructive">⚠️ ATENÇÃO: OPERAÇÃO IRREVERSÍVEL</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Todos os dados inseridos ou alterados após o backup serão <strong>PERDIDOS</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Backup a restaurar:</span>
                <Badge variant="outline" className="font-mono">
                  {latestBackup.filename}
                </Badge>
                <span className="text-muted-foreground">({latestBackup.datetime})</span>
              </div>

              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="Digite CONFIRMAR"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                  className="max-w-[200px] bg-background/50 border-destructive/30 focus:border-destructive"
                  data-testid="input-restore-confirm"
                />
                <Button
                  variant="destructive"
                  onClick={handleConfirmRestore}
                  disabled={!canRestore || restoreBackupMutation.isPending}
                  className="gap-2"
                  data-testid="button-confirm-restore"
                >
                  {restoreBackupMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  Restaurar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelRestore}
                  disabled={restoreBackupMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Lista de Backups */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary">
              <Database className="w-4 h-4" />
              <span className="text-sm font-semibold">Backups Disponíveis</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {backups.length} / 21 máx
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : backups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileArchive className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">Nenhum backup encontrado</p>
              <p className="text-xs mt-1">Crie o primeiro backup usando o botão acima</p>
            </div>
          ) : (
            <div className="rounded-lg border border-white/10 overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[1fr_150px_100px] gap-4 px-4 py-3 bg-white/5 border-b border-white/10">
                <span className="text-sm font-semibold text-foreground">Arquivo</span>
                <span className="text-sm font-semibold text-foreground">Data/Hora</span>
                <span className="text-sm font-semibold text-foreground text-right">Tamanho</span>
              </div>

              {/* Lista */}
              <ScrollArea className="max-h-[250px]">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {backups.map((backup, index) => (
                    <motion.div
                      key={backup.filename}
                      variants={itemVariants}
                      className={`grid grid-cols-[1fr_150px_100px] gap-4 px-4 py-3 ${
                        index !== backups.length - 1 ? "border-b border-white/5" : ""
                      } hover:bg-white/5 transition-colors`}
                      data-testid={`backup-row-${index}`}
                    >
                      {/* Nome do arquivo */}
                      <div className="flex items-center gap-2 min-w-0">
                        <HardDrive className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground truncate" title={backup.filename}>
                          {backup.filename}
                        </span>
                        {index === 0 && (
                          <Badge 
                            variant="outline" 
                            className="bg-success/20 text-success border-success/40 text-[10px] px-1.5 flex-shrink-0"
                          >
                            Mais recente
                          </Badge>
                        )}
                      </div>

                      {/* Data/Hora */}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {backup.datetime}
                        </span>
                      </div>

                      {/* Tamanho */}
                      <span className="text-sm text-muted-foreground text-right tabular-nums">
                        {backup.size_mb.toFixed(2)} MB
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Info do agendamento */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-400">Backup Automático</p>
            <p className="text-muted-foreground mt-0.5">
              Backups são criados automaticamente a cada 2 horas, entre 07:00 e 19:00, 
              de segunda a sexta-feira. São mantidos os últimos 21 backups.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
