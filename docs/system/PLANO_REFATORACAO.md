# Plano de Refatoração Incremental — xFinance 3.0

## Objetivo
- Refatorar incrementalmente, mantendo a arquitetura FastAPI + SQLite e assegurando o sigilo, com entregas seguras e verificáveis.
- Priorizar hotspots do dashboard (grid/status, modais, hooks/services) e consolidar contratos de API.

## Princípios Norteadores
- Sigilo garantido no backend (nunca no frontend) conforme [CLAUDE.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/CLAUDE.md) e [SIGILO.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/system/SIGILO.md).
- Arquitetura alvo: React/Vite + FastAPI + SQLite, conforme [ARCHITECTURE.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/system/ARCHITECTURE.md).
- Organização e locais de edição conforme [areas_de_codigo.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/system/padroes/areas_de_codigo.md).
- Grid e status seguindo [GRID.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/system/ui/GRID.md) e [STATUS_INDICATOR_SYSTEM.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/STATUS_INDICATOR_SYSTEM.md).
- Campos e tipos alinhados ao SQLite conforme [MAPEAMENTO_CAMPOS.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/system/schema/MAPEAMENTO_CAMPOS.md) e [shared/schema.ts](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/shared/schema.ts).

## Fase 0 — Preparação
- Verificar setup local e caminho do SQLite conforme [SETUP_NOVO_PC.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/SETUP_NOVO_PC.md).
- Unificar referência ao caminho real do DB (evitar divergências).
- Catalogar hotspots: arquivos que excedem limites por tipo (componentes ≤400, hooks ≤200, services ≤300), acoplamentos e ausência de testes.

## Fase 1 — Sigilo (Backend Primeiro)
- Autenticação e autorização no FastAPI:
  - Sessão/JWT com papel de usuário.
  - Middleware rejeitando requisições sem credenciais.
