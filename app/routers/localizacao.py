from fastapi import APIRouter, HTTPException
from app.db import get_connection
from app.models.schemas import ResultadoFreguesia
from fastapi.responses import JSONResponse
import traceback
from psycopg2.extras import RealDictCursor


router = APIRouter(prefix="/api")

@router.get("/freguesia")
def obter_freguesia(lat: float, lon: float):
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT con_name
                FROM area_freguesias
                WHERE ST_Contains(
                    geom,
                    ST_SetSRID(ST_Point(%s, %s), 4326)
                )
                LIMIT 1;
            """, (lon, lat)), 
            
            freguesia = cur.fetchone()
            

            nome_concelho = freguesia["con_name"]

            cur.execute("""
                SELECT c.descr_concelho, 
                       i.taxa_envelhecimento, 
                       i.taxa_analfabetismo,
                       i.taxa_ensino_superior, 
                       i.taxa_desemprego, 
                       i.taxa_criminalidade,
                       i.taxa_mortalidade, 
                       i.valor_renda_absoluto, 
                       i.valor_renda_percentual,
                       i.enfermeiros_por_1000,
                       te.numero_total,
                       te.numero_nao_transicao,
                       ROUND(te.taxa_nao_transicao, 2) AS taxa_nao_transicao,
                       te.numero_transicao,
                       ROUND(te.taxa_transicao, 2) AS taxa_transicao
                FROM indicadoresconcelho i
                JOIN concelho c ON i.concelho_id = c.id_concelho
                LEFT JOIN transicoes_ensino te ON te.concelho_id = i.concelho_id
                WHERE c.descr_concelho = %s;
            """, (nome_concelho,))

            indicadores = cur.fetchone()
            if not indicadores:
                return JSONResponse(status_code=404, content={"detail": "Indicadores não encontrados"})
            
            return indicadores

    except Exception as e:
        traceback.print_exc()  # Aparece no terminal/log
        return JSONResponse(status_code=500, content={"detail": str(e)})