# 📊 Plano de Migração do Grid Principal

> **Documento de referência para migração do DataGrid do xFinance**  
> Este documento mapeia TODAS as funcionalidades do grid original e define a sequência lógica de implementação.

---

## 📋 Índice

1. [Inventário de Funcionalidades](#inventário-de-funcionalidades)
2. [Dependências entre Funcionalidades](#dependências-entre-funcionalidades)
3. [Alterações de Conceito (Novo Sistema)](#alterações-de-conceito)
4. [Sequência de Implementação](#sequência-de-implementação)
5. [Checklist de Migração](#checklist-de-migração)

---

## 📦 Inventário de Funcionalidades

### 1. Estrutura de Dados do Grid

| Aspecto | Implementação Original | Status Migração |
|---------|------------------------|-----------------|
| Tabela principal | `princ` | ✅ Implementado |
| JOIN contratante | `contr c ON p.id_contr = c.id_contr` | ✅ Implementado |
| JOIN segurado | `segur s ON p.id_segur = s.id_segur` | ✅ Implementado |
| JOIN guilty | `user colab ON p.id_user_guilty = colab.id_user` | ✅ Implementado |
| JOIN guy | `user guy ON p.id_user_guy = guy.id_user` | ✅ Implementado |
| JOIN atividade | `ativi a ON p.id_ativi = a.id_ativi` | ✅ Implementado |
| JOIN marcadores | `tempstate ts ON ts.state_id_princ = p.id_princ` | ⏳ Pendente |

### 2. Colunas Ocultas (Críticas para Ações)

```
id_princ          → OBRIGATÓRIO: Identificador único para ações
state_loc         → Marcador de alerta LOC
state_dt_envio    → Marcador de alerta Envio
state_dt_denvio   → Marcador de alerta DEnvio
state_dt_pago     → Marcador de alerta Pago
*__status         → Status calculados (delivery_status, dt_guy_pago__status, etc.)
```

**⚠️ CRÍTICO**: O `id_princ` DEVE estar presente (mesmo oculto) em cada linha para:
- Edição inline
- Exclusão de registro
- Encaminhamento
- Aplicação de marcadores

### 3. Colunas Calculadas (Virtuais)

| Coluna | Lógica | Implementação |
|--------|--------|---------------|
| `SW` | Emoji baseado no prazo e datas | Ver seção [Coluna SW](#coluna-sw) |
| `prazo` | (hoje - dt_inspecao) se dt_entregue vazio | `calcula_prazo_runtime()` |
| `DEL` | Botão de ações (⚙️) | Coluna de ação |

#### Coluna SW - Regras de Negócio

```
💰 Financeiro → dt_entregue preenchido OU dt_inspecao vazio
💸 Verde      → prazo > 1 dia (pendente)
⛽ Amarelo    → prazo > 7 dias (atenção)
🔥 Vermelho   → prazo > 21 dias (urgente)
⚫ Neutro    → Caso padrão
```

### 4. Formatação de Dados

| Tipo | Formato Original | Formato Display | Função |
|------|-----------------|-----------------|--------|
| Datas | `YYYY-MM-DD` | `DD/MM` | `vectorized_format_date()` |
| Moeda | `float` | `1.234,56` | `vectorized_format_currency()` |
| Booleano | `0/1` | `Sim/Não` | `boolean_format()` |
| Localização | `int` | string | `location_format()` |

### 5. Ordenação do Grid

O sistema possui **3 modos de ordenação** controlados pelo toggle "Player":

#### Modo Normal (padrão)
```sql
ORDER BY
  -- 1. MS=1 vai para o final (descendente por dt_inspecao)
  -- 2. Grupos: sem envio/pago → com envio/sem pago → pagos
  -- 3. Dentro do grupo: prazo DESC, dt_envio ASC, segur_nome, dt_acerto DESC
```

#### Modo Player
```sql
ORDER BY
  -- Similar ao normal, mas agrupa por contratante (player)
  -- Depois dt_acerto DESC
```

#### Modo Prazo
```sql
ORDER BY
  -- Agrupa por prazo decrescente
  -- Depois segur_nome, dt_acerto DESC
```

**📁 Localização**: `services/db/grid.py` → `get_order_by_clause()`

### 6. Grupos de Colunas (Checkboxes)

| Grupo | Colunas | Quem pode usar |
|-------|---------|----------------|
| **Work Flow** | id_user_guilty, id_user_guy, meta, dt_inspecao, dt_entregue, prazo, SW | Apenas admin |
| **Recebíveis** | dt_acerto, dt_envio, dt_pago, honorario, dt_denvio, dt_dpago, despesa | Apenas admin |
| **Pagamentos** | dt_guy_pago, guy_honorario, dt_guy_dpago, guy_despesa | Apenas admin |

**Comportamento**: Desmarcar um grupo oculta suas colunas (sem reflow do grid).

### 7. Edição Inline

#### Campos Editáveis
```
dt_acerto, dt_envio, dt_pago, dt_inspecao, dt_entregue,
dt_denvio, dt_dpago, dt_guy_pago, dt_guy_dpago,
honorario, despesa, guy_honorario, guy_despesa,
loc, meta, obs
```

#### Conversões de Entrada
```typescript
// Data DD/MM ou DD/MM/AA → YYYY-MM-DD
"15/12" → "2024-12-15"
"15/12/24" → "2024-12-15"

// Moeda brasileira → float
"1.234,56" → 1234.56
```

**📁 Localização**: `app/callbacks/helpers.py` → `process_edited_value()`

### 8. Central de Ações (Action Drawer)

Modal lateral que aparece ao clicar em ⚙️ (coluna DEL):

#### 8.1 Encaminhar
- Seleciona novo `id_user_guilty` via dropdown
- Atualiza campo no banco
- Recarrega grid

#### 8.2 Marcadores de Alerta
- **Campos alvo**: state_loc, state_dt_envio, state_dt_denvio
- **Níveis**: 0 (sem), 1 (🔵 azul), 2 (🟡 amarelo), 3 (🔴 vermelho)
- Persiste na tabela `tempstate`

#### 8.3 Excluir
- Confirmação obrigatória
- Exclui registro da tabela `princ`
- Recarrega grid

### 9. Filtros do Grid

| Filtro | Comportamento | Toggle |
|--------|---------------|--------|
| **My Job** | Filtra onde id_user_guilty = nick do usuário | Checkbox |
| **Player** | Muda ordenação para modo player | Checkbox |
| **DB Limit** | Limita a 800 registros | Checkbox |

### 10. Cores Condicionais (CSS)

#### Células de Pagamento
```css
.gpay-pending { color: #EF4444; }  /* Vermelho - não pago */
.gpay-done    { color: #22C55E; }  /* Verde - pago */
```

#### Marcadores (Pílulas)
```css
.mark_1 { background: rgba(0,188,212,0.12); color: #00BCD4; }  /* Azul */
.mark_2 { background: rgba(245,158,11,0.2); color: #F59E0B; }  /* Amarelo */
.mark_3 { background: rgba(239,68,68,0.2); color: #EF4444; }   /* Vermelho */
```

#### Destaque de Entrega
```css
.delivery-highlight { 
  color: #34D399;  /* Verde */
  border: 1px solid rgba(52,211,153,0.4);
  background: rgba(52,211,153,0.18);
}
```

### 11. Express Totals (Painel Financeiro)

Apenas para **admin**. Exibe:
- Total Honorários (não pagos)
- Total Despesas (não pagas)
- Express = Honorários + Despesas - GPago - GDPago

**📁 Query**: `database.py` → `get_express_totals()`

### 12. Metadados de Coluna

Cada coluna tem metadados em `column_metadata.py`:

```python
{
  "display": "Nome exibição",
  "format": "date|currency|text|boolean|location",
  "editable": True|False,
  "width": 100,
  "type": "leftAligned|centerAligned|rightAligned",
  "hidden": True|False,
  "cellEditor": "agTextCellEditor|agSelectCellEditor|agNumberCellEditor",
  "headerTooltip": "Dica do cabeçalho",
  "sql_expression": "COALESCE(c.player, '')",  # Para JOINs
  "cellClass": ["classe-css"],
  "suppressMenu": True|False,
}
```

---

## 🔗 Dependências entre Funcionalidades

```
┌─────────────────────────────────────────────────────────────────┐
│                         CAMADA BASE                             │
├─────────────────────────────────────────────────────────────────┤
│  1. id_princ oculto  ──────────────────────────────────────────│
│     └── Todas as ações dependem disso                          │
│                                                                 │
│  2. Permissões (tabela permi)                                  │
│     └── Define quais colunas cada papel pode ver               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA DE DADOS                            │
├─────────────────────────────────────────────────────────────────┤
│  3. JOINs e Query Principal                                    │
│     └── Retorna dados com nomes corretos                       │
│                                                                 │
│  4. Formatação (datas, moedas)                                 │
│     └── Exibição correta no frontend                           │
│                                                                 │
│  5. Colunas calculadas (SW, prazo)                             │
│     └── Depende de dt_inspecao, dt_entregue                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA DE INTERAÇÃO                        │
├─────────────────────────────────────────────────────────────────┤
│  6. Seleção de linha                                           │
│     └── Precisa de id_princ                                    │
│                                                                 │
│  7. Edição inline                                              │
│     └── Precisa de id_princ + processo de valor                │
│                                                                 │
│  8. Central de Ações                                           │
│     └── Encaminhar, Marcar, Excluir                            │
│     └── Precisa de id_princ                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA VISUAL                              │
├─────────────────────────────────────────────────────────────────┤
│  9. Cores condicionais                                         │
│     └── Classes CSS baseadas em status                         │
│                                                                 │
│  10. Marcadores (pílulas)                                      │
│      └── Precisa de state_* + CSS                              │
│                                                                 │
│  11. Grupos de colunas                                         │
│      └── Toggle de visibilidade                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Alterações de Conceito

> **Funcionalidades que terão comportamento DIFERENTE no novo sistema**

### ✨ Alterações Confirmadas pelo Usuário

| Funcionalidade | Comportamento Antigo | Novo Comportamento |
|----------------|---------------------|-------------------|
| **Pílulas (marcadores)** | Cores mark_1/2/3 nas células | ⏳ A DEFINIR |
| **Cores de linhas** | Classes CSS condicionais | ⏳ A DEFINIR |
| **Coluna SW** | Emojis 💰💸⛽🔥⚫ | ⏳ Manter ou alterar? |

### 🤔 A Discutir com Usuário

1. **Manter emojis na coluna SW?**
   - Alternativa: ícones SVG ou badges coloridos

2. **Comportamento dos marcadores**
   - Manter níveis 1/2/3?
   - Manter cores azul/amarelo/vermelho?

3. **Edição inline vs Modal**
   - Manter edição direta nas células?
   - Ou abrir modal para editar?

---

## 📋 Sequência de Implementação

### FASE 1: Base de Dados (CRÍTICA) ✅ CONCLUÍDA
> Sem isso, nada funciona

- [x] **1.1** Garantir `id_princ` presente em cada linha
- [x] **1.2** Adicionar colunas `state_*` (marcadores): `state_loc`, `state_dt_envio`, `state_dt_denvio`, `state_dt_pago`
- [x] **1.3** Adicionar status calculados: `dt_guy_pago__status`, `dt_guy_dpago__status`, `dt_dpago__status`, `delivery_status`

### FASE 2: Seleção e Contexto ✅ CONCLUÍDA
> Permite ações básicas

- [x] **2.1** Implementar seleção de linha com `id_princ` (já existia no DataGrid)
- [x] **2.2** Armazenar `id_princ` selecionado em estado (`selectedInspection`)
- [x] **2.3** Passar `id_princ` para componentes de ação (ActionCenter recebe `inspection`)

### FASE 3: Central de Ações (Drawer) ✅ CONCLUÍDA
> Ações principais do sistema

- [x] **3.1** Criar drawer lateral de ações (já existia o ActionCenter)
- [x] **3.2** Implementar ação "Encaminhar"
  - [x] Dropdown com usuários (`/api/lookups/users`)
  - [x] API POST `/api/acoes/encaminhar`
  - [x] Recarregar grid (`onRefresh`)
- [x] **3.3** Implementar ação "Excluir"
  - [x] Confirmação no ActionCenter
  - [x] API POST `/api/acoes/excluir` (admin only)
  - [x] Recarregar grid

### FASE 4: Marcadores de Alerta ✅ API PRONTA
> Sistema de priorização visual

- [x] **4.1** Tabela `tempstate` já existe no SQLite
- [x] **4.2** API POST `/api/acoes/marcar` implementada (níveis 0-3)
- [ ] **4.3** Atualizar UI de marcadores no ActionCenter (níveis em vez de boolean)
- [ ] **4.4** Aplicar classes CSS baseadas em state_* (pílulas coloridas)

### FASE 5: Edição Inline ✅ CONCLUÍDA
> Edição rápida de células

- [x] **5.1** Definir campos editáveis (datas, moedas, obs, loc, meta)
- [ ] **5.2** Implementar conversão de entrada (datas, moedas)
- [ ] **5.3** Implementar API PATCH para atualizar campo
- [ ] **5.4** Feedback visual de sucesso/erro

### FASE 6: Cores Condicionais
> Feedback visual de status

- [ ] **6.1** Implementar lógica de status calculados
- [ ] **6.2** Criar classes CSS (gpay-pending, gpay-done, etc.)
- [ ] **6.3** Aplicar classes baseadas em dados

### FASE 7: Colunas Calculadas
> SW e Prazo

- [ ] **7.1** Implementar lógica de cálculo de prazo
- [ ] **7.2** Implementar lógica da coluna SW
- [ ] **7.3** Exibir emojis/ícones baseados no status

### FASE 8: Ordenação Avançada ✅ CONCLUÍDA
> 3 modos de ordenação

- [x] **8.1** Implementar ordenação "normal" (padrão) - Backend já tinha
- [x] **8.2** Implementar ordenação "player" - Backend já tinha
- [x] **8.3** Implementar ordenação "prazo" - Backend já tinha
- [x] **8.4** Toggle "Player" no TopBar conectado ao fetchInspections

### FASE 9: Grupos de Colunas ✅ JÁ IMPLEMENTADO
> Controle de visibilidade

- [x] **9.1** Checkboxes de grupos (Workflow, Recebíveis, Pagamentos) - Já existiam no TopBar
- [x] **9.2** Lógica de show/hide por grupo - Já implementada no DataGrid
- [x] **9.3** Larguras fixas (sem reflow) - Implementado anteriormente

### FASE 10: Filtros ✅ CONCLUÍDA
> Refinamento de visualização

- [x] **10.1** Implementar filtro "My Job" - Backend recebe my_job_user_id
- [x] **10.2** Implementar toggle "DB Limit" - Frontend passa limit=800 quando ativado
- [x] **10.3** Integrar com estado do grid - useQuery usa fetchOptions

---

## ✅ Checklist de Migração

### Dados Básicos
- [x] Query principal com JOINs
- [x] Formatação de datas (DD/MM)
- [x] Exibição de Player, Segurado, Guilty, Guy
- [x] Exibição de Atividade
- [x] Exibição de Observação
- [x] Coluna id_princ (presente para ações)
- [x] Colunas state_* (marcadores)
- [x] Status calculados (*__status)

### Interações
- [x] Seleção de linha
- [x] Hover com botões de ação
- [x] Drawer de ações (ActionCenter)
- [x] Encaminhar inspeção (API /api/acoes/encaminhar)
- [x] Excluir inspeção (API /api/acoes/excluir)
- [x] Marcadores de alerta (API /api/acoes/marcar)

### Edição
- [x] Edição inline de datas (EditableCell)
- [x] Edição inline de valores (EditableCell)
- [ ] Edição inline de campos texto
- [ ] Conversão de formatos

### Visual
- [ ] Cores de pagamento (verde/vermelho)
- [ ] Pílulas de marcadores
- [ ] Destaque de entrega
- [ ] Coluna SW com emojis
- [ ] Row striping (zebra)

### Controles
- [ ] Ordenação normal
- [ ] Ordenação player
- [ ] Ordenação prazo
- [ ] Grupos de colunas
- [ ] Filtro My Job
- [ ] DB Limit

### Extras
- [ ] Express Totals (painel financeiro)
- [ ] Reload manual
- [ ] Mensagens de status

---

## 📚 Referências de Código (x_main)

| Funcionalidade | Arquivo | Função/Classe |
|----------------|---------|---------------|
| Query principal | `services/db/grid.py` | `load_sqlite_raw()` |
| Ordenação | `services/db/grid.py` | `get_order_by_clause()` |
| Permissões | `services/db/grid.py` | `fetch_permissoes_cols()` |
| Marcadores | `services/db/markers.py` | `save_marker_state()` |
| Formatação | `utils.py` | `prep_display()` |
| Metadados | `column_metadata.py` | `COLUMN_METADATA` |
| Callbacks grid | `app/callbacks/grid.py` | `register_grid_callbacks()` |
| Callbacks ações | `app/callbacks/actions/` | `register_action_callbacks()` |
| Helpers | `app/callbacks/helpers.py` | `process_edited_value()` |
| CSS cores | `assets/css/grid_colors.css` | Classes mark_*, gpay-* |
| CSS tema | `assets/css/theme.css` | Variáveis CSS |

---

*Última atualização: 22/12/2024*
*Projeto: xFinance 3.0 - Migração React + FastAPI*

