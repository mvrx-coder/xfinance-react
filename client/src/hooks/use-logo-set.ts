/**
 * Hook para gerenciar conjunto de logos do sistema.
 * 
 * O usuário pode alternar entre 3 conjuntos de logos (1, 2, 3)
 * com duplo clique no logo da toolbar.
 * 
 * A escolha persiste via localStorage.
 * 
 * Uso:
 *   const { logos, cycleLogo } = useLogoSet();
 *   <img src={logos.login} />
 *   <img src={logos.toolbar} onDoubleClick={cycleLogo} />
 */

import { useState, useCallback, useMemo } from "react";

const STORAGE_KEY = "xfinance_logo_set";

export interface LogoSet {
  /** Logo para tela de login (maior, mais detalhado) */
  login: string;
  /** Logo para toolbar das demais telas (compacto) */
  toolbar: string;
}

export interface UseLogoSetReturn {
  /** Número do conjunto atual (1, 2 ou 3) */
  logoSet: number;
  /** Paths dos logos do conjunto atual */
  logos: LogoSet;
  /** Alterna para o próximo conjunto (1→2→3→1) */
  cycleLogo: () => void;
}

/**
 * Hook para gerenciar conjunto de logos.
 * Persiste escolha em localStorage.
 */
export function useLogoSet(): UseLogoSetReturn {
  const [logoSet, setLogoSet] = useState<number>(() => {
    if (typeof window === "undefined") return 1;
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? parseInt(stored, 10) : 1;
    // Garantir valor válido (1, 2 ou 3)
    return [1, 2, 3].includes(parsed) ? parsed : 1;
  });

  const cycleLogo = useCallback(() => {
    setLogoSet((current) => {
      const next = current === 3 ? 1 : current + 1;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const logos = useMemo<LogoSet>(() => ({
    login: `/logo${logoSet}.png`,
    toolbar: `/logox${logoSet}.png`,
  }), [logoSet]);

  return { logoSet, logos, cycleLogo };
}
