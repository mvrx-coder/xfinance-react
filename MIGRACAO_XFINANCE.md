# 🚀 Projeto de Migração: xFinance 3.0

## 📋 Contexto do Projeto

### Origem
O sistema **xFinance** original está em:
- **Localização:** `E:\MVRX\Financeiro\xFinance_3.0\x_main`
- **Stack Atual:** Python + Dash + SQLite
- **Problema:** Interface datada, difícil manutenção

### Destino (este projeto)
- **Localização:** `E:\MVRX\Financeiro\xFinance_3.0\x_finan`
- **Nova Stack:**
  - Frontend: React + TypeScript + Tailwind + Radix UI
  - Backend: **Python FastAPI** (a ser criado - reusar queries SQL)
  - Banco: SQLite (mesmo do x_main)
- **Repositório GitHub:** https://github.com/mvrx-coder/xfinance-react

---

## 🎯 Objetivo

Migrar o xFinance para uma arquitetura moderna mantendo:
1. **Mesma base de dados SQLite** (sem perda de dados)
2. **Mesmas regras de negócio** (queries SQL existentes)
3. **Interface moderna** igual ao xFinder

---

## ✅ Status Atual (Dezembro/2024)

### Frontend React

| Componente | Status | Linhas |
|------------|--------|--------|
| Login | ✅ Pronto | ~150 |
| TopBar com KPIs | ✅ Pronto | ~280 |
| DataGrid principal | ✅ Refatorado | ~640 |
| ActionCenter | ✅ Extraído | ~470 |
| StatusBar | ✅ Pronto | ~80 |
| ToastContainer | ✅ Pronto | ~60 |
| NewRecordModal | ✅ Pronto | ~200 |
| UsersModal | ✅ Pronto | ~180 |
| PerformanceModal | ✅ Refatorado | ~246 |
| └─ KPICard | ✅ Pronto | ~50 |
| └─ PremiumTabs | ✅ Pronto | ~120 |
| └─ DetailsGrid | ✅ Adicionado | ~85 |
| InvestmentsModal | ✅ Refatorado | ~232 |
| └─ PortfolioGrid | ✅ Adicionado | ~110 |
| GuyPayModal | ✅ Pronto | ~200 |

### Estrutura de Código

| Item | Status |
|------|--------|
| Hooks centralizados | ✅ Criados |
| ├─ use-inspections.ts | ✅ CRUD completo |
| ├─ use-kpis.ts | ✅ Com cálculos |
| ├─ use-lookups.ts | ✅ Cache integrado |
| └─ use-filters.ts | ✅ Estado global |
| Services domain | ✅ Criados |
| ├─ formatters.ts | ✅ Moeda/data/número |
| ├─ calculations.ts | ✅ KPIs/agrupamentos |
| └─ validators.ts | ✅ Validações |
| Constants centralizadas | ✅ index.ts |
| Documentação atualizada | ✅ ARCHITECTURE.md |

### Backend FastAPI ✅ IMPLEMENTADO

| Item | Status |
|------|--------|
| Estrutura base | ✅ main.py, config.py, database.py |
| Autenticação | ✅ JWT + Cookie httponly |
| Serviço de permissões | ✅ Consulta tabela `permi` |
| SQLs de ordenação | ✅ Copiados do x_main |
| GET /api/auth/login | ✅ Testado |
| GET /api/auth/me | ✅ Testado |
| GET /api/inspections | ✅ **3078 registros** |
| Sigilo por papel | ✅ Implementado |

---

## 🔧 Arquitetura Atual

```
x_finan/
├── client/                     # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── TopBar.tsx
│   │   │   │   ├── DataGrid.tsx      # ≤640 linhas
│   │   │   │   ├── ActionCenter.tsx  # Extraído do DataGrid
│   │   │   │   └── modals/
│   │   │   │       ├── PerformanceModal.tsx
│   │   │   │       │   └── performance/
│   │   │   │       │       ├── DetailsGrid.tsx
│   │   │   │       │       └── data.ts
│   │   │   │       ├── InvestmentsModal.tsx
│   │   │   │       │   └── investments/
│   │   │   │       │       ├── PortfolioGrid.tsx
│   │   │   │       │       └── data.ts
│   │   │   │       └── ...
│   │   │   └── ui/             # shadcn/radix
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   └── Dashboard.tsx
│   │   │
│   │   ├── hooks/              # ✅ NOVO
│   │   │   ├── index.ts        # Re-exports
│   │   │   ├── use-inspections.ts
│   │   │   ├── use-kpis.ts
│   │   │   ├── use-lookups.ts
│   │   │   └── use-filters.ts
│   │   │
│   │   ├── services/           # ✅ REORGANIZADO
│   │   │   ├── api/            # Chamadas HTTP
│   │   │   │   ├── acoes.ts
│   │   │   │   └── lookups.ts
│   │   │   └── domain/         # Lógica de negócio
│   │   │       ├── formatters.ts
│   │   │       ├── calculations.ts
│   │   │       └── validators.ts
│   │   │
│   │   ├── constants/          # ✅ NOVO
│   │   │   └── index.ts        # GRID_CONFIG, API_ENDPOINTS
│   │   │
│   │   └── lib/
│   │       └── queryClient.ts
│   │
│   └── index.html
│
├── backend/                    # FastAPI ✅ CRIADO
│   ├── main.py                 # Entry point
│   ├── config.py               # Configurações
│   ├── database.py             # Conexão SQLite
│   ├── dependencies.py         # CurrentUser, require_admin
│   ├── routers/
│   │   ├── auth.py             # Login/logout/me
│   │   └── inspections.py      # CRUD inspeções
│   └── services/
│       ├── auth.py             # JWT + bcrypt
│       ├── permissions.py      # Sigilo por papel
│       └── queries/
│           ├── column_metadata.py
│           └── grid.py         # SQLs complexas
├── shared/
│   └── schema.ts               # Drizzle SQLite
└── docs/
    └── system/                 # Documentação atualizada
```

