"""
Metadados das colunas - xFinance

Baseado em: x_main/column_metadata.py

Define:
- Metadados completos das colunas (display, format, width, etc.)
- Expressões SQL para campos com JOIN
- Ordem de colunas por papel
"""

from typing import Optional

# =============================================================================
# METADADOS DAS COLUNAS
# =============================================================================

COLUMN_METADATA = {
    # ===== CAMPOS DE DATA =====
    "dt_acerto": {
        "display": "Acerto",
        "format": "date",
        "editable": True,
        "width": 90,
        "type": "centerAligned",
    },
    "dt_envio": {
        "display": "Envio",
        "format": "date",
        "editable": True,
        "width": 90,
        "type": "centerAligned",
    },
    "dt_pago": {
        "display": "Pago",
        "format": "date",
        "editable": True,
        "width": 90,
        "type": "centerAligned",
    },
    "dt_inspecao": {
        "display": "Inspeção",
        "format": "date",
        "editable": True,
        "width": 90,
        "type": "centerAligned",
    },
    "dt_entregue": {
        "display": "Entregue",
        "format": "date",
        "editable": True,
        "width": 90,
        "type": "centerAligned",
    },
    "dt_denvio": {
        "display": "DEnvio",
        "format": "date",
        "editable": True,
        "width": 90,
        "type": "centerAligned",
    },
    "dt_dpago": {
        "display": "DPago",
        "format": "date",
        "editable": True,
        "width": 90,
        "type": "centerAligned",
    },
    "dt_guy_pago": {
        "display": "GPago",
        "format": "date",
        "editable": True,
        "width": 90,
        "type": "centerAligned",
    },
    "dt_guy_dpago": {
        "display": "GDPago",
        "format": "date",
        "editable": True,
        "width": 90,
        "type": "centerAligned",
    },
    
    # ===== CAMPOS MONETÁRIOS =====
    "honorario": {
        "display": "Honorários",
        "format": "currency",
        "editable": True,
        "width": 90,
        "type": "rightAligned",
    },
    "despesa": {
        "display": "Despesas",
        "format": "currency",
        "editable": True,
        "width": 90,
        "type": "rightAligned",
    },
    "guy_honorario": {
        "display": "GHonorários",
        "format": "currency",
        "editable": True,
        "width": 90,
        "type": "rightAligned",
    },
    "guy_despesa": {
        "display": "GDespesas",
        "format": "currency",
        "editable": True,
        "width": 90,
        "type": "rightAligned",
    },
    
    # ===== CAMPOS ESPECIAIS =====
    "id_princ": {
        "display": "ID",
        "format": "text",
        "editable": False,
        "width": 80,
        "type": "centerAligned",
        "hidden": True,
    },
    "loc": {
        "display": "Loc",
        "format": "location",
        "editable": True,
        "width": 50,
        "type": "centerAligned",
    },
    "prazo": {
        "display": "Prazo",
        "format": "calculated",
        "editable": False,
        "width": 60,
        "type": "centerAligned",
    },
    "ms": {
        "display": "MS",
        "format": "boolean",
        "editable": True,
        "width": 40,
        "type": "centerAligned",
    },
    "meta": {
        "display": "META",
        "format": "boolean",
        "editable": True,
        "width": 70,
        "type": "centerAligned",
    },
    "obs": {
        "display": "Observação",
        "format": "text",
        "editable": True,
        "width": 220,
        "type": "leftAligned",
    },
    
    # ===== CAMPOS COM JOIN =====
    "id_contr": {
        "display": "Player",
        "format": "text",
        "editable": False,
        "width": 80,
        "type": "leftAligned",
        "sql_expression": "COALESCE(c.player, '')",
        "join_table": "contr",
        "join_field": "player",
    },
    "id_segur": {
        "display": "Segurado",
        "format": "text",
        "editable": False,
        "width": 100,
        "type": "leftAligned",
        "sql_expression": "COALESCE(s.segur_nome, '')",
        "join_table": "segur",
        "join_field": "segur_nome",
    },
    "id_ativi": {
        "display": "Atividade",
        "format": "text",
        "editable": False,
        "width": 120,
        "type": "centerAligned",
        "sql_expression": "COALESCE(a.atividade, '')",
        "join_table": "ativi",
        "join_field": "atividade",
    },
    "id_user_guilty": {
        "display": "Guilty",
        "format": "text",
        "editable": False,
        "width": 70,
        "type": "centerAligned",
        "sql_expression": "COALESCE(colab.nick, '')",
        "join_table": "user",
        "join_field": "nick",
        "join_alias": "colab",
    },
    "id_user_guy": {
        "display": "Guy",
        "format": "text",
        "editable": False,
        "width": 70,
        "type": "centerAligned",
        "sql_expression": "COALESCE(guy.nick, '')",
        "join_table": "user",
        "join_field": "nick",
        "join_alias": "guy",
    },
}


# =============================================================================
# ORDEM DE COLUNAS POR PAPEL
# =============================================================================

DEFAULT_COLUMN_ORDER = {
    "admin": [
        "id_princ",
        "id_contr",      # Player
        "id_segur",      # Segurado
        "loc",
        "id_user_guilty", # Guilty
        "id_user_guy",    # Guy
        "meta",
        "dt_inspecao",
        "dt_entregue",
        "prazo",
        "dt_acerto",
        "dt_envio",
        "dt_pago",
        "honorario",
        "dt_denvio",
        "dt_dpago",
        "despesa",
        "dt_guy_pago",
        "guy_honorario",
        "dt_guy_dpago",
        "guy_despesa",
        "id_ativi",
        "obs",
    ],
    "BackOffice": [
        "id_princ",
        "id_contr",
        "id_segur",
        "loc",
        "id_user_guilty",
        "id_user_guy",
        "meta",
        "dt_inspecao",
        "dt_entregue",
        "prazo",
        "dt_acerto",
        "id_ativi",
        "obs",
    ],
    "Inspetor": [
        "id_princ",
        "id_segur",
        "loc",
        "meta",
        "dt_inspecao",
        "dt_entregue",
        "prazo",
        "id_ativi",
        "obs",
    ],
}


# =============================================================================
# FUNÇÕES AUXILIARES
# =============================================================================

def get_column_metadata(field_name: str) -> dict:
    """Retorna metadados de uma coluna."""
    return COLUMN_METADATA.get(
        field_name,
        {
            "display": field_name,
            "format": "text",
            "editable": True,
            "width": 100,
            "type": "leftAligned",
        },
    )


def get_display_name(field_name: str) -> str:
    """Retorna nome de exibição de um campo."""
    return get_column_metadata(field_name).get("display", field_name)


def get_sql_expression(field_name: str) -> str:
    """Retorna expressão SQL para um campo (incluindo JOINs)."""
    metadata = get_column_metadata(field_name)
    
    if "sql_expression" in metadata:
        return metadata["sql_expression"]
    else:
        return f"p.{field_name}"


def is_join_field(field_name: str) -> bool:
    """Verifica se um campo requer JOIN."""
    return "join_table" in get_column_metadata(field_name)


def get_column_order(papel: str) -> list[str]:
    """Retorna ordem de colunas para um papel."""
    return DEFAULT_COLUMN_ORDER.get(papel, DEFAULT_COLUMN_ORDER.get("admin", []))

