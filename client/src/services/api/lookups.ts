export interface LookupOption {
  value: number;
  label: string;
}

export interface UserOption extends LookupOption {
  papel: string;
  ativo: boolean;
}

const mockUfs: LookupOption[] = [
  { value: 1, label: "AC" }, { value: 2, label: "AL" }, { value: 3, label: "AM" },
  { value: 4, label: "AP" }, { value: 5, label: "BA" }, { value: 6, label: "CE" },
  { value: 7, label: "DF" }, { value: 8, label: "ES" }, { value: 9, label: "GO" },
  { value: 10, label: "MA" }, { value: 11, label: "MG" }, { value: 12, label: "MS" },
  { value: 13, label: "MT" }, { value: 14, label: "PA" }, { value: 15, label: "PB" },
  { value: 16, label: "PE" }, { value: 17, label: "PI" }, { value: 18, label: "PR" },
  { value: 19, label: "RJ" }, { value: 20, label: "RN" }, { value: 21, label: "RO" },
  { value: 22, label: "RR" }, { value: 23, label: "RS" }, { value: 24, label: "SC" },
  { value: 25, label: "SE" }, { value: 26, label: "SP" }, { value: 27, label: "TO" },
];

const mockCidades: Record<number, LookupOption[]> = {
  11: [ // MG
    { value: 1, label: "Belo Horizonte" },
    { value: 2, label: "Uberlândia" },
    { value: 3, label: "Contagem" },
    { value: 4, label: "Juiz de Fora" },
  ],
  26: [ // SP
    { value: 5, label: "São Paulo" },
    { value: 6, label: "Campinas" },
    { value: 7, label: "Santos" },
    { value: 8, label: "Ribeirão Preto" },
  ],
  19: [ // RJ
    { value: 9, label: "Rio de Janeiro" },
    { value: 10, label: "Niterói" },
    { value: 11, label: "Petrópolis" },
  ],
};

const mockContratantes: LookupOption[] = [
  { value: 1, label: "Aon" },
  { value: 2, label: "Swiss Re" },
  { value: 3, label: "Howden" },
  { value: 4, label: "Inter" },
  { value: 5, label: "Free Job" },
  { value: 6, label: "Marsh" },
  { value: 7, label: "Lockton" },
  { value: 8, label: "IRB" },
  { value: 9, label: "Gallagher" },
];

const mockSegurados: LookupOption[] = [
  { value: 1, label: "Nexa" },
  { value: 2, label: "CLIR 2 CD" },
  { value: 3, label: "CLO CD" },
  { value: 4, label: "DeMilIus" },
  { value: 5, label: "RAJLOG" },
  { value: 6, label: "SAVOY" },
  { value: 7, label: "Caramuru" },
  { value: 8, label: "CEDRO Min..." },
  { value: 9, label: "Vallourec" },
  { value: 10, label: "Maracanã" },
  { value: 11, label: "Top Paper" },
  { value: 12, label: "Lwart" },
  { value: 13, label: "CPFL PCHs" },
  { value: 14, label: "Belo Alimen..." },
  { value: 15, label: "Mosaic" },
  { value: 16, label: "ENGEPACK" },
  { value: 17, label: "Cia Muller C..." },
  { value: 18, label: "COMEXIM" },
  { value: 19, label: "Echoenergí..." },
];

const mockAtividades: LookupOption[] = [
  { value: 1, label: "Mineradora" },
  { value: 2, label: "CD" },
  { value: 3, label: "Falação, Confe" },
  { value: 4, label: "Biodiesel" },
  { value: 5, label: "Mineração, Be..." },
  { value: 6, label: "GO" },
  { value: 7, label: "Papel" },
  { value: 8, label: "Química, Óleo" },
  { value: 9, label: "Hidro Usina, Pn" },
  { value: 10, label: "Alimentos, Fria" },
  { value: 11, label: "Terminal, Velcu" },
  { value: 12, label: "Fertilizantes" },
  { value: 13, label: "Grãos, Café" },
  { value: 14, label: "Fotovoltaica" },
  { value: 15, label: "Subesta..." },
];

const mockUsers: UserOption[] = [
  { value: 1, label: "MVR", papel: "analista", ativo: true },
  { value: 2, label: "AAS", papel: "analista", ativo: true },
  { value: 3, label: "HEA", papel: "analista", ativo: true },
  { value: 4, label: "RES", papel: "auditor", ativo: true },
  { value: 5, label: "ALS", papel: "analista", ativo: true },
  { value: 6, label: "LVS", papel: "analista", ativo: true },
  { value: 7, label: "ARR", papel: "analista", ativo: true },
];

export async function fetchUfOptions(): Promise<LookupOption[]> {
  return mockUfs;
}

export async function fetchCidadeOptions(idUf: number): Promise<LookupOption[]> {
  return mockCidades[idUf] || [];
}

export async function fetchContrOptions(): Promise<LookupOption[]> {
  return mockContratantes;
}

export async function fetchSegurOptions(): Promise<LookupOption[]> {
  return mockSegurados;
}

export async function fetchAtiviOptions(): Promise<LookupOption[]> {
  return mockAtividades;
}

export async function fetchUsersOptions(): Promise<UserOption[]> {
  return mockUsers;
}

export function getLabelById(options: LookupOption[], id: number | null | undefined): string {
  if (id === null || id === undefined) return "-";
  const option = options.find(o => o.value === id);
  return option?.label || "-";
}
