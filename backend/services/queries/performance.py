"""
Queries de Performance - xFinance

Adaptado de: x_main/app/callbacks/finance/queries.py

Contém queries para:
- KPIs (Honorários, Despesas, Resultado Operacional, Inspeções)
- Market Share (por contratante)
- Business (honorários por ano/mês)
- Operational (honorários por operador/ano)
- Details (grid detalhado)
"""

import logging
from typing import Any, Optional

from database import get_db

logger = logging.getLogger(__name__)


# =============================================================================
# CONSTANTES - SQL JOINS
# =============================================================================

JOINS = """
    LEFT JOIN contr c ON p.id_contr = c.id_contr
    LEFT JOIN segur s ON p.id_segur = s.id_segur
    LEFT JOIN user ug ON p.id_user_guilty = ug.id_user
    LEFT JOIN user uy ON p.id_user_guy = uy.id_user
    LEFT JOIN ativi a ON p.id_ativi = a.id_ativi
    LEFT JOIN uf u ON p.id_uf = u.id_uf
    LEFT JOIN cidade cid ON p.id_cidade = cid.id_cidade
"""


# =============================================================================
# HELPERS
# =============================================================================

def _build_where(
    base_date: str = "dt_envio",
    ano_ini: Optional[int] = None,
    ano_fim: Optional[int] = None,
    mm12: bool = False,
) -> tuple[str, list[Any]]:
    """
    Constrói cláusula WHERE para queries de performance.
    
    Args:
        base_date: Campo de data base (dt_envio, dt_pago, dt_acerto)
        ano_ini: Ano inicial do filtro
        ano_fim: Ano final do filtro
        mm12: Se True, expande range para cálculo de média móvel 12 meses
    
    Returns:
        Tuple (where_clause, params)
    """
    clauses = [f"p.{base_date} IS NOT NULL"]
    params: list[Any] = []
    
    if ano_ini and ano_fim:
        anos = list(range(ano_ini, ano_fim + 1))
        
        # Se MM12 ativo, precisamos buscar 11 meses antes do ano inicial
        if mm12:
            anos_set = set(anos)
            anos_set.update({a - 1 for a in anos})
            anos = sorted(anos_set)
        
        placeholders = ",".join(["?"] * len(anos))
        clauses.append(f"CAST(strftime('%Y', p.{base_date}) AS INTEGER) IN ({placeholders})")
        params.extend(anos)
    elif ano_ini:
        clauses.append(f"CAST(strftime('%Y', p.{base_date}) AS INTEGER) >= ?")
        params.append(ano_ini)
    elif ano_fim:
        clauses.append(f"CAST(strftime('%Y', p.{base_date}) AS INTEGER) <= ?")
        params.append(ano_fim)
    
    where_clause = " AND ".join(clauses) if clauses else "1=1"
    return where_clause, params


# =============================================================================
# FILTROS DISPONÍVEIS
# =============================================================================

def fetch_filter_options() -> dict[str, list[dict]]:
    """
    Busca opções para filtros de ano.
    
    Returns:
        Dict com 'anos': lista de {label, value}
    """
    sql = """
        SELECT DISTINCT CAST(strftime('%Y', dt_envio) AS INTEGER) AS ano FROM princ
        WHERE dt_envio IS NOT NULL
        UNION
        SELECT DISTINCT CAST(strftime('%Y', dt_pago) AS INTEGER) FROM princ
        WHERE dt_pago IS NOT NULL
        UNION
        SELECT DISTINCT CAST(strftime('%Y', dt_acerto) AS INTEGER) FROM princ
        WHERE dt_acerto IS NOT NULL
        ORDER BY ano DESC
    """
    
    with get_db() as conn:
        cursor = conn.execute(sql)
        rows = cursor.fetchall()
    
    anos = [
        {"label": str(row["ano"]), "value": row["ano"]}
        for row in rows
        if row["ano"] is not None
    ]
    
    return {"anos": anos}


# =============================================================================
# KPIs
# =============================================================================

