"""
Script para criar/resetar usuário de teste.

Uso:
    python scripts/create_test_user.py

⚠️ APENAS PARA DESENVOLVIMENTO - NÃO USAR EM PRODUÇÃO
"""

import sys
import os

# Adicionar diretório pai ao path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import bcrypt
from database import get_db

TEST_USERS = [
    {
        "email": "admin@teste.com",
        "senha": "admin123",
        "papel": "admin",
        "nome": "Admin Teste",
        "nick": "ADM",
        "ativo": 1,
    },
    {
        "email": "backoffice@teste.com",
        "senha": "back123",
        "papel": "BackOffice",
        "nome": "BackOffice Teste",
        "nick": "BCK",
        "ativo": 1,
    },
    {
        "email": "inspetor@teste.com",
        "senha": "insp123",
        "papel": "Inspetor",
        "nome": "Inspetor Teste",
        "nick": "ISP",
        "ativo": 1,
    },
]


def hash_password(password: str) -> str:
    """Gera hash bcrypt da senha."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def create_or_update_user(user: dict) -> None:
    """Cria ou atualiza usuário no banco."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Verificar se usuário existe
        cursor.execute(
            "SELECT id_user FROM user WHERE email = ?",
            (user["email"],)
        )
        exists = cursor.fetchone()
        
        hash_senha = hash_password(user["senha"])
        
        if exists:
            cursor.execute(
                """
                UPDATE user 
                SET hash_senha = ?,
                    salt = ?,
                    papel = ?,
                    nome = ?,
                    nick = ?,
                    ativo = ?,
                    failed_attempts = 0,
                    locked_until = NULL
                WHERE email = ?
                """,
                (
                    hash_senha,
                    "bcrypt",  # salt é parte do hash no bcrypt
                    user["papel"],
                    user["nome"],
                    user["nick"],
                    user["ativo"],
                    user["email"],
                )
            )
            print(f"[OK] Atualizado: {user['email']} (senha: {user['senha']})")
        else:
            cursor.execute(
                """
                INSERT INTO user (email, hash_senha, salt, papel, nome, nick, ativo)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user["email"],
                    hash_senha,
                    "bcrypt",  # salt é parte do hash no bcrypt
                    user["papel"],
                    user["nome"],
                    user["nick"],
                    user["ativo"],
                )
            )
            print(f"[OK] Criado: {user['email']} (senha: {user['senha']})")
        
        conn.commit()


def main():
    print("=" * 50)
    print("[*] Criando usuarios de teste...")
    print("=" * 50)
    
    for user in TEST_USERS:
        try:
            create_or_update_user(user)
        except Exception as e:
            print(f"[ERR] Erro com {user['email']}: {e}")
    
    print("=" * 50)
    print("[OK] Concluido!")
    print("")
    print("Usuários disponíveis:")
    for user in TEST_USERS:
        print(f"  - Email: {user['email']}")
        print(f"    Senha: {user['senha']}")
        print(f"    Papel: {user['papel']}")
        print("")


if __name__ == "__main__":
    main()

