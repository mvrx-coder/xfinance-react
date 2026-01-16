/**
 * SettingsModal - Modal de Configurações (Backup + Histórico)
 * 
 * Abas:
 * - Backup: Gerenciamento de backups do banco de dados
 * - Histórico: Log de auditoria do registro selecionado
 * 
 * Acesso restrito a usuários admin.
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Modal } from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  History,
  Trash2,
  User,
  Edit3,
  PlusCircle,
  ArrowRight,
  FileX,
} from "lucide-react";
import { toast } from "sonner";
import { 
  fetchBackups, 
  createBackup, 
  restoreBackup,
  type BackupListResponse,
} from "@/services/api/backup";
import {
  fetchAuditHistory,
  fetchAuditStats,
  cleanupAudit,
  type AuditHistoryResponse,
  type AuditEntry,
} from "@/services/api/audit";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIdPrinc?: number | null;
  selectedSegurado?: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 },
};

// Ícones por tipo de operação
const operationIcons: Record<string, typeof Edit3> = {
  CREATE: PlusCircle,
  UPDATE: Edit3,
  DELETE: Trash2,
  ENCAMINHAR: ArrowRight,
};

const operationColors: Record<string, string> = {
  CREATE: "text-success",
  UPDATE: "text-primary",
  DELETE: "text-destructive",
  ENCAMINHAR: "text-warning",
};

const operationLabels: Record<string, string> = {
  CREATE: "Criação",
  UPDATE: "Alteração",
  DELETE: "Exclusão",
  ENCAMINHAR: "Encaminhamento",
};

// Mapeamento de campos do banco para títulos amigáveis do grid
const fieldLabels: Record<string, string> = {
  // Datas de workflow
  dt_inspecao: "Inspeção",
  dt_entregue: "Entregue",
  dt_acerto: "Acerto",
  dt_envio: "Cobrança",
  dt_pago: "Pgto",
  dt_denvio: "Env. Desp.",
  dt_dpago: "Pgto Desp.",
  dt_guy_pago: "Guy Pgto",
  dt_guy_dpago: "Guy Desp.",
  // Valores financeiros
  honorario: "Honorário",
  despesa: "Despesa",
  guy_honorario: "Guy Hon.",
  guy_despesa: "Guy Desp.",
  // Outros campos
  loc: "Locais",
  meta: "Meta",
  obs: "Observação",
  id_user_guilty: "Responsável",
  id_user_guy: "Inspetor",
  id_contr: "Contratante",
  id_segur: "Segurado",
  id_uf: "UF",
  id_cidade: "Cidade",
  id_ativi: "Atividade",
  atividade: "Atividade",
};

function getFieldLabel(campo: string): string {
  return fieldLabels[campo] || campo;
}

function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function SettingsModal({ 
  isOpen, 
  onClose, 
  selectedIdPrinc,
  selectedSegurado,
}: SettingsModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("backup");
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  // Invalidar cache quando modal abre ou registro muda
  useEffect(() => {
    if (isOpen && selectedIdPrinc) {
      queryClient.invalidateQueries({ queryKey: ["audit", selectedIdPrinc] });
    }
  }, [isOpen, selectedIdPrinc, queryClient]);

  // =========================================================================
  // QUERIES E MUTATIONS - BACKUP
  // =========================================================================

  const { 
    data: backupData, 
    isLoading: isLoadingBackups, 
    refetch: refetchBackups,
    isRefetching: isRefetchingBackups,
  } = useQuery<BackupListResponse>({
    queryKey: ["backups"],
    queryFn: fetchBackups,
    enabled: isOpen && activeTab === "backup",
    refetchOnWindowFocus: false,
  });

  const createBackupMutation = useMutation({
    mutationFn: createBackup,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Backup criado com sucesso!", {
          description: data.filename || data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["backups"] });
      } else {
        toast.error("Falha ao criar backup", { description: data.message });
      }
    },
    onError: (error) => {
      toast.error("Erro ao criar backup", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    },
  });

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
        toast.error("Falha ao restaurar backup", { description: data.message });
      }
    },
    onError: (error) => {
      toast.error("Erro ao restaurar backup", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    },
  });

  // =========================================================================
  // QUERIES E MUTATIONS - AUDITORIA
  // =========================================================================

  // Query só executa quando: modal aberto + aba histórico + tem id selecionado
  // staleTime: 0 garante que sempre busca dados frescos
  const { 
    data: auditData, 
    isLoading: isLoadingAudit,
    refetch: refetchAudit,
    isRefetching: isRefetchingAudit,
  } = useQuery<AuditHistoryResponse>({
    queryKey: ["audit", selectedIdPrinc],
    queryFn: () => fetchAuditHistory(selectedIdPrinc!),
    enabled: isOpen && activeTab === "historico" && !!selectedIdPrinc,
    refetchOnWindowFocus: false,
    staleTime: 0,  // Sempre busca dados frescos
    gcTime: 0,     // Não mantém cache
  });

  const cleanupMutation = useMutation({
    mutationFn: cleanupAudit,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Limpeza concluída", { description: data.message });
      }
    },
    onError: (error) => {
      toast.error("Erro ao limpar registros", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    },
  });

  // =========================================================================
  // HANDLERS - BACKUP
  // =========================================================================

  const handleCreateBackup = () => createBackupMutation.mutate();
  const handleRefreshBackups = () => refetchBackups();

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
      toast.error("Confirmação inválida", { description: "Digite 'CONFIRMAR' para prosseguir" });
      return;
    }
    restoreBackupMutation.mutate({
      filename: latestBackup.filename,
      confirmation: confirmationText,
    });
  };

  // =========================================================================
  // HANDLERS - HISTÓRICO
  // =========================================================================

  const handleRefreshAudit = () => refetchAudit();
  const handleCleanup = () => cleanupMutation.mutate();

  // =========================================================================
  // DADOS
  // =========================================================================

  const backups = backupData?.backups || [];
  const nasAccessible = backupData?.nas_accessible ?? false;
  const backupPath = backupData?.backup_path || "";
  const latestBackup = backups[0];
  const canRestore = nasAccessible && latestBackup && confirmationText === "CONFIRMAR";

  const auditEntries = auditData?.entries || [];

  return (
    <Modal
      id="settings-modal"
      isOpen={isOpen}
      onClose={onClose}
      title="Configurações"
      maxWidth="lg"
      footer={
        <Button variant="outline" onClick={onClose} data-testid="button-close-settings">
          <X className="w-4 h-4 mr-2" />
          Fechar
        </Button>
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="backup" className="gap-2">
            <Database className="w-4 h-4" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* ================================================================= */}
        {/* ABA BACKUP */}
        {/* ================================================================= */}
        <TabsContent value="backup" className="space-y-6">
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
                <><CheckCircle2 className="w-3 h-3 mr-1" />Conectado</>
              ) : (
                <><XCircle className="w-3 h-3 mr-1" />Inacessível</>
              )}
            </Badge>
          </motion.div>

          {/* Ações */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreateBackup}
              disabled={!nasAccessible || createBackupMutation.isPending}
              className="gap-2 bg-gradient-to-r from-[#8C1888] to-[#6A0DAD] border-0 text-white font-semibold"
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
              className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar Último
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRefreshBackups}
              disabled={isLoadingBackups || isRefetchingBackups}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetchingBackups ? "animate-spin" : ""}`} />
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
                  <p className="font-semibold text-destructive">ATENÇÃO: OPERAÇÃO IRREVERSÍVEL</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Todos os dados inseridos ou alterados após o backup serão <strong>PERDIDOS</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Backup a restaurar:</span>
                  <Badge variant="outline" className="font-mono">{latestBackup.filename}</Badge>
                  <span className="text-muted-foreground">({latestBackup.datetime})</span>
                </div>

                <div className="flex items-center gap-3">
                  <Input
                    type="text"
                    placeholder="Digite CONFIRMAR"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value.toUpperCase())}
                    className="max-w-[200px] bg-background/50 border-destructive/30 focus:border-destructive"
                  />
                  <Button
                    variant="destructive"
                    onClick={handleConfirmRestore}
                    disabled={!canRestore || restoreBackupMutation.isPending}
                    className="gap-2"
                  >
                    {restoreBackupMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Restaurar
                  </Button>
                  <Button variant="outline" onClick={handleCancelRestore} disabled={restoreBackupMutation.isPending}>
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
              <Badge variant="outline" className="text-xs">{backups.length} / 21 máx</Badge>
            </div>

            {isLoadingBackups ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : backups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileArchive className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">Nenhum backup encontrado</p>
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <div className="grid grid-cols-[1fr_150px_100px] gap-4 px-4 py-3 bg-white/5 border-b border-white/10">
                  <span className="text-sm font-semibold">Arquivo</span>
                  <span className="text-sm font-semibold">Data/Hora</span>
                  <span className="text-sm font-semibold text-right">Tamanho</span>
                </div>
                <ScrollArea className="max-h-[200px]">
                  <motion.div variants={containerVariants} initial="hidden" animate="visible">
                    {backups.map((backup, index) => (
                      <motion.div
                        key={backup.filename}
                        variants={itemVariants}
                        className={`grid grid-cols-[1fr_150px_100px] gap-4 px-4 py-3 ${
                          index !== backups.length - 1 ? "border-b border-white/5" : ""
                        } hover:bg-white/5 transition-colors`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <HardDrive className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm truncate">{backup.filename}</span>
                          {index === 0 && (
                            <Badge variant="outline" className="bg-success/20 text-success border-success/40 text-[10px] px-1.5">
                              Mais recente
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{backup.datetime}</span>
                        </div>
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
        </TabsContent>

        {/* ================================================================= */}
        {/* ABA HISTÓRICO */}
        {/* ================================================================= */}
        <TabsContent value="historico" className="space-y-4">
          {/* Mensagem se não houver registro selecionado */}
          {!selectedIdPrinc ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileX className="w-16 h-16 mb-4 opacity-40" />
              <p className="text-lg font-medium">Nenhum registro selecionado</p>
              <p className="text-sm mt-2 text-center max-w-md">
                Selecione um registro no grid principal antes de abrir esta tela para visualizar o histórico de alterações.
              </p>
            </div>
          ) : (
            <>
              {/* Header com info do registro */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Histórico do Registro</span>
                    <Badge variant="outline" className="font-mono">#{selectedIdPrinc}</Badge>
                  </div>
                  {selectedSegurado && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Segurado: {selectedSegurado}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshAudit}
                    disabled={isLoadingAudit || isRefetchingAudit}
                    className="gap-1.5 w-full justify-center"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefetchingAudit ? "animate-spin" : ""}`} />
                    Atualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCleanup}
                    disabled={cleanupMutation.isPending}
                    className="gap-1.5 w-full justify-center border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                  >
                    {cleanupMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Limpar Antigos
                  </Button>
                </div>
              </div>

              {/* Lista de operações */}
              {isLoadingAudit ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : auditEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">Nenhum histórico encontrado para este registro</p>
                  <p className="text-xs mt-1">
                    As operações serão registradas a partir de agora.
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[350px]">
                  <motion.div 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="visible"
                    className="space-y-2"
                  >
                    {auditEntries.map((entry) => {
                      const Icon = operationIcons[entry.operacao] || Edit3;
                      const color = operationColors[entry.operacao] || "text-muted-foreground";
                      const label = operationLabels[entry.operacao] || entry.operacao;

                      return (
                        <motion.div
                          key={entry.id_log}
                          variants={itemVariants}
                          className="p-3 rounded-lg bg-white/[0.02] border border-white/10 hover:bg-white/[0.04] transition-colors"
                        >
                          {/* Linha 1: Data + Operação + Campo */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${color}`} />
                              <Badge variant="outline" className={`${color} border-current/30 text-xs`}>
                                {label}
                              </Badge>
                              {entry.campo && (
                                <Badge variant="outline" className="text-xs bg-white/5">
                                  {getFieldLabel(entry.campo)}
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {formatDateTime(entry.dt_operacao)}
                            </span>
                          </div>

                          {/* Linha 2: Valores (anterior → novo) */}
                          {(entry.valor_anterior !== undefined || entry.valor_novo) && entry.operacao === "UPDATE" && (
                            <div className="flex items-center gap-2 text-xs mt-1 pl-6">
                              <span className="text-muted-foreground">
                                <span className="line-through">
                                  {entry.valor_anterior || "(vazio)"}
                                </span>
                              </span>
                              <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              <span className="text-foreground font-medium">
                                {entry.valor_novo || "(vazio)"}
                              </span>
                            </div>
                          )}
                          {/* Linha 2: Valores (para CREATE/DELETE/ENCAMINHAR) */}
                          {entry.valor_novo && entry.operacao !== "UPDATE" && (
                            <div className="flex items-center gap-2 text-xs mt-1 pl-6">
                              <span className="text-foreground font-medium">{entry.valor_novo}</span>
                            </div>
                          )}

                          {/* Linha 3: Usuário */}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 pl-6">
                            <User className="w-3 h-3" />
                            <span className="font-medium text-foreground/80">{entry.user_email}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </ScrollArea>
              )}

              {/* Info sobre retenção */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-400">Retenção de Histórico</p>
                  <p className="text-muted-foreground mt-0.5">
                    Os registros são mantidos por 14 meses. Use o botão "Limpar Antigos" para 
                    remover registros expirados manualmente.
                  </p>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </Modal>
  );
}
