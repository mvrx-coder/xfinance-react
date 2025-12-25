# Sistema de Indicadores de Status - xFinance 3.0

## Visao Geral

O sistema de indicadores de status foi implementado para fornecer feedback visual imediato sobre o estado de cada inspecao no DataGrid. Utiliza um sistema de 5 niveis de cores com prioridade hierarquica, onde cada cor representa um estagio especifico do fluxo de trabalho.

---

## Arquitetura

### Arquivos Envolvidos

| Arquivo | Funcao |
|---------|--------|
| `client/src/components/dashboard/StatusTooltip.tsx` | Componente principal com logica de cores e tooltip |
| `client/src/components/dashboard/DataGrid.tsx` | Grid que utiliza o sistema de cores |

### Funcoes Exportadas

```typescript
getStatusInfo(row: Inspection): StatusInfo    // Retorna informacoes completas do status
getActionColorClass(row: Inspection): string  // Retorna classe Tailwind para cor
StatusLegendTooltip({ children })             // Componente tooltip com legenda
```

---

## Sistema de Cores (Hierarquia de Prioridade)

### Nivel 1 - Concluida (Magenta)

| Propriedade | Valor |
|-------------|-------|
| **Cor Principal** | `#CE62D9` |
| **Background** | `rgba(206, 98, 217, 0.15)` |
| **Borda** | `rgba(206, 98, 217, 0.4)` |
| **Icone** | `CheckCircle2` (Lucide) |
| **Titulo** | "Concluida" |
| **Descricao** | "Pagamento e despesas finalizados" |
| **Classe Tailwind** | `text-primary` |

**Condicao Logica:**
```typescript
dtPago preenchido E (dtDpago preenchido OU despesa === 0)
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
| **Descricao** | "Fatura enviada" |
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
| **Titulo** | "Aguardando Cobranca" |
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
| **Titulo** | "Em Andamento" |
| **Descricao** | "Aguardando entrega" |
| **Classe Tailwind** | `text-amber-500` |

**Condicao Logica:**
```typescript
dtInspecao >= hoje E dtEntregue NAO preenchido
```

---

### Nivel 5 - Pendente (Cinza)

| Propriedade | Valor |
|-------------|-------|
| **Cor Principal** | `#9CA3AF` |
| **Background** | `rgba(156, 163, 175, 0.15)` |
| **Borda** | `rgba(156, 163, 175, 0.4)` |
| **Icone** | `FileText` (Lucide) |
| **Titulo** | "Pendente" |
| **Descricao** | "Nao realizada" |
| **Classe Tailwind** | `text-foreground` |

**Condicao Logica:**
```typescript
Nenhuma das condicoes anteriores atendida (fallback)
```

---

## Tooltip de Legenda

### Posicionamento

- **Localizacao:** Header da coluna "Acoes" no DataGrid
- **Elemento Trigger:** Icone Sparkles (estrela brilhante)
- **Direcao:** Abre para baixo, centralizado horizontalmente

### Efeitos Visuais

| Efeito | Valor CSS |
|--------|-----------|
| **Backdrop Blur** | `backdrop-blur-xl` |
| **Background** | `rgba(10, 10, 31, 0.98)` |
| **Borda** | `1px solid rgba(206, 98, 217, 0.3)` |
| **Border Radius** | `rounded-xl` (12px) |
| **Sombra** | `shadow-2xl` |
| **Largura Minima** | `240px` |

### Animacao (Framer Motion)

```typescript
// Entrada
initial: { opacity: 0, y: -4, scale: 0.95 }
animate: { opacity: 1, y: 0, scale: 1 }

// Saida
exit: { opacity: 0, y: -4, scale: 0.95 }

// Transicao
transition: { duration: 0.15, ease: "easeOut" }
```

### Estrutura do Tooltip

```
┌─────────────────────────────────────┐
│  LEGENDA DE STATUS                  │  <- Header com borda inferior
├─────────────────────────────────────┤
│  [✓] Concluida                      │
│      Pagamento e despesas...        │
│                                     │
│  [$] Aguardando Pagamento           │
│      Fatura enviada                 │
│                                     │
│  [→] Aguardando Cobranca            │
│      Laudo entregue                 │
│                                     │
│  [⏱] Em Andamento                   │
│      Aguardando entrega             │
│                                     │
│  [📄] Pendente                      │
│      Nao realizada                  │
└─────────────────────────────────────┘
         ▲
    (Seta apontando para cima)
```

