from fastapi import APIRouter, HTTPException
from app.db import get_connection
from fastapi.responses import JSONResponse
from psycopg2.extras import RealDictCursor
import traceback

router = APIRouter(prefix="/api")

# ------------------------------
# 1. Obter todos os distritos
# ------------------------------
@router.get("/distritos")
def obter_distritos():
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id_distrito, descr_distrito 
                FROM distrito
                ORDER BY descr_distrito;
            """)
            return cur.fetchall()
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

# ------------------------------
# 2. Obter todos os concelhos de um distrito
# ------------------------------
@router.get("/concelhos/{id_distrito}")
def obter_concelhos(id_distrito: str):
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id_concelho, descr_concelho
                FROM concelho
                WHERE distrito_id = %s
                ORDER BY descr_concelho;
            """, (id_distrito,))
            return cur.fetchall()
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

# ------------------------------
# 3. Obter todas as freguesias de um concelho
# ------------------------------
@router.get("/freguesias/{id_concelho}")
def obter_freguesias(id_concelho: str):
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT id_freguesia, descr_freguesia
                FROM freguesia
                WHERE concelho_id = %s
                ORDER BY descr_freguesia;
            """, (id_concelho,))
            return cur.fetchall()
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})









# from fastapi import APIRouter, HTTPException
# from app.db import get_connection
# from app.models.schemas import ResultadoFreguesia
# from fastapi.responses import JSONResponse
# import traceback
# from psycopg2.extras import RealDictCursor
# 
# 
# router = APIRouter(prefix="/api")
# 
# @router.get("/freguesia")
# def obter_freguesia(lat: float, lon: float):
#     try:
#         conn = get_connection()
#         with conn.cursor(cursor_factory=RealDictCursor) as cur:
#             cur.execute("""
#                 SELECT con_name
#                 FROM area_freguesias
#                 WHERE ST_Contains(
#                     geom,
#                     ST_SetSRID(ST_Point(%s, %s), 4326)
#                 )
#                 LIMIT 1;
#             """, (lon, lat)), 
#             
#             freguesia = cur.fetchone()
#             
# 
#             nome_concelho = freguesia["con_name"]
# 
#             cur.execute("""
#                 SELECT c.descr_concelho, 
#                        i.*,
#                        te.numero_total,
#                        te.numero_nao_transicao,
#                        ROUND(te.taxa_nao_transicao, 2) AS taxa_nao_transicao,
#                        te.numero_transicao,
#                        ROUND(te.taxa_transicao, 2) AS taxa_transicao,
#                         ie.*
#                 FROM indicadoresconcelho i
#                 JOIN concelho c ON i.concelho_id = c.id_concelho
#                 LEFT JOIN transicoes_ensino te ON te.concelho_id = i.concelho_id
#                 left join indicadoresempresas ie on ie.concelho_id = i.concelho_id
#                 WHERE c.descr_concelho = %s;
#             """, (nome_concelho,))
# 
#             indicadores = cur.fetchone()
#             if not indicadores:
#                 return JSONResponse(status_code=404, content={"detail": "Indicadores não encontrados"})
#             
#             return indicadores
# 
#     except Exception as e:
#         traceback.print_exc()  # Aparece no terminal/log
#         return JSONResponse(status_code=500, content={"detail": str(e)})