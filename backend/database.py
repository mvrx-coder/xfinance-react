"""
Conexão com banco de dados SQLite - xFinance

Baseado em: x_main/services/db/connection.py
"""

import sqlite3
import unicodedata
from contextlib import contextmanager
from typing import Generator, Optional

from config import resolve_sqlite_path


# =============================================================================
# FUNÇÕES SQL CUSTOMIZADAS
# =============================================================================

def _normalize_text(text: Optional[str]) -> str:
    """
    Normaliza texto para busca case-insensitive e accent-insensitive.
    
    - Remove acentos/diacríticos (Ó → O, ã → a, etc.)
    - Converte para minúsculas
    
    Exemplos:
        "Óleo" → "oleo"
        "CAFÉ" → "cafe"
        "São Paulo" → "sao paulo"
    
    Registrada como função SQL 'normalize' para uso em queries:
        WHERE normalize(coluna) LIKE normalize(?)
    """
    if text is None:
        return ""
    # NFD decompõe caracteres acentuados em base + diacrítico
    # Ex: "Ó" vira "O" + combining acute accent
    normalized = unicodedata.normalize('NFD', str(text))
    # Remove caracteres de categoria "Mn" (Nonspacing Mark = diacríticos)
    without_accents = ''.join(
        char for char in normalized 
        if unicodedata.category(char) != 'Mn'
    )
    return without_accents.lower()


def get_connection() -> sqlite3.Connection:
    """
    Retorna conexão SQLite com configurações otimizadas.
    
    Configurações:
    - foreign_keys: ON (integridade referencial)
    - journal_mode: WAL (melhor concorrência)
    - synchronous: NORMAL (bom equilíbrio)
    - cache_size: 16MB
    """
    db_path = resolve_sqlite_path()
    conn = sqlite3.connect(db_path, timeout=5.0)
    conn.row_factory = sqlite3.Row  # Permite acesso por nome de coluna
    
    # Registrar função SQL customizada para busca normalizada
    # Uso: WHERE normalize(coluna) LIKE normalize(?)
    conn.create_function("normalize", 1, _normalize_text)
    
    # Otimizações
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA synchronous = NORMAL")
    conn.execute("PRAGMA temp_store = MEMORY")
    conn.execute("PRAGMA cache_size = -16000")  # 16MB
    
    return conn


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """
    Context manager para conexão com o banco.
    
    Uso:
        with get_db() as conn:
            cursor = conn.execute("SELECT * FROM user")
            ...
    """
    conn = None
    try:
        conn = get_connection()
        yield conn
    finally:
        if conn:
            conn.close()


def get_db_dependency() -> Generator[sqlite3.Connection, None, None]:
    """
    Dependency para FastAPI.
    
    Uso no router:
        @router.get("/users")
        def get_users(db: sqlite3.Connection = Depends(get_db_dependency)):
            ...
    """
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()

