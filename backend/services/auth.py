"""
Serviço de Autenticação - xFinance

Baseado em: x_main/services/db/auth.py
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from jose import jwt

from config import get_settings
from database import get_db

logger = logging.getLogger(__name__)
settings = get_settings()


# =============================================================================
# SCHEMAS
# =============================================================================

class UserResponse:
    """Dados do usuário retornados após login."""
    def __init__(
        self,
        email: str,
        papel: str,
        nome: Optional[str] = None,
        nick: Optional[str] = None,
        short_nome: Optional[str] = None,
    ):
        self.email = email
        self.papel = papel
        self.nome = nome
        self.nick = nick
        self.short_nome = short_nome
    
    def to_dict(self) -> dict:
        return {
            "email": self.email,
            "papel": self.papel,
            "nome": self.nome,
            "nick": self.nick,
            "short_nome": self.short_nome,
        }


# =============================================================================
# FUNÇÕES AUXILIARES
# =============================================================================

def _ensure_user_security_columns(conn) -> None:
    """Garante colunas de segurança na tabela user para bloqueio e tentativas."""
    cur = conn.cursor()
    cur.execute("PRAGMA table_info('user')")
    existing_cols = {row[1] for row in cur.fetchall()}
    
    altered = False
    if "failed_attempts" not in existing_cols:
        cur.execute("ALTER TABLE user ADD COLUMN failed_attempts INTEGER DEFAULT 0")
        altered = True
    if "locked_until" not in existing_cols:
        cur.execute("ALTER TABLE user ADD COLUMN locked_until TEXT")
        altered = True
    
    if altered:
        conn.commit()


# =============================================================================
# AUTENTICAÇÃO
# =============================================================================

def verify_login(email: str, password: str) -> Optional[UserResponse]:
    """
    Verifica credenciais de login.
    
    Args:
        email: Email do usuário
        password: Senha em texto plano
        
    Returns:
        UserResponse se credenciais válidas, None caso contrário
        
    Regras:
        - Bloqueia após 5 tentativas por 15 minutos
        - Usuário inativo não pode logar
        - Senha vazia retorna None (precisa definir senha)
    """
    with get_db() as conn:
        cur = conn.cursor()
        _ensure_user_security_columns(conn)
        
        cur.execute(
            """
            SELECT hash_senha,
                   salt,
                   papel,
                   nome,
                   nick,
                   short_nome,
                   COALESCE(ativo, 1),
                   COALESCE(failed_attempts, 0),
                   locked_until
            FROM user
            WHERE email = ?
            """,
            (email,),
        )
        row = cur.fetchone()
        
        if not row:
            logger.info("Login falhou: email não encontrado - %s", email)
            return None
        
        (
            hash_db,
            _salt_db,
            papel_db,
            nome_db,
            nick_db,
            short_nome_db,
            ativo_db,
            failed_attempts,
            locked_until,
        ) = row
        
        # Senha não definida
        if not hash_db:
            logger.info("Login falhou: senha não definida para %s", email)
            return None
        
        # Bloqueio temporário
        if locked_until:
            try:
                locked_ts = datetime.fromisoformat(locked_until)
                if locked_ts > datetime.utcnow():
                    logger.warning("Login bloqueado para %s até %s", email, locked_until)
                    return None
            except ValueError:
                logger.warning("locked_until inválido para %s: %s", email, locked_until)
        
        # Usuário inativo
        if ativo_db != 1:
            logger.info("Login negado para %s: usuário inativo", email)
            return None
        
        # Verificar senha
        if bcrypt.checkpw(password.encode("utf-8"), hash_db.encode("utf-8")):
            # Sucesso: resetar tentativas
            cur.execute(
                "UPDATE user SET failed_attempts = 0, locked_until = NULL WHERE email = ?",
                (email,),
            )
            conn.commit()
            
            logger.info("Login bem-sucedido: %s (papel=%s)", email, papel_db)
            return UserResponse(
                email=email,
                papel=papel_db,
                nome=nome_db,
                nick=nick_db,
                short_nome=short_nome_db,
            )
        
        # Falha: incrementar tentativas
        new_attempts = (failed_attempts or 0) + 1
        locked_until_val = None
        
        if new_attempts >= 5:
            locked_until_val = (datetime.utcnow() + timedelta(minutes=15)).isoformat()
            logger.warning(
                "Login bloqueado após 5 tentativas para %s até %s",
                email,
                locked_until_val,
            )
        
        cur.execute(
            "UPDATE user SET failed_attempts = ?, locked_until = ? WHERE email = ?",
            (new_attempts, locked_until_val, email),
        )
        conn.commit()
        
        logger.info("Login falhou para %s (tentativas=%s)", email, new_attempts)
        return None


# =============================================================================
# JWT TOKEN
# =============================================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Cria token JWT.
    
    Args:
        data: Dados a incluir no token (ex: {"sub": "email", "papel": "admin"})
        expires_delta: Tempo de expiração (default: ACCESS_TOKEN_EXPIRE_MINUTES)
        
    Returns:
        Token JWT codificado
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodifica token JWT.
    
    Args:
        token: Token JWT
        
    Returns:
        Payload do token se válido, None caso contrário
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except Exception as e:
        logger.warning("Erro ao decodificar token: %s", e)
        return None


def get_current_user_from_token(token: str) -> Optional[dict]:
    """
    Obtém dados do usuário a partir do token.
    
    Returns:
        Dict com email e papel, ou None se token inválido
    """
    payload = decode_access_token(token)
    if not payload:
        return None
    
    email = payload.get("sub")
    papel = payload.get("papel")
    
    if not email or not papel:
        return None
    
    return {
        "email": email,
        "papel": papel,
        "nome": payload.get("nome"),
        "nick": payload.get("nick"),
        "short_nome": payload.get("short_nome"),
    }

