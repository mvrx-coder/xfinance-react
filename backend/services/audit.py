"""
Service de Auditoria - xFinance

Registra operações realizadas na tabela princ para rastreamento.

Operações registradas:
- CREATE: Nova inspeção
- UPDATE: Alteração de campo
- DELETE: Exclusão de inspeção
- ENCAMINHAR: Mudança de responsável

Retenção: 14 meses (limpeza manual via endpoint)
"""

import logging
from datetime import datetime, timedelta
from typing import Optional, Any
import json

from database import get_db

logger = logging.getLogger(__name__)

# Meses de retenção do log
RETENTION_MONTHS = 14


def _ensure_table_exists() -> None:
    """
    Cria a tabela audit_log se não existir.
    Chamada automaticamente na primeira operação.
    """
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS "audit_log" (
                id_log INTEGER PRIMARY KEY AUTOINCREMENT,
                
                -- Quem
                id_user INTEGER NOT NULL,
                user_email TEXT NOT NULL,
                
                -- O quê
                id_princ INTEGER NOT NULL,
                operacao TEXT NOT NULL,
                campo TEXT,
                
                -- Valores
                valor_anterior TEXT,
                valor_novo TEXT,
                
                -- Quando
                dt_operacao TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
                
                -- Limpeza
                dt_expira TEXT
            )
        """)
        
        # Índices para consultas rápidas
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_audit_princ ON audit_log (id_princ)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_audit_data ON audit_log (dt_operacao)"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_audit_expira ON audit_log (dt_expira)"
        )
        
        conn.commit()


def _serialize_value(value: Any) -> Optional[str]:
    """Serializa valor para armazenamento."""
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def log_operation(
    id_user: int,
    user_nome: str,
    id_princ: int,
    operacao: str,
    campo: Optional[str] = None,
    valor_anterior: Any = None,
    valor_novo: Any = None,
) -> None:
    """
    Registra uma operação de auditoria.
    
    Args:
        id_user: ID do usuário que realizou a operação
        user_nome: Nome curto do usuário (short_nome)
        id_princ: ID do registro afetado (tabela princ)
        operacao: Tipo de operação (CREATE, UPDATE, DELETE, ENCAMINHAR)
        campo: Campo alterado (para UPDATE)
        valor_anterior: Valor antes da alteração
        valor_novo: Valor após a alteração
    """
    try:
        _ensure_table_exists()
        
        # Debug: log valores recebidos
        logger.info(
            "AUDIT INSERT: princ=%s, op=%s, campo=%s, anterior=%s, novo=%s",
            id_princ, operacao, campo, valor_anterior, valor_novo
        )
        
        # Calcular data de expiração (14 meses)
        expira_date = datetime.now() + timedelta(days=RETENTION_MONTHS * 30)
        dt_expira = expira_date.strftime("%Y-%m-%d")
        
        with get_db() as conn:
            conn.execute(
                """
                INSERT INTO audit_log (
                    id_user, user_email, id_princ, operacao, campo,
                    valor_anterior, valor_novo, dt_expira
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    id_user,
                    user_nome,  # Grava short_nome na coluna user_email
                    id_princ,
                    operacao,
                    campo,
                    _serialize_value(valor_anterior),
                    _serialize_value(valor_novo),
                    dt_expira,
                )
            )
            conn.commit()
            
        logger.info(
            "Audit: %s | user=%s | princ=%d | campo=%s",
            operacao, user_nome, id_princ, campo
        )
        
    except Exception as e:
        # Não interrompe a operação principal se o log falhar
        logger.error("Erro ao registrar auditoria: %s", e)


def get_history(id_princ: int, limit: int = 100) -> list[dict]:
    """
    Retorna histórico de operações de um registro.
    
    Args:
        id_princ: ID do registro
        limit: Limite de registros (padrão 100)
        
    Returns:
        Lista de operações ordenadas por data (mais recente primeiro)
    """
    _ensure_table_exists()
    
    with get_db() as conn:
        cursor = conn.execute(
            """
            SELECT 
                id_log,
                id_user,
                user_email,
                operacao,
                campo,
                valor_anterior,
                valor_novo,
                dt_operacao
            FROM audit_log
            WHERE id_princ = ?
            ORDER BY dt_operacao DESC, id_log DESC
            LIMIT ?
            """,
            (id_princ, limit)
        )
        
        rows = cursor.fetchall()
        
        return [
            {
                "id_log": row["id_log"],
                "id_user": row["id_user"],
                "user_email": row["user_email"],
                "operacao": row["operacao"],
                "campo": row["campo"],
                "valor_anterior": row["valor_anterior"],
                "valor_novo": row["valor_novo"],
                "dt_operacao": row["dt_operacao"],
            }
            for row in rows
        ]


def cleanup_expired() -> int:
    """
    Remove registros expirados (mais antigos que 14 meses).
    
    Returns:
        Número de registros removidos
    """
    _ensure_table_exists()
    
    with get_db() as conn:
        cursor = conn.execute(
            "DELETE FROM audit_log WHERE dt_expira < date('now')"
        )
        deleted = cursor.rowcount
        conn.commit()
        
        logger.info("Audit cleanup: %d registros removidos", deleted)
        return deleted


def get_stats() -> dict:
    """
    Retorna estatísticas do log de auditoria.
    
    Returns:
        Dict com total de registros, mais antigo, etc.
    """
    _ensure_table_exists()
    
    with get_db() as conn:
        # Total de registros
        total = conn.execute("SELECT COUNT(*) FROM audit_log").fetchone()[0]
        
        # Registro mais antigo
        oldest = conn.execute(
            "SELECT MIN(dt_operacao) FROM audit_log"
        ).fetchone()[0]
        
        # Registros expirados (prontos para limpeza)
        expired = conn.execute(
            "SELECT COUNT(*) FROM audit_log WHERE dt_expira < date('now')"
        ).fetchone()[0]
        
        return {
            "total_registros": total,
            "registro_mais_antigo": oldest,
            "registros_expirados": expired,
        }
