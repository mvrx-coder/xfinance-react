# 🎨 Sistema de Cores do Grid - xFinance 3.0

> Documentação completa das regras de cores aplicadas às linhas do DataGrid

---

## 📋 Visão Geral

O grid utiliza **dois sistemas de cores independentes** que atuam em paralelo:

| Sistema | Onde Atua | Arquivo Fonte |
|---------|-----------|---------------|
| **Status da Linha** | Ícone Zap, Player, Segurado | `StatusTooltip.tsx` |
| **Alertas por Campo** | Dots pulsantes em células de data | `alertRules.ts` + `AlertCell.tsx` |

---

## 🎯 Sistema 1: Status da Linha (getStatusInfo)

### Arquivo: `client/src/components/dashboard/StatusTooltip.tsx`

### Elementos Afetados
- ⚡ Ícone Zap (botão de ação)
- 👤 Campo Player
- 🏢 Campo Segurado

> **Nota:** Loc, Guilty e Guy **NÃO** recebem cor de status (usam cor padrão)

### Níveis de Status

| Nível | Nome | Condição | Cor | Classe Tailwind | Hex |
|-------|------|----------|-----|-----------------|-----|
| 1 | Concluída | `dtPago ✅ E (dtDpago ✅ OU despesa = 0)` | 💜 Magenta | `text-primary` | `#CE62D9` |
| 2 | Aguardando Pagamento | `dtEnvio ✅ E dtPago ❌` | 🔴 Vermelho | `text-red-500` | `#EF4444` |
| 3 | Aguardando Cobrança | `dtEntregue ✅ E dtEnvio ❌` | 🟢 Verde | `text-success` | `#10B981` |
| 4 | Em Andamento | `dtInspecao ≤ hoje E dtEntregue ❌` | 🟠 Laranja | `text-amber-500` | `#F59E0B` |
| 5 | Pendente | Nenhuma das anteriores | ⚪ Branco | `text-foreground` | `#E0E0FF` |

### Regras de Prioridade

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CONCLUÍDA tem prioridade MÁXIMA                         │
│    Se dtPago + (dtDpago ou despesa=0) → SEMPRE magenta     │
├─────────────────────────────────────────────────────────────┤
│ 2. Cobrado → Vermelho (dtEnvio preenchido, dtPago vazio)   │
├─────────────────────────────────────────────────────────────┤
│ 3. Entregue → Verde (dtEntregue preenchido, dtEnvio vazio) │
├─────────────────────────────────────────────────────────────┤
│ 4. Em andamento → Laranja (dtInspecao ≤ hoje, não entregue)│
├─────────────────────────────────────────────────────────────┤
│ 5. Fallback → Branco/Neutro                                │
└─────────────────────────────────────────────────────────────┘
```

### Ícones por Status (Tooltip)

| Nível | Ícone Lucide | Descrição |
|-------|--------------|-----------|
| 1 | `CheckCircle2` | ✅ Concluído |
| 2 | `Wallet` | 💰 Aguardando pagamento |
| 3 | `Send` | 📤 Enviar cobrança |
| 4 | `Clock` | ⏰ Em confecção |
| 5 | `FileText` | 📄 Apenas agendado |

### Funções Exportadas

```typescript
// Retorna objeto completo com todas as informações
getStatusInfo(row: Inspection): StatusInfo

// Retorna apenas classe de cor (para textos)
getActionColorClass(row: Inspection): string  // ex: "text-primary"

// Retorna cor + borda (para botão de ação)
getActionClasses(row: Inspection): string  // ex: "text-primary border-primary"
```

---

## 🚨 Sistema 2: Alertas por Campo (alertRules)

### Arquivo: `client/src/components/dashboard/alertRules.ts`

### Tipos de Alerta

```typescript
type AlertLevel = "none" | "warning" | "danger" | "success";
```

### Cores dos Dots Pulsantes

| Nível | Cor | Classe CSS | Hex |
|-------|-----|------------|-----|
| `warning` | 🟠 Laranja | `bg-amber-500` | `#F59E0B` |
| `danger` | 🔴 Vermelho | `bg-red-500` | `#EF4444` |
| `success` | 🟢 Verde | `bg-emerald-500` | `#10B981` |
| `none` | — | Sem dot | — |

---

### Regra 1: `getInspecaoAlert` - Campo Inspeção

**Referência:** Data de inspeção → entrega do laudo

| Condição | Resultado |
|----------|-----------|
| `dtEntregue` preenchido | `none` ✅ Já entregue |
| `dtInspecao` não preenchido | `none` Sem data |
| Atraso 1-14 dias | `warning` 🟠 Dot laranja |
| Atraso > 14 dias | `danger` 🔴 Dot vermelho |

---

### Regra 2: `getAcertoAlert` - Campo Acerto

**Referência:** Data de envio da cobrança → recebimento do pagamento

| Condição | Resultado |
|----------|-----------|
| `honorario ≤ 1` ou `null` | `none` Sem valor relevante |
| `dtPago` preenchido | `none` ✅ Já recebido |
| `dtEnvio` não preenchido | `none` Não enviado |
| Enviado < 15 dias | `none` OK |
| Enviado 15-29 dias | `warning` 🟠 Dot laranja |
| Enviado ≥ 30 dias | `danger` 🔴 Dot vermelho |

