"""
Router de Autenticação - xFinance API

Endpoints:
- POST /api/auth/login - Login com email/senha
- POST /api/auth/logout - Logout (invalida cookie)
- GET /api/auth/me - Retorna usuário atual
- POST /api/auth/check-email - Verifica status do email (primeiro acesso)
- POST /api/auth/set-password - Define senha no primeiro acesso
"""

from typing import Optional

from fastapi import APIRouter, HTTPException, Response, Cookie, Depends
from pydantic import BaseModel, EmailStr

from services.auth import (
    verify_login,
    check_email_status,
    set_missing_password,
    create_access_token,
    get_current_user_from_token,
    LoginStatus,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# =============================================================================
# SCHEMAS
# =============================================================================

class LoginRequest(BaseModel):
    """Request de login."""
    email: EmailStr
    password: str


class CheckEmailRequest(BaseModel):
    """Request para verificar status do email."""
    email: EmailStr


class CheckEmailResponse(BaseModel):
    """Response da verificação de email."""
    status: str
    message: Optional[str] = None
    requires_password_setup: bool = False


class SetPasswordRequest(BaseModel):
    """Request para definir senha no primeiro acesso."""
    email: EmailStr
    password: str
    confirm_password: str


class LoginResponse(BaseModel):
    """Response de login bem-sucedido."""
    success: bool
    message: str
    status: Optional[str] = None
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

@router.post("/check-email", response_model=CheckEmailResponse)
def check_email(request: CheckEmailRequest):
    """
    Verifica status do email antes do login.
    
    Usado para detectar primeiro acesso e mostrar formulário apropriado.
    
    Returns:
        CheckEmailResponse com status do email
    """
    result = check_email_status(request.email)
    
    return CheckEmailResponse(
        status=result.status.value,
        message=result.message,
        requires_password_setup=result.status == LoginStatus.MISSING_PASSWORD,
    )


@router.post("/set-password", response_model=LoginResponse)
def set_password(request: SetPasswordRequest, response: Response):
    """
    Define senha no primeiro acesso.
    
    - Só funciona se hash_senha estiver vazio
    - Após definir, retorna usuário autenticado
    
    Returns:
        LoginResponse com dados do usuário
    """
    # Validar confirmação de senha
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="As senhas não coincidem"
        )
    
    result = set_missing_password(request.email, request.password)
    
    if result.status != LoginStatus.SUCCESS:
        # Mapear status para código HTTP apropriado
        status_code = 400
        if result.status == LoginStatus.EMAIL_NOT_FOUND:
            status_code = 404
        elif result.status == LoginStatus.USER_INACTIVE:
            status_code = 403
        
        raise HTTPException(
            status_code=status_code,
            detail=result.message
        )
    
    # Criar token JWT e definir cookie
    user = result.user
    token_data = {
        "sub": user.email,
        "id_user": user.id_user,
        "papel": user.papel,
        "nome": user.nome,
        "nick": user.nick,
        "short_nome": user.short_nome,
    }
    access_token = create_access_token(token_data)
    
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 8,
    )
    
    return LoginResponse(
        success=True,
        message=result.message or "Senha definida com sucesso!",
        status=result.status.value,
        user=user.to_dict(),
    )


@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, response: Response):
    """
    Realiza login com email e senha.
    
    - Verifica credenciais no banco SQLite
    - Cria token JWT
    - Define cookie httponly com o token
    
    Returns:
        LoginResponse com dados do usuário e status específico
    """
    result = verify_login(request.email, request.password)
    
    # Se não foi sucesso, retornar erro com status específico
    if result.status != LoginStatus.SUCCESS:
        # Para primeiro acesso, retornar 200 com status específico (não é erro)
        if result.status == LoginStatus.MISSING_PASSWORD:
            return LoginResponse(
                success=False,
                message=result.message or "Primeiro acesso detectado. Defina sua senha.",
                status=result.status.value,
                user=None,
            )
        
        # Outros erros
        raise HTTPException(
            status_code=401,
            detail=result.message or "Email ou senha incorretos"
        )
    
    user = result.user
    
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
        status=result.status.value,
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

