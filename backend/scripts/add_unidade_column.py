"""
Script de Migracao: Adicionar coluna 'unidade' nas tabelas princ e demais_locais

Execucao:
    python backend/scripts/add_unidade_column.py

IMPORTANTE: Faca backup do banco antes de executar!
"""

import os
import sys
import sqlite3
from datetime import datetime

# Adicionar path do backend para imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Determinar caminho do banco
DB_PATH = os.getenv(
    "XF_DB_PATH",
    r"E:\MVRX\Financeiro\xFinance_3.0\x_db\xFinanceDB.db"
)


def check_column_exists(conn: sqlite3.Connection, table: str, column: str) -> bool:
    """Verifica se uma coluna ja existe na tabela."""
    cursor = conn.execute(f"PRAGMA table_info({table})")
    columns = [row[1] for row in cursor.fetchall()]
    return column in columns


def run_migration():
    """Executa a migracao para adicionar coluna 'unidade'."""
    
    print("=" * 60)
    print("MIGRACAO: Adicionar coluna 'unidade'")
    print("=" * 60)
    print(f"Banco: {DB_PATH}")
    print(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    if not os.path.exists(DB_PATH):
        print(f"[ERRO] Banco de dados nao encontrado: {DB_PATH}")
        sys.exit(1)
    
    conn = sqlite3.connect(DB_PATH)
    
    try:
        # =====================================================================
        # 1. Tabela PRINC
        # =====================================================================
        print("[1/2] Verificando tabela 'princ'...")
        
        if check_column_exists(conn, "princ", "unidade"):
            print("      [AVISO] Coluna 'unidade' ja existe em 'princ'. Pulando.")
        else:
            print("      Adicionando coluna 'unidade' em 'princ'...")
            conn.execute("ALTER TABLE princ ADD COLUMN unidade TEXT DEFAULT NULL")
            conn.commit()
            print("      [OK] Coluna 'unidade' adicionada em 'princ'!")
        
        # =====================================================================
        # 2. Tabela DEMAIS_LOCAIS
        # =====================================================================
        print("[2/2] Verificando tabela 'demais_locais'...")
        
        if check_column_exists(conn, "demais_locais", "unidade"):
            print("      [AVISO] Coluna 'unidade' ja existe em 'demais_locais'. Pulando.")
        else:
            print("      Adicionando coluna 'unidade' em 'demais_locais'...")
            conn.execute("ALTER TABLE demais_locais ADD COLUMN unidade TEXT DEFAULT NULL")
            conn.commit()
            print("      [OK] Coluna 'unidade' adicionada em 'demais_locais'!")
        
        # =====================================================================
        # Verificacao final
        # =====================================================================
        print()
        print("=" * 60)
        print("VERIFICACAO FINAL")
        print("=" * 60)
        
        for table in ["princ", "demais_locais"]:
            cursor = conn.execute(f"PRAGMA table_info({table})")
            columns = [row[1] for row in cursor.fetchall()]
            has_unidade = "unidade" in columns
            status = "[OK]" if has_unidade else "[ERRO]"
            print(f"  {table}.unidade: {status}")
        
        print()
        print("Migracao concluida com sucesso!")
        
    except Exception as e:
        print(f"[ERRO] durante migracao: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    run_migration()