### Seta Indicadora

```css
position: absolute
top: -6px
left: 50%
transform: translateX(-50%) rotate(45deg)
width: 12px
height: 12px
background: rgba(10, 10, 31, 0.98)
border-top: 1px solid rgba(206, 98, 217, 0.3)
border-left: 1px solid rgba(206, 98, 217, 0.3)
```

---

## Icone de Acao nas Linhas

### Componente Base

- **Icone:** `Zap` (Lucide - raio)
- **Tamanho:** `w-3.5 h-3.5` (14px x 14px)

### Estilos do Botao

```css
padding: 6px (p-1.5)
border-radius: rounded-md
cursor: pointer
background: transparent

/* Hover */
transform: scale(1.1)
box-shadow: 0 10px 15px -3px rgba(206, 98, 217, 0.2)

/* Transicao */
transition: all 200ms ease
```

### Classes Dinamicas por Status

| Status | Classe Aplicada |
|--------|-----------------|
| Concluida | `text-primary` (#CE62D9) |
| Aguardando Pagamento | `text-red-500` (#EF4444) |
| Aguardando Cobranca | `text-emerald-500` (#10B981) |
| Em Andamento | `text-amber-500` (#F59E0B) |
| Pendente | `text-foreground` (branco/cinza) |

---

## Logica de Validacao

### Funcao `isFilled`

Verifica se um campo de texto esta preenchido:

```typescript
function isFilled(v: string | null | undefined): boolean {
  const s = (v || "").trim();
  return s !== "" && s !== "-";
}
```

### Funcao `isDateValid`

Verifica se uma string representa uma data valida:

```typescript
function isDateValid(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const s = dateStr.trim();
  if (s === "" || s === "-") return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}
```

### Comparacao de Datas

Para verificar se a inspecao esta agendada para hoje ou futuro:

```typescript
const today = new Date();
today.setHours(0, 0, 0, 0);

const dtInsp = new Date(row.dtInspecao);
dtInsp.setHours(0, 0, 0, 0);

const inspecaoFutura = dtInsp >= today;
```

---

## Integracao com DataGrid

### Import

```typescript
import { StatusLegendTooltip, getActionColorClass } from "./StatusTooltip";
```

### Uso no Header

```tsx
<TableHead className="w-[50px] bg-card relative">
  <div className="absolute top-0 left-0 right-0 h-[3px] bg-primary rounded-b-sm" />
  <div className="flex items-center justify-center">
    <StatusLegendTooltip>
      <Sparkles className="w-4 h-4 chromatic-sparkle" />
    </StatusLegendTooltip>
  </div>
</TableHead>
```

### Uso nas Linhas

```tsx
<button
  className={`p-1.5 rounded-md cursor-pointer transition-all duration-200 
              hover:scale-110 bg-transparent hover:shadow-lg 
              hover:shadow-primary/20 ${getActionColorClass(row)}`}
  onClick={() => openActionCenter(row)}
>
  <Zap className="w-3.5 h-3.5" />
</button>
```

---

## Dependencias

| Pacote | Versao | Uso |
|--------|--------|-----|
| `framer-motion` | ^11.x | Animacoes do tooltip |
| `lucide-react` | ^0.x | Icones (Zap, CheckCircle2, Clock, etc.) |

---

## Fluxo de Estados Visual

```
[Pendente] ──► [Em Andamento] ──► [Aguardando Cobranca] ──► [Aguardando Pagamento] ──► [Concluida]
   (5)              (4)                   (3)                       (2)                    (1)
  Cinza           Laranja                Verde                   Vermelho               Magenta
```

---

## Consideracoes de UX

1. **Hierarquia Visual:** Cores quentes (vermelho, laranja) indicam acoes pendentes do usuario
2. **Feedback Imediato:** Hover no header revela toda a legenda sem poluir a interface
3. **Consistencia:** Mesmas cores usadas no tooltip e nos icones das linhas
4. **Acessibilidade:** Cores distintas com contraste suficiente no tema escuro
5. **Performance:** Tooltip unico no header vs. tooltip por linha reduz carga de componentes

---

## Historico de Versoes

| Data | Versao | Alteracao |
|------|--------|-----------|
| 2025-12-25 | 1.0 | Implementacao inicial com tooltip por linha |
| 2025-12-25 | 1.1 | Refatoracao para tooltip unico no header com legenda completa |
