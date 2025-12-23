#!/usr/bin/env python3
"""
backup_git.py - Backup do projeto xFinance 3.0 via Git + copia de workspace

Uso:
    python scripts/backup_git.py [titulo] [--dest CAMINHO] [--skip-git] [--clone DESTINO]

Exemplos:
    python scripts/backup_git.py "pre_deploy"
    python scripts/backup_git.py --dest D:/backups
    python scripts/backup_git.py --clone E:/restauracao/xFinance
    python scripts/backup_git.py --skip-git "copia_rapida"

Funcionalidades:
    - Commit automatico de todas as alteracoes
    - Push para repositorio bare de backup
    - Clone do projeto para outro local
    - Copia de workspace (excluindo .venv, node_modules, etc.)
"""

import argparse
import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path


# =============================================================================
# CONFIGURACOES
# =============================================================================

REPO_NAME = "x_finan"
DEFAULT_BACKUP_SUBDIR = "Trabalhos/2025/xx_backup_xFinance_3"

# Diretorios a excluir na copia
EXCLUDE_DIRS = {
    ".git",
    ".venv",
    "venv",
    "env",
    "node_modules",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    "build",
    "dist",
    ".vscode",
    ".idea",
    ".cursor",
    "x_db",  # banco de dados
    "Lib",   # site-packages
    ".next",
    "coverage",
}

# Arquivos a excluir
EXCLUDE_FILES = {
    "xFinanceDB.db",
    ".env",
    ".env.local",
    ".DS_Store",
    "Thumbs.db",
}

# Extensoes a excluir
EXCLUDE_EXTENSIONS = {".pyc", ".pyo", ".log", ".db", ".sqlite", ".sqlite3"}


# =============================================================================
# FUNCOES UTILITARIAS
# =============================================================================

def run(cmd: str, cwd: Path | None = None, check: bool = False) -> subprocess.CompletedProcess:
    """Executa comando shell."""
    result = subprocess.run(
        cmd, shell=True, capture_output=True, text=True,
        cwd=str(cwd) if cwd else None
    )
    if check and result.returncode != 0:
        raise RuntimeError(f"Comando falhou: {cmd}\n{result.stderr}")
    return result


def print_header(msg: str):
    """Imprime cabecalho formatado."""
    print(f"\n{'='*60}")
    print(f"  {msg}")
    print(f"{'='*60}")


def print_success(msg: str):
    print(f"[OK] {msg}")


def print_warning(msg: str):
    print(f"[!] {msg}")


def print_error(msg: str):
    print(f"[ERRO] {msg}")


def sanitize_title(s: str) -> str:
    """Limpa titulo para uso em nome de arquivo."""
    return "".join([c if c.isalnum() or c == "_" else "_" for c in s]).strip("_") or "backup"


# =============================================================================
# FUNCOES GIT
# =============================================================================

def ensure_git_available():
    """Verifica se Git esta instalado."""
    r = run("git --version")
    if r.returncode != 0:
        raise RuntimeError("Git nao esta instalado ou nao esta no PATH")


def ensure_git_initialized(repo_path: Path):
    """Inicializa repositorio Git se necessario."""
    if not (repo_path / ".git").exists():
        r = run("git init", cwd=repo_path, check=True)
        print_success("Repositorio Git inicializado")
        
        # Criar .gitignore se nao existir
        gitignore = repo_path / ".gitignore"
        if not gitignore.exists():
            contents = [
                "# Python",
                "__pycache__/",
                "*.py[cod]",
                "*$py.class",
                ".venv/",
                "venv/",
                "env/",
                "*.egg-info/",
                "dist/",
                "build/",
                "",
                "# Node",
                "node_modules/",
                ".next/",
                "coverage/",
                "",
                "# Database",
                "x_db/",
                "*.db",
                "*.sqlite",
                "*.sqlite3",
                "",
                "# IDE",
                ".vscode/",
                ".idea/",
                ".cursor/",
                "",
                "# Logs",
                "*.log",
                "logs/",
                "",
                "# Environment",
                ".env",
                ".env.local",
                ".env.*.local",
                "",
                "# OS",
                ".DS_Store",
                "Thumbs.db",
            ]
            gitignore.write_text("\n".join(contents), encoding="utf-8")
            print_success(".gitignore criado")


