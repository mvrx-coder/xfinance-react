"""
Router de Novo Registro - xFinance

Endpoints para criação de novos registros de inspeção.
Implementação limpa do zero, substituindo funcionalidade anterior.

🔒 ADMIN ONLY: Apenas administradores podem criar registros.

Endpoints:
- POST /api/new-record             → Criar novo registro
- POST /api/new-record/local       → Adicionar local adicional
- GET  /api/new-record/segurados   → Busca server-side de segurados
- GET  /api/new-record/atividades  → Busca server-side de atividades
"""

import logging
from datetime import date
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, field_validator

from database import get_db
from dependencies import CurrentUser, require_admin

from services.queries.new_inspection import (
    get_or_create_segur,
    get_or_create_ativi,
    insert_new_inspection,
    insert_demais_local,
    increment_princ_loc,
    get_atividade_texto,
    create_inspection_atomic,
)
from services.directories import create_directories

logger = logging.getLogger(__name__)

router = APIRouter()


# =============================================================================
# SCHEMAS
# =============================================================================

class LookupOption(BaseModel):
    """Opção de dropdown."""
    value: int
    label: str


class NewRecordRequest(BaseModel):
    """Request para criar novo registro."""
    
    # Contratante (obrigatório)
    id_contr: int = Field(..., gt=0, description="ID do contratante (player)")
    
    # Segurado: ID existente OU texto para criar novo
    id_segur: Optional[int] = Field(None, description="ID do segurado existente")
    segur_nome: Optional[str] = Field(None, description="Nome para criar novo segurado")
    
    # Atividade: ID existente OU texto para criar nova
    id_ativi: Optional[int] = Field(None, description="ID da atividade existente")
    atividade: Optional[str] = Field(None, description="Texto para criar nova atividade")
    
    # Campos obrigatórios
    id_user_guy: int = Field(..., gt=0, description="ID do inspetor (guy)")
    dt_inspecao: str = Field(..., description="Data da inspeção (YYYY-MM-DD)")
    id_uf: int = Field(..., gt=0, description="ID da UF")
    id_cidade: int = Field(..., gt=0, description="ID da cidade")
    
    # Opcional
    honorario: Optional[float] = Field(None, ge=0, description="Valor do honorário")
    
    @field_validator("dt_inspecao")
    @classmethod
    def validate_date(cls, v: str) -> str:
        """Valida formato da data."""
        if not v:
            raise ValueError("Data obrigatória")
        # Aceitar formatos comuns
        v = v.strip()
        # Já está no formato ISO?
        if len(v) == 10 and v[4] == "-" and v[7] == "-":
            return v
        raise ValueError("Data deve estar no formato YYYY-MM-DD")
    
    @field_validator("segur_nome", "atividade")
    @classmethod
    def clean_create_prefix(cls, v: Optional[str]) -> Optional[str]:
        """Remove prefixo '➕ Criar: ' se presente."""
        if v and v.startswith("➕ Criar: "):
            return v.replace("➕ Criar: ", "").strip()
        return v.strip() if v else None


class LocalAdicionalRequest(BaseModel):
    """Request para adicionar local a registro existente."""
    
    id_princ: int = Field(..., gt=0, description="ID do registro principal")
    id_user_guy: int = Field(..., gt=0, description="ID do inspetor (guy)")
    dt_inspecao: str = Field(..., description="Data da inspeção (YYYY-MM-DD)")
    id_uf: int = Field(..., gt=0, description="ID da UF")
    id_cidade: int = Field(..., gt=0, description="ID da cidade")
    
    @field_validator("dt_inspecao")
    @classmethod
    def validate_date(cls, v: str) -> str:
        """Valida formato da data."""
        v = v.strip()
        if len(v) == 10 and v[4] == "-" and v[7] == "-":
            return v
        raise ValueError("Data deve estar no formato YYYY-MM-DD")


class NewRecordResponse(BaseModel):
    """Response da criação de registro."""
    success: bool
    id_princ: int
    message: str
    dirs_created: List[str] = []
    loc: int = 1


# =============================================================================
# POST /api/new-record - Criar novo registro
# =============================================================================

