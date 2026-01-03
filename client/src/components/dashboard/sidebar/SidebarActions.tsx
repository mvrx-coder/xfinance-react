/**
 * SidebarActions - Botões de ação para inspeção selecionada
 * 
 * Migrado do ActionCenter.tsx
 * Aparece quando uma linha do grid é selecionada
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Send,
  AlertTriangle,
  MapPin,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Inspection } from "@shared/schema";
import type { LookupOption } from "@/services/api/lookups";
import { ACTION_COLOR_CLASSES } from "../action-center/constants";
import { ActionPanels } from "./ActionPanels";

interface SidebarActionsProps {
  inspection: Inspection;
  onClearSelection: () => void;
  onRefresh?: () => void;
  userRole?: string;
  contrLookup: LookupOption[];
  segurLookup: LookupOption[];
}

export function SidebarActions({
  inspection,
  onClearSelection,
  onRefresh,
  userRole,
  contrLookup,
  segurLookup,
}: SidebarActionsProps) {
  const { toast } = useToast();
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const canDelete = userRole === "admin";
  const canForward = userRole === "admin" || userRole === "BackOffice";
  const canMark = canForward;

  const handleViewLocations = () => {
    toast({
      title: "Demais locais",
      description: (inspection.loc && inspection.loc > 1) 
        ? "Esta inspeção possui vários locais" 
        : "Esta inspeção possui um único local",
    });
  };

  const actionButtons = [
    {
      id: "excluir",
      icon: Trash2,
      label: "Excluir inspeção",
      color: "red",
      disabled: !canDelete,
      hasPanel: true,
    },
    {
      id: "encaminhar",
      icon: Send,
      label: "Encaminhar inspeção",
      color: "orange",
      disabled: !canForward,
      hasPanel: true,
    },
    {
      id: "marcadores",
      icon: AlertTriangle,
      label: "Marcador de alerta",
      color: "yellow",
      disabled: !canMark,
      hasPanel: true,
    },
    {
      id: "locais",
      icon: MapPin,
      label: "Visualizar demais locais",
      color: "green",
      disabled: false,
      hasPanel: false,
      onClick: handleViewLocations,
    },
  ];

  return (
    <div className="space-y-3">
      {actionButtons.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ delay: index * 0.05 }}
        >
          <Button
            className={`w-full justify-start gap-3 rounded-xl border-2 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl text-sm ${ACTION_COLOR_CLASSES[action.color]} ${activePanel === action.id ? `bg-${action.color}-500/20` : ''}`}
            variant="outline"
            size="sm"
            disabled={action.disabled}
            onClick={() => {
              if (action.hasPanel) {
                setActivePanel(activePanel === action.id ? null : action.id);
              } else {
                action.onClick?.();
              }
            }}
            data-testid={`sidebar-action-${action.id}`}
          >
            <action.icon className="w-4 h-4" />
            <span className="font-medium">{action.label}</span>
          </Button>

          {action.hasPanel && (
            <AnimatePresence>
              {activePanel === action.id && (
                <ActionPanels
                  panelType={action.id}
                  inspection={inspection}
                  onClose={() => setActivePanel(null)}
                  onRefresh={onRefresh}
                  contrLookup={contrLookup}
                  segurLookup={segurLookup}
                />
              )}
            </AnimatePresence>
          )}
        </motion.div>
      ))}

      {/* Botão Desmarcar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ delay: actionButtons.length * 0.05 }}
        className="pt-2"
      >
        <Button
          className="w-full justify-center gap-2 rounded-xl border border-white/20 bg-white/5 text-muted-foreground hover:bg-white/10 transition-all duration-300 text-sm"
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          data-testid="sidebar-action-deselect"
        >
          <X className="w-4 h-4" />
          Desmarcar
        </Button>
      </motion.div>
    </div>
  );
}

