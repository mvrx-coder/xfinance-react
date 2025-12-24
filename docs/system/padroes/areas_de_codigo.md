# 📁 Áreas de Código e Onde Editar

> **Guia rápido de onde colocar cada tipo de código**

---

## 🚨 ANTES DE EDITAR - Verificar Sigilo

```
⚠️ Se a funcionalidade envolve DADOS DO GRID ou VALORES FINANCEIROS:
   1. Leia docs/system/SIGILO.md
   2. Verifique qual papel pode acessar
   3. Implemente controle no BACKEND primeiro
```

---

## 📂 Estrutura do Projeto

```
x_finan/
├── client/                     # Frontend React
│   └── src/
│       ├── components/         # Componentes React
│       │   ├── dashboard/      # Dashboard e grid
│       │   │   ├── modals/     # Modais do sistema
│       │   │   │   └── [nome]/ # Sub-componentes (se >400 linhas)
│       │   │   └── ...
│       │   └── ui/             # ⛔ NÃO EDITAR (shadcn)
│       │
│       ├── pages/              # Rotas/páginas
│       ├── hooks/              # Hooks customizados
│       ├── services/           # Serviços (API + domínio)
│       │   ├── api/            # Chamadas HTTP
│       │   └── domain/         # Lógica de negócio
│       ├── constants/          # Constantes globais
│       └── lib/                # Utilitários
│
├── backend/                    # Backend FastAPI (A CRIAR)
│   ├── routers/                # Endpoints da API
│   ├── services/               # Lógica de negócio
│   └── main.py                 # Entry point
│
├── shared/                     # Tipos compartilhados
│   └── schema.ts               # Schema Drizzle + tipos
│
└── docs/                       # Documentação
    └── system/                 # Docs do sistema
```

---

## 🎨 Frontend (client/src/)

### Componentes (`components/`)

| Local | Quando usar |
|-------|-------------|
| `dashboard/TopBar.tsx` | Filtros, KPIs da toolbar |
| `dashboard/DataGrid.tsx` | Grid principal (<400 linhas) |
| `dashboard/ActionCenter.tsx` | Painel lateral de ações |
| `dashboard/StatusBar.tsx` | Mensagens de status |
| `dashboard/modals/[Nome]Modal.tsx` | Modal simples |
| `dashboard/modals/[nome]/` | Sub-componentes de modal complexo |
| `ui/` | ⛔ **NÃO EDITAR** (shadcn gerados) |

### Páginas (`pages/`)

| Arquivo | Descrição |
|---------|-----------|
| `Dashboard.tsx` | Página principal |
| `Login.tsx` | Tela de login |
| `not-found.tsx` | Página 404 |

### Hooks (`hooks/`)

| Arquivo | Descrição |
|---------|-----------|
| `index.ts` | ⚠️ APENAS re-exports |
| `use-inspections.ts` | CRUD de inspeções |
| `use-kpis.ts` | KPIs e cálculos |
| `use-lookups.ts` | Dropdowns com cache |
| `use-filters.ts` | Estado de filtros |
| `use-permissions.ts` | 🔒 Verificação de sigilo |
| `use-toast.ts` | Notificações |

### Services (`services/`)

| Local | Quando usar |
|-------|-------------|
| `api/acoes.ts` | Chamadas HTTP para ações |
| `api/lookups.ts` | Chamadas HTTP para dropdowns |
| `api/inspections.ts` | Chamadas HTTP para inspeções |
| `domain/formatters.ts` | Formatação (moeda, data) |
| `domain/calculations.ts` | Cálculos financeiros |
| `domain/validators.ts` | Validações de formulário |
| `domain/permissions.ts` | 🔒 Lógica de permissões |

### Constants (`constants/`)

| Arquivo | Conteúdo |
|---------|----------|
| `index.ts` | GRID_CONFIG, API_ENDPOINTS, CACHE_CONFIG |

### Lib (`lib/`)

| Arquivo | Descrição |
|---------|-----------|
| `queryClient.ts` | Configuração TanStack Query |
| `utils.ts` | Funções utilitárias (cn) |

---

## 🔧 Backend (backend/) - A CRIAR

### Routers (`routers/`)

| Arquivo | Endpoints |
|---------|-----------|
| `inspections.py` | `/api/inspections` (CRUD) |
| `users.py` | `/api/users` (CRUD) |
| `kpis.py` | `/api/kpis` (cálculos) |
| `lookups.py` | `/api/lookups/*` (dropdowns) |
| `actions.py` | `/api/actions/*` (excluir, encaminhar, marcar) |

