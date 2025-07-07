import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    return psycopg2.connect(
        host="aws-0-eu-west-2.pooler.supabase.com",
        port=6543,
        database="postgres",
        user="postgres.pwejnrzhdvnjzlopigvz",
        password="londublis1234"  # ou substitui pela real se tiveres atualizado
    )
