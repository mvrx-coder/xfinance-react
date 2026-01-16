"""
Router Público - xFinance

Endpoints que não requerem autenticação.
Usados na tela de login para exibir KPIs.
"""

import logging
from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from services.queries.login_kpis import fetch_login_kpis

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/public", tags=["Public"])


# =============================================================================
# SCHEMAS
# =============================================================================

class LoginKPIsResponse(BaseModel):
    """Resposta dos KPIs da tela de login."""
    
    # Volume 12 meses
    total_inspecoes_12m: int
    total_loc_12m: int
    
    # Mês recorde
    mes_recorde: str  # Ex: "Nov/25"
    recorde_qtd: int
    
    # Mês atual
    mes_atual: str  # Ex: "Jan/26"
    inspecoes_mes_atual: int
    loc_mes_atual: int
    
    # Prazos (em dias)
    prazo_medio_12m: Optional[float]
    prazo_medio_mes_atual: Optional[float]


# =============================================================================
# GET /api/public/login-kpis
# =============================================================================

@router.get("/login-kpis", response_model=LoginKPIsResponse)
async def get_login_kpis():
    """
    Retorna KPIs para exibição na tela de login.
    
    Endpoint público - não requer autenticação.
    
    Métricas retornadas:
    - Total de inspeções e LOCs nos últimos 12 meses
    - Mês com mais inspeções (recorde)
    - Inspeções do mês atual
    - Prazo médio de entrega (12 meses e mês atual)
    """
    logger.info("GET /api/public/login-kpis")
    
    try:
        kpis = fetch_login_kpis()
        return LoginKPIsResponse(**kpis)
    except Exception as e:
        logger.error("Erro ao buscar KPIs de login: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao calcular KPIs",
        )