def fetch_kpis(
    base_date: str = "dt_envio",
    ano_ini: Optional[int] = None,
    ano_fim: Optional[int] = None,
) -> dict[str, float]:
    """
    Busca KPIs financeiros agregados.
    
    KPIs:
    - honorarios: Soma de princ.honorario
    - despesas: Soma de princ.despesa
    - resultado_oper: honorarios - despesas
    - inspecoes: Soma de princ.loc (localidades inspecionadas)
    
    Returns:
        Dict com valores dos KPIs
    """
    where_clause, params = _build_where(base_date, ano_ini, ano_fim)
    
    sql = f"""
        SELECT
            SUM(COALESCE(p.honorario, 0)) AS honorarios,
            SUM(COALESCE(p.despesa, 0)) AS despesas,
            SUM(COALESCE(p.honorario, 0) - COALESCE(p.despesa, 0)) AS resultado_oper,
            SUM(COALESCE(p.loc, 0)) AS inspecoes
        FROM princ p
        {JOINS}
        WHERE {where_clause}
    """
    
    with get_db() as conn:
        cursor = conn.execute(sql, params)
        row = cursor.fetchone()
    
    if not row:
        return {
            "honorarios": 0,
            "despesas": 0,
            "resultado_oper": 0,
            "inspecoes": 0,
        }
    
    return {
        "honorarios": float(row["honorarios"] or 0),
        "despesas": float(row["despesas"] or 0),
        "resultado_oper": float(row["resultado_oper"] or 0),
        "inspecoes": int(row["inspecoes"] or 0),
    }


# =============================================================================
# MARKET SHARE
# =============================================================================

def fetch_market_share(
    base_date: str = "dt_envio",
    ano_ini: Optional[int] = None,
    ano_fim: Optional[int] = None,
) -> list[dict]:
    """
    Busca Market Share: honorários por contratante (player).
    
    Regras:
    - Apenas players ativos (c.ativo = 1)
    - Apenas players com honorários > 0 no período
    - Ordenado por honorários DESC
    - Retorna percentual do total
    
    Returns:
        Lista de {name, value (%), honorarios, jobs, color}
    """
    where_clause, params = _build_where(base_date, ano_ini, ano_fim)
    
    sql = f"""
        SELECT
            COALESCE(c.player, '—') AS contratante,
            SUM(COALESCE(p.honorario, 0)) AS honorarios,
            COUNT(*) AS jobs
        FROM princ p
        {JOINS}
        WHERE {where_clause}
          AND c.ativo = 1
        GROUP BY c.id_contr, c.player
        HAVING SUM(COALESCE(p.honorario, 0)) > 0
        ORDER BY honorarios DESC
        LIMIT 12
    """
    
    with get_db() as conn:
        cursor = conn.execute(sql, params)
        rows = cursor.fetchall()
    
    if not rows:
        return []
    
    # Calcular total para percentual
    total = sum(row["honorarios"] for row in rows)
    if total == 0:
        total = 1  # Evita divisão por zero
    
    # Paleta de cores para market share
    colors = [
        "#CE62D9", "#9B7ED9", "#00BCD4", "#22C55E", "#F97316",
        "#EAB308", "#EC4899", "#8B5CF6", "#06B6D4", "#84CC16",
        "#F43F5E", "#A855F7"
    ]
    
    result = []
    for i, row in enumerate(rows):
        result.append({
            "name": row["contratante"],
            "value": round((row["honorarios"] / total) * 100, 1),
            "honorarios": float(row["honorarios"]),
            "jobs": row["jobs"],
            "color": colors[i % len(colors)],
        })
    
    return result


# =============================================================================
# BUSINESS (HONORÁRIOS POR ANO/MÊS)
# =============================================================================

