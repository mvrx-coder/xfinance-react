"""
Queries do Grid Principal - xFinance

Baseado em: x_main/services/db/grid.py

Contém:
- Cláusulas ORDER BY complexas
- Função load_grid para carregar dados com permissões
- Cálculo de status para cores condicionais
"""

import logging
from datetime import datetime, date
from typing import Optional

from database import get_db
from services.permissions import fetch_permissoes_cols
from services.queries.column_metadata import get_sql_expression

logger = logging.getLogger(__name__)


# =============================================================================
# CÁLCULO DE STATUS (para cores condicionais)
# =============================================================================

def _compute_payment_status(date_str: Optional[str]) -> str:
    """
    Calcula status de pagamento baseado na data.
    
    Retorna:
        - "past": Data preenchida e anterior a hoje
        - "today": Data preenchida e igual a hoje
        - "": Data vazia ou nula
    """
    if not date_str or str(date_str).strip() in ("", "None", "nan"):
        return ""
    
    try:
        # Parse da data (formato YYYY-MM-DD)
        dt = datetime.strptime(str(date_str)[:10], "%Y-%m-%d").date()
        today = date.today()
        
        if dt < today:
            return "past"
        elif dt == today:
            return "today"
        return ""
    except (ValueError, TypeError):
        return ""


def _compute_delivery_status(dt_entregue: Optional[str], dt_envio: Optional[str]) -> str:
    """
    Calcula status de entrega para destaque visual.
    
    Retorna "highlight" se dt_entregue preenchido e dt_envio vazio.
    """
    entregue = str(dt_entregue or "").strip()
    envio = str(dt_envio or "").strip()
    
    if entregue and entregue not in ("", "None", "nan") and (not envio or envio in ("", "None", "nan")):
        return "highlight"
    return ""


def _enrich_with_status(rows: list[dict]) -> list[dict]:
    """
    Enriquece rows com campos de status calculados.
    
    Adiciona:
        - dt_guy_pago__status
        - dt_guy_dpago__status
        - dt_dpago__status
        - delivery_status
    """
    for row in rows:
        # Status de pagamento do Guy
        row["dt_guy_pago__status"] = _compute_payment_status(row.get("dt_guy_pago"))
        row["dt_guy_dpago__status"] = _compute_payment_status(row.get("dt_guy_dpago"))
        
        # Status de pagamento de despesas
        row["dt_dpago__status"] = _compute_payment_status(row.get("dt_dpago"))
        
        # Status de entrega (para destaque visual)
        row["delivery_status"] = _compute_delivery_status(
            row.get("dt_entregue"),
            row.get("dt_envio")
        )
    
    return rows


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
    my_job_user_id: Optional[int] = None,
) -> list[dict]:
    """
    Carrega dados do grid principal conforme permissões.
    
    🔒 CRÍTICO: Respeita matriz de sigilo via fetch_permissoes_cols.
    
    Args:
        papel: Papel do usuário (admin, BackOffice, Inspetor)
        modo_ordenacao: Modo de ordenação (normal, player, prazo)
        limit: Limite de registros (opcional)
        my_job_user_id: Se fornecido, filtra por id_user_guilty = este ID
        
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
    
    # Colunas de marcadores (tempstate) - sempre incluir para ações do grid
    # Valores 0-3: 0=sem marcador, 1=azul, 2=amarelo, 3=vermelho
    marker_columns = [
        'COALESCE(ts.state_loc, 0) AS "state_loc"',
        'COALESCE(ts.state_dt_envio, 0) AS "state_dt_envio"',
        'COALESCE(ts.state_dt_denvio, 0) AS "state_dt_denvio"',
        'COALESCE(ts.state_dt_pago, 0) AS "state_dt_pago"',
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
    
    # Montar cláusula WHERE (para filtro My Job)
    where_clauses = []
    query_params = []
    
    if my_job_user_id is not None:
        where_clauses.append("p.id_user_guilty = ?")
        query_params.append(my_job_user_id)
    
    where_sql = ""
    if where_clauses:
        where_sql = "WHERE " + " AND ".join(where_clauses)
    
    # Montar query final
    query = f"""
        SELECT
            {colunas_sql_str}
        FROM princ p
        {joins_sql}
        {where_sql}
        {order_by_clause}
    """
    
    if limit is not None and limit > 0:
        query = f"{query}\nLIMIT {limit}"
    
    logger.debug("Query grid para papel %s (limite=%s, my_job=%s)", papel, limit, my_job_user_id)
    
    # Executar query
    with get_db() as conn:
        conn.row_factory = lambda cursor, row: dict(
            zip([column[0] for column in cursor.description], row)
        )
        cursor = conn.cursor()
        cursor.execute(query, query_params)
        rows = cursor.fetchall()
    
    # Enriquecer com status calculados (para cores condicionais)
    rows = _enrich_with_status(rows)
    
    return rows


def count_grid(papel: str) -> int:
    """
    Conta total de registros visíveis para um papel.
    
    Usa contagem simples sem JOINs para performance.
    """
    with get_db() as conn:
        cursor = conn.execute("SELECT COUNT(*) FROM princ")
        return cursor.fetchone()[0]

