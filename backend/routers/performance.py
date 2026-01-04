"""
Router de Performance - xFinance

Endpoints para dashboard de performance financeira.

🔒 CRÍTICO: Apenas admin pode ver dados financeiros completos.

Endpoints:
- GET /api/performance/filters     - Opções de filtro (anos)
- GET /api/performance/kpis        - KPIs agregados
- GET /api/performance/market      - Market share por contratante
- GET /api/performance/business    - Honorários por ano/mês
- GET /api/performance/operational - Honorários por operador/ano
- GET /api/performance/details     - Grid detalhado
"""

import logging
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from dependencies import (
    CurrentUser,
    get_current_user,
    require_admin,
)
from services.queries.performance import (
    fetch_filter_options,
    fetch_kpis,
    fetch_kpis_extended,
    fetch_market_share,
    fetch_business,
    fetch_operational,
    fetch_details,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# =============================================================================
# VALIDAÇÃO DE ACESSO
# =============================================================================

def require_financial_access(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """
    Verifica se usuário tem acesso a dados financeiros.
    
    🔒 SIGILO: Apenas admin pode ver dados de performance.
    """
    if not current_user.is_admin:
        logger.warning(
            "Acesso negado a performance | user=%s | papel=%s",
            current_user.email,
            current_user.papel,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores",
        )
    return current_user


# =============================================================================
# GET /api/performance/filters - Opções de filtro
# =============================================================================

@router.get("/filters")
async def get_filters(
    current_user: CurrentUser = Depends(require_financial_access),
):
    """
    Retorna opções de filtro disponíveis.
    
    Returns:
        { anos: [{label, value}] }
    """
    logger.info(
        "GET /performance/filters | user=%s",
        current_user.email,
    )
    
    try:
        return fetch_filter_options()
    except Exception as e:
        logger.exception("Erro ao buscar filtros de performance")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar filtros",
        )


# =============================================================================
# GET /api/performance/kpis - KPIs agregados
# =============================================================================

@router.get("/kpis")
async def get_kpis(
    current_user: CurrentUser = Depends(require_financial_access),
    base_date: Literal["dt_envio", "dt_pago", "dt_acerto"] = Query("dt_envio"),
    ano_ini: Optional[int] = Query(None, ge=2000, le=2100),
    ano_fim: Optional[int] = Query(None, ge=2000, le=2100),
):
    """
    Retorna KPIs financeiros agregados.
    
    KPIs:
    - honorarios: Soma de honorários
    - despesas: Soma de despesas
    - resultado_oper: Honorários - Despesas
    - inspecoes: Total de inspeções (localidades)
    
    Args:
        base_date: Campo de data para filtro
        ano_ini: Ano inicial
        ano_fim: Ano final
        
    Returns:
        { honorarios, despesas, resultado_oper, inspecoes }
    """
    logger.info(
        "GET /performance/kpis | user=%s | base_date=%s | ano=%s-%s",
        current_user.email,
        base_date,
        ano_ini,
        ano_fim,
    )
    
    try:
        return fetch_kpis(base_date, ano_ini, ano_fim)
    except Exception as e:
        logger.exception("Erro ao buscar KPIs de performance")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar KPIs",
        )


# =============================================================================
# GET /api/performance/kpis-extended - KPIs Estendidos (Premium)
# =============================================================================

@router.get("/kpis-extended")
async def get_kpis_extended(
    current_user: CurrentUser = Depends(require_financial_access),
    base_date: Literal["dt_envio", "dt_pago", "dt_acerto"] = Query("dt_envio"),
    ano_ini: Optional[int] = Query(None, ge=2000, le=2100),
    ano_fim: Optional[int] = Query(None, ge=2000, le=2100),
):
    """
    Retorna KPIs financeiros estendidos para visualização premium.
    
    Inclui todos os dados básicos mais:
    - Valores do período anterior
    - Trends (variação percentual)
    - Sparklines (últimos 12 meses)
    - KPIs calculados (ticket_medio, margem, eficiencia, crescimento)
    - Goal progress
    
    Args:
        base_date: Campo de data para filtro
        ano_ini: Ano inicial
        ano_fim: Ano final
        
    Returns:
        {
            honorarios, despesas, resultado_oper, inspecoes,
            ticket_medio, margem, eficiencia, crescimento,
            trends: { honorarios, despesas, ... },
            previous: { honorarios, despesas, ... },
            sparklines: { honorarios, despesas, ... },
            goals: { resultado_oper, margem, eficiencia }
        }
    """
    logger.info(
        "GET /performance/kpis-extended | user=%s | base_date=%s | ano=%s-%s",
        current_user.email,
        base_date,
        ano_ini,
        ano_fim,
    )
    
    try:
        return fetch_kpis_extended(base_date, ano_ini, ano_fim)
    except Exception as e:
        logger.exception("Erro ao buscar KPIs Extended")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar KPIs Extended",
        )