def fetch_business(
    base_date: str = "dt_envio",
    ano_ini: Optional[int] = None,
    ano_fim: Optional[int] = None,
    mm12: bool = False,
) -> dict:
    """
    Busca dados para gráfico Business: honorários por ano/mês.
    
    Args:
        base_date: Campo de data base
        ano_ini: Ano inicial
        ano_fim: Ano final
        mm12: Se True, calcula média móvel 12 meses
    
    Returns:
        Dict com 'months' e 'series' (dados por ano)
    """
    where_clause, params = _build_where(base_date, ano_ini, ano_fim, mm12)
    
    sql = f"""
        SELECT
            CAST(strftime('%Y', p.{base_date}) AS INTEGER) AS ano,
            CAST(strftime('%m', p.{base_date}) AS INTEGER) AS mes,
            SUM(COALESCE(p.honorario, 0)) AS honorarios
        FROM princ p
        {JOINS}
        WHERE {where_clause}
        GROUP BY ano, mes
        ORDER BY ano ASC, mes ASC
    """
    
    with get_db() as conn:
        cursor = conn.execute(sql, params)
        rows = cursor.fetchall()
    
    if not rows:
        return {"months": [], "series": []}
    
    # Organizar dados por ano
    anos_data: dict[int, dict[int, float]] = {}
    for row in rows:
        ano = row["ano"]
        mes = row["mes"]
        if ano not in anos_data:
            anos_data[ano] = {}
        anos_data[ano][mes] = float(row["honorarios"])
    
    # Se MM12 ativo, calcular soma dos últimos 12 meses
    if mm12:
        # Para cada ano/mês, somar os últimos 12 meses
        anos_mm12: dict[int, dict[int, float]] = {}
        for ano in sorted(anos_data.keys()):
            if ano not in anos_mm12:
                anos_mm12[ano] = {}
            for mes in range(1, 13):
                soma = 0.0
                count = 0
                for i in range(12):
                    m = mes - i
                    a = ano
                    if m <= 0:
                        m += 12
                        a -= 1
                    if a in anos_data and m in anos_data[a]:
                        soma += anos_data[a][m]
                        count += 1
                if count >= 12:  # Só mostra se tiver 12 meses completos
                    anos_mm12[ano][mes] = soma
        anos_data = anos_mm12
    
    # Filtrar apenas anos selecionados (após cálculo MM12)
    if ano_ini and ano_fim:
        anos_filtrados = set(range(ano_ini, ano_fim + 1))
        anos_data = {a: v for a, v in anos_data.items() if a in anos_filtrados}
    
    # Cores por ano
    year_colors = {
        2020: "#94A3B8",
        2021: "#F97316",
        2022: "#00BCD4",
        2023: "#22C55E",
        2024: "#EAB308",
        2025: "#CE62D9",
        2026: "#8B5CF6",
    }
    
    # Montar estrutura de retorno
    months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
    series = []
    
    for ano in sorted(anos_data.keys()):
        data = []
        for mes in range(1, 13):
            valor = anos_data[ano].get(mes, 0)
            # Converter para milhares para escala do gráfico
            data.append(round(valor / 1000, 1))
        
        series.append({
            "year": ano,
            "color": year_colors.get(ano, "#9B7ED9"),
            "data": data,
        })
    
    return {"months": months, "series": series}


# =============================================================================
# OPERATIONAL (HONORÁRIOS POR OPERADOR/ANO)
# =============================================================================

