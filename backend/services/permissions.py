"""
Serviço de Permissões - xFinance

🔒 CRÍTICO: Este módulo controla o sigilo de dados por papel de usuário.

Baseado em: x_main/services/db/grid.py (fetch_permissoes_cols)
Ver também: docs/system/SIGILO.md
"""

import logging
from functools import lru_cache
from typing import Optional

from database import get_db

logger = logging.getLogger(__name__)


# =============================================================================
# CONSTANTES DE SIGILO
# =============================================================================

# Colunas de SIGILO ALTO - Somente admin pode ver
SIGILO_ALTO_COLUNAS = {
    "honorario",
    "despesa",
    "guy_honorario",
    "guy_despesa",
    "dt_pago",
    "dt_dpago",
    "dt_guy_pago",
    "dt_guy_dpago",
    "dt_acerto",
}

# Colunas de identificação sensível
SIGILO_IDENTIFICACAO = {
    "id_user_guilty",
}

# Ações por papel
ACOES_POR_PAPEL = {
    "admin": {"excluir", "encaminhar", "marcar", "editar", "gerenciar_usuarios"},
    "BackOffice": {"encaminhar", "marcar"},
    "Inspetor": set(),  # Nenhuma ação administrativa
}


# =============================================================================
# CONSULTA DE PERMISSÕES (TABELA PERMI)
# =============================================================================

@lru_cache(maxsize=32)
def fetch_permissoes_cols(papel: str) -> frozenset[str]:
    """
    Busca colunas permitidas para um papel na tabela permi.
    
    🔒 CRÍTICO: Esta função determina quais dados o usuário pode ver.
    
    Args:
        papel: Papel do usuário (admin, BackOffice, Inspetor, etc.)
        
    Returns:
        Conjunto de nomes de colunas permitidas (frozenset para cache)
        
    Nota:
        - Usa @lru_cache para evitar consultas repetidas
        - Retorna frozenset para ser hashable (cache)
        - Se papel não existe em permi, retorna conjunto vazio
    """
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT coluna FROM permi WHERE user_papel = ?",
            (papel,)
        )
        rows = cursor.fetchall()
        
        if not rows:
            logger.warning("Nenhuma permissão encontrada para papel: %s", papel)
            return frozenset()
        
        colunas = frozenset(row[0] for row in rows)
        logger.debug("Permissões para %s: %d colunas", papel, len(colunas))
        return colunas


def get_permitted_columns(papel: str) -> set[str]:
    """
    Retorna colunas permitidas como set mutável.
    
    Wrapper de fetch_permissoes_cols para uso em código que precisa de set.
    """
    return set(fetch_permissoes_cols(papel))


def clear_permissions_cache() -> None:
    """Limpa cache de permissões (usar após alterações em permi)."""
    fetch_permissoes_cols.cache_clear()
    logger.info("Cache de permissões limpo")


# =============================================================================
# VERIFICAÇÃO DE PERMISSÕES
# =============================================================================

def can_view_column(papel: str, coluna: str) -> bool:
    """
    Verifica se papel pode ver uma coluna específica.
    
    Args:
        papel: Papel do usuário
        coluna: Nome da coluna
        
    Returns:
        True se pode ver, False caso contrário
    """
    permitted = fetch_permissoes_cols(papel)
    return coluna in permitted


def can_perform_action(papel: str, acao: str) -> bool:
    """
    Verifica se papel pode executar uma ação.
    
    Args:
        papel: Papel do usuário
        acao: Nome da ação (excluir, encaminhar, marcar, etc.)
        
    Returns:
        True se pode executar, False caso contrário
    """
    acoes_permitidas = ACOES_POR_PAPEL.get(papel, set())
    return acao in acoes_permitidas


def is_admin(papel: str) -> bool:
    """Verifica se papel é admin."""
    return papel == "admin"


def is_backoffice_or_admin(papel: str) -> bool:
    """Verifica se papel é admin ou BackOffice."""
    return papel in ("admin", "BackOffice")


# =============================================================================
# FILTRO DE DADOS
# =============================================================================

def filter_columns_for_papel(
    data: dict,
    papel: str,
    additional_allowed: Optional[set[str]] = None
) -> dict:
    """
    Filtra dicionário removendo colunas não permitidas.
    
    🔒 CRÍTICO: Use esta função antes de retornar dados ao frontend.
    
    Args:
        data: Dicionário com dados (ex: uma linha do grid)
        papel: Papel do usuário
        additional_allowed: Colunas adicionais permitidas (ex: id_princ sempre)
        
    Returns:
        Dicionário filtrado com apenas colunas permitidas
    """
    permitted = get_permitted_columns(papel)
    
    if additional_allowed:
        permitted = permitted | additional_allowed
    
    return {
        key: value
        for key, value in data.items()
        if key in permitted
    }


def filter_rows_for_papel(
    rows: list[dict],
    papel: str,
    additional_allowed: Optional[set[str]] = None
) -> list[dict]:
    """
    Filtra lista de dicionários removendo colunas não permitidas.
    
    Args:
        rows: Lista de dicionários (ex: resultado de query)
        papel: Papel do usuário
        additional_allowed: Colunas adicionais permitidas
        
    Returns:
        Lista de dicionários filtrados
    """
    return [
        filter_columns_for_papel(row, papel, additional_allowed)
        for row in rows
    ]


# =============================================================================
# INFORMAÇÕES DE PERMISSÃO
# =============================================================================

def get_permission_info(papel: str) -> dict:
    """
    Retorna informações completas de permissão para um papel.
    
    Útil para debugging e documentação.
    """
    colunas = get_permitted_columns(papel)
    acoes = ACOES_POR_PAPEL.get(papel, set())
    
    return {
        "papel": papel,
        "colunas_permitidas": sorted(colunas),
        "total_colunas": len(colunas),
        "acoes_permitidas": sorted(acoes),
        "is_admin": is_admin(papel),
        "pode_excluir": "excluir" in acoes,
        "pode_encaminhar": "encaminhar" in acoes,
        "pode_marcar": "marcar" in acoes,
        "pode_ver_financeiro": bool(colunas & SIGILO_ALTO_COLUNAS),
    }


# =============================================================================
# LISTA DE PAPÉIS
# =============================================================================

def get_all_papeis() -> list[str]:
    """
    Retorna lista de todos os papéis cadastrados em permi.
    """
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT DISTINCT user_papel FROM permi ORDER BY user_papel"
        )
        return [row[0] for row in cursor.fetchall()]

