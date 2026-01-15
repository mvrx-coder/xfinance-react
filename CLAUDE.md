# 🤖 Instruções para Agentes AI - xFinance React

> **LEIA ESTE DOCUMENTO INTEGRALMENTE ANTES DE QUALQUER ALTERAÇÃO NO CÓDIGO**

Este documento define regras **OBRIGATÓRIAS** para qualquer agente AI que trabalhe neste projeto.

---

## 🚀 INÍCIO DE SESSÃO (OBRIGATÓRIO)

Ao iniciar qualquer sessão de trabalho neste projeto:

1. **Este arquivo (`CLAUDE.md`) deve ser lido primeiro** - contém todas as regras críticas
2. **Para tarefas envolvendo sigilo/permissões** - leia também `docs/system/SIGILO.md`
3. **Para entender a arquitetura** - leia `docs/system/ARCHITECTURE.md`
4. **Para padrões de UI** - consulte `docs/system/ui/`

### Contexto do Projeto

- **Sistema:** xFinance 3.0 - Sistema de gestão de inspeções veiculares
- **Stack:** React + Vite (frontend) | FastAPI + SQLite (backend)
- **Banco:** SQLite legado (`xFinance.db`) - NUNCA alterar nomes de campos
- **Repo Git:** Este workspace é um repositório Git ativo

### Preferências do Desenvolvedor

```
✅ Toda comunicação deve ser em Português do Brasil
✅ Sempre apresentar plano curto + lista de arquivos ANTES de escrever código
✅ Preferir alterações mínimas (diffs pequenos)
✅ Nunca inventar caminhos de arquivos - sempre verificar primeiro
✅ Para alterações de schema do banco, apresentar estratégia de migração segura
```

---

## 🔄 ROTINA DE GIT

### Fluxo Padrão de Commits

Quando solicitado a fazer commit, seguir esta sequência:

```bash
# 1. Verificar estado atual
git status
git diff --staged
git diff

# 2. Verificar histórico recente para manter estilo de mensagens
git log --oneline -5

# 3. Adicionar arquivos (NUNCA usar git add . cegamente)
git add <arquivos_específicos>

# 4. Commit com mensagem descritiva em português
git commit -m "tipo: descrição concisa do que foi feito"
```

### Convenção de Mensagens de Commit

```
feat:     Nova funcionalidade
fix:      Correção de bug
refactor: Refatoração sem mudança de comportamento
style:    Formatação, ponto e vírgula, etc.
docs:     Documentação
chore:    Manutenção, configs, deps
```

### Regras de Segurança Git

```
⚠️ NUNCA fazer push sem confirmação explícita do usuário
⚠️ NUNCA usar --force em branches compartilhadas
⚠️ NUNCA commitar arquivos sensíveis (.env, credentials, etc.)
⚠️ NUNCA alterar git config
⚠️ NUNCA usar --amend em commits já enviados ao remote
```

### Branch Atual e Remote

- O agente tem acesso ao terminal e pode executar comandos git
- Verificar `git branch` e `git remote -v` quando necessário
- O repositório principal está configurado no workspace

---

## 🚨 REGRAS CRÍTICAS (NÃO NEGOCIÁVEIS)

### 1. SIGILO DE DADOS - PRIORIDADE MÁXIMA

O sistema xFinance possui **controle de sigilo por papel de usuário**. Certas colunas do grid NÃO DEVEM ser visíveis para certos papéis.

```
⚠️ NUNCA exponha dados financeiros para papéis não autorizados
⚠️ NUNCA ignore as permissões definidas na tabela `permi`
⚠️ SEMPRE respeite a matriz de sigilo (ver docs/system/SIGILO.md)
```

**Matriz de Sigilo (resumo):**

| Papel | Colunas Financeiras | Colunas de Identificação | Ações Admin |
|-------|---------------------|--------------------------|-------------|
| admin | ✅ TODAS | ✅ TODAS | ✅ TODAS |
| BackOffice | ❌ OCULTAS | ✅ Parcial | ✅ Encaminhar |
| Inspetor | ❌ OCULTAS (exceto suas) | ❌ Mínima | ❌ NENHUMA |

**Colunas de SIGILO ALTO (somente admin):**
- `honorario`, `despesa` (valores recebidos)
- `guy_honorario`, `guy_despesa` (valores pagos)
- `dt_pago`, `dt_dpago`, `dt_guy_pago`, `dt_guy_dpago` (datas de pagamento)
- `id_user_guilty` (identificação de responsável)

---

### 2. ESTRUTURA DE ARQUIVOS

```
⚠️ NUNCA adicione código em stubs ou arquivos de re-export
⚠️ SEMPRE respeite o limite de 400 linhas por arquivo
⚠️ SEMPRE organize por domínio/responsabilidade
```

