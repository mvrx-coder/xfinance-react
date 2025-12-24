"""
Dependencies do FastAPI - xFinance

Módulo centralizado de dependencies para injeção de dependências.

🔒 CRÍTICO: Todas as rotas que acessam dados DEVEM usar get_current_user.
"""

from typing import Optional

from fastapi import Depends, HTTPException, Cookie, status

from services.auth import get_current_user_from_token
from services.permissions import (
    is_admin,
    is_backoffice_or_admin,
    can_perform_action,
    get_permitted_columns,
)


# =============================================================================
# SCHEMAS
# =============================================================================

class CurrentUser:
    """Dados do usuário atual."""
    
    def __init__(
        self,
        email: str,
        papel: str,
        id_user: Optional[int] = None,
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
        
        # Permissões derivadas
        self._permitted_columns: Optional[set[str]] = None
    
    @property
    def is_admin(self) -> bool:
        return is_admin(self.papel)
    
    @property
    def is_backoffice_or_admin(self) -> bool:
        return is_backoffice_or_admin(self.papel)
    
    @property
    def permitted_columns(self) -> set[str]:
        """Colunas que o usuário pode ver (lazy loading)."""
        if self._permitted_columns is None:
            self._permitted_columns = get_permitted_columns(self.papel)
        return self._permitted_columns
    
    def can_perform(self, action: str) -> bool:
        """Verifica se pode executar uma ação."""
        return can_perform_action(self.papel, action)
    
    def can_view_column(self, column: str) -> bool:
        """Verifica se pode ver uma coluna."""
        return column in self.permitted_columns
    
    def to_dict(self) -> dict:
        return {
            "email": self.email,
            "papel": self.papel,
            "nome": self.nome,
            "nick": self.nick,
            "short_nome": self.short_nome,
        }


# =============================================================================
# DEPENDENCIES
# =============================================================================

def get_current_user(
    access_token: Optional[str] = Cookie(default=None)
) -> CurrentUser:
    """
    🔒 DEPENDENCY PRINCIPAL: Extrai e valida usuário do cookie.
    
    Use em TODAS as rotas que precisam de autenticação.
    
    Raises:
        HTTPException 401: Se não autenticado ou token inválido
        
    Exemplo:
        @router.get("/data")
        def get_data(current_user: CurrentUser = Depends(get_current_user)):
            if not current_user.is_admin:
                raise HTTPException(403, "Acesso negado")
            ...
    """
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_data = get_current_user_from_token(access_token)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return CurrentUser(
        id_user=user_data.get("id_user"),
        email=user_data["email"],
        papel=user_data["papel"],
        nome=user_data.get("nome"),
        nick=user_data.get("nick"),
        short_nome=user_data.get("short_nome"),
    )


def get_current_user_optional(
    access_token: Optional[str] = Cookie(default=None)
) -> Optional[CurrentUser]:
    """
    Extrai usuário do cookie (opcional).
    
    Use em rotas que funcionam com ou sem autenticação.
    
    Returns:
        CurrentUser ou None se não autenticado
    """
    if not access_token:
        return None
    
    user_data = get_current_user_from_token(access_token)
    
    if not user_data:
        return None
    
    return CurrentUser(
        id_user=user_data.get("id_user"),
        email=user_data["email"],
        papel=user_data["papel"],
        nome=user_data.get("nome"),
        nick=user_data.get("nick"),
        short_nome=user_data.get("short_nome"),
    )


# =============================================================================
# DEPENDENCIES ESPECÍFICAS POR PAPEL
# =============================================================================

def require_admin(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """
    🔒 Requer papel admin.
    
    Use em rotas administrativas (excluir, gerenciar usuários, etc.)
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores"
        )
    return current_user


def require_backoffice_or_admin(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """
    🔒 Requer papel admin ou BackOffice.
    
    Use em rotas de operação (encaminhar, marcar, etc.)
    """
    if not current_user.is_backoffice_or_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a BackOffice ou administradores"
        )
    return current_user


# =============================================================================
# DEPENDENCIES DE AÇÃO
# =============================================================================

def can_delete(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """🔒 Requer permissão de excluir (somente admin)."""
    if not current_user.can_perform("excluir"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para excluir registros"
        )
    return current_user


def can_forward(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """🔒 Requer permissão de encaminhar (admin ou BackOffice)."""
    if not current_user.can_perform("encaminhar"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para encaminhar registros"
        )
    return current_user


def can_mark(
    current_user: CurrentUser = Depends(get_current_user)
) -> CurrentUser:
    """🔒 Requer permissão de marcar (admin ou BackOffice)."""
    if not current_user.can_perform("marcar"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para marcar alertas"
        )
    return current_user

