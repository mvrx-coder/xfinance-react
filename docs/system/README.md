# 📚 Documentação do Sistema xFinance 3.0

> **ORDEM DE LEITURA PARA NOVOS AGENTES**

Este diretório contém toda a documentação necessária para entender e editar o sistema xFinance 3.0.

---

## 🎯 Ordem de Leitura Obrigatória

Leia os documentos **nesta ordem exata** antes de fazer qualquer alteração:

| # | Documento | Tempo | Conteúdo |
|---|-----------|-------|----------|
| 1 | `../../CLAUDE.md` | 5 min | Regras críticas, sigilo, estrutura |
| 2 | `SIGILO.md` | 3 min | Matriz de permissões por papel |
| 3 | `ARCHITECTURE.md` | 5 min | Visão geral da arquitetura |
| 4 | `padroes/areas_de_codigo.md` | 3 min | Onde editar cada tipo de código |
| 5 | `ui/TYPOGRAPHY.md` | 2 min | Esquema de fontes |
| 6 | `ui/TOAST.md` | 2 min | Sistema de notificações |
| 7 | `ui/GRID.md` | 3 min | Regras do grid principal |

---

## 📁 Estrutura da Documentação

```
docs/system/
├── README.md              # Este arquivo (índice)
├── ARCHITECTURE.md        # Arquitetura geral
├── SIGILO.md              # Regras de permissão
├── BOAS_PRATICAS.md       # Padrões de código
├── DESIGN_TOKENS.md       # Cores e variáveis CSS
├── MCP_INTEGRATIONS.md    # Integrações MCP (SQLite, Filesystem, etc.)
│
├── padroes/
│   └── areas_de_codigo.md # Onde editar
│
├── schema/
│   ├── db_ddl.txt         # DDL do banco SQLite
│   └── MAPEAMENTO_CAMPOS.md # Campos DB → Frontend
│
└── ui/
    ├── TYPOGRAPHY.md      # Fontes e tipografia
    ├── TOAST.md           # Sistema de notificações
    └── GRID.md            # Grid principal
```

---

## 🚨 Documentos Críticos

### Para qualquer alteração:
- `CLAUDE.md` - Regras gerais
- `SIGILO.md` - Permissões (NUNCA ignore)

### Para alterações no Frontend:
- `ui/TYPOGRAPHY.md` - Fontes
- `ui/TOAST.md` - Notificações
- `ui/GRID.md` - Grid

### Para alterações no Backend:
- `ARCHITECTURE.md` - Estrutura FastAPI
- `schema/MAPEAMENTO_CAMPOS.md` - Campos do banco

### Para integrações e automação:
- `MCP_INTEGRATIONS.md` - Model Context Protocol (SQLite, Filesystem, etc.)

---

## ✅ Checklist Rápido

Antes de editar, confirme:

- [ ] Li CLAUDE.md e entendo as regras?
- [ ] Verifiquei SIGILO.md para permissões?
- [ ] Sei onde editar (areas_de_codigo.md)?
- [ ] Conheço os padrões de UI (TYPOGRAPHY, TOAST)?
- [ ] Arquivo terá menos de 400 linhas?

---

*Última atualização: 27/12/2024*