def ensure_safe_directory(path: Path):
    """Adiciona diretorio como safe no git config global."""
    q = run("git config --global --get-all safe.directory")
    if q.returncode == 0 and str(path) in q.stdout.splitlines():
        return
    run(f"git config --global --add safe.directory {str(path)}")


def ensure_bare_repo(base: Path, repo_name: str) -> Path:
    """Cria repositorio bare para backup."""
    bare = base / f"{repo_name}.git"
    if not bare.exists():
        base.mkdir(parents=True, exist_ok=True)
        r = run(f'git init --bare "{bare.as_posix()}"')
        if r.returncode != 0:
            # Tentar com caminho Windows
            alt = run(f"git init --bare {str(bare)}")
            if alt.returncode != 0:
                raise RuntimeError(f"git init --bare falhou: {r.stderr}\n{alt.stderr}")
        print_success(f"Repositorio bare criado: {bare}")
    return bare


def ensure_remote(repo_path: Path, remote_name: str, remote_url: str):
    """Configura remote."""
    check = run(f"git remote get-url {remote_name}", cwd=repo_path)
    if check.returncode != 0:
        add = run(f'git remote add {remote_name} "{remote_url}"', cwd=repo_path)
        if add.returncode != 0:
            raise RuntimeError(f"git remote add falhou: {add.stderr}")
        print_success(f"Remote '{remote_name}' adicionado")
    else:
        if check.stdout.strip() != remote_url:
            run(f'git remote set-url {remote_name} "{remote_url}"', cwd=repo_path)
            print_success(f"Remote '{remote_name}' atualizado")


def ensure_main_branch(repo_path: Path) -> str:
    """Garante que branch main existe e esta ativa."""
    ex = run("git rev-parse --verify main", cwd=repo_path)
    if ex.returncode == 0:
        sw = run("git checkout main", cwd=repo_path)
        if sw.returncode != 0:
            raise RuntimeError(f"Troca de branch falhou: {sw.stderr}")
        return "main"
    cr = run("git checkout -b main", cwd=repo_path)
    if cr.returncode != 0:
        raise RuntimeError(f"Criacao de branch falhou: {cr.stderr}")
    print_success("Branch 'main' criada")
    return "main"


def commit_all(repo_path: Path, message: str) -> bool:
    """Faz commit de todas as alteracoes."""
    run("git add -A", cwd=repo_path)
    st = run("git status --porcelain", cwd=repo_path)
    if st.returncode != 0:
        raise RuntimeError(f"git status falhou: {st.stderr}")
    if st.stdout.strip() == "":
        return False
    cm = run(f'git commit -m "{message}"', cwd=repo_path)
    if cm.returncode != 0:
        raise RuntimeError(f"git commit falhou: {cm.stderr}")
    return True


def has_commits(repo_path: Path) -> bool:
    """Verifica se repositorio tem commits."""
    h = run("git rev-parse --verify HEAD", cwd=repo_path)
    return h.returncode == 0


def push_branch(repo_path: Path, remote_name: str, branch: str):
    """Faz push para remote."""
    ps = run(f"git push -u {remote_name} {branch}", cwd=repo_path)
    if ps.returncode != 0:
        raise RuntimeError(f"git push falhou: {ps.stderr}")
    print_success(f"Push realizado para {remote_name}/{branch}")


