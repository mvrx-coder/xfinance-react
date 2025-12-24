# 📋 Boas Práticas de Desenvolvimento - xFinance React

> **LEIA ANTES DE CODIFICAR**

---

## ⚠️ Regras Críticas (NÃO NEGOCIÁVEIS)

### 1. SIGILO - Regra Suprema

```
🔒 NUNCA exponha colunas financeiras para papéis não autorizados
🔒 SEMPRE consulte docs/system/SIGILO.md antes de mexer em dados
🔒 SEMPRE filtre dados no BACKEND, nunca apenas no frontend
```

### 2. Limite de Linhas por Arquivo

| Tipo | Limite | Ação se Exceder |
|------|--------|-----------------|
| Componente React | **400 linhas** | Extrair sub-componentes para pasta `[nome]/` |
| Hook | **200 linhas** | Dividir responsabilidades |
| Service | **300 linhas** | Criar módulos separados por domínio |
| Arquivo de constantes | **150 linhas** | Criar arquivos por domínio |

### 3. Stubs e Re-exports

```typescript
// ⚠️ Arquivos index.ts são APENAS para re-exports
// ❌ NUNCA adicione lógica ou funções nesses arquivos

// hooks/index.ts - CORRETO
export { useInspections } from './use-inspections';
export { useKPIs } from './use-kpis';

// hooks/index.ts - INCORRETO
export { useInspections } from './use-inspections';
export function useMinhaNovaFuncao() { } // ❌ PROIBIDO
```

---

## 📁 Organização de Código

### Componentes React

**Componente simples (<400 linhas):**
```
components/dashboard/modals/UsersModal.tsx
```

**Componente complexo (>400 linhas):**
```
components/dashboard/modals/PerformanceModal.tsx    # Orquestrador
components/dashboard/modals/performance/            # Sub-componentes
├── KPICard.tsx
├── DetailsGrid.tsx
├── PremiumTabs.tsx
└── data.ts                                         # Tipos e mocks
```

### Hooks

```
hooks/
├── index.ts              # APENAS re-exports
├── use-inspections.ts    # CRUD de inspeções
├── use-kpis.ts           # KPIs e cálculos
├── use-lookups.ts        # Dropdowns com cache
├── use-filters.ts        # Estado de filtros
├── use-permissions.ts    # Verificação de sigilo
└── use-toast.ts          # Notificações
```

### Services

```
services/
├── api/                  # Chamadas HTTP (fetch, mutations)
│   ├── acoes.ts          # Ações (excluir, encaminhar, marcar)
│   ├── lookups.ts        # Busca de dropdowns
│   └── inspections.ts    # CRUD inspeções
│
└── domain/               # Lógica de negócio (sem I/O)
    ├── index.ts          # Re-exports
    ├── formatters.ts     # Formatação (moeda, data, número)
    ├── calculations.ts   # Cálculos financeiros
    ├── validators.ts     # Validações de formulário
    └── permissions.ts    # Lógica de permissões
```

---

## 📝 Padrões de Nomenclatura

### TypeScript/React

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Componente | PascalCase | `PerformanceModal`, `DetailsGrid` |
| Hook | camelCase com `use` | `useInspections`, `useKPIs` |
| Função | camelCase verbo+substantivo | `fetchInspections`, `formatCurrency` |
| Constante | UPPER_SNAKE_CASE | `GRID_CONFIG`, `API_ENDPOINTS` |
| Tipo/Interface | PascalCase | `Inspection`, `FilterState` |
| Arquivo componente | PascalCase.tsx | `DataGrid.tsx`, `TopBar.tsx` |
| Arquivo hook | kebab-case.ts | `use-inspections.ts` |
| Arquivo service | kebab-case.ts | `formatters.ts`, `lookups.ts` |

### Banco de Dados (SQLite)

```typescript
// ✅ CORRETO - Respeitar nomes do banco
const inspection = {
  idPrinc: 123,        // id_princ
  idContr: 1,          // id_contr
  dtInspecao: '01/12', // dt_inspecao
  honorario: 500,      // honorario
};

// ❌ INCORRETO - Inventar nomes
const inspection = {
  id: 123,             // ERRADO
  contractorId: 1,     // ERRADO
  inspectionDate: '',  // ERRADO
  fee: 500,            // ERRADO
};
```

---

## 🎨 Estilos e CSS

### Regras

1. **NUNCA use CSS inline** para cores ou valores fixos
2. **SEMPRE use classes Tailwind** ou variáveis CSS
3. **Design tokens** estão em `client/src/index.css` (`:root`)

```typescript
// ❌ INCORRETO
<div style={{ color: '#8B5CF6', padding: '16px' }}>

// ✅ CORRETO
<div className="text-primary p-4">
```

