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

### Backend FastAPI

| Item | Status |
|------|--------|
| Estrutura | ❌ A criar |
| Rotas API | ❌ A criar |
| Conexão SQLite | ❌ A criar |

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
├── backend/                    # FastAPI (A CRIAR)
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

### Imediato (Backend FastAPI)

1. **Criar estrutura backend/**
   ```
   backend/
   ├── main.py
   ├── config.py
   ├── database.py
   ├── routers/
   │   ├── inspections.py
   │   ├── users.py
   │   ├── kpis.py
   │   └── lookups.py
   └── services/
       └── queries.py
   ```

2. **Migrar Queries SQL do x_main**
   - Copiar de `x_main/app/services/`
   - Adaptar para FastAPI

3. **Conectar Frontend ↔ Backend**
   - Substituir mocks por chamadas reais
   - Testar CRUD completo

### Futuro

4. **Testes E2E**
5. **Deploy unificado**

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
3. ⏳ **Próximo:** Criar backend FastAPI com acesso ao SQLite real

---

*Última atualização: 22/12/2024*
*Projeto: xFinance 3.0 - Migração para React + FastAPI*
