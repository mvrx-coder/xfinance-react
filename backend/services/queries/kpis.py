"""
Queries de KPIs Express - xFinance

Migrado de: x_main/database.py (get_express_totals)
           x_main/services/db/express.py (get_guy_pending_totals)

Calcula totais financeiros pendentes para a toolbar:
- Express: tot_honorario + tot_despesas - tot_gpago - tot_gdpago
- Honorários: soma de honorários pendentes (dt_pago IS NULL)
- Despesas: soma de despesas pendentes (dt_dpago IS NULL)
- Guy Honorários: soma de guy_honorario pendentes (dt_guy_pago IS NULL)
- Guy Despesas: soma de guy_despesa pendentes (dt_guy_dpago IS NULL)
"""

import logging

from database import get_db

logger = logging.getLogger(__name__)


# =============================================================================
# FETCH KPIS EXPRESS
# =============================================================================

def fetch_express_kpis() -> dict:
    """
    Calcula os totais EXPRESS baseados nas fórmulas do Excel original.
    
    Fórmula EXPRESS: tot_honorarios + tot_despesas - tot_gpago - tot_gdpago
    
    Returns:
        Dict com:
        - express: valor total calculado
        - honorarios: total de honorários pendentes
        - despesas: total de despesas pendentes
        - guyHonorario: total de guy_honorario pendentes
        - guyDespesa: total de guy_despesa pendentes
    """
    query = """
    SELECT
        COALESCE(SUM(CASE WHEN dt_pago IS NULL THEN honorario ELSE 0 END), 0) AS tot_honorario,
        COALESCE(SUM(CASE WHEN dt_dpago IS NULL THEN despesa ELSE 0 END), 0) AS tot_despesas,
        COALESCE(SUM(CASE WHEN dt_guy_pago IS NULL THEN guy_honorario ELSE 0 END), 0) AS tot_gpago,
        COALESCE(SUM(CASE WHEN dt_guy_dpago IS NULL THEN guy_despesa ELSE 0 END), 0) AS tot_gdpago
    FROM princ
    """
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query)
            result = cursor.fetchone()
        
        if result:
            tot_honorario = float(result[0] or 0)
            tot_despesas = float(result[1] or 0)
            tot_gpago = float(result[2] or 0)
            tot_gdpago = float(result[3] or 0)
            
            # Cálculo do EXPRESS: tot_honorários + tot_despesas - tot_gpago - tot_gdpago
            express = tot_honorario + tot_despesas - tot_gpago - tot_gdpago
            
            logger.debug(
                "KPIs calculados | express=%.2f | hon=%.2f | desp=%.2f | g_hon=%.2f | g_desp=%.2f",
                express, tot_honorario, tot_despesas, tot_gpago, tot_gdpago
            )
            
            return {
                "express": express,
                "honorarios": tot_honorario,
                "despesas": tot_despesas,
                "guyHonorario": tot_gpago,
                "guyDespesa": tot_gdpago,
            }
        else:
            logger.warning("Nenhum resultado ao calcular KPIs Express")
            return _empty_kpis()
    
    except Exception as e:
        logger.error("Erro ao calcular KPIs Express: %s", e, exc_info=True)
        return _empty_kpis()


def _empty_kpis() -> dict:
    """Retorna KPIs zerados."""
    return {
        "express": 0.0,
        "honorarios": 0.0,
        "despesas": 0.0,
        "guyHonorario": 0.0,
        "guyDespesa": 0.0,
    }

