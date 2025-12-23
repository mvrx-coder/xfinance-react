# 📊 Grid Principal - xFinance 3.0

> Regras e padrões do DataGrid

---

## Tecnologias

| Aspecto | Tecnologia |
|---------|------------|
| Base | shadcn/ui Table |
| Filtros/Ordenação | TanStack Table (headless) |
| Edição inline | Componentes customizados |
| Alertas visuais | AlertCell + alertRules |

---

## Estrutura de Arquivos

```
client/src/components/dashboard/
├── DataGrid.tsx        # Grid principal
├── EditableCell.tsx    # Edição inline (duplo clique)
├── AlertCell.tsx       # Células com indicadores visuais
├── alertRules.ts       # Regras de cores condicionais
├── ColumnFilter.tsx    # Popover de filtro
└── ActionCenter.tsx    # Central de ações (lateral)
```

---

## Grupos de Colunas

| Grupo | Colunas | Cor do Header |
|-------|---------|---------------|
| Ação | # | Primary (lilás) |
| Identificação | Player, Segurado, Loc, Guilty, Guy, Meta | Muted |
| Workflow | Inspeção, Entregue, Prazo | Accent (ciano) |
| Recebíveis | Acerto, Envio, Pago, Honorários | Success (verde) |
| Despesas | DEnvio, DPago, Despesas | Emerald |
| Pagamentos | GPago, GHonorários, GDPago, GDespesas | Warning (âmbar) |
| Contexto | Atividade, Observação, Ações | Muted |

---

## Regras de Cores (AlertCell)

### Coluna Inspeção
| Condição | Cor | Visual |
|----------|-----|--------|
| Entregue preenchido | Verde | `border-bottom` verde |
| 1-14 dias até inspeção | Laranja | Dot pulsante + `border-bottom` laranja |
| >14 dias ou vazio | Vermelho | Dot pulsante + `border-bottom` vermelho |

### Coluna Acerto
| Condição | Cor |
|----------|-----|
| Pago preenchido | Verde |
| Envio preenchido, Pago vazio | Vermelho |
| Ambos vazios | Sem marcação |

### Coluna DEnvio
| Condição | Cor |
|----------|-----|
| DPago preenchido | Verde |
| DEnvio preenchido, DPago vazio | Vermelho |
| Ambos vazios | Sem marcação |

### Colunas GPago e GDPago
| Condição | Cor |
|----------|-----|
| Campo preenchido | Verde |
| Entregue preenchido, campo vazio | Vermelho |
| Entregue vazio | Sem marcação |

---

## Edição Inline

### Ativação
- **Duplo clique** na célula (não clique simples)

### Tipos de Edição
| Tipo | Campo | Comportamento |
|------|-------|---------------|
| `date` | Datas | Input texto, formato DD/MM |
| `currency` | Valores R$ | Input texto, alinhado à direita |
| `text` | Observação | Input texto livre |

### Controles
- **Enter** = Salvar
- **Escape** = Cancelar
- Botões flutuantes acima do input (✓ e ✗)

---

## Filtros por Coluna

### Ativação
- **Clique no título** da coluna

### Popover
- Campo de texto para filtrar
- Botões A-Z / Z-A para ordenar
- Botão "Limpar tudo"
- Indicador visual: dot lilás pulsante quando ativo

### Limpar Todos os Filtros
- Botão no footer do grid quando há filtros ativos

---

## Paginação

- 50 linhas por página
- Navegação: Primeira, Anterior, Números, Próxima, Última
- Exibe: "Mostrando X - Y de Z (filtrado de N)"

---

## Hook useDataGrid

```typescript
import { useDataGrid } from "@/hooks/useDataGrid";

const {
  table,           // Instância TanStack Table
  sorting,         // Estado de ordenação
  columnFilters,   // Filtros ativos
  clearAllFilters, // Limpar todos
  hasActiveFilters // Boolean
} = useDataGrid({ data, pageSize: 50 });
```

---

## Componentes

### EditableCell
```tsx
<EditableCell
  value={row.obs}
  displayValue={row.obs || "-"}
  field="obs"
  idPrinc={row.idPrinc}
  type="text"
  onSave={handleCellEdit}
/>
```

### AlertCell
```tsx
<AlertCell
  value={row.dtInspecao}
  displayValue={formatDate(row.dtInspecao)}
  alertLevel={getInspecaoAlert(row.dtInspecao, row.dtEntregue)}
  field="dt_inspecao"
  idPrinc={row.idPrinc}
  type="date"
  onSave={handleCellEdit}
/>
```

---

## Formatação de Dados

```typescript
// Moeda
formatCurrency(value) // R$ 1.234

// Data (do backend yyyy-mm-dd para dd/mm/yy)
formatDate(dateStr) // 23/12/24

// Meta
getMetaLabel(meta) // "Sim" / "Não" / "-"
```

---

## Performance

- Skeleton loading enquanto carrega
- Virtualização não necessária (<5000 linhas)
- Hot-reload via TanStack Query

---

*Arquivo principal: `client/src/components/dashboard/DataGrid.tsx`*

