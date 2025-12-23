# 🔤 Esquema de Fontes - xFinance 3.0

> Sistema tipográfico otimizado para dados financeiros

---

## Fontes Configuradas

| Uso | Fonte | Características |
|-----|-------|-----------------|
| **Interface geral** | Inter | Variable font, 100-900, sans-serif |
| **Valores financeiros** | JetBrains Mono | Tabular nums, zero cortado, monospace |
| **Títulos/Display** | Outfit | Tracking negativo, display |

---

## Variáveis CSS

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-display: 'Outfit', 'Inter', sans-serif;
  
  /* Tamanhos */
  --text-grid: 12px;
  --text-grid-header: 11px;
  --text-kpi-value: 28px;
  --text-kpi-label: 10px;
}
```

---

## Classes Utilitárias

### Para Valores Monetários
```tsx
<span className="currency-value">R$ 1.234,00</span>
```
```css
.currency-value {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: 'tnum' 1, 'lnum' 1, 'zero' 1;
}
```

### Para Datas
```tsx
<span className="date-value">23/12/24</span>
```

### Para Números Alinhados
```tsx
<span className="tabular-nums">1.234</span>
```

### Para KPIs
```tsx
<div>
  <span className="kpi-value">R$ 45.678</span>
  <span className="kpi-label">TOTAL HONORÁRIOS</span>
</div>
```

---

## Classes Disponíveis

| Classe | Uso | Exemplo |
|--------|-----|---------|
| `.tabular-nums` | Números alinhados | Prazo, Loc |
| `.currency-value` | Valores R$ | Honorários, Despesas |
| `.date-value` | Datas dd/mm/yy | Inspeção, Entregue |
| `.kpi-value` | Números grandes | KPIs do TopBar |
| `.kpi-label` | Labels de KPI | "HONORÁRIOS" |
| `.font-display` | Títulos | Headers de seção |
| `.font-financial` | Dados financeiros | Tabelas |
| `.data-cell` | Células do grid | DataGrid |
| `.header-cell` | Headers do grid | TableHeader |

---

## Aplicação no Grid

### Colunas com fonte mono (JetBrains):
- Honorários, Despesas, GHonorários, GDespesas
- Todas as datas

### Colunas com tabular-nums (Inter):
- Prazo, Loc
- Qualquer número simples

---

## Por que Inter + JetBrains Mono?

### Inter
- ✅ Projetada para telas
- ✅ Legibilidade em tamanhos pequenos
- ✅ Variable font (um arquivo, todos os pesos)
- ✅ Usada por: Linear, Figma, GitHub, Notion

### JetBrains Mono
- ✅ Tabular nums nativo
- ✅ Zero cortado (0 vs O)
- ✅ Ligaduras elegantes
- ✅ Perfeita para dados financeiros

---

## Carregamento (Google Fonts)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&family=Outfit:wght@100..900&display=swap" rel="stylesheet">
```

---

## Exemplo de Uso

```tsx
// Célula de valor monetário
<TableCell className="currency-value text-success">
  {formatCurrency(row.honorario)}
</TableCell>

// Célula de data
<TableCell className="date-value text-muted-foreground">
  {formatDate(row.dtInspecao)}
</TableCell>

// Número simples
<TableCell className="tabular-nums text-center">
  {row.prazo}
</TableCell>
```

---

*Arquivo: `client/src/index.css` (seção @layer utilities)*

