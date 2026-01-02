/**
 * MetaIcon Component
 * 
 * Ícone de Meta: check verde (1) ou X vermelho (0)
 */

import { Check, X } from "lucide-react";

interface MetaIconProps {
  meta: number | null | undefined;
}

export function MetaIcon({ meta }: MetaIconProps) {
  if (meta === 1) {
    return <Check className="w-4 h-4 text-green-500" strokeWidth={3} />;
  }
  // Qualquer valor diferente de 1 é 0
  return <X className="w-4 h-4 text-red-500" strokeWidth={3} />;
}
