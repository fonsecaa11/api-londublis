import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    return psycopg2.connect(
        host="db.pwejnrzhdvnjzlopigvz.supabase.co",
        database="postgres",
        user="postgres",
        password="londublis1234"
    )
