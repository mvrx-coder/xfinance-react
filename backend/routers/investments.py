"""
Router de Investimentos/Aportes - xFinance

Endpoints REST para gestão de investimentos.

🔒 SIGILO: Todos os endpoints requerem role 'admin'.
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from dependencies import require_admin
from services.queries.investments import (
    delete_investment,
    fetch_all_investments,
    fetch_allocation,
    fetch_filter_options,
    fetch_highlights,
    fetch_kpis,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/investments", tags=["investments"])


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.get("/filters")
async def get_filters(_=Depends(require_admin)):
    """
    Retorna opções disponíveis para filtros.
    
    Returns:
        Dict com listas de investidores, instituicoes, tipos
    """
    try:
        return fetch_filter_options()
    except Exception as e:
        logger.error("Erro ao buscar filtros de investimentos: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/kpis")
async def get_kpis(
    investidor: Optional[str] = Query(None),
    instituicao: Optional[str] = Query(None),
    tipo: Optional[str] = Query(None),
    dt_ini: Optional[str] = Query(None),
    dt_fim: Optional[str] = Query(None),
    _=Depends(require_admin),
):
    """
    Retorna KPIs agregados da carteira.
    
    Returns:
        Dict com patrimonio_total, valor_aplicado, resultado, rentabilidade_pct
    """
    try:
        return fetch_kpis(investidor, instituicao, tipo, dt_ini, dt_fim)
    except Exception as e:
        logger.error("Erro ao buscar KPIs de investimentos: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/highlights")
async def get_highlights(
    investidor: Optional[str] = Query(None),
    instituicao: Optional[str] = Query(None),
    tipo: Optional[str] = Query(None),
    dt_ini: Optional[str] = Query(None),
    dt_fim: Optional[str] = Query(None),
    _=Depends(require_admin),
):
    """
    Retorna destaques da carteira (Winner, Loser, Maior Posição).
    
    Returns:
        Dict com winner, loser, maior_posicao
    """
    try:
        return fetch_highlights(investidor, instituicao, tipo, dt_ini, dt_fim)
    except Exception as e:
        logger.error("Erro ao buscar highlights de investimentos: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/allocation")
async def get_allocation(
    group_by: str = Query("tipo", description="Campo para agrupar: tipo, investidor, instituicao"),
    investidor: Optional[str] = Query(None),
    instituicao: Optional[str] = Query(None),
    tipo: Optional[str] = Query(None),
    dt_ini: Optional[str] = Query(None),
    dt_fim: Optional[str] = Query(None),
    _=Depends(require_admin),
):
    """
    Retorna dados de alocação para gráfico.
    
    Returns:
        Lista de dicts com id, name, value, percentage, color
    """
    try:
        return fetch_allocation(group_by, investidor, instituicao, tipo, dt_ini, dt_fim)
    except Exception as e:
        logger.error("Erro ao buscar alocação de investimentos: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def get_all(
    investidor: Optional[str] = Query(None),
    instituicao: Optional[str] = Query(None),
    tipo: Optional[str] = Query(None),
    dt_ini: Optional[str] = Query(None),
    dt_fim: Optional[str] = Query(None),
    _=Depends(require_admin),
):
    """
    Retorna lista completa de investimentos.
    
    Returns:
        Lista de dicts com todos os campos do investimento
    """
    try:
        data = fetch_all_investments(investidor, instituicao, tipo, dt_ini, dt_fim)
        return {"data": data, "total": len(data)}
    except Exception as e:
        logger.error("Erro ao buscar investimentos: %s", e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{id_finan}")
async def remove_investment(
    id_finan: int,
    _=Depends(require_admin),
):
    """
    Remove um investimento pelo ID.
    
    Returns:
        Dict com success e message
    """
    try:
        success = delete_investment(id_finan)
        if success:
            return {"success": True, "message": "Investimento removido com sucesso"}
        else:
            raise HTTPException(status_code=404, detail="Investimento não encontrado")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao remover investimento %s: %s", id_finan, e, exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