---

### Regra 3: `getDEnvioAlert` - Campo DEnvio (Despesas)

**Referência:** Data de envio de despesas → recebimento de despesas

| Condição | Resultado |
|----------|-----------|
| `despesa ≤ 1` ou `null` | `none` Sem valor relevante |
| `dtDpago` preenchido | `none` ✅ Já recebido |
| `dtDenvio` não preenchido | `none` Não enviado |
| Enviado < 15 dias | `none` OK |
| Enviado 15-29 dias | `warning` 🟠 Dot laranja |
| Enviado ≥ 30 dias | `danger` 🔴 Dot vermelho |

---

### Regra 4: `getGPagoAlert` - Campo GPago (Pagamento ao Guy)

**Referência:** Data de entrega → pagamento ao inspetor (Guy)

| Condição | Resultado |
|----------|-----------|
| `guyHonorario ≤ 1` ou `null` | `none` Sem valor relevante |
| `dtGuyPago` preenchido | `success` 🟢 Dot verde |
| `dtEntregue` não preenchido | `none` Não entregue |
| Entregue < 15 dias | `none` OK |
| Entregue 15-29 dias | `warning` 🟠 Dot laranja |
| Entregue ≥ 30 dias | `danger` 🔴 Dot vermelho |

---

### Regra 5: `getGDPagoAlert` - Campo GDPago (Despesas ao Guy)

**Referência:** Data de entrega → pagamento de despesas ao inspetor (Guy)

| Condição | Resultado |
|----------|-----------|
| `guyDespesa ≤ 1` ou `null` | `none` Sem valor relevante |
| `dtGuyDpago` preenchido | `success` 🟢 Dot verde |
| `dtEntregue` não preenchido | `none` Não entregue |
| Entregue < 15 dias | `none` OK |
| Entregue 15-29 dias | `warning` 🟠 Dot laranja |
| Entregue ≥ 30 dias | `danger` 🔴 Dot vermelho |

---

## 📊 Resumo Visual: Intervalos de Tempo

```
┌────────────────────────────────────────────────────────────┐
│                    INSPEÇÃO (getInspecaoAlert)             │
│  ═══════════════════════════════════════════════════════   │
│  0 dias        1-14 dias        > 14 dias                  │
│  [  none  ]    [ warning 🟠 ]   [ danger 🔴 ]              │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  ACERTO / DENVIO / GPAGO / GDPAGO (envio → pagamento)      │
│  ═══════════════════════════════════════════════════════   │
│  0-14 dias     15-29 dias       ≥ 30 dias                  │
│  [  none  ]    [ warning 🟠 ]   [ danger 🔴 ]              │
└────────────────────────────────────────────────────────────┘
```

---

## 🔧 Componente AlertCell

### Arquivo: `client/src/components/dashboard/AlertCell.tsx`

### Responsabilidades
1. Renderiza valor da célula
2. Exibe dot pulsante baseado no `alertLevel`
3. Permite edição inline (duplo clique)

### Props

```typescript
interface AlertCellProps {
  value: string | null | undefined;    // Valor original
  displayValue: string;                 // Valor formatado para exibição
  alertLevel: AlertLevel;               // none | warning | danger | success
  field: string;                        // Nome do campo no banco
  idPrinc: number;                      // ID da inspeção
  type?: "text" | "date" | "currency";  // Tipo de input para edição
  className?: string;                   // Classes adicionais
  onSave?: Function;                    // Callback de salvamento
}
```

### Estilos dos Dots

```css
/* Warning - Laranja */
bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse

/* Danger - Vermelho */
bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse

/* Success - Verde */
bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse
```

---

## 📁 Arquivos Relacionados

| Arquivo | Função |
|---------|--------|
| `StatusTooltip.tsx` | Lógica de status da linha + tooltip de legenda |
| `alertRules.ts` | Funções de cálculo de alerta por campo |
| `AlertCell.tsx` | Componente de célula com dot pulsante |
| `DataGrid.tsx` | Integração e aplicação das regras |

---

## 🎯 Uso no DataGrid

### Status da Linha (Ícone + Player + Segurado)

```tsx
import { getActionColorClass, getStatusActionClasses } from "./StatusTooltip";

// Para textos (Player, Segurado)
const statusColor = getActionColorClass(row);
<TableCell className={statusColor}>...</TableCell>

// Para botão de ação (Ícone Zap)
<button className={getStatusActionClasses(row)}>
  <Zap />
</button>
```

### Alertas por Campo (Dots)

```tsx
import { getInspecaoAlert, getAcertoAlert } from "./alertRules";

<AlertCell
  value={row.dtInspecao}
  displayValue={formatDate(row.dtInspecao)}
  alertLevel={getInspecaoAlert(row.dtInspecao, row.dtEntregue)}
  field="dt_inspecao"
  idPrinc={row.idPrinc}
/>
```

---

*Última atualização: 25/12/2024*
*Projeto: xFinance 3.0 - Migração React + FastAPI*

