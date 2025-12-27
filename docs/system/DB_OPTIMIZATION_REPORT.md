# 📊 Relatório de Otimização do Banco de Dados xFinance

**Data da Análise:** 27/12/2024  
**Banco:** `xFinance.db` (SQLite)  
**Versão:** 3.0 (React + FastAPI)

---

## 📋 Sumário Executivo

Este relatório analisa a estrutura atual do banco de dados `xFinance.db` e propõe otimizações baseadas nos padrões de acesso observados nas queries do sistema.

### Status Geral

| Categoria | Status | Notas |
|-----------|--------|-------|
| **Índices em Tabela Principal** | 🟢 Bom | 11 índices em `princ` |
| **Índices em FKs** | 🟡 Parcial | Faltam alguns índices em tabelas secundárias |
| **Índices Compostos** | 🔴 Ausentes | Oportunidade de melhoria |
| **Tabelas de Suporte** | 🟡 Parcial | `tempstate`, `demais_locais` sem índices |
| **Normalização** | 🟡 Em Progresso | `segur.segur_nome`, `ativi.atividade` |

---

## 🔍 Análise de Padrões de Acesso

### 1. Grid Principal (`/api/inspections`)

**Operações frequentes:**
- JOINs: `contr`, `user` (2x), `segur`, `ativi`, `tempstate`
- ORDER BY complexo: `ms`, `dt_inspecao`, `dt_envio`, `dt_pago`, `prazo`
- WHERE: `id_user_guilty` (filtro My Job)

**Índices utilizados (já existem):**
- ✅ `idx_princ_ms`
- ✅ `idx_princ_dt_inspecao`
- ✅ `idx_princ_dt_envio`
- ✅ `idx_princ_dt_pago`
- ✅ `idx_princ_id_user_guilty`

### 2. Performance (`/api/performance`)

**Operações frequentes:**
- Filtros por ano: `strftime('%Y', dt_envio/dt_pago/dt_acerto) = ?`
- Agregações: `SUM(honorario)`, `SUM(despesa)`, `SUM(loc)`
- GROUP BY: `id_contr`, `ano`, `mes`

**Observação:** SQLite não pode usar índice em expressões `strftime()` diretamente.

### 3. Tempstate (Marcadores do Grid)

**Operações frequentes:**
- JOIN: `tempstate ts ON ts.state_id_princ = p.id_princ`
- Este JOIN acontece em TODAS as requisições do grid

**⚠️ CRÍTICO:** Não há índice em `tempstate.state_id_princ`!

### 4. Demais Locais

**Operações frequentes:**
- INSERT ao criar inspeção com múltiplos locais
- JOIN por `id_princ`

**⚠️ ATENÇÃO:** Não há índice em `demais_locais.id_princ`!

---

## ✅ Índices Existentes (Corretos)

### Tabela `princ`

| Índice | Coluna(s) | Status |
|--------|-----------|--------|
| `idx_princ_ms` | `ms` | ✅ OK |
| `idx_princ_dt_inspecao` | `dt_inspecao` | ✅ OK |
| `idx_princ_dt_envio` | `dt_envio` | ✅ OK |
| `idx_princ_dt_pago` | `dt_pago` | ✅ OK |
| `idx_princ_prazo` | `prazo` | ✅ OK |
| `idx_princ_dt_acerto` | `dt_acerto` | ✅ OK |
| `idx_princ_id_contr` | `id_contr` | ✅ OK |
| `idx_princ_id_segur` | `id_segur` | ✅ OK |
| `idx_princ_id_ativi` | `id_ativi` | ✅ OK |
| `idx_princ_id_user_guy` | `id_user_guy` | ✅ OK |
| `idx_princ_id_user_guilty` | `id_user_guilty` | ✅ OK |

### Tabelas de Lookup

| Índice | Tabela | Coluna(s) | Status |
|--------|--------|-----------|--------|
| `idx_contr_player` | `contr` | `player` | ✅ OK |
| `idx_segur_nome` | `segur` | `segur_nome` | ⏳ Aguardando normalização |
| `idx_cidade_uf_nome` | `cidade` | `(id_uf, cidade_nome)` | ✅ OK |
| `idx_user_nick` | `user` | `nick` | ✅ OK |
| `idx_ativi_atividade` | `ativi` | `atividade` | ⏳ Aguardando normalização |

---

## 🔴 Índices Faltantes (RECOMENDADOS)

### PRIORIDADE ALTA

#### 1. `tempstate.state_id_princ`

