"""
Router de Auditoria - xFinance

🔒 ADMIN ONLY: Todas as rotas requerem papel de administrador.

Endpoints:
- GET  /api/audit/{id_princ}  - Histórico de um registro
- GET  /api/audit/stats       - Estatísticas do log
- POST /api/audit/cleanup     - Limpar registros expirados
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from dependencies import CurrentUser, require_admin
from services.audit import get_history, cleanup_expired, get_stats

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/audit", tags=["Audit"])


# =============================================================================
# SCHEMAS
# =============================================================================

class AuditEntry(BaseModel):
    """Entrada do log de auditoria."""
    id_log: int
    id_user: int
    user_email: str
    operacao: str
    campo: Optional[str] = None
    valor_anterior: Optional[str] = None
    valor_novo: Optional[str] = None
    dt_operacao: str


class AuditHistoryResponse(BaseModel):
    """Response do histórico de auditoria."""
    id_princ: int
    total: int
    entries: List[AuditEntry]


class AuditStatsResponse(BaseModel):
    """Response das estatísticas de auditoria."""
    total_registros: int
    registro_mais_antigo: Optional[str] = None
    registros_expirados: int


class CleanupResponse(BaseModel):
    """Response da limpeza de registros."""
    success: bool
    message: str
    deleted: int


# =============================================================================
# GET /api/audit/stats - Estatísticas (deve vir antes de /{id_princ})
# =============================================================================

@router.get("/stats", response_model=AuditStatsResponse)
async def audit_stats(
    current_user: CurrentUser = Depends(require_admin),
):
    """
    Retorna estatísticas do log de auditoria.
    
    🔒 ADMIN ONLY
    """
    logger.info("GET /audit/stats | user=%s", current_user.email)
    
    stats = get_stats()
    return AuditStatsResponse(**stats)


# =============================================================================
# POST /api/audit/cleanup - Limpar expirados
# =============================================================================

@router.post("/cleanup", response_model=CleanupResponse)
async def audit_cleanup(
    current_user: CurrentUser = Depends(require_admin),
):
    """
    Remove registros de auditoria expirados (mais de 14 meses).
    
    🔒 ADMIN ONLY
    """
    logger.info("POST /audit/cleanup | user=%s", current_user.email)
    
    try:
        deleted = cleanup_expired()
        
        if deleted > 0:
            return CleanupResponse(
                success=True,
                message=f"{deleted} registro(s) antigo(s) removido(s)",
                deleted=deleted,
            )
        else:
            return CleanupResponse(
                success=True,
                message="Nenhum registro expirado para remover",
                deleted=0,
            )
            
    except Exception as e:
        logger.error("Erro ao limpar auditoria: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao limpar registros de auditoria"
        )


# =============================================================================
# GET /api/audit/{id_princ} - Histórico de um registro
# =============================================================================

@router.get("/{id_princ}", response_model=AuditHistoryResponse)
async def audit_history(
    id_princ: int,
    limit: int = Query(100, ge=1, le=500),
    current_user: CurrentUser = Depends(require_admin),
):
    """
    Retorna histórico de operações de um registro específico.
    
    🔒 ADMIN ONLY
    
    Args:
        id_princ: ID do registro (tabela princ)
        limit: Limite de registros (padrão 100, máx 500)
    """
    logger.info(
        "GET /audit/%d | user=%s | limit=%d",
        id_princ, current_user.email, limit
    )
    
    try:
        entries = get_history(id_princ, limit)
        
        return AuditHistoryResponse(
            id_princ=id_princ,
            total=len(entries),
            entries=[AuditEntry(**entry) for entry in entries],
        )
        
    except Exception as e:
        logger.error("Erro ao buscar histórico: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar histórico de auditoria"
        )
