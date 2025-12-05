from fastapi import APIRouter, HTTPException
from app.db import get_connection
from app.models.schemas import ResultadoFreguesia  # Define um esquema adequado para a resposta
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
            # Consulta para obter todos os distritos
            cur.execute("SELECT distrito FROM cont_distritos ORDER BY distrito ASC")
            distritos = cur.fetchall()

            if not distritos:
                return JSONResponse(status_code=404, content={"detail": "Nenhum distrito encontrado"})

            return JSONResponse(content=distritos)

    except Exception as e:
        traceback.print_exc()  # Exibe o erro no log
        return JSONResponse(status_code=500, content={"detail": str(e)})

# ------------------------------
# 2. Obter todos os municípios de um distrito
# ------------------------------
@router.get("/municipios")
def obter_municipios(distrito: str):
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Consulta para obter todos os municípios de um distrito específico
            cur.execute("""
                SELECT municipio 
                FROM cont_municipios
                WHERE distrito_ilha = %s
                ORDER BY municipio ASC
            """, (distrito,))

            municipios = cur.fetchall()

            if not municipios:
                return JSONResponse(status_code=404, content={"detail": "Nenhum município encontrado para o distrito"})

            return JSONResponse(content=municipios)

    except Exception as e:
        traceback.print_exc()  # Exibe o erro no log
        return JSONResponse(status_code=500, content={"detail": str(e)})

# ------------------------------
# 3. Obter todas as freguesias de um município
# ------------------------------
@router.get("/freguesias")
def obter_freguesias(municipio: str):
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Consulta para obter todas as freguesias de um município específico
            cur.execute("""
                SELECT freguesia 
                FROM cont_freguesias
                WHERE municipio = %s
                ORDER BY freguesia ASC
            """, (municipio,))
            
            freguesias = cur.fetchall()
            
            if not freguesias:
                return JSONResponse(status_code=404, content={"detail": "Nenhuma freguesia encontrada para o município"})
            
            return JSONResponse(content=freguesias)

    except Exception as e:
        traceback.print_exc()  # Exibe o erro no log
        return JSONResponse(status_code=500, content={"detail": str(e)})

# ------------------------------
# 4. Converter coordenadas (lat, lon) para freguesia
# ------------------------------
@router.get("/converter-freguesia")
def converter_freguesia(lat: float, lon: float):
    try:
        # Estabelece a conexão com o banco de dados
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            
            # Consulta para obter a freguesia pela coordenada (lat, lon)
            cur.execute("""
                SELECT con_name
                FROM area_freguesias
                WHERE ST_Contains(
                    geom,
                    ST_SetSRID(ST_Point(%s, %s), 4326)
                )
                LIMIT 1;
            """, (lon, lat))
            
            freguesia = cur.fetchone()

            if not freguesia:
                return JSONResponse(status_code=404, content={"detail": "Freguesia não encontrada"})

            nome_freguesia = freguesia["con_name"]

            return {"freguesia": nome_freguesia}

    except Exception as e:
        traceback.print_exc()  # Aparece no terminal/log
        return JSONResponse(status_code=500, content={"detail": str(e)})

# ------------------------------
# 5. Obter dados estatísticos da região com base na freguesia
# ------------------------------
@router.get("/regionStats")
def region_stats(freguesia: str):
    try:
        # Estabelece a conexão com o banco de dados
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            
            # Consulta para obter dados sobre o município relacionado à freguesia
            cur.execute("""
                SELECT municipio
                FROM cont_freguesias
                WHERE freguesia = %s;
            """, (freguesia,))

            municipio_nome = cur.fetchone()

            if not municipio_nome:
                return JSONResponse(status_code=404, content={"detail": "Município não encontrado"})

            # Acessar o valor do município
            nome_municipio = municipio_nome["municipio"]

            # Agora, obtemos os indicadores relacionados ao município
            cur.execute("""
                SELECT c.descr_concelho, 
                       i.*,
                       te.numero_total,
                       te.numero_nao_transicao,
                       ROUND(te.taxa_nao_transicao, 2) AS taxa_nao_transicao,
                       te.numero_transicao,
                       ROUND(te.taxa_transicao, 2) AS taxa_transicao,
                       ie.* 
                FROM indicadoresconcelho i
                JOIN concelho c ON i.concelho_id = c.id_concelho
                LEFT JOIN transicoes_ensino te ON te.concelho_id = i.concelho_id
                LEFT JOIN indicadoresempresas ie ON ie.concelho_id = i.concelho_id
                WHERE c.descr_concelho = %s;
            """, (nome_municipio,))

            indicadores = cur.fetchone()

            if not indicadores:
                return JSONResponse(status_code=404, content={"detail": "Indicadores não encontrados para o município"})

            # Combina a geometria do município com os dados da freguesia e indicadores
            response_data = {
                "freguesia": freguesia,
                "municipio": nome_municipio,
                "indicadores": indicadores
            }

            return response_data

    except Exception as e:
        traceback.print_exc()  # Aparece no terminal/log
        return JSONResponse(status_code=500, content={"detail": str(e)})

# ------------------------------
# 6. Obter Taxas Populacionais
# ------------------------------
@router.get("/populationRates")
def obter_taxas_populacionais(freguesia: str):
    try:
        # Estabelece a conexão com o banco de dados
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Consulta para obter as taxas populacionais (analfabetismo, atividade, desemprego)
            cur.execute("""
            SELECT
                ta.ano AS ano,
                ta.dim_3_t AS dim_3,
                ta.valor AS taxa_analfabetismo,
                ta_atividade.valor AS taxa_atividade,
                td.valor AS taxa_desemprego
            FROM
                public.taxa_de_analfabetismo ta
            JOIN
                public.taxa_de_atividade ta_atividade
                ON ta.ano = ta_atividade.ano
                AND ta.dim_3_t = ta_atividade.dim_3_t
            JOIN
                public.taxa_de_desemprego td
                ON ta.ano = td.ano
                AND ta.dim_3_t = td.dim_3_t
            WHERE
                ta.localizacao = %s
                AND ta_atividade.localizacao = %s
                AND td.localizacao = %s
            ORDER BY
                ta.ano,
                CASE
                    WHEN ta.dim_3_t = 'H' THEN 1
                    WHEN ta.dim_3_t = 'M' THEN 2
                    WHEN ta.dim_3_t = 'HM' THEN 3
                    ELSE 4
                END;
            """, (freguesia, freguesia, freguesia))

            # Obtém os resultados
            taxas_populacionais = cur.fetchall()

            if not taxas_populacionais:
                return JSONResponse(status_code=404, content={"detail": f"Nenhuma taxa populacional encontrada para a localização {freguesia}"})

            return JSONResponse(content=taxas_populacionais)

    except Exception as e:
        traceback.print_exc()  # Aparece no terminal/log
        return JSONResponse(status_code=500, content={"detail": str(e)})

