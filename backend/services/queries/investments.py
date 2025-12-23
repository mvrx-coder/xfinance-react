"""
Queries de Investimentos/Aportes - xFinance

Funções para busca, cálculo de KPIs, highlights e alocação
de investimentos da tabela `finan`.

🔒 SIGILO: Apenas admin tem acesso a estes dados.
"""

import logging
from typing import Any, Optional

from database import get_db

logger = logging.getLogger(__name__)


# =============================================================================
# FETCH ALL (com filtros)
# =============================================================================

def fetch_all_investments(
    investidor: Optional[str] = None,
    instituicao: Optional[str] = None,
    tipo: Optional[str] = None,
    dt_ini: Optional[str] = None,
    dt_fim: Optional[str] = None,
) -> list[dict]:
    """
    Busca todos os investimentos com filtros opcionais.
    
    Args:
        investidor: Filtro por investidor
        instituicao: Filtro por instituição
        tipo: Filtro por tipo de investimento
        dt_ini: Data de aplicação inicial (YYYY-MM-DD)
        dt_fim: Data de aplicação final (YYYY-MM-DD)
    
    Returns:
        Lista de dicts com dados dos investimentos
    """
    clauses = ["1=1"]
    params: list[Any] = []
    
    if investidor:
        clauses.append("investidor = ?")
        params.append(investidor)
    
    if instituicao:
        clauses.append("instituicao = ?")
        params.append(instituicao)
    
    if tipo:
        clauses.append("tipo = ?")
        params.append(tipo)
    
    if dt_ini:
        clauses.append("dt_aplicacao >= ?")
        params.append(dt_ini)
    
    if dt_fim:
        clauses.append("dt_aplicacao <= ?")
        params.append(dt_fim)
    
    where = " AND ".join(clauses)
    
    sql = f"""
        SELECT
            id_finan,
            investidor,
            instituicao,
            tipo,
            detalhe,
            v_aplicado,
            v_bruto,
            v_liquido,
            ganho_perda,
            resgate_bruto,
            rentabilidade,
            dt_aplicacao,
            dt_vence,
            ir_iof
        FROM finan
        WHERE {where}
        ORDER BY dt_vence DESC, id_finan DESC
    """
    
    with get_db() as conn:
        cursor = conn.execute(sql, params)
        rows = cursor.fetchall()
    
    result = []
    for row in rows:
        result.append({
            "id_finan": row["id_finan"],
            "investidor": row["investidor"] or "",
            "instituicao": row["instituicao"] or "",
            "tipo": row["tipo"] or "",
            "detalhe": row["detalhe"] or "",
            "v_aplicado": row["v_aplicado"] or 0.0,
            "v_bruto": row["v_bruto"] or 0.0,
            "v_liquido": row["v_liquido"] or 0.0,
            "ganho_perda": row["ganho_perda"] or 0,
            "resgate_bruto": row["resgate_bruto"] or 0.0,
            "rentabilidade": _parse_rentabilidade(row["rentabilidade"]),
            "dt_aplicacao": row["dt_aplicacao"] or "",
            "dt_vence": row["dt_vence"] or "",
            "ir_iof": row["ir_iof"] or 0.0,
        })
    
    return result


def _parse_rentabilidade(value: Any) -> float:
    """Converte rentabilidade de TEXT para float."""
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    try:
        # Remove % se existir e converte
        clean = str(value).replace("%", "").replace(",", ".").strip()
        return float(clean) if clean else 0.0
    except (ValueError, TypeError):
        return 0.0


# =============================================================================
# FILTROS DISPONÍVEIS
# =============================================================================

def fetch_filter_options() -> dict[str, list[dict]]:
    """
    Busca opções únicas para filtros.
    
    Returns:
        Dict com listas de opções para investidor, instituicao, tipo
    """
    with get_db() as conn:
        # Investidores
        cursor = conn.execute("""
            SELECT DISTINCT investidor FROM finan
            WHERE investidor IS NOT NULL AND investidor != ''
            ORDER BY investidor
        """)
        investidores = [{"label": r["investidor"], "value": r["investidor"]} for r in cursor.fetchall()]
        
        # Instituições
        cursor = conn.execute("""
            SELECT DISTINCT instituicao FROM finan
            WHERE instituicao IS NOT NULL AND instituicao != ''
            ORDER BY instituicao
        """)
        instituicoes = [{"label": r["instituicao"], "value": r["instituicao"]} for r in cursor.fetchall()]
        
        # Tipos
        cursor = conn.execute("""
            SELECT DISTINCT tipo FROM finan
            WHERE tipo IS NOT NULL AND tipo != ''
            ORDER BY tipo
        """)
        tipos = [{"label": r["tipo"], "value": r["tipo"]} for r in cursor.fetchall()]
    
    return {
        "investidores": investidores,
        "instituicoes": instituicoes,
        "tipos": tipos,
    }


# =============================================================================
# KPIs
# =============================================================================

def fetch_kpis(
    investidor: Optional[str] = None,
    instituicao: Optional[str] = None,
    tipo: Optional[str] = None,
    dt_ini: Optional[str] = None,
    dt_fim: Optional[str] = None,
) -> dict[str, float]:
    """
    Calcula KPIs agregados da carteira.
    
    Returns:
        Dict com patrimonio_total, valor_aplicado, resultado, rentabilidade_pct
    """
    data = fetch_all_investments(investidor, instituicao, tipo, dt_ini, dt_fim)
    
    if not data:
        return {
            "patrimonio_total": 0.0,
            "valor_aplicado": 0.0,
            "resultado": 0.0,
            "rentabilidade_pct": 0.0,
        }
    
    patrimonio_total = sum(r["v_bruto"] for r in data)
    valor_aplicado = sum(r["v_aplicado"] for r in data)
    resultado = patrimonio_total - valor_aplicado
    rentabilidade_pct = (resultado / valor_aplicado * 100) if valor_aplicado > 0 else 0.0
    
    return {
        "patrimonio_total": patrimonio_total,
        "valor_aplicado": valor_aplicado,
        "resultado": resultado,
        "rentabilidade_pct": rentabilidade_pct,
    }


