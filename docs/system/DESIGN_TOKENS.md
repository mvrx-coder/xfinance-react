# 🎨 Design Tokens - xFinance

Este documento define as cores, espaçamentos e tipografia do sistema xFinance.

**Importante:** Estas cores são as mesmas do xFinance original (Dash) e devem ser mantidas para consistência visual.

---

## 🎨 Paleta de Cores

### Fundos e Superfícies

| Token | Valor | Uso |
|-------|-------|-----|
| `bg_primary` | `#0A0A1F` | Fundo principal da aplicação |
| `bg_secondary` | `#1A1A3A` | Fundo de seções secundárias |
| `surface_card` | `#232347` | Cards e painéis sólidos |
| `surface_card_glass` | `rgba(26, 26, 58, 0.85)` | Cards com glassmorphism |
| `dark_border` | `#2F2F4F` | Bordas de elementos |

### Cores de Marca

| Token | Valor | Uso |
|-------|-------|-----|
| `primary` | `#CE62D9` | Lilás - Botões principais, destaques |
| `primary_hover` | `#DB7FE3` | Hover do primary |
| `primary_active` | `#A848B1` | Active do primary |
| `brand_deep` | `#7C3AED` | Violeta profundo - Gradientes |
| `secondary` | `#5B21B6` | Roxo - Ações secundárias |
| `accent_cyan` | `#00BCD4` | Ciano - Acentos, links |

### Cores de Status

| Token | Valor | Uso |
|-------|-------|-----|
| `success` | `#34D399` | Verde - Pago, confirmado |
| `success_hover` | `#4FE4AE` | Hover do success |
| `warning` | `#F59E0B` | Âmbar - Pendente, alerta |
| `warning_hover` | `#FBBF24` | Hover do warning |
| `danger` | `#EF4444` | Vermelho - Erro, exclusão |
| `danger_hover` | `#F87171` | Hover do danger |

### Texto

| Token | Valor | Uso |
|-------|-------|-----|
| `text_default` | `#E0E0FF` | Texto principal |
| `text_secondary` | `#A0A0C0` | Texto secundário |
| `text_muted` | `#7A7AA0` | Texto desabilitado |

---

## 📏 Espaçamentos

| Token | Valor | Uso |
|-------|-------|-----|
| `xxs` | `4px` | Gaps mínimos |
| `xs` | `8px` | Gaps pequenos |
| `sm` | `12px` | Padding interno |
| `md` | `16px` | Padding padrão |
| `lg` | `24px` | Gaps entre seções |
| `xl` | `32px` | Margens externas |
| `xxl` | `40px` | Espaçamentos grandes |
| `layout` | `48px` | Grid de layout |

---

## 🔲 Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `xs` | `4px` | Badges, tags |
| `sm` | `6px` | Inputs, cells |
| `md` | `8px` | Cards pequenos |
| `lg` | `10px` | Cards, modais |
| `xl` | `12px` | Painéis grandes |

---

## 🌫️ Sombras

| Token | Valor |
|-------|-------|
| `sm` | `0 1px 2px rgba(0, 0, 0, 0.3)` |
| `md` | `0 4px 8px rgba(0, 0, 0, 0.4)` |
| `lg` | `0 8px 16px rgba(0, 0, 0, 0.5)` |
| `xl` | `0 12px 24px rgba(0, 0, 0, 0.6)` |

---

## ⏱️ Transições

| Token | Valor | Uso |
|-------|-------|-----|
| `fast` | `150ms cubic-bezier(0.4, 0, 0.2, 1)` | Hover rápido |
| `base` | `250ms cubic-bezier(0.4, 0, 0.2, 1)` | Transições padrão |
| `slow` | `350ms cubic-bezier(0.4, 0, 0.2, 1)` | Animações suaves |

---

## 🔤 Tipografia

### Escala de Fontes

| Token | Valor | Uso |
|-------|-------|-----|
| `xs` | `11px` | Labels pequenos |
| `sm` | `13px` | Texto secundário |
| `base` | `14px` | Texto padrão |
| `md` | `16px` | Subtítulos |
| `lg` | `18px` | Títulos de seção |
| `xl` | `20px` | Títulos de modal |
| `xxl` | `24px` | Títulos principais |
| `hero` | `36px` | Destaques |

### Família de Fontes

```css
--font-sans: 'Inter', 'SF Pro Display', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

---

## 🌈 Uso no Tailwind (index.css)

As variáveis CSS estão definidas em `client/src/index.css`:

```css
:root {
  --background: 240 51% 8%;        /* bg_primary */
  --foreground: 240 100% 94%;      /* text_default */
  --primary: 295 60% 62%;          /* #CE62D9 */
  --accent: 187 100% 42%;          /* #00BCD4 */
  --success: 160 67% 52%;          /* #34D399 */
  --warning: 38 92% 50%;           /* #F59E0B */
  --destructive: 0 84% 60%;        /* #EF4444 */
}
```

### Classes Utilitárias

```css
/* Glassmorphism */
.glass {
  @apply backdrop-blur-xl border border-white/10;
  background: rgba(26, 26, 58, 0.85);
}

/* Card com glass */
.glass-card {
  @apply backdrop-blur-xl border border-white/10;
  background: rgba(26, 26, 58, 0.85);
}

/* Gradiente animado */
.gradient-text {
  @apply bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary;
  background-size: 200% auto;
  animation: gradient-shift 3s ease-in-out infinite;
}
```

---

## 📊 Cores do Grid (Status)

### Datas de Pagamento

| Status | Cor | Classe |
|--------|-----|--------|
| Pago | `#34D399` (success) | `text-success` |
| Pendente | `#EF4444` (destructive) | `text-destructive` |

### Valores Financeiros

| Tipo | Cor | Descrição |
|------|-----|-----------|
| Honorários (recebidos) | `#34D399` | Verde - dinheiro entrando |
| Despesas (recebidas) | `#10B981` | Emerald - despesas reembolsadas |
| GHonorários (a pagar) | `#F59E0B` | Âmbar - pendência Guy |
| GDespesas (a pagar) | `#F59E0B` | Âmbar - pendência Guy |

---

## 🔗 Referência Original

Estas cores são baseadas em:
- `x_main/app/styles/tokens.py` - Tokens Python
- `x_main/design_tokens.py` - Gerador de CSS
- `x_main/assets/css/theme.css` - CSS gerado

---

*Última atualização: Dezembro/2024*

