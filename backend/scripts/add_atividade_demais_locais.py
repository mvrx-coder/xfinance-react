#!/usr/bin/env python3
"""
Migração: Adicionar colunas id_ativi e atividade na tabela demais_locais

Permite que cada local adicional tenha uma atividade diferente do registro principal.

Uso:
    python backend/scripts/add_atividade_demais_locais.py

Em produção (Docker):
    docker cp backend/scripts/add_atividade_demais_locais.py xfinance-api-1:/tmp/
    docker exec xfinance-api-1 python /tmp/add_atividade_demais_locais.py
"""

import os
import sqlite3
import sys

def get_db_path():
    """Determina o caminho do banco de dados."""
    # Em Docker: /app/x_db/xFinanceDB.db
    if os.path.exists("/app/x_db/xFinanceDB.db"):
        return "/app/x_db/xFinanceDB.db"
    
    # Local: via XF_BASE_DIR
    base_dir = os.getenv("XF_BASE_DIR", "")
    if base_dir:
        return os.path.join(base_dir, "x_db", "xFinanceDB.db")
    
    # Fallback: subir dois níveis do script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(script_dir, "..", "..", "..", "x_db", "xFinanceDB.db")


def column_exists(cursor, table: str, column: str) -> bool:
    """Verifica se uma coluna existe na tabela."""
    cursor.execute(f"PRAGMA table_info({table})")
    columns = [row[1] for row in cursor.fetchall()]
    return column in columns


def migrate():
    db_path = get_db_path()
    print(f"Conectando ao banco: {db_path}")
    
    if not os.path.exists(db_path):
        print(f"ERRO: Banco não encontrado: {db_path}")
        sys.exit(1)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Adicionar id_ativi
        if not column_exists(cursor, "demais_locais", "id_ativi"):
            cursor.execute("""
                ALTER TABLE demais_locais 
                ADD COLUMN id_ativi INTEGER DEFAULT NULL
            """)
            print("[CRIADO] demais_locais.id_ativi")
        else:
            print("[OK] demais_locais.id_ativi já existe")
        
        # Adicionar atividade (texto)
        if not column_exists(cursor, "demais_locais", "atividade"):
            cursor.execute("""
                ALTER TABLE demais_locais 
                ADD COLUMN atividade TEXT DEFAULT NULL
            """)
            print("[CRIADO] demais_locais.atividade")
        else:
            print("[OK] demais_locais.atividade já existe")
        
        conn.commit()
        print("\nMigração concluída!")
        
    except Exception as e:
        conn.rollback()
        print(f"ERRO: {e}")
        sys.exit(1)
    finally:
        conn.close()


if __name__ == "__main__":
    migrate()