@router.post("", response_model=NewRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_new_record(
    request: NewRecordRequest,
    current_user: CurrentUser = Depends(require_admin),
):
    """
    Cria novo registro de inspeção.
    
    🔒 ADMIN ONLY
    
    O segurado e atividade podem ser:
    - ID existente (id_segur/id_ativi)
    - Texto para criar novo (segur_nome/atividade)
    
    Campos hardcoded (sistema antigo):
    - id_user_guilty = 19
    - dt_acerto = 1º dia do mês corrente
    - loc = 1
    - meta = 1
    """
    logger.info(
        "POST /new-record | user=%s | contr=%d | uf=%d | cidade=%d",
        current_user.email,
        request.id_contr,
        request.id_uf,
        request.id_cidade,
    )
    
    try:
        # ═══════════════════════════════════════════════════════════════════
        # CRIAÇÃO ATÔMICA (única transação)
        # ═══════════════════════════════════════════════════════════════════
        id_princ, id_segur, id_ativi = create_inspection_atomic(
            id_contr=request.id_contr,
            id_segur=request.id_segur,
            segur_nome=request.segur_nome,
            id_ativi=request.id_ativi,
            atividade_texto=request.atividade,
            id_user_guy=request.id_user_guy,
            dt_inspecao=request.dt_inspecao,
            id_uf=request.id_uf,
            id_cidade=request.id_cidade,
            honorario=request.honorario,
        )
        
        logger.info(
            "Registro criado: id_princ=%d | segur=%d | ativi=%d",
            id_princ, id_segur, id_ativi
        )
        
        # ═══════════════════════════════════════════════════════════════════
        # 4. CRIAR DIRETÓRIOS
        # ═══════════════════════════════════════════════════════════════════
        dt_acerto = date.today().replace(day=1).strftime("%Y-%m-%d")
        dir_msg, dirs_created = create_directories(
            id_contr=request.id_contr,
            id_segur=id_segur,
            dt_acerto=dt_acerto,
            id_uf=request.id_uf,
            id_cidade=request.id_cidade,
        )
        
        logger.info("Diretórios: %s | created=%s", dir_msg, dirs_created)
        
        return NewRecordResponse(
            success=True,
            id_princ=id_princ,
            message=f"Registro #{id_princ} criado! {dir_msg}",
            dirs_created=dirs_created,
            loc=1,
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning("Validação falhou: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Erro ao criar registro: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao criar registro: {str(e)}"
        )


# =============================================================================
# POST /api/new-record/local - Adicionar local adicional
# =============================================================================

@router.post("/local", response_model=NewRecordResponse, status_code=status.HTTP_201_CREATED)
async def add_local_adicional(
    request: LocalAdicionalRequest,
    current_user: CurrentUser = Depends(require_admin),
):
    """
    Adiciona local adicional a registro existente.
    
    🔒 ADMIN ONLY
    
    Este endpoint:
    1. Insere registro na tabela demais_locais
    2. Incrementa campo loc no registro principal
    3. Cria diretórios para o novo local
    """
    logger.info(
        "POST /new-record/local | user=%s | princ=%d | uf=%d | cidade=%d",
        current_user.email,
        request.id_princ,
        request.id_uf,
        request.id_cidade,
    )
    
    try:
        # ═══════════════════════════════════════════════════════════════════
        # 1. VERIFICAR REGISTRO PRINCIPAL
        # ═══════════════════════════════════════════════════════════════════
        with get_db() as conn:
            cursor = conn.execute(
                "SELECT id_contr, id_segur FROM princ WHERE id_princ = ?",
                (request.id_princ,)
            )
            row = cursor.fetchone()
            
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Registro principal #{request.id_princ} não encontrado"
                )
            
            id_contr = row[0]
            id_segur = row[1]
        
        # ═══════════════════════════════════════════════════════════════════
        # 2. INSERIR LOCAL ADICIONAL
        # ═══════════════════════════════════════════════════════════════════
        insert_demais_local(
            id_princ=request.id_princ,
            dt_inspecao=request.dt_inspecao,
            id_uf=request.id_uf,
            id_cidade=request.id_cidade,
            id_user_guy=request.id_user_guy,
        )
        
        # ═══════════════════════════════════════════════════════════════════
        # 3. INCREMENTAR LOC
        # ═══════════════════════════════════════════════════════════════════
        new_loc = increment_princ_loc(request.id_princ)
        
        logger.info("Local adicional: princ=%d → loc=%d", request.id_princ, new_loc)
        
        # ═══════════════════════════════════════════════════════════════════
        # 4. CRIAR DIRETÓRIOS
        # ═══════════════════════════════════════════════════════════════════
        dt_acerto = date.today().replace(day=1).strftime("%Y-%m-%d")
        dir_msg, dirs_created = create_directories(
            id_contr=id_contr,
            id_segur=id_segur,
            dt_acerto=dt_acerto,
            id_uf=request.id_uf,
            id_cidade=request.id_cidade,
        )
        
        return NewRecordResponse(
            success=True,
            id_princ=request.id_princ,
            message=f"Local #{new_loc} adicionado! {dir_msg}",
            dirs_created=dirs_created,
            loc=new_loc,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao adicionar local: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno ao adicionar local: {str(e)}"
        )


# =============================================================================
# GET /api/new-record/segurados - Busca server-side
# =============================================================================

@router.get("/segurados", response_model=List[LookupOption])
async def search_segurados(
    q: str = Query("", description="Texto para buscar"),
    limit: int = Query(50, ge=1, le=200, description="Limite de resultados"),
    current_user: CurrentUser = Depends(require_admin),
):
    """
    Busca segurados com filtro de texto (server-side).
    
    Se q vazio, retorna os mais recentemente usados.
    """
    with get_db() as conn:
        if q.strip():
            # Com filtro: busca por LIKE
            cursor = conn.execute(
                """
                SELECT id_segur, segur_nome
                FROM segur
                WHERE segur_nome LIKE ?
                ORDER BY segur_nome
                LIMIT ?
                """,
                (f"%{q}%", limit)
            )
        else:
            # Sem filtro: retorna mais recentemente usados
            # COALESCE para compatibilidade com SQLite (NULLS LAST não suportado)
            cursor = conn.execute(
                """
                SELECT s.id_segur, s.segur_nome
                FROM segur s
                LEFT JOIN (
                    SELECT id_segur, MAX(id_princ) as ultimo
                    FROM princ
                    GROUP BY id_segur
                ) p ON s.id_segur = p.id_segur
                ORDER BY COALESCE(p.ultimo, 0) DESC, s.segur_nome
                LIMIT ?
                """,
                (limit,)
            )
        
        rows = cursor.fetchall()
    
    return [
        LookupOption(value=row[0], label=row[1] or f"#{row[0]}")
        for row in rows
    ]


# =============================================================================
# GET /api/new-record/atividades - Busca server-side
# =============================================================================

@router.get("/atividades", response_model=List[LookupOption])
async def search_atividades(
    q: str = Query("", description="Texto para buscar"),
    limit: int = Query(50, ge=1, le=200, description="Limite de resultados"),
    current_user: CurrentUser = Depends(require_admin),
):
    """
    Busca atividades com filtro de texto (server-side).
    
    Se q vazio, retorna as mais usadas.
    """
    with get_db() as conn:
        if q.strip():
            # Com filtro: busca por LIKE
            cursor = conn.execute(
                """
                SELECT id_ativi, atividade
                FROM ativi
                WHERE atividade LIKE ?
                ORDER BY atividade
                LIMIT ?
                """,
                (f"%{q}%", limit)
            )
        else:
            # Sem filtro: retorna mais usadas
            # COALESCE para compatibilidade com SQLite (NULLS LAST não suportado)
            cursor = conn.execute(
                """
                SELECT a.id_ativi, a.atividade
                FROM ativi a
                LEFT JOIN (
                    SELECT id_ativi, COUNT(*) as uso
                    FROM princ
                    GROUP BY id_ativi
                ) p ON a.id_ativi = p.id_ativi
                ORDER BY COALESCE(p.uso, 0) DESC, a.atividade
                LIMIT ?
                """,
                (limit,)
            )
        
        rows = cursor.fetchall()
    
    return [
        LookupOption(value=row[0], label=row[1] or f"#{row[0]}")
        for row in rows
    ]
