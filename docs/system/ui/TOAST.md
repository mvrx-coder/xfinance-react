# 🔔 Sistema de Toast - xFinance 3.0

> Notificações premium com Sonner + Glassmorphism

---

## Biblioteca

**Sonner** - A biblioteca de notificações mais moderna para React (2024).

```bash
npm install sonner
```

---

## Configuração

| Aspecto | Valor |
|---------|-------|
| Posição | Top-right |
| Tema | Dark |
| Animação | Slide-in da direita |
| Botão fechar | ✅ Habilitado |
| Rich colors | ✅ Habilitado |
| Duração padrão | 4 segundos |

---

## Paleta de Cores

| Tipo | Cor | Hex | Uso |
|------|-----|-----|-----|
| **Info** | Lilás | #CE62D9 | Seleção, Buscar |
| **Success** | Emerald | #10B981 | Ações concluídas |
| **Warning** | Amber | #F59E0B | Alertas, Logout |
| **Error** | Red | #EF4444 | Erros, Falhas |

---

## API de Uso

```typescript
import { toast } from "sonner";

// Info (Lilás) - Seleções, buscas
toast.info("Título", { 
  description: "Mensagem detalhada" 
});

// Success (Verde) - Ações concluídas
toast.success("Título", { 
  description: "Mensagem detalhada" 
});

// Warning (Âmbar) - Alertas
toast.warning("Título", { 
  description: "Mensagem detalhada" 
});

// Error (Vermelho) - Erros
toast.error("Título", { 
  description: "Mensagem detalhada" 
});
```

---

## Onde Usar Cada Tipo

### `toast.info` (Lilás)
- Linha selecionada no grid
- Buscar/atualizar dados
- Ações informativas

### `toast.success` (Verde)
- Campo editado com sucesso
- Novo registro criado
- Usuário cadastrado

### `toast.warning` (Âmbar)
- Logout
- Ação que requer atenção
- Confirmações

### `toast.error` (Vermelho)
- Falha ao salvar
- Erro de validação
- Erro de conexão

---

## Design Glassmorphism

```css
[data-sonner-toast] {
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 12px;
  background: gradiente diagonal (cor → #0A0A1F);
  border: 1px solid rgba(cor, 0.4);
  box-shadow: glow externo + inset highlight;
}
```

---

## Locais de Aplicação

| Componente | Sistema | Status |
|------------|---------|--------|
| Dashboard.tsx | Sonner | ✅ |
| DataGrid.tsx | Sonner | ✅ |
| UsersModal.tsx | Sonner | ✅ |
| ActionCenter.tsx | Radix | ⚠️ Mantido |

---

## ⚠️ ActionCenter

A **Central de Ações** mantém o sistema Radix (`useToast`) conforme decisão de projeto.

```typescript
// ActionCenter.tsx - MANTÉM Radix
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();
toast({
  title: "Título",
  description: "Mensagem",
  variant: "destructive", // para erros
});
```

---

## Arquivos Envolvidos

| Arquivo | Função |
|---------|--------|
| `client/src/App.tsx` | Configuração do SonnerToaster |
| `client/src/index.css` | Estilos glassmorphism |
| `client/src/pages/Dashboard.tsx` | Usa toast do Sonner |

---

## Exemplo Completo

```typescript
// Em qualquer componente
import { toast } from "sonner";

const handleSave = async () => {
  try {
    await saveData();
    toast.success("Salvo!", {
      description: "Dados atualizados com sucesso",
    });
  } catch (error) {
    toast.error("Erro ao salvar", {
      description: error.message,
    });
  }
};

const handleRowClick = (row) => {
  toast.info("Registro selecionado", {
    description: `ID: ${row.id}`,
  });
};
```

---

*Arquivo CSS: `client/src/index.css` (seção SONNER TOAST)*

