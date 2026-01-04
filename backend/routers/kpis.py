"""
Router de KPIs Express - xFinance

Endpoint para totais financeiros da toolbar.

🔒 SIGILO: Este endpoint retorna valores financeiros.
   Apenas usuários admin têm acesso.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status

from dependencies import CurrentUser, get_current_user
from services.queries.kpis import fetch_express_kpis

logger = logging.getLogger(__name__)

router = APIRouter()


# =============================================================================
# VALIDAÇÃO DE ACESSO
# =============================================================================

def require_financial_access(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """
    Verifica se usuário tem acesso a dados financeiros.
    
    🔒 SIGILO: Apenas admin pode ver KPIs financeiros.
    """
    if not current_user.is_admin:
        logger.warning(
            "Acesso negado a KPIs | user=%s | papel=%s",
            current_user.email,
            current_user.papel,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores",
        )
    return current_user


# =============================================================================
# GET /api/kpis - KPIs Express
# =============================================================================

@router.get("")
async def get_kpis(current_user: CurrentUser = Depends(require_financial_access)):
    """
    Retorna KPIs Express (totais financeiros pendentes).
    
    🔒 SIGILO: Apenas admin tem acesso.
    
    Returns:
        {
            express: número (honorários + despesas - guy_honorário - guy_despesa),
            honorarios: número (pendentes, dt_pago IS NULL),
            despesas: número (pendentes, dt_dpago IS NULL),
            guyHonorario: número (pendentes, dt_guy_pago IS NULL),
            guyDespesa: número (pendentes, dt_guy_dpago IS NULL)
        }
    """
    logger.info("GET /api/kpis | user=%s", current_user.email)
    
    try:
        return fetch_express_kpis()
    except Exception as e:
        logger.error("Erro ao buscar KPIs: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao calcular KPIs",
        )