### Cores do Sistema

```css
/* Variáveis definidas em :root - NÃO MODIFICAR */
--primary: 263 70% 50%;      /* Roxo principal */
--success: 142 71% 45%;      /* Verde */
--warning: 38 92% 50%;       /* Amarelo/Laranja */
--destructive: 0 84% 60%;    /* Vermelho */
```

---

## 🔧 Padrões de Código

### Componentes React

```typescript
// ✅ PADRÃO CORRETO

// 1. Imports organizados
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useInspections } from "@/hooks";
import type { Inspection } from "@shared/schema";

// 2. Interface de props
interface DataGridProps {
  data: Inspection[];
  filters: FilterState;
  isLoading?: boolean;
  onRowClick?: (inspection: Inspection) => void;
}

// 3. Componente com destructuring
export function DataGrid({
  data,
  filters,
  isLoading = false,
  onRowClick,
}: DataGridProps) {
  // 4. Hooks primeiro
  const [currentPage, setCurrentPage] = useState(1);
  
  // 5. useMemo/useCallback para derivados
  const filteredData = useMemo(() => {
    return data.filter(/* ... */);
  }, [data, filters]);
  
  // 6. Handlers
  const handleRowClick = (row: Inspection) => {
    onRowClick?.(row);
  };
  
  // 7. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### Hooks Customizados

```typescript
// ✅ PADRÃO CORRETO
export function useInspections(filters?: InspectionsFilters) {
  // 1. Usar TanStack Query para fetching
  return useQuery<Inspection[]>({
    queryKey: ["inspections", filters],
    queryFn: () => fetchInspections(filters),
    staleTime: CACHE_CONFIG.INSPECTIONS_STALE_TIME,
  });
}

// ✅ Hook com mutations
export function useDeleteInspection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ids: number[]) => deleteInspections(ids),
    onSuccess: () => {
      // Invalidar cache relacionado
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      queryClient.invalidateQueries({ queryKey: ["kpis"] });
    },
  });
}
```

### Services

```typescript
// ✅ PADRÃO CORRETO - services/domain/formatters.ts

/**
 * Formata valor como moeda brasileira.
 * 
 * @param value - Valor numérico
 * @returns String formatada (ex: "R$ 1.234,56")
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "-";
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
```

---

## 🧪 Antes de Commitar

### Checklist

- [ ] Código compila sem erros (`npm run build`)
- [ ] Sem warnings de lint (`npm run lint`)
- [ ] Arquivos têm menos de 400 linhas
- [ ] Nomenclatura segue padrões
- [ ] Não há dados sensíveis expostos
- [ ] Imports estão organizados
- [ ] Não há CSS inline com valores fixos
- [ ] Não há código em arquivos de re-export

---

## 🚨 Erros Comuns

### 1. Arquivo muito grande

```
❌ DataGrid.tsx com 1200 linhas
✅ DataGrid.tsx (400) + ActionCenter.tsx (400) + helpers.ts (200)
```

### 2. Lógica em re-export

```typescript
// ❌ hooks/index.ts
export * from './use-inspections';
export const ALGUMA_CONSTANTE = 'valor'; // ERRADO!

// ✅ hooks/index.ts
export * from './use-inspections';
// Constantes vão em constants/index.ts
```

### 3. Fetch sem verificar permissão

```typescript
// ❌ ERRADO
const { data } = useQuery({
  queryFn: () => fetch('/api/inspections').then(r => r.json())
});

// ✅ CORRETO - Backend filtra por papel
const { data } = useQuery({
  queryFn: () => fetch('/api/inspections', {
    credentials: 'include' // Envia cookie de sessão
  }).then(r => r.json())
});
// Backend usa papel do cookie para filtrar colunas
```

### 4. Nome de campo inventado

```typescript
// ❌ ERRADO
interface Inspection {
  id: number;        // Deveria ser idPrinc
  contractor: string; // Deveria ser player (via lookup)
}

// ✅ CORRETO
interface Inspection {
  idPrinc: number;
  idContr: number;   // FK para tabela contr
}
```

---

## 📚 Referências

- `CLAUDE.md` - Regras para agentes AI
- `docs/system/SIGILO.md` - Matriz de permissões
- `docs/system/ARCHITECTURE.md` - Arquitetura do sistema
- `docs/system/padroes/areas_de_codigo.md` - Onde editar
- `docs/system/schema/MAPEAMENTO_CAMPOS.md` - Campos do banco

---

*Última atualização: 22/12/2024*
*Baseado em: x_main/docs/system/BOAS_PRATICAS_DESENVOLVIMENTO.md*
