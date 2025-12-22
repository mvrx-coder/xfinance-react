# 🔄 Mapeamento de Campos: SQLite ↔ TypeScript

Este documento mapeia os campos do banco SQLite original para os nomes usados no TypeScript/React.

---

## 📊 Tabela Principal: `princ` → `Inspection`

### Campos Diretos (mesmo nome)

| SQLite (`princ`) | TypeScript | Tipo |
|------------------|------------|------|
| `loc` | `loc` | `number \| null` |
| `prazo` | `prazo` | `number \| null` |
| `meta` | `meta` | `string \| null` |
| `obs` | `obs` | `string \| null` |
| `ms` | `ms` | `number` (0 ou 1) |

### Campos Renomeados

| SQLite (`princ`) | TypeScript | Tipo | Observação |
|------------------|------------|------|------------|
| `id_princ` | `idPrinc` | `number` | PK |
| `dt_inspecao` | `dtInspecao` | `string \| null` | Data ISO |
| `dt_entregue` | `dtEntregue` | `string \| null` | Data ISO |
| `dt_acerto` | `dtAcerto` | `string \| null` | Data ISO |
| `dt_envio` | `dtEnvio` | `string \| null` | Data ISO |
| `dt_pago` | `dtPago` | `string \| null` | Data ISO |
| `honorario` | `honorario` | `number \| null` | Valor R$ |
| `dt_denvio` | `dtDenvio` | `string \| null` | Data ISO |
| `dt_dpago` | `dtDpago` | `string \| null` | Data ISO |
| `despesa` | `despesa` | `number \| null` | Valor R$ |
| `dt_guy_pago` | `dtGuyPago` | `string \| null` | Data ISO |
| `guy_honorario` | `guyHonorario` | `number \| null` | Valor R$ |
| `dt_guy_dpago` | `dtGuyDpago` | `string \| null` | Data ISO |
| `guy_despesa` | `guyDespesa` | `number \| null` | Valor R$ |

### Campos com JOIN (vêm de outras tabelas)

| Campo TypeScript | Origem (JOINs) | Tipo |
|------------------|----------------|------|
| `player` | `contr.player` via `id_contr` | `string \| null` |
| `segurado` | `segur.segur_nome` via `id_segur` | `string \| null` |
| `nickGuilty` | `user.nick` via `id_user_guilty` | `string \| null` |
| `nickGuy` | `user.nick` via `id_user_guy` | `string \| null` |
| `atividade` | `ativi.atividade` via `id_ativi` | `string \| null` |
| `uf` | `uf.uf_sigla` via `id_uf` | `string \| null` |
| `cidade` | `cidade.cidade_nome` via `id_cidade` | `string \| null` |

### IDs de Foreign Key (para updates)

| SQLite | TypeScript | Descrição |
|--------|------------|-----------|
| `id_contr` | `idContr` | FK → contr |
| `id_segur` | `idSegur` | FK → segur |
| `id_ativi` | `idAtivi` | FK → ativi |
| `id_user_guilty` | `idUserGuilty` | FK → user |
| `id_user_guy` | `idUserGuy` | FK → user |
| `id_uf` | `idUf` | FK → uf |
| `id_cidade` | `idCidade` | FK → cidade |

---

## 📈 KPIs Express

### Cálculo no Backend

```sql
-- Express = Honorários pendentes - GHonorários pendentes
SELECT
    SUM(CASE WHEN dt_pago IS NULL THEN honorario ELSE 0 END) AS honorarios_pendentes,
    SUM(CASE WHEN dt_guy_pago IS NULL THEN guy_honorario ELSE 0 END) AS guy_honorarios_pendentes,
    SUM(CASE WHEN dt_dpago IS NULL THEN despesa ELSE 0 END) AS despesas_pendentes,
    SUM(CASE WHEN dt_guy_dpago IS NULL THEN guy_despesa ELSE 0 END) AS guy_despesas_pendentes
FROM princ
WHERE ms = 0  -- Apenas registros não marcados
```

### Interface TypeScript

```typescript
interface KPIs {
  express: number;      // honorarios_pendentes - guy_honorarios_pendentes
  honorarios: number;   // Total honorários pendentes
  guyHonorario: number; // Total guy_honorarios pendentes
  despesas: number;     // Total despesas pendentes
  guyDespesa: number;   // Total guy_despesas pendentes
}
```

---

## 🔍 Filtros

### FilterState

```typescript
interface FilterState {
  player: boolean;      // Filtra por id_contr do usuário logado
  myJob: boolean;       // Filtra por id_user_guy do usuário logado
  dbLimit: boolean;     // Limita a N registros recentes
  columnGroups: {
    workflow: boolean;    // Mostra colunas: dtInspecao, dtEntregue, prazo
    recebiveis: boolean;  // Mostra colunas: dtAcerto, dtEnvio, dtPago, honorario, dtDenvio, dtDpago, despesa
    pagamentos: boolean;  // Mostra colunas: dtGuyPago, guyHonorario, dtGuyDpago, guyDespesa
  };
}
```

---

## 📝 Query Base do Grid

```sql
SELECT
    p.id_princ,
    c.player,
    s.segur_nome AS segurado,
    p.loc,
    ug.nick AS nick_guilty,
    ui.nick AS nick_guy,
    CASE WHEN p.meta = 1 THEN 'Sim' ELSE 'Não' END AS meta,
    p.dt_inspecao,
    p.dt_entregue,
    p.prazo,
    p.dt_acerto,
    p.dt_envio,
    p.dt_pago,
    p.honorario,
    p.dt_denvio,
    p.dt_dpago,
    p.despesa,
    p.dt_guy_pago,
    p.guy_honorario,
    p.dt_guy_dpago,
    p.guy_despesa,
    a.atividade,
    p.obs,
    p.ms,
    uf.uf_sigla AS uf,
    ci.cidade_nome AS cidade
FROM princ p
LEFT JOIN contr c ON p.id_contr = c.id_contr
LEFT JOIN segur s ON p.id_segur = s.id_segur
LEFT JOIN user ug ON p.id_user_guilty = ug.id_user
LEFT JOIN user ui ON p.id_user_guy = ui.id_user
LEFT JOIN ativi a ON p.id_ativi = a.id_ativi
LEFT JOIN uf ON p.id_uf = uf.id_uf
LEFT JOIN cidade ci ON p.id_cidade = ci.id_cidade
WHERE p.ms = 0
ORDER BY p.dt_inspecao DESC
LIMIT 500;
```

---

## ⚠️ Atenção: Campos que NÃO existem no banco

Estes campos são **calculados** ou **derivados**, não existem como colunas:

| Campo UI | Origem |
|----------|--------|
| `sw` | Calculado (semana do ano de dt_inspecao) |
| Status de pagamento | Derivado de dt_pago IS NULL |

---

*Última atualização: Dezembro/2024*

