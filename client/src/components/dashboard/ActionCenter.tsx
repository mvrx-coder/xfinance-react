import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  AlertTriangle,
  MapPin,
  Sparkles,
  Trash2,
  Filter,
  X,
  Loader2,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Inspection } from "@shared/schema";
import type { MarkerType, UserOption } from "@/types/acoes";
import { 
  excluir, 
  encaminhar, 
  marcar, 
  limparFiltros,
  fetchUsersOptions,
  getMarkerTypes,
  getMarkerLevels
} from "@/services/api/acoes";
import { getLabelById, type LookupOption } from "@/services/api/lookups";

interface ActionCenterProps {
  inspection: Inspection | null;
  isOpen: boolean;
  onClose: () => void;
  onClearFilters?: () => void;
  onRefresh?: () => void;
  userRole?: string;
  contrLookup: LookupOption[];
  segurLookup: LookupOption[];
}

const colorClasses: Record<string, string> = {
  red: "border-red-500 text-red-400 shadow-red-500/20 hover:shadow-red-500/40 hover:bg-red-500/10",
  orange: "border-orange-500 text-orange-400 shadow-orange-500/20 hover:shadow-orange-500/40 hover:bg-orange-500/10",
  yellow: "border-yellow-500 text-yellow-400 shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:bg-yellow-500/10",
  green: "border-green-500 text-green-400 shadow-green-500/20 hover:shadow-green-500/40 hover:bg-green-500/10",
  blue: "border-blue-500 text-blue-400 shadow-blue-500/20 hover:shadow-blue-500/40 hover:bg-blue-500/10",
  purple: "border-purple-500 text-purple-400 shadow-purple-500/20 hover:shadow-purple-500/40 hover:bg-purple-500/10",
};