### Services (`services/`)

| Arquivo | Descrição |
|---------|-----------|
| `permissions.py` | 🔒 **CRÍTICO**: Consulta tabela `permi` |
| `queries.py` | Queries SQL migradas do x_main |
| `calculations.py` | Cálculos financeiros |

---

## 📦 Shared (shared/)

| Arquivo | Descrição |
|---------|-----------|
| `schema.ts` | Schema Drizzle + tipos TypeScript |

⚠️ **Não alterar estrutura do schema** - Deve estar alinhado com DDL SQLite.

---

## 🎯 Onde Criar Código Novo

### Novo Hook de Dados
```
1. Criar: hooks/use-[nome].ts
2. Exportar: hooks/index.ts (adicionar re-export)
3. Limite: 200 linhas
```

### Nova Função de Formatação
```
1. Criar/editar: services/domain/formatters.ts
2. Exportar: services/domain/index.ts (se novo arquivo)
3. Limite: 300 linhas por arquivo
```

### Nova Validação
```
1. Criar/editar: services/domain/validators.ts
2. Exportar: services/domain/index.ts (se novo arquivo)
```

### Nova Chamada API
```
1. Criar: services/api/[dominio].ts
2. Limite: 300 linhas
```

### Novo Modal Simples (<400 linhas)
```
1. Criar: components/dashboard/modals/[Nome]Modal.tsx
```

### Novo Modal Complexo (>400 linhas)
```
1. Criar: components/dashboard/modals/[Nome]Modal.tsx (orquestrador)
2. Criar pasta: components/dashboard/modals/[nome]/
3. Criar sub-componentes na pasta
4. Criar: [nome]/data.ts (tipos e mocks)
```

### Nova Constante
```
1. Editar: constants/index.ts
2. Agrupar por categoria (GRID_CONFIG, API_ENDPOINTS, etc.)
```

### Novo Endpoint Backend
```
1. Criar: backend/routers/[dominio].py
2. 🔒 SEMPRE verificar permissões antes de retornar dados
```

### Nova Lógica de Permissão
```
1. Backend: backend/services/permissions.py
2. Frontend: services/domain/permissions.ts + hooks/use-permissions.ts
```

---

## ⛔ Áreas Protegidas (NÃO EDITAR)

| Área | Motivo |
|------|--------|
| `client/src/components/ui/` | Gerados pelo shadcn/ui |
| `node_modules/` | Dependências |
| `client/src/index.css` (`:root`) | Design tokens padronizados |
| Arquivos `index.ts` | Apenas re-exports |
| `shared/schema.ts` (estrutura) | Alinhado com DDL SQLite |

---

## 🔒 Código que Envolve Sigilo

Se você está editando código que:
- Busca dados do grid
- Exibe valores financeiros
- Mostra informações de usuários
- Permite ações administrativas

**DEVE verificar:**

1. ✅ O papel do usuário é verificado?
2. ✅ A consulta usa `fetch_permissoes_cols(papel)`?
3. ✅ O frontend filtra colunas por permissão?
4. ✅ Ações são bloqueadas para papéis não autorizados?

```typescript
// ✅ CORRETO - Verificar papel
function DataGrid({ papel }: { papel: string }) {
  const permittedColumns = usePermittedColumns(papel);
  // Renderizar apenas colunas permitidas
}

// ❌ INCORRETO - Ignorar papel
function DataGrid() {
  // Renderizar todas as colunas
}
```

---

## 📏 Limites de Arquivos

| Tipo | Limite | Ação |
|------|--------|------|
| Componente | 400 linhas | Extrair sub-componentes |
| Hook | 200 linhas | Dividir responsabilidades |
| Service | 300 linhas | Criar módulos separados |
| Constantes | 150 linhas | Criar arquivos por domínio |

---

## 📚 Documentação Relacionada

- `CLAUDE.md` - Regras para agentes AI
- `docs/system/SIGILO.md` - 🔒 Matriz de permissões
- `docs/system/BOAS_PRATICAS.md` - Padrões de código
- `docs/system/ARCHITECTURE.md` - Arquitetura do sistema
- `docs/system/schema/MAPEAMENTO_CAMPOS.md` - Campos do banco

---

*Última atualização: 22/12/2024*
