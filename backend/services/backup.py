"""
Serviço de Backup do Banco de Dados - xFinance

Realiza cópias de segurança do SQLite para o NAS QNAP.
Backup automático a cada 2h (7h-19h, dias úteis) + backup manual.

Suporta tanto ambiente Windows (caminhos UNC) quanto Linux/Docker (volumes montados).
"""

import logging
import os
import platform
import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Tuple
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from zoneinfo import ZoneInfo

from config import resolve_sqlite_path

# Timezone do Brasil (São Paulo)
TZ_BRASIL = ZoneInfo("America/Sao_Paulo")

logger = logging.getLogger(__name__)

# =============================================================================
# CONFIGURAÇÃO - BACKUP
# =============================================================================

# Detectar ambiente de execução
IS_LINUX = platform.system() == "Linux"

# Caminho montado (Linux/Docker) - definido via variável de ambiente
BACKUP_MOUNT = os.getenv("XF_BACKUP_MOUNT", "")  # Ex: /mnt/backup

# Caminho UNC Windows (fallback se não estiver em Linux ou mount não configurado)
NAS_BACKUP_UNC = os.getenv(
    "XF_BACKUP_PATH",
    r"\\192.168.1.35\MVRX_NAS\xFinance_backup"
)

# Credenciais do NAS (usadas apenas no Windows)
NAS_USER = os.getenv("XF_NAS_USER", "xfinance_svc")
NAS_PASS = os.getenv("XF_NAS_PASS", "Aa25101208*")

# Determinar qual modo usar
USE_LINUX_MOUNT = IS_LINUX and BACKUP_MOUNT

# Caminho efetivo de backup
NAS_BACKUP_PATH = BACKUP_MOUNT if USE_LINUX_MOUNT else NAS_BACKUP_UNC

if USE_LINUX_MOUNT:
    logger.info("BACKUP: Modo Linux - usando mount em %s", BACKUP_MOUNT)
else:
    logger.info("BACKUP: Modo Windows - usando caminho UNC %s", NAS_BACKUP_UNC)

# Número máximo de backups a manter
MAX_BACKUPS = 21

# Timeout para operações de rede (segundos)
NETWORK_TIMEOUT = 30

# Cache de autenticação (Windows only)
_backup_authenticated = False


# =============================================================================
# VERIFICAÇÃO DE CONECTIVIDADE
# =============================================================================

def _is_mount_available() -> bool:
    """
    Verifica se o ponto de montagem está disponível (Linux).
    
    Returns:
        bool: True se montado e acessível
    """
    if not BACKUP_MOUNT:
        return False
    
    try:
        mount_path = Path(BACKUP_MOUNT)
        if mount_path.is_dir() and os.access(BACKUP_MOUNT, os.W_OK):
            logger.debug("BACKUP: Mount disponível: %s", BACKUP_MOUNT)
            return True
        else:
            logger.warning("BACKUP: Mount não disponível ou sem permissão: %s", BACKUP_MOUNT)
            return False
    except Exception as e:
        logger.warning("BACKUP: Erro ao verificar mount %s: %s", BACKUP_MOUNT, e)
        return False


