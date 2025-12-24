"""
Queries para criação de novas inspeções - xFinance

Inclui:
- get_or_create_segur: Busca ou cria segurado
- get_or_create_ativi: Busca ou cria atividade
- insert_new_inspection: Insere novo registro em princ
- insert_demais_local: Insere local adicional
- increment_princ_loc: Incrementa contador de locais
- get_directory_info: Busca dados para criação de diretórios
"""

import logging
from datetime import date
from typing import Optional, Dict, Any, Tuple

from database import get_db

logger = logging.getLogger(__name__)


# =============================================================================
# GET OR CREATE: Segurado
# =============================================================================

def get_or_create_segur(segur_nome: str) -> int:
    """
    Busca segurado por nome ou cria se não existir.
    
    Args:
        segur_nome: Nome do segurado
        
    Returns:
        ID do segurado (existente ou novo)
    """
    segur_nome = segur_nome.strip()
    
    with get_db() as conn:
        # Buscar existente (case insensitive)
        cursor = conn.execute(
            """
            SELECT id_segur FROM segur
            WHERE TRIM(LOWER(segur_nome)) = TRIM(LOWER(?))
            """,
            (segur_nome,)
        )
        row = cursor.fetchone()
        
        if row:
            logger.info("Segurado existente: %s (id=%d)", segur_nome, row[0])
            return row[0]
        
        # Criar novo
        cursor = conn.execute(
            "INSERT INTO segur (segur_nome) VALUES (?)",
            (segur_nome,)
        )
        conn.commit()
        new_id = cursor.lastrowid
        logger.info("Segurado criado: %s (id=%d)", segur_nome, new_id)
        return new_id


# =============================================================================
# GET OR CREATE: Atividade
# =============================================================================

def get_or_create_ativi(atividade: str) -> int:
    """
    Busca atividade por nome ou cria se não existir.
    
    Args:
        atividade: Nome da atividade
        
    Returns:
        ID da atividade (existente ou nova)
    """
    atividade = atividade.strip()
    
    with get_db() as conn:
        # Buscar existente (case insensitive)
        cursor = conn.execute(
            """
            SELECT id_ativi FROM ativi
            WHERE TRIM(LOWER(atividade)) = TRIM(LOWER(?))
            """,
            (atividade,)
        )
        row = cursor.fetchone()
        
        if row:
            logger.info("Atividade existente: %s (id=%d)", atividade, row[0])
            return row[0]
        
        # Criar novo
        cursor = conn.execute(
            "INSERT INTO ativi (atividade) VALUES (?)",
            (atividade,)
        )
        conn.commit()
        new_id = cursor.lastrowid
        logger.info("Atividade criada: %s (id=%d)", atividade, new_id)
        return new_id


# =============================================================================
# INSERT: Nova Inspeção (princ)
# =============================================================================

def insert_new_inspection(
    id_contr: int,
    id_segur: int,
    id_ativi: int,
    id_user_guy: int,
    dt_inspecao: str,
    id_uf: int,
    id_cidade: int,
    honorario: Optional[float] = None,
    atividade_texto: Optional[str] = None,
) -> int:
    """
    Insere novo registro na tabela princ.
    
    Args:
        id_contr: FK contratante
        id_segur: FK segurado
        id_ativi: FK atividade
        id_user_guy: FK usuário (inspetor)
        dt_inspecao: Data da inspeção (YYYY-MM-DD)
        id_uf: FK UF
        id_cidade: FK cidade
        honorario: Valor do honorário (opcional)
        atividade_texto: Texto da atividade (para coluna texto)
        
    Returns:
        ID do novo registro (id_princ)
    """
    # Campos hardcoded conforme sistema antigo
    id_user_guilty = 19
    dt_acerto = date.today().replace(day=1).strftime("%Y-%m-%d")
    loc = 1
    
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO princ (
                id_contr, id_segur, id_ativi, atividade,
                id_user_guy, dt_inspecao, id_uf, id_cidade,
                honorario, id_user_guilty, dt_acerto, loc
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                id_contr, id_segur, id_ativi, atividade_texto,
                id_user_guy, dt_inspecao, id_uf, id_cidade,
                honorario, id_user_guilty, dt_acerto, loc
            )
        )
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(
            "Inspeção criada: id_princ=%d | contr=%d | segur=%d | guy=%d",
            new_id, id_contr, id_segur, id_user_guy
        )
        return new_id


