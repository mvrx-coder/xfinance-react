"""
Serviço de Autenticação - xFinance

Baseado em: x_main/services/db/auth.py
"""

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional, Union

import bcrypt
from jose import jwt

from config import get_settings
from database import get_db

logger = logging.getLogger(__name__)
settings = get_settings()


# =============================================================================
# SCHEMAS
# =============================================================================

class LoginStatus(str, Enum):
    """Status possíveis da verificação de login."""
    SUCCESS = "success"
    EMAIL_NOT_FOUND = "email_not_found"
    WRONG_PASSWORD = "wrong_password"
    MISSING_PASSWORD = "missing_password"
    USER_INACTIVE = "user_inactive"
    USER_LOCKED = "user_locked"


@dataclass
class LoginResult:
    """Resultado da verificação de login."""
    status: LoginStatus
    user: Optional["UserResponse"] = None
    message: Optional[str] = None


class UserResponse:
    """Dados do usuário retornados após login."""
    def __init__(
        self,
        id_user: int,
        email: str,
        papel: str,
        nome: Optional[str] = None,
        nick: Optional[str] = None,
        short_nome: Optional[str] = None,
    ):
        self.id_user = id_user
        self.email = email
        self.papel = papel
        self.nome = nome
        self.nick = nick
        self.short_nome = short_nome
    
    def to_dict(self) -> dict:
        return {
            "id_user": self.id_user,
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

def check_email_status(email: str) -> LoginResult:
    """
    Verifica status de um email ANTES do login (para detectar primeiro acesso).
    
    Args:
        email: Email do usuário
        
    Returns:
        LoginResult com status específico:
        - EMAIL_NOT_FOUND: Email não cadastrado
        - MISSING_PASSWORD: Primeiro acesso (senha não definida)
        - USER_INACTIVE: Usuário desativado
        - USER_LOCKED: Usuário bloqueado por tentativas
        - SUCCESS: Email válido, pode tentar login
    """
    with get_db() as conn:
        cur = conn.cursor()
        _ensure_user_security_columns(conn)
        
        cur.execute(
            """
            SELECT hash_senha,
                   COALESCE(ativo, 1),
                   locked_until
            FROM user
            WHERE email = ?
            """,
            (email,),
        )
        row = cur.fetchone()
        
        if not row:
            return LoginResult(
                status=LoginStatus.EMAIL_NOT_FOUND,
                message="Email não cadastrado no sistema"
            )
        
        hash_db, ativo_db, locked_until = row
        
        # Usuário bloqueado
        if locked_until:
            try:
                locked_ts = datetime.fromisoformat(locked_until)
                if locked_ts > datetime.utcnow():
                    return LoginResult(
                        status=LoginStatus.USER_LOCKED,
                        message="Usuário bloqueado por muitas tentativas. Tente novamente em 15 minutos."
                    )
            except ValueError:
                pass
        
        # Usuário inativo
        if ativo_db != 1:
            return LoginResult(
                status=LoginStatus.USER_INACTIVE,
                message="Usuário desativado. Contate o administrador."
            )
        
        # Senha não definida - Primeiro acesso
        if not hash_db:
            return LoginResult(
                status=LoginStatus.MISSING_PASSWORD,
                message="Primeiro acesso detectado. Defina sua senha."
            )
        
        # Email válido, pode tentar login
        return LoginResult(status=LoginStatus.SUCCESS)


def verify_login(email: str, password: str) -> LoginResult:
    """
    Verifica credenciais de login.
    
    Args:
        email: Email do usuário
        password: Senha em texto plano
        
    Returns:
        LoginResult com status e usuário (se sucesso)
        
    Regras:
        - Bloqueia após 5 tentativas por 15 minutos
        - Usuário inativo não pode logar
        - Senha vazia retorna MISSING_PASSWORD
    """
    with get_db() as conn:
        cur = conn.cursor()
        _ensure_user_security_columns(conn)
        
        cur.execute(
            """
            SELECT id_user,
                   hash_senha,
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
            return LoginResult(
                status=LoginStatus.EMAIL_NOT_FOUND,
                message="Email não cadastrado no sistema"
            )
        
        (
            id_user_db,
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
        
        # Bloqueio temporário
        if locked_until:
            try:
                locked_ts = datetime.fromisoformat(locked_until)
                if locked_ts > datetime.utcnow():
                    logger.warning("Login bloqueado para %s até %s", email, locked_until)
                    return LoginResult(
                        status=LoginStatus.USER_LOCKED,
                        message="Usuário bloqueado por muitas tentativas. Tente novamente em 15 minutos."
                    )
            except ValueError:
                logger.warning("locked_until inválido para %s: %s", email, locked_until)
        
        # Usuário inativo
        if ativo_db != 1:
            logger.info("Login negado para %s: usuário inativo", email)
            return LoginResult(
                status=LoginStatus.USER_INACTIVE,
                message="Usuário desativado. Contate o administrador."
            )
        
        # Senha não definida - Primeiro acesso
        if not hash_db:
            logger.info("Primeiro acesso detectado para %s", email)
            return LoginResult(
                status=LoginStatus.MISSING_PASSWORD,
                message="Primeiro acesso detectado. Defina sua senha."
            )
        
        # Verificar senha
        if bcrypt.checkpw(password.encode("utf-8"), hash_db.encode("utf-8")):
            # Sucesso: resetar tentativas
            cur.execute(
                "UPDATE user SET failed_attempts = 0, locked_until = NULL WHERE email = ?",
                (email,),
            )
            conn.commit()
            
            logger.info("Login bem-sucedido: %s (papel=%s)", email, papel_db)
            user = UserResponse(
                id_user=id_user_db,
                email=email,
                papel=papel_db,
                nome=nome_db,
                nick=nick_db,
                short_nome=short_nome_db,
            )
            return LoginResult(status=LoginStatus.SUCCESS, user=user)
        
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
        return LoginResult(
            status=LoginStatus.WRONG_PASSWORD,
            message="Senha incorreta"
        )


def set_missing_password(email: str, new_password: str) -> LoginResult:
    """
    Define senha para usuário com hash_senha vazio (primeiro acesso).
    
    Args:
        email: Email do usuário
        new_password: Nova senha (mínimo 6 caracteres)
        
    Returns:
        LoginResult com status SUCCESS e usuário autenticado, ou erro
        
    Regras:
        - Só funciona se hash_senha estiver vazio
        - Mínimo 6 caracteres
        - Após definir, retorna usuário autenticado
    """
    # Validação básica
    if not new_password or len(new_password) < 6:
        return LoginResult(
            status=LoginStatus.WRONG_PASSWORD,
            message="A senha deve ter pelo menos 6 caracteres"
        )
    
    with get_db() as conn:
        cur = conn.cursor()
        _ensure_user_security_columns(conn)
        
        # Verificar se usuário existe e senha está vazia
        cur.execute(
            """
            SELECT id_user, hash_senha, papel, nome, nick, short_nome, COALESCE(ativo, 1)
            FROM user
            WHERE email = ?
            """,
            (email,),
        )
        row = cur.fetchone()
        
        if not row:
            return LoginResult(
                status=LoginStatus.EMAIL_NOT_FOUND,
                message="Email não cadastrado no sistema"
            )
        
        id_user_db, hash_db, papel_db, nome_db, nick_db, short_nome_db, ativo_db = row
        
        # Usuário inativo
        if ativo_db != 1:
            return LoginResult(
                status=LoginStatus.USER_INACTIVE,
                message="Usuário desativado. Contate o administrador."
            )
        
        # Senha já definida - não sobrescrever
        if hash_db:
            return LoginResult(
                status=LoginStatus.WRONG_PASSWORD,
                message="Senha já definida. Use o login normal."
            )
        
        # Gerar hash da nova senha
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), salt).decode("utf-8")
        
        # Salvar no banco
        cur.execute(
            """
            UPDATE user
            SET hash_senha = ?,
                salt = ?,
                failed_attempts = 0,
                locked_until = NULL
            WHERE email = ?
            """,
            (hashed_password, salt.decode("utf-8"), email),
        )
        conn.commit()
        
        logger.info("Senha definida com sucesso para %s (primeiro acesso)", email)
        
        # Retornar usuário autenticado
        user = UserResponse(
            id_user=id_user_db,
            email=email,
            papel=papel_db,
            nome=nome_db,
            nick=nick_db,
            short_nome=short_nome_db,
        )
        return LoginResult(
            status=LoginStatus.SUCCESS,
            user=user,
            message="Senha definida com sucesso!"
        )


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
        Dict com id_user, email e papel, ou None se token inválido
    """
    payload = decode_access_token(token)
    if not payload:
        return None
    
    email = payload.get("sub")
    papel = payload.get("papel")
    id_user = payload.get("id_user")
    
    if not email or not papel:
        return None
    
    return {
        "id_user": id_user,
        "email": email,
        "papel": papel,
        "nome": payload.get("nome"),
        "nick": payload.get("nick"),
        "short_nome": payload.get("short_nome"),
    }