**Estrutura obrigatória:**

```
client/src/
├── components/         # Componentes React
│   ├── dashboard/      # Componentes do dashboard
│   │   ├── modals/     # Modais (max 400 linhas cada)
│   │   │   └── [nome]/ # Sub-componentes se modal > 400 linhas
│   │   └── ...
│   └── ui/             # ⚠️ NÃO EDITAR (shadcn gerados)
│
├── hooks/              # Custom hooks (re-export em index.ts)
│   ├── index.ts        # APENAS re-exports
│   ├── use-*.ts        # Hooks individuais
│
├── services/
│   ├── api/            # Chamadas HTTP
│   └── domain/         # Lógica de negócio (formatters, validators)
│
├── constants/          # Constantes globais
│   └── index.ts        # GRID_CONFIG, API_ENDPOINTS, etc.
│
└── lib/                # Utilitários (queryClient, utils)
```

---

### 3. NOMENCLATURA OBRIGATÓRIA

**Hooks:**
```typescript
// ✅ CORRETO
export function useInspections() { }
export function useKPIs() { }

// ❌ INCORRETO
export function inspectionsHook() { }
export function getKPIs() { }
```

**Componentes:**
```typescript
// ✅ CORRETO - PascalCase, nome descritivo
export function PerformanceModal() { }
export function DetailsGrid() { }

// ❌ INCORRETO
export function performance_modal() { }
export function Grid1() { }
```

**Serviços:**
```typescript
// ✅ CORRETO - camelCase, verbo + substantivo
export function fetchInspections() { }
export function formatCurrency() { }

// ❌ INCORRETO
export function inspections() { }
export function currency() { }
```

---

### 4. BANCO DE DADOS - NOMENCLATURA SQLite

O sistema usa o banco SQLite original do xFinance. **NUNCA altere nomes de campos.**

```typescript
// ✅ CORRETO - Usar nomes do banco SQLite
idPrinc     // campo: id_princ
idContr     // campo: id_contr
dtInspecao  // campo: dt_inspecao
honorario   // campo: honorario

// ❌ INCORRETO - Inventar nomes
inspectionId
contractorId
inspectionDate
fee
```

**Mapeamento completo:** `docs/system/schema/MAPEAMENTO_CAMPOS.md`

---

### 5. NÃO MODIFICAR (ÁREAS PROTEGIDAS)

| Área | Motivo |
|------|--------|
| `client/src/components/ui/` | Gerados pelo shadcn/ui |
| `shared/schema.ts` (estrutura) | Alinhado com DDL SQLite |
| `client/src/index.css` (:root) | Design tokens do sistema |
| Qualquer arquivo `index.ts` | Apenas re-exports |

---

## 📋 CHECKLIST ANTES DE MODIFICAR CÓDIGO

Antes de **qualquer** alteração, verifique:

- [ ] Li `docs/system/SIGILO.md` e entendo as regras de permissão?
- [ ] A alteração respeita o papel do usuário logado?
- [ ] O arquivo tem menos de 400 linhas?
- [ ] Estou no módulo correto (não em stub/re-export)?
- [ ] Os nomes seguem o padrão do projeto?
- [ ] Não estou expondo dados de sigilo alto?

---

## 🔒 IMPLEMENTANDO CONTROLE DE SIGILO

### No Frontend (React)

```typescript
// ✅ CORRETO - Verificar papel antes de renderizar colunas
function DataGrid({ papel }: { papel: string }) {
  const visibleColumns = useMemo(() => {
    return getPermittedColumns(papel); // Consulta permissões
  }, [papel]);
  
  // Renderiza apenas colunas permitidas
}

// ❌ INCORRETO - Renderizar todas e esconder via CSS
function DataGrid() {
  return columns.map(col => (
    <Column style={{ display: isAdmin ? 'block' : 'none' }} />
  ));
}
```

### No Backend (FastAPI)

```python
# ✅ CORRETO - Filtrar no SELECT
def get_inspections(papel: str):
    colunas = fetch_permissoes_cols(papel)  # Da tabela permi
    query = f"SELECT {', '.join(colunas)} FROM princ"
    return execute(query)

# ❌ INCORRETO - Retornar tudo e filtrar no frontend
def get_inspections():
    return execute("SELECT * FROM princ")
```

---

## 📁 ONDE EDITAR - GUIA RÁPIDO

| Tarefa | Onde editar |
|--------|-------------|
| Novo hook de dados | `hooks/use-[nome].ts` + export em `hooks/index.ts` |
| Nova formatação | `services/domain/formatters.ts` |
| Nova validação | `services/domain/validators.ts` |
| Nova constante | `constants/index.ts` |
| Novo modal simples | `components/dashboard/modals/[Nome]Modal.tsx` |
| Modal complexo (>400 linhas) | `modals/[Nome]Modal.tsx` + `modals/[nome]/` subpasta |
| Nova chamada API | `services/api/[dominio].ts` |
| Novo endpoint backend | `backend/routers/[dominio].py` |

