"""
Router de Inspeções - xFinance

🔒 CRÍTICO: Todas as rotas respeitam permissões por papel.

Endpoints:
- GET  /api/inspections     - Lista inspeções (filtrado por papel)
- GET  /api/inspections/{id} - Detalhe de inspeção
- POST /api/inspections     - Criar inspeção (admin only)
- PATCH /api/inspections/{id} - Atualizar inspeção
- DELETE /api/inspections/{id} - Excluir inspeção (admin only)
"""

import logging
import re
from datetime import datetime, date
from typing import Optional, Any, List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from database import get_db
from dependencies import (
    CurrentUser,
    get_current_user,
    require_admin,
    can_delete,
)
from services.queries.grid import load_grid, count_grid
from services.queries.column_metadata import get_column_order
from services.queries.new_inspection import (
    get_or_create_segur,
    get_or_create_ativi,
    insert_new_inspection,
    insert_demais_local,
    increment_princ_loc,
    get_atividade_texto,
)
from services.directories import create_directories

logger = logging.getLogger(__name__)

router = APIRouter()


# =============================================================================
# GET /api/inspections - Lista de inspeções
# =============================================================================

@router.get("")
async def list_inspections(
    current_user: CurrentUser = Depends(get_current_user),
    order: str = Query("normal", regex="^(normal|player|prazo)$"),
    limit: Optional[int] = Query(None, ge=1, le=10000),
    my_job: bool = Query(False, description="Filtrar apenas registros do usuário logado"),
):
    """
    Lista inspeções com base nas permissões do usuário.
    
    🔒 SIGILO: Colunas retornadas dependem do papel do usuário.
    
    Args:
        order: Modo de ordenação (normal, player, prazo)
        limit: Limite de registros
        my_job: Se True, filtra apenas registros onde id_user_guilty = usuário logado
        
    Returns:
        {
            "data": [...],
            "total": int,
            "columns": [...],
            "papel": str
        }
    """
    logger.info(
        "GET /inspections | user=%s | papel=%s | order=%s | limit=%s | my_job=%s",
        current_user.email,
        current_user.papel,
        order,
        limit,
        my_job,
    )
    
    try:
        # Carregar dados respeitando permissões
        data = load_grid(
            papel=current_user.papel,
            modo_ordenacao=order,
            limit=limit,
            my_job_user_id=current_user.id_user if my_job else None,
        )
        
        # Total de registros (sem limite)
        total = count_grid(current_user.papel)
        
        # Ordem de colunas para o papel
        columns = get_column_order(current_user.papel)
        
        return {
            "data": data,
            "total": total,
            "columns": columns,
            "papel": current_user.papel,
        }
        
    except Exception as e:
        logger.error(
            "Erro ao listar inspeções: %s | user=%s | papel=%s",
            e,
            current_user.email,
            current_user.papel,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao carregar inspeções"
        )


# =============================================================================
# GET /api/inspections/{id} - Detalhe de inspeção
# =============================================================================

