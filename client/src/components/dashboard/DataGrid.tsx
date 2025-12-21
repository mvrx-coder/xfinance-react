import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSpreadsheet,
  Eye,
  Edit3,
  Send,
  AlertTriangle,
  MapPin,
  Sparkles,
  Trash2,
  Filter,
  X,
  Briefcase,
  Clock,
  Wallet,
  Receipt,
  CreditCard,
  FileText,
  Loader2,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Inspection, FilterState } from "@shared/schema";
import type { MarkerType, UserOption } from "@/types/acoes";
import { 
  excluir, 
  encaminhar, 
  marcar, 
  limparFiltros,
  fetchUsersOptions,
  getMarkerTypes 
} from "@/services/api/acoes";

interface DataGridProps {
  data: Inspection[];
  filters: FilterState;
  isLoading?: boolean;
  onRowClick?: (inspection: Inspection) => void;
  onRefresh?: () => void;
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  return dateStr;
}

function getStatusColor(status: string | null | undefined): string {
  if (!status) return "bg-muted/50 text-muted-foreground border-muted";
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "sim" || lowerStatus === "ok" || lowerStatus === "pago")
    return "bg-success/15 text-success border-success/30";
  if (lowerStatus === "não" || lowerStatus === "nao" || lowerStatus === "pendente")
    return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-warning/15 text-warning border-warning/30";
}

function getStatusGradient(status: string | null | undefined): string {
  if (!status) return "from-muted/20 to-transparent";
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === "sim" || lowerStatus === "ok" || lowerStatus === "pago")
    return "from-success/10 to-transparent";
  if (lowerStatus === "não" || lowerStatus === "nao" || lowerStatus === "pendente")
    return "from-destructive/10 to-transparent";
  return "from-warning/10 to-transparent";
}

function SkeletonRow({ filters }: { filters: FilterState }) {
  return (
    <TableRow className="border-b border-white/5">
      {/* Grupo 1: Ação */}
      <TableCell className="leading-tight">
        <div className="h-4 w-6 shimmer rounded-md" />
      </TableCell>
      {/* Separador */}
      <TableCell className="w-[1px] p-0"><div className="w-[1px] h-full bg-primary/30" /></TableCell>
      {/* Grupo 2: Identificação */}
      <TableCell className="leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
      <TableCell className="leading-tight"><div className="h-3 w-28 shimmer rounded-md" /></TableCell>
      <TableCell className="leading-tight"><div className="h-3 w-6 shimmer rounded-md" /></TableCell>
      <TableCell className="leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
      <TableCell className="leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
      <TableCell className="leading-tight"><div className="h-4 w-10 shimmer rounded-md" /></TableCell>
      {/* Separador */}
      <TableCell className="w-[1px] p-0"><div className="w-[1px] h-full bg-muted-foreground/30" /></TableCell>
      {/* Grupo 3: Workflow */}
      {filters.columnGroups.workflow && (
        <>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-8 shimmer rounded-md" /></TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] p-0"><div className="w-[1px] h-full bg-accent/30" /></TableCell>
        </>
      )}
      {/* Grupo 4 e 5: Recebíveis */}
      {filters.columnGroups.recebiveis && (
        <>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] p-0"><div className="w-[1px] h-full bg-success/30" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] p-0"><div className="w-[1px] h-full bg-emerald-400/30" /></TableCell>
        </>
      )}
      {/* Grupo 6: Pagamentos */}
      {filters.columnGroups.pagamentos && (
        <>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-14 shimmer rounded-md" /></TableCell>
          <TableCell className="leading-tight"><div className="h-3 w-16 shimmer rounded-md" /></TableCell>
          {/* Separador */}
          <TableCell className="w-[1px] p-0"><div className="w-[1px] h-full bg-warning/30" /></TableCell>
        </>
      )}
      {/* Grupo 7: Contexto */}
      <TableCell className="leading-tight"><div className="h-3 w-20 shimmer rounded-md" /></TableCell>
      <TableCell className="leading-tight"><div className="h-3 w-12 shimmer rounded-md" /></TableCell>
    </TableRow>
  );
}

