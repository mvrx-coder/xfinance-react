"""
Serviço de criação de diretórios - xFinance

Cria diretórios no NAS e pasta de fotos após inserção de nova inspeção.
Suporta tanto ambiente Windows (caminhos UNC) quanto Linux/Docker (volumes montados).
"""

import logging
import os
import platform
import socket
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from datetime import datetime
from typing import Tuple, List

from services.queries.new_inspection import get_directory_info

logger = logging.getLogger(__name__)

# Timeout para operações de rede (segundos)
NETWORK_TIMEOUT = 5

# Detectar ambiente de execução
IS_LINUX = platform.system() == "Linux"

# =============================================================================
# CONFIGURAÇÃO - CAMINHOS
# =============================================================================

# Caminhos montados (Linux/Docker) - definidos via variáveis de ambiente
# Se estiver no Linux E as variáveis estiverem definidas, usa os mounts
NAS_MOUNT = os.getenv("XF_NAS_MOUNT", "")  # Ex: /mnt/trabalhos
PHOTOS_MOUNT = os.getenv("XF_PHOTOS_MOUNT", "")  # Ex: /mnt/fotos

# Caminhos UNC Windows (fallback se não estiver em Linux ou mounts não configurados)
NAS_SERVER_UNC = os.getenv("XF_NAS_SERVER", r"\\192.168.1.35\mvrx_nas")
PHOTOS_SERVER_UNC = os.getenv("XF_PHOTOS_SERVER", r"\\MVRDESKTOP\Dados$")
PHOTOS_SHARE = os.getenv("XF_PHOTOS_SHARE", "Fotos")

# Credenciais (usadas apenas no Windows)
NAS_USER = os.getenv("XF_NAS_USER", "xfinance_svc")
NAS_PASS = os.getenv("XF_NAS_PASS", "Aa25101208*")

# Determinar qual modo usar
USE_LINUX_MOUNTS = IS_LINUX and NAS_MOUNT and PHOTOS_MOUNT

if USE_LINUX_MOUNTS:
    logger.info("Modo Linux: usando volumes montados em %s e %s", NAS_MOUNT, PHOTOS_MOUNT)
else:
    logger.info("Modo Windows: usando caminhos UNC")


# =============================================================================
# VERIFICAÇÃO DE CONECTIVIDADE
# =============================================================================

def _is_mount_available(mount_path: str) -> bool:
    """
    Verifica se um ponto de montagem está disponível (Linux).
    
    Args:
        mount_path: Caminho do mount (ex: /mnt/trabalhos)
    
    Returns:
        bool: True se montado e acessível, False caso contrário
    """
    if not mount_path:
        return False
    
    try:
        # Verifica se o diretório existe e é acessível
        if os.path.isdir(mount_path) and os.access(mount_path, os.W_OK):
            logger.debug("Mount disponível: %s", mount_path)
            return True
        else:
            logger.warning("Mount não disponível ou sem permissão: %s", mount_path)
            return False
    except Exception as e:
        logger.warning("Erro ao verificar mount %s: %s", mount_path, e)
        return False


def _is_server_reachable(server_path: str) -> bool:
    """
    Verifica se um servidor de rede está acessível via socket (Windows).
    
    Args:
        server_path: Caminho UNC (ex: \\\\192.168.1.35\\share)
    
    Returns:
        bool: True se acessível, False caso contrário
    """
    # Extrair IP/hostname do path UNC (pega apenas a primeira parte após \\)
    parts = server_path.replace("\\", "/").strip("/").split("/")
    server = parts[0] if parts else ""
    
    if not server:
        return False
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(NETWORK_TIMEOUT)
        result = sock.connect_ex((server, 445))
        sock.close()
        
        if result == 0:
            logger.debug("Servidor acessível: %s", server)
            return True
        else:
            logger.warning("Servidor inacessível (porta 445): %s", server)
            return False
            
    except socket.timeout:
        logger.warning("Servidor timeout: %s", server)
        return False
    except socket.gaierror:
        logger.warning("Servidor nome não resolvido: %s", server)
        return False
    except Exception as e:
        logger.warning("Servidor erro de verificação: %s -> %s", server, e)
        return False


def _is_nas_reachable() -> bool:
    """Verifica se o NAS de Trabalhos está acessível."""
    if USE_LINUX_MOUNTS:
        return _is_mount_available(NAS_MOUNT)
    return _is_server_reachable(NAS_SERVER_UNC)


def _is_photos_server_reachable() -> bool:
    """Verifica se o servidor de Fotos está acessível."""
    if USE_LINUX_MOUNTS:
        return _is_mount_available(PHOTOS_MOUNT)
    return _is_server_reachable(PHOTOS_SERVER_UNC)


def _create_directory_with_timeout(path: str, timeout: int = 10) -> bool:
    """
    Cria diretório com timeout usando thread.
    
    Args:
        path: Caminho do diretório
        timeout: Timeout em segundos
        
    Returns:
        bool: True se criado, False se falhou
    """
    def _make_dirs():
        os.makedirs(path, exist_ok=True)
        return True
    
    try:
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(_make_dirs)
            return future.result(timeout=timeout)
    except FuturesTimeoutError:
        logger.warning("Timeout ao criar diretório: %s", path)
        return False
    except Exception as e:
        logger.warning("Erro ao criar diretório: %s -> %s", path, e)
        return False


# =============================================================================
# AUTENTICAÇÃO SERVIDORES DE REDE (Windows only)
# =============================================================================

# Cache de autenticação (evita re-autenticação na mesma sessão)
_nas_authenticated = False
_photos_authenticated = False