def _ensure_backup_connection() -> bool:
    """
    Garante conexão autenticada com o NAS para backup.
    No Linux com volumes montados, retorna True diretamente.
    
    Returns:
        bool: True se conexão bem-sucedida
    """
    global _backup_authenticated

    # No Linux com mount, não precisa autenticar (Docker volume cuida disso)
    if USE_LINUX_MOUNT:
        return True

    # Se já autenticou nesta sessão, não refaz
    if _backup_authenticated:
        return True

    # Se não há credenciais configuradas, tenta sem autenticação
    if not NAS_USER or not NAS_PASS:
        logger.info("BACKUP: Sem credenciais configuradas, tentando acesso direto")
        return True

    try:
        import subprocess
        # Primeiro, desconecta conexão anterior se existir
        subprocess.run(
            ["net", "use", NAS_BACKUP_UNC, "/delete", "/y"],
            capture_output=True,
            timeout=10,
        )
    except Exception:
        pass

    try:
        import subprocess
        result = subprocess.run(
            ["net", "use", NAS_BACKUP_UNC, f"/user:{NAS_USER}", NAS_PASS, "/persistent:no"],
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode == 0:
            _backup_authenticated = True
            logger.info("BACKUP: Autenticação bem-sucedida para %s", NAS_BACKUP_UNC)
            return True
        else:
            logger.warning("BACKUP: Falha na autenticação - %s", result.stderr or result.stdout)
            return False

    except Exception as e:
        logger.warning("BACKUP: Erro ao autenticar - %s", e)
        return False


def _is_backup_path_accessible() -> bool:
    """
    Verifica se o caminho de backup está acessível.
    
    Returns:
        bool: True se acessível
    """
    try:
        # No Linux, verificar se o mount está disponível
        if USE_LINUX_MOUNT:
            return _is_mount_available()
        
        # No Windows, garantir autenticação primeiro
        if not _ensure_backup_connection():
            return False
        
        # Verificar se o diretório existe ou pode ser criado
        backup_dir = Path(NAS_BACKUP_PATH)
        if backup_dir.exists():
            return True
        
        # Tentar criar o diretório
        backup_dir.mkdir(parents=True, exist_ok=True)
        return True
        
    except Exception as e:
        logger.warning("BACKUP: Caminho inacessível - %s", e)
        return False


# =============================================================================
# FUNÇÕES DE BACKUP
# =============================================================================

def _generate_backup_filename() -> str:
    """
    Gera nome do arquivo de backup no formato aammdd_hhmm_xFinanceDB.db
    Usa timezone de São Paulo para garantir horário correto.
    
    Returns:
        str: Nome do arquivo (ex: 260112_0915_xFinanceDB.db)
    """
    now = datetime.now(TZ_BRASIL)
    return now.strftime("%y%m%d_%H%M_xFinanceDB.db")


def _copy_with_timeout(src: str, dst: str, timeout: int = NETWORK_TIMEOUT) -> bool:
    """
    Copia arquivo com timeout usando thread.
    
    Args:
        src: Caminho de origem
        dst: Caminho de destino
        timeout: Timeout em segundos
        
    Returns:
        bool: True se copiado com sucesso
    """
    def _do_copy():
        shutil.copy2(src, dst)
        return True
    
    try:
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_do_copy)
            return future.result(timeout=timeout)
    except FuturesTimeoutError:
        logger.warning("BACKUP: Timeout ao copiar arquivo")
        return False
    except Exception as e:
        logger.warning("BACKUP: Erro ao copiar - %s", e)
        return False


def create_backup() -> Tuple[bool, str]:
    """
    Cria uma cópia de backup do banco de dados.
    
    Returns:
        tuple: (sucesso: bool, mensagem: str)
    """
    try:
        # Verificar se caminho está acessível
        if not _is_backup_path_accessible():
            return False, "NAS de backup inacessível"
        
        # Obter caminho do banco de dados
        db_path = resolve_sqlite_path()
        if not os.path.exists(db_path):
            return False, f"Banco de dados não encontrado: {db_path}"
        
        # Gerar nome do arquivo de backup
        backup_filename = _generate_backup_filename()
        backup_path = os.path.join(NAS_BACKUP_PATH, backup_filename)
        
        logger.info("BACKUP: Iniciando cópia de %s para %s", db_path, backup_path)
        
        # Copiar arquivo
        if not _copy_with_timeout(db_path, backup_path):
            return False, "Falha ao copiar arquivo (timeout ou erro)"
        
        logger.info("BACKUP: Cópia concluída - %s", backup_filename)
        
        # Limpar backups antigos (manter últimos MAX_BACKUPS)
        cleanup_count = _cleanup_old_backups()
        if cleanup_count > 0:
            logger.info("BACKUP: Removidos %d backups antigos", cleanup_count)
        
        return True, f"Backup criado: {backup_filename}"
        
    except FileNotFoundError as e:
        logger.error("BACKUP: Banco não encontrado - %s", e)
        return False, str(e)
    except Exception as e:
        logger.error("BACKUP: Erro inesperado - %s", e)
        return False, f"Erro: {e}"


