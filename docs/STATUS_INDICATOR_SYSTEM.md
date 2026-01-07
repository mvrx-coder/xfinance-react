# Sistema de Indicadores de Status - xFinance 3.0

## Visao Geral

O sistema de indicadores de status foi implementado para fornecer feedback visual imediato sobre o estado de cada inspecao no DataGrid. Utiliza um sistema de **6 niveis de cores** com prioridade hierarquica, onde cada cor representa um estagio especifico do fluxo de trabalho.

---

## Arquitetura

### Arquivos Envolvidos

| Arquivo | Funcao |
|---------|--------|
| `client/src/components/dashboard/StatusTooltip.tsx` | Componente principal com logica de cores e tooltip |
| `client/src/components/dashboard/DataGrid.tsx` | Grid que utiliza o sistema de cores |
| `backend/services/queries/grid.py` | Logica de ordenacao por grupos de workflow |

### Funcoes Exportadas

```typescript
getStatusInfo(row: Inspection): StatusInfo    // Retorna informacoes completas do status
getActionColorClass(row: Inspection): string  // Retorna classe Tailwind para cor
StatusLegendTooltip({ children })             // Componente tooltip com legenda
```

---

## Sistema de Cores (Hierarquia de Prioridade)

### Nivel 1 - Concluida (Magenta/Lilas Vibrante)

| Propriedade | Valor |
|-------------|-------|
| **Cor Principal** | `#CE62D9` |
| **Background** | `rgba(206, 98, 217, 0.15)` |
| **Borda** | `rgba(206, 98, 217, 0.4)` |
| **Icone** | `CheckCircle2` (Lucide) |
| **Titulo** | "Concluido!!" |
| **Descricao** | "Tudo quitado" |
| **Classe Tailwind** | `text-primary` |

**Condicao Logica (DEFINITIVA):**
```typescript
dtPago preenchido
E NAO tem pendencias:
  - (despesa === 0 OU dtDpago preenchido)
  - E (guyHonorario === 0 OU dtGuyPago preenchido)
  - E (guyDespesa === 0 OU dtGuyDpago preenchido)
```

---

### Nivel 0 - Pre-Final (Lilas Claro) - NOVO!

| Propriedade | Valor |
|-------------|-------|
| **Cor Principal** | `#A78BFA` |
| **Background** | `rgba(167, 139, 250, 0.15)` |
| **Borda** | `rgba(167, 139, 250, 0.4)` |
| **Icone** | `CircleDot` (Lucide) |
| **Titulo** | "Pre-Final" |
| **Descricao** | "Falta guy ou despesas" |
| **Classe Tailwind** | `text-violet-400` |

**Condicao Logica:**
```typescript
dtPago preenchido
E tem pendencias:
  - (despesa > 0 E dtDpago NAO preenchido)
  - OU (guyHonorario > 0 E dtGuyPago NAO preenchido)
  - OU (guyDespesa > 0 E dtGuyDpago NAO preenchido)
```

---

### Nivel 2 - Aguardando Pagamento (Vermelho)

| Propriedade | Valor |
|-------------|-------|
| **Cor Principal** | `#EF4444` |
| **Background** | `rgba(239, 68, 68, 0.15)` |
| **Borda** | `rgba(239, 68, 68, 0.4)` |
| **Icone** | `Wallet` (Lucide) |
| **Titulo** | "Aguardando Pagamento" |
| **Descricao** | "Cobranca enviada" |
| **Classe Tailwind** | `text-red-500` |

**Condicao Logica:**
```typescript
dtEnvio preenchido E dtPago NAO preenchido
```

---

### Nivel 3 - Aguardando Cobranca (Verde)

| Propriedade | Valor |
|-------------|-------|
| **Cor Principal** | `#10B981` |
| **Background** | `rgba(16, 185, 129, 0.15)` |
| **Borda** | `rgba(16, 185, 129, 0.4)` |
| **Icone** | `Send` (Lucide) |
| **Titulo** | "Enviar Cobranca" |
| **Descricao** | "Laudo entregue" |
| **Classe Tailwind** | `text-emerald-500` |

**Condicao Logica:**
```typescript
dtEntregue preenchido E dtEnvio NAO preenchido
```

---

### Nivel 4 - Em Andamento (Laranja)

| Propriedade | Valor |
|-------------|-------|
| **Cor Principal** | `#F59E0B` |
| **Background** | `rgba(245, 158, 11, 0.15)` |
| **Borda** | `rgba(245, 158, 11, 0.4)` |
| **Icone** | `Clock` (Lucide) |
| **Titulo** | "Em Confeccao" |
| **Descricao** | "Aguardando entrega" |
| **Classe Tailwind** | `text-amber-500` |

