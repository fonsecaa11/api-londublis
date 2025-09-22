import bcrypt
import datetime
from app.db import get_connection

# --- CONFIGURAÇÕES ---
ADMIN_EMAIL = "admin@admin"
NEW_PASSWORD = "admin"  # define aqui a nova password do admin

# --- GERAR HASH ---
hashed = bcrypt.hashpw(NEW_PASSWORD.encode("utf-8"), bcrypt.gensalt())
print(f"Novo hash gerado: {hashed}")

# --- ATUALIZAR NA BD ---
try:
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE users
        SET password_hash = %s, created_at = %s
        WHERE email = %s
    """, (hashed, datetime.datetime.utcnow(), ADMIN_EMAIL))

    conn.commit()
    cur.close()
    conn.close()
    print(f"Password do admin ({ADMIN_EMAIL}) atualizada com sucesso!")

except Exception as e:
    print(f"Erro ao atualizar password do admin: {e}")
