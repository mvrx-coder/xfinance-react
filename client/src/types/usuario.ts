export type Papel = 'admin' | 'financeiro' | 'analista' | 'auditor';

export interface UsuarioInput {
  email: string;
  senha: string;
  papel: Papel;
  ativo: boolean;
  nome?: string;
  nick?: string;
  short_nome?: string;
}

export interface Usuario {
  id_user: number;
  email: string;
  papel: Papel;
  ativo: boolean;
  nome?: string;
  nick?: string;
  short_nome?: string;
}

export const PAPEIS: { value: Papel; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'analista', label: 'Analista' },
  { value: 'auditor', label: 'Auditor' },
];

export function isPapelValido(papel: string): papel is Papel {
  return ['admin', 'financeiro', 'analista', 'auditor'].includes(papel);
}
