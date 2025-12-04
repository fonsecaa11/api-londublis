from fastapi import APIRouter
from app.db import get_connection
from fastapi.responses import JSONResponse
from decimal import Decimal
from psycopg2.extras import RealDictCursor
import traceback

router = APIRouter(prefix="/api")

def convert_decimals(obj):
    """Converte recursivamente Decimals em float para poder serializar JSON."""
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    else:
        return obj

@router.get("/freguesia/densidade/{nome_freguesia}")
def densidade_populacional(nome_freguesia: str):
    """
    Retorna a densidade populacional por género (H, M, HM)
    para os anos 2011 e 2021.
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                SELECT 
                    dim_3_t AS genero,
                    MAX(CASE WHEN ano = 2011 THEN valor END) AS valor_2011,
                    MAX(CASE WHEN ano = 2021 THEN valor END) AS valor_2021,
                    MAX(CASE WHEN ano = 2011 THEN percentagem END) AS pct_2011,
                    MAX(CASE WHEN ano = 2021 THEN percentagem END) AS pct_2021,
                    MAX(CASE WHEN ano = 2021 THEN valor END) 
                        - MAX(CASE WHEN ano = 2011 THEN valor END) AS diferenca_valor,
                    CASE 
                        WHEN MAX(CASE WHEN ano = 2011 THEN valor END) > 0
                        THEN (
                            (MAX(CASE WHEN ano = 2021 THEN valor END) 
                              - MAX(CASE WHEN ano = 2011 THEN valor END))
                            / MAX(CASE WHEN ano = 2011 THEN valor END)
                        ) * 100
                        ELSE NULL
                    END AS crescimento_percentual
                FROM densidade_populacional_no_km2
                WHERE localizacao = %s
                GROUP BY dim_3_t
                ORDER BY
                        CASE 
                        WHEN dim_3_t = 'H' THEN 1
                        WHEN dim_3_t = 'M' THEN 2
                        WHEN dim_3_t = 'HM' THEN 3
                        ELSE 4
                    END;;
            """, (nome_freguesia,))

            dados = cur.fetchall()
            dados = convert_decimals(dados)

            return JSONResponse(content={"densidade_populacional": dados})

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

@router.get("/freguesia/piramide/{nome_freguesia}")
def piramide_etaria(nome_freguesia: str):
    """
    Retorna a população por faixa etária e género para uma freguesia.
    Homens serão negativos para visualização da pirâmide etária.
    Inclui total H, M e HM no início.
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                SELECT
                    dim_4_t AS faixa_etaria,
                    SUM(CASE WHEN dim_3_t = 'H' THEN valor ELSE 0 END) AS homens,
                    SUM(CASE WHEN dim_3_t = 'M' THEN valor ELSE 0 END) AS mulheres,
                    SUM(CASE WHEN dim_3_t IN ('H', 'M') THEN valor ELSE 0 END) AS total
                FROM
                    populacao_residente_sexo_grupo_etario
                WHERE
                    localizacao = %s
                    AND ano = '2021'
                    AND dim_4_t <> 'Total'
                GROUP BY
                    dim_4_t
                ORDER BY
                    CASE 
                        WHEN dim_4_t = '100 ou mais anos' THEN 1
                        WHEN dim_4_t = '90 - 99 anos' THEN 2
                        WHEN dim_4_t = '80 - 89 anos' THEN 3
                        WHEN dim_4_t = '70 - 79 anos' THEN 4
                        WHEN dim_4_t = '60 - 69 anos' THEN 5
                        WHEN dim_4_t = '50 - 59 anos' THEN 6
                        WHEN dim_4_t = '40 - 49 anos' THEN 7
                        WHEN dim_4_t = '30 - 39 anos' THEN 8
                        WHEN dim_4_t = '20 - 29 anos' THEN 9
                        WHEN dim_4_t = '10 - 19 anos' THEN 10
                        WHEN dim_4_t = '0 - 9 anos' THEN 11
                        ELSE 12
                    END;
            """, (nome_freguesia,))

            dados = cur.fetchall()
            
            for d in dados:
                d['homens'] = -float(d['homens'])
                d['mulheres'] = float(d['mulheres'])

            # Calcular totais H, M e HM
            total_homens = -sum(d['homens'] for d in dados)
            total_mulheres = sum(d['mulheres'] for d in dados)
            total_hm = total_homens + total_mulheres

            return JSONResponse(content={
                "piramide_etaria": dados,
                "totais": {
                    "homens": total_homens,
                    "mulheres": total_mulheres,
                    "hm": total_hm
                }
            })


            return JSONResponse(content={"piramide_etaria": dados})

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

@router.get("/freguesia/variacao_populacional/{nome_freguesia}")
def variacao_populacional(nome_freguesia: str):
    """
    Retorna a variação percentual da população por grupo etário e sexo
    para uma freguesia específica.
    """
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            cur.execute("""
                SELECT
                    dim_4_t AS grupo_etario,
                    dim_3_t AS sexo,
                    valor AS variacao
                FROM
                    taxa_variacao_populacional
                WHERE
                    localizacao = %s
                    AND ano = '2021'
                    AND dim_4_t <> 'Total'
                    AND dim_3_t <> 'HM'
                ORDER BY
                    grupo_etario,
                    sexo;
            """, (nome_freguesia,))

            dados = cur.fetchall()
            dados = convert_decimals(dados)

            # Transformar para formato mais fácil para o frontend (opcional)
            resultado = {}
            for d in dados:
                grupo = d['grupo_etario']
                sexo = d['sexo']
                if grupo not in resultado:
                    resultado[grupo] = {}
                resultado[grupo][sexo] = d['variacao']

            return JSONResponse(content={"variacao_populacional": resultado})

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

