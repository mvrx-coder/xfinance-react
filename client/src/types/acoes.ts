export type MarkerType = 'urgente' | 'pendente' | 'auditoria' | 'followup';

export interface EncaminharInput {
  ids_princ: number[];
  id_user_destino: number;
  obs?: string;
}

export interface MarcadorInput {
  ids_princ: number[];
  marker_type: MarkerType;
  value: boolean;
  obs?: string;
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
  color: string;
}
