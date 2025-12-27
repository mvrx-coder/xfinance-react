# NewRecordModal - Design System & Layout

## Visao Geral

O modal "Inserir Novo Trabalho" foi redesenhado com um sistema de grid responsivo de 12 colunas, dropdowns premium com comportamento avancado, e estetica glassmorphism alinhada ao design system do xFinance 3.0.

---

## Layout de Grid Responsivo

### Sistema de 12 Colunas

O formulario utiliza `grid grid-cols-12 gap-4` para distribuir os campos proporcionalmente, preenchendo 100% da largura disponivel sem espacos vazios.

### Linha 1 - Dados do Trabalho

| Campo       | Colunas | Proporcao | Justificativa                          |
|-------------|---------|-----------|----------------------------------------|
| Player      | 2       | 16.67%    | Lista curta, IDs compactos             |
| Segurado    | 4       | 33.33%    | Nomes extensos, campo criavel          |
| Atividade   | 4       | 33.33%    | Descricoes longas, campo criavel       |
| Honorarios  | 2       | 16.67%    | Campo numerico, prefixo R$             |

**Total: 12 colunas (100%)**

### Linha 2 - Dados do Local

| Campo   | Colunas | Proporcao | Justificativa                          |
|---------|---------|-----------|----------------------------------------|
| Guy     | 2       | 16.67%    | Lista curta de usuarios                |
| Data    | 2       | 16.67%    | Calendario popup, formato dd/MM/yyyy   |
| UF      | 2       | 16.67%    | Siglas de 2 caracteres                 |
| Cidade  | 6       | 50.00%    | Nomes longos de municipios             |

**Total: 12 colunas (100%)**

---

## Configuracao do Modal

### Tamanho Expandido

```tsx
maxWidth="5xl"  // 1024px - acomoda grid de 12 colunas confortavelmente
```

O componente Modal foi expandido para suportar tamanhos `6xl` (1152px) e `7xl` (1280px), permitindo flexibilidade para formularios maiores.

### Classe de Tamanhos Disponiveis

```typescript
const maxWidthClasses = {
  sm: "max-w-sm",      // 384px
  md: "max-w-md",      // 448px
  lg: "max-w-lg",      // 512px
  xl: "max-w-xl",      // 576px
  "2xl": "max-w-2xl",  // 672px
  "3xl": "max-w-3xl",  // 768px
  "4xl": "max-w-4xl",  // 896px
  "5xl": "max-w-5xl",  // 1024px
  "6xl": "max-w-6xl",  // 1152px
  "7xl": "max-w-7xl",  // 1280px
};
```

---

## SearchableCombobox - Comportamento Premium

### Abertura Imediata

```tsx
<Combobox immediate>
```

A prop `immediate` garante que a lista de opcoes abre **automaticamente** ao clicar ou focar no campo, sem necessidade de digitar. Isso proporciona:

- Feedback visual instantaneo
- Descoberta rapida das opcoes disponiveis
- Experiencia similar a selects nativos, mas com busca integrada

### Portal Rendering

```tsx
<ComboboxOptions portal={true}>
```

A lista e renderizada em um **portal** (diretamente no `<body>`), nao dentro do modal. Beneficios:

- Lista **nunca e cortada** por overflow do modal
- Lista **ultrapassa o footer** do modal quando necessario
- Lista **ultrapassa os limites** do modal completamente
- Posicionamento correto mesmo para dropdowns na parte inferior

### Z-Index Elevado

```tsx
className="!z-[9999]"
```

Garante que a lista sempre apareca **acima de todos os elementos**, incluindo:

- Outros modais
- Overlays
- Headers fixos
- Qualquer elemento com z-index alto

### Ancoragem Inteligente

```tsx
anchor="bottom start"
className="[--anchor-gap:4px]"
```

A lista ancora automaticamente abaixo do input com gap de 4px, seguindo a largura do campo (`w-[var(--input-width)]`).

---

## Estetica Glassmorphism

### Campos de Input

```css
bg-[rgba(15,15,35,0.6)]    /* Fundo semi-transparente escuro */
border-white/12             /* Borda sutil branca */
focus:ring-primary/50       /* Anel de foco magenta */
focus:border-primary/50     /* Borda de foco magenta */
```

### Lista do Dropdown

```css
bg-card/95                  /* Fundo do card com 95% opacidade */
backdrop-blur-md            /* Desfoque de fundo (blur) */
border-white/15             /* Borda sutil branca */
shadow-xl shadow-black/20   /* Sombra profunda para elevacao */
```

### Secoes do Formulario

```css
.form-section-card {
  background: linear-gradient(
    135deg,
    rgba(30, 30, 60, 0.4) 0%,
    rgba(20, 20, 45, 0.3) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}
```

---

## Interacoes do Dropdown

### Estados Visuais

| Estado     | Estilo                                    |
|------------|-------------------------------------------|
| Hover      | `bg-primary/20 text-primary`              |
| Selecionado| `bg-primary/30` + icone Check visivel     |
| Focado     | `bg-primary/20`                           |
| Desabilitado| `opacity-50 cursor-not-allowed`          |

### Opcao de Criacao (allowCreate)

Quando `allowCreate={true}`:

```tsx
<ComboboxOption value={query.trim()}>
  <Plus className="h-4 w-4" />
  <span>Criar: <strong>{query.trim()}</strong></span>
</ComboboxOption>
```

A opcao aparece destacada em `text-primary` (magenta) no topo da lista quando o termo buscado nao existe.

---

## Campos Especiais

### Campo de Honorarios (Moeda)

```tsx
<div className="form-currency-wrapper">
  <span className="form-currency-prefix">R$</span>
  <Input type="number" step="0.01" min="0" />
</div>
```

Prefixo "R$" integrado visualmente ao campo, com input numerico alinhado a direita.

### Campo de Data (Calendar Picker)

```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon />
      {format(value, "dd/MM/yyyy", { locale: ptBR })}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <CalendarComponent mode="single" locale={ptBR} />
  </PopoverContent>
</Popover>
```

Calendario em portugues (pt-BR) com formato de data brasileiro.

---

## Checkboxes do Footer

### Meta (padrao: marcado)

```tsx
<Checkbox id="meta" defaultChecked />
```

### Varios Locais

```tsx
<Checkbox id="variosLocais" />
```

Ativa modo multi-local: desabilita campos da linha 1 e permite adicionar multiplos locais ao mesmo trabalho.

---

## Animacoes

### Entrada das Secoes

```tsx
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};
```

Secoes entram com fade-in e slide-up suave usando Framer Motion.

---

## Resumo das Caracteristicas Premium

1. **Grid Responsivo** - Campos proporcionais que preenchem 100% da largura
2. **Dropdowns Imediatos** - Lista abre ao clicar, sem digitar
3. **Portal Rendering** - Lista nunca e cortada, ultrapassa modal
4. **Z-Index Elevado** - Lista sempre visivel sobre qualquer elemento
5. **Glassmorphism** - Transparencias, blur e gradientes elegantes
6. **Campos Criaveis** - Segurado e Atividade permitem criar novos
7. **Calendario PT-BR** - Data em formato brasileiro
8. **Animacoes Suaves** - Transicoes com Framer Motion
9. **Feedback Visual** - Estados hover/focus/selected consistentes
10. **Multi-Local** - Modo especial para adicionar varios locais