def _cleanup_old_backups() -> int:
    """
    Remove backups antigos, mantendo apenas os últimos MAX_BACKUPS.
    
    Returns:
        int: Número de backups removidos
    """
    try:
        backup_dir = Path(NAS_BACKUP_PATH)
        if not backup_dir.exists():
            return 0
        
        # Listar todos os arquivos de backup (padrão: *_xFinanceDB.db)
        backups = list(backup_dir.glob("*_xFinanceDB.db"))
        
        # Ordenar por data de modificação (mais recente primeiro)
        backups.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        
        # Remover excedentes
        removed = 0
        for old_backup in backups[MAX_BACKUPS:]:
            try:
                old_backup.unlink()
                logger.debug("BACKUP: Removido backup antigo - %s", old_backup.name)
                removed += 1
            except Exception as e:
                logger.warning("BACKUP: Falha ao remover %s - %s", old_backup.name, e)
        
        return removed
        
    except Exception as e:
        logger.warning("BACKUP: Erro no cleanup - %s", e)
        return 0


def list_backups() -> List[dict]:
    """
    Lista todos os backups disponíveis no NAS.
    
    Returns:
        list: Lista de dicts com informações dos backups
              [{"filename": str, "datetime": str, "size_mb": float}]
    """
    try:
        # Verificar se caminho está acessível
        if not _is_backup_path_accessible():
            logger.warning("BACKUP: Caminho inacessível para listagem")
            return []
        
        backup_dir = Path(NAS_BACKUP_PATH)
        if not backup_dir.exists():
            return []
        
        # Listar todos os arquivos de backup
        backups = list(backup_dir.glob("*_xFinanceDB.db"))
        
        # Ordenar por data de modificação (mais recente primeiro)
        backups.sort(key=lambda p: p.stat().st_mtime, reverse=True)
        
        result = []
        for backup_file in backups:
            try:
                stat = backup_file.stat()
                
                # Extrair data/hora do nome do arquivo (formato: aammdd_hhmm_xFinanceDB.db)
                name_parts = backup_file.name.split("_")
                if len(name_parts) >= 2:
                    date_str = name_parts[0]  # aammdd
                    time_str = name_parts[1]  # hhmm
                    
                    # Converter para formato legível
                    try:
                        dt = datetime.strptime(f"{date_str}_{time_str}", "%y%m%d_%H%M")
                        datetime_str = dt.strftime("%d/%m/%Y %H:%M")
                    except ValueError:
                        datetime_str = datetime.fromtimestamp(stat.st_mtime).strftime("%d/%m/%Y %H:%M")
                else:
                    datetime_str = datetime.fromtimestamp(stat.st_mtime).strftime("%d/%m/%Y %H:%M")
                
                result.append({
                    "filename": backup_file.name,
                    "datetime": datetime_str,
                    "size_mb": round(stat.st_size / (1024 * 1024), 2),
                    "timestamp": int(stat.st_mtime),
                })
                
            except Exception as e:
                logger.warning("BACKUP: Erro ao processar %s - %s", backup_file.name, e)
                continue
        
        return result
        
    except Exception as e:
        logger.error("BACKUP: Erro ao listar backups - %s", e)
        return []


def get_backup_status() -> dict:
    """
    Retorna status geral do sistema de backup.
    
    Returns:
        dict: Status com informações do backup
    """
    backups = list_backups()
    
    return {
        "nas_accessible": _is_backup_path_accessible(),
        "backup_path": NAS_BACKUP_PATH,
        "total_backups": len(backups),
        "max_backups": MAX_BACKUPS,
        "last_backup": backups[0] if backups else None,
    }


