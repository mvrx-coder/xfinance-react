"""
Queries para criação de novas inspeções - xFinance

Inclui:
- get_or_create_segur: Busca ou cria segurado
- get_or_create_ativi: Busca ou cria atividade
- insert_new_inspection: Insere novo registro em princ
- insert_demais_local: Insere local adicional
- increment_princ_loc: Incrementa contador de locais
- get_directory_info: Busca dados para criação de diretórios
- create_inspection_atomic: Cria inspeção com transação atômica

Padrão de transação:
- Funções com sufixo _with_conn aceitam conexão externa (para transações)
- Funções sem sufixo criam conexão própria (auto-commit)
"""

import logging
import sqlite3
from datetime import date
from typing import Optional, Dict, Any, Tuple

from database import get_db, get_connection

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
                honorario, id_user_guilty, dt_acerto, loc, meta, ms
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                id_contr, id_segur, id_ativi, atividade_texto,
                id_user_guy, dt_inspecao, id_uf, id_cidade,
                honorario, id_user_guilty, dt_acerto, loc, 1, 0  # meta=1, ms=0 (padrão)
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
    unidade: Optional[str] = None,
) -> int:
    """
    Insere registro de local adicional na tabela demais_locais.
    
    Args:
        id_princ: FK para registro principal
        dt_inspecao: Data da inspeção neste local
        id_uf: FK UF
        id_cidade: FK cidade
        id_user_guy: FK usuário (inspetor deste local)
        unidade: Unidade do player (opcional)
        
    Returns:
        ID do novo registro local
    """
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO demais_locais (
                id_princ, dt_inspecao, id_uf, id_cidade, guy_demais, unidade
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (id_princ, dt_inspecao, id_uf, id_cidade, id_user_guy, unidade)
        )
        conn.commit()
        new_id = cursor.lastrowid
        
        logger.info(
            "Local adicional criado: id=%d | princ=%d | uf=%d | cidade=%d | unidade=%s",
            new_id, id_princ, id_uf, id_cidade, unidade or "(vazio)"
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


# =============================================================================
# VERSÕES COM CONEXÃO EXTERNA (para transações atômicas)
# =============================================================================

def get_or_create_segur_with_conn(conn: sqlite3.Connection, segur_nome: str) -> int:
    """
    Busca ou cria segurado usando conexão externa (sem commit).
    """
    segur_nome = segur_nome.strip()
    
    cursor = conn.execute(
        """
        SELECT id_segur FROM segur
        WHERE TRIM(LOWER(segur_nome)) = TRIM(LOWER(?))
        """,
        (segur_nome,)
    )
    row = cursor.fetchone()
    
    if row:
        logger.debug("Segurado existente: %s (id=%d)", segur_nome, row[0])
        return row[0]
    
    cursor = conn.execute(
        "INSERT INTO segur (segur_nome) VALUES (?)",
        (segur_nome,)
    )
    new_id = cursor.lastrowid
    logger.info("Segurado criado (pending): %s (id=%d)", segur_nome, new_id)
    return new_id


def get_or_create_ativi_with_conn(conn: sqlite3.Connection, atividade: str) -> int:
    """
    Busca ou cria atividade usando conexão externa (sem commit).
    """
    atividade = atividade.strip()
    
    cursor = conn.execute(
        """
        SELECT id_ativi FROM ativi
        WHERE TRIM(LOWER(atividade)) = TRIM(LOWER(?))
        """,
        (atividade,)
    )
    row = cursor.fetchone()
    
    if row:
        logger.debug("Atividade existente: %s (id=%d)", atividade, row[0])
        return row[0]
    
    cursor = conn.execute(
        "INSERT INTO ativi (atividade) VALUES (?)",
        (atividade,)
    )
    new_id = cursor.lastrowid
    logger.info("Atividade criada (pending): %s (id=%d)", atividade, new_id)
    return new_id


def insert_inspection_with_conn(
    conn: sqlite3.Connection,
    id_contr: int,
    id_segur: int,
    id_ativi: int,
    id_user_guy: int,
    dt_inspecao: str,
    id_uf: int,
    id_cidade: int,
    honorario: Optional[float] = None,
    atividade_texto: Optional[str] = None,
    unidade: Optional[str] = None,
) -> int:
    """
    Insere registro em princ usando conexão externa (sem commit).
    """
    id_user_guilty = 19
    dt_acerto = date.today().replace(day=1).strftime("%Y-%m-%d")
    loc = 1
    
    cursor = conn.execute(
        """
        INSERT INTO princ (
            id_contr, id_segur, id_ativi, atividade,
            id_user_guy, dt_inspecao, id_uf, id_cidade,
            honorario, id_user_guilty, dt_acerto, loc, meta, ms, unidade
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            id_contr, id_segur, id_ativi, atividade_texto,
            id_user_guy, dt_inspecao, id_uf, id_cidade,
            honorario, id_user_guilty, dt_acerto, loc, 1, 0, unidade  # meta=1, ms=0 (padrão)
        )
    )
    new_id = cursor.lastrowid
    logger.info("Inspecao criada (pending): id_princ=%d | unidade=%s", new_id, unidade or "(vazio)")
    return new_id


# =============================================================================
# CRIAÇÃO ATÔMICA (única transação)
# =============================================================================

def create_inspection_atomic(
    id_contr: int,
    id_segur: Optional[int],
    segur_nome: Optional[str],
    id_ativi: Optional[int],
    atividade_texto: Optional[str],
    id_user_guy: int,
    dt_inspecao: str,
    id_uf: int,
    id_cidade: int,
    honorario: Optional[float] = None,
    unidade: Optional[str] = None,
) -> Tuple[int, int, int]:
    """
    Cria inspeção em transação atômica.
    
    Se segurado/atividade são strings, cria novos registros.
    Tudo em uma única transação - rollback se falhar.
    
    Args:
        id_contr: FK contratante
        id_segur: ID do segurado existente (ou None)
        segur_nome: Nome para criar novo segurado (ou None)
        id_ativi: ID da atividade existente (ou None)
        atividade_texto: Texto para criar nova atividade (ou None)
        id_user_guy: FK inspetor
        dt_inspecao: Data inspeção (YYYY-MM-DD)
        id_uf: FK UF
        id_cidade: FK cidade
        honorario: Valor honorário (opcional)
        unidade: Unidade do player (opcional, ex: Biodiesel)
        
    Returns:
        Tuple (id_princ, id_segur_final, id_ativi_final)
        
    Raises:
        ValueError: Se parâmetros inválidos
        Exception: Se falhar (faz rollback automático)
    """
    if not id_segur and not segur_nome:
        raise ValueError("Segurado obrigatório: forneça id_segur ou segur_nome")
    
    if not id_ativi and not atividade_texto:
        raise ValueError("Atividade obrigatória: forneça id_ativi ou atividade_texto")
    
    conn = get_connection()
    try:
        logger.info(
            "Iniciando transação atômica: contr=%d, uf=%d, cidade=%d",
            id_contr, id_uf, id_cidade
        )
        
        # 1. Resolver segurado
        if id_segur and id_segur > 0:
            final_id_segur = id_segur
        else:
            final_id_segur = get_or_create_segur_with_conn(conn, segur_nome)
        
        # 2. Resolver atividade
        if id_ativi and id_ativi > 0:
            final_id_ativi = id_ativi
            # Buscar texto da atividade
            cursor = conn.execute(
                "SELECT atividade FROM ativi WHERE id_ativi = ?",
                (id_ativi,)
            )
            row = cursor.fetchone()
            final_atividade_texto = row[0] if row else None
        else:
            final_id_ativi = get_or_create_ativi_with_conn(conn, atividade_texto)
            final_atividade_texto = atividade_texto
        
        # 3. Inserir inspeção
        id_princ = insert_inspection_with_conn(
            conn=conn,
            id_contr=id_contr,
            id_segur=final_id_segur,
            id_ativi=final_id_ativi,
            id_user_guy=id_user_guy,
            dt_inspecao=dt_inspecao,
            id_uf=id_uf,
            id_cidade=id_cidade,
            honorario=honorario,
            atividade_texto=final_atividade_texto,
            unidade=unidade,
        )
        
        # 4. Commit da transação
        conn.commit()
        logger.info(
            "Transação COMMIT: id_princ=%d, segur=%d, ativi=%d",
            id_princ, final_id_segur, final_id_ativi
        )
        
        return id_princ, final_id_segur, final_id_ativi
        
    except Exception as e:
        conn.rollback()
        logger.error("Transação ROLLBACK: %s", e)
        raise
    finally:
        conn.close()
