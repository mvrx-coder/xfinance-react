"""
Queries de KPIs para tela de login - xFinance

Métricas públicas exibidas na página de login.
"""

import logging
from datetime import date
from typing import Any

from database import get_connection

logger = logging.getLogger(__name__)

# Mapeamento de mês numérico para abreviação
MESES = {
    1: "Jan", 2: "Fev", 3: "Mar", 4: "Abr", 5: "Mai", 6: "Jun",
    7: "Jul", 8: "Ago", 9: "Set", 10: "Out", 11: "Nov", 12: "Dez"
}


def fetch_login_kpis() -> dict[str, Any]:
    """
    Busca KPIs para exibição na tela de login.
    
    Regras:
    - Últimos 12 meses = meses "cheios" (ex: se Jan/26, vai de Fev/25 a Jan/26)
    - Quantidade de inspeções = COUNT de registros com dt_inspecao
    - LOC = SUM(loc) onde loc > 0
    - Prazo = dt_entregue - dt_inspecao (em dias)
    
    Returns:
        dict com as métricas calculadas
    """
    hoje = date.today()
    mes_atual_num = hoje.month
    ano_atual = hoje.year
    
    # Mês atual formatado
    mes_atual_str = f"{MESES[mes_atual_num]}/{str(ano_atual)[2:]}"
    
    sql = """
    WITH params AS (
        SELECT 
            date('now', 'start of month') as inicio_mes_atual,
            date('now', 'start of month', '+1 month', '-1 day') as fim_mes_atual,
            date('now', 'start of month', '-11 months') as inicio_12_meses
    ),
    ultimos_12_meses AS (
        SELECT 
            COUNT(*) as total_inspecoes,
            COALESCE(SUM(CASE WHEN loc > 0 THEN loc ELSE 0 END), 0) as total_loc,
            AVG(
                CASE 
                    WHEN dt_entregue IS NOT NULL 
                         AND dt_entregue >= dt_inspecao 
                    THEN JULIANDAY(dt_entregue) - JULIANDAY(dt_inspecao)
                    ELSE NULL 
                END
            ) as prazo_medio_dias
        FROM princ, params
        WHERE dt_inspecao >= params.inicio_12_meses
          AND dt_inspecao IS NOT NULL
    ),
    mes_atual AS (
        SELECT 
            COUNT(*) as inspecoes_mes,
            COALESCE(SUM(CASE WHEN loc > 0 THEN loc ELSE 0 END), 0) as loc_mes,
            AVG(
                CASE 
                    WHEN dt_entregue IS NOT NULL 
                         AND dt_entregue >= dt_inspecao 
                    THEN JULIANDAY(dt_entregue) - JULIANDAY(dt_inspecao)
                    ELSE NULL 
                END
            ) as prazo_mes
        FROM princ, params
        WHERE dt_inspecao >= params.inicio_mes_atual
          AND dt_inspecao <= params.fim_mes_atual
          AND dt_inspecao IS NOT NULL
    ),
    meses_12m AS (
        SELECT 
            CAST(strftime('%m', dt_inspecao) AS INTEGER) as mes_num,
            CAST(strftime('%Y', dt_inspecao) AS INTEGER) as ano,
            COUNT(*) as qtd
        FROM princ, params
        WHERE dt_inspecao >= params.inicio_12_meses
          AND dt_inspecao IS NOT NULL
        GROUP BY strftime('%Y-%m', dt_inspecao)
    ),
    mes_recorde AS (
        SELECT mes_num, ano, qtd
        FROM meses_12m
        ORDER BY qtd DESC
        LIMIT 1
    )
    SELECT 
        COALESCE(u.total_inspecoes, 0) as total_inspecoes_12m,
        COALESCE(u.total_loc, 0) as total_loc_12m,
        u.prazo_medio_dias as prazo_12m,
        COALESCE(m.inspecoes_mes, 0) as inspecoes_mes_atual,
        COALESCE(m.loc_mes, 0) as loc_mes_atual,
        m.prazo_mes as prazo_mes_atual,
        r.mes_num as recorde_mes_num,
        r.ano as recorde_ano,
        COALESCE(r.qtd, 0) as recorde_qtd
    FROM ultimos_12_meses u
    LEFT JOIN mes_atual m ON 1=1
    LEFT JOIN mes_recorde r ON 1=1
    """
    
    with get_connection() as conn:
        cursor = conn.execute(sql)
        row = cursor.fetchone()
    
    if not row:
        logger.warning("Nenhum dado encontrado para KPIs de login")
        return {
            "total_inspecoes_12m": 0,
            "total_loc_12m": 0,
            "mes_recorde": "-",
            "recorde_qtd": 0,
            "mes_atual": mes_atual_str,
            "inspecoes_mes_atual": 0,
            "loc_mes_atual": 0,
            "prazo_medio_12m": None,
            "prazo_medio_mes_atual": None,
        }
    
    # Formatar mês recorde
    if row[6] and row[7]:  # recorde_mes_num, recorde_ano
        mes_recorde_str = f"{MESES.get(row[6], '?')}/{str(row[7])[2:]}"
    else:
        mes_recorde_str = "-"
    
    # Arredondar prazos
    prazo_12m = round(row[2], 1) if row[2] is not None else None
    prazo_mes = round(row[5], 1) if row[5] is not None and row[5] >= 0 else None
    
    result = {
        "total_inspecoes_12m": row[0] or 0,
        "total_loc_12m": row[1] or 0,
        "mes_recorde": mes_recorde_str,
        "recorde_qtd": row[8] or 0,
        "mes_atual": mes_atual_str,
        "inspecoes_mes_atual": row[3] or 0,
        "loc_mes_atual": row[4] or 0,
        "prazo_medio_12m": prazo_12m,
        "prazo_medio_mes_atual": prazo_mes,
    }
    
    logger.debug("KPIs de login calculados: %s", result)
    return result
