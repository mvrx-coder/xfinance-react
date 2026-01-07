/**
 * Helpers para marcadores visuais (pílulas e badges)
 * 
 * Funções utilitárias para renderizar indicadores de alerta
 * e prioridade no grid.
 */

/**
 * Gera JSX de pílula de marcador baseado no nível.
 * 
 * @param level - Nível do marcador (1=baixo, 2=médio, 3=alto)
 * @param label - Label opcional para exibir
 * @returns JSX da pílula ou null se level=0
 */
export function markerPill(level: number | null | undefined, label?: string) {
  const lvl = typeof level === "number" ? level : 0;
  if (!lvl) return null;
  
  const base = "px-1.5 py-0.5 rounded-full text-[10px] font-semibold border shadow-sm";
  const color =
    lvl === 1
      ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
      : lvl === 2
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-red-500/15 text-red-400 border-red-500/30";
  
  return <span className={`${base} ${color}`}>{label || ""}</span>;
}

/**
 * Retorna classe CSS de cápsula envolvente baseada no nível do marcador.
 * 
 * @param level - Nível do marcador (1=baixo, 2=médio, 3=alto)
 * @returns Classes CSS
 */
export function markerWrapClass(level: number | null | undefined): string {
  const lvl = typeof level === "number" ? level : 0;
  if (!lvl) return "";
  
  return (
    "inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full border-2 " +
    (lvl === 1
      ? "bg-cyan-500/12 border-cyan-500/50"
      : lvl === 2
      ? "bg-amber-500/12 border-amber-500/50"
      : "bg-red-500/12 border-red-500/50")
  );
}
