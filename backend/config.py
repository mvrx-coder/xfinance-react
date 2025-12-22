"""
Configurações do Backend FastAPI - xFinance
"""

import os
from pathlib import Path
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configurações do sistema."""
    
    # Aplicação
    APP_NAME: str = "xFinance API"
    APP_VERSION: str = "3.0.0"
    DEBUG: bool = True
    
    # Segurança
    SECRET_KEY: str = "xfinance-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 horas
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    # Banco de dados SQLite
    # Prioridade: XFINANCE_DB_PATH > XF_BASE_DIR/x_db > fallback
    SQLITE_DB_DIR: str = "x_db"
    SQLITE_DB_NAME: str = "xFinanceDB.db"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    """Retorna instância cacheada das configurações."""
    return Settings()


def resolve_sqlite_path() -> str:
    """
    Resolve o caminho absoluto do banco SQLite.
    
    Prioridade:
    1. Variável de ambiente XFINANCE_DB_PATH (caminho completo do arquivo .db)
    2. Variável XF_BASE_DIR + x_db/xFinanceDB.db
    3. Parent do projeto + x_db/xFinanceDB.db (layout xFinance_3.0)
    """
    settings = get_settings()
    
    # 1. Variável de ambiente XFINANCE_DB_PATH
    env_db_path = os.environ.get("XFINANCE_DB_PATH")
    if env_db_path:
        p = Path(env_db_path)
        if p.exists():
            return str(p.resolve())
        raise FileNotFoundError(
            f"XFINANCE_DB_PATH definido mas arquivo não encontrado: {env_db_path}"
        )
    
    # 2. Variável XF_BASE_DIR
    env_base = os.environ.get("XF_BASE_DIR")
    if env_base:
        p = Path(env_base) / settings.SQLITE_DB_DIR / settings.SQLITE_DB_NAME
        if p.exists():
            return str(p.resolve())
    
    # 3. Layout padrão: parent do projeto (xFinance_3.0/x_db/xFinanceDB.db)
    # backend/ está em x_finan/backend/, então parent.parent.parent = xFinance_3.0
    project_root = Path(__file__).resolve().parent.parent.parent
    legacy_path = project_root / settings.SQLITE_DB_DIR / settings.SQLITE_DB_NAME
    if legacy_path.exists():
        return str(legacy_path)
    
    raise FileNotFoundError(
        f"Banco SQLite não encontrado. Esperado em:\n"
        f"  - $XFINANCE_DB_PATH\n"
        f"  - $XF_BASE_DIR/{settings.SQLITE_DB_DIR}/{settings.SQLITE_DB_NAME}\n"
        f"  - {legacy_path}"
    )

