# 🔌 Integrações MCP (Model Context Protocol) - xFinance

> **Documento de Referência para Integrações MCP no Projeto xFinance**

Este documento registra todas as integrações MCP implementadas, em andamento e planejadas para o projeto xFinance.

---

## 📋 Índice

1. [O que é MCP?](#o-que-é-mcp)
2. [Por que usar MCP no xFinance?](#por-que-usar-mcp-no-xfinance)
3. [MCPs Recomendados](#mcps-recomendados)
4. [Casos de Uso Específicos](#casos-de-uso-específicos)
5. [Configuração Completa Recomendada](#configuração-completa-recomendada)
6. [Plano de Implementação em Fases](#plano-de-implementação-em-fases)
7. [Configuração do Ambiente](#configuração-do-ambiente)
8. [Integrações Implementadas](#integrações-implementadas)
9. [Integrações Planejadas](#integrações-planejadas)
10. [Referências](#referências)

---

## 🤖 O que é MCP?

O **Model Context Protocol (MCP)** é um protocolo aberto desenvolvido pela Anthropic que permite que modelos de IA interajam com sistemas externos de forma estruturada e segura.

### Componentes Principais:

| Componente | Descrição |
|------------|-----------|
| **MCP Server** | Serviço que expõe recursos (dados, ferramentas) via protocolo MCP |
| **MCP Client** | Consumidor que se conecta ao server (ex: Cursor, Claude Desktop) |
| **Tools** | Funções que o modelo pode executar (queries, operações CRUD) |
| **Resources** | Dados estruturados acessíveis pelo modelo |

---

## 💡 Por que usar MCP no xFinance?

### Benefícios Específicos:

| Área | Benefício |
|------|-----------|
| **Desenvolvimento** | Consultas diretas ao banco durante coding assistido |
| **Debug** | Análise de dados em tempo real sem sair do IDE |
| **Validação** | Verificação de integridade de dados automatizada |
| **Documentação** | Geração automática de relatórios e schemas |
| **Backup** | Automação de processos de backup/restore |

### Casos de Uso no xFinance:

1. **MCP SQLite** → Consultar `xFinanceDB.db` diretamente no Cursor
2. **MCP Filesystem** → Gerenciar backups, logs e relatórios
3. **MCP Memory** → Persistir contexto entre sessões de desenvolvimento

---

## 🎯 MCPs Recomendados

### 🔴 PRIORIDADE ALTA (Impacto Imediato)

| MCP | Pacote NPM | Benefício para xFinance |
|-----|------------|-------------------------|
| **SQLite** | `@modelcontextprotocol/server-sqlite` | Consultas diretas ao banco durante desenvolvimento |
| **Filesystem** | `@modelcontextprotocol/server-filesystem` | Backups automatizados, exportar relatórios CSV/JSON |
| **Memory** | `@modelcontextprotocol/server-memory` | Persistir contexto entre sessões de desenvolvimento |

### 🟡 PRIORIDADE MÉDIA (Produtividade)

| MCP | Pacote NPM | Benefício |
|-----|------------|-----------|
| **Git** | `@modelcontextprotocol/server-git` | Commits, branches, histórico sem sair do chat |
| **GitHub** | `@modelcontextprotocol/server-github` | Issues, PRs, ações direto no Cursor |
| **Fetch** | `@modelcontextprotocol/server-fetch` | Consumir APIs externas (cotações, bancos) |

### 🟢 PRIORIDADE BAIXA (Nice-to-have)

| MCP | Pacote NPM | Benefício |
|-----|------------|-----------|
| **Puppeteer** | `@modelcontextprotocol/server-puppeteer` | Testes E2E automatizados |
| **Brave Search** | `@modelcontextprotocol/server-brave-search` | Pesquisa web integrada |
| **Slack** | `@modelcontextprotocol/server-slack` | Notificações de operações |
| **Time** | `@modelcontextprotocol/server-time` | Operações com fuso horário |
| **PostgreSQL** | `@modelcontextprotocol/server-postgres` | Se migrar para PostgreSQL no futuro |

### 🏆 Top 3 Recomendados para xFinance

1. **MCP SQLite** - Consultar dados, validar queries, debug em tempo real
2. **MCP Filesystem** - Backups, relatórios financeiros, gerenciar logs
3. **MCP Memory** - Lembrar decisões de arquitetura e contexto do projeto

---

## 💡 Casos de Uso Específicos

| Cenário | MCP Ideal | Exemplo de Comando |
|---------|-----------|-------------------|
| "Quantas inspeções pendentes?" | SQLite | `SELECT COUNT(*) FROM princ WHERE dt_pago IS NULL` |
| "Backup antes de migração" | Filesystem | Copiar `xFinanceDB.db` para `backups/` |
| "Lembre: segur em normalização" | Memory | Persistir nota sobre trabalho em andamento |
| "Crie branch para feature X" | Git | `git checkout -b feature/x` |
| "Busque cotação do dólar" | Fetch | GET para API do Banco Central |
| "Teste fluxo de login" | Puppeteer | Automação de navegador |
| "Liste issues abertas" | GitHub | Consultar issues do repositório |
| "Hora em São Paulo vs UTC" | Time | Conversão de fuso horário |

---

## 📦 Configuração Completa Recomendada

### Instalação dos Pacotes

```powershell
# MCP SQLite (Python) - RECOMENDADO para xFinance
pip install mcp-sqlite

# Verificar instalação
mcp-sqlite --help
```

### Configuração Atual (`.cursor/mcp.json`)

Arquivo em `E:\MVRX\Financeiro\xFinance_3.0\x_finan\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "xFinanceDB": {
      "command": "mcp-sqlite",
      "args": [
        "E:/MVRX/Financeiro/xFinance_3.0/x_db/xFinanceDB.db"
      ]
    },
    "git": {
      "command": "mcp-server-git",
      "args": [
        "--repository",
        "E:/MVRX/Financeiro/xFinance_3.0/x_finan"
      ]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

### Configuração Expandida (Futuro)

Quando quiser adicionar mais MCPs:

```json
{
  "mcpServers": {
    "xFinanceDB": {
      "command": "mcp-sqlite",
      "args": ["E:/MVRX/Financeiro/xFinance_3.0/x_db/xFinanceDB.db"]
    },
    "xFinanceFiles": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-filesystem", "E:/MVRX/Financeiro/xFinance_3.0"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-memory"]
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-server-git", "--repository", "E:/MVRX/Financeiro/xFinance_3.0/x_finan"]
    }
  }
}
```

> ⚠️ **IMPORTANTE:** O banco real está em `x_db/xFinanceDB.db`, não em `x_finan/xFinance.db`!

---

## 📅 Plano de Implementação em Fases

### 🔷 FASE 1: MCP SQLite (CONCLUÍDO ✅)

**Status:** 🟢 Configurado  
**Prioridade:** Alta  
**Data Conclusão:** 27/12/2024

#### Objetivo
Permitir consultas diretas ao banco `xFinanceDB.db` via Cursor IDE, facilitando:
- Verificação de dados durante desenvolvimento
- Análise de performance de queries
- Validação de schemas e constraints

#### Tarefas

- [x] Instalar servidor MCP SQLite (`pip install mcp-sqlite`)
- [x] Configurar `.cursor/mcp.json` com path do banco
- [ ] Testar conexão e operações básicas (aguardando reinício do Cursor)
- [ ] Documentar comandos disponíveis

#### Configuração Aplicada

```json
{
  "mcpServers": {
    "xFinanceDB": {
      "command": "mcp-sqlite",
      "args": [
        "E:/MVRX/Financeiro/xFinance_3.0/x_db/xFinanceDB.db"
      ]
    }
  }
}
```

> ⚠️ **IMPORTANTE:** O banco real está em `x_db/xFinanceDB.db`, não em `x_finan/xFinance.db`!

#### Ferramentas Disponíveis (após configuração)

| Tool | Descrição |
|------|-----------|
| `read_query` | Executar SELECT no banco |
| `write_query` | Executar INSERT/UPDATE/DELETE |
| `create_table` | Criar novas tabelas |
| `list_tables` | Listar todas as tabelas |
| `describe_table` | Ver estrutura de uma tabela |

---

### 🔷 FASE 2: MCP Filesystem

**Status:** ⚪ Planejado  
**Prioridade:** Média  
**Prazo Estimado:** 1 dia (após Fase 1)

#### Objetivo
Gerenciar arquivos do projeto de forma estruturada:
- Backups automatizados do banco
- Geração de relatórios (CSV, JSON)
- Gerenciamento de logs

#### Configuração Planejada

```json
{
  "mcpServers": {
    "xFinanceFiles": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "E:/MVRX/Financeiro/xFinance_3.0/x_finan"
      ]
    }
  }
}
```

#### Diretórios a Expor

| Diretório | Propósito |
|-----------|-----------|
| `./backups/` | Armazenar backups do banco |
| `./reports/` | Relatórios gerados |
| `./logs/` | Arquivos de log |
| `./exports/` | Dados exportados |

---

### 🔷 FASE 3: MCP Memory

**Status:** ⚪ Planejado  
**Prioridade:** Baixa  
**Prazo Estimado:** 1 dia (após Fase 2)

#### Objetivo
Persistir contexto de desenvolvimento entre sessões:
- Lembrar decisões de arquitetura
- Manter histórico de mudanças
- Armazenar snippets úteis

#### Configuração Planejada

```json
{
  "mcpServers": {
    "xFinanceMemory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ]
    }
  }
}
```

---

### 🔷 FASE 4: MCP Context7 (CONCLUÍDO ✅)

**Status:** 🟢 Configurado  
**Prioridade:** Alta  
**Data Conclusão:** 27/12/2024

#### O que é o Context7?

O Context7 é um servidor MCP que fornece **documentação atualizada e específica por versão** para bibliotecas diretamente no seu assistente de código. Isso evita:
- Uso de APIs desatualizadas ou obsoletas
- Código baseado em versões antigas de bibliotecas
- Erros por falta de conhecimento de mudanças recentes

#### Benefícios para xFinance

| Biblioteca | Benefício |
|------------|-----------|
| **React 18+** | Hooks atualizados, Suspense, Server Components |
| **FastAPI** | Documentação de endpoints, validação Pydantic |
| **SQLite** | Sintaxe correta, funções disponíveis |
| **TanStack Query** | Padrões de cache, invalidação |
| **Tailwind CSS** | Classes atualizadas, plugins |
| **shadcn/ui** | Componentes e variantes disponíveis |

#### Como Usar

Adicione `use context7` ao seu prompt para que eu consulte a documentação mais recente:

```
Crie um modal de confirmação use context7
```

```
Como fazer invalidação de cache com TanStack Query? use context7
```

#### Configuração Aplicada

```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
}
```

#### Plano Utilizado

- **Gratuito**: Acesso a bibliotecas públicas (React, FastAPI, SQLite, etc.)
- Suficiente para o desenvolvimento do xFinance
- Upgrade para Pro ($7/mês) se precisar de repositórios privados

---

### 🔷 FASE 5: Integrações Futuras

**Status:** ⚪ Backlog  
**Prioridade:** A definir

#### Candidatos para Avaliação

| Integração | Descrição | Benefício para xFinance |
|------------|-----------|-------------------------|
| **MCP Puppeteer** | Automação de browser | Testes E2E automatizados |
| **MCP Fetch** | Requisições HTTP | Integração com APIs externas |
| **MCP Slack** | Notificações | Alertas de operações críticas |
| **MCP Time** | Operações temporais | Agendamento de tarefas |

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos

1. **Node.js** >= 18.x instalado
2. **npx** disponível no PATH
3. **Cursor IDE** atualizado

### Estrutura de Arquivos

```
x_finan/
├── .cursor/
│   └── mcp.json          # Configuração MCP do projeto
├── xFinance.db           # Banco SQLite principal
├── backups/              # Diretório para backups (criar)
├── reports/              # Diretório para relatórios (criar)
└── logs/                 # Diretório para logs (criar)
```

### Instalação (Fase 1)

```powershell
# Verificar Node.js
node --version  # Deve ser >= 18.x

# Testar servidor MCP SQLite manualmente
npx -y @modelcontextprotocol/server-sqlite ./xFinance.db

# Se funcionar, criar arquivo .cursor/mcp.json
```

---

## ✅ Integrações Implementadas

| Integração | Data | Status | Notas |
|------------|------|--------|-------|
| **Otimização DB** | 27/12/2024 | 🟢 Completo | 5 índices adicionados (ver DB_OPTIMIZATION_REPORT.md) |
| **MCP SQLite** | 27/12/2024 | 🟢 Configurado | Pacote: `mcp-sqlite` |
| **MCP Git** | 27/12/2024 | 🟢 Configurado | Pacote: `mcp-server-git` |
| **MCP Context7** | 27/12/2024 | 🟢 Configurado | Pacote: `@upstash/context7-mcp` |

---

## 📋 Integrações Planejadas

### Roadmap de Implementação

| # | Integração | Prioridade | Status | Data | Benefício Principal |
|---|------------|------------|--------|------|---------------------|
| 1 | MCP SQLite | 🔴 Alta | 🟢 **Concluído** | 27/12/2024 | Queries diretas ao banco |
| 2 | MCP Git | 🔴 Alta | 🟢 **Concluído** | 27/12/2024 | Versionamento integrado |
| 3 | MCP Context7 | 🔴 Alta | 🟢 **Concluído** | 27/12/2024 | Documentação atualizada |
| 4 | MCP Filesystem | 🟡 Média | ⚪ Planejado | Jan/2025 | Backups e relatórios |
| 5 | MCP Memory | 🟡 Média | ⚪ Planejado | Jan/2025 | Contexto persistente |
| 6 | MCP Fetch | 🟢 Baixa | ⚪ Backlog | - | APIs externas |
| 7 | MCP GitHub | 🟢 Baixa | ⚪ Backlog | - | Issues e PRs |
| 8 | MCP Puppeteer | 🟢 Baixa | ⚪ Backlog | - | Testes E2E |

---

## 🔒 Considerações de Segurança

### Banco de Dados

⚠️ **IMPORTANTE**: O MCP SQLite terá acesso TOTAL ao banco. Considere:

1. **Ambiente de Desenvolvimento**: Usar cópia do banco, não produção
2. **Backup Antes de Operações**: Sempre fazer backup antes de write queries
3. **Queries Destrutivas**: Revisar cuidadosamente DELETE/UPDATE

### Filesystem

- Limitar diretórios expostos ao mínimo necessário
- Não expor diretórios com credenciais (`.env`, configs)

---

## 📚 Referências

### Documentação Oficial

- [MCP - Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP Servers (GitHub)](https://github.com/modelcontextprotocol/servers)
- [MCP SQLite Server](https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite)
- [MCP Filesystem Server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)

### Servidores MCP Disponíveis (Lista Completa)

| Servidor | Pacote NPM | Descrição | Prioridade xFinance |
|----------|------------|-----------|---------------------|
| **SQLite** | `@modelcontextprotocol/server-sqlite` | Acesso a bancos SQLite | 🔴 Alta |
| **Filesystem** | `@modelcontextprotocol/server-filesystem` | Operações de arquivo | 🔴 Alta |
| **Memory** | `@modelcontextprotocol/server-memory` | Memória persistente | 🔴 Alta |
| **Git** | `@modelcontextprotocol/server-git` | Operações Git | 🟡 Média |
| **GitHub** | `@modelcontextprotocol/server-github` | Issues, PRs, Actions | 🟡 Média |
| **Fetch** | `@modelcontextprotocol/server-fetch` | Requisições HTTP | 🟡 Média |
| **Puppeteer** | `@modelcontextprotocol/server-puppeteer` | Automação browser | 🟢 Baixa |
| **Brave Search** | `@modelcontextprotocol/server-brave-search` | Pesquisa web | 🟢 Baixa |
| **Slack** | `@modelcontextprotocol/server-slack` | Notificações Slack | 🟢 Baixa |
| **Time** | `@modelcontextprotocol/server-time` | Operações temporais | 🟢 Baixa |
| **PostgreSQL** | `@modelcontextprotocol/server-postgres` | Acesso PostgreSQL | ⚪ Futuro |
| **Google Drive** | `@modelcontextprotocol/server-gdrive` | Acesso Google Drive | ⚪ Futuro |
| **Sentry** | `@modelcontextprotocol/server-sentry` | Monitoramento erros | ⚪ Futuro |

### Alternativas para SQLite

| Servidor | Pacote | Diferencial |
|----------|--------|-------------|
| **mcp-sqlite** | `mcp-sqlite` | Suporte a metadados Datasette |
| **sqlite-mcp** | `sqlite-mcp` | Interface simplificada |
| **sqlitecloud-mcp** | `sqlitecloud-mcp-server` | SQLite na nuvem |

### Configuração no Cursor

A configuração do MCP no Cursor é feita através do arquivo:
- **Projeto**: `.cursor/mcp.json` (raiz do projeto)
- **Global**: `~/.cursor/mcp.json` (home do usuário)

---

## 📝 Histórico de Alterações

| Data | Versão | Descrição |
|------|--------|-----------|
| 2024-12-27 | 1.0.0 | Documento inicial com plano de fases |
| 2024-12-27 | 1.1.0 | Adicionado seção de MCPs recomendados com prioridades |
| 2024-12-27 | 1.1.1 | Adicionado casos de uso específicos e configuração completa |
| 2024-12-27 | 1.1.2 | Adicionado lista completa de servidores MCP disponíveis |
| 2024-12-27 | 1.2.0 | **MCP SQLite configurado!** Pacote `mcp-sqlite` instalado |
| 2024-12-27 | 1.3.0 | **MCP Git configurado!** Pacote `mcp-server-git` instalado |
| 2024-12-27 | 1.4.0 | **MCP Context7 configurado!** Documentação atualizada de bibliotecas |

---

*Última atualização: 27/12/2024*
*Versão: 1.4.0*
*Projeto: xFinance 3.0 - React + FastAPI*

