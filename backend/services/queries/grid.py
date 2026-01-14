"""
Queries do Grid Principal - xFinance

Baseado em: x_main/services/db/grid.py

Contém:
- Cláusulas ORDER BY complexas
- Função load_grid para carregar dados com permissões
- Cálculo de status para cores condicionais
- Cálculo dinâmico do campo prazo
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


# =============================================================================
# CÁLCULO DO CAMPO PRAZO
# =============================================================================

def _parse_date(date_str: str) -> Optional[date]:
    """Converte string para date (formato YYYY-MM-DD). Retorna None se inválida."""
    try:
        return datetime.strptime(str(date_str)[:10], "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def _is_valid_date(date_str: Optional[str]) -> bool:
    """
    Verifica se uma string de data é válida (não vazia/nula).
    
    Retorna False para:
    - None, "", valores falsy
    - Strings conhecidas como "vazio": "None", "nan", "NaN", "null", "NULL"
    - Placeholders numéricos: "0", "0000-00-00"
    - Valores que não podem ser parseados como data YYYY-MM-DD
    """
    if not date_str:
        return False
    s = str(date_str).strip()
    # Lista expandida de valores inválidos
    if s in ("", "None", "nan", "NaN", "null", "NULL", "0", "0000-00-00"):
        return False
    # Verifica se pode ser parseado como data válida
    return _parse_date(s) is not None


def _compute_prazo(row: dict) -> tuple[Optional[int], bool]:
    """
    Calcula o valor do campo prazo seguindo a lógica de negócio.
    
    Regras (em ordem de prioridade):
    0. Se prazo > 0 no DB → retorna valor do DB (não calcular)
    BLOQUEIO: dt_pago preenchido E dt_entregue vazio → retorna None (anômalo)
    
    1. GRUPO 2 (Vermelho): dt_envio preenchido E dt_pago vazio → (hoje - dt_envio)
       Ordena por tempo desde envio da cobrança
    2. GRUPO 1 (Laranja/Cinza): dt_entregue vazio → (hoje - dt_inspecao)
       Ordena por tempo desde inspeção
    3. dt_entregue preenchido E dt_envio vazio → retorna None
       Aguardando envio de cobrança
    4. dt_pago E dt_entregue preenchidos → (dt_entregue - dt_inspecao) e GRAVA
       Prazo de execução final (fixo)
    
    Ver: docs/STATUS_INDICATOR_SYSTEM.md → Sistema de Ordenação do Grid
    
    Returns:
        tuple: (valor_prazo, deve_gravar)
            - valor_prazo: int ou None
            - deve_gravar: True se deve persistir no banco
    """
    # Obter valores
    prazo_db = row.get("prazo")
    dt_pago = row.get("dt_pago")
    dt_entregue = row.get("dt_entregue")
    dt_envio = row.get("dt_envio")
    dt_inspecao = row.get("dt_inspecao")
    
    # Verificar campos de data primeiro (necessário para decidir se usa prazo do DB)
    has_pago = _is_valid_date(dt_pago)
    has_entregue = _is_valid_date(dt_entregue)
    has_envio = _is_valid_date(dt_envio)
    has_inspecao = _is_valid_date(dt_inspecao)
    
    # Verificar se prazo já existe no DB
    prazo_existente = None
    if prazo_db is not None:
        try:
            prazo_int = int(prazo_db)
            if prazo_int > 0:
                prazo_existente = prazo_int
        except (ValueError, TypeError):
            pass
    
    # Regra 0: Usar prazo gravado APENAS se dt_pago preenchido (registro finalizado)
    # Para grupos 1/2 (dt_pago vazio), SEMPRE recalcular dinamicamente
    # Isso evita que prazo antigo "travado" seja exibido quando o registro voltou
    # para um estado anterior (ex: dt_pago foi limpo após ser preenchido)
    if prazo_existente is not None and has_pago:
        return (prazo_existente, False)
    
    # (has_pago, has_entregue, has_envio, has_inspecao já verificados acima)
    
    # BLOQUEIO: dt_pago preenchido E dt_entregue vazio (caso anômalo)
    if has_pago and not has_entregue:
        return (None, False)
    
    today = date.today()
    
    # Regra 1: GRUPO 2 (Vermelho) - dt_envio preenchido E dt_pago vazio → (hoje - dt_envio)
    # IMPORTANTE: Esta regra deve vir ANTES da verificação de dt_entregue para garantir
    # que o Grupo 2 ordene por tempo de cobrança, não por tempo desde inspeção.
    # Ver: docs/STATUS_INDICATOR_SYSTEM.md → Grupo 2 - Vermelho (Cobrança)
    if has_envio and not has_pago:
        dt_env = _parse_date(dt_envio)
        if dt_env:
            dias = (today - dt_env).days
            # Se negativo (data futura), retorna None
            return (dias if dias >= 0 else None, False)
        return (None, False)
    
    # Regra 2: GRUPO 1 (Laranja/Cinza) - dt_entregue vazio → calcular (hoje - dt_inspecao)
    # Apenas para registros ainda em andamento (sem envio de cobrança)
    if not has_entregue:
        if has_inspecao:
            dt_insp = _parse_date(dt_inspecao)
            if dt_insp:
                dias = (today - dt_insp).days
                # Se negativo (data futura), retorna None
                return (dias if dias >= 0 else None, False)
        return (None, False)
    
    # Regra 3: dt_entregue preenchido E dt_envio vazio → não calcular
    # (Aguardando o usuário enviar cobrança)
    if has_entregue and not has_envio:
        return (None, False)
    
    # Regra 4: dt_pago E dt_entregue preenchidos → (dt_entregue - dt_inspecao) e GRAVAR
    if has_pago and has_entregue:
        dt_ent = _parse_date(dt_entregue)
        dt_insp = _parse_date(dt_inspecao)
        if dt_ent and dt_insp:
            dias = (dt_ent - dt_insp).days
            # Se negativo (entregue antes de inspecionar - anômalo), retorna None
            return (dias if dias >= 0 else None, dias >= 0)
        return (None, False)
    
    return (None, False)


def _save_prazo_to_db(id_princ: int, prazo: int) -> None:
    """
    Grava o prazo calculado no banco de dados.
    
    Chamado quando o registro está finalizado (dt_pago E dt_entregue preenchidos).
    """
    try:
        with get_db() as conn:
            conn.execute(
                "UPDATE princ SET prazo = ? WHERE id_princ = ?",
                (prazo, id_princ)
            )
            conn.commit()
        logger.info("Prazo %d gravado para id_princ=%d", prazo, id_princ)
    except Exception as e:
        logger.error("Erro ao gravar prazo para id_princ=%d: %s", id_princ, e)


def _enrich_with_prazo(rows: list[dict]) -> list[dict]:
    """
    Calcula o prazo dinâmico para cada linha.
    
    - Se prazo já existe no DB, mantém
    - Senão, calcula conforme regras de negócio
    - Se registro finalizado, grava prazo no DB
    """
    for row in rows:
        prazo_calculado, deve_gravar = _compute_prazo(row)
        
        # Atualizar valor do prazo na row
        row["prazo"] = prazo_calculado
        
        # Se deve gravar e tem id_princ válido
        if deve_gravar and prazo_calculado is not None:
            id_princ = row.get("id_princ")
            if id_princ:
                _save_prazo_to_db(int(id_princ), prazo_calculado)
    
    return rows


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
    """
    Grupos de ordenação (workflow).
    
    Grupos:
    1 = Em andamento/Agendado (dt_envio e dt_pago vazios)
    2 = Vermelho/Cobrança (dt_envio preenchido, dt_pago vazio)
    3 = Pré-Final (dt_pago preenchido, mas falta guy/despesas)
    4 = Definitivamente Concluído (tudo quitado)
    """
    return """
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        -- Grupo 1: Em andamento/Agendado
                        WHEN p.dt_envio IS NULL AND p.dt_pago IS NULL THEN 1
                        -- Grupo 2: Vermelho (cobrança enviada, aguardando pagamento)
                        WHEN p.dt_envio IS NOT NULL AND p.dt_pago IS NULL THEN 2
                        -- Grupo 3: Pré-Final (dt_pago OK, mas falta guy ou despesas)
                        WHEN p.dt_pago IS NOT NULL AND (
                            (COALESCE(p.despesa, 0) > 0 AND p.dt_dpago IS NULL)
                            OR (COALESCE(p.guy_honorario, 0) > 0 AND p.dt_guy_pago IS NULL)
                            OR (COALESCE(p.guy_despesa, 0) > 0 AND p.dt_guy_dpago IS NULL)
                        ) THEN 3
                        -- Grupo 4: Definitivamente Concluído
                        WHEN p.dt_pago IS NOT NULL THEN 4
                        ELSE 5
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
    # Ordenação por grupo:
    # - Grupo 1 (em andamento/agendado): prazo DESC = (hoje - dt_inspecao) DESC
    # - Grupo 2 (vermelho/cobrança): prazo DESC = (hoje - dt_envio) DESC
    # - Grupo 3/4 (finalizadas): dt_pago DESC (mais recente primeiro)
    #
    # NOTA: O campo p.prazo no banco pode não estar atualizado para grupos 1 e 2,
    # pois só é gravado quando o registro é finalizado. Por isso calculamos
    # dinamicamente via JULIANDAY.
    # Ver: docs/STATUS_INDICATOR_SYSTEM.md → Sistema de Ordenação do Grid
    return (
        _order_head()
        + _order_groups()
        + """
            -- Grupo 1: Ordenar por prazo DESC = (hoje - dt_inspecao) DESC
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_envio IS NULL AND p.dt_pago IS NULL 
                        THEN CAST(JULIANDAY('now', 'localtime') - JULIANDAY(p.dt_inspecao) AS INTEGER)
                        ELSE NULL
                    END
                ELSE NULL
            END DESC,
            -- Grupo 2: Ordenar por prazo DESC = (hoje - dt_envio) DESC
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_envio IS NOT NULL AND p.dt_pago IS NULL 
                        THEN CAST(JULIANDAY('now', 'localtime') - JULIANDAY(p.dt_envio) AS INTEGER)
                        ELSE NULL
                    END
                ELSE NULL
            END DESC,
            -- Grupo 3/4: Ordenar por dt_pago DESC (mais recente primeiro)
            CASE
                WHEN COALESCE(p.ms, 0) = 0 THEN
                    CASE
                        WHEN p.dt_pago IS NOT NULL THEN p.dt_pago
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
    
    # Colunas auxiliares para cálculo do prazo (sempre incluir, mesmo sem permissão de exibição)
    # Necessários para calcular prazo dinâmico independente do papel
    prazo_aux_fields = ["dt_inspecao", "dt_entregue", "dt_envio", "dt_pago", "prazo", "id_princ"]
    for field in prazo_aux_fields:
        if field not in permissoes:
            colunas_sql.append(f'p.{field} AS "{field}"')
    
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
    # Se há limite, usar subquery para pegar os N registros mais recentes por id_princ
    # (id_princ é auto-increment, então reflete a ordem de criação)
    if limit is not None and limit > 0:
        # Montar filtro de IDs: pegar os últimos N id_princ
        # Isso garante que sempre teremos os registros mais recentes
        limit_where = f"p.id_princ IN (SELECT id_princ FROM princ ORDER BY id_princ DESC LIMIT {limit})"
        
        if where_sql:
            full_where = f"{where_sql} AND {limit_where}"
        else:
            full_where = f"WHERE {limit_where}"
        
        query = f"""
            SELECT
                {colunas_sql_str}
            FROM princ p
            {joins_sql}
            {full_where}
            {order_by_clause}
        """
    else:
        query = f"""
            SELECT
                {colunas_sql_str}
            FROM princ p
            {joins_sql}
            {where_sql}
            {order_by_clause}
        """
    
    logger.debug("Query grid para papel %s (limite=%s, my_job=%s)", papel, limit, my_job_user_id)
    
    # Executar query
    with get_db() as conn:
        conn.row_factory = lambda cursor, row: dict(
            zip([column[0] for column in cursor.description], row)
        )
        cursor = conn.cursor()
        cursor.execute(query, query_params)
        rows = cursor.fetchall()
    
    # Calcular prazo dinâmico (e gravar se finalizado)
    rows = _enrich_with_prazo(rows)
    
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

