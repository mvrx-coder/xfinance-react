# 🏗️ Plano de Refatoração Arquitetural - xFinance 3.0

> **Status:** Em execução  
> **Data:** 26/12/2024  
> **Objetivo:** Simplificar arquitetura, remover código legado, garantir operações de DB robustas

---

## 📊 Diagnóstico do Estado Atual

### Problemas Identificados

| Problema | Impacto | Prioridade |
|----------|---------|------------|
| **Backend duplicado** (Express + FastAPI) | Confusão sobre qual backend usar | 🔴 CRÍTICA |
| **Código morto** (Drizzle ORM, Vite-Express) | Manutenção desnecessária | 🟠 ALTA |
| **Caminho DB inconsistente** | Erros de conexão | 🔴 CRÍTICA |
| **Componentes UI complexos** | Difícil debug/manutenção | 🟡 MÉDIA |
| **Inicialização confusa** | Dificuldade para novos devs | 🟠 ALTA |

### Arquitetura Atual (Problemática)

```
x_finan/
├── backend/          # FastAPI (CORRETO - em uso)
│   ├── main.py
│   ├── routers/
│   └── database.py
│
├── server/           # ⚠️ Express LEGADO (NÃO USADO)
│   ├── index.ts      # Código morto
│   ├── routes.ts
│   └── storage.ts
│
├── shared/           # ⚠️ Drizzle ORM (NÃO USADO)
│   └── schema.ts     # Definições que não conectam ao SQLite
│
├── client/           # React (CORRETO)
│   └── src/
│
├── start.bat         # Inicialização confusa
└── scripts/
    └── start_dev.ps1 # Script incompleto
```

---

## 🎯 Arquitetura Alvo (Simplificada)

```
x_finan/
├── backend/                    # FastAPI ÚNICO backend
│   ├── main.py                 # Entrada da aplicação
│   ├── config.py               # Configurações centralizadas
│   ├── database.py             # Conexão SQLite única
│   ├── routers/                # Endpoints por domínio
│   │   ├── auth.py
│   │   ├── lookups.py
│   │   ├── new_record.py
│   │   └── inspections.py
│   └── services/               # Lógica de negócio
│       ├── directory_service.py
│       └── validation_service.py
│
├── client/                     # React SPA
│   └── src/
│       ├── api/                # Cliente API centralizado
│       ├── components/
│       ├── hooks/
│       └── features/           # Componentes por funcionalidade
│
├── scripts/
│   ├── start.ps1               # NOVO: Inicialização única
│   └── dev.ps1                 # NOVO: Desenvolvimento
│
├── docs/                       # Documentação
└── requirements.txt            # Dependências Python
```

---

## 📋 Fases de Execução

### FASE 0: Limpeza e Preparação (✅ CONCLUÍDA)
> **Objetivo:** Remover código morto, simplificar inicialização

| # | Tarefa | Status |
|---|--------|--------|
| 0.1 | Avaliar scripts de inicialização (start.bat, start_dev.ps1) | ✅ Completo |
| 0.2 | Criar novo script de inicialização unificado (`scripts/start.ps1`) | ✅ Completo |
| 0.3 | Arquivar pasta `server/` em `_legacy/server/` | ✅ Completo |
| 0.4 | Manter `shared/schema.ts` (tipos TS em uso) | ✅ Decisão tomada |
| 0.5 | Limpar `package.json` de dependências mortas | ✅ Completo |
| 0.6 | Documentar arquitetura limpa | ✅ Completo |

**Dependências removidas:** `drizzle-orm`, `drizzle-kit`, `drizzle-zod`, `express`, `express-session`, `passport`, `passport-local`, `pg`, `ws`, plugins Replit.

**Arquivos movidos para `_legacy/`:** `server/*`, `start_dev.ps1`

### FASE 1: Backend Robusto (PARCIALMENTE COMPLETA)
> **Objetivo:** Garantir CRUD funcional no banco

| # | Tarefa | Status |
|---|--------|--------|
| 1.1 | Criar `routers/new_record.py` com POST robusto | ✅ Completo |
| 1.2 | Endpoints de busca server-side (segurados, atividades) | ✅ Completo |
| 1.3 | Endpoint GET `/lookups/contratantes` (ativos) | ✅ Completo |
| 1.4 | Endpoint GET `/lookups/inspetores` (ativos + admin) | ✅ Completo |
| 1.5 | Endpoint GET `/lookups/ufs` | ✅ Completo |
| 1.6 | Endpoint GET `/lookups/cidades?id_uf=` | ✅ Completo |
| 1.7 | Testar gravação de registro básico | 🔄 Aguardando Fase 0 |

### FASE 2: Frontend Modular (PARCIALMENTE COMPLETA)
> **Objetivo:** Componentes limpos e manuteníveis

| # | Tarefa | Status |
|---|--------|--------|
| 2.1 | Criar `HeadlessCombobox` (busca local) | ✅ Completo |
| 2.2 | Criar `ServerSearchHeadlessCombobox` (busca servidor) | ✅ Completo |
| 2.3 | Migrar 6 dropdowns do NewRecordModal | ✅ Completo |
| 2.4 | Corrigir trigger de fetch inicial | ✅ Completo |
| 2.5 | Testar todos os campos | 🔄 Aguardando Fase 0 |
| 2.6 | Remover componentes obsoletos | ⏳ Pendente |

