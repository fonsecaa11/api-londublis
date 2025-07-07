from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.pois_service import get_pois_around
from app.models.schemas import POIOut
from app.services.escolas_service import get_escola_by_id, get_estatisticas_by_escola
from app.services.disciplinas_service import get_disciplinas_by_ciclo
from app.services.colocacoes_service import get_universidade_colocacoes_cursos
from fastapi import Path
from app.db import get_connection


router = APIRouter(prefix="/api")

# Define o modelo para receber coordenadas no body  
class Coordenadas(BaseModel):
    lat: float
    lon: float

@router.post("/pois", response_model=list[POIOut])
async def obter_pois(coord: Coordenadas):
    print(f"📩 Coordenadas recebidas: lat={coord.lat}, lon={coord.lon}")
    pois = get_pois_around(coord.lat, coord.lon)
    if not pois:
        raise HTTPException(404, "Nenhum POI encontrado.")
    return pois  

@router.get("/escolas/{id}")
async def detalhes_escola(id: str):
    try:
        escola = get_escola_by_id(id)
        if not escola:
            raise HTTPException(404, "Escola não encontrada")

        estatisticas = get_estatisticas_by_escola(id)
        escola["estatisticas"] = estatisticas
        return escola
    except Exception as e:
        raise HTTPException(500, f"Erro ao obter escola: {e}")
    
@router.get("/escolas/{escola_id}/disciplinas/{ciclo_id}")
async def disciplinas_por_escola_e_ciclo(escola_id: str, ciclo_id: str):
    try:
        disciplinas = get_disciplinas_by_ciclo(escola_id, ciclo_id)
        if not disciplinas:
            raise HTTPException(404, "Nenhuma disciplina encontrada para esse ciclo na escola.")
        return disciplinas
    except Exception as e:
        raise HTTPException(500, f"Erro ao obter disciplinas: {e}")

@router.get("/universidade/{poi_id}/{ciclo_id}")
async def universidade_cursos_colocacoes(poi_id: str, ciclo_id: str):
    try:
        cursos = get_universidade_colocacoes_cursos(poi_id, ciclo_id)
        if not cursos:
            raise HTTPException(404, "Nenhum curso encontrado para essa universidade e ciclo.")
        return cursos
    except Exception as e:
        raise HTTPException(500, f"Erro ao obter dados da universidade: {e}")
    
@router.get("/escolas/{poi_id}/disciplinas")
async def obter_disciplinas_escola(poi_id: str):

    print(f"🔍 Recebido poi_id: {poi_id}")  # Agora isto vai aparecer
    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT disciplina, nota_media, ranking_nacional, ranking_distrital
            FROM escola_disciplinas
            WHERE poi_id = %s
        """, (poi_id,))

        rows = cur.fetchall()
        print(f"📊 Resultado da query: {rows}")

        disciplinas = [
            {
                "disciplina": row[0],
                "nota_media": row[1],
                "ranking_nacional": row[2],
                "ranking_distrital": row[3]
            }
            for row in rows
        ]

        return {"disciplinas": disciplinas}

    except Exception as e:
        print("❌ Erro ao obter disciplinas:", e)
        raise HTTPException(status_code=500, detail="Erro ao obter disciplinas")

    finally:
        if cur: cur.close()
        if conn: conn.close()

@router.get("/universidade/{poi_id}")
async def obter_cursos_universidade(poi_id: str):
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT DISTINCT ON (fc.codcurso)
                fc.codcurso,
                fc.nome_curso,
                fc.nivel_formacao,
                fc.natureza_institucional,
                fc.vagas_iniciais,
                COALESCE(c.colocados, fc.colocados) AS colocados,
                COALESCE(c.nota_ultimo_colocado, fc.nota_ultimo_colocado) AS nota_ultimo_colocado,
                c.ano_colocacao
            FROM faculdade_cursos fc
            LEFT JOIN colocacoes c
            ON c.poi_id = fc.poi_id
            AND c.ciclo_escolar_id = fc.ciclo_escolar_id
            AND c.codcurso = fc.codcurso
            WHERE fc.poi_id = %s
            ORDER BY fc.codcurso, c.ano_colocacao DESC;
        """, (poi_id,))
        rows = cur.fetchall()

        cursos = []
        for row in rows:
            cursos.append({
                "codcurso": row[0],
                "nome_curso": row[1],
                "nivel_formacao": row[2],
                "natureza_institucional": row[3],
                "vagas_iniciais": row[4],
                "colocados": row[5],
                "nota_ultimo_colocado": row[6],
                "ano_colocacao": row[7]
            })

        return cursos

    except Exception as e:
        print(f"❌ Erro ao obter cursos da universidade: {e}")
        raise HTTPException(status_code=500, detail="Erro ao obter cursos")

    finally:
        if cur: cur.close()
        if conn: conn.close()