**Justificativa:** JOIN usado em TODA requisição do grid.

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_tempstate_id_princ 
ON tempstate (state_id_princ);
```

**Impacto:** 🔥 Alto - Melhora performance de todas as listagens do grid.

#### 2. `demais_locais.id_princ`

**Justificativa:** FK para `princ`, usada em JOINs e consultas de locais adicionais.

```sql
CREATE INDEX IF NOT EXISTS idx_demais_locais_id_princ 
ON demais_locais (id_princ);
```

**Impacto:** 🔥 Alto - Consultas de inspeções com múltiplos locais.

### PRIORIDADE MÉDIA

#### 3. `cidade.id_uf` (simples)

**Justificativa:** FK para `uf`, usado em JOINs de localização.

```sql
CREATE INDEX IF NOT EXISTS idx_cidade_id_uf 
ON cidade (id_uf);
```

**Impacto:** 📈 Médio - Consultas que filtram cidades por UF.

#### 4. `user.id_papel`

**Justificativa:** Usado em filtros de usuários por papel.

```sql
CREATE INDEX IF NOT EXISTS idx_user_id_papel 
ON user (id_papel);
```

**Impacto:** 📈 Médio - Queries de performance que filtram por papel.

#### 5. `contr.ativo`

**Justificativa:** Filtro comum em Market Share e lookups.

```sql
CREATE INDEX IF NOT EXISTS idx_contr_ativo 
ON contr (ativo);
```

**Impacto:** 📈 Médio - Queries que filtram contratantes ativos.

### PRIORIDADE BAIXA (Futuro)

#### 6. Índice composto para ordenação do grid

**Justificativa:** ORDER BY usa `ms` + `dt_inspecao` frequentemente.

```sql
CREATE INDEX IF NOT EXISTS idx_princ_ms_dt_inspecao 
ON princ (ms, dt_inspecao DESC);
```

**Observação:** Testar impacto antes de aplicar em produção.

---

## 📝 Script de Aplicação

Crie um arquivo `backend/scripts/apply_missing_indexes.py`:

```python
"""
Aplica índices faltantes no xFinance.db
Executar: python backend/scripts/apply_missing_indexes.py
"""

import sqlite3
import os

DB_PATH = os.getenv("XF_DB_PATH", "xFinance.db")

INDEXES = [
    # Prioridade Alta
    ("idx_tempstate_id_princ", "tempstate", "state_id_princ", True),
    ("idx_demais_locais_id_princ", "demais_locais", "id_princ", False),
    
    # Prioridade Média
    ("idx_cidade_id_uf", "cidade", "id_uf", False),
    ("idx_user_id_papel", "user", "id_papel", False),
    ("idx_contr_ativo", "contr", "ativo", False),
]

def apply_indexes():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for idx_name, table, column, unique in INDEXES:
        unique_str = "UNIQUE " if unique else ""
        sql = f"CREATE {unique_str}INDEX IF NOT EXISTS {idx_name} ON {table} ({column})"
        print(f"Aplicando: {sql}")
        try:
            cursor.execute(sql)
            print(f"  ✅ {idx_name} criado/verificado")
        except Exception as e:
            print(f"  ❌ Erro: {e}")
    
    conn.commit()
    conn.close()
    print("\n✅ Índices aplicados com sucesso!")

if __name__ == "__main__":
    apply_indexes()
```

---

## 🛠️ Manutenção Recomendada

### VACUUM (Compactação)

Execute periodicamente para compactar o banco e recuperar espaço:

```sql
VACUUM;
```

**Frequência recomendada:** Mensal ou após muitas exclusões.

### ANALYZE (Estatísticas)

Atualiza estatísticas usadas pelo query planner:

```sql
ANALYZE;
```

**Frequência recomendada:** Após criar novos índices ou importar muitos dados.

### Verificação de Integridade

```sql
PRAGMA integrity_check;
```

**Frequência recomendada:** Antes de backups importantes.

---

## 🚫 Campos em Normalização (NÃO OTIMIZAR AGORA)

| Campo | Tabela | Status |
|-------|--------|--------|
| `segur_nome` | `segur` | ⏳ Em normalização |
| `atividade` | `ativi` | ⏳ Em normalização |

**Aguardar conclusão da normalização antes de criar/modificar índices nesses campos.**

---

## 📊 Estimativa de Impacto

| Otimização | Impacto Esperado | Complexidade |
|------------|------------------|--------------|
| `idx_tempstate_id_princ` | 🔥 20-40% no grid | Baixa |
| `idx_demais_locais_id_princ` | 📈 10-20% em detalhes | Baixa |
| Índices de FK | 📈 5-15% geral | Baixa |
| VACUUM + ANALYZE | 📈 5-10% geral | Baixa |

---

## ✅ Próximos Passos

1. **[ ] Fazer backup do banco** antes de qualquer alteração
2. **[ ] Aplicar índices de Prioridade Alta**
3. **[ ] Executar ANALYZE** após criação de índices
4. **[ ] Testar performance** do grid e performance
5. **[ ] Aplicar índices de Prioridade Média** após validação
6. **[ ] Agendar VACUUM mensal**

---

## 📚 Referências

- [SQLite Index Documentation](https://www.sqlite.org/lang_createindex.html)
- [SQLite Query Planner](https://www.sqlite.org/queryplanner.html)
- [EXPLAIN QUERY PLAN](https://www.sqlite.org/eqp.html)

---

*Última atualização: 27/12/2024*
*Analista: AI Assistant (Claude)*