---

## 📊 Referência: Sistema Original (x_main)

### Estrutura do x_main
```
x_main/
├── xFinance_NG.py         # App principal Dash
├── app/
│   ├── components/        # Componentes Dash
│   │   ├── layout.py
│   │   └── modals/
│   │       ├── finance.py     # → PerformanceModal
│   │       └── investments.py # → InvestmentsModal
│   ├── database/
│   │   └── db_conn.py
│   └── services/
└── database/
    └── xfinance.db
```

### Mapeamento de Telas

| x_main (Dash) | x_finan (React) |
|---------------|-----------------|
| finance.py | PerformanceModal + performance/ |
| investments.py | InvestmentsModal + investments/ |
| users.py | UsersModal |
| guy_pay.py | GuyPayModal |
| new_record.py | NewRecordModal |

---

## 📝 Próximos Passos

### ✅ Concluído (Fase 1 e 2)

1. ✅ **Estrutura backend/** criada
2. ✅ **Autenticação JWT** funcionando
3. ✅ **Queries SQL migradas** do x_main
4. ✅ **GET /api/inspections** retornando 3078 registros
5. ✅ **Sigilo por papel** implementado

### ✅ Concluído (Fase 3 - Integração)

6. ✅ **Conectar Frontend ↔ Backend**
   - ✅ Integrar `Login.tsx` com `/api/auth/login`
   - ✅ Integrar `DataGrid` com `/api/inspections`
   - ✅ JOINs funcionando (Player, Segurado, Guilty, Guy, Atividade)
   - ✅ Formatação de datas (DD/MM)
   - ✅ Coluna Observação funcionando
   - [ ] Implementar `/api/kpis`
   - [ ] Implementar `/api/lookups/*`

### 📋 NOVO: Plano de Migração do Grid

> **📊 Ver `docs/GRID_MIGRATION.md` para plano completo**

O grid é o CORAÇÃO do sistema. Antes de prosseguir, mapeamos TODAS as funcionalidades:

| Fase | Itens | Status |
|------|-------|--------|
| Base de Dados | id_princ, state_*, status | ⏳ Pendente |
| Seleção e Contexto | Seleção de linha, id_princ | ⏳ Pendente |
| Central de Ações | Encaminhar, Excluir | ⏳ Pendente |
| Marcadores | Pílulas azul/amarelo/vermelho | ⏳ Pendente |
| Edição Inline | Datas, moedas, texto | ⏳ Pendente |
| Cores Condicionais | gpay-*, delivery-* | ⏳ Pendente |
| Colunas Calculadas | SW, prazo | ⏳ Pendente |
| Ordenação | normal, player, prazo | ⏳ Pendente |
| Grupos de Colunas | Workflow, Recebíveis, Pagamentos | ⏳ Pendente |
| Filtros | My Job, DB Limit | ⏳ Pendente |

### Futuro (Fase 4+)

7. **CRUD Completo**
   - POST /api/inspections (criar)
   - PATCH /api/inspections/{id} (editar)
   - DELETE /api/inspections/{id} (excluir)
8. **Testes E2E**
9. **Deploy unificado**

---

## ⚠️ Pontos Resolvidos

### ✅ Schema Drizzle (RESOLVIDO)
- Convertido de `pgTable` para `sqliteTable`
- Campos alinhados com DDL original (`id_princ`, `id_contr`, etc.)

### ✅ Nomenclaturas (RESOLVIDO)
- Frontend usa nomes compatíveis com banco SQLite
- Ver `docs/system/schema/MAPEAMENTO_CAMPOS.md`

### ✅ Componentes grandes (RESOLVIDO)
- DataGrid: 1129 → 640 linhas (extraído ActionCenter)
- PerformanceModal: 810 → 246 linhas (sub-componentes)
- InvestmentsModal: 601 → 232 linhas (sub-componentes)

---

## 🔗 Links Úteis

- **xFinance original:** `E:\MVRX\Financeiro\xFinance_3.0\x_main`
- **xFinder (referência UI):** `E:\MVRX\Financeiro\xFinance_3.0\x_finder`
- **Este projeto:** `E:\MVRX\Financeiro\xFinance_3.0\x_finan`
- **GitHub:** https://github.com/mvrx-coder/xfinance-react

---

## 📞 Instruções para Continuar

1. ✅ Frontend React prototipado e refatorado
2. ✅ Rodando localmente em `http://localhost:5173`
3. ✅ Backend FastAPI funcionando em `http://localhost:8000`
4. ✅ **3078 inspeções** carregadas do SQLite real
5. ✅ **Frontend integrado com backend** (login + grid)
6. ⏳ **Próximo:** Seguir plano em `docs/GRID_MIGRATION.md`

### Comandos para Rodar

```powershell
# Backend (terminal 1)
cd E:\MVRX\Financeiro\xFinance_3.0\x_finan\backend
.\.venv\Scripts\Activate.ps1
$env:XF_BASE_DIR="E:\MVRX\Financeiro\xFinance_3.0"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# Frontend (terminal 2)
cd E:\MVRX\Financeiro\xFinance_3.0\x_finan
npm run dev
```

### Testar Login

```powershell
# Usuário de teste (senha resetada)
# Email: AGR@teste.com
# Senha: admin123
```

---

*Última atualização: 22/12/2024*
*Projeto: xFinance 3.0 - Migração para React + FastAPI*
