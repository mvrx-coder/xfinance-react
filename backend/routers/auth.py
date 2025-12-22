"""
Router de Autenticação - xFinance API

Endpoints:
- POST /api/auth/login - Login com email/senha
- POST /api/auth/logout - Logout (invalida cookie)
- GET /api/auth/me - Retorna usuário atual
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Response, Cookie, Depends
from pydantic import BaseModel, EmailStr

from services.auth import (
    verify_login,
    create_access_token,
    get_current_user_from_token,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# =============================================================================
# SCHEMAS
# =============================================================================

class LoginRequest(BaseModel):
    """Request de login."""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Response de login bem-sucedido."""
    success: bool
    message: str
    user: Optional[dict] = None


class UserResponse(BaseModel):
    """Response com dados do usuário."""
    email: str
    papel: str
    nome: Optional[str] = None
    nick: Optional[str] = None
    short_nome: Optional[str] = None


# =============================================================================
# DEPENDENCIES
# =============================================================================

def get_current_user(access_token: Optional[str] = Cookie(default=None)) -> dict:
    """
    Dependency que extrai usuário do cookie.
    
    Raises:
        HTTPException 401 se não autenticado
    """
    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Não autenticado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = get_current_user_from_token(access_token)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def get_current_user_optional(
    access_token: Optional[str] = Cookie(default=None)
) -> Optional[dict]:
    """
    Dependency que extrai usuário do cookie (opcional).
    
    Returns:
        User dict ou None se não autenticado
    """
    if not access_token:
        return None
    
    return get_current_user_from_token(access_token)


# =============================================================================
# ENDPOINTS
# =============================================================================

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, response: Response):
    """
    Realiza login com email e senha.
    
    - Verifica credenciais no banco SQLite
    - Cria token JWT
    - Define cookie httponly com o token
    
    Returns:
        LoginResponse com dados do usuário
    """
    user = verify_login(request.email, request.password)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email ou senha incorretos"
        )
    
    # Criar token JWT com dados do usuário
    token_data = {
        "sub": user.email,
        "id_user": user.id_user,
        "papel": user.papel,
        "nome": user.nome,
        "nick": user.nick,
        "short_nome": user.short_nome,
    }
    access_token = create_access_token(token_data)
    
    # Definir cookie httponly
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # True em produção com HTTPS
        samesite="lax",
        max_age=60 * 60 * 8,  # 8 horas
    )
    
    return LoginResponse(
        success=True,
        message=f"Bem-vindo, {user.nick or user.nome or user.email}!",
        user=user.to_dict(),
    )


@router.post("/logout")
def logout(response: Response):
    """
    Realiza logout.
    
    - Remove cookie de autenticação
    """
    response.delete_cookie(key="access_token")
    
    return {"success": True, "message": "Logout realizado"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """
    Retorna dados do usuário autenticado.
    
    Requires:
        Cookie access_token válido
    """
    return UserResponse(
        email=current_user["email"],
        papel=current_user["papel"],
        nome=current_user.get("nome"),
        nick=current_user.get("nick"),
        short_nome=current_user.get("short_nome"),
    )

