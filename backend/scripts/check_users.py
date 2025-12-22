import sqlite3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db

with get_db() as conn:
    cur = conn.execute(
        "SELECT email, papel, hash_senha IS NOT NULL as has_pwd FROM user WHERE papel = 'admin' LIMIT 5"
    )
    for row in cur.fetchall():
        print(tuple(row))