# =============================================================================
# INSERT: Local Adicional (demais_locais)
# =============================================================================

def insert_demais_local(
    id_princ: int,
    dt_inspecao: str,
    id_uf: int,
    id_cidade: int,
    id_user_guy: int,
) -> int:
    """
    Insere registro de local adicional na tabela demais_locais.
    
    Args:
        id_princ: FK para registro principal
        dt_inspecao: Data da inspeção neste local
        id_uf: FK UF
        id_cidade: FK cidade
        id_user_guy: FK usuário (inspetor deste local)
        
    Returns:
        ID do novo registro local
    """
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO demais_locais (
                id_princ, dt_inspecao, id_uf, id_cidade, guy_demais
            ) VALUES (?, ?, ?, ?, ?)
            """,
            (id_princ, dt_inspecao, id_uf, id_cidade, id_user_guy)
        )
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(
            "Local adicional criado: id=%d | princ=%d | uf=%d | cidade=%d",
            new_id, id_princ, id_uf, id_cidade
        )
        return new_id


# =============================================================================
# UPDATE: Incrementar contador de locais
# =============================================================================

def increment_princ_loc(id_princ: int) -> int:
    """
    Incrementa o contador de locais (loc) no registro principal.
    
    Args:
        id_princ: ID do registro principal
        
    Returns:
        Novo valor de loc
    """
    with get_db() as conn:
        conn.execute(
            """
            UPDATE princ 
            SET loc = COALESCE(loc, 1) + 1
            WHERE id_princ = ?
            """,
            (id_princ,)
        )
        conn.commit()
        
        # Buscar novo valor
        cursor = conn.execute(
            "SELECT loc FROM princ WHERE id_princ = ?",
            (id_princ,)
        )
        row = cursor.fetchone()
        new_loc = row[0] if row else 1
        
        logger.info("Loc incrementado: princ=%d → loc=%d", id_princ, new_loc)
        return new_loc


# =============================================================================
# GET: Informações para criação de diretórios
# =============================================================================

def get_directory_info(
    id_contr: int,
    id_segur: int,
    id_uf: int,
    id_cidade: int,
) -> Dict[str, Any]:
    """
    Busca informações necessárias para criar diretórios.
    
    Args:
        id_contr: ID do contratante
        id_segur: ID do segurado
        id_uf: ID da UF
        id_cidade: ID da cidade
        
    Returns:
        Dict com: player, diretorio (flag), segur_nome, uf_sigla, cidade_nome
    """
    with get_db() as conn:
        conn.row_factory = lambda cursor, row: dict(
            zip([column[0] for column in cursor.description], row)
        )
        
        # Contratante
        cursor = conn.execute(
            "SELECT player, diretorio FROM contr WHERE id_contr = ?",
            (id_contr,)
        )
        contr = cursor.fetchone() or {}
        
        # Segurado
        cursor = conn.execute(
            "SELECT segur_nome FROM segur WHERE id_segur = ?",
            (id_segur,)
        )
        segur = cursor.fetchone() or {}
        
        # UF
        cursor = conn.execute(
            "SELECT uf_sigla FROM uf WHERE id_uf = ?",
            (id_uf,)
        )
        uf = cursor.fetchone() or {}
        
        # Cidade
        cursor = conn.execute(
            "SELECT cidade_nome FROM cidade WHERE id_cidade = ?",
            (id_cidade,)
        )
        cidade = cursor.fetchone() or {}
    
    return {
        "player": contr.get("player", "UNKNOWN"),
        "diretorio": contr.get("diretorio", 0),
        "segur_nome": segur.get("segur_nome", "UNKNOWN"),
        "uf_sigla": uf.get("uf_sigla", "XX"),
        "cidade_nome": cidade.get("cidade_nome", "UNKNOWN"),
    }


# =============================================================================
# GET: Buscar atividade por ID
# =============================================================================

def get_atividade_texto(id_ativi: int) -> Optional[str]:
    """
    Busca o texto da atividade pelo ID.
    
    Args:
        id_ativi: ID da atividade
        
    Returns:
        Texto da atividade ou None
    """
    with get_db() as conn:
        cursor = conn.execute(
            "SELECT atividade FROM ativi WHERE id_ativi = ?",
            (id_ativi,)
        )
        row = cursor.fetchone()
        return row[0] if row else None
