"""
Aplica índices faltantes no xFinance.db

Este script cria índices que melhoram a performance das queries principais.
Baseado na análise documentada em docs/system/DB_OPTIMIZATION_REPORT.md

Executar:
    python backend/scripts/apply_missing_indexes.py

⚠️ IMPORTANTE: Fazer backup do banco antes de executar!
"""

import sqlite3
import os
import sys
from datetime import datetime

# Configuração do caminho do banco
DB_PATH = os.getenv("XF_DB_PATH", os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "xFinance.db"
))

# Lista de índices a criar
# Formato: (nome_indice, tabela, coluna(s), is_unique)
INDEXES_HIGH_PRIORITY = [
    # Prioridade Alta - Impacto direto no grid
    ("idx_tempstate_id_princ", "tempstate", "state_id_princ", True),
    ("idx_demais_locais_id_princ", "demais_locais", "id_princ", False),
]

INDEXES_MEDIUM_PRIORITY = [
    # Prioridade Média - Melhoria geral
    ("idx_cidade_id_uf", "cidade", "id_uf", False),
    ("idx_user_id_papel", "user", "id_papel", False),
    ("idx_contr_ativo", "contr", "ativo", False),
]

# Índices já existentes (para referência/validação)
INDEXES_EXISTING = [
    "idx_princ_ms",
    "idx_princ_dt_inspecao",
    "idx_princ_dt_envio",
    "idx_princ_dt_pago",
    "idx_princ_prazo",
    "idx_princ_dt_acerto",
    "idx_princ_id_contr",
    "idx_princ_id_segur",
    "idx_princ_id_ativi",
    "idx_princ_id_user_guy",
    "idx_princ_id_user_guilty",
    "idx_contr_player",
    "idx_segur_nome",
    "idx_cidade_uf_nome",
    "idx_user_nick",
    "idx_ativi_atividade",
]


def get_existing_indexes(cursor) -> set:
    """Retorna conjunto de índices existentes no banco."""
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
    """)
    return {row[0] for row in cursor.fetchall()}


def create_index(cursor, idx_name: str, table: str, columns: str, unique: bool) -> bool:
    """Cria um índice se não existir."""
    unique_str = "UNIQUE " if unique else ""
    sql = f"CREATE {unique_str}INDEX IF NOT EXISTS {idx_name} ON {table} ({columns})"
    
    try:
        cursor.execute(sql)
        return True
    except sqlite3.Error as e:
        print(f"  [ERR] Erro ao criar {idx_name}: {e}")
        return False


def apply_indexes(include_medium: bool = False):
    """
    Aplica índices faltantes no banco.
    
    Args:
        include_medium: Se True, inclui índices de prioridade média
    """
    print(f"\n{'='*60}")
    print("  APLICACAO DE INDICES - xFinance.db")
    print(f"{'='*60}")
    print(f"\n[DB] Banco: {DB_PATH}")
    print(f"[DT] Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if not os.path.exists(DB_PATH):
        print(f"\n[ERRO] Banco nao encontrado em {DB_PATH}")
        print("   Configure XF_DB_PATH ou execute do diretorio correto.")
        sys.exit(1)
    
    # Conectar ao banco
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Verificar índices existentes
    existing = get_existing_indexes(cursor)
    print(f"\n[INFO] Indices existentes: {len(existing)}")
    
    # Contadores
    created = 0
    skipped = 0
    failed = 0
    
    # Aplicar índices de alta prioridade
    print(f"\n[HIGH] PRIORIDADE ALTA ({len(INDEXES_HIGH_PRIORITY)} indices):")
    print("-" * 40)
    
    for idx_name, table, columns, unique in INDEXES_HIGH_PRIORITY:
        if idx_name in existing:
            print(f"  [SKIP] {idx_name} (ja existe)")
            skipped += 1
        else:
            print(f"  [NEW]  Criando {idx_name}...", end=" ")
            if create_index(cursor, idx_name, table, columns, unique):
                print("OK")
                created += 1
            else:
                failed += 1
    
    # Aplicar índices de média prioridade (opcional)
    if include_medium:
        print(f"\n[MED]  PRIORIDADE MEDIA ({len(INDEXES_MEDIUM_PRIORITY)} indices):")
        print("-" * 40)
        
        for idx_name, table, columns, unique in INDEXES_MEDIUM_PRIORITY:
            if idx_name in existing:
                print(f"  [SKIP] {idx_name} (ja existe)")
                skipped += 1
            else:
                print(f"  [NEW]  Criando {idx_name}...", end=" ")
                if create_index(cursor, idx_name, table, columns, unique):
                    print("OK")
                    created += 1
                else:
                    failed += 1
    else:
        print(f"\n[MED]  Indices de prioridade media ignorados.")
        print("   Use --all para inclui-los.")
    
    # Commit
    conn.commit()
    
    # Executar ANALYZE
    print(f"\n[STAT] Executando ANALYZE...")
    try:
        cursor.execute("ANALYZE")
        print("  [OK] Estatisticas atualizadas")
    except sqlite3.Error as e:
        print(f"  [ERR] Erro: {e}")
    
    conn.close()
    
    # Resumo
    print(f"\n{'='*60}")
    print("  RESUMO")
    print(f"{'='*60}")
    print(f"  [OK]   Criados: {created}")
    print(f"  [SKIP] Ignorados (ja existem): {skipped}")
    print(f"  [ERR]  Falhas: {failed}")
    print(f"{'='*60}\n")
    
    if failed > 0:
        sys.exit(1)


def verify_indexes():
    """Lista todos os índices do banco."""
    print(f"\n[LIST] INDICES NO BANCO: {DB_PATH}\n")
    
    if not os.path.exists(DB_PATH):
        print(f"[ERR] Banco nao encontrado: {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT name, tbl_name, sql 
        FROM sqlite_master 
        WHERE type = 'index' AND name NOT LIKE 'sqlite_%'
        ORDER BY tbl_name, name
    """)
    
    current_table = None
    for name, table, sql in cursor.fetchall():
        if table != current_table:
            print(f"\n[TBL] {table}:")
            current_table = table
        print(f"   - {name}")
    
    conn.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Aplica índices faltantes no xFinance.db"
    )
    parser.add_argument(
        "--all", "-a",
        action="store_true",
        help="Incluir índices de prioridade média"
    )
    parser.add_argument(
        "--verify", "-v",
        action="store_true",
        help="Apenas listar índices existentes"
    )
    parser.add_argument(
        "--db",
        type=str,
        help="Caminho para o banco de dados"
    )
    
    args = parser.parse_args()
    
    if args.db:
        DB_PATH = args.db
    
    if args.verify:
        verify_indexes()
    else:
        apply_indexes(include_medium=args.all)

