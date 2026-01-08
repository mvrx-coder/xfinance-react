#!/usr/bin/env python3
"""
Migracao unica: Adicionar coluna 'unidade' no banco de producao.
Executar dentro do container: docker exec xfinance-api-1 python /app/scripts/migrate_unidade_prod.py
"""
import sqlite3
import os

DB_PATH = os.getenv("XF_DB_PATH", "/app/x_db/xFinanceDB.db")

def check_column_exists(conn, table, column):
    cursor = conn.execute(f"PRAGMA table_info({table})")
    columns = [row[1] for row in cursor.fetchall()]
    return column in columns

def main():
    print(f"Conectando ao banco: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    
    # princ.unidade
    if check_column_exists(conn, "princ", "unidade"):
        print("[OK] princ.unidade ja existe")
    else:
        conn.execute("ALTER TABLE princ ADD COLUMN unidade TEXT DEFAULT NULL")
        conn.commit()
        print("[CRIADO] princ.unidade")
    
    # demais_locais.unidade
    if check_column_exists(conn, "demais_locais", "unidade"):
        print("[OK] demais_locais.unidade ja existe")
    else:
        conn.execute("ALTER TABLE demais_locais ADD COLUMN unidade TEXT DEFAULT NULL")
        conn.commit()
        print("[CRIADO] demais_locais.unidade")
    
    conn.close()
    print("Migracao concluida!")

if __name__ == "__main__":
    main()




