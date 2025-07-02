from pydantic import BaseModel

class Coordenadas(BaseModel):
    lat: float
    lon: float

class ResultadoFreguesia(BaseModel):
    freguesia: str

class POIOut(BaseModel):
    id_poi: str
    descr_poi: str
    descr_entidade: str
    descr_subcategoria: str
    descr_categoria: str
    lat: float
    lon: float
    tipo: str