---

## ⚠️ ERROS COMUNS A EVITAR

### 1. Ignorar sigilo
```typescript
// ❌ NUNCA faça isso
const allColumns = ['honorario', 'despesa', ...]; // Expõe para todos
```

### 2. Arquivos gigantes
```typescript
// ❌ Arquivo com 1200 linhas
// ✅ Dividir em módulos de 400 linhas máx
```

### 3. Nomes inconsistentes
```typescript
// ❌ Misturar convenções
idPrinc, inspection_id, InspectionID
```

### 4. Modificar stubs
```typescript
// ❌ Adicionar código em index.ts de re-exports
export * from './use-inspections';
export function novaFuncao() { } // ERRADO!
```

### 5. CSS inline em componentes
```typescript
// ❌ Evitar
<div style={{ color: '#8B5CF6' }}>

// ✅ Usar classes ou variáveis CSS
<div className="text-primary">
```

---

## 📚 DOCUMENTAÇÃO OBRIGATÓRIA

Antes de trabalhar no projeto, leia **nesta ordem**:

| # | Documento | Conteúdo |
|---|-----------|----------|
| 1 | `CLAUDE.md` (este arquivo) | Regras críticas para agentes |
| 2 | `docs/system/SIGILO.md` | Matriz de permissões por papel |
| 3 | `docs/system/ARCHITECTURE.md` | Arquitetura do sistema |
| 4 | `docs/system/padroes/areas_de_codigo.md` | Onde editar cada tipo de código |
| 5 | `docs/system/ui/TYPOGRAPHY.md` | Esquema de fontes |
| 6 | `docs/system/ui/TOAST.md` | Sistema de notificações |
| 7 | `docs/system/ui/GRID.md` | Regras do grid principal |

> 📁 Índice completo: `docs/system/README.md`

---

## 🚨 EM CASO DE DÚVIDA

1. **Sigilo:** Na dúvida, NÃO exponha a coluna. Pergunte ao usuário.
2. **Estrutura:** Verifique como componentes similares estão organizados.
3. **Nomenclatura:** Consulte `shared/schema.ts` para nomes de campos.
4. **Permissões:** Consulte a tabela `permi` no banco SQLite.
5. **UI/UX:** Consulte `docs/system/ui/` para padrões visuais.

---

## 🛠️ AMBIENTE E FERRAMENTAS

### Sistema Operacional e Paths

- **OS:** Windows 10/11
- **Shell:** PowerShell
- **Workspace:** Caminho absoluto do projeto (detectado automaticamente)

### Comandos Úteis do Projeto

```powershell
# Iniciar ambiente de desenvolvimento
.\start.bat                    # Backend + Frontend

# Apenas backend
cd backend && python -m uvicorn main:app --reload

# Apenas frontend
npm run dev

# Scripts disponíveis
.\scripts\start.ps1            # Iniciar dev servers
.\scripts\stop_dev.ps1         # Parar dev servers
```

### Estrutura de Pastas Importantes

```
/                              # Raiz do projeto
├── CLAUDE.md                  # Este arquivo (instruções AI)
├── backend/                   # API FastAPI
│   ├── main.py               # Entrypoint
│   └── routers/              # Endpoints por domínio
├── client/                    # Frontend React + Vite
│   └── src/
├── docs/system/               # Documentação técnica
├── shared/                    # Tipos compartilhados
│   └── schema.ts             # Schema TypeScript
├── scripts/                   # Scripts de automação
└── xFinance.db               # Banco SQLite (produção local)
```

### Banco de Dados

- **Tipo:** SQLite
- **Arquivo:** `xFinance.db` na raiz do projeto
- **Schema DDL:** `docs/system/schema/db_ddl.txt`
- **Mapeamento:** `docs/system/schema/MAPEAMENTO_CAMPOS.md`

---

## 📝 RESUMO PARA INÍCIO RÁPIDO

```
1. Leia este arquivo (CLAUDE.md) - você está aqui ✅
2. Comunicação sempre em Português do Brasil
3. Plano curto ANTES de codificar
4. Diffs pequenos, alterações mínimas
5. Respeite o sigilo de dados (docs/system/SIGILO.md)
6. Nunca altere: ui/, index.ts (stubs), schema do banco
7. Limite de 400 linhas por arquivo
8. Git: nunca push sem confirmação, mensagens em português
```

---

*Última atualização: 15/01/2026*
*Projeto: xFinance 3.0 - Migração React + FastAPI*
*Compatível com: Cursor AI, Claude Code (VS Code), Claude CLI*