def fetch_operational(
    base_date: str = "dt_envio",
    ano_ini: Optional[int] = None,
    ano_fim: Optional[int] = None,
) -> list[dict]:
    """
    Busca dados para gráfico Operational: honorários por operador/ano.
    
    Regras:
    - Apenas usuários com id_papel = 1 ou 3 (guys)
    - Apenas registros onde princ.id_user_guy não é nulo/zero
    - Agrupado por ano e usuário
    - Ordenado alfabeticamente por short_nome
    
    Returns:
        Lista de operadores com seus dados por ano
    """
    where_clause, params = _build_where(base_date, ano_ini, ano_fim)
    
    # Adicionar filtros específicos
    extra_clauses = """
        AND p.id_user_guy IS NOT NULL
        AND p.id_user_guy != 0
        AND uy.id_papel IN (1, 3)
    """
    
    sql = f"""
        SELECT
            COALESCE(uy.short_nome, uy.nick) AS operador,
            CAST(strftime('%Y', p.{base_date}) AS INTEGER) AS ano,
            SUM(COALESCE(p.honorario, 0)) AS honorarios
        FROM princ p
        {JOINS}
        WHERE {where_clause}
        {extra_clauses}
        GROUP BY uy.id_user, COALESCE(uy.short_nome, uy.nick), ano
        HAVING SUM(COALESCE(p.honorario, 0)) > 0
        ORDER BY operador ASC, ano ASC
    """
    
    with get_db() as conn:
        cursor = conn.execute(sql, params)
        rows = cursor.fetchall()
    
    if not rows:
        return []
    
    # Calcular total por ano para percentuais
    totais_ano: dict[int, float] = {}
    for row in rows:
        ano = row["ano"]
        totais_ano[ano] = totais_ano.get(ano, 0) + row["honorarios"]
    
    # Organizar por operador
    operadores_data: dict[str, list[dict]] = {}
    for row in rows:
        operador = row["operador"]
        ano = row["ano"]
        honorarios = float(row["honorarios"])
        total_ano = totais_ano.get(ano, 1)
        percentual = round((honorarios / total_ano) * 100, 1)
        
        if operador not in operadores_data:
            operadores_data[operador] = []
        
        operadores_data[operador].append({
            "year": ano,
            "value": honorarios,
            "percentage": percentual,
        })
    
    # Montar resultado
    result = []
    for operador in sorted(operadores_data.keys()):
        result.append({
            "name": operador,
            "years": operadores_data[operador],
        })
    
    return result


# =============================================================================
# DETAILS (GRID DETALHADO)
# =============================================================================

def fetch_details(
    base_date: str = "dt_envio",
    ano_ini: Optional[int] = None,
    ano_fim: Optional[int] = None,
    limit: int = 100,
    offset: int = 0,
) -> dict:
    """
    Busca dados detalhados para grid.
    
    Args:
        base_date: Campo de data base
        ano_ini: Ano inicial
        ano_fim: Ano final
        limit: Máximo de registros
        offset: Pular N registros
    
    Returns:
        Dict com 'data' (lista de registros) e 'total' (total de registros)
    """
    where_clause, params = _build_where(base_date, ano_ini, ano_fim)
    
    # Query de contagem
    count_sql = f"""
        SELECT COUNT(*) as total
        FROM princ p
        {JOINS}
        WHERE {where_clause}
    """
    
    # Query de dados
    sql = f"""
        SELECT
            p.id_princ,
            p.{base_date} AS data_base,
            p.dt_envio,
            p.dt_pago,
            p.dt_acerto,
            p.honorario,
            p.despesa,
            p.guy_honorario,
            p.guy_despesa,
            p.meta,
            p.prazo,
            p.loc,
            c.player AS contratante,
            s.segur_nome AS segurado,
            ug.nick AS guilty,
            uy.nick AS guy,
            a.atividade AS atividade,
            u.uf_sigla AS uf,
            cid.cidade_nome AS cidade
        FROM princ p
        {JOINS}
        WHERE {where_clause}
        ORDER BY p.{base_date} DESC
        LIMIT ? OFFSET ?
    """
    
    with get_db() as conn:
        # Total
        cursor = conn.execute(count_sql, params)
        total_row = cursor.fetchone()
        total = total_row["total"] if total_row else 0
        
        # Dados
        cursor = conn.execute(sql, params + [limit, offset])
        rows = cursor.fetchall()
    
    # Converter para lista de dicts
    data = []
    for row in rows:
        data.append({
            "id": row["id_princ"],
            "dataBase": row["data_base"],
            "dtEnvio": row["dt_envio"],
            "dtPago": row["dt_pago"],
            "dtAcerto": row["dt_acerto"],
            "honorario": float(row["honorario"] or 0),
            "despesa": float(row["despesa"] or 0),
            "guyHonorario": float(row["guy_honorario"] or 0),
            "guyDespesa": float(row["guy_despesa"] or 0),
            "meta": row["meta"],
            "prazo": row["prazo"],
            "loc": row["loc"],
            "contratante": row["contratante"],
            "segurado": row["segurado"],
            "guilty": row["guilty"],
            "guy": row["guy"],
            "atividade": row["atividade"],
            "uf": row["uf"],
            "cidade": row["cidade"],
        })
    
    return {"data": data, "total": total}