- Filtragem por permi:
  - Função única fetch_permissoes_cols(papel) que retorna colunas autorizadas (ver [SIGILO.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/system/SIGILO.md#L127-L144)).
  - Todo SELECT constrói projeção restrita às colunas autorizadas; nunca usar SELECT *.
- Segurança de ações:
  - DELETE/PUT/PATCH/POST bloqueadas por papel (ex.: admin apenas).
  - Inspetor acessa apenas seus registros (filtro FK).
  - Logs de auditoria sem valores sensíveis.
- Entregáveis:
  - Rotas FastAPI com dependency de usuário e projeção por permi.
  - Testes de segurança por papel (admin, BackOffice, Inspetor) provando ausência de colunas bloqueadas e negação de ações.

## Fase 2 — Contratos de API (FastAPI)
- Endpoints e OpenAPI:
  - `/api/v1/inspections` (CRUD, projeção por papel).
  - `/api/v1/kpis` (agregados respeitando sigilo).
  - `/api/v1/lookups/*` (contratantes, ufs, cidades?id_uf, inspetores).
  - `/api/v1/new-record/segurados?q`, `/api/v1/new-record/atividades?q` (busca server-side).
- Respostas padronizadas e tipos consistentes:
  - Listas `{ value, label }` e coleções `{ data, total }`.
- Entregáveis:
  - Contratos publicados e exemplos de uso.
  - Garantia de não reintroduzir Express/_legacy.

## Fase 3 — Grid e Sistema de Status
- Modularização do DataGrid:
  - Extrair subcomponentes: AlertCell, EditableCell, FilterableHeader, PaginationToolbar, StatusLegendTooltip.
  - Manter comportamento, reduzir tamanho/complexidade.
- Alinhamento com status:
  - Validar condições e cores com [STATUS_INDICATOR_SYSTEM.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/STATUS_INDICATOR_SYSTEM.md).
  - Evitar inferências de dados financeiros em papéis bloqueados (status não deve vazar sigilo).
- Performance:
  - Memorização de colunas/linhas, evitar formatadores dentro do render, paginação/filtro no servidor quando aplicável.
- Entregáveis:
  - Grid modular, dentro dos limites, com testes unitários das regras de status e alertas.

## Fase 4 — Modais e Combobox
- Novo Trabalho:
  - Isolar lógica de multi‑local e comboboxes em hooks/utilitários.
  - Busca server-side: primeiro fetch no foco, debounce ao digitar, mensagens claras quando não houver itens.
- Estados de desabilitação:
  - Manter comportamento atual (multi‑local desabilita campos globais), mas concentrar a lógica em um hook próprio.
- Entregáveis:
  - Hooks “useNewRecord” e “useServerSearchCombobox” enxutos e testáveis.
  - Contratos de lookups operando com endpoints FastAPI e tratativas de erro.

## Fase 5 — Hooks e Services
- Consolidar serviços:
  - `services/api`: chamadas HTTP com tratamento de erros e tipagem estrita.
  - `services/domain`: formatters, validators, calculations, permissions (sem I/O).
- Hooks de dados:
  - Chaves estáveis, staleTime conforme [ARCHITECTURE.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/system/ARCHITECTURE.md#L280-L298).
  - Invalidations coerentes após mutações.
- Entregáveis:
  - Remover duplicações, padronizar respostas, fortalecer tipos.
  - Testes de hooks com TanStack Query.

## Fase 6 — Testes
- Unitários:
  - `alertRules` (datas e “valor > 1”), formatters (moeda, data), permissions client-side (render condicional).
- Integração/API:
  - Endpoints FastAPI simulando papéis; provar projeções por permi e políticas de ação.
- E2E:
  - Fluxos críticos: login, “Novo Trabalho”, edição inline, filtros, sigilo por papel.
- Entregáveis:
  - Suite cobrindo regressões e cenários de sigilo/fluxo.

## Fase 7 — UI/UX Consistência
- Tipografia e tokens:
  - Aplicar classes conforme [TYPOGRAPHY.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/system/ui/TYPOGRAPHY.md) e [DESIGN_TOKENS.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/system/DESIGN_TOKENS.md).
- Notificações:
  - Confirmar Sonner nos fluxos principais e Radix no ActionCenter conforme [TOAST.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/system/ui/TOAST.md).
- Entregáveis:
  - Auditoria de classes e eliminação de estilos ad hoc não alinhados aos tokens.

## Fase 8 — Qualidade Operacional
- Tipagem:
  - Corrigir mismatches TS identificados (ex.: assinaturas de callbacks, tipos de marcadores).
- Lint/formatting:
  - ESLint + Prettier; organizar imports; proibir lógica em arquivos de re‑export (CLAUDE).
- CI:
  - Pipeline simples: lint, build, testes; sem vazamento de segredos.

## Garantias de Sigilo — Eficácia e Segurança
- Backend:
  - Projeção seletiva por papel: SELECT apenas colunas autorizadas; nunca retornar “*”.
  - Validação de ações por papel e filtro de “meus registros” para Inspetor.
  - Auditoria: logs sem valores sensíveis, trilha de tentativas negadas.
- Frontend:
  - Renderização condicional por papel complementa a segurança; não substitui filtragem no backend.
  - Grupos de colunas respeitam papéis, mas mesmo que o FE tente burlar, o backend não retorna colunas bloqueadas.
- Testes de segurança:
  - Cenários por papel confirmando ausência de colunas de SIGILO ALTO (honorario, despesa, guy_honorario, guy_despesa, datas de pagamento, id_user_guilty) fora de “admin”.

## Ordem de Execução Recomendada
1. Sigilo no backend (Fase 1).
2. Contratos de API (Fase 2).
3. Grid/Status (Fase 3).
4. Modais/Combobox (Fase 4).
5. Hooks/Services (Fase 5).
6. Testes (Fase 6).
7. UI/UX (Fase 7).
8. Qualidade Operacional (Fase 8).

## Métricas e Auditoria
- Medir: linhas por arquivo, complexidade, re‑renders no grid, tempo de resposta de endpoints, cobertura de testes, violações de sigilo (0 como meta).
- Relatório final: conformidade pós‑refatoração (sigilo, arquitetura, UI/UX), OpenAPI publicado e suite de testes aprovada.

## Riscos e Mitigações
- Risco de regressão no grid: mitigar com testes unitários de regras e e2e.
- Risco de sigilo: mitigar com projeções no backend e testes de segurança por papel.
- Risco de divergência de schema: mitigar com verificação contra [MAPEAMENTO_CAMPOS.md](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/docs/system/schema/MAPEAMENTO_CAMPOS.md) e [shared/schema.ts](file:///e:/MVRX/Financeiro/xFinance_3.0/x_finan/shared/schema.ts).

## Referências
- CLAUDE.md, SIGILO.md, ARCHITECTURE.md, areas_de_codigo.md, GRID.md, STATUS_INDICATOR_SYSTEM.md, TYPOGRAPHY.md, TOAST.md, MAPEAMENTO_CAMPOS.md, SETUP_NOVO_PC.md, DESIGN_TOKENS.md.

