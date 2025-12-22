"""
Queries do Grid Principal - xFinance

Baseado em: x_main/services/db/grid.py

Contém:
- Cláusulas ORDER BY complexas
- Função load_grid para carregar dados com permissões
"""

import logging
from typing import Optional

from database import get_db
from services.permissions import fetch_permissoes_cols
from services.queries.column_metadata import get_sql_expression

logger = logging.getLogger(__name__)


# =============================================================================
# CLÁUSULAS ORDER BY
# Copiadas integralmente do x_main para manter comportamento idêntico
# =============================================================================

def _order_head() -> str:
    """Cabeçalho comum de ordenação."""
    return """
        ORDER BY
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN 0
                ELSE 1
            END,
            CASE
                WHEN COALESCE(p.ms, 0) = 1 THEN p.dt_inspecao
                ELSE NULL
            END DESC,
    """


def _order_groups() -> str:
    """Grupos de ordenação (workflow)."""
    return """
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_envio IS NULL AND p.dt_pago IS NULL THEN 1
                        WHEN p.dt_envio IS NOT NULL AND p.dt_pago IS NULL THEN 2
                        WHEN p.dt_pago IS NOT NULL THEN 3
                        ELSE 4
                    END
                ELSE NULL
            END,
    """


def get_order_by_clause(modo_ordenacao: str) -> str:
    """
    Retorna cláusula ORDER BY baseada no modo de ordenação.
    
    Modos suportados: normal, player, prazo.
    """
    if modo_ordenacao == "player":
        return (
            _order_head()
            + _order_groups()
            + """
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_pago IS NOT NULL THEN p.dt_pago
                        ELSE NULL
                    END
                ELSE NULL
            END DESC,
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_pago IS NULL THEN COALESCE(c.player, '')
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_pago IS NULL THEN p.dt_acerto
                        ELSE NULL
                    END
                ELSE NULL
            END DESC
        """
        )
    
    if modo_ordenacao == "prazo":
        return (
            _order_head()
            + _order_groups()
            + """
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_pago IS NOT NULL THEN p.dt_pago
                        ELSE NULL
                    END
                ELSE NULL
            END DESC,
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_pago IS NULL THEN p.prazo
                        ELSE NULL
                    END
                ELSE NULL
            END DESC,
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_pago IS NULL THEN COALESCE(s.segur_nome, '')
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_pago IS NULL THEN p.dt_acerto
                        ELSE NULL
                    END
                ELSE NULL
            END DESC
        """
        )
    
    # Modo "normal" (padrão)
    return (
        _order_head()
        + _order_groups()
        + """
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                CASE
                    WHEN p.dt_envio IS NULL AND p.dt_pago IS NULL THEN p.prazo
                ELSE NULL
                END
                ELSE NULL
            END DESC,
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                CASE
                    WHEN p.dt_envio IS NOT NULL AND p.dt_pago IS NULL THEN p.dt_envio
                ELSE NULL
                END
                ELSE NULL
            END ASC,
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                CASE
                    WHEN p.dt_envio IS NOT NULL AND p.dt_pago IS NULL THEN (julianday('now') - julianday(p.dt_envio))
                ELSE NULL
                END
                ELSE NULL
            END DESC,
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                CASE
                    WHEN p.dt_pago IS NOT NULL THEN p.dt_pago
                ELSE NULL
                END
                ELSE NULL
            END DESC,
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_pago IS NULL THEN COALESCE(s.segur_nome, '')
                        ELSE NULL
                    END
                ELSE NULL
            END,
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_pago IS NULL THEN p.dt_acerto
                        ELSE NULL
                    END
                ELSE NULL
            END DESC
        """
    )


# =============================================================================
# FUNÇÃO PRINCIPAL DE CARREGAMENTO
# =============================================================================

def load_grid(
    papel: str,
    modo_ordenacao: str = "normal",
    limit: Optional[int] = None,
) -> list[dict]:
    """
    Carrega dados do grid principal conforme permissões.
    
    🔒 CRÍTICO: Respeita matriz de sigilo via fetch_permissoes_cols.
    
    Args:
        papel: Papel do usuário (admin, BackOffice, Inspetor)
        modo_ordenacao: Modo de ordenação (normal, player, prazo)
        limit: Limite de registros (opcional)
        
    Returns:
        Lista de dicionários com dados filtrados por permissão
    """
    permissoes = fetch_permissoes_cols(papel)
    
    if not permissoes:
        logger.warning("Sem permissões para papel: %s", papel)
        return []
    
    # Montar colunas SQL
    colunas_sql = []
    for campo_db in permissoes:
        sql_expression = get_sql_expression(campo_db)
        colunas_sql.append(f'{sql_expression} AS "{campo_db}"')
    
    if not colunas_sql:
        logger.warning("Nenhuma coluna válida para papel: %s", papel)
        return []
    
    # Colunas de marcadores (tempstate) - sempre incluir
    marker_columns = [
        'COALESCE(ts.state_loc, 0) AS "state_loc"',
        'COALESCE(ts.state_dt_envio, 0) AS "state_dt_envio"',
        'COALESCE(ts.state_dt_denvio, 0) AS "state_dt_denvio"',
    ]
    colunas_sql.extend(marker_columns)
    
    colunas_sql_str = ",\n        ".join(colunas_sql)
    order_by_clause = get_order_by_clause(modo_ordenacao)
    
    # Montar JOINs dinâmicos
    joins = []
    
    # Contratante (contr)
    if any(k in permissoes for k in ["id_contr", "player"]) or modo_ordenacao == "player":
        joins.append("LEFT JOIN contr c ON p.id_contr = c.id_contr")
    
    # User Guy
    if any(k in permissoes for k in ["id_user_guy", "guy_nick", "guy_honorario", "guy_despesa", "dt_guy_pago", "dt_guy_dpago"]):
        joins.append("LEFT JOIN user guy ON p.id_user_guy = guy.id_user")
    
    # User Guilty (colab)
    if any(k in permissoes for k in ["id_user_guilty", "guilty_nick"]):
        joins.append("LEFT JOIN user colab ON p.id_user_guilty = colab.id_user")
    
    # Seguradora (segur)
    if any(k in permissoes for k in ["id_segur", "segur_nome"]) or modo_ordenacao in ["normal", "prazo"]:
        joins.append("LEFT JOIN segur s ON p.id_segur = s.id_segur")
    
    # Atividade (ativi)
    if any(k in permissoes for k in ["id_ativi", "step_atividade"]):
        joins.append("LEFT JOIN ativi a ON p.id_ativi = a.id_ativi")
    
    # Tempstate - sempre necessário para marcadores
    joins.append("LEFT JOIN tempstate ts ON ts.state_id_princ = p.id_princ")
    
    joins_sql = "\n        ".join(joins)
    
    # Montar query final
    query = f"""
        SELECT
            {colunas_sql_str}
        FROM princ p
        {joins_sql}
        {order_by_clause}
    """
    
    if limit is not None and limit > 0:
        query = f"{query}\nLIMIT {limit}"
    
    logger.debug("Query grid para papel %s (limite=%s)", papel, limit)
    
    # Executar query
    with get_db() as conn:
        conn.row_factory = lambda cursor, row: dict(
            zip([column[0] for column in cursor.description], row)
        )
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
    
    return rows


def count_grid(papel: str) -> int:
    """
    Conta total de registros visíveis para um papel.
    
    Usa contagem simples sem JOINs para performance.
    """
    with get_db() as conn:
        cursor = conn.execute("SELECT COUNT(*) FROM princ")
        return cursor.fetchone()[0]