**Condicao Logica:**
```typescript
dtInspecao <= hoje E dtEntregue NAO preenchido
```

---

### Nivel 5 - Pendente (Cinza)

| Propriedade | Valor |
|-------------|-------|
| **Cor Principal** | `#E0E0FF` |
| **Background** | `rgba(224, 224, 255, 0.10)` |
| **Borda** | `rgba(255, 255, 255, 0.2)` |
| **Icone** | `FileText` (Lucide) |
| **Titulo** | "Apenas agendado" |
| **Descricao** | "Nada ainda realizado" |
| **Classe Tailwind** | `text-foreground` |

**Condicao Logica:**
```typescript
Nenhuma das condicoes anteriores atendida (fallback)
// Geralmente: dtInspecao > hoje (agendado para futuro)
```

---

## Sistema de Ordenacao do Grid

### Grupos de Workflow (ORDER BY)

O grid e ordenado por grupos de workflow, cada um com sua propria logica de ordenacao interna:

| Grupo | Condicao SQL | Ordenacao Interna | Cor Visual |
|-------|--------------|-------------------|------------|
| **0** | `ms = 1` (Missao Suspensa) | `dt_inspecao DESC` | - |
| **1** | `dt_envio IS NULL AND dt_pago IS NULL` | `prazo DESC` | Laranja/Cinza |
| **2** | `dt_envio IS NOT NULL AND dt_pago IS NULL` | `prazo DESC` | Vermelho |
| **3** | `dt_pago IS NOT NULL` + pendencias | `dt_pago DESC` | Lilas Claro |
| **4** | `dt_pago IS NOT NULL` + sem pendencias | `dt_pago DESC` | Lilas Vibrante |

### Logica de Pendencias (Grupo 3 vs 4)

```sql
-- Grupo 3: Pre-Final (tem pendencias)
WHEN p.dt_pago IS NOT NULL AND (
    (COALESCE(p.despesa, 0) > 0 AND p.dt_dpago IS NULL)
    OR (COALESCE(p.guy_honorario, 0) > 0 AND p.dt_guy_pago IS NULL)
    OR (COALESCE(p.guy_despesa, 0) > 0 AND p.dt_guy_dpago IS NULL)
) THEN 3

-- Grupo 4: Definitivamente Concluido
WHEN p.dt_pago IS NOT NULL THEN 4
```

### Detalhamento da Ordenacao

#### Grupo 1 - Em Andamento/Agendado

- **Ordenacao:** `prazo DESC` (maior prazo primeiro)
- **Logica:** Inspecoes mais antigas = maior prazo decorrido = mais urgentes
- **Campo prazo:** Calculado como `hoje - dt_inspecao` para este grupo
- **Efeito:** Naturalmente separa "Em Confeccao" (laranja) de "Apenas Agendado" (cinza)

#### Grupo 2 - Vermelho (Cobranca)

- **Ordenacao:** `prazo DESC` (maior tempo de cobranca primeiro)
- **Logica:** Cobrancas mais antigas aparecem primeiro
- **Campo prazo:** Calculado como `hoje - dt_envio` para este grupo

#### Grupo 3 - Pre-Final

- **Ordenacao:** `dt_pago DESC` (pagamento mais recente primeiro)
- **Logica:** Precisa acompanhar para quitar guy/despesas

#### Grupo 4 - Definitivamente Concluido

- **Ordenacao:** `dt_pago DESC` (pagamento mais recente primeiro)
- **Logica:** Pode "esquecer" - esta 100% finalizado

---

## Calculo do Campo Prazo

O campo `prazo` tem significados diferentes conforme o estagio:

| Estagio | Calculo do Prazo | Gravacao |
|---------|------------------|----------|
| **Em andamento** | `hoje - dt_inspecao` | Dinamico (nao grava) |
| **Cobranca** | `hoje - dt_envio` | Dinamico (nao grava) |
| **Finalizado** | `dt_entregue - dt_inspecao` | Fixo (grava no DB) |

```typescript
// Regra de gravacao:
// Se dt_pago E dt_entregue preenchidos → grava prazo no banco
if (has_pago && has_entregue) {
    prazo = dt_entregue - dt_inspecao;
    GRAVA_NO_BANCO(prazo);
}
```

---

## Tooltip de Legenda

### Ordem de Exibicao

