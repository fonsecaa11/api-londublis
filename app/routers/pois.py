from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.pois_service import get_pois_around
from app.models.schemas import POIOut
from app.services.escolas_service import get_escola_by_id, get_estatisticas_by_escola
from app.services.disciplinas_service import get_disciplinas_by_ciclo
from app.services.colocacoes_service import get_universidade_colocacoes_cursos

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