### FASE 3: Diretórios NAS
> **Objetivo:** Criar estrutura de pastas ao gravar registro

| # | Tarefa | Status |
|---|--------|--------|
| 3.1 | Criar `services/directory_service.py` | ⏳ Pendente |
| 3.2 | Integrar criação de diretórios no POST | ⏳ Pendente |
| 3.3 | Testar criação em NAS e Fotos | ⏳ Pendente |

### FASE 4: Modo Vários Locais
> **Objetivo:** Permitir múltiplos locais por registro

| # | Tarefa | Status |
|---|--------|--------|
| 4.1 | Endpoint POST `/new-record/local-adicional` | ⏳ Pendente |
| 4.2 | Estado multi-local no modal | ⏳ Pendente |
| 4.3 | Testar gravação múltipla | ⏳ Pendente |

---

## 🔧 Fase 0 - Detalhamento

### 0.1 Avaliação da Inicialização Atual

**Arquivo:** `start.bat`
```batch
@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\start_dev.ps1"
pause
```

**Arquivo:** `scripts\start_dev.ps1`
```powershell
# Roda apenas o backend FastAPI
# NÃO inicia o frontend (Vite)
# Caminho do DB hardcoded
```

**Problemas:**
1. ❌ Não inicia o frontend React (Vite)
2. ❌ Não verifica se portas estão em uso
3. ❌ Não valida existência do banco SQLite
4. ❌ Não oferece opção de modo produção vs desenvolvimento

### 0.2 Novo Script de Inicialização Proposto

```powershell
# scripts/start.ps1 - Script unificado
param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 5173
)

# Verificações
# - Existência do banco SQLite
# - Portas disponíveis
# - Ambiente virtual Python

# Inicialização paralela
# - Backend: FastAPI na porta 8000
# - Frontend: Vite na porta 5173
# - Logs coloridos por serviço
```

### 0.3 Código a Remover/Arquivar

| Pasta/Arquivo | Motivo | Ação |
|---------------|--------|------|
| `server/` | Backend Express não usado | Renomear para `_legacy_server/` |
| `server/index.ts` | Código morto | Arquivar |
| `server/routes.ts` | Rotas não usadas | Arquivar |
| `server/storage.ts` | Storage in-memory não usado | Arquivar |
| `shared/schema.ts` | Drizzle ORM não conectado | Manter só tipos TS úteis |

### 0.4 Dependências a Limpar em package.json

```json
// Remover (não usadas):
"drizzle-orm": "...",
"drizzle-kit": "...",
"vite-express": "...",
"express": "...",
"express-session": "...",
"passport": "...",
"passport-local": "..."

// Manter:
"@headlessui/react": "...",
"@radix-ui/...": "...",
"@tanstack/react-query": "...",
"react-hook-form": "...",
"zod": "..."
```

---

## ⚡ Próximos Passos Imediatos

1. ~~**Agora:** Executar Fase 0.1-0.3 (limpeza de código)~~ ✅
2. ~~**Em seguida:** Fase 0.4-0.5 (limpar dependências)~~ ✅
3. ~~**Importar correções do NAS:** Transação atômica, timeout NAS, feedback validação~~ ✅
4. **AGORA:** Fase 1.7 e 2.5 (testes de gravação) - **Usuário inicia sistema e testa**
5. **Futuro:** Fases 3 e 4 (diretórios e multi-local)

---

## 🔄 Arquivos Importados do NAS (26/12/2024)

Correções funcionais trazidas de `\\MVRXTRIP0523\Trip\00_xFinance\x_finan`:

| Arquivo | Melhoria |
|---------|----------|
| `backend/services/queries/new_inspection.py` | Função `create_inspection_atomic()` |
| `backend/services/directories.py` | Timeout NAS (`_is_nas_reachable`) |
| `backend/routers/new_record.py` | Usa transação atômica |
| `client/src/hooks/use-new-record.ts` | `handleValidationError` + toast |
| `client/src/components/dashboard/modals/NewRecordModal.tsx` | Versão limpa e funcional |
| `client/src/index.css` | CSS `.form-field-error` e `.form-shake` |
| `docs/system/FIX_NEW_RECORD_SUBMIT.md` | Documentação completa das correções |

---

## 📌 Notas Importantes

### Caminhos Críticos

| Recurso | Caminho Correto |
|---------|-----------------|
| Banco SQLite | `E:\MVRX\Financeiro\xFinance_3.0\x_db\xFinanceDB.db` |
| Backend FastAPI | `E:\MVRX\Financeiro\xFinance_3.0\x_finan\backend\` |
| Frontend React | `E:\MVRX\Financeiro\xFinance_3.0\x_finan\client\` |

### Variáveis de Ambiente

```bash
XF_BASE_DIR=E:\MVRX\Financeiro\xFinance_3.0
```

### Controle de Sigilo

Todas as operações de banco devem respeitar a matriz de sigilo definida em `docs/system/SIGILO.md`.

---

*Última atualização: 26/12/2024*