# =============================================================================
# HIGHLIGHTS
# =============================================================================

def fetch_highlights(
    investidor: Optional[str] = None,
    instituicao: Optional[str] = None,
    tipo: Optional[str] = None,
    dt_ini: Optional[str] = None,
    dt_fim: Optional[str] = None,
) -> dict[str, dict]:
    """
    Identifica destaques da carteira: Winner, Loser, Maior Posição.
    
    Calcula ganho percentual como: (v_bruto - v_aplicado) / v_aplicado * 100
    
    Returns:
        Dict com winner, loser, maior_posicao (cada um com nome e valor)
    """
    data = fetch_all_investments(investidor, instituicao, tipo, dt_ini, dt_fim)
    
    default = {
        "winner": {"nome": "-", "valor": 0.0},
        "loser": {"nome": "-", "valor": 0.0},
        "maior_posicao": {"nome": "-", "valor": 0.0},
    }
    
    if not data:
        return default
    
    # Calcular ganho percentual para cada registro
    for r in data:
        if r["v_aplicado"] > 0:
            r["ganho_pct"] = (r["v_bruto"] - r["v_aplicado"]) / r["v_aplicado"] * 100
        else:
            r["ganho_pct"] = 0.0
    
    # Filtrar registros com valores válidos
    com_ganho = [r for r in data if r["v_aplicado"] > 0]
    
    # Winner (maior ganho percentual)
    if com_ganho:
        winner = max(com_ganho, key=lambda x: x["ganho_pct"])
        winner_nome = f"{winner['tipo']} {winner['detalhe']}".strip() or "-"
        winner_valor = winner["ganho_pct"]
    else:
        winner_nome = "-"
        winner_valor = 0.0
    
    # Loser (menor ganho percentual / maior perda)
    if com_ganho:
        loser = min(com_ganho, key=lambda x: x["ganho_pct"])
        loser_nome = f"{loser['tipo']} {loser['detalhe']}".strip() or "-"
        loser_valor = loser["ganho_pct"]
    else:
        loser_nome = "-"
        loser_valor = 0.0
    
    # Maior Posição (maior v_bruto)
    com_valor = [r for r in data if r["v_bruto"] > 0]
    if com_valor:
        maior = max(com_valor, key=lambda x: x["v_bruto"])
        maior_nome = f"{maior['tipo']} {maior['detalhe']}".strip() or "-"
        maior_valor = maior["v_bruto"]
    else:
        maior_nome = "-"
        maior_valor = 0.0
    
    return {
        "winner": {"nome": winner_nome, "valor": winner_valor},
        "loser": {"nome": loser_nome, "valor": loser_valor},
        "maior_posicao": {"nome": maior_nome, "valor": maior_valor},
    }


# =============================================================================
# ALOCAÇÃO (para gráfico)
# =============================================================================

def fetch_allocation(
    group_by: str = "tipo",
    investidor: Optional[str] = None,
    instituicao: Optional[str] = None,
    tipo: Optional[str] = None,
    dt_ini: Optional[str] = None,
    dt_fim: Optional[str] = None,
) -> list[dict]:
    """
    Calcula alocação agrupada por campo especificado.
    
    Args:
        group_by: Campo para agrupar (tipo, investidor, instituicao)
    
    Returns:
        Lista de dicts com name, value, percentage, color
    """
    # Validar group_by
    if group_by not in ("tipo", "investidor", "instituicao"):
        group_by = "tipo"
    
    data = fetch_all_investments(investidor, instituicao, tipo, dt_ini, dt_fim)
    
    if not data:
        return []
    
    # Agrupar por campo
    allocation: dict[str, float] = {}
    for r in data:
        campo = r.get(group_by) or "Outros"
        allocation[campo] = allocation.get(campo, 0.0) + r["v_bruto"]
    
    # Calcular total e percentuais
    total = sum(allocation.values())
    
    # Paleta de cores premium
    colors = [
        "#CE62D9",  # Purple/Primary
        "#9B7ED9",  # Light Purple
        "#00BCD4",  # Cyan
        "#F97316",  # Orange
        "#22C55E",  # Green
        "#EAB308",  # Yellow
        "#EC4899",  # Pink
        "#8B5CF6",  # Violet
        "#06B6D4",  # Teal
    ]
    
    result = []
    for i, (name, value) in enumerate(sorted(allocation.items(), key=lambda x: x[1], reverse=True)):
        percentage = (value / total * 100) if total > 0 else 0.0
        result.append({
            "id": name.lower().replace(" ", "-").replace("/", "-"),
            "name": name,
            "value": value,
            "percentage": round(percentage, 1),
            "color": colors[i % len(colors)],
        })
    
    return result


# =============================================================================
# DELETE
# =============================================================================

def delete_investment(id_finan: int) -> bool:
    """
    Remove um investimento pelo ID.
    
    Args:
        id_finan: ID do investimento a remover
    
    Returns:
        True se removido com sucesso
    """
    sql = "DELETE FROM finan WHERE id_finan = ?"
    
    with get_db() as conn:
        cursor = conn.execute(sql, (id_finan,))
        conn.commit()
        return cursor.rowcount > 0