def _ensure_nas_connection() -> bool:
    """
    Garante conexão autenticada com o NAS (Windows only).
    No Linux com volumes montados, retorna True diretamente.
    """
    global _nas_authenticated

    # No Linux com mounts, não precisa autenticar
    if USE_LINUX_MOUNTS:
        return True

    # Se já autenticou nesta sessão, não refaz
    if _nas_authenticated:
        return True

    # Se não há credenciais configuradas, tenta sem autenticação
    if not NAS_USER or not NAS_PASS:
        logger.info("NAS: Sem credenciais configuradas, tentando acesso direto")
        return True

    try:
        import subprocess
        # Primeiro, desconecta conexão anterior se existir
        subprocess.run(
            ["net", "use", NAS_SERVER_UNC, "/delete", "/y"],
            capture_output=True,
            timeout=10,
        )
    except Exception:
        pass

    try:
        import subprocess
        result = subprocess.run(
            ["net", "use", NAS_SERVER_UNC, f"/user:{NAS_USER}", NAS_PASS, "/persistent:no"],
            capture_output=True,
            text=True,
            timeout=30,
        )

        if result.returncode == 0:
            _nas_authenticated = True
            logger.info("NAS: Autenticação bem-sucedida para %s", NAS_SERVER_UNC)
            return True
        else:
            logger.warning("NAS: Falha na autenticação - %s", result.stderr or result.stdout)
            return False

    except Exception as e:
        logger.warning("NAS: Erro ao autenticar - %s", e)
        return False


def _ensure_photos_connection() -> bool:
    """
    Garante conexão autenticada com o servidor de Fotos (Windows only).
    No Linux com volumes montados, retorna True diretamente.
    """
    global _photos_authenticated

    # No Linux com mounts, não precisa autenticar
    if USE_LINUX_MOUNTS:
        return True

    # Se já autenticou nesta sessão, não refaz
    if _photos_authenticated:
        return True

    # Sem credenciais configuradas = acesso direto
    logger.info("FOTOS: Tentando acesso direto (sem credenciais)")
    _photos_authenticated = True
    return True


# =============================================================================
# CRIAÇÃO DE DIRETÓRIOS
# =============================================================================

def _clean_path_component(s: str) -> str:
    """
    Remove caracteres inválidos para nomes de diretório.
    
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
    Cria diretórios no NAS (Trabalhos) e no servidor de Fotos.
    
    Detecta automaticamente o ambiente:
    - Linux/Docker: usa volumes montados (/mnt/trabalhos, /mnt/fotos)
    - Windows: usa caminhos UNC (\\\\server\\share)
    
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
        
        # Determinar caminhos base conforme ambiente
        if USE_LINUX_MOUNTS:
            # Linux/Docker: volumes montados
            # /mnt/trabalhos já aponta para o share Trabalhos do NAS
            base_trabalhos = NAS_MOUNT
            base_fotos = PHOTOS_MOUNT
            logger.debug("Usando mounts Linux: %s, %s", base_trabalhos, base_fotos)
        else:
            # Windows: caminhos UNC
            base_trabalhos = os.path.join(NAS_SERVER_UNC, "Trabalhos")
            base_fotos = os.path.join(PHOTOS_SERVER_UNC, PHOTOS_SHARE)
            logger.debug("Usando caminhos UNC: %s, %s", base_trabalhos, base_fotos)
        
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
            target_trabalhos = os.path.join(base_trabalhos, year, player_clean, name_part)
            target_fotos = os.path.join(base_fotos, player_clean, name_part)
        else:
            # Vai para pasta MVRX
            name_with_player = _clean_path_component(f"{name_part} {player_clean}")
            target_trabalhos = os.path.join(base_trabalhos, year, "MVRX", name_with_player)
            target_fotos = os.path.join(base_fotos, "MVRX", name_with_player)
        
        created = []
        created_display = []
        failures = []
        
        # =========================================
        # 1. Criar diretório no NAS de Trabalhos
        # =========================================
        nas_reachable = _is_nas_reachable()
        
        if nas_reachable:
            # Garantir autenticação no NAS
            _ensure_nas_connection()
            
            # Criar diretório no NAS com timeout
            if _create_directory_with_timeout(target_trabalhos, timeout=15):
                created.append(target_trabalhos)
                created_display.append(f"NAS: {name_part}")
                logger.info("NAS criado: %s", target_trabalhos)
            else:
                failures.append((target_trabalhos, "Timeout ou erro ao criar"))
                logger.warning("ERRO AO CRIAR NAS: %s", target_trabalhos)
        else:
            # NAS inacessível - pular sem esperar
            failures.append((target_trabalhos, "NAS inacessível"))
            logger.warning("NAS INACESSÍVEL - Pulando criação de diretório")
        
        # =========================================
        # 2. Criar diretório no servidor de Fotos
        # =========================================
        photos_reachable = _is_photos_server_reachable()
        
        if photos_reachable:
            # Garantir autenticação no servidor de fotos
            _ensure_photos_connection()
            
            # Criar diretório de fotos com timeout
            if _create_directory_with_timeout(target_fotos, timeout=15):
                created.append(target_fotos)
                created_display.append(f"Fotos: {name_part}")
                logger.info("FOTOS criado: %s", target_fotos)
            else:
                failures.append((target_fotos, "Timeout ou erro ao criar"))
                logger.warning("ERRO AO CRIAR FOTOS: %s", target_fotos)
        else:
            # Servidor de fotos inacessível - pular sem esperar
            failures.append((target_fotos, "Servidor de fotos inacessível"))
            logger.warning("FOTOS: Mount/servidor inacessível - pulando")
        
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
