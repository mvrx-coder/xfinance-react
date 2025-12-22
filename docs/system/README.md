# 📚 Documentação do Sistema xFinance React

> **Índice da documentação técnica do projeto**

---

## 🚨 Leitura Obrigatória (Ordem)

1. **`../../CLAUDE.md`** - Regras para agentes AI
2. **`SIGILO.md`** - 🔒 Matriz de permissões (CRÍTICO)
3. **`ARCHITECTURE.md`** - Arquitetura do sistema
4. **`BOAS_PRATICAS.md`** - Padrões de código

---

## 📋 Documentos Disponíveis

### Regras e Padrões

| Documento | Descrição |
|-----------|-----------|
| [`../../CLAUDE.md`](../../CLAUDE.md) | Instruções obrigatórias para agentes AI |
| [`SIGILO.md`](SIGILO.md) | 🔒 Controle de sigilo por papel de usuário |
| [`BOAS_PRATICAS.md`](BOAS_PRATICAS.md) | Padrões de código e organização |
| [`padroes/areas_de_codigo.md`](padroes/areas_de_codigo.md) | Guia de onde colocar cada código |

### Arquitetura

| Documento | Descrição |
|-----------|-----------|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Arquitetura React + FastAPI |
| [`DESIGN_TOKENS.md`](DESIGN_TOKENS.md) | Cores, espaçamentos, tipografia |

### Schema do Banco

| Documento | Descrição |
|-----------|-----------|
| [`schema/db_ddl.txt`](schema/db_ddl.txt) | DDL completo do SQLite |
| [`schema/MAPEAMENTO_CAMPOS.md`](schema/MAPEAMENTO_CAMPOS.md) | Mapeamento SQLite ↔ TypeScript |

### Migração

| Documento | Descrição |
|-----------|-----------|
| [`../../MIGRACAO_XFINANCE.md`](../../MIGRACAO_XFINANCE.md) | Status e progresso da migração |

---

## 🔒 Regras de Sigilo (Resumo)

```
┌────────────┬──────────────────────────────────────────────────────┐
│   Papel    │              Colunas Permitidas                      │
├────────────┼──────────────────────────────────────────────────────┤
│   admin    │ TODAS (22 colunas)                                   │
├────────────┼──────────────────────────────────────────────────────┤
│ BackOffice │ Workflow apenas: id_princ, id_contr, id_segur,       │
│            │ dt_inspecao, dt_entregue, dt_envio, prazo, loc       │
│            │ ❌ SEM valores financeiros                            │
├────────────┼──────────────────────────────────────────────────────┤
│  Inspetor  │ Mínimo + seus pagamentos: id_princ, loc,             │
│            │ dt_inspecao, guy_honorario, guy_despesa              │
│            │ ❌ SEM dados da empresa                               │
└────────────┴──────────────────────────────────────────────────────┘
```

**Ver detalhes completos em `SIGILO.md`**

---

## 📏 Limites de Código

| Tipo | Máximo | Ação se Exceder |
|------|--------|-----------------|
| Componente | 400 linhas | Extrair sub-componentes |
| Hook | 200 linhas | Dividir responsabilidades |
| Service | 300 linhas | Criar módulos separados |

---

## 🗂️ Estrutura do Projeto

```
x_finan/
├── client/                 # Frontend React/TypeScript
├── backend/                # Backend FastAPI (a criar)
├── shared/                 # Tipos compartilhados
├── docs/
│   └── system/             # ← VOCÊ ESTÁ AQUI
│       ├── README.md       # Este arquivo
│       ├── SIGILO.md       # 🔒 Permissões
│       ├── ARCHITECTURE.md # Arquitetura
│       ├── BOAS_PRATICAS.md
│       ├── DESIGN_TOKENS.md
│       ├── padroes/
│       │   └── areas_de_codigo.md
│       └── schema/
│           ├── db_ddl.txt
│           └── MAPEAMENTO_CAMPOS.md
└── CLAUDE.md               # Regras para AI
```

---

## 🔗 Links Rápidos

- **Projeto origem:** `E:\MVRX\Financeiro\xFinance_3.0\x_main`
- **Banco SQLite:** `E:\MVRX\Financeiro\xFinance_3.0\x_db\xFinanceDB.db`
- **GitHub:** https://github.com/mvrx-coder/xfinance-react

---

*Última atualização: 22/12/2024*