# =============================================================================
# GET /api/performance/market - Market Share
# =============================================================================

@router.get("/market")
async def get_market_share(
    current_user: CurrentUser = Depends(require_financial_access),
    base_date: Literal["dt_envio", "dt_pago", "dt_acerto"] = Query("dt_envio"),
    ano_ini: Optional[int] = Query(None, ge=2000, le=2100),
    ano_fim: Optional[int] = Query(None, ge=2000, le=2100),
):
    """
    Retorna Market Share por contratante.
    
    Args:
        base_date: Campo de data para filtro
        ano_ini: Ano inicial
        ano_fim: Ano final
        
    Returns:
        Lista de { name, value (%), honorarios, jobs, color }
    """
    logger.info(
        "GET /performance/market | user=%s | base_date=%s | ano=%s-%s",
        current_user.email,
        base_date,
        ano_ini,
        ano_fim,
    )
    
    try:
        return fetch_market_share(base_date, ano_ini, ano_fim)
    except Exception as e:
        logger.exception("Erro ao buscar Market Share")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar Market Share",
        )


# =============================================================================
# GET /api/performance/business - Honorários por Ano/Mês
# =============================================================================

@router.get("/business")
async def get_business(
    current_user: CurrentUser = Depends(require_financial_access),
    base_date: Literal["dt_envio", "dt_pago", "dt_acerto"] = Query("dt_envio"),
    ano_ini: Optional[int] = Query(None, ge=2000, le=2100),
    ano_fim: Optional[int] = Query(None, ge=2000, le=2100),
    mm12: bool = Query(False, description="Média móvel 12 meses"),
):
    """
    Retorna dados de honorários por ano/mês para gráfico de linhas.
    
    Args:
        base_date: Campo de data para filtro
        ano_ini: Ano inicial
        ano_fim: Ano final
        mm12: Se True, calcula média móvel 12 meses
        
    Returns:
        { months: [...], series: [{year, color, data: [...]}] }
    """
    logger.info(
        "GET /performance/business | user=%s | base_date=%s | ano=%s-%s | mm12=%s",
        current_user.email,
        base_date,
        ano_ini,
        ano_fim,
        mm12,
    )
    
    try:
        return fetch_business(base_date, ano_ini, ano_fim, mm12)
    except Exception as e:
        logger.exception("Erro ao buscar dados de Business")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar dados de Business",
        )


# =============================================================================
# GET /api/performance/operational - Honorários por Operador
# =============================================================================

@router.get("/operational")
async def get_operational(
    current_user: CurrentUser = Depends(require_financial_access),
    base_date: Literal["dt_envio", "dt_pago", "dt_acerto"] = Query("dt_envio"),
    ano_ini: Optional[int] = Query(None, ge=2000, le=2100),
    ano_fim: Optional[int] = Query(None, ge=2000, le=2100),
):
    """
    Retorna dados de honorários por operador/ano para gráfico de barras.
    
    Args:
        base_date: Campo de data para filtro
        ano_ini: Ano inicial
        ano_fim: Ano final
        
    Returns:
        Lista de { name, years: [{year, value, percentage}] }
    """
    logger.info(
        "GET /performance/operational | user=%s | base_date=%s | ano=%s-%s",
        current_user.email,
        base_date,
        ano_ini,
        ano_fim,
    )
    
    try:
        return fetch_operational(base_date, ano_ini, ano_fim)
    except Exception as e:
        logger.exception("Erro ao buscar dados Operational")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar dados Operational",
        )


# =============================================================================
# GET /api/performance/details - Grid Detalhado
# =============================================================================

@router.get("/details")
async def get_details(
    current_user: CurrentUser = Depends(require_financial_access),
    base_date: Literal["dt_envio", "dt_pago", "dt_acerto"] = Query("dt_envio"),
    ano_ini: Optional[int] = Query(None, ge=2000, le=2100),
    ano_fim: Optional[int] = Query(None, ge=2000, le=2100),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    """
    Retorna dados detalhados para grid.
    
    Args:
        base_date: Campo de data para filtro
        ano_ini: Ano inicial
        ano_fim: Ano final
        limit: Máximo de registros
        offset: Pular N registros (paginação)
        
    Returns:
        { data: [...], total: int }
    """
    logger.info(
        "GET /performance/details | user=%s | base_date=%s | ano=%s-%s | limit=%s | offset=%s",
        current_user.email,
        base_date,
        ano_ini,
        ano_fim,
        limit,
        offset,
    )
    
    try:
        return fetch_details(base_date, ano_ini, ano_fim, limit, offset)
    except Exception as e:
        logger.exception("Erro ao buscar Details")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar Details",
        )
