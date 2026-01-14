"""
Router de Backup - xFinance API

Endpoints para gerenciamento de backups do banco de dados.
Acesso restrito a usuários admin.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from routers.auth import get_current_user
from services.backup import (
    create_backup,
    list_backups,
    get_backup_status,
    restore_backup,
    get_latest_backup,
)
from scheduler import get_scheduler_status

router = APIRouter(prefix="/api/backup", tags=["Backup"])


# =============================================================================
# SCHEMAS
# =============================================================================

class BackupInfo(BaseModel):
    """Informações de um backup."""
    filename: str
    datetime: str
    size_mb: float
    timestamp: int


class BackupListResponse(BaseModel):
    """Resposta da listagem de backups."""
    backups: List[BackupInfo]
    total: int
    nas_accessible: bool
    backup_path: str


class BackupCreateResponse(BaseModel):
    """Resposta da criação de backup."""
    success: bool
    message: str
    filename: Optional[str] = None


class BackupStatusResponse(BaseModel):
    """Status completo do sistema de backup."""
    nas_accessible: bool
    backup_path: str
    total_backups: int
    max_backups: int
    last_backup: Optional[BackupInfo] = None
    scheduler_running: bool
    next_scheduled_backup: Optional[str] = None


class RestoreRequest(BaseModel):
    """Request para restauração de backup."""
    filename: str
    confirmation: str  # Deve ser "CONFIRMAR"


class RestoreResponse(BaseModel):
    """Resposta da restauração de backup."""
    success: bool
    message: str
    restored_from: Optional[str] = None
    damage_file: Optional[str] = None


# =============================================================================
# HELPERS
# =============================================================================

def require_admin(user: dict = Depends(get_current_user)) -> dict:
    """
    Verifica se o usuário é admin.
    
    Raises:
        HTTPException: Se não for admin
    """
    papel = user.get("papel", "")
    if papel != "admin":
        raise HTTPException(
            status_code=403,
            detail="Acesso restrito a administradores"
        )
    return user


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.get("", response_model=BackupListResponse)
async def get_backups(user: dict = Depends(require_admin)):
    """
    Lista todos os backups disponíveis no NAS.
    
    Requer papel: admin
    """
    backups = list_backups()
    status = get_backup_status()
    
    return BackupListResponse(
        backups=[BackupInfo(**b) for b in backups],
        total=len(backups),
        nas_accessible=status["nas_accessible"],
        backup_path=status["backup_path"],
    )


@router.post("", response_model=BackupCreateResponse)
async def create_backup_manual(user: dict = Depends(require_admin)):
    """
    Cria um backup manual do banco de dados.
    
    Requer papel: admin
    """
    success, message = create_backup()
    
    # Extrair nome do arquivo da mensagem se sucesso
    filename = None
    if success and "Backup criado:" in message:
        filename = message.split("Backup criado:")[-1].strip()
    
    return BackupCreateResponse(
        success=success,
        message=message,
        filename=filename,
    )


@router.get("/status", response_model=BackupStatusResponse)
async def get_backup_full_status(user: dict = Depends(require_admin)):
    """
    Retorna status completo do sistema de backup.
    
    Inclui informações do NAS e do agendador.
    Requer papel: admin
    """
    backup_status = get_backup_status()
    scheduler_status = get_scheduler_status()
    
    # Converter last_backup para BackupInfo se existir
    last_backup = None
    if backup_status.get("last_backup"):
        last_backup = BackupInfo(**backup_status["last_backup"])
    
    return BackupStatusResponse(
        nas_accessible=backup_status["nas_accessible"],
        backup_path=backup_status["backup_path"],
        total_backups=backup_status["total_backups"],
        max_backups=backup_status["max_backups"],
        last_backup=last_backup,
        scheduler_running=scheduler_status["running"],
        next_scheduled_backup=scheduler_status["next_run"],
    )


@router.post("/restore", response_model=RestoreResponse)
async def restore_backup_endpoint(
    request: RestoreRequest,
    user: dict = Depends(require_admin)
):
    """
    Restaura um backup específico.
    
    ATENÇÃO: Esta operação substitui o banco de dados atual!
    O banco atual será salvo como xFinanceDB_damage_aammdd_hhmm.db no NAS.
    
    Requer papel: admin
    Requer confirmation: "CONFIRMAR"
    """
    # Verificar confirmação
    if request.confirmation != "CONFIRMAR":
        raise HTTPException(
            status_code=400,
            detail="Confirmação inválida. Digite 'CONFIRMAR' para prosseguir."
        )
    
    # Executar restauração
    success, message = restore_backup(request.filename)
    
    # Extrair informações da mensagem se sucesso
    restored_from = None
    damage_file = None
    if success:
        restored_from = request.filename
        # Extrair nome do damage file da mensagem
        if "salvo como" in message:
            parts = message.split("salvo como")
            if len(parts) > 1:
                damage_file = parts[1].split(".")[0].strip() + ".db"
    
    return RestoreResponse(
        success=success,
        message=message,
        restored_from=restored_from,
        damage_file=damage_file,
    )