def clone_repo(src: Path, dest: Path):
    """Clona repositorio."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    r = run(f'git clone "{src.as_posix()}" "{dest.as_posix()}"')
    if r.returncode != 0:
        alt = run(f"git clone {str(src)} {str(dest)}")
        if alt.returncode != 0:
            raise RuntimeError(f"git clone falhou: {r.stderr}\n{alt.stderr}")
    print_success(f"Repositorio clonado para: {dest}")


def get_last_commits(repo_path: Path, n: int = 5) -> list[str]:
    """Retorna ultimos N commits."""
    r = run(f'git log --oneline -n {n}', cwd=repo_path)
    if r.returncode == 0:
        return r.stdout.strip().split("\n")
    return []


def get_current_branch(repo_path: Path) -> str:
    """Retorna branch atual."""
    r = run("git branch --show-current", cwd=repo_path)
    if r.returncode == 0:
        return r.stdout.strip()
    return "unknown"


def get_status_summary(repo_path: Path) -> dict:
    """Retorna resumo do status do repositorio."""
    r = run("git status --porcelain", cwd=repo_path)
    if r.returncode != 0:
        return {"error": True}
    
    lines = r.stdout.strip().split("\n") if r.stdout.strip() else []
    modified = sum(1 for l in lines if l.startswith(" M") or l.startswith("M "))
    added = sum(1 for l in lines if l.startswith("A ") or l.startswith("??"))
    deleted = sum(1 for l in lines if l.startswith(" D") or l.startswith("D "))
    
    return {"modified": modified, "added": added, "deleted": deleted, "total": len(lines)}


# =============================================================================
# FUNCOES DE COPIA
# =============================================================================

def sync_workspace(src: Path, dest: Path):
    """Sincroniza workspace excluindo arquivos desnecessarios."""
    file_count = 0
    
    for root, dirs, files in os.walk(src):
        rel = Path(root).relative_to(src)
        
        # Filtrar diretorios (modifica in-place)
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".venv")]
        
        for f in files:
            # Pular arquivos excluidos
            if f in EXCLUDE_FILES:
                continue
            # Pular por extensao
            if any(f.endswith(ext) for ext in EXCLUDE_EXTENSIONS):
                continue
            
            src_file = Path(root) / f
            dest_file = dest / rel / f
            dest_file.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src_file, dest_file)
            file_count += 1
    
    # Limpar pastas que possam ter sido clonadas erroneamente
    for cleanup_dir in [".venv", "venv", "node_modules", "__pycache__", "Lib"]:
        cleanup_path = dest / cleanup_dir
        if cleanup_path.exists():
            shutil.rmtree(cleanup_path, ignore_errors=True)
    
    return file_count


# =============================================================================
# FUNCOES DE DESTINO
# =============================================================================

def build_destination_base(cli_dest: str | None) -> Path:
    """Determina diretorio base do backup."""
    # 1) Destino por argumento
    if cli_dest:
        return Path(cli_dest)
    
    # 2) Destino por variavel de ambiente
    env_dest = os.getenv("XF_BACKUP_DIR")
    if env_dest:
        return Path(env_dest)
    
    # 3) Destino padrao Z: se existir
    z_default = Path(f"Z:/{DEFAULT_BACKUP_SUBDIR}")
    try:
        if z_default.parent.exists():
            return z_default
    except Exception:
        pass
    
    # 4) Interativo: perguntar a letra da unidade ou caminho completo
    if sys.stdin.isatty():
        try:
            answer = input(
                "Informe a letra da unidade (ex.: D) ou um caminho completo para o destino: "
            ).strip()
            if answer:
                drv = answer.rstrip(":/")
                if len(drv) == 1 and drv.isalpha():
                    base = Path(f"{drv}:/{DEFAULT_BACKUP_SUBDIR}")
                else:
                    base = Path(answer)
                base.mkdir(parents=True, exist_ok=True)
                return base
        except Exception:
            pass
    
    # 5) Fallback: pasta de backups no usuario
    home_base = Path.home() / "xfinance_backups"
    home_base.mkdir(parents=True, exist_ok=True)
    return home_base


def get_repo_path() -> Path:
    """Obtem o caminho do diretorio do projeto."""
    # Tentar encontrar pelo arquivo atual
    script_path = Path(__file__).resolve()
    
    # Se estamos em scripts/, subir um nivel
    if script_path.parent.name == "scripts":
        return script_path.parent.parent
    
    # Tentar encontrar package.json ou pyproject.toml
    current = Path.cwd()
    for marker in ["package.json", "pyproject.toml", "backend", "client"]:
        if (current / marker).exists():
            return current
    
    # Fallback: diretorio atual
    return current


# =============================================================================
# COMANDOS PRINCIPAIS
# =============================================================================

def cmd_backup(args):
    """Comando principal de backup."""
    repo_path = get_repo_path()
    skip_git = args.skip_git
    
    print_header("xFinance 3.0 - Backup")
    print(f"Origem: {repo_path}")
    
    # Git setup
    if not skip_git:
        try:
            ensure_git_available()
            ensure_git_initialized(repo_path)
        except Exception as e:
            print_warning(f"Git nao disponivel ({e}). Continuando sem Git...")
            skip_git = True
    
    # Titulo do backup
    if args.title:
        title = sanitize_title(args.title)
    else:
        if sys.stdin.isatty():
            try:
                title = sanitize_title(input("Digite o titulo do backup: ").strip())
            except Exception:
                title = "backup"
        else:
            title = "backup"
    
    # Construir nome do backup
    ts = datetime.now().strftime("%y%m%d_%H%M")
    name = f"{ts}_{REPO_NAME}_{title}"
    base = build_destination_base(args.dest)
    
    # Git operations
    bare = None
    if not skip_git:
        try:
            bare = ensure_bare_repo(base, REPO_NAME)
            ensure_safe_directory(bare)
            ensure_remote(repo_path, "backup", bare.as_posix())
            branch = ensure_main_branch(repo_path)
            
            if commit_all(repo_path, f"Backup: {title}"):
                print_success("Commit realizado")
            else:
                print_warning("Nenhuma alteracao para commit")
            
            if has_commits(repo_path):
                push_branch(repo_path, "backup", branch)
        except Exception as e:
            print_warning(f"Erro no Git: {e}")
    
    # Copia do workspace
    dest = base / name
    try:
        start_time = datetime.now()
        print(f"\nCopiando para: {dest}")
        
        if skip_git:
            file_count = sync_workspace(repo_path, dest)
        else:
            clone_repo(repo_path, dest)
            git_dir = dest / ".git"
            if git_dir.exists():
                shutil.rmtree(git_dir, ignore_errors=True)
            file_count = sync_workspace(repo_path, dest)
        
        elapsed = (datetime.now() - start_time).total_seconds()
        
        print_header("BACKUP CRIADO COM SUCESSO!")
        print(f"Destino: {dest}")
        print(f"Arquivos: {file_count}")
        print(f"Tempo: {elapsed:.1f} segundos")
        if bare:
            print(f"Remoto bare: {bare}")
        print("=" * 60)
        
    except Exception as e:
        print_error(f"Falha no backup: {e}")
        sys.exit(1)


def cmd_clone(args):
    """Comando para clonar o projeto."""
    repo_path = get_repo_path()
    dest = Path(args.clone_dest)
    
    print_header("xFinance 3.0 - Clone")
    print(f"Origem: {repo_path}")
    print(f"Destino: {dest}")
    
    if dest.exists():
        if sys.stdin.isatty():
            confirm = input(f"Destino ja existe. Sobrescrever? [s/N]: ").strip().lower()
            if confirm != "s":
                print("Operacao cancelada.")
                return
        shutil.rmtree(dest, ignore_errors=True)
    
    try:
        ensure_git_available()
        clone_repo(repo_path, dest)
        print_success("Clone concluido!")
    except Exception as e:
        print_error(f"Falha no clone: {e}")
        sys.exit(1)


def cmd_status(args):
    """Comando para mostrar status do repositorio."""
    repo_path = get_repo_path()
    
    print_header("xFinance 3.0 - Status")
    print(f"Repositorio: {repo_path}")
    
    try:
        ensure_git_available()
        
        branch = get_current_branch(repo_path)
        print(f"Branch: {branch}")
        
        status = get_status_summary(repo_path)
        if "error" not in status:
            print(f"Modificados: {status['modified']}")
            print(f"Adicionados: {status['added']}")
            print(f"Removidos: {status['deleted']}")
            print(f"Total pendente: {status['total']}")
        
        print("\nUltimos commits:")
        for commit in get_last_commits(repo_path, 5):
            print(f"  {commit}")
        
        # Verificar remotes
        r = run("git remote -v", cwd=repo_path)
        if r.returncode == 0 and r.stdout.strip():
            print("\nRemotes:")
            for line in r.stdout.strip().split("\n"):
                print(f"  {line}")
        
    except Exception as e:
        print_error(f"Falha ao obter status: {e}")


def cmd_commit(args):
    """Comando para fazer commit rapido."""
    repo_path = get_repo_path()
    
    message = args.message or "Commit automatico"
    
    print_header("xFinance 3.0 - Commit")
    print(f"Repositorio: {repo_path}")
    print(f"Mensagem: {message}")
    
    try:
        ensure_git_available()
        ensure_git_initialized(repo_path)
        
        if commit_all(repo_path, message):
            print_success("Commit realizado!")
            
            # Mostrar commit
            commits = get_last_commits(repo_path, 1)
            if commits:
                print(f"  {commits[0]}")
        else:
            print_warning("Nenhuma alteracao para commit")
            
    except Exception as e:
        print_error(f"Falha no commit: {e}")
        sys.exit(1)


def cmd_push(args):
    """Comando para fazer push para backup."""
    repo_path = get_repo_path()
    base = build_destination_base(args.dest)
    
    print_header("xFinance 3.0 - Push")
    print(f"Repositorio: {repo_path}")
    
    try:
        ensure_git_available()
        
        bare = ensure_bare_repo(base, REPO_NAME)
        ensure_safe_directory(bare)
        ensure_remote(repo_path, "backup", bare.as_posix())
        
        branch = get_current_branch(repo_path)
        if not has_commits(repo_path):
            print_warning("Repositorio sem commits")
            return
        
        push_branch(repo_path, "backup", branch)
        print_success("Push concluido!")
        
    except Exception as e:
        print_error(f"Falha no push: {e}")
        sys.exit(1)


# =============================================================================
# MAIN
# =============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Backup do projeto xFinance 3.0 via Git + copia de workspace",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python backup_git.py "pre_deploy"           # Backup com titulo
  python backup_git.py --dest D:/backups      # Backup para destino especifico
  python backup_git.py --clone E:/restore     # Clonar projeto
  python backup_git.py --status               # Ver status do repo
  python backup_git.py --commit -m "fix bug"  # Commit rapido
  python backup_git.py --push                 # Push para backup
        """
    )
    
    # Argumentos principais
    parser.add_argument("title", nargs="?", help="Titulo do backup")
    parser.add_argument("--dest", help="Diretorio destino do backup")
    parser.add_argument("--skip-git", action="store_true", help="Pular operacoes Git")
    
    # Comandos alternativos
    parser.add_argument("--clone", dest="clone_dest", metavar="DESTINO",
                        help="Clonar projeto para destino")
    parser.add_argument("--status", action="store_true", help="Mostrar status do repositorio")
    parser.add_argument("--commit", action="store_true", help="Fazer commit rapido")
    parser.add_argument("-m", "--message", help="Mensagem do commit (com --commit)")
    parser.add_argument("--push", action="store_true", help="Push para backup remote")
    
    args = parser.parse_args()
    
    # Executar comando apropriado
    if args.clone_dest:
        cmd_clone(args)
    elif args.status:
        cmd_status(args)
    elif args.commit:
        cmd_commit(args)
    elif args.push:
        cmd_push(args)
    else:
        cmd_backup(args)


if __name__ == "__main__":
    main()


