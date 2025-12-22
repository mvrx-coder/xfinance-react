"""
Router de Ações - xFinance

🔒 CRÍTICO: Ações respeitam permissões por papel.

Endpoints:
- POST /api/acoes/encaminhar  - Encaminhar inspeções para outro usuário
- POST /api/acoes/marcar      - Aplicar/remover marcadores
- POST /api/acoes/excluir     - Excluir inspeções (admin only)
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from database import get_db
from dependencies import (
    CurrentUser,
    get_current_user,
    require_admin,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# =============================================================================
# SCHEMAS
# =============================================================================

class EncaminharRequest(BaseModel):
    ids_princ: List[int]
    id_user_destino: int
    obs: Optional[str] = None


class MarcarRequest(BaseModel):
    ids_princ: List[int]
    marker_type: str  # "state_loc", "state_dt_envio", "state_dt_denvio", "state_dt_pago"
    value: int  # 0-3


class ExcluirRequest(BaseModel):
    ids_princ: List[int]


class AcaoResponse(BaseModel):
    success: bool
    message: str
    updated: Optional[int] = None
    deleted: Optional[int] = None


# =============================================================================
# POST /api/acoes/encaminhar
# =============================================================================

@router.post("/encaminhar", response_model=AcaoResponse)
async def encaminhar_inspecoes(
    request: EncaminharRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Encaminha inspeções para outro usuário (altera id_user_guilty).
    
    🔒 SIGILO: Qualquer usuário autenticado pode encaminhar.
    """
    if not request.ids_princ:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhuma inspeção selecionada"
        )
    
    logger.info(
        "POST /acoes/encaminhar | user=%s | ids=%s | destino=%s",
        current_user.email,
        request.ids_princ,
        request.id_user_destino,
    )
    
    try:
        with get_db() as conn:
            # Verificar se usuário destino existe
            cursor = conn.execute(
                "SELECT id_user, nick FROM user WHERE id_user = ?",
                (request.id_user_destino,)
            )
            user_row = cursor.fetchone()
            if not user_row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuário destino não encontrado"
                )
            
            nick_destino = user_row[1]
            
            # Atualizar inspeções
            placeholders = ",".join(["?"] * len(request.ids_princ))
            cursor = conn.execute(
                f"""
                UPDATE princ 
                SET id_user_guilty = ?
                WHERE id_princ IN ({placeholders})
                """,
                [request.id_user_destino] + request.ids_princ
            )
            
            updated = cursor.rowcount
            conn.commit()
            
            return AcaoResponse(
                success=True,
                message=f"{updated} inspeção(ões) encaminhada(s) para {nick_destino}",
                updated=updated
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao encaminhar: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao encaminhar inspeções"
        )


# =============================================================================
# POST /api/acoes/marcar
# =============================================================================

VALID_MARKER_TYPES = {"state_loc", "state_dt_envio", "state_dt_denvio", "state_dt_pago"}

@router.post("/marcar", response_model=AcaoResponse)
async def marcar_inspecoes(
    request: MarcarRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Aplica ou remove marcadores de alerta nas inspeções.
    
    Valores:
        0 = Sem marcador
        1 = Azul (nível 1)
        2 = Amarelo (nível 2)
        3 = Vermelho (nível 3)
    
    🔒 SIGILO: Qualquer usuário autenticado pode marcar.
    """
    if not request.ids_princ:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhuma inspeção selecionada"
        )
    
    if request.marker_type not in VALID_MARKER_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de marcador inválido. Válidos: {', '.join(VALID_MARKER_TYPES)}"
        )
    
    if request.value not in (0, 1, 2, 3):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valor do marcador deve ser 0, 1, 2 ou 3"
        )
    
    logger.info(
        "POST /acoes/marcar | user=%s | ids=%s | type=%s | value=%s",
        current_user.email,
        request.ids_princ,
        request.marker_type,
        request.value,
    )
    
    try:
        with get_db() as conn:
            updated = 0
            
            for id_princ in request.ids_princ:
                # Inserir ou atualizar na tabela tempstate
                conn.execute(
                    "INSERT OR IGNORE INTO tempstate (state_id_princ) VALUES (?)",
                    (id_princ,)
                )
                
                cursor = conn.execute(
                    f"UPDATE tempstate SET {request.marker_type} = ? WHERE state_id_princ = ?",
                    (request.value, id_princ)
                )
                
                if cursor.rowcount > 0:
                    updated += 1
                
                # Se valor = 0 e todos os marcadores são 0, excluir linha
                if request.value == 0:
                    conn.execute(
                        """
                        DELETE FROM tempstate
                        WHERE state_id_princ = ?
                          AND COALESCE(state_loc, 0) = 0
                          AND COALESCE(state_dt_envio, 0) = 0
                          AND COALESCE(state_dt_denvio, 0) = 0
                          AND COALESCE(state_dt_pago, 0) = 0
                        """,
                        (id_princ,)
                    )
            
            conn.commit()
            
            action = "aplicado" if request.value > 0 else "removido"
            return AcaoResponse(
                success=True,
                message=f"Marcador {action} em {updated} inspeção(ões)",
                updated=updated
            )
            
    except Exception as e:
        logger.error("Erro ao marcar: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao aplicar marcador"
        )


# =============================================================================
# POST /api/acoes/excluir
# =============================================================================

@router.post("/excluir", response_model=AcaoResponse)
async def excluir_inspecoes(
    request: ExcluirRequest,
    current_user: CurrentUser = Depends(require_admin),
):
    """
    Exclui inspeções do banco de dados.
    
    🔒 ADMIN ONLY: Apenas administradores podem excluir.
    """
    if not request.ids_princ:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhuma inspeção selecionada"
        )
    
    logger.info(
        "POST /acoes/excluir | user=%s | ids=%s",
        current_user.email,
        request.ids_princ,
    )
    
    try:
        with get_db() as conn:
            placeholders = ",".join(["?"] * len(request.ids_princ))
            
            # Excluir marcadores primeiro (integridade referencial)
            conn.execute(
                f"DELETE FROM tempstate WHERE state_id_princ IN ({placeholders})",
                request.ids_princ
            )
            
            # Excluir inspeções
            cursor = conn.execute(
                f"DELETE FROM princ WHERE id_princ IN ({placeholders})",
                request.ids_princ
            )
            
            deleted = cursor.rowcount
            conn.commit()
            
            return AcaoResponse(
                success=True,
                message=f"{deleted} inspeção(ões) excluída(s)",
                deleted=deleted
            )
            
    except Exception as e:
        logger.error("Erro ao excluir: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao excluir inspeções"
        )