@router.get("/{id_princ}")
async def get_inspection(
    id_princ: int,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Retorna detalhes de uma inspeção específica.
    
    🔒 SIGILO: Campos retornados dependem do papel do usuário.
    """
    # TODO: Implementar busca por id_princ respeitando permissões
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )


# =============================================================================
# POST /api/inspections - Criar inspeção
# =============================================================================

class CreateInspectionRequest(BaseModel):
    """Request body para criação de nova inspeção."""
    id_contr: int = Field(..., description="ID do contratante (player)")
    
    # Segurado: pode ser ID existente ou texto para criar novo
    id_segur: Optional[int] = Field(
        None, description="ID do segurado existente"
    )
    segur_nome: Optional[str] = Field(
        None, description="Nome do segurado (para criar novo)"
    )
    
    # Atividade: pode ser ID existente ou texto para criar nova
    id_ativi: Optional[int] = Field(
        None, description="ID da atividade existente"
    )
    atividade: Optional[str] = Field(
        None, description="Texto da atividade (para criar nova)"
    )
    
    id_user_guy: int = Field(..., description="ID do inspetor (guy)")
    dt_inspecao: str = Field(..., description="Data inspeção (YYYY-MM-DD)")
    id_uf: int = Field(..., description="ID da UF")
    id_cidade: int = Field(..., description="ID da cidade")
    honorario: Optional[float] = Field(None, description="Valor do honorário")


class CreateLocalAdicionalRequest(BaseModel):
    """Request body para criação de local adicional."""
    id_princ: int = Field(..., description="ID do registro principal")
    id_user_guy: int = Field(..., description="ID do inspetor (guy)")
    dt_inspecao: str = Field(..., description="Data da inspeção (YYYY-MM-DD)")
    id_uf: int = Field(..., description="ID da UF")
    id_cidade: int = Field(..., description="ID da cidade")


class CreateInspectionResponse(BaseModel):
    """Response da criação de inspeção."""
    success: bool
    id_princ: int
    message: str
    dirs_created: List[str] = []
    loc: int = 1


@router.post("", status_code=status.HTTP_201_CREATED, response_model=CreateInspectionResponse)
async def create_inspection(
    request: CreateInspectionRequest,
    current_user: CurrentUser = Depends(require_admin),
):
    """
    Cria nova inspeção.
    
    🔒 ADMIN ONLY: Apenas administradores podem criar inspeções.
    
    O segurado e atividade podem ser:
    - ID existente (id_segur/id_ativi)
    - Texto para criar novo (segur_nome/atividade)
    
    Campos hardcoded:
    - id_user_guilty = 19
    - dt_acerto = 1º dia do mês corrente
    - loc = 1
    """
    logger.info(
        "POST /inspections | user=%s | contr=%d | uf=%d | cidade=%d",
        current_user.email,
        request.id_contr,
        request.id_uf,
        request.id_cidade,
    )
    
    try:
        # Resolver segurado (ID existente ou criar novo)
        if request.id_segur:
            id_segur = request.id_segur
        elif request.segur_nome:
            # Limpar prefixo "➕ Criar: " se presente
            segur_nome = request.segur_nome
            if segur_nome.startswith("➕ Criar: "):
                segur_nome = segur_nome.replace("➕ Criar: ", "").strip()
            id_segur = get_or_create_segur(segur_nome)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Segurado obrigatório (id_segur ou segur_nome)"
            )
        
        # Resolver atividade (ID existente ou criar nova)
        atividade_texto = None
        if request.id_ativi:
            id_ativi = request.id_ativi
            atividade_texto = get_atividade_texto(id_ativi)
        elif request.atividade:
            # Limpar prefixo "➕ Criar: " se presente
            atividade = request.atividade
            if atividade.startswith("➕ Criar: "):
                atividade = atividade.replace("➕ Criar: ", "").strip()
            id_ativi = get_or_create_ativi(atividade)
            atividade_texto = atividade
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Atividade obrigatória (id_ativi ou atividade)"
            )
        
        # Inserir registro
        id_princ = insert_new_inspection(
            id_contr=request.id_contr,
            id_segur=id_segur,
            id_ativi=id_ativi,
            id_user_guy=request.id_user_guy,
            dt_inspecao=request.dt_inspecao,
            id_uf=request.id_uf,
            id_cidade=request.id_cidade,
            honorario=request.honorario,
            atividade_texto=atividade_texto,
        )
        
        # Criar diretórios
        dt_acerto = date.today().replace(day=1).strftime("%Y-%m-%d")
        dir_msg, dirs_created = create_directories(
            id_contr=request.id_contr,
            id_segur=id_segur,
            dt_acerto=dt_acerto,
            id_uf=request.id_uf,
            id_cidade=request.id_cidade,
        )
        
        logger.info(
            "Inspeção criada: id_princ=%d | dirs=%s",
            id_princ,
            dirs_created
        )
        
        return CreateInspectionResponse(
            success=True,
            id_princ=id_princ,
            message=f"Registro criado com sucesso! {dir_msg}",
            dirs_created=dirs_created,
            loc=1,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao criar inspeção: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar inspeção: {str(e)}"
        )


# =============================================================================
# POST /api/inspections/local-adicional - Adicionar local
# =============================================================================

@router.post("/local-adicional", status_code=status.HTTP_201_CREATED, response_model=CreateInspectionResponse)
async def create_local_adicional(
    request: CreateLocalAdicionalRequest,
    current_user: CurrentUser = Depends(require_admin),
):
    """
    Adiciona um local adicional a um registro existente.
    
    🔒 ADMIN ONLY: Apenas administradores podem adicionar locais.
    
    Este endpoint:
    1. Insere registro na tabela demais_locais
    2. Incrementa o campo loc no registro principal
    3. Cria diretórios para o novo local
    """
    logger.info(
        "POST /inspections/local-adicional | user=%s | princ=%d | uf=%d | cidade=%d",
        current_user.email,
        request.id_princ,
        request.id_uf,
        request.id_cidade,
    )
    
    try:
        # Buscar dados do registro principal para diretórios
        with get_db() as conn:
            cursor = conn.execute(
                "SELECT id_contr, id_segur FROM princ WHERE id_princ = ?",
                (request.id_princ,)
            )
            row = cursor.fetchone()
            if not row:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Registro principal {request.id_princ} não encontrado"
                )
            id_contr, id_segur = row
        
        # Inserir local adicional
        insert_demais_local(
            id_princ=request.id_princ,
            dt_inspecao=request.dt_inspecao,
            id_uf=request.id_uf,
            id_cidade=request.id_cidade,
            id_user_guy=request.id_user_guy,
        )
        
        # Incrementar loc
        new_loc = increment_princ_loc(request.id_princ)
        
        # Criar diretórios para o novo local
        dt_acerto = date.today().replace(day=1).strftime("%Y-%m-%d")
        dir_msg, dirs_created = create_directories(
            id_contr=id_contr,
            id_segur=id_segur,
            dt_acerto=dt_acerto,
            id_uf=request.id_uf,
            id_cidade=request.id_cidade,
        )
        
        logger.info(
            "Local adicional criado: princ=%d | loc=%d | dirs=%s",
            request.id_princ,
            new_loc,
            dirs_created
        )
        
        return CreateInspectionResponse(
            success=True,
            id_princ=request.id_princ,
            message=f"Local adicional cadastrado! (Total: {new_loc} locais) {dir_msg}",
            dirs_created=dirs_created,
            loc=new_loc,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao criar local adicional: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar local adicional: {str(e)}"
        )


# =============================================================================
# PATCH /api/inspections/{id} - Atualizar inspeção
# =============================================================================

class UpdateInspectionRequest(BaseModel):
    field: str
    value: Any


# Campos editáveis e seus tipos
EDITABLE_FIELDS = {
    # Datas
    "dt_inspecao": "date",
    "dt_entregue": "date",
    "dt_acerto": "date",
    "dt_envio": "date",
    "dt_pago": "date",
    "dt_denvio": "date",
    "dt_dpago": "date",
    "dt_guy_pago": "date",
    "dt_guy_dpago": "date",
    # Valores
    "honorario": "currency",
    "despesa": "currency",
    "guy_honorario": "currency",
    "guy_despesa": "currency",
    # Outros
    "loc": "integer",
    "meta": "boolean",
    "obs": "text",
}

# Campos restritos a admin
ADMIN_ONLY_FIELDS = {
    "honorario", "despesa", "guy_honorario", "guy_despesa",
    "dt_pago", "dt_dpago", "dt_guy_pago", "dt_guy_dpago",
}


def _convert_value(value: Any, field_type: str) -> Any:
    """
    Converte valor do frontend para formato do banco.
    
    Baseado em: x_main/app/callbacks/helpers.py > process_edited_value
    """
    if value is None or value == "" or value == "-":
        return None
    
    if field_type == "date":
        # Aceita DD/MM, DD/MM/AA, DD/MM/AAAA ou YYYY-MM-DD
        val_str = str(value).strip()
        
        # Já está no formato ISO?
        if re.match(r"^\d{4}-\d{2}-\d{2}$", val_str):
            return val_str
        
        # DD/MM/AA ou DD/MM/AAAA
        match = re.match(r"^(\d{1,2})/(\d{1,2})(?:/(\d{2,4}))?$", val_str)
        if match:
            day, month, year = match.groups()
            if year is None:
                year = datetime.now().year
            elif len(str(year)) == 2:
                year = 2000 + int(year)
            return f"{int(year):04d}-{int(month):02d}-{int(day):02d}"
        
        return None
    
    if field_type == "currency":
        # Aceita 1.234,56 (BR) ou 1234.56 (US)
        val_str = str(value).replace("R$", "").replace(" ", "").strip()
        # Formato brasileiro: 1.234,56
        if "," in val_str:
            val_str = val_str.replace(".", "").replace(",", ".")
        try:
            return float(val_str)
        except ValueError:
            return None
    
    if field_type == "integer":
        try:
            return int(value)
        except (ValueError, TypeError):
            return None
    
    if field_type == "boolean":
        if isinstance(value, bool):
            return 1 if value else 0
        val_str = str(value).lower().strip()
        return 1 if val_str in ("1", "true", "sim", "yes") else 0
    
    # text
    return str(value)


@router.patch("/{id_princ}")
async def update_inspection(
    id_princ: int,
    request: UpdateInspectionRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Atualiza um campo de uma inspeção.
    
    🔒 SIGILO: 
    - Apenas campos editáveis pelo papel podem ser alterados
    - Campos de sigilo alto só podem ser alterados por admin
    """
    field = request.field
    value = request.value
    
    # Verificar se campo é editável
    if field not in EDITABLE_FIELDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Campo '{field}' não é editável"
        )
    
    # Verificar permissão para campos restritos
    if field in ADMIN_ONLY_FIELDS and current_user.papel != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Campo '{field}' requer permissão de administrador"
        )
    
    # Converter valor
    field_type = EDITABLE_FIELDS[field]
    converted_value = _convert_value(value, field_type)
    
    logger.info(
        "PATCH /inspections/%s | user=%s | field=%s | value=%s -> %s",
        id_princ,
        current_user.email,
        field,
        value,
        converted_value,
    )
    
    try:
        with get_db() as conn:
            # Verificar se registro existe
            cursor = conn.execute(
                "SELECT id_princ FROM princ WHERE id_princ = ?",
                (id_princ,)
            )
            if not cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Inspeção não encontrada"
                )
            
            # Atualizar campo
            conn.execute(
                f"UPDATE princ SET {field} = ? WHERE id_princ = ?",
                (converted_value, id_princ)
            )
            conn.commit()
            
            return {
                "success": True,
                "message": f"Campo '{field}' atualizado",
                "id_princ": id_princ,
                "field": field,
                "new_value": converted_value,
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Erro ao atualizar inspeção %s: %s", id_princ, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao atualizar inspeção"
        )


# =============================================================================
# DELETE /api/inspections/{id} - Excluir inspeção
# =============================================================================

@router.delete("/{id_princ}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_inspection(
    id_princ: int,
    current_user: CurrentUser = Depends(can_delete),
):
    """
    Exclui uma inspeção.
    
    🔒 ADMIN ONLY: Apenas administradores podem excluir.
    """
    # TODO: Implementar exclusão (soft delete ou hard delete?)
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint em desenvolvimento"
    )