```
1. [✓] Concluido!!         - Tudo quitado
2. [◎] Pre-Final           - Falta guy ou despesas
3. [$] Aguardando Pagamento - Cobranca enviada
4. [→] Aguardando Cobranca  - Laudo entregue
5. [⏱] Em Confeccao        - Aguardando entrega
6. [📄] Apenas Agendado    - Nada ainda realizado
```

### Estrutura Visual

```
┌─────────────────────────────────────┐
│  LEGENDA DE STATUS                  │
├─────────────────────────────────────┤
│  [✓] Concluido!!                    │  <- Lilas Vibrante
│      Tudo quitado                   │
│                                     │
│  [◎] Pre-Final                      │  <- Lilas Claro (NOVO!)
│      Falta guy ou despesas          │
│                                     │
│  [$] Aguardando Pagamento           │  <- Vermelho
│      Cobranca enviada               │
│                                     │
│  [→] Aguardando Cobranca            │  <- Verde
│      Laudo entregue                 │
│                                     │
│  [⏱] Em Confeccao                   │  <- Laranja
│      Aguardando entrega             │
│                                     │
│  [📄] Apenas Agendado               │  <- Cinza
│      Nada ainda realizado           │
└─────────────────────────────────────┘
```

---

## Fluxo de Estados Visual

```
                                                        ┌─────────────┐
                                                        │ Pre-Final   │
                                                        │ (Lilas Claro)│
                                                        └──────┬──────┘
                                                               │ guy/despesas
                                                               ▼
[Pendente] ──► [Em Andamento] ──► [Aguardando] ──► [Aguardando] ──► [Concluida]
   (5)              (4)           Cobranca (3)    Pagamento (2)        (1)
  Cinza           Laranja           Verde          Vermelho      Lilas Vibrante
```

---

## Classes Dinamicas por Status

| Status | Level | Classe Tailwind | Cor Hex |
|--------|-------|-----------------|---------|
| Concluida | 1 | `text-primary` | #CE62D9 |
| Pre-Final | 0 | `text-violet-400` | #A78BFA |
| Aguardando Pagamento | 2 | `text-red-500` | #EF4444 |
| Aguardando Cobranca | 3 | `text-emerald-500` | #10B981 |
| Em Andamento | 4 | `text-amber-500` | #F59E0B |
| Pendente | 5 | `text-foreground` | #E0E0FF |

---

## Logica de Validacao

### Funcao `isFilled`

```typescript
function isFilled(v: string | null | undefined): boolean {
  const s = (v || "").trim();
  return s !== "" && s !== "-";
}
```

### Funcao `hasValue`

```typescript
function hasValue(v: number | null | undefined): boolean {
  return typeof v === "number" && v > 0;
}
```

### Verificacao de Pendencias

```typescript
const despesaPendente = hasValue(row.despesa) && !isFilled(row.dtDpago);
const guyHonorarioPendente = hasValue(row.guyHonorario) && !isFilled(row.dtGuyPago);
const guyDespesaPendente = hasValue(row.guyDespesa) && !isFilled(row.dtGuyDpago);

const temPendencias = despesaPendente || guyHonorarioPendente || guyDespesaPendente;
```

---

## Consideracoes de UX

1. **Hierarquia Visual:** Cores quentes (vermelho, laranja) indicam acoes pendentes do usuario
2. **Feedback Imediato:** Hover no header revela toda a legenda sem poluir a interface
3. **Consistencia:** Mesmas cores usadas no tooltip e nos icones das linhas
4. **Acessibilidade:** Cores distintas com contraste suficiente no tema escuro
5. **Performance:** Tooltip unico no header vs. tooltip por linha reduz carga de componentes
6. **Diferenciacao Clara:** Pre-Final (lilas claro) vs Concluida (lilas vibrante) permite acompanhamento

---

## Dependencias

| Pacote | Versao | Uso |
|--------|--------|-----|
| `framer-motion` | ^11.x | Animacoes do tooltip |
| `lucide-react` | ^0.x | Icones (Zap, CheckCircle2, CircleDot, Clock, etc.) |

---

## Historico de Versoes

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2025-12-25 | 1.0 | Implementacao inicial com tooltip por linha |
| 2025-12-25 | 1.1 | Refatoracao para tooltip unico no header com legenda completa |
| 2025-12-27 | 2.0 | **MAJOR:** Novo status Pre-Final, nova logica de ordenacao por grupos, consideracao de guy/despesas para status Concluida |

---

*Ultima atualizacao: 2025-12-27*
*Versao: 2.0*
