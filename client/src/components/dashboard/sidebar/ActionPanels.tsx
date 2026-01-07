/**
 * ActionPanels - Painéis expandíveis para ações
 * 
 * Contém: Excluir, Encaminhar, Marcadores
 * Migrado do ActionCenter.tsx
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  MapPin,
  Calendar,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useInvalidateKPIs } from "@/hooks";
import type { Inspection } from "@shared/schema";
import type { MarkerLevel, MarkerType, UserOption, LocaisResponse, LocalAdicional } from "@/types/acoes";
import { 
  excluir, 
  encaminhar, 
  marcar, 
  fetchUsersOptions,
  fetchLocaisInspecao,
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
  const invalidateKPIs = useInvalidateKPIs();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [markers, setMarkers] = useState<Record<MarkerType, MarkerLevel>>({
    state_loc: 0,
    state_dt_envio: 0,
    state_dt_denvio: 0,
    state_dt_pago: 0,
  });
  const [locaisData, setLocaisData] = useState<LocaisResponse | null>(null);

  const idPrinc = inspection.idPrinc;

  useEffect(() => {
    if (panelType === "encaminhar") {
      fetchUsersOptions().then(setUsers);
    }
    if (panelType === "locais" && idPrinc) {
      setIsLoading(true);
      fetchLocaisInspecao(idPrinc)
        .then(setLocaisData)
        .catch(() => toast.error("Erro ao carregar locais"))
        .finally(() => setIsLoading(false));
    }
  }, [panelType, idPrinc]);

  const handleExcluir = async () => {
    if (!idPrinc) return;
    setIsLoading(true);
    try {
      const result = await excluir({ ids_princ: [idPrinc] });
      if (result.success) {
        toast.success("Inspeção excluída", {
          description: result.message || "Registro removido com sucesso",
        });
        invalidateKPIs(); // Recalcular KPIs após exclusão
        onRefresh?.();
        onClose();
      } else {
        toast.error("Erro", {
          description: result.message || "Falha ao excluir",
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
        id_user_destino: parseInt(selectedUser)
      });
      if (result.success) {
        toast.success("Inspeção encaminhada", {
          description: result.message || "Registro encaminhado com sucesso",
        });
        invalidateKPIs(); // Recalcular KPIs após encaminhamento
        setSelectedUser("");
        onRefresh?.();
        onClose();
      } else {
        toast.error("Erro", {
          description: result.message || "Falha ao encaminhar",
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
        toast.success(level > 0 ? "Marcador aplicado" : "Marcador removido", {
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
        panelType === 'locais' ? 'border-green-500/30' :
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
                    {user.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      {/* Painel Locais */}
      {panelType === 'locais' && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-green-400" />
            </div>
          ) : locaisData ? (
            <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 max-h-[240px] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-500/20">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-foreground">
                  Total: {String(locaisData.total_locais).padStart(2, '0')} {locaisData.total_locais === 1 ? 'local' : 'locais'}
                </span>
              </div>

              {/* Lista compacta */}
              <div className="space-y-1.5">
                {locaisData.locais.map((local) => (
                  <div key={local.id_local} className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-green-400">{local.id_local}</span>
                      <span className="text-foreground">-</span>
                      <span className="text-foreground">{local.cidade_nome || "—"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground ml-4">
                      {local.dt_inspecao && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(local.dt_inspecao + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </span>
                      )}
                      {local.inspetor_nome && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {local.inspetor_nome}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              Nenhum local encontrado
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}

