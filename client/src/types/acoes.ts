// Tipos de marcadores correspondem às colunas do tempstate
export type MarkerType = 'state_loc' | 'state_dt_envio' | 'state_dt_denvio' | 'state_dt_pago';

// Níveis de marcador: 0=sem, 1=azul, 2=amarelo, 3=vermelho
export type MarkerLevel = 0 | 1 | 2 | 3;

export interface EncaminharInput {
  ids_princ: number[];
  id_user_destino: number;
  obs?: string;
}

export interface MarcadorInput {
  ids_princ: number[];
  marker_type: MarkerType;
  value: MarkerLevel;
}

export interface ExcluirInput {
  ids_princ: number[];
}

export interface AcaoResult {
  success: boolean;
  updated?: number;
  deleted?: number;
  message?: string;
}

export interface UserOption {
  value: number;
  label: string;
  papel?: string;
  ativo?: boolean;
}

export interface MarkerOption {
  type: MarkerType;
  label: string;
  field: string;  // Nome amigável do campo
}

export interface MarkerLevelOption {
  level: MarkerLevel;
  label: string;
  color: string;
}
