"""
Agendador de Tarefas - xFinance

Usa APScheduler para executar backups automáticos do banco de dados.
Backups a cada 2 horas, entre 07:00 e 19:00, de segunda a sexta.

NOTA: O scheduler pode ser desabilitado via variável de ambiente
XF_ENABLE_SCHEDULER=false (útil em ambiente de desenvolvimento).
"""

import logging
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from services.backup import create_backup

logger = logging.getLogger(__name__)

# Controle de ativação do scheduler (desabilitar em DEV)
ENABLE_SCHEDULER = os.getenv("XF_ENABLE_SCHEDULER", "true").lower() == "true"

# Instância global do scheduler
scheduler: AsyncIOScheduler | None = None


def _run_scheduled_backup():
    """
    Executa backup agendado.
    Chamado pelo APScheduler nos horários configurados.
    """
    logger.info("SCHEDULER: Iniciando backup automático...")
    
    try:
        success, message = create_backup()
        
        if success:
            logger.info("SCHEDULER: Backup automático concluído - %s", message)
        else:
            logger.warning("SCHEDULER: Backup automático falhou - %s", message)
            
    except Exception as e:
        logger.error("SCHEDULER: Erro no backup automático - %s", e)


def start_scheduler():
    """
    Inicia o agendador de backups.
    
    Configuração:
    - Frequência: a cada 2 horas
    - Horários: 07:00, 09:00, 11:00, 13:00, 15:00, 17:00, 19:00
    - Dias: Segunda a Sexta (0-4 no cron)
    
    Pode ser desabilitado via XF_ENABLE_SCHEDULER=false
    """
    global scheduler
    
    # Verificar se scheduler está habilitado
    if not ENABLE_SCHEDULER:
        logger.info("=" * 50)
        logger.info("SCHEDULER: DESABILITADO via XF_ENABLE_SCHEDULER=false")
        logger.info("SCHEDULER: Backups automáticos não serão executados")
        logger.info("SCHEDULER: (Backups manuais continuam disponíveis)")
        logger.info("=" * 50)
        return
    
    if scheduler is not None:
        logger.warning("SCHEDULER: Agendador já está rodando")
        return
    
    try:
        scheduler = AsyncIOScheduler()
        
        # Configurar job de backup
        # Cron: hora 7,9,11,13,15,17,19 | minuto 0 | segunda a sexta (mon-fri)
        trigger = CronTrigger(
            hour="7,9,11,13,15,17,19",
            minute=0,
            day_of_week="mon-fri",
        )
        
        scheduler.add_job(
            _run_scheduled_backup,
            trigger=trigger,
            id="backup_job",
            name="Backup automático do banco de dados",
            replace_existing=True,
        )
        
        scheduler.start()
        
        logger.info("=" * 50)
        logger.info("SCHEDULER: Agendador de backup iniciado")
        logger.info("SCHEDULER: Horários: 07, 09, 11, 13, 15, 17, 19h")
        logger.info("SCHEDULER: Dias: Segunda a Sexta")
        logger.info("=" * 50)
        
    except Exception as e:
        logger.error("SCHEDULER: Falha ao iniciar agendador - %s", e)
        scheduler = None


def stop_scheduler():
    """
    Para o agendador de backups.
    """
    global scheduler
    
    if scheduler is None:
        return
    
    try:
        scheduler.shutdown(wait=False)
        logger.info("SCHEDULER: Agendador encerrado")
    except Exception as e:
        logger.warning("SCHEDULER: Erro ao encerrar agendador - %s", e)
    finally:
        scheduler = None


def get_scheduler_status() -> dict:
    """
    Retorna status do agendador.
    
    Returns:
        dict: Status com próximas execuções
    """
    if scheduler is None:
        return {
            "running": False,
            "enabled": ENABLE_SCHEDULER,
            "next_run": None,
            "jobs": [],
        }
    
    jobs_info = []
    for job in scheduler.get_jobs():
        jobs_info.append({
            "id": job.id,
            "name": job.name,
            "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
        })
    
    return {
        "running": scheduler.running,
        "next_run": jobs_info[0]["next_run"] if jobs_info else None,
        "jobs": jobs_info,
    }
