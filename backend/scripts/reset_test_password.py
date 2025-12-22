"""
Script para resetar senha de um usuário existente para testes.

Uso:
    python scripts/reset_test_password.py AGR@teste.com admin123
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import bcrypt
from database import get_db


def hash_password(password: str) -> str:
    """Gera hash bcrypt da senha."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def reset_password(email: str, new_password: str) -> bool:
    """Reseta senha de um usuario."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verificar se usuario existe
        cursor.execute(
            "SELECT id_user, papel, nick FROM user WHERE email = ?",
            (email,)
        )
        row = cursor.fetchone()
        
        if not row:
            print(f"[ERR] Usuario nao encontrado: {email}")
            return False
        
        id_user, papel, nick = row
        hash_senha = hash_password(new_password)
        
        cursor.execute(
            """
            UPDATE user 
            SET hash_senha = ?,
                salt = ?,
                failed_attempts = 0,
                locked_until = NULL
            WHERE email = ?
            """,
            (hash_senha, "bcrypt", email)
        )
        conn.commit()
        
        print(f"[OK] Senha resetada para: {email}")
        print(f"     Papel: {papel}")
        print(f"     Nova senha: {new_password}")
        return True


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python reset_test_password.py EMAIL NOVA_SENHA")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    
    reset_password(email, password)

