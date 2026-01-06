# 🏗️ Arquitetura do Sistema xFinance React

Este documento descreve a arquitetura do novo xFinance baseado em React/TypeScript + FastAPI.

---

## 📐 Visão Geral

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐  │
│  │ Pages   │  │Components│  │ Hooks   │  │ Services     │  │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └──────┬───────┘  │
│       └────────────┴─────────────┴───────────────┘          │
│                           │                                  │
│                    TanStack Query                            │
│                           │                                  │
└───────────────────────────┼─────────────────────────────────┘
                            │ REST API
┌───────────────────────────┼─────────────────────────────────┐
│                      BACKEND (FastAPI)                       │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────┐  │
│  │ Routers │  │ Services │  │ Models  │  │ Database     │  │
│  └────┬────┘  └────┬─────┘  └────┬────┘  └──────┬───────┘  │
│       └────────────┴─────────────┴───────────────┘          │
│                           │                                  │
│                     SQLite (existente)                       │
│                           │                                  │
└───────────────────────────┼─────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │  x_db/xFinanceDB.db       │
              │  (Banco SQLite original)   │
              └───────────────────────────┘
```

---

## 🎨 Frontend (React/TypeScript)

### Estrutura de Pastas

```
client/
├── src/
│   ├── components/
│   │   ├── dashboard/              # Componentes do dashboard
│   │   │   ├── TopBar.tsx          # Toolbar com KPIs e filtros
│   │   │   ├── DataGrid.tsx        # Grid principal (≤640 linhas)
│   │   │   ├── ActionCenter.tsx    # Painel de ações lateral
│   │   │   ├── StatusBar.tsx       # Barra de status
│   │   │   └── modals/             # Modais do sistema
│   │   │       ├── NewRecordModal.tsx
│   │   │       ├── UsersModal.tsx
│   │   │       ├── PerformanceModal.tsx
│   │   │       │   └── performance/    # Sub-componentes
│   │   │       │       ├── KPICard.tsx
│   │   │       │       ├── DetailsGrid.tsx
│   │   │       │       └── data.ts
│   │   │       ├── InvestmentsModal.tsx
│   │   │       │   └── investments/    # Sub-componentes
│   │   │       │       ├── PortfolioGrid.tsx
│   │   │       │       └── data.ts
│   │   │       └── GuyPayModal.tsx
│   │   └── ui/                     # Componentes Radix UI (shadcn)
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx           # Página principal
│   │   ├── Login.tsx               # Tela de login
│   │   └── not-found.tsx
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── index.ts                # Re-exports
│   │   ├── use-inspections.ts      # CRUD inspeções
│   │   ├── use-kpis.ts             # KPIs e cálculos
│   │   ├── use-lookups.ts          # Dropdowns com cache
│   │   ├── use-filters.ts          # Estado de filtros
│   │   ├── use-toast.ts            # Notificações
│   │   └── use-mobile.tsx          # Detecção mobile
│   │
│   ├── services/                   # Camada de serviços
│   │   ├── api/                    # Chamadas HTTP
│   │   │   ├── acoes.ts            # Ações (excluir, encaminhar, marcar)
│   │   │   └── lookups.ts          # Fetch de dropdowns
│   │   └── domain/                 # Lógica de negócio
│   │       ├── index.ts            # Re-exports
│   │       ├── formatters.ts       # Formatação (moeda, data, etc.)
│   │       ├── calculations.ts     # Cálculos financeiros
│   │       └── validators.ts       # Validações
│   │
│   ├── constants/                  # Constantes globais
│   │   └── index.ts                # Grid config, API endpoints, etc.
│   │
│   └── lib/                        # Utilitários
│       ├── queryClient.ts          # TanStack Query config
│       └── utils.ts                # Funções auxiliares (cn)
```

### Stack de Tecnologias

| Tecnologia | Uso |
|------------|-----|
| React 18 | Framework UI |
| TypeScript | Tipagem estática |
| Tailwind CSS | Estilos utilitários |
| Radix UI | Componentes acessíveis |
| TanStack Query | Cache e fetching |
| Framer Motion | Animações |
| Wouter | Roteamento |
| react-hook-form | Formulários |
| zod | Validação de schema |

### Padrões de Componentes

```typescript
// Padrão: Componente funcional com tipos explícitos
interface TopBarProps {
  userName?: string;
  kpis: KPIs;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function TopBar({ userName, kpis, ...props }: TopBarProps) {
  // Implementação
}
```

### Padrões de Hooks

```typescript
// Padrão: Hook com TanStack Query
export function useInspections(filters?: InspectionsFilters) {
  return useQuery<Inspection[]>({
    queryKey: [API_ENDPOINTS.INSPECTIONS, filters],
    queryFn: () => fetchInspections(filters),
    staleTime: CACHE_CONFIG.INSPECTIONS_STALE_TIME,
  });
}
```

---

## 🔧 Backend (FastAPI)

### Estrutura Atual

```
backend/
├── main.py                 # Entry point FastAPI
├── config.py               # Configurações e paths
├── database.py             # Conexão SQLite
├── dependencies.py         # CurrentUser, require_admin, helpers de acesso
├── routers/
│   ├── auth.py             # /api/auth/* (login/logout/me)
│   ├── inspections.py      # /api/inspections (grid + CRUD)
│   ├── acoes.py             # /api/acoes/* (ações do grid)
│   ├── lookups.py          # /api/lookups/* (combos/dropdowns)
│   ├── kpis.py              # /api/kpis (KPIs Express - admin only)
│   ├── performance.py       # /api/performance/*
│   ├── investments.py       # Rotas de investimentos
│   └── new_record.py        # /api/new-record/*
└── services/
  ├── auth.py              # JWT + login
  ├── permissions.py       # 🔒 Consulta tabela permi (sigilo)
  ├── directories.py       # Criação/validação de diretórios
  └── queries/             # SQLs (grid, kpis, etc.)
```

### Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login (cookie httponly) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Usuário logado |
| GET | `/api/inspections` | Lista inspeções do grid (🔒 colunas por papel) |
| POST | `/api/inspections` | Criar inspeção (admin only) |
| PATCH | `/api/inspections/{id}` | Atualizar inspeção (respeita papel) |
| DELETE | `/api/inspections/{id}` | Excluir inspeção (admin only) |
| GET | `/api/kpis` | KPIs Express (🔒 admin only) |
| GET | `/api/lookups/*` | Lookups para dropdowns |
| POST | `/api/new-record/*` | Fluxo de criação de registro |

---

## 🗄️ Banco de Dados

### Conexão

O sistema usa o **mesmo banco SQLite** do xFinance original:
- **Localização:** `E:\MVRX\Financeiro\xFinance_3.0\x_db\xFinanceDB.db`
- **Engine:** SQLite 3

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `princ` | Inspeções (tabela principal do grid) |
| `user` | Usuários do sistema |
| `contr` | Contratantes (players) |
| `segur` | Segurados |
| `ativi` | Atividades |
| `uf` | Estados |
| `cidade` | Cidades |
| `finan` | Investimentos financeiros |

Ver schema completo em `docs/system/schema/db_ddl.txt`.

---

## 🔄 Fluxo de Dados

### 1. Carregamento do Grid

```
Dashboard.tsx
    │
    └─> useInspections(filters)  [hook]
            │
            └─> fetchInspections()  [service/api]
                    │
                    └─> FastAPI: GET /api/inspections
                            │
                            └─> SQLite: SELECT ... FROM princ JOIN ...
                                    │
                                    └─> Retorna JSON
                                            │
                                            └─> DataGrid.tsx renderiza
```

### 2. Edição de Célula

```
DataGrid.tsx (onCellEdit)
    │
    └─> useUpdateInspection()  [hook]
            │
            └─> apiRequest("PATCH", ...)  [service/api]
                    │
                    └─> FastAPI: PATCH /api/inspections/{id}
                            │
                            └─> SQLite: UPDATE princ SET ...
                                    │
                                    └─> Invalidate query cache
                                            │
                                            └─> Grid atualiza automaticamente
```

### 3. Formatação de Valores

```
DataGrid.tsx (renderização)
    │
    └─> formatCurrency(valor)  [service/domain/formatters]
            │
            └─> "R$ 1.234,56"
```

---

## 📝 Tipos Compartilhados

Os tipos TypeScript em `shared/schema.ts` correspondem ao banco SQLite:

```typescript
// shared/schema.ts
export const inspections = sqliteTable("princ", {
  idPrinc: integer("id_princ").primaryKey(),
  idContr: integer("id_contr"),
  idSegur: integer("id_segur"),
  honorario: real("honorario"),
  // ... demais campos alinhados com DDL
});

// Tipo inferido para uso nos componentes
export type Inspection = typeof inspections.$inferSelect;
```

---

## 📦 Constantes Centralizadas

```typescript
// constants/index.ts
export const GRID_CONFIG = {
  ROWS_PER_PAGE: 50,
  MIN_HEIGHT: 400,
} as const;

export const API_ENDPOINTS = {
  INSPECTIONS: "/api/inspections",
  KPIS: "/api/kpis",
  // ...
} as const;

export const CACHE_CONFIG = {
  LOOKUPS_STALE_TIME: 5 * 60 * 1000,  // 5 min
  INSPECTIONS_STALE_TIME: 60 * 1000,  // 1 min
} as const;
```

---

*Documento atualizado em: Dezembro/2024*