# =============================================================================
# RESTAURAÇÃO DE BACKUP
# =============================================================================

def _generate_damage_filename() -> str:
    """
    Gera nome do arquivo de banco danificado no formato xFinanceDB_damage_aammdd_hhmm.db
    Usa timezone de São Paulo para garantir horário correto.
    
    Returns:
        str: Nome do arquivo (ex: xFinanceDB_damage_260112_0915.db)
    """
    now = datetime.now(TZ_BRASIL)
    return now.strftime("xFinanceDB_damage_%y%m%d_%H%M.db")


def restore_backup(backup_filename: str) -> Tuple[bool, str]:
    """
    Restaura um backup específico.
    
    Processo:
    1. Verifica se o backup existe no NAS
    2. Renomeia o banco atual para xFinanceDB_damage_aammdd_hhmm.db no NAS
    3. Copia o backup para substituir o banco atual
    
    Args:
        backup_filename: Nome do arquivo de backup a restaurar
        
    Returns:
        tuple: (sucesso: bool, mensagem: str)
    """
    try:
        # Verificar se caminho está acessível
        if not _is_backup_path_accessible():
            return False, "NAS de backup inacessível"
        
        # Verificar se o backup existe
        backup_path = os.path.join(NAS_BACKUP_PATH, backup_filename)
        if not os.path.exists(backup_path):
            return False, f"Backup não encontrado: {backup_filename}"
        
        # Obter caminho do banco de dados atual
        db_path = resolve_sqlite_path()
        if not os.path.exists(db_path):
            return False, f"Banco de dados atual não encontrado: {db_path}"
        
        # Gerar nome para o banco "danificado"
        damage_filename = _generate_damage_filename()
        damage_path = os.path.join(NAS_BACKUP_PATH, damage_filename)
        
        logger.info("RESTORE: Iniciando restauração")
        logger.info("RESTORE: Backup origem: %s", backup_path)
        logger.info("RESTORE: Banco atual: %s", db_path)
        logger.info("RESTORE: Banco danificado vai para: %s", damage_path)
        
        # Passo 1: Copiar banco atual para o NAS como "damage"
        logger.info("RESTORE: Movendo banco atual para NAS como damage...")
        if not _copy_with_timeout(db_path, damage_path, timeout=60):
            return False, "Falha ao mover banco atual para NAS"
        
        logger.info("RESTORE: Banco atual salvo como %s", damage_filename)
        
        # Passo 2: Copiar backup para substituir o banco atual
        logger.info("RESTORE: Copiando backup para substituir banco...")
        if not _copy_with_timeout(backup_path, db_path, timeout=60):
            # Tentar reverter: copiar o damage de volta
            logger.error("RESTORE: Falha ao copiar backup! Tentando reverter...")
            try:
                shutil.copy2(damage_path, db_path)
                logger.info("RESTORE: Revertido com sucesso")
            except Exception as e:
                logger.error("RESTORE: Falha ao reverter! %s", e)
            return False, "Falha ao copiar backup para banco atual"
        
        logger.info("RESTORE: Restauração concluída com sucesso!")
        logger.info("RESTORE: Banco restaurado de: %s", backup_filename)
        logger.info("RESTORE: Banco anterior salvo como: %s", damage_filename)
        
        return True, f"Restaurado de {backup_filename}. Banco anterior salvo como {damage_filename}. RECARREGUE A PÁGINA (F5)."
        
    except Exception as e:
        logger.error("RESTORE: Erro inesperado - %s", e)
        return False, f"Erro: {e}"


def get_latest_backup() -> dict | None:
    """
    Retorna informações do backup mais recente.
    
    Returns:
        dict ou None: Informações do backup ou None se não houver
    """
    backups = list_backups()
    return backups[0] if backups else None
