# xFinance Dashboard - Diretrizes de Design UI/UX

## Abordagem de Design
**Design System Approach**: Interface de produtividade/dashboard focada em dados (inspiration: Linear, Notion, Asana) com estética dark moderna e profissional.

## Princípios Fundamentais
- **Consistência Visual**: Linguagem unificada em todos os componentes
- **Hierarquia Clara**: Primário/Secundário/Terciário bem definidos
- **Legibilidade**: Prioridade máxima, especialmente em dark theme
- **Produtividade**: Reduzir ruído visual, focar em eficiência
- **Coesão**: Interface integrada, não fragmentada

## Sistema de Cores (Tokens)
```
bg_primary: #0A0A1F
bg_secondary: #1A1A3A
surface_card: #232347
surface_card_glass: rgba(26, 26, 58, 0.85)
dark_text: #E0E0FF
primary: #CE62D9
secondary: #5B21B6
success: #34D399
warning: #F59E0B
danger: #EF4444
accent_cyan: #00BCD4
```

## Tipografia
- **Fonte**: System-ui, fontes web padrão
- **Hierarquia**:
  - Títulos principais: 16-18px, bold
  - Subtítulos/Labels: 14px, semi-bold
  - Corpo de texto: 14px, regular
  - Texto secundário: 12-13px, regular

## Sistema de Espaçamento (Tailwind Units)
- **Espaçamentos principais**: 8px (2), 12px (3), 16px (4), 24px (6), 32px (8)
- **Padding de componentes**: 12-16px
- **Gaps entre elementos**: 8-12px
- **Margens de seção**: 16-24px

## Layout e Estrutura

### Top Bar/Toolbar (Prioridade Máxima)
**Objetivo**: Transformar em barra coesa e elegante (não fragmentada)

**Estrutura em 3 seções**:
1. **Esquerda**: Logo + Painel de Boas-vindas (nome, data/hora, clima) - compacto
2. **Centro**: Filtros (Player/MyJob/DB Limit) + Grupos de Colunas - agrupados logicamente
3. **Direita**: Ações principais (Buscar/Novo) + Atalhos admin (icon buttons) + Logout + KPIs Express

**Especificações**:
- Altura: ~90-120px
- Background: surface_card (#232347)
- Border radius: 12px
- Margin: 5px 10px
- Padding: 16px horizontal
- Divisores: linhas verticais rgba(255,255,255,0.1), 1px width

**Hierarquia de Botões**:
- **Primário** (🔍 Buscar): Destaque visual, primary color
- **Secundário** (➕ Novo): Ação importante, secondary styling
- **Terciário** (Admin): Icon buttons, menor peso visual
- **Logout**: Estilo distinto (danger hints)

### Área do Grid
**Header do Grid** (adicionar acima do AG Grid):
- Título do painel: "Operações / Inspeções" (16px, bold)
- Mini-resumo: "Linhas: X | Atualizado: HH:MM" (14px, muted)
- Espaço para ações contextuais (placeholder discreto)

**Container do Grid**:
- Background: surface_card
- Padding: 16px
- Border: 1px solid rgba(255,255,255,0.1)
- Border radius: 10px
- Box shadow: sutil (0 4px 12px rgba(0,0,0,0.3))
- AG Grid tema: ag-theme-alpine-dark
- Row height: 28px
- Rows per page: 50

### Modais (Padronização)
**Estrutura consistente**:
- **Header**: Título (16px, bold) + Botão fechar (X icon)
- **Body**: Grid de formulário (2 colunas desktop, 1 mobile), gap 16px
- **Footer**: Botões alinhados à direita (Cancelar + Confirmar)

**Estilo**:
- Background: surface_card_glass
- Border radius: 14px
- Padding: 24px
- Max-width: 600-800px (dependendo do modal)
- Backdrop: rgba(0,0,0,0.7) blur(4px)
- Estado inicial: display none

### Status e Toasts
**Status Messages**:
- Estilo de alert com classes (success/error/info/warning)
- Border-left: 4px solid (cor do tipo)
- Padding: 12px 16px
- Border radius: 8px

**Toast Container**:
- Position: fixed, top-right
- Z-index: 9999
- Animação: slide-in/fade-out CSS
- Gap entre toasts: 12px

## Componentes Específicos

### Painéis da Toolbar
**Welcome Panel**:
- Width: 200-300px
- Height: 90px
- Display: flex column, gap 8px
- Justify: center

**KPIs Express Panel**:
- Min-width: 340px
- Estrutura hierárquica: Total EXPRESS → Honorários/GHonorários → Despesas/GDespesas
- Cores diferenciadas por categoria (success, danger, warning)

**Filtros/Checkboxes**:
- Width: 130px cada
- Gap vertical: 6px
- Labels: 14px, weight 600

### Botões (Design System)
**Classes**:
- `.toolbar-button`: Base style
- `.toolbar-button--primary`: Background primary, hover intenso
- `.toolbar-button--secondary`: Background secondary, hover suave
- `.toolbar-button--tertiary`: Background transparente, border
- `.toolbar-button--logout`: Danger hints
- `.toolbar-button--new`: Destaque especial para ação de criar

**Especificações**:
- Height: 36-40px
- Padding: 8px 16px
- Border radius: 8px
- Font: 14px, weight 600
- Transition: all 0.2s ease

## Responsividade
**Breakpoints**:
- Desktop: >1200px - Layout completo
- Tablet: 768-1200px - Toolbar em 2 linhas se necessário
- Mobile: <768px - Stack vertical, colapsar grupos

## Glass Effect (Uso Parcimônico)
- Aplicar APENAS em surface_card_glass
- Backdrop-filter: blur(10px)
- Opacity: 0.85
- Usar com moderação para não poluir

## Animações (Minimalistas)
- Transições de botões: 0.2s ease
- Modal open/close: fade + scale (0.3s)
- Toast entrada/saída: slide + fade (0.25s)
- Hover states: sutis, sem distrações

## Acessibilidade
- Contraste mínimo 4.5:1 para textos
- Focus states visíveis (outline primary color)
- Labels descritivos em todos os inputs
- Keyboard navigation suportado

## Ícones
- Emojis nativos preferidos (🎮, 🎯, 💰, etc.)
- Se necessário: Font Awesome ou Heroicons via CDN
- Nunca gerar SVG custom

## Imagens
**Logo**: `/assets/img/logo_login.png` - height 58px, width auto