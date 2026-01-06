/**
 * ActionPanels - Painéis expandíveis para ações
 * 
 * Contém: Excluir, Encaminhar, Marcadores
 * Migrado do ActionCenter.tsx
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import { useToast, useInvalidateKPIs } from "@/hooks";
import type { Inspection } from "@shared/schema";
import type { MarkerLevel, MarkerType, UserOption } from "@/types/acoes";
import { 
  excluir, 
  encaminhar, 
  marcar, 
  fetchUsersOptions,
  getMarkerTypes,
  getMarkerLevels
} from "@/services/api/acoes";
import { getLabelById, type LookupOption } from "@/services/api/lookups";

interface ActionPanelsProps {
  panelType: string;
  inspection: Inspection;
  onClose: () => void;
  onRefresh?: () => void;
  contrLookup: LookupOption[];
  segurLookup: LookupOption[];
}

export function ActionPanels({
  panelType,
  inspection,
  onClose,
  onRefresh,
  contrLookup,
  segurLookup,
}: ActionPanelsProps) {
  const { toast } = useToast();
  const invalidateKPIs = useInvalidateKPIs();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [observacao, setObservacao] = useState("");
  const [markers, setMarkers] = useState<Record<MarkerType, MarkerLevel>>({
    state_loc: 0,
    state_dt_envio: 0,
    state_dt_denvio: 0,
    state_dt_pago: 0,
  });

  const idPrinc = inspection.idPrinc;

  useEffect(() => {
    if (panelType === "encaminhar") {
      fetchUsersOptions().then(setUsers);
    }
  }, [panelType]);

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
        invalidateKPIs(); // Recalcular KPIs após exclusão
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
        invalidateKPIs(); // Recalcular KPIs após encaminhamento
        setSelectedUser("");
        setObservacao("");
        onRefresh?.();
        onClose();
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

  const handleMarcar = async (markerType: MarkerType, level: MarkerLevel) => {
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
        invalidateKPIs(); // Recalcular KPIs após marcação
        onRefresh?.();
      }
    } catch {
      setMarkers(prev => ({ ...prev, [markerType]: prev[markerType] }));
    }
  };

  const markerTypes = getMarkerTypes();
  const markerLevels = getMarkerLevels();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`mt-2 p-3 rounded-xl bg-slate-900/80 border space-y-3 ${
        panelType === 'excluir' ? 'border-red-500/30' :
        panelType === 'encaminhar' ? 'border-orange-500/30' :
        'border-yellow-500/30'
      }`}
    >
      {/* Painel Excluir */}
      {panelType === 'excluir' && (
        <>
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-foreground font-medium">
              {inspection.player || "—"} - {inspection.segurado || "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inspeção: {inspection.dtInspecao 
                ? new Date(inspection.dtInspecao + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
                : "—"}
            </p>
          </div>
          <p className="text-xs text-red-400">
            Tem certeza? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 border-white/20 text-xs"
              data-testid="button-cancel-delete"
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExcluir}
              disabled={isLoading}
              className="flex-1 border-red-500 text-red-400 bg-red-500/10 text-xs"
              data-testid="button-confirm-delete"
            >
              {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Trash2 className="w-3 h-3 mr-1" />}
              Excluir
            </Button>
          </div>
        </>
      )}

      {/* Painel Encaminhar */}
      {panelType === 'encaminhar' && (
        <>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Encaminhar para:</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="bg-slate-800/50 border-white/10 text-xs h-8" data-testid="select-user-destino">
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
            <label className="text-xs text-muted-foreground">Observação (opcional):</label>
            <Textarea 
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Digite uma observação..."
              className="bg-slate-800/50 border-white/10 resize-none text-xs"
              rows={2}
              data-testid="textarea-obs-encaminhar"
            />
          </div>
          <Button
            className="w-full gap-2 bg-orange-500/20 border-orange-500 text-orange-400 text-xs"
            variant="outline"
            size="sm"
            disabled={!selectedUser || isLoading}
            onClick={handleEncaminhar}
            data-testid="button-confirm-encaminhar"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
            Confirmar Encaminhamento
          </Button>
        </>
      )}

      {/* Painel Marcadores */}
      {panelType === 'marcadores' && (
        <>
          {markerTypes.map(marker => (
            <div key={marker.type} className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-yellow-400">
                {marker.label}
              </span>
              <Select
                value={String(markers[marker.type])}
                onValueChange={(val) => {
                  const parsed = parseInt(val, 10);
                  if (![0, 1, 2, 3].includes(parsed)) return;
                  handleMarcar(marker.type, parsed as MarkerLevel);
                }}
              >
                <SelectTrigger className="w-[120px] bg-slate-800/50 border-white/10 text-xs h-7" data-testid={`select-marker-${marker.type}`}>
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
        </>
      )}
    </motion.div>
  );
}

