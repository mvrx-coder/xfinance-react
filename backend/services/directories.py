"""
Serviço de criação de diretórios - xFinance

Cria diretórios no NAS e pasta local de fotos após inserção de nova inspeção.
"""

import logging
import os
import subprocess
from datetime import datetime
from typing import Tuple, List

from services.queries.new_inspection import get_directory_info

logger = logging.getLogger(__name__)

# =============================================================================
# CONFIGURAÇÃO NAS
# =============================================================================

# Servidor NAS (pode ser sobrescrito via variável de ambiente)
NAS_SERVER = os.getenv("XF_NAS_SERVER", r"\\192.168.1.100")
NAS_USER = os.getenv("XF_NAS_USER", "")
NAS_PASS = os.getenv("XF_NAS_PASS", "")

# Pasta base de fotos (local)
PHOTOS_BASE = r"E:\MVRX\Fotos"

# Cache de autenticação (evita re-autenticação na mesma sessão)
_nas_authenticated = False


# =============================================================================
# AUTENTICAÇÃO NAS
# =============================================================================

def _ensure_nas_connection() -> bool:
    """
    Garante conexão autenticada com o NAS usando net use.
    
    Usa credenciais das variáveis de ambiente XF_NAS_USER e XF_NAS_PASS.
    A autenticação é feita uma vez por sessão do servidor.
    
    Returns:
        bool: True se conectado/autenticado, False se falhou
    """
    global _nas_authenticated

    # Se já autenticou nesta sessão, não refaz
    if _nas_authenticated:
        return True

    # Se não há credenciais configuradas, tenta sem autenticação
    if not NAS_USER or not NAS_PASS:
        logger.info("NAS: Sem credenciais configuradas, tentando acesso direto")
        return True  # Deixa tentar - pode funcionar se o serviço rodar como usuário com acesso

    try:
        # Primeiro, desconecta conexão anterior se existir (evita conflitos)
        subprocess.run(
            ["net", "use", NAS_SERVER, "/delete", "/y"],
            capture_output=True,
            timeout=10,
        )
    except Exception:
        pass  # Ignora se não tinha conexão anterior

    try:
        # Conecta com as credenciais
        result = subprocess.run(
            ["net", "use", NAS_SERVER, f"/user:{NAS_USER}", NAS_PASS, "/persistent:no"],
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode == 0:
            _nas_authenticated = True
            logger.info("NAS: Autenticação bem-sucedida para %s", NAS_SERVER)
            return True
        else:
            logger.warning("NAS: Falha na autenticação - %s", result.stderr or result.stdout)
            return False

    except subprocess.TimeoutExpired:
        logger.warning("NAS: Timeout ao tentar autenticar")
        return False
    except Exception as e:
        logger.warning("NAS: Erro ao autenticar - %s", e)
        return False


# =============================================================================
# CRIAÇÃO DE DIRETÓRIOS
# =============================================================================

def _clean_path_component(s: str) -> str:
    """
    Remove caracteres inválidos para nomes de diretório Windows.
    
    Args:
        s: String a limpar
        
    Returns:
        String limpa sem caracteres proibidos
    """
    bad_chars = '<>:"/\\|?*'
    cleaned = "".join(ch if ch not in bad_chars else "_" for ch in (s or ""))
    return " ".join(cleaned.split()).strip()


def create_directories(
    id_contr: int,
    id_segur: int,
    dt_acerto: str,
    id_uf: int,
    id_cidade: int,
) -> Tuple[str, List[str]]:
    """
    Cria diretórios no NAS e pasta de fotos local.
    
    Args:
        id_contr: ID do contratante
        id_segur: ID do segurado
        dt_acerto: Data de acerto (YYYY-MM-DD)
        id_uf: ID da UF
        id_cidade: ID da cidade
        
    Returns:
        tuple: (mensagem_status, lista_diretorios_criados_display)
    """
    try:
        # Buscar informações para montar os caminhos
        info = get_directory_info(id_contr, id_segur, id_uf, id_cidade)
        
        player_name = info.get("player", "UNKNOWN")
        flag_dir = int(info.get("diretorio", 0))
        segur_nome = info.get("segur_nome", "")
        uf_sigla = info.get("uf_sigla", "XX")
        cidade_nome = info.get("cidade_nome", "")
        
        # Base paths
        base = os.path.join(NAS_SERVER, "Trabalhos")
        year = datetime.now().strftime("%Y")
        
        # Formatar data no padrão AAMMDD
        try:
            d_obj = datetime.strptime(dt_acerto, "%Y-%m-%d")
            aammdd = d_obj.strftime("%y%m%d")
        except Exception:
            aammdd = datetime.now().strftime("%y%m%d")
        
        # Limpar componentes
        segurado_clean = _clean_path_component(segur_nome)
        cidade_clean = _clean_path_component(cidade_nome)
        player_clean = _clean_path_component(player_name)
        
        # Nome do diretório: AAMMDD UF CIDADE - SEGURADO
        name_part = _clean_path_component(f"{aammdd} {uf_sigla} {cidade_clean} - {segurado_clean}")
        
        # Definir caminhos baseado na flag diretorio do contratante
        if flag_dir == 1:
            # Player tem diretório próprio
            target = os.path.join(base, year, player_clean, name_part)
            photos_target = os.path.join(PHOTOS_BASE, player_clean, name_part)
        else:
            # Vai para pasta MVRX
            name_with_player = _clean_path_component(f"{name_part} {player_clean}")
            target = os.path.join(base, year, "MVRX", name_with_player)
            photos_target = os.path.join(PHOTOS_BASE, "MVRX", name_with_player)
        
        created = []
        created_display = []
        failures = []
        
        # Garantir autenticação no NAS
        _ensure_nas_connection()
        
        # Criar diretório no NAS
        try:
            os.makedirs(target, exist_ok=True)
            created.append(target)
            created_display.append(f"NAS: {name_part}")
            logger.info("NAS criado: %s", target)
        except Exception as e:
            failures.append((target, str(e)))
            logger.warning("ERRO AO CRIAR NAS: %s -> %r", target, e)
        
        # Criar diretório de fotos local
        try:
            os.makedirs(photos_target, exist_ok=True)
            created.append(photos_target)
            created_display.append(f"Fotos: {name_part}")
            logger.info("FOTOS criado: %s", photos_target)
        except Exception as e:
            failures.append((photos_target, str(e)))
            logger.warning("ERRO AO CRIAR FOTOS: %s -> %r", photos_target, e)
        
        # Retornar resultado
        if len(created) == 2:
            return ("✅ Diretórios criados com sucesso.", created_display)
        elif len(created) == 1:
            fail_path, fail_err = failures[0]
            return (f"⚠️ Falha parcial: {fail_err}", created_display)
        else:
            return (f"❌ Falha ao criar diretórios: {failures[0][1]}", [])
            
    except Exception as e:
        logger.warning("Falha ao preparar diretórios: %s", e)
        return (f"❌ Erro: {e}", [])
