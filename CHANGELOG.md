# Changelog - xFinance Dashboard

## [1.0.0] - 2024-12-20

### Alterações Realizadas

#### Schema & Modelos de Dados (`shared/schema.ts`)
- Definido modelo completo `Inspection` com todos os campos financeiros (honorários, despesas, recebíveis, pagamentos)
- Criado schema de validação `insertInspectionSchema` usando drizzle-zod
- Definidos tipos TypeScript para `Inspection`, `InsertInspection` e `KPIs`

#### Design System (`client/src/index.css`)
- Implementado dark theme profissional com cores xFinance:
  - Background: `#0A0A1F` (deep purple escuro)
  - Primary: `#CE62D9` (magenta)
  - Secondary: `#5B21B6` (purple)
  - Accent: `#00BCD4` (cyan)
- Configurados tokens CSS para sidebar, cards, borders e estados

#### Componentes Frontend

##### TopBar (`client/src/components/dashboard/TopBar.tsx`)
- Logo xFinance integrado
- Welcome Panel com usuário e data
- Filtros de data (De/Até) 
- Checkboxes para grupos de colunas (Workflow, Recebíveis, Pagamentos)
- Botões administrativos (Usuários, Investimentos, Controle Financeiro, Pagamentos)
- KPIs Express (Pendentes, Em Risco, Concluídos, Valor Recebido)

##### DataGrid (`client/src/components/dashboard/DataGrid.tsx`)
- Tabela responsiva com colunas dinâmicas baseadas nos filtros
- Skeleton loading states durante carregamento
- Paginação com controles de navegação
- Badges coloridos para status (Pago/Pendente/Parcial)
- Formatação monetária em BRL
- Botões de ação por linha (editar, visualizar, excluir)

##### Sistema de Modais (`client/src/components/dashboard/Modal.tsx`)
- Modal base reutilizável com backdrop blur
- `ModalFormGrid` para layouts de formulário em grid
- `ModalFormField` para campos padronizados com labels
- Suporte a diferentes tamanhos (sm, md, lg, xl)
- Acessibilidade (aria-modal, aria-labelledby, ESC para fechar)

##### StatusBar (`client/src/components/dashboard/StatusBar.tsx`)
- Barra de mensagens de status (info, success, warning, error)
- Ícones correspondentes por tipo
- Botão de dismiss individual

##### ToastContainer (`client/src/components/dashboard/ToastContainer.tsx`)
- Toasts empilháveis no canto superior direito
- Auto-dismiss com barra de progresso
- Variantes: default, success, error, warning, info
- Animações de entrada/saída

#### Backend

##### API Routes (`server/routes.ts`)
- `GET /api/inspections` - Lista todas inspeções
- `POST /api/inspections` - Cria nova inspeção
- `GET /api/inspections/:id` - Obtém inspeção por ID
- `PUT /api/inspections/:id` - Atualiza inspeção
- `DELETE /api/inspections/:id` - Remove inspeção
- `GET /api/kpis` - Retorna KPIs agregados

##### Storage (`server/storage.ts`)
- Interface `IStorage` com operações CRUD
- `MemStorage` com 25 registros mock realistas
- Geração automática de dados financeiros variados
- Players e segurados brasileiros fictícios

#### Correções de Review

##### Correções Aplicadas:
1. **queryFn** - Corrigido para usar `queryKey[0]` ao invés de `join("/")` evitando URLs inválidas
2. **Button size="icon"** - Removido custom sizing (`w-8 h-8`) dos botões de ícone nos modais, StatusBar e ToastContainer
3. **Skeleton Loading** - Implementados skeletons realistas no DataGrid durante carregamento (10 linhas com células animadas)
4. **data-testid** - Adicionados atributos de teste em elementos interativos para automação

### Arquivos Principais

```
shared/
  schema.ts              # Modelos e schemas de validação

client/src/
  index.css              # Design tokens e tema dark
  pages/
    Dashboard.tsx        # Página principal do dashboard
  components/dashboard/
    TopBar.tsx           # Barra superior com filtros e KPIs
    DataGrid.tsx         # Grid de dados principal
    Modal.tsx            # Sistema de modais
    StatusBar.tsx        # Barra de status
    ToastContainer.tsx   # Container de toasts

server/
  routes.ts              # Endpoints da API
  storage.ts             # Camada de persistência
```

### Tecnologias Utilizadas
- React 18 + TypeScript
- Vite (build tool)
- TanStack React Query (server state)
- Wouter (routing)
- shadcn/ui + Radix UI (componentes)
- Tailwind CSS (estilos)
- Drizzle ORM + Zod (schemas)
- Express (backend)
