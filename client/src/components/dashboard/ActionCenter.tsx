import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Trash2,
  Filter,
  Loader2,
  Tag,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSelection, clearSelection } from "@/stores/selection";
import type { UserOption, MarkerType } from "@/types/acoes";
import {
  encaminhar,
  marcar,
  excluir,
  limparFiltros,
  fetchUsersOptions,
  getMarkerTypes,
} from "@/services/api/acoes";

interface ActionCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  onClearFilters?: () => void;
}

const markerColors: Record<MarkerType, string> = {
  urgente: "bg-red-500/20 text-red-400 border-red-500/30",
  pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  auditoria: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  followup: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function ActionCenterDrawer({
  isOpen,
  onClose,
  onRefresh,
  onClearFilters,
}: ActionCenterProps) {
  const { toast } = useToast();
  const selectedIds = useSelection();
  
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [obs, setObs] = useState("");
  const [activeMarkers, setActiveMarkers] = useState<Record<MarkerType, boolean>>({
    urgente: false,
    pendente: false,
    auditoria: false,
    followup: false,
  });
  
  const [isLoadingEncaminhar, setIsLoadingEncaminhar] = useState(false);
  const [isLoadingMarcar, setIsLoadingMarcar] = useState(false);
  const [isLoadingExcluir, setIsLoadingExcluir] = useState(false);
  const [isLoadingFiltros, setIsLoadingFiltros] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const markerTypes = getMarkerTypes();

  useEffect(() => {
    if (isOpen) {
      fetchUsersOptions().then((u) => setUsers(u.filter((user) => user.ativo)));
    }
  }, [isOpen]);

  const hasSelection = selectedIds.length > 0;

  const handleEncaminhar = async () => {
    if (!selectedUser || !hasSelection) return;
    
    setIsLoadingEncaminhar(true);
    try {
      const result = await encaminhar({
        ids_princ: selectedIds,
        id_user_destino: parseInt(selectedUser),
        obs: obs || undefined,
      });
      
      if (result.success) {
        toast({
          title: "Registros encaminhados",
          description: result.message,
        });
        clearSelection();
        setSelectedUser("");
        setObs("");
        onRefresh?.();
        onClose();
      } else {
        toast({
          title: "Erro ao encaminhar",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingEncaminhar(false);
    }
  };

  const handleMarcar = async (markerType: MarkerType, value: boolean) => {
    if (!hasSelection) return;
    
    setIsLoadingMarcar(true);
    try {
      const result = await marcar({
        ids_princ: selectedIds,
        marker_type: markerType,
        value,
      });
      
      if (result.success) {
        setActiveMarkers((prev) => ({ ...prev, [markerType]: value }));
        toast({
          title: value ? "Marcador aplicado" : "Marcador removido",
          description: result.message,
        });
        onRefresh?.();
      } else {
        toast({
          title: "Erro ao aplicar marcador",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingMarcar(false);
    }
  };

  const handleExcluir = async () => {
    if (!hasSelection) return;
    
    setIsLoadingExcluir(true);
    try {
      const result = await excluir({ ids_princ: selectedIds });
      
      if (result.success) {
        toast({
          title: "Registros excluídos",
          description: result.message,
        });
        clearSelection();
        setShowDeleteConfirm(false);
        onRefresh?.();
        onClose();
      } else {
        toast({
          title: "Erro ao excluir",
          description: result.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoadingExcluir(false);
    }
  };

  const handleLimparFiltros = async () => {
    setIsLoadingFiltros(true);
    try {
      const result = await limparFiltros();
      
      if (result.success) {
        toast({
          title: "Filtros limpos",
          description: "Todos os filtros foram removidos",
        });
        onClearFilters?.();
      }
    } finally {
      setIsLoadingFiltros(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent
          side="right"
          className="w-[400px] sm:max-w-[400px] bg-card/95 backdrop-blur-xl border-l border-white/10 p-0"
        >
          <SheetHeader className="p-6 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Central de Ações
              </SheetTitle>
              <Badge
                variant="outline"
                className={`${
                  hasSelection
                    ? "bg-primary/20 text-primary border-primary/30"
                    : "bg-muted/50 text-muted-foreground border-muted"
                }`}
              >
                {selectedIds.length} selecionado(s)
              </Badge>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Execute ações em lote nos registros selecionados
            </SheetDescription>
          </SheetHeader>

          <div className="p-6 space-y-6 h-[calc(100vh-120px)] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Send className="w-4 h-4 text-accent" />
                Encaminhar
              </div>
              
              <div className="space-y-3 pl-6">
                <Select
                  value={selectedUser}
                  onValueChange={setSelectedUser}
                  disabled={!hasSelection}
                >
                  <SelectTrigger
                    className="bg-card/50 border-white/15"
                    data-testid="select-encaminhar-destino"
                  >
                    <SelectValue placeholder="Selecione o destinatário..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.value} value={user.value.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{user.label}</span>
                          {user.papel && (
                            <Badge variant="outline" className="text-[10px]">
                              {user.papel}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Observação (opcional)"
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  className="bg-card/50 border-white/15 resize-none h-20"
                  disabled={!hasSelection}
                  data-testid="textarea-encaminhar-obs"
                />

                <Button
                  onClick={handleEncaminhar}
                  disabled={!hasSelection || !selectedUser || isLoadingEncaminhar}
                  className="w-full bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30"
                  data-testid="button-encaminhar"
                >
                  {isLoadingEncaminhar ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Encaminhar {hasSelection && `(${selectedIds.length})`}
                </Button>
              </div>
            </motion.div>

            <div className="border-t border-white/10" />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Tag className="w-4 h-4 text-primary" />
                Marcadores
              </div>
              
              <div className="space-y-2 pl-6">
                {markerTypes.map((marker) => (
                  <div
                    key={marker.type}
                    className="flex items-center justify-between py-2 px-3 rounded-md bg-card/30 border border-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={markerColors[marker.type]}
                      >
                        {marker.label}
                      </Badge>
                    </div>
                    <Switch
                      checked={activeMarkers[marker.type]}
                      onCheckedChange={(checked) => handleMarcar(marker.type, checked)}
                      disabled={!hasSelection || isLoadingMarcar}
                      data-testid={`switch-marker-${marker.type}`}
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="border-t border-white/10" />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Trash2 className="w-4 h-4 text-destructive" />
                Excluir
              </div>
              
              <div className="pl-6">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={!hasSelection}
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                  data-testid="button-excluir"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir selecionados {hasSelection && `(${selectedIds.length})`}
                </Button>
              </div>
            </motion.div>

            <div className="border-t border-white/10" />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="w-4 h-4 text-muted-foreground" />
                Filtros
              </div>
              
              <div className="pl-6">
                <Button
                  variant="outline"
                  onClick={handleLimparFiltros}
                  disabled={isLoadingFiltros}
                  className="w-full border-white/15 text-muted-foreground hover:bg-white/5"
                  data-testid="button-limpar-filtros"
                >
                  {isLoadingFiltros ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2" />
                  )}
                  Limpar todos os filtros
                </Button>
              </div>
            </motion.div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription>
              Você está prestes a excluir {selectedIds.length} registro(s).
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="border-white/20"
              data-testid="button-cancel-delete"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleExcluir}
              disabled={isLoadingExcluir}
              data-testid="button-confirm-delete"
            >
              {isLoadingExcluir ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
