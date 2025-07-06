from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.gerar_relatorio import gerar_relatorio

router = APIRouter(prefix="/api")

@router.get("/gerar_relatorio")
async def gerar_pdf(coordenada: str = None, morada: str = None, codigo_postal: str = None):
    if not coordenada and not morada and not codigo_postal:
        return {"erro": "É necessário fornecer coordenada, morada ou código postal"}

    # Caso seja coordenada, converta para um formato adequado (latitude, longitude)
    if coordenada:
        coordenada_split = coordenada.split(",")
        coordenada_lat = coordenada_split[0]
        coordenada_lon = coordenada_split[1]
    else:
        coordenada_lat = None
        coordenada_lon = None

    # Gerar o relatório
    arquivo_pdf = gerar_relatorio(coordenada_lat, coordenada_lon, morada, codigo_postal)

    if not arquivo_pdf:
        return {"erro": "Falha ao gerar o relatório"}

    # Retornar o PDF gerado
    return FileResponse(arquivo_pdf, media_type="application/pdf", filename=arquivo_pdf)
