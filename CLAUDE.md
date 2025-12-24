# 🤖 Instruções para Agentes AI - xFinance React

> **LEIA ESTE DOCUMENTO INTEGRALMENTE ANTES DE QUALQUER ALTERAÇÃO NO CÓDIGO**

Este documento define regras **OBRIGATÓRIAS** para qualquer agente AI que trabalhe neste projeto.

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

*Última atualização: 23/12/2024*
*Projeto: xFinance 3.0 - Migração React + FastAPI*

