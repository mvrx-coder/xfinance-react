# xFinance 3.0 - Design Brief para Refatoração Estética

> **Contexto:** Sistema de gestão de inspeções técnicas (seguros). Dashboard dark theme premium.
> **Stack:** React + Tailwind CSS + shadcn/ui
> **Liberdade:** Você pode alterar cores e fontes se julgar melhor para UX/estética.

---

## 📐 ESTRUTURA DA TELA PRINCIPAL (Dashboard)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              TOP BAR (64px)                                 │
│  ┌──────┐  ┌─────────────────┐  ┌─────────┐  ┌─────────┐  ┌─────┐  ┌────┐ │
│  │ Logo │  │ KPIs Express    │  │ Buscar  │  │ + Novo  │  │Menus│  │User│ │
│  └──────┘  │ (4 valores $)   │  └─────────┘  └─────────┘  └─────┘  └────┘ │
│            └─────────────────┘                                             │
│  ════════════════════════ BORDA GLOW ANIMADA ════════════════════════════  │
├────────────────────────────────────────────────────────────────────────────┤
│        │                                                                   │
│        │                                                                   │
│  S     │                      DATA GRID                                    │
│  I     │  ┌─────────────────────────────────────────────────────────────┐ │
│  D     │  │ HEADER (grupos de colunas coloridos)                        │ │
│  E     │  ├─────────────────────────────────────────────────────────────┤ │
│  B     │  │ Row 1  │ Status Icon │ Player │ Datas │ Valores │ Ações    │ │
│  A     │  │ Row 2  │ ...         │ ...    │ ...   │ ...     │ ...      │ │
│  R     │  │ Row 3  │ ...         │ ...    │ ...   │ ...     │ ...      │ │
│        │  │ (zebra striping alternado)                                  │ │
│  (200px│  │                                                             │ │
│  colap-│  └─────────────────────────────────────────────────────────────┘ │
│  sável)│                                                                   │
│        │                      PAGINATION                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 DESIGN TOKENS ATUAIS

### Paleta de Cores Base

```css
:root {
  /* Background Principal - Deep Blue */
  --background: hsl(240 51% 8%);        /* #0A0A1F */
  --foreground: hsl(240 100% 94%);      /* #E0E0FF - texto principal */
  
  /* Cards/Surfaces - Glassmorphism */
  --card: hsl(240 34% 21%);             /* #232347 */
  --card-border: hsl(240 30% 28%);
  
  /* Sidebar */
  --sidebar: hsl(240 38% 16%);          /* #1A1A3A */
  
  /* Primary - Lilás/Magenta Vibrante */
  --primary: hsl(295 60% 62%);          /* #CE62D9 */
  
  /* Secondary - Roxo Profundo */
  --secondary: hsl(263 69% 42%);        /* #5B21B6 */
  
  /* Accent - Ciano */
  --accent: hsl(187 100% 42%);          /* #00BCD4 */
  
  /* Status Colors */
  --destructive: hsl(0 84% 60%);        /* #EF4444 - Vermelho */
  --success: hsl(160 67% 52%);          /* #34D399 - Verde Esmeralda */
  --warning: hsl(38 92% 50%);           /* #F59E0B - Âmbar */
  
  /* Muted */
  --muted: hsl(240 34% 18%);
  --muted-foreground: hsl(240 25% 69%); /* #A0A0C0 */
  
  /* Borders */
  --border: hsl(240 38% 20%);
}
```

### Fontes Atuais

```css
:root {
  --font-sans: 'Inter', sans-serif;           /* Interface geral */
  --font-mono: 'JetBrains Mono', monospace;   /* Valores financeiros, datas */
  --font-display: 'Outfit', sans-serif;       /* Títulos (opcional) */
  
  /* Tamanhos */
  --text-grid: 12px;
  --text-grid-header: 11px;
  --text-kpi-value: 28px;
  --text-kpi-label: 10px;
}
```

---

## 🚦 MATRIZ DE CORES DO GRID (Status das Linhas)

O ícone da primeira coluna indica o status do workflow:

| Status | Cor Atual | Hex | Significado |
|--------|-----------|-----|-------------|
| **Concluída** | Lilás Vibrante | `#CE62D9` | Tudo quitado |
| **Pré-Final** | Lilás Claro | `#A78BFA` | Falta pagamento guy/despesas |
| **Aguardando Pagamento** | Vermelho | `#EF4444` | Cobrança enviada |
| **Aguardando Cobrança** | Verde | `#10B981` | Laudo entregue |
| **Em Andamento** | Laranja/Âmbar | `#F59E0B` | Aguardando entrega |
| **Pendente** | Cinza/Ice | `#E0E0FF` | Apenas agendado |

### Grupos de Colunas do Header

| Grupo | Cor do Texto | Colunas |
|-------|--------------|---------|
| Ação | Primary (Lilás) | # (número da linha) |
| Pessoas | Violet-400 | Player, Segurado, Guilty, Guy |
| Workflow | Accent (Ciano) | Inspeção, Entregue, Prazo |
| Recebíveis | Success (Verde) | Acerto, Envio, Pago, Honorários |
| Pagamentos | Warning (Âmbar) | GPago, GHonorários, GDespesas |

---

## ✨ EFEITOS VISUAIS ATUAIS

### Glassmorphism
- Cards com `backdrop-filter: blur(8-12px)`
- Bordas sutis `rgba(255,255,255, 0.08-0.12)`
- Inner glow: `inset 0 1px 0 rgba(255,255,255,0.05)`

### TopBar
- Gradiente horizontal sutil
- Borda inferior com **glow animado** (ciclo de cores: cyan → violet → magenta)

### Grid
- Zebra striping alternado (linhas pares/ímpares)
- Separador a cada 4 linhas (cadência visual)
- Header com gradiente azul-púrpura

---

## 🎯 REQUISITOS DE SAÍDA

Para facilitar integração, por favor retorne:

1. **Variáveis CSS** no formato `:root { --nome: valor; }`
2. **Classes Tailwind** quando possível (ex: `bg-primary`, `text-accent`)
3. **Componentes React** usando sintaxe JSX/TSX
4. Se criar componentes, use **export function NomeComponente()**

### Estrutura Tailwind esperada
```tsx
// Exemplo de estrutura
<div className="bg-background text-foreground">
  <header className="bg-card border-b border-border">
    <span className="text-primary">Título</span>
  </header>
</div>
```

---

## 💡 SUGESTÕES DE MELHORIA (opcional)

Áreas que podem ser aprimoradas:
1. **Contraste** - Alguns textos muted podem ser difíceis de ler
2. **Hierarquia visual** - KPIs vs informação secundária
3. **Consistência** - Variações de lilás (primary vs violet-400)
4. **Modernidade** - Tendências de dark UI 2024/2025

---

## 📎 NOTAS TÉCNICAS

- Framework: React 18 + TypeScript
- Styling: Tailwind CSS v3 + CSS Variables
- UI Library: shadcn/ui (Radix primitives)
- O código gerado será integrado manualmente no projeto existente
- Prefira soluções que usem as variáveis CSS existentes ou proponha novas

---

*Gerado em: Janeiro 2025*
*Projeto: xFinance 3.0*