export function ActionCenter({ 
  inspection, 
  isOpen, 
  onClose,
  onClearFilters,
  onRefresh,
  userRole,
  contrLookup,
  segurLookup,
}: ActionCenterProps) {
  const { toast } = useToast();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [observacao, setObservacao] = useState("");
  const [markers, setMarkers] = useState<Record<MarkerType, number>>({
    state_loc: 0,
    state_dt_envio: 0,
    state_dt_denvio: 0,
    state_dt_pago: 0,
  });
  const [showClearFiltersConfirm, setShowClearFiltersConfirm] = useState(false);
  const canDelete = userRole === "admin";
  const canForward = userRole === "admin" || userRole === "BackOffice";
  const canMark = canForward;

  useEffect(() => {
    if (isOpen) {
      fetchUsersOptions().then(setUsers);
    }
  }, [isOpen]);

  if (!inspection) return null;

  const idPrinc = inspection.idPrinc;

  const handleExcluir = async () => {
    if (!idPrinc) return;
    setIsLoading(true);
    try {
      const result = await excluir({ ids_princ: [idPrinc] });
      if (result.success) {
        toast({
          title: "Inspeção excluída",
          description: result.message || "Registro removido com sucesso",
        });
        onRefresh?.();
        onClose();
      } else {
        toast({
          title: "Erro",
          description: result.message || "Falha ao excluir",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setActivePanel(null);
    }
  };

  const handleEncaminhar = async () => {
    if (!idPrinc || !selectedUser) return;
    setIsLoading(true);
    try {
      const result = await encaminhar({ 
        ids_princ: [idPrinc], 
        id_user_destino: parseInt(selectedUser),
        obs: observacao || undefined
      });
      if (result.success) {
        toast({
          title: "Inspeção encaminhada",
          description: result.message || "Registro encaminhado com sucesso",
        });
        setActivePanel(null);
        setSelectedUser("");
        setObservacao("");
        onRefresh?.();
      } else {
        toast({
          title: "Erro",
          description: result.message || "Falha ao encaminhar",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarcar = async (markerType: MarkerType, level: number) => {
    if (!idPrinc) return;
    setMarkers(prev => ({ ...prev, [markerType]: level }));
    try {
      const result = await marcar({ 
        ids_princ: [idPrinc], 
        marker_type: markerType,
        value: level
      });
      if (result.success) {
        toast({
          title: level > 0 ? "Marcador aplicado" : "Marcador removido",
          description: result.message,
        });
        onRefresh?.();
      }
    } catch {
      setMarkers(prev => ({ ...prev, [markerType]: prev[markerType] }));
    }
  };

  const handleLimparFiltros = async () => {
    setIsLoading(true);
    try {
      await limparFiltros();
      onClearFilters?.();
      toast({
        title: "Filtros limpos",
        description: "Todos os filtros foram removidos",
      });
      setShowClearFiltersConfirm(false);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const markerTypes = getMarkerTypes();
  const markerLevels = getMarkerLevels();

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent 
          side="right" 
          className="w-[360px] sm:w-[400px] bg-[rgba(10,10,31,0.95)] backdrop-blur-2xl border-l border-primary/20 p-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          
          <SheetHeader className="relative p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Central de Ações
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                  {getLabelById(contrLookup, inspection.idContr)} - Loc {inspection.loc?.toString().padStart(2, '0')}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="relative p-6 flex flex-col gap-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
              >
                <Button
                  className={`w-full justify-start gap-3 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl ${colorClasses.red} ${activePanel === 'excluir' ? 'bg-red-500/20' : ''}`}
                  variant="outline"
                  disabled={!canDelete}
                  onClick={() => setActivePanel(activePanel === 'excluir' ? null : 'excluir')}
                  data-testid="action-delete-inspection"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Excluir inspeção</span>
                </Button>
                <AnimatePresence>
                  {activePanel === 'excluir' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 rounded-xl bg-slate-900/80 border border-red-500/30 space-y-3"
                    >
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">{getLabelById(contrLookup, inspection.idContr)}</strong> - {getLabelById(segurLookup, inspection.idSegur)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Loc {inspection.loc?.toString().padStart(2, '0')} | ID-{inspection.idPrinc}
                        </p>
                      </div>
                      <p className="text-sm text-red-400">
                        Tem certeza? Esta ação não pode ser desfeita.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setActivePanel(null)}
                          className="flex-1 border-white/20"
                          data-testid="button-cancel-delete"
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleExcluir}
                          disabled={isLoading}
                          className="flex-1 border-red-500 text-red-400 bg-red-500/10"
                          data-testid="button-confirm-delete"
                        >
                          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                          Excluir
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Button
                  className={`w-full justify-start gap-3 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl ${colorClasses.orange} ${activePanel === 'encaminhar' ? 'bg-orange-500/20' : ''}`}
                  variant="outline"
                  disabled={!canForward}
                  onClick={() => setActivePanel(activePanel === 'encaminhar' ? null : 'encaminhar')}
                  data-testid="action-forward-inspection"
                >
                  <Send className="w-4 h-4" />
                  <span className="font-medium">Encaminhar inspeção</span>
                </Button>
                <AnimatePresence>
                  {activePanel === 'encaminhar' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 rounded-xl bg-slate-900/80 border border-orange-500/30 space-y-3"
                    >
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Encaminhar para:</label>
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                          <SelectTrigger className="bg-slate-800/50 border-white/10" data-testid="select-user-destino">
                            <SelectValue placeholder="Selecione o inspetor..." />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.value} value={user.value.toString()}>
                                {user.label} {user.papel && `(${user.papel})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Observação (opcional):</label>
                        <Textarea 
                          value={observacao}
                          onChange={(e) => setObservacao(e.target.value)}
                          placeholder="Digite uma observação..."
                          className="bg-slate-800/50 border-white/10 resize-none"
                          rows={2}
                          data-testid="textarea-obs-encaminhar"
                        />
                      </div>
                      <Button
                        className="w-full gap-2 bg-orange-500/20 border-orange-500 text-orange-400"
                        variant="outline"
                        disabled={!selectedUser || isLoading}
                        onClick={handleEncaminhar}
                        data-testid="button-confirm-encaminhar"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Confirmar Encaminhamento
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  className={`w-full justify-start gap-3 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl ${colorClasses.yellow} ${activePanel === 'marcadores' ? 'bg-yellow-500/20' : ''}`}
                  variant="outline"
                  disabled={!canMark}
                  onClick={() => setActivePanel(activePanel === 'marcadores' ? null : 'marcadores')}
                  data-testid="action-alert-marker"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Marcador de alerta</span>
                </Button>
                <AnimatePresence>
                  {activePanel === 'marcadores' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-4 rounded-xl bg-slate-900/80 border border-yellow-500/30 space-y-3"
                    >
                      {markerTypes.map(marker => (
                        <div key={marker.type} className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-yellow-400">
                            {marker.label}
                          </span>
                          <Select
                            value={String(markers[marker.type])}
                            onValueChange={(val) => handleMarcar(marker.type, parseInt(val, 10))}
                          >
                            <SelectTrigger className="w-[160px] bg-slate-800/50 border-white/10" data-testid={`select-marker-${marker.type}`}>
                              <SelectValue placeholder="Selecione nível" />
                            </SelectTrigger>
                            <SelectContent>
                              {markerLevels.map(opt => (
                                <SelectItem key={opt.level} value={String(opt.level)}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Button
                  className={`w-full justify-start gap-3 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl ${colorClasses.green}`}
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "Demais locais",
                      description: (inspection.loc && inspection.loc > 1) ? "Esta inspeção possui vários locais" : "Esta inspeção possui um único local",
                    });
                  }}
                  data-testid="action-view-locations"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Visualizar demais locais</span>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  className={`w-full justify-start gap-3 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl ${colorClasses.blue}`}
                  variant="outline"
                  onClick={() => setShowClearFiltersConfirm(true)}
                  data-testid="action-clear-filters"
                >
                  <Filter className="w-4 h-4" />
                  <span className="font-medium">Limpar Filtros (Global)</span>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Button
                  className={`w-full justify-start gap-3 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl ${colorClasses.purple}`}
                  variant="outline"
                  disabled
                  data-testid="action-coming-soon"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">Em breve</span>
                </Button>
              </motion.div>
              
              <div className="border-t border-white/10 pt-4 mt-3">
                <Button
                  className="w-full justify-center gap-2 rounded-xl border border-white/20 bg-white/5 text-muted-foreground hover:bg-white/10 transition-all duration-300"
                  variant="outline"
                  onClick={onClose}
                  data-testid="action-cancel"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <Dialog open={showClearFiltersConfirm} onOpenChange={setShowClearFiltersConfirm}>
        <DialogContent className="bg-[rgba(10,10,31,0.98)] border-blue-500/30 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-blue-400 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Limpar Filtros
            </DialogTitle>
            <DialogDescription>
              Deseja limpar todos os filtros aplicados no grid?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowClearFiltersConfirm(false)}
              className="border-white/20"
              data-testid="button-cancel-clear-filters"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={handleLimparFiltros}
              disabled={isLoading}
              className="border-blue-500 text-blue-400 bg-blue-500/10"
              data-testid="button-confirm-clear-filters"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