function ActionCenter({ 
  inspection, 
  isOpen, 
  onClose,
  onClearFilters,
  onRefresh,
}: { 
  inspection: Inspection | null; 
  isOpen: boolean; 
  onClose: () => void;
  onClearFilters?: () => void;
  onRefresh?: () => void;
}) {
  const { toast } = useToast();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [observacao, setObservacao] = useState("");
  const [markers, setMarkers] = useState<Record<MarkerType, boolean>>({
    urgente: false,
    pendente: false,
    auditoria: false,
    followup: false,
  });
  const [showClearFiltersConfirm, setShowClearFiltersConfirm] = useState(false);

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

  const handleMarcar = async (markerType: MarkerType, value: boolean) => {
    if (!idPrinc) return;
    setMarkers(prev => ({ ...prev, [markerType]: value }));
    try {
      const result = await marcar({ 
        ids_princ: [idPrinc], 
        marker_type: markerType,
        value 
      });
      if (result.success) {
        toast({
          title: value ? "Marcador aplicado" : "Marcador removido",
          description: result.message,
        });
      }
    } catch {
      setMarkers(prev => ({ ...prev, [markerType]: !value }));
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

  const colorClasses: Record<string, string> = {
    red: "border-red-500 text-red-400 shadow-red-500/20 hover:shadow-red-500/40 hover:bg-red-500/10",
    orange: "border-orange-500 text-orange-400 shadow-orange-500/20 hover:shadow-orange-500/40 hover:bg-orange-500/10",
    yellow: "border-yellow-500 text-yellow-400 shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:bg-yellow-500/10",
    green: "border-green-500 text-green-400 shadow-green-500/20 hover:shadow-green-500/40 hover:bg-green-500/10",
    blue: "border-blue-500 text-blue-400 shadow-blue-500/20 hover:shadow-blue-500/40 hover:bg-blue-500/10",
    purple: "border-purple-500 text-purple-400 shadow-purple-500/20 hover:shadow-purple-500/40 hover:bg-purple-500/10",
  };

  const markerTypes = getMarkerTypes();

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
                  {inspection.player} - Loc {inspection.loc?.toString().padStart(2, '0')}
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
                          <strong className="text-foreground">{inspection.player}</strong> - {inspection.segurado}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Loc {inspection.loc?.toString().padStart(2, '0')} | {inspection.uf || 'N/A'}
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
                        <div key={marker.type} className="flex items-center justify-between">
                          <span className={`text-sm font-medium text-${marker.color}-400`}>
                            {marker.label}
                          </span>
                          <Switch
                            checked={markers[marker.type]}
                            onCheckedChange={(checked) => handleMarcar(marker.type, checked)}
                            data-testid={`switch-marker-${marker.type}`}
                          />
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

export function DataGrid({
  data,
  filters,
  isLoading = false,
  onRowClick,
  onRefresh,
}: DataGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
  const rowsPerPage = 50;

  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex-1 mx-3 mb-3"
    >
      <Card className="h-full glass-card border-white/10 shadow-2xl overflow-hidden">
        {/* Grid Content - Headers stick on scroll */}
        <CardContent className="p-0 flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <Table>
              <TableHeader className="sticky top-0 z-50 bg-card backdrop-blur-xl">
                <TableRow className="border-b border-white/10">
                  {/* Grupo 1: Ação */}
                  <TableHead className="w-[50px] bg-card relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-b-sm" />
                    <span className="text-xs font-bold text-primary tracking-wider">#</span>
                  </TableHead>
                  
                  {/* Separador */}
                  <TableHead className="w-[1px] p-0 bg-card">
                    <div className="w-[1px] h-full bg-primary/40" />
                  </TableHead>
                  
                  {/* Grupo 2: Identificação */}
                  <TableHead className="bg-card relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-muted-foreground/50 rounded-b-sm" />
                    <span className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      Player
                    </span>
                  </TableHead>
                  <TableHead className="bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Segurado</span>
                  </TableHead>
                  <TableHead className="w-[60px] bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Loc</span>
                  </TableHead>
                  <TableHead className="bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Guilty</span>
                  </TableHead>
                  <TableHead className="bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Guy</span>
                  </TableHead>
                  <TableHead className="bg-card">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Meta</span>
                  </TableHead>
                  
                  {/* Separador */}
                  <TableHead className="w-[1px] p-0 bg-card">
                    <div className="w-[1px] h-full bg-muted-foreground/40" />
                  </TableHead>
                  
                  {/* Grupo 3: Workflow Principal */}
                  {filters.columnGroups.workflow && (
                    <>
                      <TableHead className="bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-accent rounded-b-sm" />
                        <span className="text-xs font-bold text-accent tracking-wider flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          Inspeção
                        </span>
                      </TableHead>
                      <TableHead className="bg-card text-center">
                        <span className="text-xs font-bold text-accent tracking-wider">Entregue</span>
                      </TableHead>
                      <TableHead className="w-[60px] bg-card">
                        <span className="text-xs font-bold text-accent tracking-wider">Prazo</span>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-accent/40" />
                      </TableHead>
                    </>
                  )}
                  
                  {/* Grupo 4: Recebíveis - Honorários */}
                  {filters.columnGroups.recebiveis && (
                    <>
                      <TableHead className="bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-success rounded-b-sm" />
                        <span className="text-xs font-bold text-success tracking-wider flex items-center justify-center gap-1">
                          <Wallet className="w-3 h-3" />
                          Acerto
                        </span>
                      </TableHead>
                      <TableHead className="bg-card text-center">
                        <span className="text-xs font-bold text-success tracking-wider">Envio</span>
                      </TableHead>
                      <TableHead className="bg-card text-center">
                        <span className="text-xs font-bold text-success tracking-wider">Pago</span>
                      </TableHead>
                      <TableHead className="bg-card text-right">
                        <span className="text-xs font-bold text-success tracking-wider">Honorários</span>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-success/40" />
                      </TableHead>
                      
                      {/* Grupo 5: Recebíveis - Despesas */}
                      <TableHead className="bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-400 rounded-b-sm" />
                        <span className="text-xs font-bold text-emerald-400 tracking-wider flex items-center justify-center gap-1">
                          <Receipt className="w-3 h-3" />
                          DEnvio
                        </span>
                      </TableHead>
                      <TableHead className="bg-card text-center">
                        <span className="text-xs font-bold text-emerald-400 tracking-wider">DPago</span>
                      </TableHead>
                      <TableHead className="bg-card text-right">
                        <span className="text-xs font-bold text-emerald-400 tracking-wider">Despesas</span>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-emerald-400/40" />
                      </TableHead>
                    </>
                  )}
                  
                  {/* Grupo 6: Pagamentos Colaborador */}
                  {filters.columnGroups.pagamentos && (
                    <>
                      <TableHead className="bg-card relative text-center">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-warning rounded-b-sm" />
                        <span className="text-xs font-bold text-warning tracking-wider flex items-center justify-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          GPago
                        </span>
                      </TableHead>
                      <TableHead className="bg-card text-right">
                        <span className="text-xs font-bold text-warning tracking-wider">GHonorários</span>
                      </TableHead>
                      <TableHead className="bg-card text-center">
                        <span className="text-xs font-bold text-warning tracking-wider">GDPago</span>
                      </TableHead>
                      <TableHead className="bg-card text-right">
                        <span className="text-xs font-bold text-warning tracking-wider">GDespesas</span>
                      </TableHead>
                      
                      {/* Separador */}
                      <TableHead className="w-[1px] p-0 bg-card">
                        <div className="w-[1px] h-full bg-warning/40" />
                      </TableHead>
                    </>
                  )}
                  
                  {/* Grupo 7: Contexto */}
                  <TableHead className="bg-card relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-muted-foreground/30 rounded-b-sm" />
                    <span className="text-xs font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Atividade
                    </span>
                  </TableHead>
                  <TableHead className="w-[80px] bg-card text-center">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider">Observação</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {isLoading ? (
                    Array.from({ length: 12 }).map((_, i) => (
                      <SkeletonRow key={`skeleton-${i}`} filters={filters} />
                    ))
                  ) : currentData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={30}
                        className="h-48 text-center"
                      >
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <div className="p-4 rounded-full bg-muted/30">
                            <FileSpreadsheet className="w-8 h-8" />
                          </div>
                          <p className="text-sm font-medium">Nenhum registro encontrado</p>
                          <p className="text-xs">Tente ajustar os filtros ou adicionar novos registros</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((row, index) => (
                      <TableRow
                        key={row.idPrinc || index}
                        className={`border-b border-white/5 cursor-pointer transition-all duration-200 group
                          ${hoveredRow === index ? `bg-gradient-to-r ${getStatusGradient(row.meta)}` : "hover:bg-white/[0.02]"}
                        `}
                        onClick={() => onRowClick?.(row)}
                        onMouseEnter={() => setHoveredRow(index)}
                        onMouseLeave={() => setHoveredRow(null)}
                        data-testid={`row-inspection-${row.idPrinc || index}`}
                      >
                          {/* Grupo 1: Ação */}
                          <TableCell className="leading-tight">
                            <button
                              className={`p-1 rounded-md cursor-pointer transition-all duration-200 hover:scale-110 border ${getStatusColor(row.meta)} bg-transparent hover:shadow-lg hover:shadow-primary/20`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInspection(row);
                                setIsActionCenterOpen(true);
                              }}
                              data-testid={`badge-action-${row.idPrinc || index}`}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          </TableCell>
                          
                          {/* Separador */}
                          <TableCell className="w-[1px] p-0">
                            <div className="w-[1px] h-full bg-primary/30" />
                          </TableCell>
                          
                          {/* Grupo 2: Identificação */}
                          <TableCell className=" text-xs font-semibold text-foreground">
                            {row.player || "-"}
                          </TableCell>
                          <TableCell className=" text-xs max-w-[140px] truncate">
                            {row.segurado || "-"}
                          </TableCell>
                          <TableCell className=" text-xs text-center font-mono">
                            {row.loc ?? "-"}
                          </TableCell>
                          <TableCell className=" text-xs">
                            {row.nickGuilty || "-"}
                          </TableCell>
                          <TableCell className=" text-xs">
                            {row.nickGuy || "-"}
                          </TableCell>
                          <TableCell className="leading-tight">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${getStatusColor(row.meta)}`}
                            >
                              {row.meta || "-"}
                            </Badge>
                          </TableCell>
                          
                          {/* Separador */}
                          <TableCell className="w-[1px] p-0">
                            <div className="w-[1px] h-full bg-muted-foreground/30" />
                          </TableCell>
                          
                          {/* Grupo 3: Workflow Principal */}
                          {filters.columnGroups.workflow && (
                            <>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.dtInspecao)}
                              </TableCell>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.dtEntregue)}
                              </TableCell>
                              <TableCell className=" text-xs text-center font-mono">
                                {row.prazo ?? "-"}
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] p-0">
                                <div className="w-[1px] h-full bg-accent/30" />
                              </TableCell>
                            </>
                          )}
                          
                          {/* Grupo 4: Recebíveis - Honorários */}
                          {filters.columnGroups.recebiveis && (
                            <>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.dtAcerto)}
                              </TableCell>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.dtEnvio)}
                              </TableCell>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.dtPago)}
                              </TableCell>
                              <TableCell className=" text-xs text-right font-mono font-semibold text-success">
                                {formatCurrency(row.honorario)}
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] p-0">
                                <div className="w-[1px] h-full bg-success/30" />
                              </TableCell>
                              
                              {/* Grupo 5: Recebíveis - Despesas */}
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.dtDenvio)}
                              </TableCell>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.dtDpago)}
                              </TableCell>
                              <TableCell className=" text-xs text-right font-mono font-semibold text-emerald-400">
                                {formatCurrency(row.despesa)}
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] p-0">
                                <div className="w-[1px] h-full bg-emerald-400/30" />
                              </TableCell>
                            </>
                          )}
                          
                          {/* Grupo 6: Pagamentos Colaborador */}
                          {filters.columnGroups.pagamentos && (
                            <>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.dtGuyPago)}
                              </TableCell>
                              <TableCell className=" text-xs text-right font-mono font-semibold text-warning">
                                {formatCurrency(row.guyHonorario)}
                              </TableCell>
                              <TableCell className=" text-xs text-muted-foreground text-center">
                                {formatDate(row.dtGuyDpago)}
                              </TableCell>
                              <TableCell className=" text-xs text-right font-mono font-semibold text-warning">
                                {formatCurrency(row.guyDespesa)}
                              </TableCell>
                              
                              {/* Separador */}
                              <TableCell className="w-[1px] p-0">
                                <div className="w-[1px] h-full bg-warning/30" />
                              </TableCell>
                            </>
                          )}
                          
                          {/* Grupo 7: Contexto */}
                          <TableCell className=" text-xs text-muted-foreground max-w-[100px] truncate">
                            {row.atividade || "-"}
                          </TableCell>
                          <TableCell className="leading-tight">
                            <div className={`flex items-center justify-center gap-1 transition-opacity duration-200 ${hoveredRow === index ? "opacity-100" : "opacity-0"}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="glass border border-white/10"
                                onClick={(e) => { e.stopPropagation(); }}
                                data-testid={`button-view-${row.idPrinc || index}`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="glass border border-white/10"
                                onClick={(e) => { e.stopPropagation(); }}
                                data-testid={`button-edit-${row.idPrinc || index}`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                      </TableRow>
                    ))
                  )}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-gradient-to-r from-muted/20 via-transparent to-muted/20">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Mostrando{" "}
              <span className="font-semibold text-foreground">{startIndex + 1}</span>
              {" - "}
              <span className="font-semibold text-foreground">{Math.min(endIndex, data.length)}</span>
              {" de "}
              <span className="font-semibold text-accent">{data.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="glass border border-white/10 disabled:opacity-30"
              data-testid="button-first-page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="glass border border-white/10 disabled:opacity-30"
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 px-3">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`min-w-[32px] ${pageNum === currentPage ? "bg-primary/80 text-primary-foreground" : "glass border border-white/10"}`}
                    data-testid={`button-page-${pageNum}`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="glass border border-white/10 disabled:opacity-30"
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="glass border border-white/10 disabled:opacity-30"
              data-testid="button-last-page"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
      
      <ActionCenter
        inspection={selectedInspection}
        isOpen={isActionCenterOpen}
        onClose={() => setIsActionCenterOpen(false)}
        onRefresh={onRefresh}
      />
    </motion.div>
  );
}
