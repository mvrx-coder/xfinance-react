"""
Router de Lookups - xFinance

Endpoints para buscar opções de dropdowns.
"""

import logging
from typing import List

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from database import get_db
from dependencies import get_current_user, CurrentUser

logger = logging.getLogger(__name__)

router = APIRouter()


# =============================================================================
# SCHEMAS
# =============================================================================

class UserOption(BaseModel):
    value: int
    label: str
    papel: str
    ativo: bool


class LookupOption(BaseModel):
    value: int
    label: str


# =============================================================================
# GET /api/lookups/users
# =============================================================================

@router.get("/users", response_model=List[UserOption])
async def get_users(
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Retorna lista de usuários para dropdowns de encaminhamento.
    """
    logger.info("GET /lookups/users | user=%s", current_user.email)
    
    with get_db() as conn:
        conn.row_factory = lambda cursor, row: dict(
            zip([column[0] for column in cursor.description], row)
        )
        cursor = conn.execute(
            """
            SELECT id_user, nick, papel, ativo
            FROM user
            WHERE ativo = 1 OR ativo IS NULL
            ORDER BY nick
            """
        )
        rows = cursor.fetchall()
    
    return [
        UserOption(
            value=row["id_user"],
            label=row["nick"] or f"User {row['id_user']}",
            papel=row["papel"] or "user",
            ativo=bool(row["ativo"]) if row["ativo"] is not None else True
        )
        for row in rows
    ]


# =============================================================================
# GET /api/lookups/contratantes
# =============================================================================

@router.get("/contratantes", response_model=List[LookupOption])
async def get_contratantes(
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Retorna lista de contratantes (players).
    """
    with get_db() as conn:
        cursor = conn.execute(
            """
            SELECT id_contr, player
            FROM contr
            ORDER BY player
            """
        )
        rows = cursor.fetchall()
    
    return [
        LookupOption(value=row[0], label=row[1] or f"#{row[0]}")
        for row in rows
    ]


# =============================================================================
# GET /api/lookups/segurados
# =============================================================================

@router.get("/segurados", response_model=List[LookupOption])
async def get_segurados(
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Retorna lista de segurados.
    """
    with get_db() as conn:
        cursor = conn.execute(
            """
            SELECT id_segur, segur_nome
            FROM segur
            ORDER BY segur_nome
            """
        )
        rows = cursor.fetchall()
    
    return [
        LookupOption(value=row[0], label=row[1] or f"#{row[0]}")
        for row in rows
    ]


# =============================================================================
# GET /api/lookups/atividades
# =============================================================================

@router.get("/atividades", response_model=List[LookupOption])
async def get_atividades(
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Retorna lista de atividades.
    """
    with get_db() as conn:
        cursor = conn.execute(
            """
            SELECT id_ativi, atividade
            FROM ativi
            ORDER BY atividade
            """
        )
        rows = cursor.fetchall()
    
    return [
        LookupOption(value=row[0], label=row[1] or f"#{row[0]}")
        for row in rows
    ]


# =============================================================================
# GET /api/lookups/ufs
# =============================================================================

@router.get("/ufs", response_model=List[LookupOption])
async def get_ufs(
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Retorna lista de UFs.
    """
    with get_db() as conn:
        cursor = conn.execute(
            """
            SELECT id_uf, sigla
            FROM uf
            ORDER BY sigla
            """
        )
        rows = cursor.fetchall()
    
    return [
        LookupOption(value=row[0], label=row[1] or f"#{row[0]}")
        for row in rows
    ]

